import { GenericEntityId, TenantId } from "@hl8/domain-kernel";
import type { DomainEvent } from "@hl8/domain-kernel";
import { TenantStatus } from "../value-objects/tenant-status.vo.js";

/**
 * 租户状态变更事件
 * @description 当租户状态发生变化时发布的领域事件
 *
 * @example
 * ```typescript
 * const event: TenantStatusChangedEvent = {
 *   eventId: GenericEntityId.generate(),
 *   occurredAt: new Date(),
 *   aggregateId: tenantId,
 *   version: 2,
 *   eventType: "TenantStatusChanged",
 *   eventData: {
 *     oldStatus: TenantStatus.TRIAL,
 *     newStatus: TenantStatus.ACTIVE,
 *   },
 * };
 * ```
 */
export interface TenantStatusChangedEvent extends DomainEvent {
  eventType: "TenantStatusChanged";
  eventData: {
    oldStatus: TenantStatus;
    newStatus: TenantStatus;
  };
}

/**
 * 创建租户状态变更事件
 * @description 工厂函数，创建 TenantStatusChangedEvent 事件对象
 *
 * @param aggregateId - 聚合根ID（租户ID）
 * @param oldStatus - 旧状态
 * @param newStatus - 新状态
 * @param version - 事件版本
 * @returns 租户状态变更事件
 */
export function createTenantStatusChangedEvent(
  aggregateId: TenantId,
  oldStatus: TenantStatus,
  newStatus: TenantStatus,
  version: number,
): TenantStatusChangedEvent {
  return {
    eventId: GenericEntityId.generate(),
    occurredAt: new Date(),
    aggregateId,
    version,
    eventType: "TenantStatusChanged",
    eventData: {
      oldStatus,
      newStatus,
    },
  };
}
