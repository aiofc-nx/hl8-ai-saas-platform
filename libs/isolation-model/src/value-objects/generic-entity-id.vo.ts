/**
 * 通用实体 ID 值对象
 *
 * @description 提供通用的实体 ID 实现，用于测试和通用场景
 *
 * @since 1.0.0
 */

import { EntityId } from "./entity-id.vo.js";
import { randomUUID } from "node:crypto";

export class GenericEntityId extends EntityId<"GenericEntityId"> {
  private static cache = new Map<string, GenericEntityId>();

  private constructor(value: string) {
    super(value, "GenericEntityId");
  }

  static create(value: string): GenericEntityId {
    let instance = this.cache.get(value);
    if (!instance) {
      instance = new GenericEntityId(value);
      this.cache.set(value, instance);
    }
    return instance;
  }

  /**
   * 生成新的通用实体 ID
   *
   * @returns 新生成的 GenericEntityId 实例
   *
   * @example
   * ```typescript
   * const entityId = GenericEntityId.generate();
   * ```
   */
  static generate(): GenericEntityId {
    return this.create(randomUUID());
  }

  static clearCache(): void {
    this.cache.clear();
  }

  override equals(other?: GenericEntityId): boolean {
    return super.equals(other);
  }
}
