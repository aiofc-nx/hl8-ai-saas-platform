import { UserException } from "./user.exception.js";

/**
 * 用户账户锁定异常
 *
 * @description 当用户账户被锁定时抛出此异常
 * 通常用于登录失败次数过多、管理员锁定等情况
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new UserAccountLockedException('账户被管理员锁定');
 *
 * // 带上下文数据
 * throw new UserAccountLockedException('账户被管理员锁定', {
 *   userId: 'user-123',
 *   lockReason: 'admin_lock',
 *   lockedAt: new Date(),
 *   lockUntil: new Date(Date.now() + 24 * 60 * 60 * 1000)
 * });
 * ```
 */
export class UserAccountLockedException extends UserException {
  /**
   * 创建用户账户锁定异常
   *
   * @param reason - 锁定原因
   * @param data - 附加数据，可包含用户ID、锁定时间等信息
   */
  constructor(reason: string, data?: Record<string, unknown>) {
    super(
      "USER_ACCOUNT_LOCKED",
      "账户被锁定",
      reason,
      423,
      data,
      "https://docs.hl8.com/errors#USER_ACCOUNT_LOCKED",
    );
  }
}
