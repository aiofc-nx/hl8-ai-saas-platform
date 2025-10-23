import { SystemException } from "./system.exception.js";

/**
 * 服务不可用异常
 *
 * @description 当服务暂时不可用时抛出此异常
 * 通常用于服务维护、过载等场景
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new ServiceUnavailableException('服务暂时不可用');
 *
 * // 带上下文数据
 * throw new ServiceUnavailableException('服务暂时不可用', {
 *   serviceName: 'user-service',
 *   reason: 'maintenance',
 *   estimatedRecoveryTime: new Date(Date.now() + 3600000)
 * });
 * ```
 */
export class ServiceUnavailableException extends SystemException {
  /**
   * 创建服务不可用异常
   *
   * @param reason - 服务不可用的原因
   * @param data - 附加数据，可包含服务名、预计恢复时间等
   */
  constructor(reason: string, data?: Record<string, unknown>) {
    super(
      "SYSTEM_SERVICE_UNAVAILABLE",
      "服务不可用",
      reason,
      503,
      data,
      "https://docs.hl8.com/errors#SYSTEM_SERVICE_UNAVAILABLE",
    );
  }
}
