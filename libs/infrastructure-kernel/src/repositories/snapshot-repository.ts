/**
 * 快照仓储接口
 * @description 定义聚合快照的读写契约（可选）
 */
import { EntityId, AggregateRoot } from "@repo/domain-kernel";

/**
 * 快照仓储接口
 * @template TAggregate - 聚合类型
 */
export interface SnapshotRepository<
  TAggregate extends AggregateRoot = AggregateRoot,
> {
  /**
   * 保存快照
   * @param aggregate - 聚合实例
   */
  saveSnapshot(aggregate: TAggregate): Promise<void>;

  /**
   * 获取快照
   * @param aggregateId - 聚合标识符
   * @returns 聚合实例或 null
   */
  getSnapshot(aggregateId: EntityId): Promise<TAggregate | null>;

  /**
   * 删除快照
   * @param aggregateId - 聚合标识符
   */
  deleteSnapshot(aggregateId: EntityId): Promise<void>;
}
