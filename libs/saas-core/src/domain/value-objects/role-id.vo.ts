import { BaseValueObject } from "./base-value-object.js";

/**
 * 角色ID值对象
 *
 * @description 表示角色的唯一标识符，确保全局唯一性
 * @since 1.0.0
 */
export class RoleId extends BaseValueObject<string> {
  /**
   * 验证角色ID值
   *
   * @param value - 角色ID值
   * @throws {Error} 当角色ID格式无效时抛出错误
   */
  protected validateValue(value: string): void {
    if (!value || typeof value !== "string") {
      throw new Error("角色ID必须是非空字符串");
    }

    if (value.length < 3 || value.length > 50) {
      throw new Error("角色ID长度必须在3-50个字符之间");
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      throw new Error("角色ID只能包含字母、数字、连字符和下划线");
    }
  }

  /**
   * 获取角色ID值
   *
   * @returns 角色ID字符串
   */
  getValue(): string {
    return this.value;
  }

  /**
   * 比较两个角色ID是否相等
   *
   * @param other - 另一个角色ID值对象
   * @returns 是否相等
   */
  equals(other: RoleId): boolean {
    return this.value === other.value;
  }
}
