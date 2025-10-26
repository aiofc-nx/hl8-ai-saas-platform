/**
 * 用户角色
 * @description 用户在系统中的角色，按层级定义：平台管理员、租户管理员、组织管理员、部门管理员、普通用户
 *
 * @remarks
 * 权限层级（从高到低）：
 * - PLATFORM_ADMIN: 平台管理员，拥有平台级最高权限
 * - TENANT_ADMIN: 租户管理员，拥有租户内最高权限
 * - ORG_ADMIN: 组织管理员，拥有组织内最高权限
 * - DEPT_ADMIN: 部门管理员，拥有部门内最高权限
 * - USER: 普通用户，基础权限
 */
export enum UserRole {
  /** 平台管理员：平台级别的管理员 */
  PLATFORM_ADMIN = "PLATFORM_ADMIN",

  /** 租户管理员：租户级别的管理员 */
  TENANT_ADMIN = "TENANT_ADMIN",

  /** 组织管理员：组织级别的管理员 */
  ORG_ADMIN = "ORG_ADMIN",

  /** 部门管理员：部门级别的管理员 */
  DEPT_ADMIN = "DEPT_ADMIN",

  /** 普通用户：普通用户 */
  USER = "USER",
}
