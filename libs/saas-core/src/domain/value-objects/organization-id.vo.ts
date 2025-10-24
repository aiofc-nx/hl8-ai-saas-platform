import { BaseValueObject } from "./base-value-object.js";

/**
 * 组织ID值对象
 *
 * @description 表示组织的唯一标识符，确保全局唯一性
 * @since 1.0.0
 */
export class OrganizationId extends BaseValueObject<string> {
  /**
   * 验证组织ID值
   *
   * @param value - 组织ID值
   * @throws {Error} 当组织ID格式无效时抛出错误
   */
  protected validateValue(value: string): void {
    if (!value || typeof value !== "string") {
      throw new Error("组织ID必须是非空字符串");
    }

    if (value.length < 3 || value.length > 50) {
      throw new Error("组织ID长度必须在3-50个字符之间");
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      throw new Error("组织ID只能包含字母、数字、连字符和下划线");
    }
  }

  /**
   * 获取组织ID值
   *
   * @returns 组织ID字符串
   */
  getValue(): string {
    return this.value;
  }

  /**
   * 比较两个组织ID是否相等
   *
   * @param other - 另一个组织ID值对象
   * @returns 是否相等
   */
  equals(other: OrganizationId): boolean {
    return this.value === other.value;
  }
}
