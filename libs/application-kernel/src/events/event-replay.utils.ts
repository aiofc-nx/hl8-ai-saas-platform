/**
 * 事件重放工具
 *
 * 提供事件重放的实用工具函数
 * 支持事件重放、状态恢复和回放控制
 *
 * @since 1.0.0
 */
import { DomainEvent } from "./domain-event.interface.js";
import { EntityId } from "@hl8/domain-kernel";

/**
 * 重放选项
 */
export interface ReplayOptions {
  /**
   * 是否并行处理
   */
  parallel?: boolean;

  /**
   * 并行度（当parallel为true时）
   */
  concurrency?: number;

  /**
   * 批处理大小
   */
  batchSize?: number;

  /**
   * 是否验证事件
   */
  validate?: boolean;

  /**
   * 是否跳过错误
   */
  skipErrors?: boolean;

  /**
   * 重放进度回调
   */
  onProgress?: (progress: ReplayProgress) => void;
}

/**
 * 重放进度
 */
export interface ReplayProgress {
  /**
   * 已处理事件数
   */
  processed: number;

  /**
   * 总事件数
   */
  total: number;

  /**
   * 进度百分比
   */
  percentage: number;

  /**
   * 当前处理的事件
   */
  currentEvent?: DomainEvent;

  /**
   * 错误数量
   */
  errorCount: number;
}

/**
 * 重放结果
 */
export interface ReplayResult<T = Record<string, unknown>> {
  /**
   * 是否成功
   */
  success: boolean;

  /**
   * 处理的事件数量
   */
  processedCount: number;

  /**
   * 错误数量
   */
  errorCount: number;

  /**
   * 错误列表
   */
  errors: Error[];

  /**
   * 重放耗时（毫秒）
   */
  duration: number;

  /**
   * 最终状态
   */
  finalState?: T;
}

/**
 * 事件重放工具类
 *
 * 提供事件重放的实用工具函数
 */
export class EventReplayUtils {
  /**
   * 重放事件序列
   *
   * @param events - 事件数组
   * @param eventHandler - 事件处理器
   * @param initialState - 初始状态
   * @param options - 重放选项
   * @returns 重放结果
   */
  static async replayEvents<T>(
    events: DomainEvent[],
    eventHandler: (state: T, event: DomainEvent) => Promise<T>,
    initialState: T,
    options: ReplayOptions = {},
  ): Promise<ReplayResult<T>> {
    const startTime = Date.now();
    const {
      parallel = false,
      concurrency = 4,
      batchSize = 100,
      validate = true,
      skipErrors = false,
      onProgress,
    } = options;

    const errors: Error[] = [];
    let processedCount = 0;
    let errorCount = 0;
    let currentState = initialState;

    try {
      // 验证事件
      if (validate) {
        this.validateEvents(events);
      }

      // 按版本排序事件
      const sortedEvents = events.sort((a, b) => a.version - b.version);

      if (parallel) {
        // 并行重放
        const result = await this.replayEventsParallel(
          sortedEvents,
          eventHandler,
          currentState,
          concurrency,
          batchSize,
          skipErrors,
          onProgress,
        );

        processedCount = result.processedCount;
        errorCount = result.errorCount;
        errors.push(...result.errors);
        currentState = result.finalState;
      } else {
        // 顺序重放
        const result = await this.replayEventsSequential(
          sortedEvents,
          eventHandler,
          currentState,
          skipErrors,
          onProgress,
        );

        processedCount = result.processedCount;
        errorCount = result.errorCount;
        errors.push(...result.errors);
        currentState = result.finalState;
      }

      const duration = Date.now() - startTime;
      return {
        success: errorCount === 0,
        processedCount,
        errorCount,
        errors,
        duration,
        finalState: currentState,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        processedCount,
        errorCount: errorCount + 1,
        errors: [...errors, error as Error],
        duration,
        finalState: currentState,
      };
    }
  }

  /**
   * 顺序重放事件
   *
   * @param events - 事件数组
   * @param eventHandler - 事件处理器
   * @param initialState - 初始状态
   * @param skipErrors - 是否跳过错误
   * @param onProgress - 进度回调
   * @returns 重放结果
   */
  private static async replayEventsSequential<T>(
    events: DomainEvent[],
    eventHandler: (state: T, event: DomainEvent) => Promise<T>,
    initialState: T,
    skipErrors: boolean,
    onProgress?: (progress: ReplayProgress) => void,
  ): Promise<{
    processedCount: number;
    errorCount: number;
    errors: Error[];
    finalState: T;
  }> {
    const errors: Error[] = [];
    let processedCount = 0;
    let errorCount = 0;
    let currentState = initialState;

    for (const event of events) {
      try {
        currentState = await eventHandler(currentState, event);
        processedCount++;
      } catch (error) {
        errorCount++;
        const errorObj = error as Error;
        errors.push(errorObj);

        if (!skipErrors) {
          throw errorObj;
        }
      }

      // 报告进度
      if (onProgress) {
        onProgress({
          processed: processedCount,
          total: events.length,
          percentage: (processedCount / events.length) * 100,
          currentEvent: event,
          errorCount,
        });
      }
    }

    return {
      processedCount,
      errorCount,
      errors,
      finalState: currentState,
    };
  }

  /**
   * 并行重放事件
   *
   * @param events - 事件数组
   * @param eventHandler - 事件处理器
   * @param initialState - 初始状态
   * @param concurrency - 并行度
   * @param batchSize - 批处理大小
   * @param skipErrors - 是否跳过错误
   * @param onProgress - 进度回调
   * @returns 重放结果
   */
  private static async replayEventsParallel<T>(
    events: DomainEvent[],
    eventHandler: (state: T, event: DomainEvent) => Promise<T>,
    initialState: T,
    concurrency: number,
    batchSize: number,
    skipErrors: boolean,
    onProgress?: (progress: ReplayProgress) => void,
  ): Promise<{
    processedCount: number;
    errorCount: number;
    errors: Error[];
    finalState: T;
  }> {
    const errors: Error[] = [];
    let processedCount = 0;
    let errorCount = 0;
    let currentState = initialState;

    // 分批处理事件
    const batches = this.createBatches(events, batchSize);

    for (const batch of batches) {
      const batchPromises = batch.map(async (event) => {
        try {
          const newState = await eventHandler(currentState, event);
          return { success: true, state: newState, event };
        } catch (error) {
          return { success: false, error: error as Error, event };
        }
      });

      const batchResults = await Promise.all(batchPromises);

      for (const result of batchResults) {
        if (result.success) {
          currentState = result.state;
          processedCount++;
        } else {
          errorCount++;
          errors.push(result.error);

          if (!skipErrors) {
            throw result.error;
          }
        }

        // 报告进度
        if (onProgress) {
          onProgress({
            processed: processedCount,
            total: events.length,
            percentage: (processedCount / events.length) * 100,
            currentEvent: result.event,
            errorCount,
          });
        }
      }
    }

    return {
      processedCount,
      errorCount,
      errors,
      finalState: currentState,
    };
  }

  /**
   * 重放事件到指定版本
   *
   * @param events - 事件数组
   * @param eventHandler - 事件处理器
   * @param initialState - 初始状态
   * @param targetVersion - 目标版本
   * @param options - 重放选项
   * @returns 重放结果
   */
  static async replayEventsToVersion<T>(
    events: DomainEvent[],
    eventHandler: (state: T, event: DomainEvent) => Promise<T>,
    initialState: T,
    targetVersion: number,
    options: ReplayOptions = {},
  ): Promise<ReplayResult<T>> {
    // 过滤到目标版本的事件
    const filteredEvents = events.filter(
      (event) => event.version <= targetVersion,
    );

    return this.replayEvents(
      filteredEvents,
      eventHandler,
      initialState,
      options,
    );
  }

  /**
   * 重放事件在指定时间范围内
   *
   * @param events - 事件数组
   * @param eventHandler - 事件处理器
   * @param initialState - 初始状态
   * @param startTime - 开始时间
   * @param endTime - 结束时间
   * @param options - 重放选项
   * @returns 重放结果
   */
  static async replayEventsInTimeRange<T>(
    events: DomainEvent[],
    eventHandler: (state: T, event: DomainEvent) => Promise<T>,
    initialState: T,
    startTime: Date,
    endTime: Date,
    options: ReplayOptions = {},
  ): Promise<ReplayResult<T>> {
    // 过滤时间范围内的事件
    const filteredEvents = events.filter(
      (event) => event.occurredAt >= startTime && event.occurredAt <= endTime,
    );

    return this.replayEvents(
      filteredEvents,
      eventHandler,
      initialState,
      options,
    );
  }

  /**
   * 重放事件按聚合根
   *
   * @param events - 事件数组
   * @param eventHandler - 事件处理器
   * @param initialState - 初始状态
   * @param aggregateId - 聚合根ID
   * @param options - 重放选项
   * @returns 重放结果
   */
  static async replayEventsByAggregate<T>(
    events: DomainEvent[],
    eventHandler: (state: T, event: DomainEvent) => Promise<T>,
    initialState: T,
    aggregateId: EntityId,
    options: ReplayOptions = {},
  ): Promise<ReplayResult<T>> {
    // 过滤指定聚合根的事件
    const filteredEvents = events.filter((event) =>
      event.aggregateId.equals(aggregateId),
    );

    return this.replayEvents(
      filteredEvents,
      eventHandler,
      initialState,
      options,
    );
  }

  /**
   * 验证事件
   *
   * @param events - 事件数组
   */
  private static validateEvents(events: DomainEvent[]): void {
    if (events.length === 0) {
      return;
    }

    // 按聚合根分组
    const eventsByAggregate = new Map<string, DomainEvent[]>();
    for (const event of events) {
      const aggregateId = event.aggregateId.getValue();
      if (!eventsByAggregate.has(aggregateId)) {
        eventsByAggregate.set(aggregateId, []);
      }
      eventsByAggregate.get(aggregateId)!.push(event);
    }

    // 验证每个聚合根的事件序列
    for (const [aggregateId, aggregateEvents] of eventsByAggregate) {
      const sortedEvents = aggregateEvents.sort(
        (a, b) => a.version - b.version,
      );

      for (let i = 0; i < sortedEvents.length; i++) {
        const currentEvent = sortedEvents[i];
        const expectedVersion = i + 1;

        if (currentEvent.version !== expectedVersion) {
          throw new Error(
            `聚合根 ${aggregateId} 的事件版本不连续: 期望 ${expectedVersion}, 实际 ${currentEvent.version}`,
          );
        }
      }
    }
  }

  /**
   * 创建批次
   *
   * @param items - 项目数组
   * @param batchSize - 批次大小
   * @returns 批次数组
   */
  private static createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];

    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    return batches;
  }
}
