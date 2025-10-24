import { BaseValueObject } from "./base-value-object.js";

/**
 * 租户ID值对象
 *
 * @description 表示租户的唯一标识符，确保全局唯一性
 * @since 1.0.0
 */
export class TenantId extends BaseValueObject<string> {
  /**
   * 验证租户ID值
   *
   * @param value - 租户ID值
   * @throws {Error} 当租户ID格式无效时抛出错误
   */
  protected validateValue(value: string): void {
    if (!value || typeof value !== "string") {
      throw new Error("租户ID必须是非空字符串");
    }

    if (value.length < 3 || value.length > 50) {
      throw new Error("租户ID长度必须在3-50个字符之间");
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      throw new Error("租户ID只能包含字母、数字、连字符和下划线");
    }
  }

  /**
   * 获取租户ID值
   *
   * @returns 租户ID字符串
   */
  getValue(): string {
    return this.value;
  }

  /**
   * 比较两个租户ID是否相等
   *
   * @param other - 另一个租户ID值对象
   * @returns 是否相等
   */
  equals(other: TenantId): boolean {
    return this.value === other.value;
  }
}
