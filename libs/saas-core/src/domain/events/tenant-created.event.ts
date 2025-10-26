import { GenericEntityId, TenantId } from "@hl8/domain-kernel";
import type { DomainEvent } from "@hl8/domain-kernel";
import { TenantType } from "../value-objects/tenant-type.vo.js";

/**
 * 租户创建事件
 * @description 当租户被创建时发布的领域事件
 *
 * @example
 * ```typescript
 * const event: TenantCreatedEvent = {
 *   eventId: GenericEntityId.generate(),
 *   occurredAt: new Date(),
 *   aggregateId: tenantId,
 *   version: 1,
 *   eventType: "TenantCreated",
 *   eventData: {
 *     code: "TENANT001",
 *     name: "测试租户",
 *     domain: "example.com",
 *     type: TenantType.BASIC,
 *   },
 * };
 * ```
 */
export interface TenantCreatedEvent extends DomainEvent {
  eventType: "TenantCreated";
  eventData: {
    code: string;
    name: string;
    domain: string;
    type: TenantType;
  };
}

/**
 * 创建租户创建事件
 * @description 工厂函数，创建 TenantCreatedEvent 事件对象
 *
 * @param aggregateId - 聚合根ID（租户ID）
 * @param code - 租户代码
 * @param name - 租户名称
 * @param domain - 租户域名
 * @param type - 租户类型
 * @param version - 事件版本（默认为1）
 * @returns 租户创建事件
 */
export function createTenantCreatedEvent(
  aggregateId: TenantId,
  code: string,
  name: string,
  domain: string,
  type: TenantType,
  version: number = 1,
): TenantCreatedEvent {
  return {
    eventId: GenericEntityId.generate(),
    occurredAt: new Date(),
    aggregateId,
    version,
    eventType: "TenantCreated",
    eventData: {
      code,
      name,
      domain,
      type,
    },
  };
}
