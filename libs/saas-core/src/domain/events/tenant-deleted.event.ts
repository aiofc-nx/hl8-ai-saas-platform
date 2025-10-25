import { DomainEventBase, EntityId, GenericEntityId, TenantId } from "@hl8/domain-kernel";
import { randomUUID } from "node:crypto";

/**
 * 租户删除事件
 *
 * @description 当租户被删除时触发的事件
 * @since 1.0.0
 */
export class TenantDeletedEvent extends DomainEventBase {
  /**
   * 创建租户删除事件
   *
   * @param tenantId - 租户ID
   * @param reason - 删除原因
   * @param deletedBy - 删除操作者
   */
  constructor(
    aggregateId: EntityId,
    public readonly tenantId: TenantId,
    public readonly reason: string,
    public readonly deletedBy: string,
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
      reason: this.reason,
      deletedBy: this.deletedBy,
      occurredOn: this.occurredAt.toISOString(),
    };
  }
}
