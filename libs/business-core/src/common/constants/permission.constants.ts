/**
 * 权限相关常量定义
 *
 * @description 定义权限相关的常量
 * @since 1.0.0
 */

/**
 * 权限常量
 */
export const PermissionConstants = {
  // 系统权限
  SYSTEM_ADMIN: "system:admin",
  SYSTEM_MANAGE: "system:manage",
  SYSTEM_VIEW: "system:view",

  // 租户权限
  TENANT_ADMIN: "tenant:admin",
  TENANT_MANAGE: "tenant:manage",
  TENANT_VIEW: "tenant:view",

  // 组织权限
  ORGANIZATION_ADMIN: "organization:admin",
  ORGANIZATION_MANAGE: "organization:manage",
  ORGANIZATION_VIEW: "organization:view",

  // 部门权限
  DEPARTMENT_ADMIN: "department:admin",
  DEPARTMENT_MANAGE: "department:manage",
  DEPARTMENT_VIEW: "department:view",

  // 用户权限
  USER_ADMIN: "user:admin",
  USER_MANAGE: "user:manage",
  USER_VIEW: "user:view",
  USER_CREATE: "user:create",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",

  // 角色权限
  ROLE_ADMIN: "role:admin",
  ROLE_MANAGE: "role:manage",
  ROLE_VIEW: "role:view",
  ROLE_CREATE: "role:create",
  ROLE_UPDATE: "role:update",
  ROLE_DELETE: "role:delete",

  // 权限管理
  PERMISSION_ADMIN: "permission:admin",
  PERMISSION_MANAGE: "permission:manage",
  PERMISSION_VIEW: "permission:view",
  PERMISSION_CREATE: "permission:create",
  PERMISSION_UPDATE: "permission:update",
  PERMISSION_DELETE: "permission:delete",
} as const;

/**
 * 权限级别常量
 */
export const PermissionLevels = {
  /** 系统级权限 */
  SYSTEM: "SYSTEM",
  /** 租户级权限 */
  TENANT: "TENANT",
  /** 组织级权限 */
  ORGANIZATION: "ORGANIZATION",
  /** 部门级权限 */
  DEPARTMENT: "DEPARTMENT",
  /** 用户级权限 */
  USER: "USER",
} as const;

/**
 * 权限操作常量
 */
export const PermissionActions = {
  /** 查看权限 */
  VIEW: "view",
  /** 创建权限 */
  CREATE: "create",
  /** 更新权限 */
  UPDATE: "update",
  /** 删除权限 */
  DELETE: "delete",
  /** 管理权限 */
  MANAGE: "manage",
  /** 管理权限 */
  ADMIN: "admin",
} as const;
