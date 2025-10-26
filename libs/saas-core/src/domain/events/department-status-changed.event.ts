import { GenericEntityId, DepartmentId } from "@hl8/domain-kernel";
import type { DomainEvent } from "@hl8/domain-kernel";
import { DepartmentStatus } from "../value-objects/department-status.vo.js";

/**
 * 部门状态变更事件
 * @description 当部门状态发生变更时发布的领域事件
 *
 * @example
 * ```typescript
 * const event: DepartmentStatusChangedEvent = {
 *   eventId: GenericEntityId.generate(),
 *   occurredAt: new Date(),
 *   aggregateId: departmentId,
 *   version: 2,
 *   eventType: "DepartmentStatusChanged",
 *   eventData: {
 *     oldStatus: DepartmentStatus.ACTIVE,
 *     newStatus: DepartmentStatus.INACTIVE,
 *   },
 * };
 * ```
 */
export interface DepartmentStatusChangedEvent extends DomainEvent {
  eventType: "DepartmentStatusChanged";
  eventData: {
    oldStatus: DepartmentStatus;
    newStatus: DepartmentStatus;
  };
}

/**
 * 创建部门状态变更事件
 * @description 工厂函数，创建 DepartmentStatusChangedEvent 事件对象
 *
 * @param aggregateId - 聚合根ID（部门ID）
 * @param oldStatus - 旧状态
 * @param newStatus - 新状态
 * @param version - 事件版本（默认为1）
 * @returns 部门状态变更事件
 */
export function createDepartmentStatusChangedEvent(
  aggregateId: DepartmentId,
  oldStatus: DepartmentStatus,
  newStatus: DepartmentStatus,
  version: number = 1,
): DepartmentStatusChangedEvent {
  return {
    eventId: GenericEntityId.generate(),
    occurredAt: new Date(),
    aggregateId,
    version,
    eventType: "DepartmentStatusChanged",
    eventData: {
      oldStatus,
      newStatus,
    },
  };
}
