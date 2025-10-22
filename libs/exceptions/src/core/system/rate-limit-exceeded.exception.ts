import { SystemException } from "./system.exception.js";

/**
 * 速率限制超出异常
 *
 * @description 当请求频率超出限制时抛出此异常
 * 通常用于API限流、防刷等场景
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new RateLimitExceededException('API请求频率超出限制');
 *
 * // 带上下文数据
 * throw new RateLimitExceededException('API请求频率超出限制', {
 *   limit: 100,
 *   window: '1h',
 *   retryAfter: 3600,
 *   userId: 'user-123'
 * });
 * ```
 */
export class RateLimitExceededException extends SystemException {
  /**
   * 创建速率限制超出异常
   *
   * @param reason - 超出限制的原因
   * @param data - 附加数据，可包含限制信息、重试时间等
   */
  constructor(reason: string, data?: Record<string, unknown>) {
    super(
      "SYSTEM_RATE_LIMIT_EXCEEDED",
      "速率限制超出",
      reason,
      429,
      data,
      "https://docs.hl8.com/errors#SYSTEM_RATE_LIMIT_EXCEEDED",
    );
  }
}
