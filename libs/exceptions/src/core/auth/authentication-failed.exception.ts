import { AuthException } from "./auth.exception.js";

/**
 * 认证失败异常
 *
 * @description 当用户认证失败时抛出此异常
 * 通常由于用户名或密码错误、账户被锁定等原因
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new AuthenticationFailedException('密码错误');
 *
 * // 带上下文数据
 * throw new AuthenticationFailedException('密码错误', {
 *   username: 'john.doe',
 *   attemptCount: 3,
 *   lockUntil: new Date(Date.now() + 15 * 60 * 1000)
 * });
 * ```
 */
export class AuthenticationFailedException extends AuthException {
  /**
   * 创建认证失败异常
   *
   * @param reason - 认证失败的原因
   * @param data - 附加数据，可包含用户名、尝试次数等信息
   */
  constructor(reason: string, data?: Record<string, unknown>) {
    super(
      "AUTH_LOGIN_FAILED",
      "认证失败",
      reason,
      401,
      data,
      "https://docs.hl8.com/errors#AUTH_LOGIN_FAILED",
    );
  }
}
