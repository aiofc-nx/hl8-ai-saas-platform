/**
 * 实体规格接口
 *
 * @description 定义实体验证规格，遵循规格模式（Specification Pattern）
 *
 * ## 设计原则
 *
 * ### 规格模式
 * - 封装业务规则和约束
 * - 提供可组合的验证逻辑
 * - 支持复杂的条件组合
 * - 提高代码的可读性和可维护性
 *
 * ### 业务规则管理
 * - 将业务规则从实体中分离
 * - 支持规则的重用和组合
 * - 提供清晰的规则描述
 * - 便于规则的管理和测试
 *
 * @example
 * ```typescript
 * export class ActiveUserSpecification implements IEntitySpecification<User> {
 *   isSatisfiedBy(entity: User): boolean {
 *     return entity.status === UserStatus.ACTIVE && !entity.isDeleted;
 *   }
 *
 *   getDescription(): string {
 *     return '活跃用户规格：用户状态为活跃且未被删除';
 *   }
 * }
 *
 * export class ValidEmailSpecification implements IEntitySpecification<User> {
 *   isSatisfiedBy(entity: User): boolean {
 *     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entity.email);
 *   }
 *
 *   getDescription(): string {
 *     return '有效邮箱规格：邮箱格式必须符合标准';
 *   }
 * }
 *
 * // 组合规格
 * export class ValidActiveUserSpecification implements IEntitySpecification<User> {
 *   constructor(
 *     private activeSpec = new ActiveUserSpecification(),
 *     private emailSpec = new ValidEmailSpecification()
 *   ) {}
 *
 *   isSatisfiedBy(entity: User): boolean {
 *     return this.activeSpec.isSatisfiedBy(entity) && this.emailSpec.isSatisfiedBy(entity);
 *   }
 *
 *   getDescription(): string {
 *     return `有效活跃用户规格：${this.activeSpec.getDescription()} 且 ${this.emailSpec.getDescription()}`;
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */

import { IEntity } from "./base-entity.interface.js";

/**
 * 实体规格接口
 *
 * 定义实体验证规格
 */
export interface IEntitySpecification<T extends IEntity> {
  /**
   * 检查实体是否满足规格
   *
   * @description 验证实体是否满足当前规格定义的条件
   * 这是规格模式的核心方法，用于业务规则验证
   *
   * @param entity - 要检查的实体
   * @returns 如果满足返回true，否则返回false
   *
   * @example
   * ```typescript
   * const spec = new ActiveUserSpecification();
   * const user = new User(...);
   *
   * if (spec.isSatisfiedBy(user)) {
   *   console.log('用户满足活跃用户规格');
   * }
   * ```
   */
  isSatisfiedBy(entity: T): boolean;

  /**
   * 获取规格描述
   *
   * @description 返回规格的描述信息，用于日志、调试和文档
   * 帮助开发者理解规格的具体含义和用途
   *
   * @returns 规格描述
   *
   * @example
   * ```typescript
   * const spec = new ActiveUserSpecification();
   * console.log(spec.getDescription()); // "活跃用户规格：用户状态为活跃且未被删除"
   * ```
   */
  getDescription(): string;
}
