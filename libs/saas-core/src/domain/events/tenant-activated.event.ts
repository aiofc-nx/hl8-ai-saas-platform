/**
 * 租户激活事件
 *
 * @description 表示租户被激活时发布的领域事件
 * @since 1.0.0
 */

import { DomainEvent } from "@hl8/domain-kernel";
import { TenantCode, TenantName } from "../value-objects/index.js";

/**
 * 租户激活事件
 *
 * 当租户从待处理状态被激活时，系统会发布此事件。
 * 事件包含租户的基本信息，用于通知其他系统组件。
 *
 * @example
 * ```typescript
 * const event = new TenantActivatedEvent(
 *   new EntityId(),
 *   new TenantCode("acme-corp"),
 *   new TenantName("Acme Corporation")
 * );
 * ```
 */
export class TenantActivatedEvent extends DomainEvent {
  public readonly tenantCode: TenantCode;
  public readonly tenantName: TenantName;
  public readonly activatedAt: Date;

  constructor(
    tenantId: EntityId,
    tenantCode: TenantCode,
    tenantName: TenantName,
  ) {
    super(tenantId, "TenantActivated");

    this.tenantCode = tenantCode;
    this.tenantName = tenantName;
    this.activatedAt = new Date();
  }

  /**
   * 获取事件数据
   *
   * @returns 事件数据
   */
  getEventData(): Record<string, unknown> {
    return {
      tenantId: this.entityId.toString(),
      tenantCode: this.tenantCode.toString(),
      tenantName: this.tenantName.toString(),
      activatedAt: this.activatedAt.toISOString(),
      eventType: this.eventType,
      eventId: this.eventId.toString(),
      occurredAt: this.occurredAt.toISOString(),
    };
  }

  /**
   * 获取事件的字符串表示
   *
   * @returns 事件字符串表示
   */
  toString(): string {
    return `TenantActivatedEvent(${this.tenantCode.toString()}, ${this.tenantName.toString()})`;
  }
}
