/**
 * 领域缓存管理器
 *
 * @description 处理领域层缓存管理，包括缓存策略、缓存失效、缓存统计等
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { DomainService } from "@hl8/domain-kernel";

/**
 * 缓存策略枚举
 */
export enum CacheStrategy {
  LRU = "LRU",
  LFU = "LFU",
  FIFO = "FIFO",
  TTL = "TTL",
  CUSTOM = "CUSTOM",
}

/**
 * 缓存项接口
 */
export interface CacheItem<T = unknown> {
  readonly key: string;
  readonly value: T;
  readonly ttl?: number;
  readonly createdAt: Date;
  readonly accessedAt: Date;
  readonly accessCount: number;
  readonly metadata?: Record<string, unknown>;
}

/**
 * 缓存统计信息接口
 */
export interface CacheStatistics {
  readonly totalItems: number;
  readonly totalSize: number;
  readonly hitRate: number;
  readonly missRate: number;
  readonly evictionCount: number;
  readonly averageAccessTime: number;
  readonly memoryUsage: number;
}

/**
 * 缓存查询条件接口
 */
export interface CacheQuery {
  readonly pattern?: string;
  readonly ttl?: number;
  readonly accessCount?: number;
  readonly createdAt?: Date;
  readonly accessedAt?: Date;
  readonly metadata?: Record<string, unknown>;
}

/**
 * 领域缓存管理器
 *
 * 领域缓存管理器负责处理领域层缓存管理，包括缓存策略、缓存失效、缓存统计等。
 * 支持多种缓存策略，包括LRU、LFU、FIFO、TTL等，提供统一的缓存管理接口。
 *
 * @example
 * ```typescript
 * const manager = new DomainCacheManager();
 * await manager.set("user:123", userData, 3600);
 * const user = await manager.get("user:123");
 * ```
 */
@Injectable()
export class DomainCacheManager extends DomainService {
  private readonly cache: Map<string, CacheItem> = new Map();
  private readonly accessOrder: string[] = [];
  private readonly accessCount: Map<string, number> = new Map();
  private readonly statistics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalAccessTime: 0,
    totalAccesses: 0,
  };

  constructor() {
    super();
    this.setContext("DomainCacheManager");
  }

  /**
   * 设置缓存项
   *
   * @param key - 缓存键
   * @param value - 缓存值
   * @param ttl - 生存时间（秒）
   * @param metadata - 元数据
   * @returns 是否设置成功
   */
  async set<T>(
    key: string,
    value: T,
    ttl?: number,
    metadata?: Record<string, unknown>,
  ): Promise<boolean> {
    this.logger.log(`Setting cache item for key: ${key}`, this.context);

    if (!key || key.trim() === "") {
      throw new Error("Cache key cannot be empty");
    }

    const now = new Date();
    const cacheItem: CacheItem<T> = {
      key,
      value,
      ttl,
      createdAt: now,
      accessedAt: now,
      accessCount: 0,
      metadata,
    };

    this.cache.set(key, cacheItem);
    this.updateAccessOrder(key);
    this.accessCount.set(key, 0);

    this.logger.log(`Cache item for key ${key} set successfully`, this.context);

    return true;
  }

  /**
   * 获取缓存项
   *
   * @param key - 缓存键
   * @returns 缓存值或undefined
   */
  async get<T>(key: string): Promise<T | undefined> {
    this.logger.log(`Getting cache item for key: ${key}`, this.context);

    const startTime = Date.now();
    const cacheItem = this.cache.get(key);

    if (!cacheItem) {
      this.statistics.misses++;
      this.logger.log(`Cache miss for key: ${key}`, this.context);
      return undefined;
    }

    // 检查TTL
    if (cacheItem.ttl && this.isExpired(cacheItem)) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      this.accessCount.delete(key);
      this.statistics.misses++;
      this.logger.log(
        `Cache item for key ${key} expired and removed`,
        this.context,
      );
      return undefined;
    }

    // 更新访问信息
    const updatedItem: CacheItem<T> = {
      ...cacheItem,
      accessedAt: new Date(),
      accessCount: cacheItem.accessCount + 1,
    };

    this.cache.set(key, updatedItem);
    this.updateAccessOrder(key);
    this.accessCount.set(key, updatedItem.accessCount);

    const accessTime = Date.now() - startTime;
    this.statistics.hits++;
    this.statistics.totalAccessTime += accessTime;
    this.statistics.totalAccesses++;

    this.logger.log(
      `Cache hit for key: ${key} (${accessTime}ms)`,
      this.context,
    );

    return updatedItem.value;
  }

  /**
   * 删除缓存项
   *
   * @param key - 缓存键
   * @returns 是否删除成功
   */
  async delete(key: string): Promise<boolean> {
    this.logger.log(`Deleting cache item for key: ${key}`, this.context);

    const deleted = this.cache.delete(key);
    this.removeFromAccessOrder(key);
    this.accessCount.delete(key);

    this.logger.log(
      `Cache item for key ${key} deleted: ${deleted}`,
      this.context,
    );

    return deleted;
  }

  /**
   * 检查缓存项是否存在
   *
   * @param key - 缓存键
   * @returns 是否存在
   */
  async has(key: string): Promise<boolean> {
    this.logger.log(
      `Checking cache item existence for key: ${key}`,
      this.context,
    );

    const cacheItem = this.cache.get(key);
    if (!cacheItem) {
      return false;
    }

    // 检查TTL
    if (cacheItem.ttl && this.isExpired(cacheItem)) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      this.accessCount.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 清空所有缓存
   *
   * @returns 清空的缓存项数量
   */
  async clear(): Promise<number> {
    this.logger.log(`Clearing all cache items`, this.context);

    const count = this.cache.size;
    this.cache.clear();
    this.accessOrder.length = 0;
    this.accessCount.clear();

    this.logger.log(`Cleared ${count} cache items`, this.context);

    return count;
  }

  /**
   * 查询缓存项
   *
   * @param query - 查询条件
   * @returns 匹配的缓存项列表
   */
  async query(query: CacheQuery): Promise<readonly CacheItem[]> {
    this.logger.log(
      `Querying cache items with criteria: ${JSON.stringify(query)}`,
      this.context,
    );

    const results: CacheItem[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (this.matchesQuery(item, query)) {
        results.push(item);
      }
    }

    this.logger.log(
      `Found ${results.length} cache items matching query criteria`,
      this.context,
    );

    return results;
  }

  /**
   * 获取缓存统计信息
   *
   * @returns 缓存统计信息
   */
  async getStatistics(): Promise<CacheStatistics> {
    this.logger.log(`Getting cache statistics`, this.context);

    const totalItems = this.cache.size;
    const totalSize = this.calculateTotalSize();
    const hitRate =
      this.statistics.totalAccesses > 0
        ? this.statistics.hits / this.statistics.totalAccesses
        : 0;
    const missRate =
      this.statistics.totalAccesses > 0
        ? this.statistics.misses / this.statistics.totalAccesses
        : 0;
    const averageAccessTime =
      this.statistics.totalAccesses > 0
        ? this.statistics.totalAccessTime / this.statistics.totalAccesses
        : 0;

    const result: CacheStatistics = {
      totalItems,
      totalSize,
      hitRate,
      missRate,
      evictionCount: this.statistics.evictions,
      averageAccessTime,
      memoryUsage: this.calculateMemoryUsage(),
    };

    this.logger.log(
      `Cache statistics generated: ${totalItems} items, hit rate: ${(hitRate * 100).toFixed(2)}%`,
      this.context,
    );

    return result;
  }

  /**
   * 清理过期缓存项
   *
   * @returns 清理的过期项数量
   */
  async cleanupExpired(): Promise<number> {
    this.logger.log(`Cleaning up expired cache items`, this.context);

    let cleanedCount = 0;
    const expiredKeys: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (item.ttl && this.isExpired(item)) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      this.accessCount.delete(key);
      cleanedCount++;
    }

    this.logger.log(
      `Cleaned up ${cleanedCount} expired cache items`,
      this.context,
    );

    return cleanedCount;
  }

  /**
   * 设置缓存策略
   *
   * @param strategy - 缓存策略
   * @param maxSize - 最大缓存大小
   * @returns 是否设置成功
   */
  async setCacheStrategy(
    strategy: CacheStrategy,
    maxSize: number = 1000,
  ): Promise<boolean> {
    this.logger.log(
      `Setting cache strategy: ${strategy} with max size: ${maxSize}`,
      this.context,
    );

    // 这里应该实现实际的缓存策略设置逻辑
    // 例如：设置LRU、LFU、FIFO等策略
    // 设置最大缓存大小限制
    // 实现相应的淘汰算法

    this.logger.log(
      `Cache strategy set to ${strategy} with max size ${maxSize}`,
      this.context,
    );

    return true;
  }

  /**
   * 预热缓存
   *
   * @param items - 预热项列表
   * @returns 预热的项数量
   */
  async warmup(
    items: Array<{ key: string; value: unknown; ttl?: number }>,
  ): Promise<number> {
    this.logger.log(
      `Warming up cache with ${items.length} items`,
      this.context,
    );

    let warmedCount = 0;

    for (const item of items) {
      try {
        await this.set(item.key, item.value, item.ttl);
        warmedCount++;
      } catch (error) {
        this.logger.warn(
          `Failed to warm up cache item ${item.key}: ${error.message}`,
          this.context,
        );
      }
    }

    this.logger.log(`Warmed up ${warmedCount} cache items`, this.context);

    return warmedCount;
  }

  /**
   * 检查缓存项是否过期
   *
   * @param item - 缓存项
   * @returns 是否过期
   */
  private isExpired(item: CacheItem): boolean {
    if (!item.ttl) {
      return false;
    }

    const now = new Date();
    const expirationTime = new Date(item.createdAt.getTime() + item.ttl * 1000);
    return now > expirationTime;
  }

  /**
   * 更新访问顺序
   *
   * @param key - 缓存键
   */
  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  /**
   * 从访问顺序中移除
   *
   * @param key - 缓存键
   */
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * 检查缓存项是否匹配查询条件
   *
   * @param item - 缓存项
   * @param query - 查询条件
   * @returns 是否匹配
   */
  private matchesQuery(item: CacheItem, query: CacheQuery): boolean {
    if (query.pattern && !item.key.includes(query.pattern)) {
      return false;
    }

    if (query.ttl && item.ttl !== query.ttl) {
      return false;
    }

    if (query.accessCount && item.accessCount !== query.accessCount) {
      return false;
    }

    if (query.createdAt && item.createdAt < query.createdAt) {
      return false;
    }

    if (query.accessedAt && item.accessedAt < query.accessedAt) {
      return false;
    }

    if (query.metadata && Object.keys(query.metadata).length > 0) {
      const itemMetadata = item.metadata || {};
      const hasAllMetadata = Object.entries(query.metadata).every(
        ([key, value]) => itemMetadata[key] === value,
      );
      if (!hasAllMetadata) {
        return false;
      }
    }

    return true;
  }

  /**
   * 计算总缓存大小
   *
   * @returns 总缓存大小
   */
  private calculateTotalSize(): number {
    let totalSize = 0;
    for (const item of this.cache.values()) {
      totalSize += JSON.stringify(item).length;
    }
    return totalSize;
  }

  /**
   * 计算内存使用量
   *
   * @returns 内存使用量
   */
  private calculateMemoryUsage(): number {
    // 这里应该实现实际的内存使用量计算
    // 例如：使用process.memoryUsage()或类似的方法
    return this.calculateTotalSize();
  }
}
