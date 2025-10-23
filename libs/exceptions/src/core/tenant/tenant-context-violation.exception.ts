import { TenantException } from "./tenant.exception.js";

/**
 * 租户上下文违规异常
 *
 * @description 当租户上下文验证失败时抛出此异常
 * 用于维护租户上下文的完整性和安全性
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new TenantContextViolationException('租户上下文验证失败');
 *
 * // 带上下文数据
 * throw new TenantContextViolationException('租户上下文验证失败', {
 *   contextType: 'tenant_id',
 *   providedValue: 'invalid-tenant-id',
 *   expectedFormat: 'uuid',
 *   userId: 'user-123'
 * });
 * ```
 */
export class TenantContextViolationException extends TenantException {
  /**
   * 创建租户上下文违规异常
   *
   * @param reason - 上下文违规的原因
   * @param data - 附加数据，可包含上下文类型、提供值、期望格式等信息
   */
  constructor(reason: string, data?: Record<string, unknown>) {
    super(
      "TENANT_CONTEXT_VIOLATION",
      "租户上下文违规",
      reason,
      400,
      data,
      "https://docs.hl8.com/errors#TENANT_CONTEXT_VIOLATION",
    );
  }

  /**
   * 获取上下文违规信息
   * @returns 上下文违规详细信息
   */
  getContextViolationInfo(): {
    contextType?: string;
    providedValue?: string;
    expectedFormat?: string;
    userId?: string;
    timestamp: string;
  } {
    return {
      contextType: this.data?.contextType as string,
      providedValue: this.data?.providedValue as string,
      expectedFormat: this.data?.expectedFormat as string,
      userId: this.data?.userId as string,
      timestamp: new Date().toISOString(),
    };
  }
}
