/**
 * 领域规格模式模块
 * @description 导出所有规格类
 */

export { UserActiveSpecification } from "./user-active.specification.js";

export { UserPermissionSpecification } from "./user-permission.specification.js";
export type { UserPermissionContext } from "./user-permission.specification.js";

export { UserOrganizationSpecification } from "./user-organization.specification.js";
export type { UserOrganizationContext } from "./user-organization.specification.js";

export { TenantActiveSpecification } from "./tenant-active.specification.js";

export { TenantResourceLimitSpecification } from "./tenant-resource-limit.specification.js";
export type { TenantResourceLimitContext } from "./tenant-resource-limit.specification.js";
