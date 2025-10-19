/**
 * 简化的配置接口
 *
 * @description 为基础设施模块提供简单直接的配置选项
 *
 * @since 1.0.0
 */

/**
 * 简化的缓存配置
 *
 * @description 简化的缓存模块配置选项
 */
export interface SimplifiedCacheConfig {
  /** Redis 连接选项 */
  redis: SimplifiedRedisOptions;
  /** 默认 TTL（秒） */
  ttl?: number;
  /** 键前缀 */
  keyPrefix?: string;
  /** 是否启用调试模式 */
  debug?: boolean;
}

/**
 * 简化的 Redis 选项
 *
 * @description 简化的 Redis 连接配置
 */
export interface SimplifiedRedisOptions {
  /** Redis 主机 */
  host: string;
  /** Redis 端口 */
  port: number;
  /** Redis 密码（可选） */
  password?: string;
  /** Redis 数据库（可选） */
  db?: number;
  /** 连接超时（毫秒） */
  connectTimeout?: number;
  /** 命令超时（毫秒） */
  commandTimeout?: number;
  /** 重试策略（可选） */
  retryStrategy?: (times: number) => number | null;
}

/**
 * 简化的缓存选项
 *
 * @description 简化的缓存操作选项
 */
export interface SimplifiedCacheOptions {
  /** TTL（秒） */
  ttl?: number;
  /** 是否缓存 null 值 */
  cacheNull?: boolean;
  /** 条件函数 */
  condition?: (...args: any[]) => boolean;
}

/**
 * 简化的装饰器选项
 *
 * @description 简化的装饰器配置选项
 */
export interface SimplifiedDecoratorOptions {
  /** 自定义键生成器 */
  keyGenerator?: (...args: any[]) => string;
  /** TTL（秒） */
  ttl?: number;
  /** 条件函数 */
  condition?: (...args: any[]) => boolean;
  /** 是否缓存 null 值 */
  cacheNull?: boolean;
  /** 是否清除所有条目 */
  allEntries?: boolean;
  /** 是否在调用前清除 */
  beforeInvocation?: boolean;
}

/**
 * 简化的错误选项
 *
 * @description 简化的错误处理配置
 */
export interface SimplifiedErrorOptions {
  /** 是否记录错误日志 */
  logErrors?: boolean;
  /** 是否抛出错误 */
  throwErrors?: boolean;
  /** 错误重试次数 */
  retryCount?: number;
  /** 错误重试延迟（毫秒） */
  retryDelay?: number;
}

/**
 * 简化的性能选项
 *
 * @description 简化的性能监控配置
 */
export interface SimplifiedPerformanceOptions {
  /** 是否启用性能监控 */
  enableMetrics?: boolean;
  /** 是否记录详细日志 */
  enableDetailedLogging?: boolean;
  /** 性能阈值（毫秒） */
  performanceThreshold?: number;
}

/**
 * 简化的隔离选项
 *
 * @description 简化的多层级隔离配置
 */
export interface SimplifiedIsolationOptions {
  /** 是否启用自动隔离 */
  enableAutoIsolation?: boolean;
  /** 默认隔离级别 */
  defaultIsolationLevel?:
    | "platform"
    | "tenant"
    | "organization"
    | "department"
    | "user";
  /** 是否验证隔离上下文 */
  validateIsolationContext?: boolean;
}

/**
 * 简化的模块选项
 *
 * @description 简化的缓存模块完整配置
 */
export interface SimplifiedModuleOptions extends SimplifiedCacheConfig {
  /** 错误处理选项 */
  error?: SimplifiedErrorOptions;
  /** 性能监控选项 */
  performance?: SimplifiedPerformanceOptions;
  /** 隔离选项 */
  isolation?: SimplifiedIsolationOptions;
}
