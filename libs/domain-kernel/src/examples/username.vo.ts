/**
 * 用户名值对象
 * @description 封装用户名的业务概念和验证规则
 *
 * @since 1.0.0
 */

import { BaseValueObject } from "../value-objects/base-value-object.js";
import { IsolationValidationError } from "../isolation/isolation-validation.error.js";

/**
 * 用户名值对象
 * @description 不可变的用户名值对象
 */
export class Username extends BaseValueObject {
  private constructor(private readonly value: string) {
    super();
  }

  /**
   * 验证用户名格式
   * @throws {IsolationValidationError} 当用户名格式无效时
   */
  protected validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new IsolationValidationError(
        "用户名不能为空",
        "INVALID_USERNAME_EMPTY",
        { value: this.value },
      );
    }

    if (this.value.length < 3) {
      throw new IsolationValidationError(
        "用户名长度不能少于3个字符",
        "INVALID_USERNAME_TOO_SHORT",
        { value: this.value },
      );
    }

    if (this.value.length > 50) {
      throw new IsolationValidationError(
        "用户名长度不能超过50个字符",
        "INVALID_USERNAME_TOO_LONG",
        { value: this.value },
      );
    }

    // 用户名只能包含字母、数字、下划线和连字符
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(this.value)) {
      throw new IsolationValidationError(
        "用户名只能包含字母、数字、下划线和连字符",
        "INVALID_USERNAME_FORMAT",
        { value: this.value },
      );
    }

    // 用户名不能以数字开头
    if (/^\d/.test(this.value)) {
      throw new IsolationValidationError(
        "用户名不能以数字开头",
        "INVALID_USERNAME_STARTS_WITH_NUMBER",
        { value: this.value },
      );
    }
  }

  /**
   * 比较用户名是否相等（忽略大小写）
   * @param other - 其他用户名值对象
   * @returns 是否相等
   */
  protected arePropertiesEqual(other: Username): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  /**
   * 获取用户名值
   * @returns 用户名
   */
  getValue(): string {
    return this.value;
  }

  /**
   * 获取用于相等性比较的属性
   * @returns 属性对象
   */
  protected getPropertiesForEquality(): Record<string, unknown> {
    return { value: this.value.toLowerCase() };
  }

  /**
   * 创建用户名值对象
   * @param value - 用户名
   * @returns 用户名值对象
   *
   * @example
   * ```typescript
   * const username = Username.create("john_doe");
   * console.log(username.getValue()); // "john_doe"
   * ```
   */
  static create(value: string): Username {
    return new Username(value);
  }
}
