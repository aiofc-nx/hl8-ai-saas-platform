/**
 * 事件相关常量定义
 *
 * @description 定义事件相关的常量
 * @since 1.0.0
 */

/**
 * 事件常量
 */
export const EventConstants = {
  // 租户事件
  TENANT_CREATED: "tenant.created",
  TENANT_UPDATED: "tenant.updated",
  TENANT_DELETED: "tenant.deleted",
  TENANT_ACTIVATED: "tenant.activated",
  TENANT_DEACTIVATED: "tenant.deactivated",

  // 组织事件
  ORGANIZATION_CREATED: "organization.created",
  ORGANIZATION_UPDATED: "organization.updated",
  ORGANIZATION_DELETED: "organization.deleted",
  ORGANIZATION_ACTIVATED: "organization.activated",
  ORGANIZATION_DEACTIVATED: "organization.deactivated",

  // 部门事件
  DEPARTMENT_CREATED: "department.created",
  DEPARTMENT_UPDATED: "department.updated",
  DEPARTMENT_DELETED: "department.deleted",
  DEPARTMENT_ACTIVATED: "department.activated",
  DEPARTMENT_DEACTIVATED: "department.deactivated",

  // 用户事件
  USER_CREATED: "user.created",
  USER_UPDATED: "user.updated",
  USER_DELETED: "user.deleted",
  USER_ACTIVATED: "user.activated",
  USER_DEACTIVATED: "user.deactivated",
  USER_LOGIN: "user.login",
  USER_LOGOUT: "user.logout",

  // 角色事件
  ROLE_CREATED: "role.created",
  ROLE_UPDATED: "role.updated",
  ROLE_DELETED: "role.deleted",
  ROLE_ASSIGNED: "role.assigned",
  ROLE_UNASSIGNED: "role.unassigned",

  // 权限事件
  PERMISSION_CREATED: "permission.created",
  PERMISSION_UPDATED: "permission.updated",
  PERMISSION_DELETED: "permission.deleted",
  PERMISSION_GRANTED: "permission.granted",
  PERMISSION_REVOKED: "permission.revoked",
} as const;

/**
 * 事件类型常量
 */
export const EventTypes = {
  /** 领域事件 */
  DOMAIN: "DOMAIN",
  /** 集成事件 */
  INTEGRATION: "INTEGRATION",
  /** 应用事件 */
  APPLICATION: "APPLICATION",
  /** 系统事件 */
  SYSTEM: "SYSTEM",
} as const;

/**
 * 事件优先级常量
 */
export const EventPriorities = {
  /** 低优先级 */
  LOW: "LOW",
  /** 中优先级 */
  MEDIUM: "MEDIUM",
  /** 高优先级 */
  HIGH: "HIGH",
  /** 紧急优先级 */
  URGENT: "URGENT",
} as const;

/**
 * 事件状态常量
 */
export const EventStatus = {
  /** 待处理 */
  PENDING: "PENDING",
  /** 处理中 */
  PROCESSING: "PROCESSING",
  /** 已完成 */
  COMPLETED: "COMPLETED",
  /** 失败 */
  FAILED: "FAILED",
  /** 已取消 */
  CANCELLED: "CANCELLED",
} as const;
