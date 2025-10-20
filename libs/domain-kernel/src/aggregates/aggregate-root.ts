/**
 * 聚合根基类
 * @description 提供版本控制、事件收集与发布的基础能力
 */
import { EntityId } from "../value-objects/entity-id.vo.js";
import { IsolationContext } from "../isolation/isolation-context.js";

/**
 * 领域事件接口
 */
export interface DomainEvent {
  readonly eventId: EntityId;
  readonly occurredAt: Date;
  readonly aggregateId: EntityId;
  readonly version: number;
  readonly isolationContext: IsolationContext;
}

/**
 * 聚合根基类
 * @template TId - 聚合标识符类型
 */
export abstract class AggregateRoot<TId extends EntityId = EntityId> {
  private _version: number = 0;
  private _pendingEvents: DomainEvent[] = [];

  constructor(
    public readonly id: TId,
    version: number = 0,
  ) {
    this._version = version;
  }

  /**
   * 获取当前版本
   */
  get version(): number {
    return this._version;
  }

  /**
   * 获取待发布事件
   */
  get pendingEvents(): readonly DomainEvent[] {
    return [...this._pendingEvents];
  }

  /**
   * 应用领域事件
   * @param event - 领域事件
   */
  protected apply(event: DomainEvent): void {
    this._pendingEvents.push(event);
    this._version++;
  }

  /**
   * 拉取并清空待发布事件
   */
  pullEvents(): DomainEvent[] {
    const events = [...this._pendingEvents];
    this._pendingEvents = [];
    return events;
  }

  /**
   * 增加版本号
   */
  protected incrementVersion(): void {
    this._version++;
  }
}
