/**
 * 领域事件订阅器服务
 *
 * @description 订阅领域事件并处理事件通知，支持过滤和路由
 * @since 1.0.0
 */

import { DomainEvent } from "@hl8/domain-kernel";

/**
 * 事件订阅处理器接口
 */
export interface IEventSubscriberHandler {
  handle(event: DomainEvent): Promise<void>;
}

/**
 * 事件过滤器接口
 */
export interface IEventFilter {
  match(event: DomainEvent): boolean;
}

/**
 * 领域事件订阅器服务
 *
 * 负责订阅领域事件并处理事件通知：
 * - 订阅特定事件类型
 * - 事件过滤和路由
 * - 支持多个订阅者
 * - 支持事件过滤条件
 * - 支持取消订阅
 */
export class DomainEventSubscriber {
  private subscribers: Map<string, Set<IEventSubscriberHandler>> = new Map();
  private filters: Map<string, Set<IEventFilter>> = new Map();

  /**
   * 订阅事件
   *
   * @description 订阅特定事件类型，当事件发生时调用处理器
   * @param eventType - 事件类型
   * @param handler - 事件处理器
   * @example
   * ```typescript
   * const subscriber = new DomainEventSubscriber();
   * subscriber.subscribe('TenantCreated', async (event) => {
   *   console.log('Tenant created:', event);
   * });
   * ```
   */
  subscribe(eventType: string, handler: IEventSubscriberHandler): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(handler);
  }

  /**
   * 取消订阅
   *
   * @description 取消订阅特定事件类型
   * @param eventType - 事件类型
   * @param handler - 事件处理器
   * @example
   * ```typescript
   * subscriber.unsubscribe('TenantCreated', handler);
   * ```
   */
  unsubscribe(eventType: string, handler: IEventSubscriberHandler): void {
    const handlers = this.subscribers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * 添加事件过滤器
   *
   * @description 为特定事件类型添加过滤器
   * @param eventType - 事件类型
   * @param filter - 事件过滤器
   * @example
   * ```typescript
   * const filter = { match: (event) => event.version > 1 };
   * subscriber.addFilter('TenantCreated', filter);
   * ```
   */
  addFilter(eventType: string, filter: IEventFilter): void {
    if (!this.filters.has(eventType)) {
      this.filters.set(eventType, new Set());
    }
    this.filters.get(eventType)!.add(filter);
  }

  /**
   * 移除事件过滤器
   *
   * @description 移除特定事件类型的过滤器
   * @param eventType - 事件类型
   * @param filter - 事件过滤器
   * @example
   * ```typescript
   * subscriber.removeFilter('TenantCreated', filter);
   * ```
   */
  removeFilter(eventType: string, filter: IEventFilter): void {
    const filters = this.filters.get(eventType);
    if (filters) {
      filters.delete(filter);
    }
  }

  /**
   * 通知事件
   *
   * @description 通知所有订阅者事件已发生
   * @param event - 领域事件
   * @returns Promise<void>
   * @throws {Error} 当事件通知失败时抛出错误
   * @example
   * ```typescript
   * const event = new TenantCreatedEvent(tenantId, name);
   * await subscriber.notify(event);
   * ```
   */
  async notify(event: DomainEvent): Promise<void> {
    const eventType = event.eventType;
    const handlers = this.subscribers.get(eventType);

    if (!handlers || handlers.size === 0) {
      return;
    }

    // 检查过滤器
    const filters = this.filters.get(eventType);
    if (filters && filters.size > 0) {
      const shouldNotify = Array.from(filters).every((filter) =>
        filter.match(event),
      );
      if (!shouldNotify) {
        return;
      }
    }

    // 通知所有订阅者
    const errors: Error[] = [];

    for (const handler of handlers) {
      try {
        await handler.handle(event);
      } catch (error) {
        errors.push(error as Error);
        console.error(
          `Error notifying subscriber for event ${eventType}:`,
          error,
        );
      }
    }

    // 如果有错误，抛出最后一个错误
    if (errors.length > 0) {
      throw new Error(
        `Failed to notify subscribers for event ${eventType}: ${errors.map((e) => e.message).join(", ")}`,
      );
    }
  }

  /**
   * 批量通知事件
   *
   * @description 批量通知多个事件
   * @param events - 事件数组
   * @returns Promise<void>
   * @example
   * ```typescript
   * const events = [event1, event2, event3];
   * await subscriber.notifyBatch(events);
   * ```
   */
  async notifyBatch(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.notify(event);
    }
  }

  /**
   * 检查是否有订阅者
   *
   * @description 检查是否有订阅者订阅特定事件类型
   * @param eventType - 事件类型
   * @returns 是否有订阅者
   * @example
   * ```typescript
   * const hasSubscriber = subscriber.hasSubscriber('TenantCreated');
   * ```
   */
  hasSubscriber(eventType: string): boolean {
    const handlers = this.subscribers.get(eventType);
    return handlers ? handlers.size > 0 : false;
  }

  /**
   * 获取订阅者数量
   *
   * @description 获取特定事件类型的订阅者数量
   * @param eventType - 事件类型
   * @returns 订阅者数量
   * @example
   * ```typescript
   * const count = subscriber.getSubscriberCount('TenantCreated');
   * ```
   */
  getSubscriberCount(eventType: string): number {
    const handlers = this.subscribers.get(eventType);
    return handlers ? handlers.size : 0;
  }

  /**
   * 获取所有已订阅的事件类型
   *
   * @description 获取所有已订阅的事件类型列表
   * @returns 事件类型数组
   * @example
   * ```typescript
   * const types = subscriber.getSubscribedEventTypes();
   * ```
   */
  getSubscribedEventTypes(): string[] {
    return Array.from(this.subscribers.keys());
  }

  /**
   * 清空所有订阅
   *
   * @description 移除所有订阅和过滤器
   * @example
   * ```typescript
   * subscriber.clear();
   * ```
   */
  clear(): void {
    this.subscribers.clear();
    this.filters.clear();
  }
}
