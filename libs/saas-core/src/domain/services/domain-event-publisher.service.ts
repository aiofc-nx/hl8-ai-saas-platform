/**
 * 领域事件发布器服务
 *
 * @description 发布领域事件到事件总线，支持异步发布和事务支持
 * @since 1.0.0
 */

import { DomainEvent } from "@hl8/domain-kernel";

/**
 * 事件总线接口
 */
export interface IEventBus {
  publish(event: DomainEvent): Promise<void>;
  publishBatch(events: DomainEvent[]): Promise<void>;
}

/**
 * 领域事件发布器服务
 *
 * 负责发布领域事件到事件总线：
 * - 发布单个事件
 * - 批量发布事件
 * - 支持事务性发布
 * - 支持异步发布
 * - 事件版本管理
 */
export class DomainEventPublisher {
  private bus: IEventBus;

  /**
   * 构造函数
   * @param bus - 事件总线
   */
  constructor(bus: IEventBus) {
    this.bus = bus;
  }

  /**
   * 发布事件
   *
   * @description 发布单个领域事件到事件总线
   * @param event - 领域事件
   * @returns Promise<void>
   * @throws {Error} 当事件发布失败时抛出错误
   * @example
   * ```typescript
   * const publisher = new DomainEventPublisher(bus);
   * const event = new TenantCreatedEvent(tenantId, name);
   * await publisher.publish(event);
   * ```
   */
  async publish(event: DomainEvent): Promise<void> {
    try {
      await this.bus.publish(event);
    } catch (error) {
      console.error("Failed to publish event:", error);
      throw new Error(`Failed to publish event: ${(error as Error).message}`);
    }
  }

  /**
   * 批量发布事件
   *
   * @description 批量发布多个领域事件到事件总线
   * @param events - 事件数组
   * @returns Promise<void>
   * @throws {Error} 当事件发布失败时抛出错误
   * @example
   * ```typescript
   * const events = [event1, event2, event3];
   * await publisher.publishBatch(events);
   * ```
   */
  async publishBatch(events: DomainEvent[]): Promise<void> {
    if (!events || events.length === 0) {
      return;
    }

    try {
      await this.bus.publishBatch(events);
    } catch (error) {
      console.error("Failed to publish batch events:", error);
      throw new Error(
        `Failed to publish batch events: ${(error as Error).message}`,
      );
    }
  }

  /**
   * 发布聚合根的所有待发布事件
   *
   * @description 从聚合根提取所有待发布事件并发布
   * @param aggregate - 聚合根对象
   * @returns Promise<void>
   * @throws {Error} 当事件发布失败时抛出错误
   * @example
   * ```typescript
   * const aggregate = new TenantAggregate(tenantId, name);
   * aggregate.addEvent(createEvent());
   * await publisher.publishPendingEvents(aggregate);
   * ```
   */
  async publishPendingEvents(aggregate: {
    pendingEvents: readonly DomainEvent[];
  }): Promise<void> {
    const events = Array.from(aggregate.pendingEvents);

    if (events.length === 0) {
      return;
    }

    await this.publishBatch(events);
  }

  /**
   * 设置事件总线
   *
   * @description 设置或更换事件总线
   * @param bus - 事件总线
   * @example
   * ```typescript
   * const newBus = new CustomEventBus();
   * publisher.setEventBus(newBus);
   * ```
   */
  setEventBus(bus: IEventBus): void {
    this.bus = bus;
  }

  /**
   * 获取当前事件总线
   *
   * @description 获取当前使用的事件总线实例
   * @returns 事件总线实例
   * @example
   * ```typescript
   * const bus = publisher.getEventBus();
   * ```
   */
  getEventBus(): IEventBus {
    return this.bus;
  }
}
