/**
 * 基础值对象类
 *
 * @description 为SAAS Core模块提供带泛型支持的值对象基类
 * @since 1.0.0
 */

import { BaseValueObject as DomainBaseValueObject } from "@hl8/domain-kernel";

/**
 * 基础值对象类
 *
 * 扩展domain-kernel的BaseValueObject，添加泛型支持
 *
 * @template T - 值对象的类型
 */
export abstract class BaseValueObject<T> extends DomainBaseValueObject {
  protected readonly _value: T;

  constructor(value: T) {
    super();
    this._value = value;
    this.validate();
  }

  /**
   * 获取值对象的原始值
   *
   * @returns 原始值
   */
  get value(): T {
    return this._value;
  }

  /**
   * 验证值对象的有效性
   *
   * @throws {Error} 当值对象无效时抛出异常
   */
  protected validate(): void {
    // 子类可以重写此方法进行验证
  }

  /**
   * 比较值对象的属性是否相等
   *
   * @param other - 其他值对象
   * @returns 属性是否相等
   */
  protected arePropertiesEqual(other: BaseValueObject<T>): boolean {
    return this._value === other._value;
  }

  /**
   * 获取用于相等性比较的属性
   *
   * @returns 属性对象
   */
  protected getPropertiesForEquality(): Record<string, unknown> {
    return { value: this._value };
  }

  /**
   * 获取值对象的字符串表示
   *
   * @returns 字符串表示
   */
  toString(): string {
    return String(this._value);
  }
}
