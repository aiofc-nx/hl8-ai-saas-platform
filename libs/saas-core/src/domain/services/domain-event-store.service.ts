/**
 * 领域事件存储服务
 *
 * @description 存储和检索领域事件，支持事件溯源
 * @since 1.0.0
 */

import { DomainEvent, EntityId } from "@hl8/domain-kernel";

/**
 * 事件存储接口
 */
export interface IEventStore {
  save(aggregateId: EntityId, events: DomainEvent[]): Promise<void>;
  getEvents(aggregateId: EntityId): Promise<DomainEvent[]>;
  getEventsByType(eventType: string): Promise<DomainEvent[]>;
  getEventsByVersion(
    aggregateId: EntityId,
    version: number,
  ): Promise<DomainEvent[]>;
  exists(aggregateId: EntityId): Promise<boolean>;
}

/**
 * 领域事件存储服务
 *
 * 负责存储和检索领域事件：
 * - 保存聚合根的事件流
 * - 检索聚合根的事件流
 * - 支持事件版本查询
 * - 支持事件类型查询
 * - 支持事件存在性检查
 */
export class DomainEventStore {
  private store: IEventStore;

  /**
   * 构造函数
   * @param store - 事件存储实例
   */
  constructor(store: IEventStore) {
    this.store = store;
  }

  /**
   * 保存事件
   *
   * @description 保存聚合根的事件流
   * @param aggregateId - 聚合根标识符
   * @param events - 事件数组
   * @returns Promise<void>
   * @throws {Error} 当事件保存失败时抛出错误
   * @example
   * ```typescript
   * const store = new DomainEventStore(eventStore);
   * const events = [event1, event2, event3];
   * await store.save(aggregateId, events);
   * ```
   */
  async save(aggregateId: EntityId, events: DomainEvent[]): Promise<void> {
    try {
      await this.store.save(aggregateId, events);
    } catch (error) {
      console.error("Failed to save events:", error);
      throw new Error(`Failed to save events: ${(error as Error).message}`);
    }
  }

  /**
   * 获取事件流
   *
   * @description 获取聚合根的所有事件
   * @param aggregateId - 聚合根标识符
   * @returns 事件数组
   * @throws {Error} 当事件检索失败时抛出错误
   * @example
   * ```typescript
   * const events = await store.getEvents(aggregateId);
   * ```
   */
  async getEvents(aggregateId: EntityId): Promise<DomainEvent[]> {
    try {
      return await this.store.getEvents(aggregateId);
    } catch (error) {
      console.error("Failed to get events:", error);
      throw new Error(`Failed to get events: ${(error as Error).message}`);
    }
  }

  /**
   * 根据事件类型获取事件
   *
   * @description 获取特定类型的所有事件
   * @param eventType - 事件类型
   * @returns 事件数组
   * @throws {Error} 当事件检索失败时抛出错误
   * @example
   * ```typescript
   * const events = await store.getEventsByType('TenantCreated');
   * ```
   */
  async getEventsByType(eventType: string): Promise<DomainEvent[]> {
    try {
      return await this.store.getEventsByType(eventType);
    } catch (error) {
      console.error("Failed to get events by type:", error);
      throw new Error(
        `Failed to get events by type: ${(error as Error).message}`,
      );
    }
  }

  /**
   * 根据版本获取事件
   *
   * @description 获取特定版本或之前的所有事件
   * @param aggregateId - 聚合根标识符
   * @param version - 版本号
   * @returns 事件数组
   * @throws {Error} 当事件检索失败时抛出错误
   * @example
   * ```typescript
   * const events = await store.getEventsByVersion(aggregateId, 5);
   * ```
   */
  async getEventsByVersion(
    aggregateId: EntityId,
    version: number,
  ): Promise<DomainEvent[]> {
    try {
      return await this.store.getEventsByVersion(aggregateId, version);
    } catch (error) {
      console.error("Failed to get events by version:", error);
      throw new Error(
        `Failed to get events by version: ${(error as Error).message}`,
      );
    }
  }

  /**
   * 检查聚合根是否存在
   *
   * @description 检查聚合根是否有事件流
   * @param aggregateId - 聚合根标识符
   * @returns 是否存在
   * @throws {Error} 当检查失败时抛出错误
   * @example
   * ```typescript
   * const exists = await store.exists(aggregateId);
   * ```
   */
  async exists(aggregateId: EntityId): Promise<boolean> {
    try {
      return await this.store.exists(aggregateId);
    } catch (error) {
      console.error("Failed to check existence:", error);
      throw new Error(`Failed to check existence: ${(error as Error).message}`);
    }
  }

  /**
   * 保存聚合根的所有待发布事件
   *
   * @description 从聚合根提取所有待发布事件并保存
   * @param aggregate - 聚合根对象
   * @returns Promise<void>
   * @throws {Error} 当事件保存失败时抛出错误
   * @example
   * ```typescript
   * const aggregate = new TenantAggregate(tenantId, name);
   * aggregate.addEvent(createEvent());
   * await store.savePendingEvents(aggregate);
   * ```
   */
  async savePendingEvents(aggregate: {
    id: EntityId;
    pendingEvents: readonly DomainEvent[];
  }): Promise<void> {
    const events = Array.from(aggregate.pendingEvents);

    if (events.length === 0) {
      return;
    }

    await this.save(aggregate.id, events);
  }

  /**
   * 设置事件存储
   *
   * @description 设置或更换事件存储实例
   * @param store - 事件存储实例
   * @example
   * ```typescript
   * const newStore = new CustomEventStore();
   * eventStore.setEventStore(newStore);
   * ```
   */
  setEventStore(store: IEventStore): void {
    this.store = store;
  }

  /**
   * 获取当前事件存储
   *
   * @description 获取当前使用的事件存储实例
   * @returns 事件存储实例
   * @example
   * ```typescript
   * const store = eventStore.getEventStore();
   * ```
   */
  getEventStore(): IEventStore {
    return this.store;
  }
}
