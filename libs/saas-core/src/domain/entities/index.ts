/**
 * 领域实体导出入口
 *
 * @description 统一导出所有领域实体
 * @since 1.0.0
 */

// 平台相关实体
export { Platform, type PlatformConfiguration } from "./platform.entity.js";

// 租户相关实体
export { Tenant } from "./tenant.entity.js";

// 组织相关实体
export {
  Organization,
  OrganizationStatusEnum,
  OrganizationTypeEnum,
} from "./organization.entity.js";

// 用户相关实体
export { User, UserStatusEnum, UserTypeEnum } from "./user.entity.js";

// 部门相关实体
export { Department } from "./department.entity.js";

// 角色相关实体
export { Role, RoleStatusEnum, RoleTypeEnum } from "./role.entity.js";

// CASL权限相关实体
export { CaslAbility } from "./casl-ability.entity.js";
