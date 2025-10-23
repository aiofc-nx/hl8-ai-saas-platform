import { IntegrationException } from "./integration.exception.js";

/**
 * 外部服务错误异常
 *
 * @description 当外部服务返回错误时抛出此异常
 * 通常用于第三方API错误响应、外部系统错误等场景
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new ExternalServiceErrorException('payment-gateway', '支付处理失败', 400);
 *
 * // 带上下文数据
 * throw new ExternalServiceErrorException('payment-gateway', '支付处理失败', 400, {
 *   requestId: 'req-123',
 *   responseBody: { error: 'insufficient_funds' },
 *   retryable: false
 * });
 * ```
 */
export class ExternalServiceErrorException extends IntegrationException {
  /**
   * 创建外部服务错误异常
   *
   * @param serviceName - 服务名称
   * @param errorMessage - 错误消息
   * @param statusCode - HTTP状态码
   * @param data - 附加数据，可包含请求ID、响应体等
   */
  constructor(
    serviceName: string,
    errorMessage: string,
    statusCode: number,
    data?: Record<string, unknown>,
  ) {
    super(
      "INTEGRATION_EXTERNAL_SERVICE_ERROR",
      "外部服务错误",
      `外部服务 "${serviceName}" 返回错误: ${errorMessage}`,
      502,
      { serviceName, errorMessage, statusCode, ...data },
      "https://docs.hl8.com/errors#INTEGRATION_EXTERNAL_SERVICE_ERROR",
    );
  }
}
