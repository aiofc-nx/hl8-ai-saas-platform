import { TenantException } from "./tenant.exception.js";

/**
 * 租户数据隔离异常
 *
 * @description 当租户数据隔离验证失败时抛出此异常
 * 用于维护多租户数据隔离的核心功能
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new TenantDataIsolationException('租户数据隔离验证失败');
 *
 * // 带上下文数据
 * throw new TenantDataIsolationException('租户数据隔离验证失败', {
 *   isolationLevel: 'tenant',
 *   resourceType: 'user',
 *   tenantId: 'tenant-123',
 *   violationType: 'cross_tenant_access'
 * });
 * ```
 */
export class TenantDataIsolationException extends TenantException {
  /**
   * 创建租户数据隔离异常
   *
   * @param reason - 隔离失败的原因
   * @param data - 附加数据，可包含隔离级别、资源类型、违规类型等信息
   */
  constructor(reason: string, data?: Record<string, unknown>) {
    super(
      "TENANT_DATA_ISOLATION_FAILED",
      "租户数据隔离失败",
      reason,
      403,
      data,
      "https://docs.hl8.com/errors#TENANT_DATA_ISOLATION_FAILED",
    );
  }

  /**
   * 获取隔离信息
   * @returns 隔离详细信息
   */
  getIsolationInfo(): {
    isolationLevel: string;
    resourceType?: string;
    tenantId?: string;
    violationType?: string;
    timestamp: string;
  } {
    return {
      isolationLevel: (this.data?.isolationLevel as string) || "tenant",
      resourceType: this.data?.resourceType as string,
      tenantId: this.data?.tenantId as string,
      violationType: this.data?.violationType as string,
      timestamp: new Date().toISOString(),
    };
  }
}
