import { UseCase } from "@hl8/application-kernel";
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
export class TenantCreationUseCase
  implements UseCase<CreateTenantCommand, TenantAggregate>
{
  constructor(private readonly tenantRepository: TenantRepositoryImpl) {}

  /**
   * 执行租户创建用例
   *
   * @param command - 创建租户命令
   * @returns 租户聚合根
   * @throws {Error} 当用例执行失败时抛出错误
   */
  async execute(command: CreateTenantCommand): Promise<TenantAggregate> {
    try {
      // 验证命令
      command.validate();

      // 创建隔离上下文
      const platformId = new PlatformId("platform_001"); // TODO: 从配置或参数获取
      const context = IsolationContext.createPlatformLevel(platformId);

      // 检查租户代码是否已存在
      // TODO: 实现租户代码唯一性检查

      // 创建租户聚合根
      const tenantAggregate = new TenantAggregate(
        command.code,
        command.name,
        command.type,
        command.description,
        command.createdBy,
      );

      // 应用租户创建事件
      tenantAggregate.createTenant(command.createdBy || "system");

      // 保存到仓储
      await this.tenantRepository.save(tenantAggregate, context);

      return tenantAggregate;
    } catch (error) {
      throw new Error(
        `租户创建失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 获取用例类型
   *
   * @returns 用例类型
   */
  getUseCaseType(): string {
    return "TenantCreationUseCase";
  }
}
