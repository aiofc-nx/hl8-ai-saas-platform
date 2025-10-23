import { DepartmentException } from "./department.exception.js";

/**
 * 部门未找到异常
 *
 * @description 当指定的部门不存在时抛出此异常
 * 通常用于部门查询、更新、删除等操作
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new DepartmentNotFoundException('dept-123');
 *
 * // 带上下文数据
 * throw new DepartmentNotFoundException('dept-123', {
 *   organizationId: 'org-456',
 *   searchField: 'id'
 * });
 * ```
 */
export class DepartmentNotFoundException extends DepartmentException {
  /**
   * 创建部门未找到异常
   *
   * @param departmentId - 部门ID
   * @param data - 附加数据，可包含组织ID、搜索字段等信息
   */
  constructor(departmentId: string, data?: Record<string, unknown>) {
    super(
      "DEPARTMENT_NOT_FOUND",
      "部门未找到",
      `ID 为 "${departmentId}" 的部门不存在`,
      404,
      { departmentId, ...data },
      "https://docs.hl8.com/errors#DEPARTMENT_NOT_FOUND",
    );
  }
}
