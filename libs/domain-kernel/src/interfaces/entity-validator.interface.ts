/**
 * 实体验证器接口
 *
 * @description 定义实体验证器的契约，支持复杂的验证逻辑
 *
 * ## 设计原则
 *
 * ### 验证器模式
 * - 封装复杂的验证逻辑
 * - 支持异步验证操作
 * - 提供详细的验证结果
 * - 支持验证器的组合和重用
 *
 * ### 验证结果管理
 * - 提供结构化的验证结果
 * - 支持错误和警告的区分
 * - 包含详细的错误信息
 * - 便于错误处理和用户反馈
 *
 * @example
 * ```typescript
 * export class UserValidator implements IEntityValidator<User> {
 *   async validate(entity: User): Promise<IEntityValidationResult> {
 *     const errors: Array<{ field: string; message: string; code: string }> = [];
 *     const warnings: Array<{ field: string; message: string; code: string }> = [];
 *
 *     // 验证用户名
 *     if (!entity.name || entity.name.trim().length === 0) {
 *       errors.push({
 *         field: 'name',
 *         message: '用户名不能为空',
 *         code: 'USER_NAME_REQUIRED'
 *       });
 *     }
 *
 *     // 验证邮箱格式
 *     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 *     if (!emailRegex.test(entity.email)) {
 *       errors.push({
 *         field: 'email',
 *         message: '邮箱格式不正确',
 *         code: 'INVALID_EMAIL_FORMAT'
 *       });
 *     }
 *
 *     // 异步验证邮箱唯一性
 *     const isEmailUnique = await this.checkEmailUniqueness(entity.email);
 *     if (!isEmailUnique) {
 *       errors.push({
 *         field: 'email',
 *         message: '邮箱已被使用',
 *         code: 'EMAIL_ALREADY_EXISTS'
 *       });
 *     }
 *
 *     return {
 *       isValid: errors.length === 0,
 *       errors,
 *       warnings
 *     };
 *   }
 *
 *   getValidatorName(): string {
 *     return 'UserValidator';
 *   }
 *
 *   private async checkEmailUniqueness(email: string): Promise<boolean> {
 *     // 实现邮箱唯一性检查逻辑
 *     return true;
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */

import { IEntity } from "./base-entity.interface.js";

/**
 * 实体验证器接口
 *
 * 定义实体验证器的契约
 */
export interface IEntityValidator<T extends IEntity> {
  /**
   * 验证实体
   *
   * @description 对实体进行全面验证，包括业务规则、数据完整性、约束条件等
   * 支持异步验证操作，如数据库查询、外部API调用等
   *
   * @param entity - 要验证的实体
   * @returns 验证结果，包含验证状态、错误和警告信息
   *
   * @example
   * ```typescript
   * const validator = new UserValidator();
   * const user = new User(...);
   *
   * const result = await validator.validate(user);
   * if (!result.isValid) {
   *   console.log('验证失败:', result.errors);
   * }
   * ```
   */
  validate(entity: T): Promise<IEntityValidationResult>;

  /**
   * 获取验证器名称
   *
   * @description 返回验证器的名称，用于日志记录、错误追踪和调试
   *
   * @returns 验证器名称
   *
   * @example
   * ```typescript
   * const validator = new UserValidator();
   * console.log(validator.getValidatorName()); // "UserValidator"
   * ```
   */
  getValidatorName(): string;
}

/**
 * 实体验证结果接口
 */
export interface IEntityValidationResult {
  /**
   * 验证是否通过
   *
   * @description 指示实体是否通过了所有验证规则
   * true表示验证通过，false表示存在验证错误
   */
  readonly isValid: boolean;

  /**
   * 验证错误列表
   *
   * @description 包含所有验证失败的错误信息
   * 每个错误包含字段名、错误消息和错误代码
   */
  readonly errors: Array<{
    readonly field: string;
    readonly message: string;
    readonly code: string;
  }>;

  /**
   * 验证警告列表
   *
   * @description 包含所有验证警告信息
   * 警告不会导致验证失败，但需要用户注意
   */
  readonly warnings: Array<{
    readonly field: string;
    readonly message: string;
    readonly code: string;
  }>;
}
