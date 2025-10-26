/**
 * 事件订阅工具
 *
 * 提供事件订阅的实用工具函数
 * 支持事件过滤、批量订阅和订阅管理
 *
 * @since 1.0.0
 */
import { DomainEvent } from "./domain-event.interface.js";
import { IEventBus, EventHandler } from "./event-bus.interface.js";
import { FastifyLoggerService } from "@hl8/nestjs-fastify";

/**
 * 事件过滤器
 */
export type EventFilter = (event: DomainEvent) => boolean;

/**
 * 事件订阅选项
 */
export interface EventSubscriptionOptions {
  /**
   * 事件过滤器
   */
  filter?: EventFilter;

  /**
   * 是否只订阅一次
   */
  once?: boolean;

  /**
   * 订阅优先级
   */
  priority?: number;

  /**
   * 订阅超时时间（毫秒）
   */
  timeout?: number;
}

/**
 * 事件订阅信息
 */
export interface EventSubscription {
  /**
   * 订阅ID
   */
  id: string;

  /**
   * 事件类型
   */
  eventType: string;

  /**
   * 事件处理器
   */
  handler: EventHandler;

  /**
   * 订阅选项
   */
  options: EventSubscriptionOptions;

  /**
   * 订阅时间
   */
  subscribedAt: Date;

  /**
   * 是否活跃
   */
  isActive: boolean;
}

/**
 * 事件订阅管理器
 *
 * 提供事件订阅的实用工具函数
 */
export class EventSubscriptionManager {
  private logger?: FastifyLoggerService;

  /**
   * 设置日志服务
   */
  setLogger(logger: FastifyLoggerService): void {
    this.logger = logger;
  }
  private subscriptions: Map<string, EventSubscription> = new Map();
  private eventBus: IEventBus;

  constructor(eventBus: IEventBus) {
    this.eventBus = eventBus;
  }

  /**
   * 订阅事件
   *
   * @param eventType - 事件类型
   * @param handler - 事件处理器
   * @param options - 订阅选项
   * @returns 订阅ID
   */
  subscribe(
    eventType: string,
    handler: EventHandler,
    options: EventSubscriptionOptions = {},
  ): string {
    const subscriptionId = this.generateSubscriptionId();
    const subscription: EventSubscription = {
      id: subscriptionId,
      eventType,
      handler: this.wrapHandler(handler, options),
      options,
      subscribedAt: new Date(),
      isActive: true,
    };

    this.subscriptions.set(subscriptionId, subscription);
    this.eventBus.subscribe(eventType, subscription.handler);

    return subscriptionId;
  }

  /**
   * 取消订阅
   *
   * @param subscriptionId - 订阅ID
   * @returns 是否成功
   */
  unsubscribe(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return false;
    }

    this.eventBus.unsubscribe(subscription.eventType, subscription.handler);
    this.subscriptions.delete(subscriptionId);

    return true;
  }

  /**
   * 取消所有订阅
   */
  unsubscribeAll(): void {
    for (const [_subscriptionId, subscription] of this.subscriptions) {
      this.eventBus.unsubscribe(subscription.eventType, subscription.handler);
    }
    this.subscriptions.clear();
  }

  /**
   * 获取订阅信息
   *
   * @param subscriptionId - 订阅ID
   * @returns 订阅信息
   */
  getSubscription(subscriptionId: string): EventSubscription | undefined {
    return this.subscriptions.get(subscriptionId);
  }

  /**
   * 获取所有订阅
   *
   * @returns 订阅列表
   */
  getAllSubscriptions(): EventSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  /**
   * 获取事件类型的订阅
   *
   * @param eventType - 事件类型
   * @returns 订阅列表
   */
  getSubscriptionsByEventType(eventType: string): EventSubscription[] {
    return Array.from(this.subscriptions.values()).filter(
      (subscription) => subscription.eventType === eventType,
    );
  }

  /**
   * 检查是否有订阅
   *
   * @param eventType - 事件类型
   * @returns 是否有订阅
   */
  hasSubscriptions(eventType: string): boolean {
    return this.getSubscriptionsByEventType(eventType).length > 0;
  }

  /**
   * 获取订阅统计
   *
   * @returns 订阅统计
   */
  getSubscriptionStats(): {
    total: number;
    byEventType: Record<string, number>;
    active: number;
    inactive: number;
  } {
    const total = this.subscriptions.size;
    const byEventType: Record<string, number> = {};
    let active = 0;
    let inactive = 0;

    for (const subscription of this.subscriptions.values()) {
      byEventType[subscription.eventType] =
        (byEventType[subscription.eventType] || 0) + 1;

      if (subscription.isActive) {
        active++;
      } else {
        inactive++;
      }
    }

    return {
      total,
      byEventType,
      active,
      inactive,
    };
  }

  /**
   * 包装事件处理器
   *
   * @param handler - 原始处理器
   * @param options - 订阅选项
   * @returns 包装后的处理器
   */
  private wrapHandler(
    handler: EventHandler,
    options: EventSubscriptionOptions,
  ): EventHandler {
    return async (event: DomainEvent) => {
      try {
        // 应用过滤器
        if (options.filter && !options.filter(event)) {
          return;
        }

        // 执行处理器
        await handler(event);

        // 如果是一次性订阅，自动取消订阅
        if (options.once) {
          const subscription = Array.from(this.subscriptions.values()).find(
            (sub) => sub.handler === handler,
          );
          if (subscription) {
            this.unsubscribe(subscription.id);
          }
        }
      } catch (error) {
        if (this.logger) {
          this.logger.log("事件处理器执行失败", {
            error: error instanceof Error ? error.message : String(error),
          });
        }
        throw error;
      }
    };
  }

  /**
   * 生成订阅ID
   *
   * @returns 订阅ID
   */
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * 事件订阅工具类
 *
 * 提供事件订阅的实用工具函数
 */
export class EventSubscriptionUtils {
  /**
   * 创建事件过滤器
   *
   * @param eventType - 事件类型
   * @returns 事件过滤器
   */
  static createEventTypeFilter(eventType: string): EventFilter {
    return (event: DomainEvent) => event.eventType === eventType;
  }

  /**
   * 创建聚合根过滤器
   *
   * @param aggregateId - 聚合根ID
   * @returns 事件过滤器
   */
  static createAggregateFilter(aggregateId: string): EventFilter {
    return (event: DomainEvent) => event.aggregateId.getValue() === aggregateId;
  }

  /**
   * 创建版本过滤器
   *
   * @param minVersion - 最小版本
   * @param maxVersion - 最大版本
   * @returns 事件过滤器
   */
  static createVersionFilter(
    minVersion: number,
    maxVersion?: number,
  ): EventFilter {
    return (event: DomainEvent) => {
      if (maxVersion !== undefined) {
        return event.version >= minVersion && event.version <= maxVersion;
      }
      return event.version >= minVersion;
    };
  }

  /**
   * 创建时间过滤器
   *
   * @param startTime - 开始时间
   * @param endTime - 结束时间
   * @returns 事件过滤器
   */
  static createTimeFilter(startTime: Date, endTime?: Date): EventFilter {
    return (event: DomainEvent) => {
      if (endTime !== undefined) {
        return event.occurredAt >= startTime && event.occurredAt <= endTime;
      }
      return event.occurredAt >= startTime;
    };
  }

  /**
   * 创建组合过滤器
   *
   * @param filters - 过滤器数组
   * @param operator - 操作符（AND 或 OR）
   * @returns 组合过滤器
   */
  static createCombinedFilter(
    filters: EventFilter[],
    operator: "AND" | "OR" = "AND",
  ): EventFilter {
    return (event: DomainEvent) => {
      if (operator === "AND") {
        return filters.every((filter) => filter(event));
      } else {
        return filters.some((filter) => filter(event));
      }
    };
  }

  /**
   * 创建一次性订阅
   *
   * @param eventBus - 事件总线
   * @param eventType - 事件类型
   * @param handler - 事件处理器
   * @param timeout - 超时时间（毫秒）
   * @returns Promise<DomainEvent>
   */
  static async subscribeOnce(
    eventBus: IEventBus,
    eventType: string,
    handler: EventHandler,
    timeout: number = 30000,
  ): Promise<DomainEvent> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        eventBus.unsubscribe(eventType, wrappedHandler);
        reject(new Error(`事件订阅超时: ${timeout}ms`));
      }, timeout);

      const wrappedHandler = async (event: DomainEvent) => {
        clearTimeout(timeoutId);
        eventBus.unsubscribe(eventType, wrappedHandler);
        await handler(event);
        resolve(event);
      };

      eventBus.subscribe(eventType, wrappedHandler);
    });
  }
}
