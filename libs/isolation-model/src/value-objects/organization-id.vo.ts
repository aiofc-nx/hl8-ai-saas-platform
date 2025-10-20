/**
 * 组织 ID 值对象
 *
 * @description 封装组织标识符，使用 UUID v4 格式
 *
 * @since 1.0.0
 */

import { EntityId } from "./entity-id.vo.js";
import { randomUUID } from "node:crypto";

export class OrganizationId extends EntityId<"OrganizationId"> {
  private static cache = new Map<string, OrganizationId>();

  private constructor(value: string) {
    super(value, "OrganizationId");
  }

  static create(value: string): OrganizationId {
    let instance = this.cache.get(value);
    if (!instance) {
      instance = new OrganizationId(value);
      this.cache.set(value, instance);
    }
    return instance;
  }

  /**
   * 生成新的组织 ID
   *
   * @returns 新生成的 OrganizationId 实例
   *
   * @example
   * ```typescript
   * const organizationId = OrganizationId.generate();
   * ```
   */
  static generate(): OrganizationId {
    return this.create(randomUUID());
  }

  static clearCache(): void {
    this.cache.clear();
  }

  override equals(other?: OrganizationId): boolean {
    return super.equals(other);
  }
}
