/**
 * 领域事件处理器服务
 *
 * @description 处理领域事件的接收、路由和执行，协调多个事件处理器
 * @since 1.0.0
 */

import { DomainEvent } from "@hl8/domain-kernel";

/**
 * 事件处理器接口
 */
export interface IEventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

/**
 * 领域事件处理器服务
 *
 * 负责处理领域事件的接收、路由和执行：
 * - 注册事件处理器
 * - 路由事件到对应的处理器
 * - 协调多个事件处理器
 * - 处理事件处理错误
 */
export class DomainEventHandler {
  private handlers: Map<string, Set<IEventHandler<DomainEvent>>> = new Map();

  /**
   * 注册事件处理器
   *
   * @description 为特定事件类型注册处理器
   * @param eventType - 事件类型
   * @param handler - 事件处理器
   * @example
   * ```typescript
   * const handler = new DomainEventHandler();
   * handler.register('TenantCreated', (event) => {
   *   console.log('Tenant created:', event);
   * });
   * ```
   */
  register(eventType: string, handler: IEventHandler<DomainEvent>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  /**
   * 取消注册事件处理器
   *
   * @description 移除特定事件类型的处理器
   * @param eventType - 事件类型
   * @param handler - 事件处理器
   * @example
   * ```typescript
   * handler.unregister('TenantCreated', handler);
   * ```
   */
  unregister(eventType: string, handler: IEventHandler<DomainEvent>): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * 处理事件
   *
   * @description 将事件路由到对应的处理器并执行
   * @param event - 领域事件
   * @returns Promise<void>
   * @throws {Error} 当事件处理失败时抛出错误
   * @example
   * ```typescript
   * const event = new TenantCreatedEvent(tenantId, name);
   * await handler.handle(event);
   * ```
   */
  async handle(event: DomainEvent): Promise<void> {
    const eventType = event.eventType;
    const handlers = this.handlers.get(eventType);

    if (!handlers || handlers.size === 0) {
      console.warn(`No handlers registered for event type: ${eventType}`);
      return;
    }

    // 执行所有处理器
    const errors: Error[] = [];

    for (const handler of handlers) {
      try {
        await handler.handle(event);
      } catch (error) {
        errors.push(error as Error);
        console.error(`Error handling event ${eventType}:`, error);
      }
    }

    // 如果有错误，抛出最后一个错误
    if (errors.length > 0) {
      throw new Error(
        `Failed to handle event ${eventType}: ${errors.map((e) => e.message).join(", ")}`,
      );
    }
  }

  /**
   * 批量处理事件
   *
   * @description 批量处理多个事件
   * @param events - 事件数组
   * @returns Promise<void>
   * @example
   * ```typescript
   * const events = [event1, event2, event3];
   * await handler.handleBatch(events);
   * ```
   */
  async handleBatch(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.handle(event);
    }
  }

  /**
   * 检查是否有处理器
   *
   * @description 检查是否有处理器注册
   * @param eventType - 事件类型
   * @returns 是否有处理器
   * @example
   * ```typescript
   * const hasHandler = handler.hasHandler('TenantCreated');
   * ```
   */
  hasHandler(eventType: string): boolean {
    const handlers = this.handlers.get(eventType);
    return handlers ? handlers.size > 0 : false;
  }

  /**
   * 获取处理器数量
   *
   * @description 获取特定事件类型的处理器数量
   * @param eventType - 事件类型
   * @returns 处理器数量
   * @example
   * ```typescript
   * const count = handler.getHandlerCount('TenantCreated');
   * ```
   */
  getHandlerCount(eventType: string): number {
    const handlers = this.handlers.get(eventType);
    return handlers ? handlers.size : 0;
  }

  /**
   * 获取所有已注册的事件类型
   *
   * @description 获取所有已注册的事件类型列表
   * @returns 事件类型数组
   * @example
   * ```typescript
   * const types = handler.getRegisteredEventTypes();
   * ```
   */
  getRegisteredEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * 清空所有处理器
   *
   * @description 移除所有已注册的处理器
   * @example
   * ```typescript
   * handler.clear();
   * ```
   */
  clear(): void {
    this.handlers.clear();
  }
}
