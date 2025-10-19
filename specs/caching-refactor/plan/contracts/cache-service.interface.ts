/**
 * Cache Service Interface
 * 
 * @description Simplified interface for caching operations without DDD complexity
 * @since 1.0.0
 */

import type { IsolationContext } from "@hl8/isolation-model";

/**
 * Cache service interface providing core caching operations
 */
export interface ICacheService {
  /**
   * Get cached value
   * 
   * @param namespace - Cache namespace
   * @param key - Cache key
   * @returns Cached value or undefined
   */
  get<T>(namespace: string, key: string): Promise<T | undefined>;

  /**
   * Set cached value
   * 
   * @param namespace - Cache namespace
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in seconds (optional)
   */
  set<T>(namespace: string, key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Delete cached value
   * 
   * @param namespace - Cache namespace
   * @param key - Cache key
   * @returns true if deleted, false if not found
   */
  del(namespace: string, key: string): Promise<boolean>;

  /**
   * Check if cache key exists
   * 
   * @param namespace - Cache namespace
   * @param key - Cache key
   * @returns true if exists, false otherwise
   */
  exists(namespace: string, key: string): Promise<boolean>;

  /**
   * Clear cache by pattern
   * 
   * @param pattern - Pattern to match (optional, clears all if not provided)
   * @returns Number of keys deleted
   */
  clear(pattern?: string): Promise<number>;
}

/**
 * Redis service interface for connection management
 */
export interface IRedisService {
  /**
   * Get Redis client
   * 
   * @returns Redis client instance
   * @throws RedisConnectionError if not connected
   */
  getClient(): any; // ioredis Redis type

  /**
   * Check Redis health
   * 
   * @returns true if healthy, false otherwise
   */
  healthCheck(): Promise<boolean>;

  /**
   * Check if client is connected
   * 
   * @returns true if connected, false otherwise
   */
  isClientConnected(): boolean;
}

/**
 * Cache metrics interface for performance monitoring
 */
export interface ICacheMetricsService {
  /**
   * Record cache hit
   * 
   * @param latency - Operation latency in milliseconds
   */
  recordHit(latency: number): void;

  /**
   * Record cache miss
   * 
   * @param latency - Operation latency in milliseconds
   */
  recordMiss(latency: number): void;

  /**
   * Record cache error
   * 
   * @param latency - Operation latency in milliseconds
   */
  recordError(latency: number): void;

  /**
   * Get cache metrics
   * 
   * @returns Current cache metrics
   */
  getMetrics(): CacheMetrics;

  /**
   * Reset all metrics
   */
  reset(): void;
}

/**
 * Cache metrics data structure
 */
export interface CacheMetrics {
  /** Number of cache hits */
  hits: number;
  /** Number of cache misses */
  misses: number;
  /** Number of cache errors */
  errors: number;
  /** Cache hit rate (0-1) */
  hitRate: number;
  /** Average latency in milliseconds */
  averageLatency: number;
  /** Total number of operations */
  totalOperations: number;
}

/**
 * Cache configuration interface
 */
export interface CacheConfig {
  /** Redis connection options */
  redis: RedisOptions;
  /** Default TTL in seconds */
  ttl: number;
  /** Key prefix for all cache keys */
  keyPrefix: string;
}

/**
 * Redis connection options
 */
export interface RedisOptions {
  /** Redis host */
  host: string;
  /** Redis port */
  port: number;
  /** Redis password (optional) */
  password?: string;
  /** Redis database (optional) */
  db?: number;
  /** Connection timeout (optional) */
  connectTimeout?: number;
  /** Command timeout (optional) */
  commandTimeout?: number;
  /** Retry strategy (optional) */
  retryStrategy?: (times: number) => number | null;
}

/**
 * Cache decorator options
 */
export interface CacheableOptions {
  /** Custom key generator function */
  keyGenerator?: (...args: any[]) => string;
  /** TTL override */
  ttl?: number;
  /** Condition function */
  condition?: (...args: any[]) => boolean;
  /** Cache null values */
  cacheNull?: boolean;
}

export interface CacheEvictOptions {
  /** Clear all entries */
  allEntries?: boolean;
  /** Clear before method invocation */
  beforeInvocation?: boolean;
  /** Custom key generator */
  keyGenerator?: (...args: any[]) => string;
}

export interface CachePutOptions {
  /** Custom key generator */
  keyGenerator?: (...args: any[]) => string;
  /** TTL override */
  ttl?: number;
}

/**
 * Cache error classes
 */
export class CacheError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'CacheError';
  }
}

export class RedisConnectionError extends CacheError {
  constructor(message: string, cause?: Error) {
    super(`Redis connection failed: ${message}`, cause);
    this.name = 'RedisConnectionError';
  }
}

export class CacheSerializationError extends CacheError {
  constructor(message: string, cause?: Error) {
    super(`Cache serialization failed: ${message}`, cause);
    this.name = 'CacheSerializationError';
  }
}
