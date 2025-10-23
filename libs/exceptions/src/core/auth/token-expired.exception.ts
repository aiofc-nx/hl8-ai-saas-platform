import { AuthException } from "./auth.exception.js";

/**
 * 令牌过期异常
 *
 * @description 当访问令牌已过期时抛出此异常
 * 客户端需要重新获取令牌或重新登录
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new TokenExpiredException('访问令牌已过期');
 *
 * // 带上下文数据
 * throw new TokenExpiredException('访问令牌已过期', {
 *   tokenId: 'token-123',
 *   expiredAt: new Date(),
 *   userId: 'user-123'
 * });
 * ```
 */
export class TokenExpiredException extends AuthException {
  /**
   * 创建令牌过期异常
   *
   * @param reason - 令牌过期的原因
   * @param data - 附加数据，可包含令牌ID、过期时间等信息
   */
  constructor(reason: string, data?: Record<string, unknown>) {
    super(
      "AUTH_TOKEN_EXPIRED",
      "令牌已过期",
      reason,
      401,
      data,
      "https://docs.hl8.com/errors#AUTH_TOKEN_EXPIRED",
    );
  }
}
