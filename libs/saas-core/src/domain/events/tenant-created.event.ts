/**
 * 租户创建事件
 *
 * @description 表示租户被创建时发布的领域事件
 * @since 1.0.0
 */

import { DomainEvent } from "@hl8/domain-kernel";
import {
  TenantCode,
  TenantName,
  TenantType,
  TenantStatus,
} from "../value-objects/index.js";

/**
 * 租户创建事件
 *
 * 当新租户被创建时，系统会发布此事件。
 * 事件包含租户的基本信息，用于通知其他系统组件。
 *
 * @example
 * ```typescript
 * const event = new TenantCreatedEvent(
 *   new EntityId(),
 *   new TenantCode("acme-corp"),
 *   new TenantName("Acme Corporation"),
 *   new TenantType(TenantTypeEnum.PROFESSIONAL),
 *   new TenantStatus(TenantStatusEnum.PENDING)
 * );
 * ```
 */
export class TenantCreatedEvent extends DomainEvent {
  public readonly tenantCode: TenantCode;
  public readonly tenantName: TenantName;
  public readonly tenantType: TenantType;
  public readonly tenantStatus: TenantStatus;
  public readonly description?: string;
  public readonly contactEmail?: string;
  public readonly contactPhone?: string;
  public readonly address?: string;
  public readonly createdAt: Date;

  constructor(
    tenantId: EntityId,
    tenantCode: TenantCode,
    tenantName: TenantName,
    tenantType: TenantType,
    tenantStatus: TenantStatus,
    description?: string,
    contactEmail?: string,
    contactPhone?: string,
    address?: string,
  ) {
    super(tenantId, "TenantCreated");

    this.tenantCode = tenantCode;
    this.tenantName = tenantName;
    this.tenantType = tenantType;
    this.tenantStatus = tenantStatus;
    this.description = description;
    this.contactEmail = contactEmail;
    this.contactPhone = contactPhone;
    this.address = address;
    this.createdAt = new Date();
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
      tenantType: this.tenantType.toString(),
      tenantStatus: this.tenantStatus.toString(),
      description: this.description,
      contactEmail: this.contactEmail,
      contactPhone: this.contactPhone,
      address: this.address,
      createdAt: this.createdAt.toISOString(),
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
    return `TenantCreatedEvent(${this.tenantCode.toString()}, ${this.tenantName.toString()}, ${this.tenantType.toString()}, ${this.tenantStatus.toString()})`;
  }
}
