import { UserException } from "./user.exception.js";

/**
 * 用户状态无效异常
 *
 * @description 当用户状态不符合操作要求时抛出此异常
 * 通常用于状态验证、状态转换等操作
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new InvalidUserStatusException('locked', 'active');
 *
 * // 带上下文数据
 * throw new InvalidUserStatusException('locked', 'active', {
 *   userId: 'user-123',
 *   operation: 'login',
 *   reason: 'account_locked'
 * });
 * ```
 */
export class InvalidUserStatusException extends UserException {
  /**
   * 创建用户状态无效异常
   *
   * @param currentStatus - 当前状态
   * @param expectedStatus - 期望状态
   * @param data - 附加数据，可包含用户ID、操作信息等
   */
  constructor(
    currentStatus: string,
    expectedStatus: string,
    data?: Record<string, unknown>,
  ) {
    super(
      "USER_INVALID_STATUS",
      "用户状态无效",
      `用户状态 "${currentStatus}" 无效，期望状态为 "${expectedStatus}"`,
      400,
      { currentStatus, expectedStatus, ...data },
      "https://docs.hl8.com/errors#USER_INVALID_STATUS",
    );
  }
}
