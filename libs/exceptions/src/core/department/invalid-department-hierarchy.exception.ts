import { DepartmentException } from "./department.exception.js";

/**
 * 无效部门层级异常
 *
 * @description 当部门层级结构无效时抛出此异常
 * 通常用于部门层级验证、层级调整等场景
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new InvalidDepartmentHierarchyException('部门不能成为自己的子部门');
 *
 * // 带上下文数据
 * throw new InvalidDepartmentHierarchyException('部门不能成为自己的子部门', {
 *   departmentId: 'dept-123',
 *   parentDepartmentId: 'dept-123',
 *   operation: 'set_parent'
 * });
 * ```
 */
export class InvalidDepartmentHierarchyException extends DepartmentException {
  /**
   * 创建无效部门层级异常
   *
   * @param reason - 层级无效的原因
   * @param data - 附加数据，可包含部门ID、父部门ID等信息
   */
  constructor(reason: string, data?: Record<string, unknown>) {
    super(
      "DEPARTMENT_INVALID_HIERARCHY",
      "无效的部门层级",
      reason,
      400,
      data,
      "https://docs.hl8.com/errors#DEPARTMENT_INVALID_HIERARCHY",
    );
  }
}
