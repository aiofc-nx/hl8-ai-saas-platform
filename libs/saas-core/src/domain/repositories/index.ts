/**
 * 仓储接口导出文件
 * @description 统一导出所有领域层仓储接口
 *
 * @since 1.0.0
 */

// 用户仓储接口
export type { IUserRepository } from "./user.repository.js";

// 租户仓储接口
export type { ITenantRepository } from "./tenant.repository.js";

// 组织仓储接口
export type { IOrganizationRepository } from "./organization.repository.js";

// 部门仓储接口
export type { IDepartmentRepository } from "./department.repository.js";

// 权限仓储接口
export type { IPermissionRepository } from "./permission.repository.js";

// 角色仓储接口
export type { IRoleRepository } from "./role.repository.js";

// 凭证仓储接口
export type { ICredentialRepository } from "./credential.repository.js";
