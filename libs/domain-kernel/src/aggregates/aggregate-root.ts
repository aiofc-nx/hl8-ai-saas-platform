/**
 * 聚合根基类
 * @description 提供版本控制、事件收集与发布、指令模式的基础能力
 *
 * ## 聚合根职责
 * - 管理聚合一致性边界
 * - 协调内部实体操作
 * - 发布领域事件
 * - 验证业务规则
 * - 处理跨实体的业务逻辑
 *
 * ## 事件溯源支持
 * - 事件发布：聚合根发布领域事件
 * - 状态重建：从事件流重建状态
 * - 事件版本：支持事件版本管理
 * - 快照支持：支持聚合状态快照
 *
 * @since 1.0.0
 */
import { EntityId } from "../value-objects/ids/entity-id.vo.js";
import { BaseEntity } from "../entities/base-entity.js";

/**
 * 领域事件接口
 */
export interface DomainEvent {
  readonly eventId: EntityId;
  readonly occurredAt: Date;
  readonly aggregateId: EntityId;
  readonly version: number;
  readonly eventType: string;
  readonly eventData: Record<string, any>;
}

/**
 * 聚合根基类
 * @template TId - 聚合标识符类型
 */
export abstract class AggregateRoot<
  TId extends EntityId = EntityId,
> extends BaseEntity<TId> {
  private _pendingEvents: DomainEvent[] = [];
  private _snapshotVersion: number = 0;

  constructor(
    id: TId,
    createdAt?: Date,
    updatedAt?: Date,
    version: number = 0,
  ) {
    super(id, createdAt, updatedAt, version);
  }

  /**
   * 获取待发布事件
   */
  get pendingEvents(): readonly DomainEvent[] {
    return [...this._pendingEvents];
  }

  /**
   * 获取快照版本
   */
  get snapshotVersion(): number {
    return this._snapshotVersion;
  }

  /**
   * 应用领域事件
   * @description 发布领域事件并更新版本号
   *
   * @param event - 领域事件
   *
   * @example
   * ```typescript
   * this.apply(new UserCreatedEvent(this.id, email, username));
   * ```
   */
  protected apply(event: DomainEvent): void {
    this._pendingEvents.push(event);
    this.updateTimestamp();
  }

  /**
   * 拉取并清空待发布事件
   * @description 获取所有待发布事件并清空事件列表
   *
   * @returns 待发布事件列表
   */
  pullEvents(): DomainEvent[] {
    const events = [...this._pendingEvents];
    this._pendingEvents = [];
    return events;
  }

  /**
   * 创建领域事件
   * @description 创建标准格式的领域事件
   *
   * @param eventType - 事件类型
   * @param eventData - 事件数据
   * @returns 领域事件
   */
  protected createDomainEvent(
    eventType: string,
    eventData: Record<string, any>,
  ): DomainEvent {
    return {
      eventId: new (EntityId as any)(),
      occurredAt: new Date(),
      aggregateId: this.id,
      version: this.version + 1,
      eventType,
      eventData,
    };
  }

  /**
   * 从事件流重建状态
   * @description 根据事件流重建聚合状态
   *
   * @param events - 事件流
   *
   * @example
   * ```typescript
   * const events = await eventStore.getEvents(aggregateId);
   * aggregate.replayEvents(events);
   * ```
   */
  replayEvents(events: DomainEvent[]): void {
    for (const event of events) {
      this.handleEvent(event);
      // 更新版本号
      (this as any)._version = event.version;
    }
  }

  /**
   * 处理单个事件
   * @description 子类可以重写此方法处理特定事件
   *
   * @param event - 领域事件
   */
  protected handleEvent(_event: DomainEvent): void {
    // 子类可以重写此方法处理特定事件
  }

  /**
   * 创建快照
   * @description 创建聚合状态的快照
   *
   * @returns 快照数据
   */
  createSnapshot(): Record<string, any> {
    this._snapshotVersion = this.version;
    return this.getSnapshotData();
  }

  /**
   * 获取快照数据
   * @description 子类必须实现此方法提供快照数据
   *
   * @returns 快照数据
   */
  protected abstract getSnapshotData(): Record<string, any>;

  /**
   * 从快照恢复状态
   * @description 从快照恢复聚合状态
   *
   * @param snapshot - 快照数据
   * @param version - 快照版本
   */
  restoreFromSnapshot(snapshot: Record<string, any>, version: number): void {
    this._snapshotVersion = version;
    (this as any)._version = version;
    this.loadFromSnapshot(snapshot);
  }

  /**
   * 从快照加载数据
   * @description 子类必须实现此方法从快照加载数据
   *
   * @param snapshot - 快照数据
   */
  protected abstract loadFromSnapshot(snapshot: Record<string, any>): void;

  /**
   * 验证业务规则
   * @description 子类可以重写此方法进行业务规则验证
   *
   * @throws {Error} 当业务规则验证失败时抛出异常
   */
  protected validateBusinessRules(): void {
    // 子类可以重写此方法进行业务规则验证
  }

  /**
   * 协调内部实体操作
   * @description 聚合根协调内部实体的操作
   *
   * @param operation - 操作函数
   * @param entity - 内部实体
   */
  protected coordinateEntityOperation<T extends BaseEntity>(
    operation: (entity: T) => void,
    entity: T,
  ): void {
    // 验证业务规则
    this.validateBusinessRules();

    // 执行实体操作
    operation(entity);

    // 更新聚合时间戳
    this.updateTimestamp();
  }

  /**
   * 检查聚合是否为空
   * @returns 是否为空
   */
  isEmpty(): boolean {
    return this.version === 0;
  }

  /**
   * 检查聚合是否有待发布事件
   * @returns 是否有待发布事件
   */
  hasPendingEvents(): boolean {
    return this._pendingEvents.length > 0;
  }

  /**
   * 清空待发布事件
   * @description 清空所有待发布事件
   */
  clearPendingEvents(): void {
    this._pendingEvents = [];
  }
}
