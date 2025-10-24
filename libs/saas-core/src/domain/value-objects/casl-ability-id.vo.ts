import { BaseValueObject } from "./base-value-object.js";

/**
 * CASL权限能力ID值对象
 *
 * @description 表示CASL权限能力的唯一标识符，确保全局唯一性
 * @since 1.0.0
 */
export class CaslAbilityId extends BaseValueObject<string> {
  /**
   * 验证CASL权限能力ID值
   *
   * @param value - CASL权限能力ID值
   * @throws {Error} 当CASL权限能力ID格式无效时抛出错误
   */
  protected validateValue(value: string): void {
    if (!value || typeof value !== "string") {
      throw new Error("CASL权限能力ID必须是非空字符串");
    }

    if (value.length < 3 || value.length > 50) {
      throw new Error("CASL权限能力ID长度必须在3-50个字符之间");
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      throw new Error("CASL权限能力ID只能包含字母、数字、连字符和下划线");
    }
  }

  /**
   * 获取CASL权限能力ID值
   *
   * @returns CASL权限能力ID字符串
   */
  getValue(): string {
    return this.value;
  }

  /**
   * 比较两个CASL权限能力ID是否相等
   *
   * @param other - 另一个CASL权限能力ID值对象
   * @returns 是否相等
   */
  equals(other: CaslAbilityId): boolean {
    return this.value === other.value;
  }
}
