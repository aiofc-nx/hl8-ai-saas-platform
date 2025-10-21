/**
 * 基础值对象类
 * @description 所有值对象的基类，提供不可变性和相等性比较
 *
 * ## 值对象特性
 * - 不可变性：创建后不能修改
 * - 相等性：基于属性值比较
 * - 无标识符：不依赖ID
 * - 业务概念封装：封装业务概念和规则
 *
 * @since 1.0.0
 */

/**
 * 基础值对象类
 */
export abstract class BaseValueObject {
  /**
   * 构造函数
   */
  constructor() {
    // 值对象创建时进行验证
    this.validate();
  }

  /**
   * 验证值对象的有效性
   * @description 子类必须实现此方法进行业务规则验证
   *
   * @throws {Error} 当值对象无效时抛出异常
   *
   * @example
   * ```typescript
   * protected validate(): void {
   *   if (!this.value || this.value.trim().length === 0) {
   *     throw new InvalidEmailException("邮箱不能为空");
   *   }
   * }
   * ```
   */
  protected abstract validate(): void;

  /**
   * 比较值对象是否相等
   * @param other - 其他值对象
   * @returns 是否相等
   *
   * @example
   * ```typescript
   * const email1 = Email.create("test@example.com");
   * const email2 = Email.create("TEST@EXAMPLE.COM");
   * console.log(email1.equals(email2)); // true（忽略大小写）
   * ```
   */
  equals(other?: BaseValueObject): boolean {
    if (!other) return false;
    if (this.constructor !== other.constructor) return false;
    return this.arePropertiesEqual(other as any);
  }

  /**
   * 比较值对象的属性是否相等
   * @description 子类必须实现此方法进行属性比较
   *
   * @param other - 其他值对象
   * @returns 属性是否相等
   *
   * @example
   * ```typescript
   * protected arePropertiesEqual(other: Email): boolean {
   *   return this.value.toLowerCase() === other.value.toLowerCase();
   * }
   * ```
   */
  protected abstract arePropertiesEqual(other: BaseValueObject): boolean;

  /**
   * 获取值对象的哈希码
   * @returns 哈希码
   */
  getHashCode(): string {
    return JSON.stringify(this.getPropertiesForEquality());
  }

  /**
   * 获取用于相等性比较的属性
   * @description 子类可以重写此方法指定用于比较的属性
   *
   * @returns 属性对象
   */
  protected getPropertiesForEquality(): Record<string, any> {
    return {};
  }

  /**
   * 获取值对象的字符串表示
   * @returns 字符串表示
   */
  toString(): string {
    return `${this.constructor.name}(${JSON.stringify(this.getPropertiesForEquality())})`;
  }

  /**
   * 克隆值对象
   * @description 创建值对象的副本
   *
   * @returns 新的值对象实例
   */
  clone(): BaseValueObject {
    return Object.create(
      Object.getPrototypeOf(this),
      Object.getOwnPropertyDescriptors(this),
    );
  }
}
