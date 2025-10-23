import { TenantException } from "./tenant.exception.js";

/**
 * 组织隔离异常
 *
 * @description 当组织级别数据隔离验证失败时抛出此异常
 * 用于维护组织级别的数据隔离
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new OrganizationIsolationException('组织数据隔离验证失败');
 *
 * // 带上下文数据
 * throw new OrganizationIsolationException('组织数据隔离验证失败', {
 *   organizationId: 'org-123',
 *   resourceType: 'department',
 *   violationType: 'cross_organization_access'
 * });
 * ```
 */
export class OrganizationIsolationException extends TenantException {
  /**
   * 创建组织隔离异常
   *
   * @param reason - 隔离失败的原因
   * @param data - 附加数据，可包含组织ID、资源类型、违规类型等信息
   */
  constructor(reason: string, data?: Record<string, unknown>) {
    super(
      "ORGANIZATION_ISOLATION_VIOLATION",
      "组织隔离违规",
      reason,
      403,
      data,
      "https://docs.hl8.com/errors#ORGANIZATION_ISOLATION_VIOLATION",
    );
  }

  /**
   * 获取组织隔离信息
   * @returns 组织隔离详细信息
   */
  getOrganizationIsolationInfo(): {
    organizationId?: string;
    resourceType?: string;
    violationType?: string;
    isolationLevel: string;
    timestamp: string;
  } {
    return {
      organizationId: this.data?.organizationId as string,
      resourceType: this.data?.resourceType as string,
      violationType: this.data?.violationType as string,
      isolationLevel: "organization",
      timestamp: new Date().toISOString(),
    };
  }
}
