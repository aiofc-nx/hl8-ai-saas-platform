/**
 * 事件处理器服务
 *
 * @description 处理CQRS模式中的事件操作
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import type { IDatabaseAdapter } from "../../interfaces/database-adapter.interface.js";
import type { IsolationContext } from "../../types/isolation.types.js";
import type { ICacheService } from "../../interfaces/cache-service.interface.js";

/**
 * 领域事件接口
 */
export interface DomainEvent {
  /** 事件ID */
  id: string;
  /** 事件类型 */
  type: string;
  /** 聚合根ID */
  aggregateId: string;
  /** 事件数据 */
  data: Record<string, any>;
  /** 事件版本 */
  version: number;
  /** 时间戳 */
  timestamp: Date;
  /** 元数据 */
  metadata?: Record<string, any>;
}

/**
 * 事件处理结果
 */
export interface EventHandleResult {
  /** 是否成功 */
  success: boolean;
  /** 处理数据 */
  data?: any;
  /** 错误信息 */
  error?: string;
  /** 处理时间(毫秒) */
  processingTime: number;
  /** 事件ID */
  eventId: string;
}

/**
 * 事件处理器接口
 */
export interface EventHandler<TEvent extends DomainEvent = DomainEvent> {
  /** 处理事件 */
  handle(event: TEvent): Promise<EventHandleResult>;
  /** 验证事件 */
  validate(event: TEvent): Promise<boolean>;
  /** 获取处理器名称 */
  getHandlerName(): string;
  /** 获取支持的事件类型 */
  getSupportedEventTypes(): string[];
}

/**
 * 事件处理器服务
 */
@Injectable()
export class EventHandlerService {
  private handlers = new Map<string, EventHandler>();
  private eventQueue: DomainEvent[] = [];
  private isProcessing = false;
  private processingStats = {
    totalProcessed: 0,
    successful: 0,
    failed: 0,
    averageProcessingTime: 0,
  };

  constructor(
    private readonly databaseAdapter: IDatabaseAdapter,
    private readonly cacheService?: ICacheService,
    private readonly isolationContext?: IsolationContext,
  ) {}

  /**
   * 注册事件处理器
   */
  registerHandler(eventType: string, handler: EventHandler): void {
    this.handlers.set(eventType, handler);
  }

  /**
   * 处理事件
   */
  async handleEvent(event: DomainEvent): Promise<EventHandleResult> {
    const startTime = Date.now();

    try {
      // 应用隔离上下文
      const isolatedEvent = this.applyIsolationContext(event);

      // 获取处理器
      const handler = this.handlers.get(event.type);
      if (!handler) {
        throw new Error(`未找到事件处理器: ${event.type}`);
      }

      // 验证事件
      const isValid = await handler.validate(isolatedEvent);
      if (!isValid) {
        throw new Error(`事件验证失败: ${event.type}`);
      }

      // 处理事件
      const result = await handler.handle(isolatedEvent);

      // 更新处理时间
      result.processingTime = Date.now() - startTime;
      result.eventId = event.id;

      // 更新统计信息
      this.updateProcessingStats(result);

      // 记录事件处理日志
      await this.logEventProcessing(event, result);

      return result;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const result: EventHandleResult = {
        success: false,
        error: error instanceof Error ? error.message : "事件处理失败",
        processingTime,
        eventId: event.id,
      };

      // 更新统计信息
      this.updateProcessingStats(result);

      return result;
    }
  }

  /**
   * 批量处理事件
   */
  async handleEvents(events: DomainEvent[]): Promise<EventHandleResult[]> {
    const results: EventHandleResult[] = [];

    for (const event of events) {
      try {
        const result = await this.handleEvent(event);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : "事件处理失败",
          processingTime: 0,
          eventId: event.id,
        });
      }
    }

    return results;
  }

  /**
   * 异步处理事件
   */
  async queueEvent(event: DomainEvent): Promise<void> {
    try {
      // 应用隔离上下文
      const isolatedEvent = this.applyIsolationContext(event);

      this.eventQueue.push(isolatedEvent);

      // 如果当前没有在处理，启动处理
      if (!this.isProcessing) {
        this.processEventQueue();
      }
    } catch (error) {
      throw new Error(
        `队列事件失败: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 处理事件队列
   */
  private async processEventQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift();
        if (event) {
          await this.handleEvent(event);
        }
      }
    } catch (error) {
      console.error("处理事件队列失败:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * 获取事件队列状态
   */
  getQueueStatus(): Record<string, any> {
    return {
      queueLength: this.eventQueue.length,
      isProcessing: this.isProcessing,
      registeredHandlers: Array.from(this.handlers.keys()),
    };
  }

  /**
   * 获取处理统计信息
   */
  getProcessingStats(): Record<string, any> {
    return {
      ...this.processingStats,
      successRate:
        this.processingStats.totalProcessed > 0
          ? this.processingStats.successful /
            this.processingStats.totalProcessed
          : 0,
    };
  }

  /**
   * 清空事件队列
   */
  clearQueue(): void {
    this.eventQueue = [];
  }

  /**
   * 获取注册的处理器
   */
  getRegisteredHandlers(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * 移除事件处理器
   */
  removeHandler(eventType: string): void {
    this.handlers.delete(eventType);
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.processingStats = {
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      averageProcessingTime: 0,
    };
  }

  /**
   * 应用隔离上下文
   */
  private applyIsolationContext(event: DomainEvent): DomainEvent {
    if (!this.isolationContext) {
      return event;
    }

    const isolatedEvent = { ...event };

    // 添加隔离信息到元数据
    if (!isolatedEvent.metadata) {
      isolatedEvent.metadata = {};
    }

    if (this.isolationContext.tenantId) {
      isolatedEvent.metadata.tenantId = this.isolationContext.tenantId;
    }

    if (this.isolationContext.organizationId) {
      isolatedEvent.metadata.organizationId =
        this.isolationContext.organizationId;
    }

    if (this.isolationContext.departmentId) {
      isolatedEvent.metadata.departmentId = this.isolationContext.departmentId;
    }

    if (this.isolationContext.userId) {
      isolatedEvent.metadata.userId = this.isolationContext.userId;
    }

    return isolatedEvent;
  }

  /**
   * 更新处理统计信息
   */
  private updateProcessingStats(result: EventHandleResult): void {
    this.processingStats.totalProcessed++;

    if (result.success) {
      this.processingStats.successful++;
    } else {
      this.processingStats.failed++;
    }

    // 更新平均处理时间
    const totalTime =
      this.processingStats.averageProcessingTime *
        (this.processingStats.totalProcessed - 1) +
      result.processingTime;
    this.processingStats.averageProcessingTime =
      totalTime / this.processingStats.totalProcessed;
  }

  /**
   * 记录事件处理日志
   */
  private async logEventProcessing(
    event: DomainEvent,
    result: EventHandleResult,
  ): Promise<void> {
    try {
      const logData = {
        eventId: event.id,
        eventType: event.type,
        aggregateId: event.aggregateId,
        success: result.success,
        processingTime: result.processingTime,
        timestamp: new Date(),
        metadata: event.metadata,
      };

      // 这里应该记录到日志系统
      console.log("事件处理日志:", logData);
    } catch (error) {
      console.error("记录事件处理日志失败:", error);
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      return await this.databaseAdapter.healthCheck();
    } catch (error) {
      return false;
    }
  }
}
