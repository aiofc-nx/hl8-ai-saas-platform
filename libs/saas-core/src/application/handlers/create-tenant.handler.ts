import { CommandHandler } from "@hl8/application-kernel";
import { CreateTenantCommand } from "../commands/create-tenant.command.js";
import { TenantAggregate } from "../../domain/aggregates/tenant.aggregate.js";
import { Tenant } from "../../domain/entities/tenant.entity.js";
import { TenantId } from "../../domain/value-objects/tenant-id.vo.js";
import { TenantStatus } from "../../domain/value-objects/tenant-status.vo.js";
import { TenantStatusEnum } from "../../domain/value-objects/tenant-status.vo.js";
import { AuditInfo } from "@hl8/domain-kernel";

/**
 * 创建租户命令处理器
 *
 * @description 处理创建租户命令的业务逻辑
 * @since 1.0.0
 */
export class CreateTenantHandler
  implements CommandHandler<CreateTenantCommand, TenantAggregate>
{
  /**
   * 处理创建租户命令
   *
   * @param command - 创建租户命令
   * @returns 租户聚合根
   * @throws {Error} 当命令处理失败时抛出错误
   */
  async handle(command: CreateTenantCommand): Promise<TenantAggregate> {
    // 验证命令
    this.validateCommand(command);

    try {
      // 生成租户ID
      const tenantId = TenantId.create(
        `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      );

      // 创建租户实体
      const tenant = new Tenant(
        tenantId,
        command.code,
        command.name,
        command.type,
        new TenantStatus(TenantStatusEnum.TRIAL),
        {
          description: command.description || "",
          settings: {},
          resourceLimits: command.type.getResourceLimits(),
        },
        command.type.getResourceLimits(),
        new AuditInfo({
          createdBy: command.createdBy || "system",
          createdAt: new Date(),
          updatedBy: command.createdBy || "system",
          updatedAt: new Date(),
        }),
      );

      // 创建租户聚合根
      const tenantAggregate = new TenantAggregate(tenant);

      // 应用租户创建事件
      tenantAggregate.createTenant(command.createdBy || "system");

      return tenantAggregate;
    } catch (error) {
      throw new Error(
        `创建租户失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 验证命令
   *
   * @param command - 要验证的命令
   */
  validateCommand(command: CreateTenantCommand): void {
    if (!command.code) {
      throw new Error("租户代码不能为空");
    }
    if (!command.name) {
      throw new Error("租户名称不能为空");
    }
    if (!command.type) {
      throw new Error("租户类型不能为空");
    }
  }

  /**
   * 检查是否可以处理命令
   *
   * @param command - 要检查的命令
   * @returns 是否可以处理
   */
  canHandle(command: CreateTenantCommand): boolean {
    return command.commandName === "CreateTenantCommand";
  }

  /**
   * 获取处理器名称
   *
   * @returns 处理器名称
   */
  getHandlerName(): string {
    return "CreateTenantHandler";
  }

  /**
   * 获取处理器优先级
   *
   * @returns 处理器优先级
   */
  getPriority(): number {
    return 0;
  }
}
