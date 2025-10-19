/**
 * 简化的序列化工具
 *
 * @description 提供简单直接的序列化/反序列化功能，替代复杂的 CacheEntry 值对象
 *
 * @since 1.0.0
 */

import { CacheSerializationError } from "../exceptions/cache.exceptions.js";

/**
 * 序列化值为字符串
 *
 * @description 将任意值序列化为 JSON 字符串，支持特殊类型处理
 *
 * @param value - 要序列化的值
 * @returns 序列化后的字符串
 *
 * @throws {CacheSerializationError} 当值无法序列化时抛出
 *
 * @example
 * ```typescript
 * const obj = {
 *   name: 'John',
 *   age: 30,
 *   createdAt: new Date(),
 * };
 *
 * const serialized = serialize(obj);
 * await redis.set('user:123', serialized);
 * ```
 */
export function serialize(value: any): string {
  if (value === undefined) {
    return "undefined";
  }

  if (value === null) {
    return "null";
  }

  // 处理基本类型
  if (typeof value !== "object") {
    return JSON.stringify(value);
  }

  // 处理顶层特殊类型
  if (value instanceof Date) {
    return JSON.stringify({ __type: "Date", value: value.toISOString() });
  }

  if (value instanceof RegExp) {
    return JSON.stringify({ __type: "RegExp", value: value.toString() });
  }

  // 处理循环引用
  const seen = new WeakSet();

  try {
    return JSON.stringify(value, (key, val) => {
      // 处理循环引用
      if (typeof val === "object" && val !== null) {
        if (seen.has(val)) {
          return "[Circular]";
        }
        seen.add(val);
      }

      // 处理特殊类型
      if (val instanceof Date) {
        return { __type: "Date", value: val.toISOString() };
      }

      if (val instanceof RegExp) {
        return { __type: "RegExp", value: val.toString() };
      }

      if (val instanceof Set) {
        return { __type: "Set", value: Array.from(val) };
      }

      if (val instanceof Map) {
        return { __type: "Map", value: Array.from(val.entries()) };
      }

      if (Buffer.isBuffer(val)) {
        return { __type: "Buffer", value: val.toString("base64") };
      }

      return val;
    });
  } catch (error) {
    throw new CacheSerializationError(
      `序列化失败: ${error instanceof Error ? error.message : String(error)}`,
      error instanceof Error ? error : undefined,
      { value: typeof value },
    );
  }
}

/**
 * 反序列化字符串为值
 *
 * @description 将序列化的字符串反序列化为原始值，支持特殊类型恢复
 *
 * @param value - 要反序列化的字符串
 * @returns 反序列化后的值
 *
 * @throws {CacheSerializationError} 当字符串无法反序列化时抛出
 *
 * @example
 * ```typescript
 * const serialized = await redis.get('user:123');
 * if (serialized) {
 *   const user = deserialize<User>(serialized);
 *   console.log(user.name);
 * }
 * ```
 */
export function deserialize<T = any>(value: string): T {
  if (value === "undefined") {
    return undefined as T;
  }

  if (value === "null") {
    return null as T;
  }

  try {
    return JSON.parse(value, (key, val) => {
      // 恢复特殊类型
      if (val && typeof val === "object" && val.__type) {
        switch (val.__type) {
          case "Date":
            return new Date(val.value);

          case "RegExp": {
            const match = val.value.match(/^\/(.*)\/([gimuy]*)$/);
            if (match) {
              return new RegExp(match[1], match[2]);
            }
            return new RegExp(val.value);
          }

          case "Set":
            return new Set(val.value);

          case "Map":
            return new Map(val.value);

          case "Buffer":
            return Buffer.from(val.value, "base64");

          case "undefined":
            return undefined;

          case "Circular":
            return "[Circular]";

          default:
            return val;
        }
      }

      return val;
    });
  } catch (error) {
    throw new CacheSerializationError(
      `反序列化失败: ${error instanceof Error ? error.message : String(error)}`,
      error instanceof Error ? error : undefined,
      { value: value.substring(0, 100) },
    );
  }
}

/**
 * 检查值是否可序列化
 *
 * @description 检查值是否可以安全序列化
 *
 * @param value - 要检查的值
 * @returns 如果可序列化返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * const obj = { name: 'John' };
 *
 * if (isSerializable(obj)) {
 *   await cacheService.set('user', 'john', obj);
 * }
 * ```
 */
export function isSerializable(value: any): boolean {
  if (value === undefined || value === null) {
    return true;
  }

  const type = typeof value;

  if (type === "string" || type === "number" || type === "boolean") {
    return true;
  }

  if (type === "function" || type === "symbol") {
    return false;
  }

  try {
    serialize(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取序列化后的大小
 *
 * @description 获取值序列化后的字节大小
 *
 * @param value - 要检查的值
 * @returns 序列化后的字节大小
 *
 * @example
 * ```typescript
 * const size = getSerializedSize(largeObject);
 * if (size > 1024 * 1024) {
 *   console.warn('对象过大，可能影响性能');
 * }
 * ```
 */
export function getSerializedSize(value: any): number {
  try {
    const serialized = serialize(value);
    return Buffer.byteLength(serialized, "utf-8");
  } catch {
    return 0;
  }
}

/**
 * 检查序列化大小是否超过限制
 *
 * @description 检查序列化后的大小是否超过指定限制
 *
 * @param value - 要检查的值
 * @param maxSize - 最大大小（字节），默认 1MB
 * @returns 如果超过限制返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * if (isOversized(largeObject, 512 * 1024)) {
 *   console.warn('对象超过 512KB 限制');
 * }
 * ```
 */
export function isOversized(
  value: any,
  maxSize: number = 1024 * 1024,
): boolean {
  const size = getSerializedSize(value);
  return size > maxSize;
}
