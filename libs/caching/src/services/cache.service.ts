/**
 * 简化的缓存服务
 *
 * @description 提供简单直接的缓存操作，替代复杂的 DDD 实现
 *
 * @since 1.0.0
 */

import { IsolationContext } from "@hl8/isolation-model";
import { Injectable, Inject } from "@nestjs/common";
import { ClsService } from "nestjs-cls";
import { SimplifiedRedisService as RedisService } from "./redis.service.js";
import {
  generateCacheKey,
  generateCachePattern,
} from "../utils/key-generator.util.js";
import { serialize, deserialize } from "../utils/serializer.util.js";
import { CACHE_OPTIONS } from "../tokens/cache.tokens.js";
import type { SimplifiedCacheConfig } from "../types/cache.types.js";

/**
 * 简化的缓存服务
 *
 * @description 提供简单直接的缓存操作，支持多层级隔离
 */
@Injectable()
export class SimplifiedCacheService {
  constructor(
    private readonly redisService: RedisService,
    private readonly clsService: ClsService,
    @Inject(CACHE_OPTIONS) private readonly options: SimplifiedCacheConfig,
  ) {}

  /**
   * 获取缓存值
   *
   * @description 从缓存中获取指定键的值
   *
   * @param namespace - 命名空间
   * @param key - 缓存键
   * @returns 缓存值或 undefined
   *
   * @example
   * ```typescript
   * const user = await cacheService.get<User>('user', '123');
   * if (user) {
   *   console.log(user.name);
   * }
   * ```
   */
  async get<T>(namespace: string, key: string): Promise<T | undefined> {
    try {
      const cacheKey = this.buildCacheKey(namespace, key);
      const value = await this.redisService.getClient().get(cacheKey);

      if (value === null) {
        return undefined;
      }

      return deserialize<T>(value);
    } catch (_error) {
      // 简化错误处理：静默失败，返回 undefined
      return undefined;
    }
  }

  /**
   * 设置缓存值
   *
   * @description 将值存储到缓存中
   *
   * @param namespace - 命名空间
   * @param key - 缓存键
   * @param value - 缓存值
   * @param ttl - 过期时间（秒），可选
   *
   * @example
   * ```typescript
   * await cacheService.set('user', '123', { name: 'John', age: 30 });
   * await cacheService.set('user', '123', user, 1800); // 30分钟过期
   * ```
   */
  async set<T>(
    namespace: string,
    key: string,
    value: T,
    ttl?: number,
  ): Promise<void> {
    try {
      const cacheKey = this.buildCacheKey(namespace, key);
      const serializedValue = serialize(value);
      const finalTtl = ttl ?? this.options.ttl ?? 3600;

      await this.redisService
        .getClient()
        .setex(cacheKey, finalTtl, serializedValue);
    } catch (_error) {
      // 简化错误处理：静默失败
      // 在实际应用中，可能需要记录日志
    }
  }

  /**
   * 删除指定缓存键
   *
   * @description 从缓存中删除指定的键
   *
   * @param namespace - 命名空间
   * @param key - 缓存键
   * @returns 是否删除成功
   *
   * @example
   * ```typescript
   * const deleted = await cacheService.del('user', '123');
   * if (deleted) {
   *   console.log('用户缓存已删除');
   * }
   * ```
   */
  async del(namespace: string, key: string): Promise<boolean> {
    try {
      const cacheKey = this.buildCacheKey(namespace, key);
      const result = await this.redisService.getClient().del(cacheKey);
      return result > 0;
    } catch (_error) {
      // 简化错误处理：返回 false
      return false;
    }
  }

  /**
   * 检查缓存键是否存在
   *
   * @description 检查指定的缓存键是否存在
   *
   * @param namespace - 命名空间
   * @param key - 缓存键
   * @returns 是否存在
   *
   * @example
   * ```typescript
   * const exists = await cacheService.exists('user', '123');
   * if (exists) {
   *   console.log('用户缓存存在');
   * }
   * ```
   */
  async exists(namespace: string, key: string): Promise<boolean> {
    try {
      const cacheKey = this.buildCacheKey(namespace, key);
      const result = await this.redisService.getClient().exists(cacheKey);
      return result > 0;
    } catch (_error) {
      // 简化错误处理：返回 false
      return false;
    }
  }

  /**
   * 清除指定模式的缓存键
   *
   * @description 清除匹配指定模式的所有缓存键
   *
   * @param pattern - 匹配模式，例如 'user:*'。如果为空，则清除所有缓存（慎用）
   * @returns 删除的键数量
   *
   * @example
   * ```typescript
   * // 清除所有用户缓存
   * const count = await cacheService.clear('user:*');
   * console.log(`删除了 ${count} 个缓存键`);
   *
   * // 清除所有缓存（慎用）
   * const totalCount = await cacheService.clear();
   * ```
   */
  async clear(pattern?: string): Promise<number> {
    try {
      const cachePattern = this.buildCachePattern(pattern);
      let totalDeleted = 0;
      let cursor = "0";

      do {
        const [newCursor, keys] = await this.redisService
          .getClient()
          .scan(cursor, "MATCH", cachePattern, "COUNT", 100);

        if (keys.length > 0) {
          const deleted = await this.redisService.getClient().del(...keys);
          totalDeleted += deleted;
        }

        cursor = newCursor;
      } while (cursor !== "0");

      return totalDeleted;
    } catch (_error) {
      // 简化错误处理：返回 0
      return 0;
    }
  }

  /**
   * 清除租户的所有缓存
   *
   * @description 清除指定租户的所有缓存
   *
   * @param tenantId - 租户 ID
   * @returns 删除的键数量
   *
   * @example
   * ```typescript
   * const count = await cacheService.clearTenantCache('tenant-123');
   * console.log(`删除了租户 ${tenantId} 的 ${count} 个缓存键`);
   * ```
   */
  async clearTenantCache(tenantId: string): Promise<number> {
    const pattern = `tenant:${tenantId}:*`;
    return this.clear(pattern);
  }

  /**
   * 清除组织的所有缓存
   *
   * @description 清除指定组织的所有缓存
   *
   * @param tenantId - 租户 ID
   * @param organizationId - 组织 ID
   * @returns 删除的键数量
   *
   * @example
   * ```typescript
   * const count = await cacheService.clearOrganizationCache('tenant-123', 'org-456');
   * console.log(`删除了组织 ${organizationId} 的 ${count} 个缓存键`);
   * ```
   */
  async clearOrganizationCache(
    tenantId: string,
    organizationId: string,
  ): Promise<number> {
    const pattern = `tenant:${tenantId}:org:${organizationId}:*`;
    return this.clear(pattern);
  }

  /**
   * 清除部门的所有缓存
   *
   * @description 清除指定部门的所有缓存
   *
   * @param tenantId - 租户 ID
   * @param organizationId - 组织 ID
   * @param departmentId - 部门 ID
   * @returns 删除的键数量
   *
   * @example
   * ```typescript
   * const count = await cacheService.clearDepartmentCache('tenant-123', 'org-456', 'dept-789');
   * console.log(`删除了部门 ${departmentId} 的 ${count} 个缓存键`);
   * ```
   */
  async clearDepartmentCache(
    tenantId: string,
    organizationId: string,
    departmentId: string,
  ): Promise<number> {
    const pattern = `tenant:${tenantId}:org:${organizationId}:dept:${departmentId}:*`;
    return this.clear(pattern);
  }

  /**
   * 构建缓存键
   *
   * @description 根据隔离上下文构建缓存键
   *
   * @param namespace - 命名空间
   * @param key - 键名
   * @returns 完整的缓存键
   * @private
   */
  private buildCacheKey(namespace: string, key: string): string {
    const context = this.getIsolationContext();
    return generateCacheKey(namespace, key, context, this.options.keyPrefix);
  }

  /**
   * 构建缓存模式
   *
   * @description 根据隔离上下文构建缓存模式
   *
   * @param pattern - 模式
   * @returns 完整的缓存模式
   * @private
   */
  private buildCachePattern(pattern?: string): string {
    const context = this.getIsolationContext();
    const finalPattern = pattern ?? "*";
    return generateCachePattern(
      finalPattern,
      "*",
      context,
      this.options.keyPrefix,
    );
  }

  /**
   * 获取隔离上下文
   *
   * @description 从 CLS 获取隔离上下文，如果不存在则返回平台级上下文
   *
   * @returns 隔离上下文
   * @private
   */
  private getIsolationContext(): IsolationContext | undefined {
    try {
      return this.clsService.get<IsolationContext>("isolationContext");
    } catch {
      // 如果无法获取隔离上下文，返回 undefined（将使用平台级上下文）
      return undefined;
    }
  }
}
