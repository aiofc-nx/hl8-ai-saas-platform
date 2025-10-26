/**
 * 角色类型
 * @description 定义角色的类型，按权限层级定义
 *
 * @remarks
 * 权限层级（从高到低）：
 * - PLATFORM_ADMIN: 平台管理员，拥有平台级最高权限
 * - TENANT_ADMIN: 租户管理员，拥有租户内最高权限
 * - ORGANIZATION_ADMIN: 组织管理员，拥有组织内最高权限
 * - DEPARTMENT_ADMIN: 部门管理员，拥有部门内最高权限
 * - REGULAR_USER: 普通用户，基础权限
 * - CUSTOM: 自定义角色，可灵活配置权限
 */
export enum RoleType {
  /** 平台管理员：平台级别的管理员 */
  PLATFORM_ADMIN = "PLATFORM_ADMIN",

  /** 租户管理员：租户级别的管理员 */
  TENANT_ADMIN = "TENANT_ADMIN",

  /** 组织管理员：组织级别的管理员 */
  ORGANIZATION_ADMIN = "ORGANIZATION_ADMIN",

  /** 部门管理员：部门级别的管理员 */
  DEPARTMENT_ADMIN = "DEPARTMENT_ADMIN",

  /** 普通用户：普通用户 */
  REGULAR_USER = "REGULAR_USER",

  /** 自定义角色：自定义角色 */
  CUSTOM = "CUSTOM",
}
