import { IntegrationException } from "./integration.exception.js";

/**
 * 外部服务超时异常
 *
 * @description 当外部服务调用超时时抛出此异常
 * 通常用于网络超时、服务响应超时等场景
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new ExternalServiceTimeoutException('payment-gateway', 5000);
 *
 * // 带上下文数据
 * throw new ExternalServiceTimeoutException('payment-gateway', 5000, {
 *   requestId: 'req-123',
 *   timeoutMs: 5000,
 *   endpoint: '/api/payment/process'
 * });
 * ```
 */
export class ExternalServiceTimeoutException extends IntegrationException {
  /**
   * 创建外部服务超时异常
   *
   * @param serviceName - 服务名称
   * @param timeoutMs - 超时时间（毫秒）
   * @param data - 附加数据，可包含请求ID、端点信息等
   */
  constructor(
    serviceName: string,
    timeoutMs: number,
    data?: Record<string, unknown>,
  ) {
    super(
      "INTEGRATION_EXTERNAL_SERVICE_TIMEOUT",
      "外部服务超时",
      `外部服务 "${serviceName}" 调用超时 (${timeoutMs}ms)`,
      504,
      { serviceName, timeoutMs, ...data },
      "https://docs.hl8.com/errors#INTEGRATION_EXTERNAL_SERVICE_TIMEOUT",
    );
  }
}
