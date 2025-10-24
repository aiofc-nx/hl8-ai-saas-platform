import { DomainEvent } from "@hl8/domain-kernel";
import { TenantId } from "../value-objects/tenant-id.vo.js";
import { TenantStatus } from "../value-objects/tenant-status.vo.js";

/**
 * 租户状态变更事件
 *
 * @description 当租户状态发生变化时触发的事件
 * @since 1.0.0
 */
export class TenantStatusChangedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly occurredOn: Date;
  public readonly eventType: string = "TenantStatusChanged";

  /**
   * 创建租户状态变更事件
   *
   * @param tenantId - 租户ID
   * @param oldStatus - 旧状态
   * @param newStatus - 新状态
   * @param reason - 变更原因
   */
  constructor(
    public readonly tenantId: TenantId,
    public readonly oldStatus: TenantStatus,
    public readonly newStatus: TenantStatus,
    public readonly reason: string,
  ) {
    this.eventId = `tenant-status-changed-${tenantId.getValue()}-${Date.now()}`;
    this.occurredOn = new Date();
  }

  /**
   * 获取事件数据
   *
   * @returns 事件数据
   */
  getEventData(): Record<string, unknown> {
    return {
      tenantId: this.tenantId.getValue(),
      oldStatus: this.oldStatus.getValue(),
      newStatus: this.newStatus.getValue(),
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
      tenantId: this.tenantId.getValue(),
    };
  }
}
