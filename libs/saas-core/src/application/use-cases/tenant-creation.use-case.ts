import {
  BaseUseCase,
  IUseCaseContext,
  IEventBus,
  ITransactionManager,
} from "@hl8/application-kernel";
import { CreateTenantCommand } from "../commands/create-tenant.command.js";
import { TenantAggregate } from "../../domain/aggregates/tenant.aggregate.js";
import { TenantRepositoryImpl } from "../../infrastructure/repositories/tenant.repository.impl.js";
import { IsolationContext } from "../../domain/value-objects/isolation-context.vo.js";
import { PlatformId } from "../../domain/value-objects/platform-id.vo.js";
import { TenantId } from "../../domain/value-objects/tenant-id.vo.js";

/**
 * 租户创建用例
 *
 * @description 处理租户创建的业务用例
 * @since 1.0.0
 */
export class TenantCreationUseCase extends BaseUseCase<
  CreateTenantCommand,
  TenantAggregate
> {
  constructor(
    private readonly tenantRepository: TenantRepositoryImpl,
    private readonly eventBus?: IEventBus,
    private readonly transactionManager?: ITransactionManager,
  ) {
    super("TenantCreationUseCase", "处理租户创建的业务用例", "1.0.0", [
      "tenant:create",
    ]);
  }
  /**
   * 执行用例逻辑
   *
   * @param command - 创建租户命令
   * @param context - 用例执行上下文
   * @returns 租户聚合根
   * @throws {Error} 当用例执行失败时抛出错误
   */
  protected async executeUseCase(
    command: CreateTenantCommand,
    context: IUseCaseContext,
  ): Promise<TenantAggregate> {
    // 创建隔离上下文
    const platformId = new PlatformId("platform_001"); // TODO: 从配置或参数获取
    const tempTenantId = new TenantId("temp_tenant"); // TODO: 从配置或参数获取
    const isolationContext = IsolationContext.createTenantLevel(
      platformId,
      tempTenantId,
    );

    // 使用事务管理执行租户创建
    const executeInTransaction = async () => {
      // 检查租户代码是否已存在
      // TODO: 实现租户代码唯一性检查

      // 创建租户聚合根
      const tenantAggregate = TenantAggregate.create(
        command.code,
        command.name,
        command.type,
        command.tenantDescription,
      );

      // 保存到仓储
      await this.tenantRepository.save(tenantAggregate, isolationContext);

      return tenantAggregate;
    };

    // 根据是否有事务管理器决定是否使用事务
    const tenantAggregate = this.transactionManager
      ? await this.executeWithTransaction(executeInTransaction)
      : await executeInTransaction();

    // 发布领域事件
    await this.publishDomainEvents(tenantAggregate);

    return tenantAggregate;
  }

  /**
   * 在事务中执行操作
   *
   * @param operation - 要执行的操作
   * @returns 操作结果
   */
  private async executeWithTransaction<T>(
    operation: () => Promise<T>,
  ): Promise<T> {
    if (!this.transactionManager) {
      return await operation();
    }

    try {
      await this.transactionManager.begin();

      const result = await operation();

      await this.transactionManager.commit();

      return result;
    } catch (error) {
      if (this.transactionManager.isActive()) {
        await this.transactionManager.rollback();
      }
      throw error;
    }
  }

  /**
   * 发布领域事件
   *
   * @param aggregate - 聚合根
   */
  private async publishDomainEvents(aggregate: TenantAggregate): Promise<void> {
    if (!this.eventBus) {
      return;
    }

    const domainEvents = aggregate.pullEvents();
    if (domainEvents.length > 0) {
      await this.eventBus.publishAll(domainEvents);
    }
  }
}
