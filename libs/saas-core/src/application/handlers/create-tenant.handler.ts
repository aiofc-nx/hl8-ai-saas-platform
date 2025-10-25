import { CommandHandler } from "@hl8/application-kernel";
import { CreateTenantCommand } from "../commands/create-tenant.command.js";
import { TenantAggregate } from "../../domain/aggregates/tenant.aggregate.js";

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
      // 使用静态工厂方法创建租户聚合根
      const tenantAggregate = TenantAggregate.create(
        command.code,
        command.name,
        command.type,
        command.tenantDescription,
      );

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
