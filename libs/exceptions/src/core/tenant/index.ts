/**
 * 多租户管理异常导出
 *
 * @description 导出所有多租户管理相关的异常类
 */

// 异常基类
export { TenantException } from "./tenant.exception.js";

// 租户异常
export { CrossTenantAccessException } from "./cross-tenant-access.exception.js";
export { DataIsolationViolationException } from "./data-isolation-violation.exception.js";
export { InvalidTenantContextException } from "./invalid-tenant-context.exception.js";
