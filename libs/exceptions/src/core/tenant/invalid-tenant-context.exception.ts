import { TenantException } from "./tenant.exception.js";

/**
 * 无效租户上下文异常
 *
 * @description 当租户上下文信息无效时抛出此异常
 * 通常用于租户上下文验证、上下文切换等操作
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new InvalidTenantContextException('租户上下文信息无效');
 *
 * // 带上下文数据
 * throw new InvalidTenantContextException('租户上下文信息无效', {
 *   contextType: 'tenant_id',
 *   providedValue: 'invalid-tenant-id',
 *   expectedFormat: 'uuid',
 *   userId: 'user-123'
 * });
 * ```
 */
export class InvalidTenantContextException extends TenantException {
  /**
   * 创建无效租户上下文异常
   *
   * @param reason - 上下文无效的原因
   * @param data - 附加数据，可包含上下文类型、提供值等信息
   */
  constructor(reason: string, data?: Record<string, unknown>) {
    super(
      "TENANT_INVALID_CONTEXT",
      "无效的租户上下文",
      reason,
      400,
      data,
      "https://docs.hl8.com/errors#TENANT_INVALID_CONTEXT",
    );
  }
}
