/**
 * 部门管理异常导出
 *
 * @description 导出所有部门管理相关的异常类
 */

// 异常基类
export { DepartmentException } from "./department.exception.js";

// 部门异常
export { DepartmentNotFoundException } from "./department-not-found.exception.js";
export { UnauthorizedDepartmentException } from "./unauthorized-department.exception.js";
export { InvalidDepartmentHierarchyException } from "./invalid-department-hierarchy.exception.js";
