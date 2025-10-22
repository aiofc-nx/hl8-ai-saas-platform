import { IntegrationException } from "./integration.exception.js";

/**
 * 外部服务不可用异常
 *
 * @description 当外部服务不可用时抛出此异常
 * 通常用于第三方API调用、外部系统集成等场景
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new ExternalServiceUnavailableException('payment-gateway', '支付网关服务不可用');
 *
 * // 带上下文数据
 * throw new ExternalServiceUnavailableException('payment-gateway', '支付网关服务不可用', {
 *   serviceUrl: 'https://api.payment.com',
 *   statusCode: 503,
 *   retryAfter: 300
 * });
 * ```
 */
export class ExternalServiceUnavailableException extends IntegrationException {
  /**
   * 创建外部服务不可用异常
   *
   * @param serviceName - 服务名称
   * @param reason - 不可用的原因
   * @param data - 附加数据，可包含服务URL、状态码等
   */
  constructor(
    serviceName: string,
    reason: string,
    data?: Record<string, unknown>,
  ) {
    super(
      "INTEGRATION_EXTERNAL_SERVICE_UNAVAILABLE",
      "外部服务不可用",
      `外部服务 "${serviceName}" 不可用: ${reason}`,
      503,
      { serviceName, reason, ...data },
      "https://docs.hl8.com/errors#INTEGRATION_EXTERNAL_SERVICE_UNAVAILABLE",
    );
  }
}
