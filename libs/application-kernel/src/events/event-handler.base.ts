/**
 * 事件处理器基类
 *
 * 提供事件处理器的抽象基类
 * 支持事件处理、错误处理和重试机制
 *
 * @since 1.0.0
 */
import { DomainEvent } from "./domain-event.interface.js";
import { GeneralBadRequestException } from "@hl8/exceptions";

/**
 * 事件处理选项
 */
export interface EventHandlerOptions {
  /**
   * 是否异步处理
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
 * 事件处理结果
 */
export interface EventHandleResult {
  /**
   * 是否成功
   */
  success: boolean;

  /**
   * 错误信息
   */
  error?: Error;

  /**
   * 处理耗时（毫秒）
   */
  duration: number;

  /**
   * 重试次数
   */
  retryCount: number;
}

/**
 * 事件处理器基类
 *
 * 提供事件处理器的抽象基类
 */
export abstract class BaseEventHandler {
  /**
   * 事件处理器名称
   */
  protected readonly handlerName: string;

  /**
   * 事件处理器描述
   */
  protected readonly handlerDescription: string;

  /**
   * 事件处理器版本
   */
  protected readonly handlerVersion: string;

  /**
   * 支持的事件类型
   */
  protected readonly supportedEventTypes: string[];

  /**
   * 处理选项
   */
  protected readonly options: EventHandlerOptions;

  constructor(
    handlerName: string,
    handlerDescription: string,
    supportedEventTypes: string[],
    handlerVersion: string = "1.0.0",
    options: EventHandlerOptions = {},
  ) {
    this.handlerName = handlerName;
    this.handlerDescription = handlerDescription;
    this.supportedEventTypes = supportedEventTypes;
    this.handlerVersion = handlerVersion;
    this.options = {
      async: true,
      retryCount: 0,
      retryDelay: 1000,
      timeout: 30000,
      validate: true,
      ...options,
    };
  }

  /**
   * 处理事件
   *
   * @param event - 事件
   * @returns 处理结果
   */
  async handle(event: DomainEvent): Promise<EventHandleResult> {
    const startTime = Date.now();
    const {
      async = true,
      retryCount = 0,
      retryDelay = 1000,
      timeout = 30000,
      validate = true,
    } = this.options;

    try {
      // 验证事件
      if (validate) {
        this.validateEvent(event);
      }

      // 检查是否支持该事件类型
      if (!this.canHandle(event)) {
        throw new GeneralBadRequestException(
          "应用层不支持的事件类型",
          `不支持的事件类型: ${event.eventType}`,
          {
            eventType: event.eventType,
            eventId: event.eventId,
            handlerName: this.handlerName,
          }
        );
      }

      // 处理事件
      if (async) {
        await this.handleEventAsync(event, retryCount, retryDelay, timeout);
      } else {
        await this.handleEventSync(event);
      }

      const duration = Date.now() - startTime;
      return {
        success: true,
        duration,
        retryCount: 0,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        error: error as Error,
        duration,
        retryCount: 0,
      };
    }
  }

  /**
   * 检查是否可以处理事件
   *
   * @param event - 事件
   * @returns 是否可以处理
   */
  canHandle(event: DomainEvent): boolean {
    return this.supportedEventTypes.includes(event.eventType);
  }

  /**
   * 获取处理器信息
   *
   * @returns 处理器信息
   */
  getHandlerInfo(): {
    name: string;
    description: string;
    version: string;
    supportedEventTypes: string[];
    options: EventHandlerOptions;
  } {
    return {
      name: this.handlerName,
      description: this.handlerDescription,
      version: this.handlerVersion,
      supportedEventTypes: this.supportedEventTypes,
      options: this.options,
    };
  }

  /**
   * 处理事件（同步）
   *
   * @param event - 事件
   */
  protected async handleEventSync(event: DomainEvent): Promise<void> {
    await this.processEvent(event);
  }

  /**
   * 处理事件（异步）
   *
   * @param event - 事件
   * @param retryCount - 重试次数
   * @param retryDelay - 重试延迟
   * @param timeout - 超时时间
   */
  protected async handleEventAsync(
    event: DomainEvent,
    retryCount: number,
    retryDelay: number,
    timeout: number,
  ): Promise<void> {
    const processPromise = this.processEventWithRetry(
      event,
      retryCount,
      retryDelay,
    );
    const timeoutPromise = this.createTimeoutPromise(timeout);

    await Promise.race([processPromise, timeoutPromise]);
  }

  /**
   * 带重试的事件处理
   *
   * @param event - 事件
   * @param retryCount - 重试次数
   * @param retryDelay - 重试延迟
   */
  protected async processEventWithRetry(
    event: DomainEvent,
    retryCount: number,
    retryDelay: number,
  ): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        await this.processEvent(event);
        return;
      } catch (error) {
        lastError = error as Error;

        if (attempt < retryCount) {
          await this.delay(retryDelay * Math.pow(2, attempt)); // 指数退避
        }
      }
    }

    throw lastError || new GeneralBadRequestException(
      "应用层事件处理失败",
      "事件处理失败",
      { handlerName: this.handlerName }
    );
  }

  /**
   * 验证事件
   *
   * @param event - 事件
   */
  protected validateEvent(event: DomainEvent): void {
    if (!event.eventId) {
      throw new GeneralBadRequestException(
        "应用层事件ID验证失败",
        "事件ID不能为空",
        { eventType: event.eventType }
      );
    }

    if (!event.eventType || event.eventType.trim() === "") {
      throw new GeneralBadRequestException(
        "应用层事件类型验证失败",
        "事件类型不能为空",
        { eventId: event.eventId }
      );
    }

    if (!event.occurredAt || !(event.occurredAt instanceof Date)) {
      throw new GeneralBadRequestException(
        "应用层事件时间验证失败",
        "事件发生时间必须是有效的日期对象",
        { eventId: event.eventId, eventType: event.eventType }
      );
    }

    if (!event.aggregateId) {
      throw new GeneralBadRequestException(
        "应用层聚合根ID验证失败",
        "聚合根ID不能为空",
        { eventId: event.eventId, eventType: event.eventType }
      );
    }

    if (typeof event.version !== "number" || event.version < 0) {
      throw new GeneralBadRequestException(
        "应用层事件版本验证失败",
        "事件版本必须是大于等于0的数字",
        { eventId: event.eventId, eventType: event.eventType, eventVersion: event.version }
      );
    }

    if (!event.eventData || typeof event.eventData !== "object") {
      throw new GeneralBadRequestException(
        "应用层事件数据验证失败",
        "事件数据必须是对象",
        { eventId: event.eventId, eventType: event.eventType, dataType: typeof event.eventData }
      );
    }
  }

  /**
   * 处理事件（抽象方法）
   *
   * @param event - 事件
   */
  protected abstract processEvent(event: DomainEvent): Promise<void>;

  /**
   * 创建超时Promise
   *
   * @param timeout - 超时时间（毫秒）
   * @returns 超时Promise
   */
  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`事件处理超时: ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * 延迟执行
   *
   * @param ms - 延迟时间（毫秒）
   * @returns Promise
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
