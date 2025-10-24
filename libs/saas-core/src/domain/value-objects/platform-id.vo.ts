import { BaseValueObject } from "./base-value-object.js";

/**
 * 平台ID值对象
 *
 * @description 表示平台的唯一标识符，确保全局唯一性
 * @since 1.0.0
 */
export class PlatformId extends BaseValueObject<string> {
  /**
   * 验证平台ID值
   *
   * @param value - 平台ID值
   * @throws {Error} 当平台ID格式无效时抛出错误
   */
  protected validateValue(value: string): void {
    if (!value || typeof value !== "string") {
      throw new Error("平台ID必须是非空字符串");
    }

    if (value.length < 3 || value.length > 50) {
      throw new Error("平台ID长度必须在3-50个字符之间");
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      throw new Error("平台ID只能包含字母、数字、连字符和下划线");
    }
  }

  /**
   * 获取平台ID值
   *
   * @returns 平台ID字符串
   */
  getValue(): string {
    return this.value;
  }

  /**
   * 比较两个平台ID是否相等
   *
   * @param other - 另一个平台ID值对象
   * @returns 是否相等
   */
  equals(other: PlatformId): boolean {
    return this.value === other.value;
  }
}
