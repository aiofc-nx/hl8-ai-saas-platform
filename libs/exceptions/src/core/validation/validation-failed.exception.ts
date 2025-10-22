import { ValidationException } from "./validation.exception.js";

/**
 * 验证失败异常
 *
 * @description 当数据验证失败时抛出此异常
 * 通常用于输入验证、数据格式验证等场景
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new ValidationFailedException('email', '邮箱格式无效');
 *
 * // 带上下文数据
 * throw new ValidationFailedException('email', '邮箱格式无效', {
 *   providedValue: 'invalid-email',
 *   expectedFormat: 'user@example.com',
 *   validationRule: 'email_format'
 * });
 * ```
 */
export class ValidationFailedException extends ValidationException {
  /**
   * 创建验证失败异常
   *
   * @param field - 验证失败的字段名
   * @param reason - 验证失败的原因
   * @param data - 附加数据，可包含提供的值、期望格式等信息
   */
  constructor(field: string, reason: string, data?: Record<string, unknown>) {
    super(
      "VALIDATION_FAILED",
      "数据验证失败",
      `字段 "${field}" 验证失败: ${reason}`,
      400,
      { field, reason, ...data },
      "https://docs.hl8.com/errors#VALIDATION_FAILED",
    );
  }
}
