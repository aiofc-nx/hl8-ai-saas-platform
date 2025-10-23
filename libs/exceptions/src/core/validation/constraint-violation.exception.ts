import { ValidationException } from "./validation.exception.js";

/**
 * 约束违规异常
 *
 * @description 当违反数据约束时抛出此异常
 * 通常用于数据库约束、数据完整性检查等场景
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new ConstraintViolationException('UNIQUE_CONSTRAINT', '用户邮箱必须唯一');
 *
 * // 带上下文数据
 * throw new ConstraintViolationException('UNIQUE_CONSTRAINT', '用户邮箱必须唯一', {
 *   constraintType: 'unique',
 *   tableName: 'users',
 *   columnName: 'email',
 *   value: 'john@example.com'
 * });
 * ```
 */
export class ConstraintViolationException extends ValidationException {
  /**
   * 创建约束违规异常
   *
   * @param constraintType - 约束类型
   * @param violation - 违规详情
   * @param data - 附加数据，可包含表名、列名、值等信息
   */
  constructor(
    constraintType: string,
    violation: string,
    data?: Record<string, unknown>,
  ) {
    super(
      "CONSTRAINT_VIOLATION",
      "约束违规",
      `${constraintType} 约束被违反: ${violation}`,
      422,
      { constraintType, violation, ...data },
      "https://docs.hl8.com/errors#CONSTRAINT_VIOLATION",
    );
  }
}
