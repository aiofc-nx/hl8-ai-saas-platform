import { DomainEvent, EntityId, GenericEntityId, UserId, RoleId } from "@hl8/domain-kernel";
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
export class PermissionChangedEvent extends DomainEvent {
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
