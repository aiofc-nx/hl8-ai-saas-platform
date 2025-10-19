/**
 * 简化的错误类
 *
 * @description 为基础设施模块提供简单直接的错误处理
 *
 * @since 1.0.0
 */

/**
 * 缓存基础错误类
 *
 * @description 所有缓存相关错误的基类
 */
export class CacheError extends Error {
  constructor(
    message: string,
    public cause?: Error,
    public context?: Record<string, any>,
  ) {
    super(message);
    this.name = "CacheError";
  }
}

/**
 * Redis 连接错误
 *
 * @description Redis 连接失败时抛出
 */
export class RedisConnectionError extends CacheError {
  constructor(message: string, cause?: Error, context?: Record<string, any>) {
    super(`Redis connection failed: ${message}`, cause, context);
    this.name = "RedisConnectionError";
  }
}

/**
 * 缓存序列化错误
 *
 * @description 缓存值序列化/反序列化失败时抛出
 */
export class CacheSerializationError extends CacheError {
  constructor(message: string, cause?: Error, context?: Record<string, any>) {
    super(`Cache serialization failed: ${message}`, cause, context);
    this.name = "CacheSerializationError";
  }
}

/**
 * 缓存键验证错误
 *
 * @description 缓存键无效时抛出
 */
export class CacheKeyValidationError extends CacheError {
  constructor(message: string, context?: Record<string, any>) {
    super(`Cache key validation failed: ${message}`, undefined, context);
    this.name = "CacheKeyValidationError";
  }
}

/**
 * 缓存配置错误
 *
 * @description 缓存配置无效时抛出
 */
export class CacheConfigurationError extends CacheError {
  constructor(message: string, context?: Record<string, any>) {
    super(`Cache configuration error: ${message}`, undefined, context);
    this.name = "CacheConfigurationError";
  }
}

/**
 * 缓存操作超时错误
 *
 * @description 缓存操作超时时抛出
 */
export class CacheTimeoutError extends CacheError {
  constructor(message: string, context?: Record<string, any>) {
    super(`Cache operation timeout: ${message}`, undefined, context);
    this.name = "CacheTimeoutError";
  }
}
