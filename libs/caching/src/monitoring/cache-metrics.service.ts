/**
 * 简化的缓存指标服务
 *
 * @description 提供简单直接的性能监控，替代复杂的指标收集
 *
 * @since 1.0.0
 */

import { Injectable, Logger } from "@nestjs/common";

/**
 * 简化的缓存指标接口
 *
 * @description 简化的缓存性能指标
 */
export interface SimplifiedCacheMetrics {
  /** 命中次数 */
  hits: number;
  /** 未命中次数 */
  misses: number;
  /** 错误次数 */
  errors: number;
  /** 命中率 */
  hitRate: number;
  /** 平均延迟（毫秒） */
  averageLatency: number;
  /** 总操作次数 */
  totalOperations: number;
  /** 总延迟（毫秒） */
  totalLatency: number;
}

/**
 * 简化的缓存指标服务
 *
 * @description 提供简单直接的性能监控
 */
@Injectable()
export class SimplifiedCacheMetricsService {
  private readonly logger = new Logger(SimplifiedCacheMetricsService.name);
  private hits = 0;
  private misses = 0;
  private errors = 0;
  private totalLatency = 0;
  private operationCount = 0;

  /**
   * 记录缓存命中
   *
   * @description 记录缓存命中事件
   *
   * @param latency - 操作延迟（毫秒）
   *
   * @example
   * ```typescript
   * const start = Date.now();
   * const value = await cacheService.get('user', '123');
   * const latency = Date.now() - start;
   *
   * if (value !== undefined) {
   *   metricsService.recordHit(latency);
   * }
   * ```
   */
  recordHit(latency: number): void {
    this.hits++;
    this.totalLatency += latency;
    this.operationCount++;

    if (this.shouldLogMetrics()) {
      this.logger.debug(`缓存命中: 延迟 ${latency}ms`);
    }
  }

  /**
   * 记录缓存未命中
   *
   * @description 记录缓存未命中事件
   *
   * @param latency - 操作延迟（毫秒）
   *
   * @example
   * ```typescript
   * const start = Date.now();
   * const value = await cacheService.get('user', '123');
   * const latency = Date.now() - start;
   *
   * if (value === undefined) {
   *   metricsService.recordMiss(latency);
   * }
   * ```
   */
  recordMiss(latency: number): void {
    this.misses++;
    this.totalLatency += latency;
    this.operationCount++;

    if (this.shouldLogMetrics()) {
      this.logger.debug(`缓存未命中: 延迟 ${latency}ms`);
    }
  }

  /**
   * 记录缓存错误
   *
   * @description 记录缓存操作错误
   *
   * @param latency - 操作延迟（毫秒）
   *
   * @example
   * ```typescript
   * try {
   *   await cacheService.set('user', '123', user);
   * } catch (error) {
   *   metricsService.recordError(Date.now() - start);
   * }
   * ```
   */
  recordError(latency: number): void {
    this.errors++;
    this.totalLatency += latency;
    this.operationCount++;

    if (this.shouldLogMetrics()) {
      this.logger.warn(`缓存错误: 延迟 ${latency}ms`);
    }
  }

  /**
   * 获取缓存指标
   *
   * @description 获取当前缓存性能指标
   *
   * @returns 缓存指标
   *
   * @example
   * ```typescript
   * const metrics = metricsService.getMetrics();
   * console.log(`命中率: ${metrics.hitRate.toFixed(2)}%`);
   * console.log(`平均延迟: ${metrics.averageLatency.toFixed(2)}ms`);
   * ```
   */
  getMetrics(): SimplifiedCacheMetrics {
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
   * 重置指标
   *
   * @description 重置所有性能指标
   *
   * @example
   * ```typescript
   * metricsService.reset();
   * console.log('指标已重置');
   * ```
   */
  reset(): void {
    this.hits = 0;
    this.misses = 0;
    this.errors = 0;
    this.totalLatency = 0;
    this.operationCount = 0;

    this.logger.log("缓存指标已重置");
  }

  /**
   * 记录指标摘要
   *
   * @description 记录当前指标摘要到日志
   *
   * @example
   * ```typescript
   * metricsService.logSummary();
   * // 输出: 缓存指标摘要: 命中率 85.5%, 平均延迟 12.3ms, 总操作 1000
   * ```
   */
  logSummary(): void {
    const metrics = this.getMetrics();
    this.logger.log(
      `缓存指标摘要: 命中率 ${metrics.hitRate.toFixed(2)}%, 平均延迟 ${metrics.averageLatency.toFixed(2)}ms, 总操作 ${metrics.totalOperations}`,
    );
  }

  /**
   * 检查是否应该记录指标日志
   *
   * @description 根据操作频率决定是否记录详细日志
   *
   * @returns 如果应该记录日志返回 true，否则返回 false
   * @private
   */
  private shouldLogMetrics(): boolean {
    // 每 100 次操作记录一次日志
    return this.operationCount % 100 === 0;
  }

  /**
   * 获取命中率
   *
   * @description 获取当前命中率
   *
   * @returns 命中率（0-100）
   *
   * @example
   * ```typescript
   * const hitRate = metricsService.getHitRate();
   * if (hitRate < 80) {
   *   console.warn('缓存命中率过低');
   * }
   * ```
   */
  getHitRate(): number {
    const metrics = this.getMetrics();
    return metrics.hitRate;
  }

  /**
   * 获取平均延迟
   *
   * @description 获取当前平均延迟
   *
   * @returns 平均延迟（毫秒）
   *
   * @example
   * ```typescript
   * const avgLatency = metricsService.getAverageLatency();
   * if (avgLatency > 100) {
   *   console.warn('缓存延迟过高');
   * }
   * ```
   */
  getAverageLatency(): number {
    const metrics = this.getMetrics();
    return metrics.averageLatency;
  }

  /**
   * 检查性能是否正常
   *
   * @description 检查缓存性能是否在正常范围内
   *
   * @param hitRateThreshold - 命中率阈值（默认 80%）
   * @param latencyThreshold - 延迟阈值（默认 100ms）
   * @returns 如果性能正常返回 true，否则返回 false
   *
   * @example
   * ```typescript
   * const isHealthy = metricsService.isPerformanceHealthy();
   * if (!isHealthy) {
   *   console.warn('缓存性能异常');
   * }
   * ```
   */
  isPerformanceHealthy(
    hitRateThreshold: number = 80,
    latencyThreshold: number = 100,
  ): boolean {
    const metrics = this.getMetrics();
    return (
      metrics.hitRate >= hitRateThreshold &&
      metrics.averageLatency <= latencyThreshold
    );
  }
}
