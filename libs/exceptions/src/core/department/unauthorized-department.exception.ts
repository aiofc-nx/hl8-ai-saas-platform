import { DepartmentException } from "./department.exception.js";

/**
 * 未授权部门访问异常
 *
 * @description 当用户没有权限访问部门时抛出此异常
 * 通常用于部门权限验证、跨部门访问控制等场景
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new UnauthorizedDepartmentException('user-123', 'dept-456');
 *
 * // 带上下文数据
 * throw new UnauthorizedDepartmentException('user-123', 'dept-456', {
 *   operation: 'manage',
 *   requiredRole: 'department_admin',
 *   userRole: 'member'
 * });
 * ```
 */
export class UnauthorizedDepartmentException extends DepartmentException {
  /**
   * 创建未授权部门访问异常
   *
   * @param userId - 用户ID
   * @param departmentId - 部门ID
   * @param data - 附加数据，可包含操作信息、角色信息等
   */
  constructor(
    userId: string,
    departmentId: string,
    data?: Record<string, unknown>,
  ) {
    super(
      "DEPARTMENT_UNAUTHORIZED",
      "未授权部门访问",
      `用户 "${userId}" 没有权限访问部门 "${departmentId}"`,
      403,
      { userId, departmentId, ...data },
      "https://docs.hl8.com/errors#DEPARTMENT_UNAUTHORIZED",
    );
  }
}
