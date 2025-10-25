import { BaseCommand } from "@hl8/application-kernel";
import { IsolationContext, UserId, RoleId } from "@hl8/domain-kernel";
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
   * @param assignedBy - 分配者ID（可选）
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
    super("AssignPermissionCommand", "权限分配命令", context);
  }
}
