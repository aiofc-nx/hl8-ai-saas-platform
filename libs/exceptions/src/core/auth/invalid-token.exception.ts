import { AuthException } from "./auth.exception.js";

/**
 * 无效令牌异常
 *
 * @description 当提供的访问令牌无效时抛出此异常
 * 令牌可能被篡改、格式错误或已被撤销
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new InvalidTokenException('提供的访问令牌无效');
 *
 * // 带上下文数据
 * throw new InvalidTokenException('提供的访问令牌无效', {
 *   tokenId: 'token-123',
 *   reason: 'signature_invalid',
 *   userId: 'user-123'
 * });
 * ```
 */
export class InvalidTokenException extends AuthException {
  /**
   * 创建无效令牌异常
   *
   * @param reason - 令牌无效的原因
   * @param data - 附加数据，可包含令牌ID、无效原因等信息
   */
  constructor(reason: string, data?: Record<string, unknown>) {
    super(
      "AUTH_INVALID_TOKEN",
      "无效令牌",
      reason,
      401,
      data,
      "https://docs.hl8.com/errors#AUTH_INVALID_TOKEN",
    );
  }
}
