import { DomainEvent, GenericEntityId, UserId } from "@hl8/domain-kernel";
import { UserStatus } from "../value-objects/user-status.vo.js";

/**
 * 用户状态变更事件接口
 * @description 当用户状态发生变化时发布此事件
 */
export interface UserStatusChangedEvent extends DomainEvent {
  readonly eventType: "UserStatusChanged";
  readonly eventData: {
    oldStatus: UserStatus;
    newStatus: UserStatus;
  };
}

/**
 * 创建用户状态变更事件
 * @description 创建用户状态变更领域事件
 *
 * @param userId - 用户ID
 * @param oldStatus - 旧状态
 * @param newStatus - 新状态
 * @param version - 聚合根版本
 * @returns 用户状态变更事件
 *
 * @example
 * ```typescript
 * const event = createUserStatusChangedEvent(
 *   UserId.create('user-123'),
 *   UserStatus.PENDING,
 *   UserStatus.ACTIVE,
 *   2
 * );
 * ```
 */
export function createUserStatusChangedEvent(
  userId: UserId,
  oldStatus: UserStatus,
  newStatus: UserStatus,
  version: number,
): UserStatusChangedEvent {
  return {
    eventId: GenericEntityId.generate(),
    occurredAt: new Date(),
    aggregateId: userId,
    version,
    eventType: "UserStatusChanged",
    eventData: {
      oldStatus,
      newStatus,
    },
  };
}
