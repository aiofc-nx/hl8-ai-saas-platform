/**
 * 简化的键生成工具
 *
 * @description 提供简单直接的缓存键生成功能，替代复杂的 CacheKey 值对象
 *
 * @since 1.0.0
 */

import type { IsolationContext } from "@hl8/isolation-model";
import { CacheKeyValidationError } from "../exceptions/cache.exceptions.js";

/**
 * 生成缓存键
 *
 * @description 根据隔离上下文自动生成缓存键，支持多层级隔离
 *
 * @param namespace - 命名空间
 * @param key - 缓存键名
 * @param context - 隔离上下文（可选）
 * @param prefix - 键前缀（可选）
 * @returns 完整的缓存键字符串
 *
 * @throws {CacheKeyValidationError} 如果键无效
 *
 * @example
 * ```typescript
 * // 平台级键
 * const platformKey = generateCacheKey('user', 'profile');
 * // 输出: platform:user:profile
 *
 * // 租户级键
 * const tenantKey = generateCacheKey('user', 'profile', tenantContext);
 * // 输出: tenant:tenant-123:user:profile
 *
 * // 组织级键
 * const orgKey = generateCacheKey('user', 'profile', orgContext);
 * // 输出: tenant:tenant-123:org:org-456:user:profile
 * ```
 */
export function generateCacheKey(
  namespace: string,
  key: string,
  context?: IsolationContext,
  prefix: string = "",
): string {
  // 验证输入参数
  validateKeyInputs(namespace, key);

  // 使用隔离上下文生成键
  if (context) {
    const isolationKey = context.buildCacheKey(namespace, key);
    return `${prefix}${isolationKey}`;
  }

  // 默认平台级键
  const platformKey = `platform:${namespace}:${key}`;
  return `${prefix}${platformKey}`;
}

/**
 * 生成缓存键模式
 *
 * @description 生成用于批量删除的键模式
 *
 * @param namespace - 命名空间
 * @param pattern - 键模式（可选）
 * @param context - 隔离上下文（可选）
 * @param prefix - 键前缀（可选）
 * @returns 键模式字符串
 *
 * @example
 * ```typescript
 * // 清除所有用户缓存
 * const pattern = generateCachePattern('user', '*');
 * // 输出: platform:user:*
 *
 * // 清除租户的所有用户缓存
 * const tenantPattern = generateCachePattern('user', '*', tenantContext);
 * // 输出: tenant:tenant-123:user:*
 * ```
 */
export function generateCachePattern(
  namespace: string,
  pattern: string = "*",
  context?: IsolationContext,
  prefix: string = "",
): string {
  // 验证输入参数
  validateKeyInputs(namespace, pattern);

  // 使用隔离上下文生成模式
  if (context) {
    const isolationKey = context.buildCacheKey(namespace, pattern);
    return `${prefix}${isolationKey}`;
  }

  // 默认平台级模式
  const platformPattern = `platform:${namespace}:${pattern}`;
  return `${prefix}${platformPattern}`;
}

/**
 * 验证键输入参数
 *
 * @description 验证命名空间和键的有效性
 *
 * @param namespace - 命名空间
 * @param key - 键名
 * @throws {CacheKeyValidationError} 如果参数无效
 * @private
 */
function validateKeyInputs(namespace: string, key: string): void {
  // 验证命名空间
  if (!namespace || typeof namespace !== "string") {
    throw new CacheKeyValidationError("命名空间必须是非空字符串", {
      namespace,
    });
  }

  if (namespace.length > 64) {
    throw new CacheKeyValidationError("命名空间长度不能超过 64 字符", {
      namespace,
      length: namespace.length,
    });
  }

  // 验证键名
  if (!key || typeof key !== "string") {
    throw new CacheKeyValidationError("键名必须是非空字符串", {
      key,
    });
  }

  if (key.length > 128) {
    throw new CacheKeyValidationError("键名长度不能超过 128 字符", {
      key,
      length: key.length,
    });
  }

  // 验证字符
  const invalidChars = /[^\w:_-]/;
  if (invalidChars.test(namespace)) {
    throw new CacheKeyValidationError(
      "命名空间包含无效字符，只能包含字母、数字、冒号、下划线和连字符",
      { namespace },
    );
  }

  if (invalidChars.test(key)) {
    throw new CacheKeyValidationError(
      "键名包含无效字符，只能包含字母、数字、冒号、下划线和连字符",
      { key },
    );
  }
}

/**
 * 检查键是否有效
 *
 * @description 检查键是否符合规范
 *
 * @param key - 要检查的键
 * @returns 如果键有效返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * if (isValidKey('user:profile')) {
 *   // 键有效，可以安全使用
 * }
 * ```
 */
export function isValidKey(key: string): boolean {
  if (!key || typeof key !== "string") {
    return false;
  }

  if (key.length > 256) {
    return false;
  }

  const invalidChars = /[^\w:_-]/;
  return !invalidChars.test(key);
}

/**
 * 清理键名
 *
 * @description 清理键名中的无效字符
 *
 * @param key - 原始键名
 * @returns 清理后的键名
 *
 * @example
 * ```typescript
 * const cleanKey = sanitizeKey('user@profile#123');
 * // 输出: user_profile_123
 * ```
 */
export function sanitizeKey(key: string): string {
  if (!key || typeof key !== "string") {
    return "";
  }

  // 替换无效字符为下划线
  return key.replace(/[^\w:_-]/g, "_");
}
