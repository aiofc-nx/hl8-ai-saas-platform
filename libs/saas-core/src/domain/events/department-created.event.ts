import { GenericEntityId, DepartmentId } from "@hl8/domain-kernel";
import type { DomainEvent } from "@hl8/domain-kernel";

/**
 * 部门创建事件
 * @description 当部门被创建时发布的领域事件
 *
 * @example
 * ```typescript
 * const event: DepartmentCreatedEvent = {
 *   eventId: GenericEntityId.generate(),
 *   occurredAt: new Date(),
 *   aggregateId: departmentId,
 *   version: 1,
 *   eventType: "DepartmentCreated",
 *   eventData: {
 *     tenantId: "tenant-123",
 *     organizationId: "org-123",
 *     name: "研发部门",
 *     parentId: null,
 *     description: "部门描述",
 *     level: 1,
 *   },
 * };
 * ```
 */
export interface DepartmentCreatedEvent extends DomainEvent {
  eventType: "DepartmentCreated";
  eventData: {
    tenantId: string;
    organizationId: string;
    name: string;
    parentId: string | null;
    description: string;
    level: number;
  };
}

/**
 * 创建部门创建事件
 * @description 工厂函数，创建 DepartmentCreatedEvent 事件对象
 *
 * @param aggregateId - 聚合根ID（部门ID）
 * @param tenantId - 租户ID（字符串）
 * @param organizationId - 组织ID（字符串）
 * @param name - 部门名称
 * @param parentId - 父部门ID（字符串或null）
 * @param description - 部门描述
 * @param level - 部门层级
 * @param version - 事件版本（默认为1）
 * @returns 部门创建事件
 */
export function createDepartmentCreatedEvent(
  aggregateId: DepartmentId,
  tenantId: string,
  organizationId: string,
  name: string,
  parentId: string | null,
  description: string,
  level: number,
  version: number = 1,
): DepartmentCreatedEvent {
  return {
    eventId: GenericEntityId.generate(),
    occurredAt: new Date(),
    aggregateId,
    version,
    eventType: "DepartmentCreated",
    eventData: {
      tenantId,
      organizationId,
      name,
      parentId,
      description,
      level,
    },
  };
}
