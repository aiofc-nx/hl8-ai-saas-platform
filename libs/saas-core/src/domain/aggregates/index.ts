/**
 * 聚合根导出入口
 *
 * @description 统一导出所有聚合根
 * @since 1.0.0
 */

// 租户聚合根
export { TenantAggregate } from "./tenant.aggregate.js";

// 组织聚合根
export { OrganizationAggregate } from "./organization.aggregate.js";

// 部门聚合根
export { DepartmentAggregate } from "./department.aggregate.js";
