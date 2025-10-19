/**
 * 简化的性能监控工具
 *
 * @description 提供简单直接的性能监控功能，替代复杂的指标收集
 *
 * @since 1.0.0
 */

/**
 * 性能监控器
 *
 * @description 简单的性能监控器，用于测量操作延迟
 */
export class PerformanceMonitorClass {
  private startTime: number = 0;

  /**
   * 开始监控
   *
   * @description 开始性能监控
   *
   * @example
   * ```typescript
   * const monitor = new PerformanceMonitor();
   * monitor.start();
   *
   * // 执行操作
   * const result = await cacheService.get('user', '123');
   *
   * const latency = monitor.end();
   * console.log(`操作延迟: ${latency}ms`);
   * ```
   */
  start(): void {
    this.startTime = Date.now();
  }

  /**
   * 结束监控
   *
   * @description 结束性能监控并返回延迟
   *
   * @returns 操作延迟（毫秒）
   *
   * @example
   * ```typescript
   * const latency = monitor.end();
   * if (latency > 100) {
   *   console.warn('操作延迟过高');
   * }
   * ```
   */
  end(): number {
    if (this.startTime === 0) {
      return 0;
    }

    const latency = Date.now() - this.startTime;
    this.startTime = 0;
    return latency;
  }

  /**
   * 获取当前延迟
   *
   * @description 获取当前监控的延迟，不结束监控
   *
   * @returns 当前延迟（毫秒）
   *
   * @example
   * ```typescript
   * const currentLatency = monitor.getCurrentLatency();
   * if (currentLatency > 1000) {
   *   console.warn('操作超时');
   * }
   * ```
   */
  getCurrentLatency(): number {
    if (this.startTime === 0) {
      return 0;
    }

    return Date.now() - this.startTime;
  }

  /**
   * 重置监控器
   *
   * @description 重置监控器状态
   *
   * @example
   * ```typescript
   * monitor.reset();
   * monitor.start();
   * ```
   */
  reset(): void {
    this.startTime = 0;
  }
}

/**
 * 性能统计器
 *
 * @description 简单的性能统计器，用于收集和计算性能指标
 */
export class PerformanceStats {
  private hits = 0;
  private misses = 0;
  private errors = 0;
  private totalLatency = 0;
  private operationCount = 0;

  /**
   * 记录命中
   *
   * @description 记录缓存命中事件
   *
   * @param latency - 操作延迟（毫秒）
   *
   * @example
   * ```typescript
   * stats.recordHit(50);
   * ```
   */
  recordHit(latency: number): void {
    this.hits++;
    this.totalLatency += latency;
    this.operationCount++;
  }

  /**
   * 记录未命中
   *
   * @description 记录缓存未命中事件
   *
   * @param latency - 操作延迟（毫秒）
   *
   * @example
   * ```typescript
   * stats.recordMiss(100);
   * ```
   */
  recordMiss(latency: number): void {
    this.misses++;
    this.totalLatency += latency;
    this.operationCount++;
  }

  /**
   * 记录错误
   *
   * @description 记录缓存操作错误
   *
   * @param latency - 操作延迟（毫秒）
   *
   * @example
   * ```typescript
   * stats.recordError(200);
   * ```
   */
  recordError(latency: number): void {
    this.errors++;
    this.totalLatency += latency;
    this.operationCount++;
  }

  /**
   * 获取统计信息
   *
   * @description 获取当前性能统计信息
   *
   * @returns 性能统计信息
   *
   * @example
   * ```typescript
   * const stats = performanceStats.getStats();
   * console.log(`命中率: ${stats.hitRate.toFixed(2)}%`);
   * ```
   */
  getStats(): {
    hits: number;
    misses: number;
    errors: number;
    hitRate: number;
    averageLatency: number;
    totalOperations: number;
    totalLatency: number;
  } {
    const totalOperations = this.hits + this.misses + this.errors;
    const hitRate =
      totalOperations > 0 ? (this.hits / totalOperations) * 100 : 0;
    const averageLatency =
      totalOperations > 0 ? this.totalLatency / totalOperations : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      errors: this.errors,
      hitRate,
      averageLatency,
      totalOperations,
      totalLatency: this.totalLatency,
    };
  }

  /**
   * 重置统计信息
   *
   * @description 重置所有性能统计信息
   *
   * @example
   * ```typescript
   * stats.reset();
   * ```
   */
  reset(): void {
    this.hits = 0;
    this.misses = 0;
    this.errors = 0;
    this.totalLatency = 0;
    this.operationCount = 0;
  }
}

/**
 * 性能阈值检查器
 *
 * @description 简单的性能阈值检查器，用于监控性能是否在正常范围内
 */
export class PerformanceThresholdChecker {
  private hitRateThreshold: number;
  private latencyThreshold: number;

  constructor(hitRateThreshold: number = 80, latencyThreshold: number = 100) {
    this.hitRateThreshold = hitRateThreshold;
    this.latencyThreshold = latencyThreshold;
  }

  /**
   * 检查性能是否健康
   *
   * @description 检查性能指标是否在正常范围内
   *
   * @param stats - 性能统计信息
   * @returns 如果性能健康返回 true，否则返回 false
   *
   * @example
   * ```typescript
   * const isHealthy = checker.isHealthy(stats);
   * if (!isHealthy) {
   *   console.warn('性能异常');
   * }
   * ```
   */
  isHealthy(stats: ReturnType<PerformanceStats["getStats"]>): boolean {
    return (
      stats.hitRate >= this.hitRateThreshold &&
      stats.averageLatency <= this.latencyThreshold
    );
  }

  /**
   * 检查命中率是否正常
   *
   * @description 检查命中率是否在正常范围内
   *
   * @param hitRate - 命中率
   * @returns 如果命中率正常返回 true，否则返回 false
   *
   * @example
   * ```typescript
   * if (checker.isHitRateHealthy(stats.hitRate)) {
   *   console.log('命中率正常');
   * }
   * ```
   */
  isHitRateHealthy(hitRate: number): boolean {
    return hitRate >= this.hitRateThreshold;
  }

  /**
   * 检查延迟是否正常
   *
   * @description 检查延迟是否在正常范围内
   *
   * @param latency - 延迟
   * @returns 如果延迟正常返回 true，否则返回 false
   *
   * @example
   * ```typescript
   * if (checker.isLatencyHealthy(stats.averageLatency)) {
   *   console.log('延迟正常');
   * }
   * ```
   */
  isLatencyHealthy(latency: number): boolean {
    return latency <= this.latencyThreshold;
  }

  /**
   * 设置阈值
   *
   * @description 设置性能阈值
   *
   * @param hitRateThreshold - 命中率阈值
   * @param latencyThreshold - 延迟阈值
   *
   * @example
   * ```typescript
   * checker.setThresholds(90, 50);
   * ```
   */
  setThresholds(hitRateThreshold: number, latencyThreshold: number): void {
    this.hitRateThreshold = hitRateThreshold;
    this.latencyThreshold = latencyThreshold;
  }
}

/**
 * 性能监控装饰器
 *
 * @description 简单的性能监控装饰器，用于自动监控方法执行时间
 *
 * @param metricsService - 指标服务
 * @param operationType - 操作类型
 * @returns 装饰器函数
 *
 * @example
 * ```typescript
 * @PerformanceMonitor(metricsService, 'get')
 * async get<T>(namespace: string, key: string): Promise<T | undefined> {
 *   // 方法实现
 * }
 * ```
 */
export function PerformanceMonitor(
  metricsService: any,
  _operationType: "get" | "set" | "del" | "exists" | "clear",
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      let result: any;
      let error: any;

      try {
        result = await method.apply(this, args);
        return result;
      } catch (err) {
        error = err;
        throw err;
      } finally {
        const latency = Date.now() - startTime;

        if (error) {
          metricsService.recordError(latency);
        } else if (result === undefined) {
          metricsService.recordMiss(latency);
        } else {
          metricsService.recordHit(latency);
        }
      }
    };
  };
}
