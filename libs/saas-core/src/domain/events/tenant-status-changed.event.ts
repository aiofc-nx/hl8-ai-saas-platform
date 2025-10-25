import { DomainEventBase, EntityId, GenericEntityId, TenantId } from "@hl8/domain-kernel";
import { TenantStatus } from "../value-objects/tenant-status.vo.js";
import { randomUUID } from "node:crypto";

/**
 * 租户状态变更事件
 *
 * @description 当租户状态发生变化时触发的事件
 * @since 1.0.0
 */
export class TenantStatusChangedEvent extends DomainEventBase {
  /**
   * 创建租户状态变更事件
   *
   * @param tenantId - 租户ID
   * @param oldStatus - 旧状态
   * @param newStatus - 新状态
   * @param reason - 变更原因
   */
  constructor(
    aggregateId: EntityId,
    public readonly tenantId: TenantId,
    public readonly oldStatus: TenantStatus,
    public readonly newStatus: TenantStatus,
    public readonly reason: string,
  ) {
    super(
      GenericEntityId.create(randomUUID()),
      new Date(),
      aggregateId,
      1
    );
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
      occurredOn: this.occurredAt.toISOString(),
    };
  }
}
