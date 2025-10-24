import { DomainEvent } from "@hl8/domain-kernel";
import { UserId } from "../value-objects/user-id.vo.js";
import { RoleId } from "../value-objects/role-id.vo.js";

/**
 * 权限变更事件
 *
 * @description 当用户权限发生变化时触发的事件
 * @since 1.0.0
 */
export class PermissionChangedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly occurredOn: Date;
  public readonly eventType: string = "PermissionChanged";

  /**
   * 创建权限变更事件
   *
   * @param userId - 用户ID
   * @param roleId - 角色ID
   * @param changeType - 变更类型（ADDED, REMOVED, UPDATED）
   * @param permissions - 权限列表
   * @param reason - 变更原因
   */
  constructor(
    public readonly userId: UserId,
    public readonly roleId: RoleId | null,
    public readonly changeType: "ADDED" | "REMOVED" | "UPDATED",
    public readonly permissions: string[],
    public readonly reason: string,
  ) {
    this.eventId = `permission-changed-${userId.getValue()}-${Date.now()}`;
    this.occurredOn = new Date();
  }

  /**
   * 获取事件数据
   *
   * @returns 事件数据
   */
  getEventData(): Record<string, unknown> {
    return {
      userId: this.userId.getValue(),
      roleId: this.roleId?.getValue() || null,
      changeType: this.changeType,
      permissions: this.permissions,
      reason: this.reason,
      occurredOn: this.occurredOn.toISOString(),
    };
  }

  /**
   * 获取事件元数据
   *
   * @returns 事件元数据
   */
  getEventMetadata(): Record<string, unknown> {
    return {
      eventId: this.eventId,
      eventType: this.eventType,
      occurredOn: this.occurredOn.toISOString(),
      userId: this.userId.getValue(),
    };
  }
}
