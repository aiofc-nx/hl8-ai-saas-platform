import { DomainEvent as IDomainEvent, DomainEventBase } from "@hl8/domain-kernel";
import { TenantId } from "@hl8/domain-kernel";

/**
 * 租户删除事件
 *
 * @description 当租户被删除时触发的事件
 * @since 1.0.0
 */
export class TenantDeletedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly occurredOn: Date;
  public readonly eventType: string = "TenantDeleted";

  /**
   * 创建租户删除事件
   *
   * @param tenantId - 租户ID
   * @param reason - 删除原因
   * @param deletedBy - 删除操作者
   */
  constructor(
    public readonly tenantId: TenantId,
    public readonly reason: string,
    public readonly deletedBy: string,
  ) {
    this.eventId = `tenant-deleted-${tenantId.getValue()}-${Date.now()}`;
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
      reason: this.reason,
      deletedBy: this.deletedBy,
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
