import { TenantException } from "./tenant.exception.js";

/**
 * 数据隔离违规异常
 *
 * @description 当违反数据隔离规则时抛出此异常
 * 用于维护多租户数据安全
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new DataIsolationViolationException('违反了数据隔离规则');
 *
 * // 带上下文数据
 * throw new DataIsolationViolationException('违反了数据隔离规则', {
 *   violationType: 'cross_tenant_query',
 *   resourceType: 'user',
 *   tenantId: 'tenant-123',
 *   userId: 'user-456'
 * });
 * ```
 */
export class DataIsolationViolationException extends TenantException {
  /**
   * 创建数据隔离违规异常
   *
   * @param reason - 违规原因
   * @param data - 附加数据，可包含违规类型、资源信息等
   */
  constructor(reason: string, data?: Record<string, unknown>) {
    super(
      "TENANT_DATA_ISOLATION_VIOLATION",
      "数据隔离违规",
      reason,
      403,
      data,
      "https://docs.hl8.com/errors#TENANT_DATA_ISOLATION_VIOLATION",
    );
  }
}
