/**
 * 组织管理异常导出
 *
 * @description 导出所有组织管理相关的异常类
 */

// 异常基类
export { OrganizationException } from "./organization.exception.js";

// 组织异常
export { OrganizationNotFoundException } from "./organization-not-found.exception.js";
export { UnauthorizedOrganizationException } from "./unauthorized-organization.exception.js";
