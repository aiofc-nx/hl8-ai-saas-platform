/**
 * 简化的 @Cacheable 装饰器
 *
 * @description 提供简单直接的缓存装饰器，替代复杂的 DDD 实现
 *
 * @since 1.0.0
 */

import { SetMetadata } from "@nestjs/common";
import type { SimplifiedDecoratorOptions } from "../types/cache.types.js";

/**
 * 缓存键生成器类型
 *
 * @description 缓存键生成器函数类型
 */
export type CacheKeyGenerator = (...args: any[]) => string;

/**
 * 缓存条件函数类型
 *
 * @description 缓存条件判断函数类型
 */
export type CacheCondition = (...args: any[]) => boolean;

/**
 * 简化的缓存选项
 *
 * @description 简化的缓存装饰器选项
 */
export interface SimplifiedCacheableOptions extends SimplifiedDecoratorOptions {
  /** 自定义键生成器 */
  keyGenerator?: CacheKeyGenerator;
  /** TTL（秒） */
  ttl?: number;
  /** 条件函数 */
  condition?: CacheCondition;
  /** 是否缓存 null 值 */
  cacheNull?: boolean;
}

/**
 * 缓存元数据键
 *
 * @description 用于存储缓存元数据的键
 */
export const CACHEABLE_METADATA_KEY = "cacheable";

/**
 * 简化的 @Cacheable 装饰器
 *
 * @description 为方法添加缓存功能，支持多层级隔离
 *
 * @param namespace - 命名空间
 * @param options - 缓存选项
 * @returns 方法装饰器
 *
 * @example
 * ```typescript
 * class UserService {
 *   @Cacheable('user', { ttl: 1800 })
 *   async getUser(id: string): Promise<User> {
 *     // 方法实现
 *   }
 *
 *   @Cacheable('user', {
 *     keyGenerator: (id, type) => `${id}:${type}`,
 *     condition: (id) => id !== 'skip'
 *   })
 *   async getUserProfile(id: string, type: string): Promise<UserProfile> {
 *     // 方法实现
 *   }
 * }
 * ```
 */
export function Cacheable(
  namespace: string,
  options: SimplifiedCacheableOptions = {},
): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    // 设置元数据
    SetMetadata(CACHEABLE_METADATA_KEY, {
      namespace,
      options,
    })(target, propertyKey, descriptor);

    return descriptor;
  };
}

/**
 * 简化的 @CacheEvict 装饰器
 *
 * @description 为方法添加缓存清除功能，支持多层级隔离
 *
 * @param namespace - 命名空间
 * @param options - 缓存选项
 * @returns 方法装饰器
 *
 * @example
 * ```typescript
 * class UserService {
 *   @CacheEvict('user')
 *   async deleteUser(id: string): Promise<void> {
 *     // 方法实现
 *   }
 *
 *   @CacheEvict('user', { allEntries: true })
 *   async clearAllUsers(): Promise<void> {
 *     // 方法实现
 *   }
 * }
 * ```
 */
export function CacheEvict(
  namespace: string,
  options: SimplifiedDecoratorOptions = {},
): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    // 设置元数据
    SetMetadata("cacheEvict", {
      namespace,
      options,
    })(target, propertyKey, descriptor);

    return descriptor;
  };
}

/**
 * 简化的 @CachePut 装饰器
 *
 * @description 为方法添加缓存更新功能，支持多层级隔离
 *
 * @param namespace - 命名空间
 * @param options - 缓存选项
 * @returns 方法装饰器
 *
 * @example
 * ```typescript
 * class UserService {
 *   @CachePut('user')
 *   async updateUser(id: string, user: User): Promise<User> {
 *     // 方法实现
 *   }
 *
 *   @CachePut('user', { ttl: 1800 })
 *   async createUser(user: User): Promise<User> {
 *     // 方法实现
 *   }
 * }
 * ```
 */
export function CachePut(
  namespace: string,
  options: SimplifiedDecoratorOptions = {},
): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    // 设置元数据
    SetMetadata("cachePut", {
      namespace,
      options,
    })(target, propertyKey, descriptor);

    return descriptor;
  };
}

/**
 * 默认键生成器
 *
 * @description 默认的缓存键生成器，使用参数序列化
 *
 * @param args - 方法参数
 * @returns 生成的缓存键
 *
 * @example
 * ```typescript
 * const key = defaultKeyGenerator('123', 'profile');
 * // 输出: 123:profile
 * ```
 */
export function defaultKeyGenerator(...args: any[]): string {
  return args
    .map((arg) => {
      if (arg === null || arg === undefined) {
        return "null";
      }
      if (typeof arg === "object") {
        return JSON.stringify(arg);
      }
      return String(arg);
    })
    .join(":");
}

/**
 * 生成缓存键
 *
 * @description 根据命名空间和参数生成缓存键
 *
 * @param namespace - 命名空间
 * @param args - 方法参数
 * @param keyGenerator - 自定义键生成器
 * @returns 生成的缓存键
 *
 * @example
 * ```typescript
 * const key = generateCacheKey('user', ['123', 'profile'], customKeyGenerator);
 * ```
 */
export function generateCacheKey(
  namespace: string,
  args: any[],
  keyGenerator?: CacheKeyGenerator,
): string {
  if (keyGenerator) {
    return keyGenerator(...args);
  }

  const key = defaultKeyGenerator(...args);
  return `${namespace}:${key}`;
}

/**
 * 检查缓存条件
 *
 * @description 检查是否满足缓存条件
 *
 * @param args - 方法参数
 * @param condition - 条件函数
 * @returns 如果满足条件返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * const shouldCache = checkCacheCondition(['123'], (id) => id !== 'skip');
 * ```
 */
export function checkCacheCondition(
  args: any[],
  condition?: CacheCondition,
): boolean {
  if (!condition) {
    return true;
  }

  try {
    return condition(...args);
  } catch {
    return false;
  }
}

/**
 * 检查是否应该缓存值
 *
 * @description 检查值是否应该被缓存
 *
 * @param value - 要检查的值
 * @param cacheNull - 是否缓存 null 值
 * @returns 如果应该缓存返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * const shouldCache = shouldCacheValue(null, true);
 * // 输出: true
 * ```
 */
export function shouldCacheValue(
  value: any,
  cacheNull: boolean = false,
): boolean {
  if (value === undefined) {
    return false;
  }

  if (value === null) {
    return cacheNull;
  }

  return true;
}
