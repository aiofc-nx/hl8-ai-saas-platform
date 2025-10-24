/**
 * 租户代码值对象
 *
 * @description 表示租户的唯一标识代码，遵循特定的命名规则和格式
 * @since 1.0.0
 */

import { BaseValueObject } from "./base-value-object.js";

/**
 * 租户代码值对象
 *
 * 租户代码是租户的唯一标识符，用于多租户架构中的数据隔离和识别。
 * 代码必须遵循特定的命名规则：3-20个字符，只能包含字母、数字和连字符，
 * 不能以数字或连字符开头或结尾。
 *
 * @example
 * ```typescript
 * const tenantCode = new TenantCode("acme-corp");
 * console.log(tenantCode.value); // "acme-corp"
 * ```
 */
export class TenantCode extends BaseValueObject<string> {
  private static readonly PATTERN = /^[a-zA-Z][a-zA-Z0-9-]{1,18}[a-zA-Z0-9]$/;

  constructor(value: string) {
    super(value);
    this.validateValue(value);
  }

  /**
   * 验证租户代码格式
   *
   * @param value - 租户代码值
   * @throws {Error} 当代码格式不符合要求时抛出错误
   */
  private validateValue(value: string): void {
    if (!value || typeof value !== "string") {
      throw new Error("租户代码不能为空");
    }

    if (value.length < 3 || value.length > 20) {
      throw new Error("租户代码长度必须在3-20个字符之间");
    }

    if (!TenantCode.PATTERN.test(value)) {
      throw new Error(
        "租户代码只能包含字母、数字和连字符，不能以数字或连字符开头或结尾",
      );
    }
  }

  /**
   * 获取租户代码的字符串表示
   *
   * @returns 租户代码字符串
   */
  toString(): string {
    return this.value;
  }

  /**
   * 检查是否为有效的租户代码格式
   *
   * @param value - 要检查的值
   * @returns 是否为有效格式
   */
  static isValid(value: string): boolean {
    try {
      new TenantCode(value);
      return true;
    } catch {
      return false;
    }
  }
}
