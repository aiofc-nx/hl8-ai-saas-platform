import { BaseCommand } from "@hl8/application-kernel";
import { UserId } from "../../domain/value-objects/user-id.vo.js";
import { RoleId } from "../../domain/value-objects/role-id.vo.js";
import { IsolationContext } from "../../domain/value-objects/isolation-context.vo.js";
import { CaslCondition } from "../../domain/value-objects/casl-condition.vo.js";

/**
 * 权限分配命令
 *
 * @description 用于分配权限给用户的命令对象
 * @since 1.0.0
 */
export class AssignPermissionCommand extends BaseCommand {
  /**
   * 创建权限分配命令
   *
   * @param userId - 用户ID
   * @param roleId - 角色ID（可选）
   * @param subject - 权限主体
   * @param action - 操作类型
   * @param context - 隔离上下文
   * @param conditions - 权限条件（可选）
   * @param assignedBy - 分配者ID
   */
  constructor(
    public readonly userId: UserId,
    public readonly roleId: RoleId | undefined,
    public readonly subject: string,
    public readonly action: string,
    public readonly context: IsolationContext,
    public readonly conditions: CaslCondition[] = [],
    public readonly assignedBy?: string,
  ) {
    super();
  }

  /**
   * 获取命令类型
   *
   * @returns 命令类型
   */
  getCommandType(): string {
    return "AssignPermission";
  }

  /**
   * 获取命令数据
   *
   * @returns 命令数据
   */
  getCommandData(): Record<string, unknown> {
    return {
      userId: this.userId.getValue(),
      roleId: this.roleId?.getValue(),
      subject: this.subject,
      action: this.action,
      context: this.context.getValue(),
      conditions: this.conditions.map((condition) => condition.getValue()),
      assignedBy: this.assignedBy,
    };
  }

  /**
   * 验证命令
   *
   * @throws {Error} 当命令无效时抛出错误
   */
  validate(): void {
    if (!this.userId) {
      throw new Error("用户ID不能为空");
    }

    if (!this.subject) {
      throw new Error("权限主体不能为空");
    }

    if (!this.action) {
      throw new Error("操作类型不能为空");
    }

    if (!this.context) {
      throw new Error("隔离上下文不能为空");
    }

    if (!this.assignedBy) {
      throw new Error("分配者ID不能为空");
    }
  }
}
