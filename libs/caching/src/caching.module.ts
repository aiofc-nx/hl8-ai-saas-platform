/**
 * 简化的缓存模块
 *
 * @description 提供简单直接的缓存模块配置，替代复杂的 DDD 实现
 *
 * @since 1.0.0
 */

import { DynamicModule, Module, Provider } from "@nestjs/common";
import { ClsModule } from "nestjs-cls";
import { SimplifiedCacheService } from "./services/cache.service.js";
import { SimplifiedRedisService } from "./services/redis.service.js";
import { SimplifiedCacheMetricsService } from "./monitoring/cache-metrics.service.js";
import { SimplifiedCacheInterceptor } from "./interceptors/cache.interceptor.js";
import type { SimplifiedModuleOptions } from "./types/cache.types.js";

/**
 * 缓存选项令牌
 *
 * @description 用于注入缓存配置的令牌
 */
export const CACHE_OPTIONS = "CACHE_OPTIONS";

/**
 * 简化的缓存模块
 *
 * @description 提供简单直接的缓存模块配置
 */
@Module({})
export class SimplifiedCachingModule {
  /**
   * 同步配置缓存模块
   *
   * @description 使用同步配置创建缓存模块
   *
   * @param options - 缓存模块选项
   * @returns 动态模块
   *
   * @example
   * ```typescript
   * @Module({
   *   imports: [
   *     SimplifiedCachingModule.forRoot({
   *       redis: {
   *         host: 'localhost',
   *         port: 6379,
   *       },
   *       ttl: 3600,
   *     }),
   *   ],
   * })
   * export class AppModule {}
   * ```
   */
  static forRoot(options: SimplifiedModuleOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: CACHE_OPTIONS,
        useValue: options,
      },
      {
        provide: SimplifiedRedisService,
        useFactory: (config: SimplifiedModuleOptions) => {
          return new SimplifiedRedisService(config.redis);
        },
        inject: [CACHE_OPTIONS],
      },
      SimplifiedCacheService,
      SimplifiedCacheMetricsService,
      SimplifiedCacheInterceptor,
    ];

    return {
      module: SimplifiedCachingModule,
      imports: [ClsModule],
      providers,
      exports: [
        SimplifiedCacheService,
        SimplifiedRedisService,
        SimplifiedCacheMetricsService,
        SimplifiedCacheInterceptor,
      ],
      global: true,
    };
  }

  /**
   * 异步配置缓存模块
   *
   * @description 使用异步配置创建缓存模块
   *
   * @param options - 异步缓存模块选项
   * @returns 动态模块
   *
   * @example
   * ```typescript
   * @Module({
   *   imports: [
   *     SimplifiedCachingModule.forRootAsync({
   *       imports: [ConfigModule],
   *       inject: [ConfigService],
   *       useFactory: (configService: ConfigService) => ({
   *         redis: {
   *           host: configService.get('REDIS_HOST'),
   *           port: configService.get('REDIS_PORT'),
   *         },
   *         ttl: configService.get('CACHE_TTL'),
   *       }),
   *     }),
   *   ],
   * })
   * export class AppModule {}
   * ```
   */
  static forRootAsync(options: {
    imports?: any[];
    inject?: any[];
    useFactory: (
      ...args: any[]
    ) => Promise<SimplifiedModuleOptions> | SimplifiedModuleOptions;
  }): DynamicModule {
    const providers: Provider[] = [
      {
        provide: CACHE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
      {
        provide: SimplifiedRedisService,
        useFactory: (config: SimplifiedModuleOptions) => {
          return new SimplifiedRedisService(config.redis);
        },
        inject: [CACHE_OPTIONS],
      },
      SimplifiedCacheService,
      SimplifiedCacheMetricsService,
      SimplifiedCacheInterceptor,
    ];

    return {
      module: SimplifiedCachingModule,
      imports: [ClsModule, ...(options.imports || [])],
      providers,
      exports: [
        SimplifiedCacheService,
        SimplifiedRedisService,
        SimplifiedCacheMetricsService,
        SimplifiedCacheInterceptor,
      ],
      global: true,
    };
  }
}
