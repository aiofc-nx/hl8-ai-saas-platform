import { DomainEventBase, EntityId, GenericEntityId, UserId, RoleId } from "@hl8/domain-kernel";
import { randomUUID } from "node:crypto";

/**
 * 权限变更事件数据
 */
export interface IPermissionChangedEventData {
  readonly userId: UserId;
  readonly roleId: RoleId | null;
  readonly changeType: "ADDED" | "REMOVED" | "UPDATED";
  readonly permissions: string[];
  readonly reason: string;
}

/**
 * 权限变更事件
 *
 * @description 当用户权限发生变化时触发的事件
 * @since 1.0.0
 */
export class PermissionChangedEvent extends DomainEventBase {
  public readonly eventData: IPermissionChangedEventData;

  /**
   * 创建权限变更事件
   *
   * @param aggregateId - 聚合根ID
   * @param eventData - 事件数据
   */
  constructor(
    aggregateId: EntityId,
    eventData: IPermissionChangedEventData,
  ) {
    super(
      GenericEntityId.create(randomUUID()),
      new Date(),
      aggregateId,
      1
    );
    
    this.eventData = eventData;
  }

  /**
   * 获取用户ID
   */
  get userId(): UserId {
    return this.eventData.userId;
  }

  /**
   * 获取角色ID
   */
  get roleId(): RoleId | null {
    return this.eventData.roleId;
  }

  /**
   * 获取变更类型
   */
  get changeType(): "ADDED" | "REMOVED" | "UPDATED" {
    return this.eventData.changeType;
  }

  /**
   * 获取权限列表
   */
  get permissions(): string[] {
    return this.eventData.permissions;
  }

  /**
   * 获取变更原因
   */
  get reason(): string {
    return this.eventData.reason;
  }
}
