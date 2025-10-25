import { CommandHandler } from "@hl8/application-kernel";
import { AssignPermissionCommand } from "../commands/assign-permission.command.js";
import { CaslAbility } from "../../domain/entities/casl-ability.entity.js";

/**
 * 分配权限命令处理器
 *
 * @description 处理分配权限命令的业务逻辑
 * @since 1.0.0
 */
export class AssignPermissionHandler
  implements CommandHandler<AssignPermissionCommand, CaslAbility>
{
  /**
   * 处理分配权限命令
   *
   * @param command - 分配权限命令
   * @returns CASL权限能力实体
   * @throws {Error} 当命令处理失败时抛出错误
   */
  async handle(command: AssignPermissionCommand): Promise<CaslAbility> {
    this.validateCommand(command);

    try {
      // 这里应该实现权限分配的业务逻辑
      // 目前返回null，实际实现中需要注入相关依赖
      // TODO: 实现权限分配的业务逻辑
      throw new Error("分配权限功能尚未实现");
    } catch (error) {
      throw new Error(
        `分配权限失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  validateCommand(command: AssignPermissionCommand): void {
    if (!command.userId) {
      throw new Error("用户ID不能为空");
    }
    if (!command.subject) {
      throw new Error("权限主体不能为空");
    }
    if (!command.action) {
      throw new Error("操作类型不能为空");
    }
    if (!command.context) {
      throw new Error("隔离上下文不能为空");
    }
  }

  canHandle(command: AssignPermissionCommand): boolean {
    return command.commandName === "AssignPermissionCommand";
  }

  getHandlerName(): string {
    return "AssignPermissionHandler";
  }

  getPriority(): number {
    return 0;
  }
}
