import { TenantException } from "./tenant.exception.js";

/**
 * 跨租户访问异常
 *
 * @description 当尝试跨租户访问资源时抛出此异常
 * 用于维护多租户数据隔离
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new CrossTenantAccessException('tenant-123', 'tenant-456');
 *
 * // 带上下文数据
 * throw new CrossTenantAccessException('tenant-123', 'tenant-456', {
 *   resourceType: 'user',
 *   resourceId: 'user-789',
 *   operation: 'read',
 *   userId: 'user-123'
 * });
 * ```
 */
export class CrossTenantAccessException extends TenantException {
  /**
   * 创建跨租户访问异常
   *
   * @param currentTenantId - 当前租户ID
   * @param targetTenantId - 目标租户ID
   * @param data - 附加数据，可包含资源信息、操作信息等
   */
  constructor(
    currentTenantId: string,
    targetTenantId: string,
    data?: Record<string, unknown>,
  ) {
    super(
      "TENANT_CROSS_ACCESS_VIOLATION",
      "跨租户访问违规",
      `不允许从租户 "${currentTenantId}" 访问租户 "${targetTenantId}" 的资源`,
      403,
      { currentTenantId, targetTenantId, ...data },
      "https://docs.hl8.com/errors#TENANT_CROSS_ACCESS_VIOLATION",
    );
  }
}
