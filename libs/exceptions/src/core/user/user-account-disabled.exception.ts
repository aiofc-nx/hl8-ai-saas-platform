import { UserException } from "./user.exception.js";

/**
 * 用户账户禁用异常
 *
 * @description 当用户账户被禁用时抛出此异常
 * 通常用于账户停用、注销等情况
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new UserAccountDisabledException('账户已被禁用');
 *
 * // 带上下文数据
 * throw new UserAccountDisabledException('账户已被禁用', {
 *   userId: 'user-123',
 *   disabledAt: new Date(),
 *   disabledBy: 'admin-456',
 *   reason: 'account_deactivation'
 * });
 * ```
 */
export class UserAccountDisabledException extends UserException {
  /**
   * 创建用户账户禁用异常
   *
   * @param reason - 禁用原因
   * @param data - 附加数据，可包含用户ID、禁用时间等信息
   */
  constructor(reason: string, data?: Record<string, unknown>) {
    super(
      "USER_ACCOUNT_DISABLED",
      "账户已禁用",
      reason,
      403,
      data,
      "https://docs.hl8.com/errors#USER_ACCOUNT_DISABLED",
    );
  }
}
