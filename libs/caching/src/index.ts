/**
 * 简化的缓存模块入口文件
 *
 * @description 导出简化后的缓存模块所有公共 API
 *
 * @since 1.0.0
 */

// 模块
export { SimplifiedCachingModule as CachingModule } from "./caching.module.js";

// 服务
export { SimplifiedCacheService as CacheService } from "./services/cache.service.js";
export { SimplifiedRedisService as RedisService } from "./services/redis.service.js";
export { SimplifiedCacheMetricsService as CacheMetricsService } from "./monitoring/cache-metrics.service.js";

// 拦截器
export { SimplifiedCacheInterceptor as CacheInterceptor } from "./interceptors/cache.interceptor.js";

// 装饰器
export {
  Cacheable,
  CacheEvict,
  CachePut,
  defaultKeyGenerator,
  generateCacheKey,
  checkCacheCondition,
  shouldCacheValue,
} from "./decorators/cacheable.decorator.js";

// 工具函数
export {
  generateCacheKey as generateCacheKeyUtil,
  generateCachePattern,
  isValidKey,
  sanitizeKey,
} from "./utils/key-generator.util.js";

export {
  serialize,
  deserialize,
  isSerializable,
  getSerializedSize,
  isOversized,
} from "./utils/serializer.util.js";

export {
  getIsolationLevel,
  hasIsolationLevel,
  getIsolationIdentifier,
  validateIsolationContext,
  createIsolationPrefix,
  isIsolationContextMatch,
  getIsolationContextSummary,
} from "./utils/isolation.util.js";

export {
  PerformanceMonitor,
  PerformanceStats,
  PerformanceThresholdChecker,
  PerformanceMonitor as PerformanceMonitorDecorator,
} from "./utils/performance.util.js";

// 错误类
export {
  CacheError,
  RedisConnectionError,
  CacheSerializationError,
  CacheKeyValidationError,
  CacheConfigurationError,
  CacheTimeoutError,
} from "./exceptions/cache.exceptions.js";

// 类型定义
export type {
  SimplifiedCacheConfig,
  SimplifiedRedisOptions,
  SimplifiedCacheOptions,
  SimplifiedDecoratorOptions,
  SimplifiedErrorOptions,
  SimplifiedPerformanceOptions,
  SimplifiedIsolationOptions,
  SimplifiedModuleOptions,
} from "./types/cache.types.js";

export type { SimplifiedCacheMetrics } from "./monitoring/cache-metrics.service.js";

export type {
  CacheKeyGenerator,
  CacheCondition,
  SimplifiedCacheableOptions,
} from "./decorators/cacheable.decorator.js";

// 常量
export { CACHE_OPTIONS } from "./tokens/cache.tokens.js";
