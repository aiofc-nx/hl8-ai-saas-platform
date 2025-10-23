/**
 * 领域事件接口
 *
 * 与 domain-kernel AggregateRoot 一致的领域事件结构
 * 使用 EntityId 值对象进行标识符管理
 *
 * @since 1.0.0
 */
import { EntityId } from "@hl8/domain-kernel";

/**
 * 领域事件接口
 *
 * 所有领域事件都应该实现此接口
 * 与 domain-kernel 的 AggregateRoot 事件结构保持一致
 */
export interface DomainEvent {
  /**
   * 事件唯一标识符
   */
  readonly eventId: EntityId;

  /**
   * 事件发生时间
   */
  readonly occurredAt: Date;

  /**
   * 聚合根标识符
   */
  readonly aggregateId: EntityId;

  /**
   * 事件版本号
   */
  readonly version: number;

  /**
   * 事件类型标识符
   */
  readonly eventType: string;

  /**
   * 事件数据载荷
   */

  // 必须使用 any 类型：事件数据载荷可以是任意结构，由具体的事件类型决定
  // 这是事件驱动架构的核心需求，无法预先定义所有可能的事件数据结构
  readonly eventData: Record<string, any>;
}
