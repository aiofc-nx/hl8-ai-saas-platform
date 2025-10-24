import { BaseValueObject } from "./base-value-object.js";

/**
 * 部门ID值对象
 *
 * @description 表示部门的唯一标识符，确保全局唯一性
 * @since 1.0.0
 */
export class DepartmentId extends BaseValueObject<string> {
  /**
   * 验证部门ID值
   *
   * @param value - 部门ID值
   * @throws {Error} 当部门ID格式无效时抛出错误
   */
  protected validateValue(value: string): void {
    if (!value || typeof value !== "string") {
      throw new Error("部门ID必须是非空字符串");
    }

    if (value.length < 3 || value.length > 50) {
      throw new Error("部门ID长度必须在3-50个字符之间");
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      throw new Error("部门ID只能包含字母、数字、连字符和下划线");
    }
  }

  /**
   * 获取部门ID值
   *
   * @returns 部门ID字符串
   */
  getValue(): string {
    return this.value;
  }

  /**
   * 比较两个部门ID是否相等
   *
   * @param other - 另一个部门ID值对象
   * @returns 是否相等
   */
  equals(other: DepartmentId): boolean {
    return this.value === other.value;
  }
}
