/**
 * 事务管理示例
 *
 * 演示如何使用应用内核实现事务管理
 * 展示事务边界、回滚处理和隔离级别控制
 *
 * @since 1.0.0
 */
import { BaseCommand, BaseCommandUseCase } from "@hl8/application-kernel";
import {
  EntityId,
  IsolationContext,
  TenantId,
  UserId,
} from "@hl8/domain-kernel";
import { ITransactionManager, IUseCaseContext } from "@hl8/application-kernel";
import {
  TransactionManagerUtils,
  TransactionBoundaryValidator,
  TransactionRollbackUtils,
  TransactionIsolationUtils,
} from "@hl8/application-kernel";

// 创建用户命令
export class CreateUserCommand extends BaseCommand {
  constructor(
    public readonly username: string,
    public readonly email: string,
    public readonly displayName: string,
    isolationContext?: IsolationContext,
  ) {
    super("CreateUserCommand", "创建用户命令", isolationContext);
  }
}

// 更新用户命令
export class UpdateUserCommand extends BaseCommand {
  constructor(
    public readonly userId: EntityId,
    public readonly changes: Record<string, any>,
    isolationContext?: IsolationContext,
  ) {
    super("UpdateUserCommand", "更新用户命令", isolationContext);
  }
}

// 删除用户命令
export class DeleteUserCommand extends BaseCommand {
  constructor(
    public readonly userId: EntityId,
    public readonly reason?: string,
    isolationContext?: IsolationContext,
  ) {
    super("DeleteUserCommand", "删除用户命令", isolationContext);
  }
}

// 模拟事务管理器实现
export class MockTransactionManager implements ITransactionManager {
  private active = false;
  private readOnly = false;
  private isolationLevel: string = "READ_COMMITTED";

  async begin(): Promise<void> {
    if (this.active) {
      throw new Error("事务已开始");
    }
    this.active = true;
    console.log("事务开始");
  }

  async commit(): Promise<void> {
    if (!this.active) {
      throw new Error("没有活跃事务");
    }
    this.active = false;
    console.log("事务提交");
  }

  async rollback(): Promise<void> {
    if (!this.active) {
      throw new Error("没有活跃事务");
    }
    this.active = false;
    console.log("事务回滚");
  }

  isActive(): boolean {
    return this.active;
  }

  // 扩展方法
  async setIsolationLevel(level: string): Promise<void> {
    this.isolationLevel = level;
    console.log(`设置隔离级别: ${level}`);
  }

  async setReadOnly(readOnly: boolean): Promise<void> {
    this.readOnly = readOnly;
    console.log(`设置只读模式: ${readOnly}`);
  }

  async setTimeout(timeout: number): Promise<void> {
    console.log(`设置事务超时: ${timeout}ms`);
  }
}

// 用户用例
export class UserUseCase extends BaseCommandUseCase<
  CreateUserCommand,
  EntityId
> {
  constructor(private readonly transactionManager: ITransactionManager) {
    super(
      "UserUseCase",
      "用户用例",
      "1.0.0",
      ["user:manage"],
      undefined,
      transactionManager,
    );
  }

  protected async executeCommand(
    request: CreateUserCommand,
    context: IUseCaseContext,
  ): Promise<EntityId> {
    // 验证事务边界
    const boundaryValidation =
      TransactionBoundaryValidator.validateTransactionBoundary(
        this.transactionManager,
        "CreateUser",
      );

    if (!boundaryValidation.isValid) {
      throw new Error(
        `事务边界验证失败: ${boundaryValidation.errors.join(", ")}`,
      );
    }

    // 设置隔离级别
    await TransactionIsolationUtils.setIsolationLevel(this.transactionManager, {
      level: "READ_COMMITTED",
      readOnly: false,
      timeout: 30000,
      deadlockDetection: true,
      lockWaitTimeout: 5000,
    });

    const userId = EntityId.create();
    console.log(`创建用户: ${request.username} (${request.email})`);

    // 模拟数据库操作
    await this.simulateDatabaseOperation("INSERT", userId, request);

    return userId;
  }

  private async simulateDatabaseOperation(
    operation: string,
    userId: EntityId,
    data: any,
  ): Promise<void> {
    console.log(`执行数据库操作: ${operation} - ${userId.getValue()}`);
    // 模拟操作延迟
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

// 事务管理演示
export async function demonstrateTransactionManagement() {
  console.log("=== 事务管理演示 ===\n");

  const transactionManager = new MockTransactionManager();

  try {
    // 1. 基本事务操作
    console.log("1. 基本事务操作:");
    const result = await TransactionManagerUtils.executeInTransaction(
      transactionManager,
      async () => {
        console.log("执行业务逻辑");
        return { success: true, data: "test" };
      },
      {
        timeout: 30000,
        retryCount: 2,
        retryDelay: 1000,
        autoCommit: true,
      },
    );

    console.log(`事务执行结果: ${result.success ? "成功" : "失败"}`);
    if (result.error) {
      console.log("错误:", result.error.message);
    }
    console.log(`执行耗时: ${result.duration}ms`);
    console.log();

    // 2. 只读事务操作
    console.log("2. 只读事务操作:");
    const readOnlyResult =
      await TransactionManagerUtils.executeInReadOnlyTransaction(
        transactionManager,
        async () => {
          console.log("执行只读查询");
          return { data: "read-only-data" };
        },
        {
          timeout: 15000,
          retryCount: 1,
        },
      );

    console.log(`只读事务结果: ${readOnlyResult.success ? "成功" : "失败"}`);
    console.log(`执行耗时: ${readOnlyResult.duration}ms`);
    console.log();

    // 3. 嵌套事务操作
    console.log("3. 嵌套事务操作:");
    const nestedResult =
      await TransactionManagerUtils.executeInNestedTransaction(
        transactionManager,
        async () => {
          console.log("执行嵌套事务逻辑");
          return { nested: true };
        },
        {
          timeout: 20000,
          retryCount: 1,
        },
      );

    console.log(`嵌套事务结果: ${nestedResult.success ? "成功" : "失败"}`);
    console.log(`执行耗时: ${nestedResult.duration}ms`);
    console.log();

    // 4. 批量事务操作
    console.log("4. 批量事务操作:");
    const batchOperations = [
      async () => {
        console.log("批量操作 1");
        return { id: 1, data: "batch1" };
      },
      async () => {
        console.log("批量操作 2");
        return { id: 2, data: "batch2" };
      },
      async () => {
        console.log("批量操作 3");
        return { id: 3, data: "batch3" };
      },
    ];

    const batchResult = await TransactionManagerUtils.executeBatchInTransaction(
      transactionManager,
      batchOperations,
      {
        timeout: 45000,
        retryCount: 1,
      },
    );

    console.log(`批量事务结果: ${batchResult.success ? "成功" : "失败"}`);
    console.log(`执行耗时: ${batchResult.duration}ms`);
    console.log();
  } catch (error) {
    console.error("事务管理演示失败:", error);
  }
}

// 事务回滚演示
export async function demonstrateTransactionRollback() {
  console.log("=== 事务回滚演示 ===\n");

  const transactionManager = new MockTransactionManager();

  try {
    // 1. 立即回滚
    console.log("1. 立即回滚:");
    const immediateRollback = await TransactionRollbackUtils.executeRollback(
      transactionManager,
      {
        strategy: "immediate",
      },
    );

    console.log(`立即回滚结果: ${immediateRollback.success ? "成功" : "失败"}`);
    console.log(`执行耗时: ${immediateRollback.duration}ms`);
    console.log();

    // 2. 延迟回滚
    console.log("2. 延迟回滚:");
    await transactionManager.begin();

    const delayedRollback = await TransactionRollbackUtils.executeRollback(
      transactionManager,
      {
        strategy: "delayed",
        delay: 1000,
      },
    );

    console.log(`延迟回滚结果: ${delayedRollback.success ? "成功" : "失败"}`);
    console.log(`执行耗时: ${delayedRollback.duration}ms`);
    console.log();

    // 3. 补偿回滚
    console.log("3. 补偿回滚:");
    await transactionManager.begin();

    const compensatingRollback = await TransactionRollbackUtils.executeRollback(
      transactionManager,
      {
        strategy: "compensating",
        compensation: async () => {
          console.log("执行补偿操作");
        },
      },
    );

    console.log(
      `补偿回滚结果: ${compensatingRollback.success ? "成功" : "失败"}`,
    );
    console.log(
      `补偿操作执行: ${compensatingRollback.compensationExecuted ? "是" : "否"}`,
    );
    console.log(`执行耗时: ${compensatingRollback.duration}ms`);
    console.log();

    // 4. 重试回滚
    console.log("4. 重试回滚:");
    await transactionManager.begin();

    const retryRollback = await TransactionRollbackUtils.executeRollback(
      transactionManager,
      {
        strategy: "retry",
        retryCount: 3,
        retryDelay: 500,
      },
    );

    console.log(`重试回滚结果: ${retryRollback.success ? "成功" : "失败"}`);
    console.log(`重试次数: ${retryRollback.retryCount}`);
    console.log(`执行耗时: ${retryRollback.duration}ms`);
    console.log();
  } catch (error) {
    console.error("事务回滚演示失败:", error);
  }
}

// 事务隔离演示
export async function demonstrateTransactionIsolation() {
  console.log("=== 事务隔离演示 ===\n");

  const transactionManager = new MockTransactionManager();

  try {
    // 1. 设置不同隔离级别
    const isolationLevels = [
      "READ_UNCOMMITTED",
      "READ_COMMITTED",
      "REPEATABLE_READ",
      "SERIALIZABLE",
    ] as const;

    for (const level of isolationLevels) {
      console.log(`设置隔离级别: ${level}`);

      await transactionManager.begin();

      const isolationResult = await TransactionIsolationUtils.setIsolationLevel(
        transactionManager,
        {
          level,
          readOnly: false,
          timeout: 30000,
          deadlockDetection: true,
          lockWaitTimeout: 5000,
        },
      );

      console.log(
        `隔离级别设置结果: ${isolationResult.success ? "成功" : "失败"}`,
      );
      console.log(`执行耗时: ${isolationResult.duration}ms`);

      await transactionManager.commit();
      console.log();
    }

    // 2. 隔离级别信息
    console.log("2. 隔离级别信息:");
    for (const level of isolationLevels) {
      const info = TransactionIsolationUtils.getIsolationLevelInfo(level);
      console.log(`${level}:`);
      console.log(`  名称: ${info.name}`);
      console.log(`  描述: ${info.description}`);
      console.log(`  特性: ${info.characteristics.join(", ")}`);
      console.log(`  使用场景: ${info.useCases.join(", ")}`);
      console.log();
    }

    // 3. 隔离级别比较
    console.log("3. 隔离级别比较:");
    const comparison = TransactionIsolationUtils.compareIsolationLevels(
      "REPEATABLE_READ",
      "READ_COMMITTED",
    );
    console.log("REPEATABLE_READ vs READ_COMMITTED:");
    console.log(`  更高: ${comparison.isHigher}`);
    console.log(`  更低: ${comparison.isLower}`);
    console.log(`  相同: ${comparison.isEqual}`);
    console.log(`  差异: ${comparison.difference}`);
    console.log();

    // 4. 推荐隔离级别
    console.log("4. 推荐隔离级别:");
    const scenarios = [
      "read-heavy",
      "write-heavy",
      "mixed",
      "critical",
    ] as const;

    for (const scenario of scenarios) {
      const recommended =
        TransactionIsolationUtils.getRecommendedIsolationLevel(scenario);
      console.log(`${scenario}: ${recommended}`);
    }
    console.log();
  } catch (error) {
    console.error("事务隔离演示失败:", error);
  }
}

// 事务边界验证演示
export function demonstrateTransactionBoundaryValidation() {
  console.log("=== 事务边界验证演示 ===\n");

  const transactionManager = new MockTransactionManager();

  // 1. 验证事务边界
  console.log("1. 验证事务边界:");
  const boundaryValidation =
    TransactionBoundaryValidator.validateTransactionBoundary(
      transactionManager,
      "TestOperation",
    );

  console.log(`边界验证结果: ${boundaryValidation.isValid ? "有效" : "无效"}`);
  if (boundaryValidation.errors.length > 0) {
    console.log("错误:", boundaryValidation.errors);
  }
  if (boundaryValidation.warnings.length > 0) {
    console.log("警告:", boundaryValidation.warnings);
  }
  console.log();

  // 2. 验证事务开始
  console.log("2. 验证事务开始:");
  const beginValidation =
    TransactionBoundaryValidator.validateTransactionBegin(transactionManager);
  console.log(`开始验证结果: ${beginValidation.isValid ? "有效" : "无效"}`);
  console.log();

  // 3. 验证事务提交
  console.log("3. 验证事务提交:");
  const commitValidation =
    TransactionBoundaryValidator.validateTransactionCommit(transactionManager);
  console.log(`提交验证结果: ${commitValidation.isValid ? "有效" : "无效"}`);
  console.log();

  // 4. 验证事务完整性
  console.log("4. 验证事务完整性:");
  const operations = ["begin", "commit"];
  const integrityValidation =
    TransactionBoundaryValidator.validateTransactionIntegrity(
      transactionManager,
      operations,
    );

  console.log(
    `完整性验证结果: ${integrityValidation.isValid ? "有效" : "无效"}`,
  );
  if (integrityValidation.errors.length > 0) {
    console.log("错误:", integrityValidation.errors);
  }
  if (integrityValidation.warnings.length > 0) {
    console.log("警告:", integrityValidation.warnings);
  }
  console.log();
}

// 运行演示
if (require.main === module) {
  demonstrateTransactionManagement()
    .then(() => demonstrateTransactionRollback())
    .then(() => demonstrateTransactionIsolation())
    .then(() => demonstrateTransactionBoundaryValidation())
    .catch(console.error);
}
