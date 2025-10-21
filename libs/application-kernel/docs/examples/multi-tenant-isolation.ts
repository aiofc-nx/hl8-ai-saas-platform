/**
 * 多租户隔离示例
 *
 * 演示如何使用应用内核实现多租户隔离
 * 展示不同隔离级别的上下文管理
 *
 * @since 1.0.0
 */
import {
  BaseCommand,
  BaseQuery,
  BaseCommandUseCase,
} from "@hl8/application-kernel";
import {
  IsolationContext,
  TenantId,
  OrganizationId,
  DepartmentId,
  UserId,
} from "@hl8/domain-kernel";
import {
  IUseCaseContext,
  ContextUtils,
  ContextValidationHelpers,
} from "@hl8/application-kernel";

// 平台级操作示例
export class PlatformMaintenanceCommand extends BaseCommand {
  constructor(
    public readonly operation: string,
    public readonly target: string,
  ) {
    super(
      "PlatformMaintenanceCommand",
      "平台维护命令",
      IsolationContext.platform(),
    );
  }
}

// 租户级操作示例
export class TenantSetupCommand extends BaseCommand {
  constructor(
    public readonly tenantName: string,
    public readonly adminEmail: string,
    isolationContext?: IsolationContext,
  ) {
    super(
      "TenantSetupCommand",
      "租户设置命令",
      isolationContext ||
        IsolationContext.tenant(TenantId.create("new-tenant")),
    );
  }
}

// 组织级操作示例
export class OrganizationManagementCommand extends BaseCommand {
  constructor(
    public readonly organizationName: string,
    public readonly description: string,
    isolationContext?: IsolationContext,
  ) {
    super("OrganizationManagementCommand", "组织管理命令", isolationContext);
  }
}

// 部门级操作示例
export class DepartmentManagementCommand extends BaseCommand {
  constructor(
    public readonly departmentName: string,
    public readonly organizationId: OrganizationId,
    isolationContext?: IsolationContext,
  ) {
    super("DepartmentManagementCommand", "部门管理命令", isolationContext);
  }
}

// 用户级操作示例
export class UserProfileCommand extends BaseCommand {
  constructor(
    public readonly userId: UserId,
    public readonly profileData: Record<string, any>,
    isolationContext?: IsolationContext,
  ) {
    super("UserProfileCommand", "用户档案命令", isolationContext);
  }
}

// 多租户用例示例
export class MultiTenantUseCase extends BaseCommandUseCase<any, any> {
  constructor() {
    super("MultiTenantUseCase", "多租户用例", "1.0.0", ["multi-tenant:access"]);
  }

  protected async executeCommand(
    request: any,
    context: IUseCaseContext,
  ): Promise<any> {
    // 验证租户上下文
    const tenantValidation =
      ContextValidationHelpers.validateTenantContext(context);
    if (!tenantValidation.isValid) {
      throw new Error(
        `租户上下文验证失败: ${tenantValidation.errors.join(", ")}`,
      );
    }

    // 验证用户上下文
    const userValidation =
      ContextValidationHelpers.validateUserContext(context);
    if (!userValidation.isValid) {
      throw new Error(
        `用户上下文验证失败: ${userValidation.errors.join(", ")}`,
      );
    }

    // 执行多租户业务逻辑
    return {
      success: true,
      tenantId: context.tenant?.id,
      userId: context.user?.id,
      isolationLevel: request.isolationContext?.getIsolationLevel(),
    };
  }
}

// 多租户隔离演示
export async function demonstrateMultiTenantIsolation() {
  console.log("=== 多租户隔离演示 ===\n");

  // 1. 平台级操作
  console.log("1. 平台级操作:");
  const platformCommand = new PlatformMaintenanceCommand("系统升级", "数据库");
  console.log(
    `隔离级别: ${platformCommand.isolationContext?.getIsolationLevel()}`,
  );
  console.log(
    `缓存键: ${platformCommand.isolationContext?.buildCacheKey("maintenance", "upgrade")}`,
  );
  console.log(
    `日志上下文:`,
    platformCommand.isolationContext?.buildLogContext(),
  );
  console.log();

  // 2. 租户级操作
  console.log("2. 租户级操作:");
  const tenantContext = IsolationContext.tenant(TenantId.create("tenant-123"));
  const tenantCommand = new TenantSetupCommand(
    "企业租户",
    "admin@enterprise.com",
    tenantContext,
  );
  console.log(
    `隔离级别: ${tenantCommand.isolationContext?.getIsolationLevel()}`,
  );
  console.log(
    `缓存键: ${tenantCommand.isolationContext?.buildCacheKey("tenant", "setup")}`,
  );
  console.log(
    `WHERE子句:`,
    tenantCommand.isolationContext?.buildWhereClause("t"),
  );
  console.log();

  // 3. 组织级操作
  console.log("3. 组织级操作:");
  const orgContext = IsolationContext.organization(
    TenantId.create("tenant-123"),
    OrganizationId.create("org-456"),
  );
  const orgCommand = new OrganizationManagementCommand(
    "技术部门",
    "负责技术开发",
    orgContext,
  );
  console.log(`隔离级别: ${orgCommand.isolationContext?.getIsolationLevel()}`);
  console.log(
    `缓存键: ${orgCommand.isolationContext?.buildCacheKey("org", "management")}`,
  );
  console.log(`WHERE子句:`, orgCommand.isolationContext?.buildWhereClause("o"));
  console.log();

  // 4. 部门级操作
  console.log("4. 部门级操作:");
  const deptContext = IsolationContext.department(
    TenantId.create("tenant-123"),
    OrganizationId.create("org-456"),
    DepartmentId.create("dept-789"),
  );
  const deptCommand = new DepartmentManagementCommand(
    "开发团队",
    OrganizationId.create("org-456"),
    deptContext,
  );
  console.log(`隔离级别: ${deptCommand.isolationContext?.getIsolationLevel()}`);
  console.log(
    `缓存键: ${deptCommand.isolationContext?.buildCacheKey("dept", "management")}`,
  );
  console.log(
    `WHERE子句:`,
    deptCommand.isolationContext?.buildWhereClause("d"),
  );
  console.log();

  // 5. 用户级操作
  console.log("5. 用户级操作:");
  const userContext = IsolationContext.user(
    UserId.create("user-123"),
    TenantId.create("tenant-123"),
  );
  const userCommand = new UserProfileCommand(
    UserId.create("user-123"),
    { name: "John Doe", email: "john@example.com" },
    userContext,
  );
  console.log(`隔离级别: ${userCommand.isolationContext?.getIsolationLevel()}`);
  console.log(
    `缓存键: ${userCommand.isolationContext?.buildCacheKey("user", "profile")}`,
  );
  console.log(
    `WHERE子句:`,
    userCommand.isolationContext?.buildWhereClause("u"),
  );
  console.log();

  // 6. 上下文管理
  console.log("6. 上下文管理:");
  const useCaseContext = ContextUtils.createUseCaseContext(
    { id: "tenant-123", name: "企业租户" },
    { id: "user-456", username: "admin" },
    "req-789",
  );
  console.log("用例上下文:", useCaseContext);

  // 验证上下文
  const validation = ContextValidationHelpers.validateContextCompletely(
    useCaseContext,
    userContext,
    {
      requiredTenantId: "tenant-123",
      requiredUserId: "user-456",
      maxAgeMs: 300000,
    },
  );
  console.log("上下文验证结果:", validation);
  console.log();

  // 7. 访问权限检查
  console.log("7. 访问权限检查:");
  const canAccess = userContext.canAccess(tenantContext, "ORGANIZATION" as any);
  console.log(`用户上下文是否可以访问租户上下文: ${canAccess}`);

  const canAccessOrg = userContext.canAccess(orgContext, "ORGANIZATION" as any);
  console.log(`用户上下文是否可以访问组织上下文: ${canAccessOrg}`);

  const canAccessDept = userContext.canAccess(deptContext, "DEPARTMENT" as any);
  console.log(`用户上下文是否可以访问部门上下文: ${canAccessDept}`);
  console.log();

  // 8. 多租户用例执行
  console.log("8. 多租户用例执行:");
  const multiTenantUseCase = new MultiTenantUseCase();
  try {
    const result = await multiTenantUseCase.execute(
      { isolationContext: userContext },
      useCaseContext,
    );
    console.log("用例执行结果:", result);
  } catch (error) {
    console.error("用例执行失败:", error);
  }
}

// 隔离级别比较示例
export function demonstrateIsolationLevels() {
  console.log("=== 隔离级别比较 ===\n");

  const levels = [
    { name: "平台级", context: IsolationContext.platform() },
    {
      name: "租户级",
      context: IsolationContext.tenant(TenantId.create("tenant-123")),
    },
    {
      name: "组织级",
      context: IsolationContext.organization(
        TenantId.create("tenant-123"),
        OrganizationId.create("org-456"),
      ),
    },
    {
      name: "部门级",
      context: IsolationContext.department(
        TenantId.create("tenant-123"),
        OrganizationId.create("org-456"),
        DepartmentId.create("dept-789"),
      ),
    },
    {
      name: "用户级",
      context: IsolationContext.user(
        UserId.create("user-123"),
        TenantId.create("tenant-123"),
      ),
    },
  ];

  levels.forEach((level) => {
    console.log(`${level.name}:`);
    console.log(`  隔离级别: ${level.context.getIsolationLevel()}`);
    console.log(`  缓存键: ${level.context.buildCacheKey("test", "key")}`);
    console.log(`  日志上下文:`, level.context.buildLogContext());
    console.log(`  WHERE子句:`, level.context.buildWhereClause("t"));
    console.log();
  });
}

// 运行演示
if (require.main === module) {
  demonstrateMultiTenantIsolation()
    .then(() => demonstrateIsolationLevels())
    .catch(console.error);
}
