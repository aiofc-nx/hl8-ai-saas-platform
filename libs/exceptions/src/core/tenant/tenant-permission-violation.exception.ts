import { TenantException } from "./tenant.exception.js";

/**
 * 租户权限违规异常
 *
 * @description 当租户权限验证失败时抛出此异常
 * 用于维护租户级别的权限控制
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new TenantPermissionViolationException('租户权限验证失败');
 *
 * // 带上下文数据
 * throw new TenantPermissionViolationException('租户权限验证失败', {
 *   permission: 'read',
 *   resource: 'user',
 *   tenantId: 'tenant-123',
 *   userId: 'user-456'
 * });
 * ```
 */
export class TenantPermissionViolationException extends TenantException {
  /**
   * 创建租户权限违规异常
   *
   * @param reason - 权限违规的原因
   * @param data - 附加数据，可包含权限、资源、租户ID、用户ID等信息
   */
  constructor(reason: string, data?: Record<string, unknown>) {
    super(
      "TENANT_PERMISSION_VIOLATION",
      "租户权限违规",
      reason,
      403,
      data,
      "https://docs.hl8.com/errors#TENANT_PERMISSION_VIOLATION",
    );
  }

  /**
   * 获取权限违规信息
   * @returns 权限违规详细信息
   */
  getPermissionViolationInfo(): {
    permission?: string;
    resource?: string;
    tenantId?: string;
    userId?: string;
    timestamp: string;
  } {
    return {
      permission: this.data?.permission as string,
      resource: this.data?.resource as string,
      tenantId: this.data?.tenantId as string,
      userId: this.data?.userId as string,
      timestamp: new Date().toISOString(),
    };
  }
}
