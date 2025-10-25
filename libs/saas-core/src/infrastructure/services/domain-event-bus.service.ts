/**
 * 领域事件总线
 *
 * @description 处理领域层事件总线，包括事件发布、订阅、路由、过滤等
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { DomainService } from "@hl8/domain-kernel";
import { DomainEvent } from "@hl8/domain-kernel";

/**
 * 事件订阅者接口
 */
export interface EventSubscriber {
  readonly id: string;
  readonly name: string;
  readonly eventTypes: readonly string[];
  readonly handler: (event: DomainEvent) => Promise<void>;
  readonly priority: number;
  readonly metadata?: Record<string, unknown>;
}

/**
 * 事件过滤器接口
 */
export interface EventFilter {
  readonly id: string;
  readonly name: string;
  readonly condition: (event: DomainEvent) => boolean;
  readonly metadata?: Record<string, unknown>;
}

/**
 * 事件路由规则接口
 */
export interface EventRoute {
  readonly id: string;
  readonly eventType: string;
  readonly subscriberId: string;
  readonly priority: number;
  readonly enabled: boolean;
  readonly metadata?: Record<string, unknown>;
}

/**
 * 事件总线统计信息接口
 */
export interface EventBusStatistics {
  readonly totalEvents: number;
  readonly eventsByType: Record<string, number>;
  readonly totalSubscribers: number;
  readonly activeSubscribers: number;
  readonly averageProcessingTime: number;
  readonly failedEvents: number;
  readonly successRate: number;
}

/**
 * 领域事件总线
 *
 * 领域事件总线负责处理领域层事件总线，包括事件发布、订阅、路由、过滤等。
 * 支持多种事件类型和订阅者，提供统一的事件管理接口。
 *
 * @example
 * ```typescript
 * const bus = new DomainEventBus();
 * await bus.subscribe(subscriber);
 * await bus.publish(event);
 * ```
 */
@Injectable()
export class DomainEventBus extends DomainService {
  private readonly subscribers: Map<string, EventSubscriber> = new Map();
  private readonly filters: Map<string, EventFilter> = new Map();
  private readonly routes: Map<string, EventRoute> = new Map();
  private readonly eventHistory: Array<{
    readonly timestamp: Date;
    readonly event: DomainEvent;
    readonly subscriberId?: string;
    readonly success: boolean;
    readonly processingTime: number;
  }> = [];

  constructor() {
    super();
    this.setContext("DomainEventBus");
  }

  /**
   * 订阅事件
   *
   * @param subscriber - 事件订阅者
   * @returns 是否订阅成功
   */
  async subscribe(subscriber: EventSubscriber): Promise<boolean> {
    this.logger.log(
      `Subscribing to events: ${subscriber.name} (${subscriber.eventTypes.join(", ")})`,
      this.context,
    );

    if (this.subscribers.has(subscriber.id)) {
      throw new Error(`Subscriber ${subscriber.id} already exists`);
    }

    this.subscribers.set(subscriber.id, subscriber);

    // 创建路由规则
    for (const eventType of subscriber.eventTypes) {
      const route: EventRoute = {
        id: `${subscriber.id}-${eventType}`,
        eventType,
        subscriberId: subscriber.id,
        priority: subscriber.priority,
        enabled: true,
        metadata: subscriber.metadata,
      };
      this.routes.set(route.id, route);
    }

    this.logger.log(
      `Event subscriber ${subscriber.name} subscribed successfully`,
      this.context,
    );

    return true;
  }

  /**
   * 取消订阅
   *
   * @param subscriberId - 订阅者ID
   * @returns 是否取消订阅成功
   */
  async unsubscribe(subscriberId: string): Promise<boolean> {
    this.logger.log(`Unsubscribing from events: ${subscriberId}`, this.context);

    const subscriber = this.subscribers.get(subscriberId);
    if (!subscriber) {
      throw new Error(`Subscriber ${subscriberId} not found`);
    }

    // 删除路由规则
    for (const [routeId, route] of this.routes.entries()) {
      if (route.subscriberId === subscriberId) {
        this.routes.delete(routeId);
      }
    }

    this.subscribers.delete(subscriberId);

    this.logger.log(
      `Event subscriber ${subscriberId} unsubscribed successfully`,
      this.context,
    );

    return true;
  }

  /**
   * 发布事件
   *
   * @param event - 领域事件
   * @returns 是否发布成功
   */
  async publish(event: DomainEvent): Promise<boolean> {
    this.logger.log(
      `Publishing event: ${event.constructor.name}`,
      this.context,
    );

    const startTime = Date.now();
    const eventType = event.constructor.name;

    try {
      // 获取相关路由
      const relevantRoutes = Array.from(this.routes.values())
        .filter((route) => route.eventType === eventType && route.enabled)
        .sort((a, b) => b.priority - a.priority);

      if (relevantRoutes.length === 0) {
        this.logger.warn(
          `No subscribers found for event type: ${eventType}`,
          this.context,
        );
        return true;
      }

      // 处理每个订阅者
      const promises: Promise<void>[] = [];
      for (const route of relevantRoutes) {
        const subscriber = this.subscribers.get(route.subscriberId);
        if (subscriber) {
          promises.push(this.processEventForSubscriber(event, subscriber));
        }
      }

      await Promise.all(promises);

      const processingTime = Date.now() - startTime;
      this.recordEventProcessing(event, undefined, true, processingTime);

      this.logger.log(
        `Event ${eventType} published successfully to ${relevantRoutes.length} subscribers`,
        this.context,
      );

      return true;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.recordEventProcessing(event, undefined, false, processingTime);

      this.logger.error(
        `Error publishing event ${eventType}: ${error.message}`,
        this.context,
      );

      return false;
    }
  }

  /**
   * 添加事件过滤器
   *
   * @param filter - 事件过滤器
   * @returns 是否添加成功
   */
  async addEventFilter(filter: EventFilter): Promise<boolean> {
    this.logger.log(`Adding event filter: ${filter.name}`, this.context);

    if (this.filters.has(filter.id)) {
      throw new Error(`Filter ${filter.id} already exists`);
    }

    this.filters.set(filter.id, filter);

    this.logger.log(
      `Event filter ${filter.name} added successfully`,
      this.context,
    );

    return true;
  }

  /**
   * 移除事件过滤器
   *
   * @param filterId - 过滤器ID
   * @returns 是否移除成功
   */
  async removeEventFilter(filterId: string): Promise<boolean> {
    this.logger.log(`Removing event filter: ${filterId}`, this.context);

    const removed = this.filters.delete(filterId);

    this.logger.log(
      `Event filter ${filterId} removed: ${removed}`,
      this.context,
    );

    return removed;
  }

  /**
   * 获取事件统计信息
   *
   * @returns 事件总线统计信息
   */
  async getEventBusStatistics(): Promise<EventBusStatistics> {
    this.logger.log(`Getting event bus statistics`, this.context);

    const totalEvents = this.eventHistory.length;
    const eventsByType: Record<string, number> = {};
    const totalSubscribers = this.subscribers.size;
    const activeSubscribers = Array.from(this.subscribers.values()).length;

    // 统计事件类型
    for (const entry of this.eventHistory) {
      const eventType = entry.event.constructor.name;
      eventsByType[eventType] = (eventsByType[eventType] || 0) + 1;
    }

    // 计算平均处理时间
    const totalProcessingTime = this.eventHistory.reduce(
      (sum, entry) => sum + entry.processingTime,
      0,
    );
    const averageProcessingTime =
      totalEvents > 0 ? totalProcessingTime / totalEvents : 0;

    // 计算失败事件数
    const failedEvents = this.eventHistory.filter(
      (entry) => !entry.success,
    ).length;
    const successRate =
      totalEvents > 0 ? (totalEvents - failedEvents) / totalEvents : 0;

    const result: EventBusStatistics = {
      totalEvents,
      eventsByType,
      totalSubscribers,
      activeSubscribers,
      averageProcessingTime,
      failedEvents,
      successRate,
    };

    this.logger.log(
      `Event bus statistics generated: ${totalEvents} events, ${totalSubscribers} subscribers, ${(successRate * 100).toFixed(2)}% success rate`,
      this.context,
    );

    return result;
  }

  /**
   * 获取事件历史
   *
   * @param limit - 限制数量
   * @returns 事件历史列表
   */
  async getEventHistory(limit: number = 100): Promise<
    readonly {
      readonly timestamp: Date;
      readonly event: DomainEvent;
      readonly subscriberId?: string;
      readonly success: boolean;
      readonly processingTime: number;
    }[]
  > {
    this.logger.log(`Getting event history with limit: ${limit}`, this.context);

    const history = this.eventHistory
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    this.logger.log(
      `Retrieved ${history.length} event history entries`,
      this.context,
    );

    return history;
  }

  /**
   * 获取订阅者列表
   *
   * @returns 订阅者列表
   */
  async getSubscribers(): Promise<readonly EventSubscriber[]> {
    this.logger.log(`Getting event subscribers`, this.context);

    const subscribers = Array.from(this.subscribers.values());

    this.logger.log(
      `Retrieved ${subscribers.length} event subscribers`,
      this.context,
    );

    return subscribers;
  }

  /**
   * 获取事件路由
   *
   * @param eventType - 事件类型
   * @returns 事件路由列表
   */
  async getEventRoutes(eventType: string): Promise<readonly EventRoute[]> {
    this.logger.log(
      `Getting event routes for type: ${eventType}`,
      this.context,
    );

    const routes = Array.from(this.routes.values())
      .filter((route) => route.eventType === eventType)
      .sort((a, b) => b.priority - a.priority);

    this.logger.log(
      `Retrieved ${routes.length} event routes for type ${eventType}`,
      this.context,
    );

    return routes;
  }

  /**
   * 处理事件给订阅者
   *
   * @param event - 领域事件
   * @param subscriber - 事件订阅者
   */
  private async processEventForSubscriber(
    event: DomainEvent,
    subscriber: EventSubscriber,
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // 应用过滤器
      const shouldProcess = await this.applyFilters(event);
      if (!shouldProcess) {
        this.logger.log(
          `Event filtered out for subscriber ${subscriber.name}`,
          this.context,
        );
        return;
      }

      // 调用订阅者处理器
      await subscriber.handler(event);

      const processingTime = Date.now() - startTime;
      this.recordEventProcessing(event, subscriber.id, true, processingTime);

      this.logger.log(
        `Event processed successfully by subscriber ${subscriber.name} (${processingTime}ms)`,
        this.context,
      );
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.recordEventProcessing(event, subscriber.id, false, processingTime);

      this.logger.error(
        `Error processing event for subscriber ${subscriber.name}: ${error.message}`,
        this.context,
      );

      throw error;
    }
  }

  /**
   * 应用事件过滤器
   *
   * @param event - 领域事件
   * @returns 是否应该处理事件
   */
  private async applyFilters(event: DomainEvent): Promise<boolean> {
    for (const filter of this.filters.values()) {
      try {
        if (!filter.condition(event)) {
          return false;
        }
      } catch (error) {
        this.logger.warn(
          `Error applying filter ${filter.name}: ${error.message}`,
          this.context,
        );
        // 继续处理其他过滤器
      }
    }

    return true;
  }

  /**
   * 记录事件处理
   *
   * @param event - 领域事件
   * @param subscriberId - 订阅者ID
   * @param success - 是否成功
   * @param processingTime - 处理时间
   */
  private recordEventProcessing(
    event: DomainEvent,
    subscriberId: string | undefined,
    success: boolean,
    processingTime: number,
  ): void {
    this.eventHistory.push({
      timestamp: new Date(),
      event,
      subscriberId,
      success,
      processingTime,
    });
  }
}
