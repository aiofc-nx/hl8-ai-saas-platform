/**
 * 事件发布器
 *
 * 提供事件发布的实用工具函数
 * 支持事件序列化、批量发布和错误处理
 *
 * @since 1.0.0
 */
import { DomainEvent } from "./domain-event.interface.js";
import { IEventBus } from "./event-bus.interface.js";

/**
 * 事件发布选项
 */
export interface EventPublishOptions {
  /**
   * 是否异步发布
   */
  async?: boolean;

  /**
   * 重试次数
   */
  retryCount?: number;

  /**
   * 重试延迟（毫秒）
   */
  retryDelay?: number;

  /**
   * 超时时间（毫秒）
   */
  timeout?: number;

  /**
   * 是否验证事件
   */
  validate?: boolean;
}

/**
 * 事件发布结果
 */
export interface EventPublishResult {
  /**
   * 是否成功
   */
  success: boolean;

  /**
   * 发布的事件数量
   */
  eventCount: number;

  /**
   * 错误信息
   */
  errors?: string[];

  /**
   * 发布耗时（毫秒）
   */
  duration: number;
}

/**
 * 事件发布器类
 *
 * 提供事件发布的实用工具函数
 */
export class EventPublisher {
  /**
   * 发布单个事件
   *
   * @param eventBus - 事件总线
   * @param event - 要发布的事件
   * @param options - 发布选项
   * @returns 发布结果
   */
  static async publishEvent(
    eventBus: IEventBus,
    event: DomainEvent,
    options: EventPublishOptions = {},
  ): Promise<EventPublishResult> {
    const startTime = Date.now();
    const {
      async = true,
      retryCount = 0,
      retryDelay = 1000,
      timeout = 30000,
      validate = true,
    } = options;

    try {
      // 验证事件
      if (validate) {
        this.validateEvent(event);
      }

      // 发布事件
      if (async) {
        await this.publishEventAsync(
          eventBus,
          event,
          retryCount,
          retryDelay,
          timeout,
        );
      } else {
        await eventBus.publish(event);
      }

      const duration = Date.now() - startTime;
      return {
        success: true,
        eventCount: 1,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        eventCount: 0,
        errors: [error instanceof Error ? error.message : String(error)],
        duration,
      };
    }
  }

  /**
   * 发布多个事件
   *
   * @param eventBus - 事件总线
   * @param events - 要发布的事件数组
   * @param options - 发布选项
   * @returns 发布结果
   */
  static async publishEvents(
    eventBus: IEventBus,
    events: DomainEvent[],
    options: EventPublishOptions = {},
  ): Promise<EventPublishResult> {
    const startTime = Date.now();
    const {
      async = true,
      retryCount = 0,
      retryDelay = 1000,
      timeout = 30000,
      validate = true,
    } = options;

    try {
      // 验证事件
      if (validate) {
        events.forEach((event) => this.validateEvent(event));
      }

      // 发布事件
      if (async) {
        await this.publishEventsAsync(
          eventBus,
          events,
          retryCount,
          retryDelay,
          timeout,
        );
      } else {
        await eventBus.publishAll(events);
      }

      const duration = Date.now() - startTime;
      return {
        success: true,
        eventCount: events.length,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        eventCount: 0,
        errors: [error instanceof Error ? error.message : String(error)],
        duration,
      };
    }
  }

  /**
   * 异步发布事件
   *
   * @param eventBus - 事件总线
   * @param event - 事件
   * @param retryCount - 重试次数
   * @param retryDelay - 重试延迟
   * @param timeout - 超时时间
   */
  private static async publishEventAsync(
    eventBus: IEventBus,
    event: DomainEvent,
    retryCount: number,
    retryDelay: number,
    timeout: number,
  ): Promise<void> {
    const publishPromise = this.publishWithRetry(
      eventBus,
      event,
      retryCount,
      retryDelay,
    );
    const timeoutPromise = this.createTimeoutPromise(timeout);

    await Promise.race([publishPromise, timeoutPromise]);
  }

  /**
   * 异步发布多个事件
   *
   * @param eventBus - 事件总线
   * @param events - 事件数组
   * @param retryCount - 重试次数
   * @param retryDelay - 重试延迟
   * @param timeout - 超时时间
   */
  private static async publishEventsAsync(
    eventBus: IEventBus,
    events: DomainEvent[],
    retryCount: number,
    retryDelay: number,
    timeout: number,
  ): Promise<void> {
    const publishPromise = this.publishAllWithRetry(
      eventBus,
      events,
      retryCount,
      retryDelay,
    );
    const timeoutPromise = this.createTimeoutPromise(timeout);

    await Promise.race([publishPromise, timeoutPromise]);
  }

  /**
   * 带重试的事件发布
   *
   * @param eventBus - 事件总线
   * @param event - 事件
   * @param retryCount - 重试次数
   * @param retryDelay - 重试延迟
   */
  private static async publishWithRetry(
    eventBus: IEventBus,
    event: DomainEvent,
    retryCount: number,
    retryDelay: number,
  ): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        await eventBus.publish(event);
        return;
      } catch (error) {
        lastError = error as Error;

        if (attempt < retryCount) {
          await this.delay(retryDelay * Math.pow(2, attempt)); // 指数退避
        }
      }
    }

    throw lastError || new Error("事件发布失败");
  }

  /**
   * 带重试的批量事件发布
   *
   * @param eventBus - 事件总线
   * @param events - 事件数组
   * @param retryCount - 重试次数
   * @param retryDelay - 重试延迟
   */
  private static async publishAllWithRetry(
    eventBus: IEventBus,
    events: DomainEvent[],
    retryCount: number,
    retryDelay: number,
  ): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        await eventBus.publishAll(events);
        return;
      } catch (error) {
        lastError = error as Error;

        if (attempt < retryCount) {
          await this.delay(retryDelay * Math.pow(2, attempt)); // 指数退避
        }
      }
    }

    throw lastError || new Error("批量事件发布失败");
  }

  /**
   * 验证事件
   *
   * @param event - 事件
   */
  private static validateEvent(event: DomainEvent): void {
    if (!event.eventId) {
      throw new Error("事件ID不能为空");
    }

    if (!event.eventType || event.eventType.trim() === "") {
      throw new Error("事件类型不能为空");
    }

    if (!event.occurredAt || !(event.occurredAt instanceof Date)) {
      throw new Error("事件发生时间必须是有效的日期对象");
    }

    if (!event.aggregateId) {
      throw new Error("聚合根ID不能为空");
    }

    if (typeof event.version !== "number" || event.version < 0) {
      throw new Error("事件版本必须是大于等于0的数字");
    }

    if (!event.eventData || typeof event.eventData !== "object") {
      throw new Error("事件数据必须是对象");
    }
  }

  /**
   * 创建超时Promise
   *
   * @param timeout - 超时时间（毫秒）
   * @returns 超时Promise
   */
  private static createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`事件发布超时: ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * 延迟执行
   *
   * @param ms - 延迟时间（毫秒）
   * @returns Promise
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
