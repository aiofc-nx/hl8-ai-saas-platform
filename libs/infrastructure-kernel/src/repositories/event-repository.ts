/**
 * 事件仓储接口
 * @description 定义事件流的读写契约
 */
import { EntityId, DomainEvent } from "@repo/domain-kernel";

/**
 * 事件仓储接口
 */
export interface EventRepository {
  /**
   * 保存事件流
   * @param aggregateId - 聚合标识符
   * @param events - 事件列表
   * @param expectedVersion - 期望版本
   */
  saveEvents(
    aggregateId: EntityId,
    events: DomainEvent[],
    expectedVersion: number,
  ): Promise<void>;

  /**
   * 获取事件流
   * @param aggregateId - 聚合标识符
   * @param fromVersion - 起始版本
   * @returns 事件列表
   */
  getEvents(
    aggregateId: EntityId,
    fromVersion?: number,
  ): Promise<DomainEvent[]>;

  /**
   * 获取聚合版本
   * @param aggregateId - 聚合标识符
   * @returns 当前版本
   */
  getVersion(aggregateId: EntityId): Promise<number>;
}
