/**
 * 用户 ID 值对象
 *
 * @description 封装用户标识符，使用 UUID v4 格式
 *
 * @since 1.0.0
 */

import { EntityId } from "./entity-id.vo.js";
import { randomUUID } from "node:crypto";

export class UserId extends EntityId<"UserId"> {
  private static cache = new Map<string, UserId>();

  private constructor(value: string) {
    super(value, "UserId");
  }

  static create(value: string): UserId {
    let instance = this.cache.get(value);
    if (!instance) {
      instance = new UserId(value);
      this.cache.set(value, instance);
    }
    return instance;
  }

  /**
   * 生成新的用户 ID
   *
   * @returns 新生成的 UserId 实例
   *
   * @example
   * ```typescript
   * const userId = UserId.generate();
   * ```
   */
  static generate(): UserId {
    return this.create(randomUUID());
  }

  static clearCache(): void {
    this.cache.clear();
  }

  override equals(other?: UserId): boolean {
    return super.equals(other);
  }
}
