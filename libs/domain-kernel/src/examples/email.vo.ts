/**
 * 邮箱值对象
 * @description 封装邮箱地址的业务概念和验证规则
 *
 * @since 1.0.0
 */

import { BaseValueObject } from "../value-objects/base-value-object.js";
import { DomainValidationException } from "/home/arligle/hl8/hl8-ai-saas-platform/libs/exceptions/dist/core/domain/index.js";

/**
 * 邮箱值对象
 * @description 不可变的邮箱地址值对象
 */
export class Email extends BaseValueObject {
  private readonly value: string;

  private constructor(value: string) {
    super();
    this.value = value;
    // 在设置属性后进行验证
    this.validate();
  }

  /**
   * 验证邮箱格式
   * @throws {DomainValidationException} 当邮箱格式无效时
   */
  protected validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new DomainValidationException("email", "邮箱不能为空", {
        value: this.value,
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.value)) {
      throw new DomainValidationException("email", "邮箱格式不正确", {
        value: this.value,
      });
    }

    if (this.value.length > 254) {
      throw new DomainValidationException(
        "email",
        "邮箱长度不能超过254个字符",
        { value: this.value },
      );
    }
  }

  /**
   * 比较邮箱是否相等（忽略大小写）
   * @param other - 其他邮箱值对象
   * @returns 是否相等
   */
  protected arePropertiesEqual(other: Email): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  /**
   * 获取邮箱值
   * @returns 邮箱地址
   */
  getValue(): string {
    return this.value;
  }

  /**
   * 获取邮箱域名
   * @returns 域名部分
   */
  getDomain(): string {
    return this.value.split("@")[1];
  }

  /**
   * 获取邮箱本地部分
   * @returns 本地部分
   */
  getLocalPart(): string {
    return this.value.split("@")[0];
  }

  /**
   * 获取用于相等性比较的属性
   * @returns 属性对象
   */
  protected getPropertiesForEquality(): Record<string, unknown> {
    return { value: this.value.toLowerCase() };
  }

  /**
   * 创建邮箱值对象
   * @param value - 邮箱地址
   * @returns 邮箱值对象
   *
   * @example
   * ```typescript
   * const email = Email.create("test@example.com");
   * console.log(email.getValue()); // "test@example.com"
   * console.log(email.getDomain()); // "example.com"
   * ```
   */
  static create(value: string): Email {
    return new Email(value);
  }
}
