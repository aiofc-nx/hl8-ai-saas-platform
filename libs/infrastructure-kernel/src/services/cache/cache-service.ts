/**
 * 缓存服务
 *
 * @description 提供统一的缓存操作服务
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import type {
  ICacheService,
  CacheConfig,
  CacheStats,
  CacheClearOptions,
  CacheClearResult,
} from "../../interfaces/cache-service.interface.js";
import type { IsolationContext } from "../../types/isolation.types.js";

/**
 * 缓存服务实现
 */
@Injectable()
export class CacheService implements ICacheService {
  private cache = new Map<string, unknown>();
  private cacheTimestamps = new Map<string, number>();
  private cacheStats: CacheStats = {
    hitRate: 0,
    missRate: 0,
    totalEntries: 0,
    memoryUsage: 0,
    averageResponseTime: 0,
    topKeys: [],
  };
  private config: CacheConfig = {
    keyPrefix: "hl8:",
    defaultTtl: 300,
    maxSize: 1000,
    strategy: "LRU",
    enableCompression: false,
    enableSerialization: true,
  };

  constructor(private readonly isolationContext?: IsolationContext) {}

  /**
   * 设置缓存
   */
  async set(
    key: string,
    value: unknown,
    options?: {
      ttl?: number;
      tags?: string[];
      overwrite?: boolean;
      isolationContext?: IsolationContext;
    },
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // 应用隔离上下文
      const isolatedKey = this.applyIsolationContext(key);

      // 检查是否覆盖
      if (!options?.overwrite && this.cache.has(isolatedKey)) {
        return;
      }

      // 序列化值
      const serializedValue = this.config.enableSerialization
        ? JSON.stringify(value)
        : value;

      // 设置缓存
      this.cache.set(isolatedKey, serializedValue);
      this.cacheTimestamps.set(isolatedKey, Date.now());

      // 更新统计信息
      await this.updateCacheStats(startTime);

      // 应用TTL
      if (options?.ttl || this.config.defaultTtl) {
        const ttl = options?.ttl || this.config.defaultTtl;
        setTimeout(() => {
          this.cache.delete(isolatedKey);
          this.cacheTimestamps.delete(isolatedKey);
        }, ttl * 1000);
      }

      // 检查缓存大小限制
      this.enforceSizeLimit();
    } catch (_error) {
      throw new Error(
        `设置缓存失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 获取缓存
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    const startTime = Date.now();

    try {
      // 应用隔离上下文
      const isolatedKey = this.applyIsolationContext(key);

      if (!this.cache.has(isolatedKey)) {
        this.updateCacheStats(startTime, false);
        return null;
      }

      const value = this.cache.get(isolatedKey);

      // 反序列化值
      const deserializedValue = this.config.enableSerialization
        ? JSON.parse(value as string)
        : value;

      // 更新统计信息
      await this.updateCacheStats(startTime, true);

      return deserializedValue;
    } catch (_error) {
      await this.updateCacheStats(startTime, false);
      return null;
    }
  }

  /**
   * 批量获取缓存
   */
  async mget<T = unknown>(keys: string[]): Promise<Record<string, T | null>> {
    const results: Record<string, T | null> = {};

    for (const key of keys) {
      results[key] = await this.get<T>(key);
    }

    return results;
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<void> {
    try {
      // 应用隔离上下文
      const isolatedKey = this.applyIsolationContext(key);

      this.cache.delete(isolatedKey);
      this.cacheTimestamps.delete(isolatedKey);
    } catch (_error) {
      throw new Error(
        `删除缓存失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 批量删除缓存
   */
  async mdelete(keys: string[]): Promise<void> {
    const deletePromises = keys.map((key) => this.delete(key));
    await Promise.all(deletePromises);
  }

  /**
   * 清除缓存
   */
  async clear(pattern?: string): Promise<void> {
    try {
      if (pattern) {
        // 根据模式清除缓存
        const regex = new RegExp(pattern);
        for (const key of this.cache.keys()) {
          if (regex.test(key)) {
            this.cache.delete(key);
            this.cacheTimestamps.delete(key);
          }
        }
      } else {
        // 清除所有缓存
        this.cache.clear();
        this.cacheTimestamps.clear();
      }
    } catch (_error) {
      throw new Error(
        `清除缓存失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 检查缓存是否存在
   */
  async exists(key: string): Promise<boolean> {
    try {
      // 应用隔离上下文
      const isolatedKey = this.applyIsolationContext(key);

      return this.cache.has(isolatedKey);
    } catch (_error) {
      return false;
    }
  }

  /**
   * 获取缓存TTL
   */
  async ttl(key: string): Promise<number> {
    try {
      // 应用隔离上下文
      const isolatedKey = this.applyIsolationContext(key);

      if (!this.cache.has(isolatedKey)) {
        return -1;
      }

      const timestamp = this.cacheTimestamps.get(isolatedKey);
      if (!timestamp) {
        return -1;
      }

      const elapsed = Date.now() - timestamp;
      const ttl = this.config.defaultTtl * 1000 - elapsed;

      return Math.max(0, Math.floor(ttl / 1000));
    } catch (_error) {
      return -1;
    }
  }

  /**
   * 设置缓存TTL
   */
  async expire(key: string, ttl: number): Promise<void> {
    try {
      // 应用隔离上下文
      const isolatedKey = this.applyIsolationContext(key);

      if (!this.cache.has(isolatedKey)) {
        return;
      }

      // 更新时间戳
      this.cacheTimestamps.set(isolatedKey, Date.now());

      // 设置新的TTL
      setTimeout(() => {
        this.cache.delete(isolatedKey);
        this.cacheTimestamps.delete(isolatedKey);
      }, ttl * 1000);
    } catch (_error) {
      throw new Error(
        `设置缓存TTL失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      // 简单的健康检查
      const testKey = "health_check";
      const testValue = "ok";

      await this.set(testKey, testValue, { ttl: 1 });
      const retrieved = await this.get(testKey);
      await this.delete(testKey);

      return retrieved === testValue;
    } catch (_error) {
      return false;
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): Promise<CacheStats> {
    return Promise.resolve({ ...this.cacheStats });
  }

  /**
   * 根据选项清理缓存
   */
  async clearByOptions(options: CacheClearOptions): Promise<CacheClearResult> {
    try {
      let clearedCount = 0;
      const keysToDelete: string[] = [];

      for (const key of this.cache.keys()) {
        const _shouldDelete = false;

        // 检查租户隔离
        if (options.tenantId && !key.includes(`tenant:${options.tenantId}`)) {
          continue;
        }

        // 检查组织隔离
        if (
          options.organizationId &&
          !key.includes(`org:${options.organizationId}`)
        ) {
          continue;
        }

        // 检查部门隔离
        if (
          options.departmentId &&
          !key.includes(`dept:${options.departmentId}`)
        ) {
          continue;
        }

        // 检查用户隔离
        if (options.userId && !key.includes(`user:${options.userId}`)) {
          continue;
        }

        // 检查标签
        if (options.tags && options.tags.length > 0) {
          const hasMatchingTag = options.tags.some((tag) =>
            key.includes(`tag:${tag}`),
          );
          if (!hasMatchingTag) {
            continue;
          }
        }

        // 检查模式匹配
        if (options.pattern) {
          const regex = new RegExp(options.pattern);
          if (!regex.test(key)) {
            continue;
          }
        }

        keysToDelete.push(key);
      }

      // 删除匹配的键
      for (const key of keysToDelete) {
        this.cache.delete(key);
        this.cacheTimestamps.delete(key);
        clearedCount++;
      }

      return {
        clearedCount,
        message: `成功清理 ${clearedCount} 个缓存条目`,
        details: {
          options,
          clearedKeys: keysToDelete,
        },
      };
    } catch (_error) {
      throw new Error(
        `根据选项清理缓存失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 预热缓存
   */
  async warmup(keys: string[]): Promise<void> {
    try {
      // 这里可以实现缓存预热逻辑
      // 例如：预加载常用数据
      console.log("缓存预热:", keys);
    } catch (_error) {
      throw new Error(
        `缓存预热失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 获取缓存大小
   */
  getSize(): Promise<number> {
    return Promise.resolve(this.cache.size);
  }

  /**
   * 获取内存使用情况
   */
  getMemoryUsage(): Promise<number> {
    // 简单的内存使用估算
    let totalSize = 0;
    for (const [key, value] of this.cache.entries()) {
      totalSize +=
        key.length +
        (typeof value === "string"
          ? value.length
          : JSON.stringify(value).length);
    }
    return Promise.resolve(totalSize);
  }

  /**
   * 设置缓存策略
   */
  setStrategy(strategy: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.config.strategy = strategy as any; // 符合宪章 IX：缓存策略配置，支持任意策略类型
    return Promise.resolve();
  }

  /**
   * 获取缓存策略
   */
  getStrategy(): Promise<string> {
    return Promise.resolve(this.config.strategy);
  }

  /**
   * 应用隔离上下文
   */
  private applyIsolationContext(key: string): string {
    if (!this.isolationContext) {
      return `${this.config.keyPrefix}${key}`;
    }

    let isolatedKey = this.config.keyPrefix;

    if (this.isolationContext.tenantId) {
      isolatedKey += `tenant:${this.isolationContext.tenantId}:`;
    }

    if (this.isolationContext.organizationId) {
      isolatedKey += `org:${this.isolationContext.organizationId}:`;
    }

    if (this.isolationContext.departmentId) {
      isolatedKey += `dept:${this.isolationContext.departmentId}:`;
    }

    if (this.isolationContext.userId) {
      isolatedKey += `user:${this.isolationContext.userId}:`;
    }

    isolatedKey += key;

    return isolatedKey;
  }

  /**
   * 更新缓存统计信息
   */
  private async updateCacheStats(
    startTime: number,
    hit: boolean = true,
  ): Promise<void> {
    const responseTime = Date.now() - startTime;

    // 更新命中率
    const totalRequests =
      this.cacheStats.hitRate + this.cacheStats.missRate + 1;
    if (hit) {
      this.cacheStats.hitRate++;
    } else {
      this.cacheStats.missRate++;
    }

    // 更新平均响应时间
    const totalTime =
      this.cacheStats.averageResponseTime * (totalRequests - 1) + responseTime;
    this.cacheStats.averageResponseTime = totalTime / totalRequests;

    // 更新总条目数
    this.cacheStats.totalEntries = this.cache.size;

    // 更新内存使用
    this.cacheStats.memoryUsage = await this.getMemoryUsage();
  }

  /**
   * 强制执行大小限制
   */
  private enforceSizeLimit(): void {
    if (this.cache.size <= this.config.maxSize) {
      return;
    }

    // 根据策略清理缓存
    switch (this.config.strategy) {
      case "LRU":
        this.cleanupLRU();
        break;
      case "LFU":
        this.cleanupLFU();
        break;
      case "FIFO":
        this.cleanupFIFO();
        break;
      case "TTL":
        this.cleanupTTL();
        break;
    }
  }

  /**
   * 清理LRU缓存
   */
  private cleanupLRU(): void {
    const entries = Array.from(this.cacheTimestamps.entries());
    entries.sort((a, b) => a[1] - b[1]);

    const toDelete = entries.slice(0, this.cache.size - this.config.maxSize);
    for (const [key] of toDelete) {
      this.cache.delete(key);
      this.cacheTimestamps.delete(key);
    }
  }

  /**
   * 清理LFU缓存
   */
  private cleanupLFU(): void {
    // 简化实现，实际应该维护访问频率
    this.cleanupLRU();
  }

  /**
   * 清理FIFO缓存
   */
  private cleanupFIFO(): void {
    this.cleanupLRU();
  }

  /**
   * 清理TTL缓存
   */
  private cleanupTTL(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, timestamp] of this.cacheTimestamps.entries()) {
      const elapsed = now - timestamp;
      if (elapsed > this.config.defaultTtl * 1000) {
        toDelete.push(key);
      }
    }

    for (const key of toDelete) {
      this.cache.delete(key);
      this.cacheTimestamps.delete(key);
    }
  }
}
