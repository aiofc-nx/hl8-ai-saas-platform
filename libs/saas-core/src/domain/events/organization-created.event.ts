import { GenericEntityId, OrganizationId } from "@hl8/domain-kernel";
import type { DomainEvent } from "@hl8/domain-kernel";
import { OrganizationType } from "../value-objects/organization-type.vo.js";

/**
 * 组织创建事件
 * @description 当组织被创建时发布的领域事件
 *
 * @example
 * ```typescript
 * const event: OrganizationCreatedEvent = {
 *   eventId: GenericEntityId.generate(),
 *   occurredAt: new Date(),
 *   aggregateId: organizationId,
 *   version: 1,
 *   eventType: "OrganizationCreated",
 *   eventData: {
 *     tenantId: "tenant-123",
 *     name: "测试组织",
 *     type: OrganizationType.COMMITTEE,
 *     description: "组织描述",
 *   },
 * };
 * ```
 */
export interface OrganizationCreatedEvent extends DomainEvent {
  eventType: "OrganizationCreated";
  eventData: {
    tenantId: string;
    name: string;
    type: OrganizationType;
    description: string;
  };
}

/**
 * 创建组织创建事件
 * @description 工厂函数，创建 OrganizationCreatedEvent 事件对象
 *
 * @param aggregateId - 聚合根ID（组织ID）
 * @param tenantId - 租户ID（字符串）
 * @param name - 组织名称
 * @param type - 组织类型
 * @param description - 组织描述
 * @param version - 事件版本（默认为1）
 * @returns 组织创建事件
 */
export function createOrganizationCreatedEvent(
  aggregateId: OrganizationId,
  tenantId: string,
  name: string,
  type: OrganizationType,
  description: string,
  version: number = 1,
): OrganizationCreatedEvent {
  return {
    eventId: GenericEntityId.generate(),
    occurredAt: new Date(),
    aggregateId,
    version,
    eventType: "OrganizationCreated",
    eventData: {
      tenantId,
      name,
      type,
      description,
    },
  };
}
