import { GenericEntityId, OrganizationId } from "@hl8/domain-kernel";
import type { DomainEvent } from "@hl8/domain-kernel";
import { OrganizationStatus } from "../value-objects/organization-status.vo.js";

/**
 * 组织状态变更事件
 * @description 当组织状态发生变更时发布的领域事件
 *
 * @example
 * ```typescript
 * const event: OrganizationStatusChangedEvent = {
 *   eventId: GenericEntityId.generate(),
 *   occurredAt: new Date(),
 *   aggregateId: organizationId,
 *   version: 2,
 *   eventType: "OrganizationStatusChanged",
 *   eventData: {
 *     oldStatus: OrganizationStatus.ACTIVE,
 *     newStatus: OrganizationStatus.INACTIVE,
 *   },
 * };
 * ```
 */
export interface OrganizationStatusChangedEvent extends DomainEvent {
  eventType: "OrganizationStatusChanged";
  eventData: {
    oldStatus: OrganizationStatus;
    newStatus: OrganizationStatus;
  };
}

/**
 * 创建组织状态变更事件
 * @description 工厂函数，创建 OrganizationStatusChangedEvent 事件对象
 *
 * @param aggregateId - 聚合根ID（组织ID）
 * @param oldStatus - 旧状态
 * @param newStatus - 新状态
 * @param version - 事件版本（默认为1）
 * @returns 组织状态变更事件
 */
export function createOrganizationStatusChangedEvent(
  aggregateId: OrganizationId,
  oldStatus: OrganizationStatus,
  newStatus: OrganizationStatus,
  version: number = 1,
): OrganizationStatusChangedEvent {
  return {
    eventId: GenericEntityId.generate(),
    occurredAt: new Date(),
    aggregateId,
    version,
    eventType: "OrganizationStatusChanged",
    eventData: {
      oldStatus,
      newStatus,
    },
  };
}
