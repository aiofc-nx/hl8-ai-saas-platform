/**
 * 租户名称值对象
 *
 * @description 表示租户的显示名称，支持多语言和特殊字符
 * @since 1.0.0
 */

import { BaseValueObject } from "@hl8/domain-kernel";

/**
 * 租户名称值对象
 *
 * 租户名称是租户的显示名称，用于用户界面和文档中显示。
 * 名称必须遵循特定的规则：1-100个字符，不能为空或只包含空白字符，
 * 支持多语言字符和特殊符号。
 *
 * @example
 * ```typescript
 * const tenantName = new TenantName("Acme Corporation");
 * console.log(tenantName.value); // "Acme Corporation"
 * ```
 */
export class TenantName extends BaseValueObject<string> {
  constructor(value: string) {
    super(value);
    this.validateValue(value);
  }

  /**
   * 验证租户名称格式
   *
   * @param value - 租户名称值
   * @throws {Error} 当名称格式不符合要求时抛出错误
   */
  private validateValue(value: string): void {
    if (!value || typeof value !== "string") {
      throw new Error("租户名称不能为空");
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      throw new Error("租户名称不能只包含空白字符");
    }

    if (trimmedValue.length > 100) {
      throw new Error("租户名称长度不能超过100个字符");
    }
  }

  /**
   * 获取租户名称的字符串表示
   *
   * @returns 租户名称字符串
   */
  toString(): string {
    return this.value.trim();
  }

  /**
   * 检查是否为有效的租户名称格式
   *
   * @param value - 要检查的值
   * @returns 是否为有效格式
   */
  static isValid(value: string): boolean {
    try {
      new TenantName(value);
      return true;
    } catch {
      return false;
    }
  }
}
