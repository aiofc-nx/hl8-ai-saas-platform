import { UserException } from "./user.exception.js";

/**
 * 用户已存在异常
 *
 * @description 当尝试创建已存在的用户时抛出此异常
 * 通常用于用户注册、导入等操作
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new UserAlreadyExistsException('john@example.com', 'email');
 *
 * // 带上下文数据
 * throw new UserAlreadyExistsException('john@example.com', 'email', {
 *   existingUserId: 'user-456',
 *   requestId: 'req-789'
 * });
 * ```
 */
export class UserAlreadyExistsException extends UserException {
  /**
   * 创建用户已存在异常
   *
   * @param identifier - 用户标识符（如邮箱、用户名等）
   * @param field - 冲突的字段名
   * @param data - 附加数据，可包含现有用户ID等信息
   */
  constructor(
    identifier: string,
    field: string,
    data?: Record<string, unknown>,
  ) {
    super(
      "USER_ALREADY_EXISTS",
      "用户已存在",
      `用户 ${field} "${identifier}" 已存在`,
      409,
      { identifier, field, ...data },
      "https://docs.hl8.com/errors#USER_ALREADY_EXISTS",
    );
  }
}
