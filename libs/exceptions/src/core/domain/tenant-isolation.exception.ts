import { DomainException } from "./domain-layer.exception.js";

/**
 * 领域层租户隔离异常
 * @description 当租户隔离验证失败时抛出
 *
 * ## 使用场景
 * - 租户上下文验证失败
 * - 跨租户访问违规
 * - 数据隔离规则违反
 *
 * @since 2.1.0
 */
export class DomainTenantIsolationException extends DomainException {
  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>,
  ) {
    super(
      code,
      "租户隔离违规",
      message,
      403,
      context,
      `https://docs.hl8.com/errors#${code}`,
    );
  }

  /**
   * 获取租户隔离信息
   * @returns 租户隔离详细信息
   */
  getTenantIsolationInfo(): {
    isolationCode: string;
    isolationMessage: string;
    tenantContext: Record<string, unknown>;
    timestamp: string;
  } {
    return {
      isolationCode: this.errorCode,
      isolationMessage: this.detail,
      tenantContext: this.data || {},
      timestamp: new Date().toISOString(),
    };
  }
}
