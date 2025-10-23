import { TenantException } from "./tenant.exception.js";

/**
 * 部门隔离异常
 *
 * @description 当部门级别数据隔离验证失败时抛出此异常
 * 用于维护部门级别的数据隔离
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new DepartmentIsolationException('部门数据隔离验证失败');
 *
 * // 带上下文数据
 * throw new DepartmentIsolationException('部门数据隔离验证失败', {
 *   departmentId: 'dept-123',
 *   organizationId: 'org-456',
 *   resourceType: 'user',
 *   violationType: 'cross_department_access'
 * });
 * ```
 */
export class DepartmentIsolationException extends TenantException {
  /**
   * 创建部门隔离异常
   *
   * @param reason - 隔离失败的原因
   * @param data - 附加数据，可包含部门ID、组织ID、资源类型、违规类型等信息
   */
  constructor(reason: string, data?: Record<string, unknown>) {
    super(
      "DEPARTMENT_ISOLATION_VIOLATION",
      "部门隔离违规",
      reason,
      403,
      data,
      "https://docs.hl8.com/errors#DEPARTMENT_ISOLATION_VIOLATION",
    );
  }

  /**
   * 获取部门隔离信息
   * @returns 部门隔离详细信息
   */
  getDepartmentIsolationInfo(): {
    departmentId?: string;
    organizationId?: string;
    resourceType?: string;
    violationType?: string;
    isolationLevel: string;
    timestamp: string;
  } {
    return {
      departmentId: this.data?.departmentId as string,
      organizationId: this.data?.organizationId as string,
      resourceType: this.data?.resourceType as string,
      violationType: this.data?.violationType as string,
      isolationLevel: "department",
      timestamp: new Date().toISOString(),
    };
  }
}
