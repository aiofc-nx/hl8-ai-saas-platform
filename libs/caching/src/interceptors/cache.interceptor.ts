/**
 * 简化的缓存拦截器
 *
 * @description 提供简单直接的缓存拦截器，替代复杂的 DDD 实现
 *
 * @since 1.0.0
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, of } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { SimplifiedCacheService } from "../services/cache.service.js";
import { SimplifiedCacheMetricsService } from "../monitoring/cache-metrics.service.js";
import {
  generateCacheKey,
  checkCacheCondition,
  shouldCacheValue,
} from "../decorators/cacheable.decorator.js";

/**
 * 简化的缓存拦截器
 *
 * @description 处理缓存装饰器的拦截器，支持多层级隔离
 */
@Injectable()
export class SimplifiedCacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SimplifiedCacheInterceptor.name);

  constructor(
    private readonly cacheService: SimplifiedCacheService,
    private readonly metricsService: SimplifiedCacheMetricsService,
    private readonly reflector: Reflector,
  ) {}

  /**
   * 拦截方法调用
   *
   * @description 处理缓存逻辑
   *
   * @param context - 执行上下文
   * @param next - 下一个处理器
   * @returns 处理结果
   */
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const handler = context.getHandler();
    const _className = context.getClass().name;
    const _methodName = handler.name;

    // 检查是否有缓存元数据
    const cacheableMetadata = this.reflector.get("cacheable", handler);
    const cacheEvictMetadata = this.reflector.get("cacheEvict", handler);
    const cachePutMetadata = this.reflector.get("cachePut", handler);

    if (cacheableMetadata) {
      return this.handleCacheable(context, next, cacheableMetadata);
    }

    if (cacheEvictMetadata) {
      return this.handleCacheEvict(context, next, cacheEvictMetadata);
    }

    if (cachePutMetadata) {
      return this.handleCachePut(context, next, cachePutMetadata);
    }

    // 没有缓存元数据，直接执行
    return next.handle();
  }

  /**
   * 处理 @Cacheable 装饰器
   *
   * @description 处理缓存获取逻辑
   *
   * @param context - 执行上下文
   * @param next - 下一个处理器
   * @param metadata - 缓存元数据
   * @returns 处理结果
   * @private
   */
  private async handleCacheable(
    context: ExecutionContext,
    next: CallHandler,
    metadata: any,
  ): Promise<Observable<any>> {
    const { namespace, options } = metadata;
    const args = context.getArgs();
    const startTime = Date.now();

    try {
      // 检查缓存条件
      if (!checkCacheCondition(args, options.condition)) {
        this.logger.debug(`缓存条件不满足，跳过缓存: ${namespace}`);
        return next.handle();
      }

      // 生成缓存键
      const key = generateCacheKey(namespace, args, options.keyGenerator);

      // 尝试从缓存获取
      const cachedValue = await this.cacheService.get(key, "");

      if (cachedValue !== undefined) {
        // 缓存命中
        const latency = Date.now() - startTime;
        this.metricsService.recordHit(latency);
        this.logger.debug(`缓存命中: ${key}`);
        return of(cachedValue);
      }

      // 缓存未命中，执行方法
      this.logger.debug(`缓存未命中，执行方法: ${key}`);

      return next.handle().pipe(
        tap(async (result) => {
          // 检查是否应该缓存结果
          if (shouldCacheValue(result, options.cacheNull)) {
            try {
              await this.cacheService.set(key, "", result, options.ttl);
              this.logger.debug(`结果已缓存: ${key}`);
            } catch (error) {
              this.logger.warn(`缓存设置失败: ${key}`, error);
            }
          }
        }),
        catchError((error) => {
          const latency = Date.now() - startTime;
          this.metricsService.recordError(latency);
          this.logger.error(`方法执行失败: ${key}`, error);
          throw error;
        }),
      );
    } catch (error) {
      const latency = Date.now() - startTime;
      this.metricsService.recordError(latency);
      this.logger.error(`缓存处理失败: ${namespace}`, error);
      return next.handle();
    }
  }

  /**
   * 处理 @CacheEvict 装饰器
   *
   * @description 处理缓存清除逻辑
   *
   * @param context - 执行上下文
   * @param next - 下一个处理器
   * @param metadata - 缓存元数据
   * @returns 处理结果
   * @private
   */
  private async handleCacheEvict(
    context: ExecutionContext,
    next: CallHandler,
    metadata: any,
  ): Promise<Observable<any>> {
    const { namespace, options } = metadata;
    const args = context.getArgs();
    const startTime = Date.now();

    try {
      // 检查是否在方法执行前清除
      if (options.beforeInvocation) {
        await this.clearCache(namespace, args, options);
      }

      // 执行方法
      return next.handle().pipe(
        tap(async (_result) => {
          // 检查是否在方法执行后清除
          if (!options.beforeInvocation) {
            await this.clearCache(namespace, args, options);
          }
        }),
        catchError((error) => {
          const latency = Date.now() - startTime;
          this.metricsService.recordError(latency);
          this.logger.error(`缓存清除失败: ${namespace}`, error);
          throw error;
        }),
      );
    } catch (error) {
      const latency = Date.now() - startTime;
      this.metricsService.recordError(latency);
      this.logger.error(`缓存清除处理失败: ${namespace}`, error);
      return next.handle();
    }
  }

  /**
   * 处理 @CachePut 装饰器
   *
   * @description 处理缓存更新逻辑
   *
   * @param context - 执行上下文
   * @param next - 下一个处理器
   * @param metadata - 缓存元数据
   * @returns 处理结果
   * @private
   */
  private async handleCachePut(
    context: ExecutionContext,
    next: CallHandler,
    metadata: any,
  ): Promise<Observable<any>> {
    const { namespace, options } = metadata;
    const args = context.getArgs();
    const startTime = Date.now();

    try {
      // 检查缓存条件
      if (!checkCacheCondition(args, options.condition)) {
        this.logger.debug(`缓存条件不满足，跳过缓存更新: ${namespace}`);
        return next.handle();
      }

      // 执行方法
      return next.handle().pipe(
        tap(async (result) => {
          // 检查是否应该缓存结果
          if (shouldCacheValue(result, options.cacheNull)) {
            try {
              const key = generateCacheKey(
                namespace,
                args,
                options.keyGenerator,
              );
              await this.cacheService.set(key, "", result, options.ttl);
              this.logger.debug(`结果已更新到缓存: ${key}`);
            } catch (error) {
              this.logger.warn(`缓存更新失败: ${namespace}`, error);
            }
          }
        }),
        catchError((error) => {
          const latency = Date.now() - startTime;
          this.metricsService.recordError(latency);
          this.logger.error(`缓存更新处理失败: ${namespace}`, error);
          throw error;
        }),
      );
    } catch (error) {
      const latency = Date.now() - startTime;
      this.metricsService.recordError(latency);
      this.logger.error(`缓存更新处理失败: ${namespace}`, error);
      return next.handle();
    }
  }

  /**
   * 清除缓存
   *
   * @description 根据选项清除缓存
   *
   * @param namespace - 命名空间
   * @param args - 方法参数
   * @param options - 缓存选项
   * @private
   */
  private async clearCache(
    namespace: string,
    args: any[],
    options: any,
  ): Promise<void> {
    try {
      if (options.allEntries) {
        // 清除所有匹配的缓存
        const pattern = `${namespace}:*`;
        const count = await this.cacheService.clear(pattern);
        this.logger.debug(`清除了 ${count} 个缓存条目: ${pattern}`);
      } else {
        // 清除特定键的缓存
        const key = generateCacheKey(namespace, args, options.keyGenerator);
        const deleted = await this.cacheService.del(key, "");
        this.logger.debug(`缓存条目已删除: ${key}, 结果: ${deleted}`);
      }
    } catch (error) {
      this.logger.warn(`缓存清除失败: ${namespace}`, error);
    }
  }
}
