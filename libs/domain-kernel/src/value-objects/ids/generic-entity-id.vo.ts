/**
 * 通用实体ID值对象
 * @description 提供通用实体标识符，支持缓存和实例复用
 *
 * ## 特性
 * - 继承自 EntityId 基类
 * - 支持实例缓存，避免重复创建相同值的对象
 * - 提供 UUID 生成功能
 * - 支持缓存管理
 *
 * @since 1.0.0
 */

import { EntityId } from "./entity-id.vo.js";
import { randomUUID } from "node:crypto";

/**
 * 通用实体ID值对象
 * @description 通用实体标识符，支持缓存机制
 */
export class GenericEntityId extends EntityId<"GenericEntityId"> {
  /** 实例缓存，避免重复创建相同值的对象 */
  private static cache = new Map<string, GenericEntityId>();

  /**
   * 私有构造函数 - 强制使用静态工厂方法
   * @param value - UUID 字符串值
   */
  private constructor(value: string) {
    super(value, "GenericEntityId");
  }

  /**
   * 创建通用实体ID
   * @description 从指定值创建通用实体ID，支持实例缓存
   *
   * @param value - UUID 字符串值
   * @returns 通用实体ID实例
   *
   * @example
   * ```typescript
   * const id = GenericEntityId.create("123e4567-e89b-12d3-a456-426614174000");
   * ```
   */
  static create(value: string): GenericEntityId {
    let instance = this.cache.get(value);
    if (!instance) {
      instance = new GenericEntityId(value);
      this.cache.set(value, instance);
    }
    return instance;
  }

  /**
   * 生成新的通用实体ID
   * @description 生成新的 UUID v4 通用实体ID
   *
   * @returns 新的通用实体ID实例
   *
   * @example
   * ```typescript
   * const id = GenericEntityId.generate();
   * console.log(id.getValue()); // "123e4567-e89b-12d3-a456-426614174000"
   * ```
   */
  static generate(): GenericEntityId {
    return this.create(randomUUID());
  }

  /**
   * 清空缓存
   * @description 清空所有缓存的通用实体ID实例
   *
   * @example
   * ```typescript
   * GenericEntityId.clearCache();
   * ```
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * 比较通用实体ID是否相等
   * @description 重写父类方法，提供类型安全的比较
   *
   * @param other - 其他通用实体ID
   * @returns 是否相等
   *
   * @example
   * ```typescript
   * const id1 = GenericEntityId.create("123");
   * const id2 = GenericEntityId.create("123");
   * console.log(id1.equals(id2)); // true
   * ```
   */
  override equals(other?: GenericEntityId): boolean {
    return super.equals(other);
  }
}
