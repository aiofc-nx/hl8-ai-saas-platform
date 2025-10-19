/**
 * 缓存相关常量定义
 *
 * @description 定义缓存相关的常量
 * @since 1.0.0
 */

/**
 * 缓存键常量
 */
export const CacheKeys = {
  // 租户缓存
  TENANT_BY_ID: "tenant:by_id:",
  TENANT_BY_NAME: "tenant:by_name:",
  TENANT_LIST: "tenant:list:",

  // 组织缓存
  ORGANIZATION_BY_ID: "organization:by_id:",
  ORGANIZATION_BY_NAME: "organization:by_name:",
  ORGANIZATION_LIST: "organization:list:",

  // 部门缓存
  DEPARTMENT_BY_ID: "department:by_id:",
  DEPARTMENT_BY_NAME: "department:by_name:",
  DEPARTMENT_LIST: "department:list:",

  // 用户缓存
  USER_BY_ID: "user:by_id:",
  USER_BY_EMAIL: "user:by_email:",
  USER_BY_USERNAME: "user:by_username:",
  USER_LIST: "user:list:",

  // 角色缓存
  ROLE_BY_ID: "role:by_id:",
  ROLE_BY_NAME: "role:by_name:",
  ROLE_LIST: "role:list:",

  // 权限缓存
  PERMISSION_BY_ID: "permission:by_id:",
  PERMISSION_BY_NAME: "permission:by_name:",
  PERMISSION_LIST: "permission:list:",
} as const;

/**
 * 缓存时间常量（秒）
 */
export const CacheTTL = {
  /** 短期缓存 - 5分钟 */
  SHORT: 300,
  /** 中期缓存 - 30分钟 */
  MEDIUM: 1800,
  /** 长期缓存 - 1小时 */
  LONG: 3600,
  /** 超长期缓存 - 24小时 */
  VERY_LONG: 86400,
} as const;

/**
 * 缓存策略常量
 */
export const CacheStrategies = {
  /** 写入时失效 */
  WRITE_THROUGH: "WRITE_THROUGH",
  /** 写入后失效 */
  WRITE_BEHIND: "WRITE_BEHIND",
  /** 写入时更新 */
  WRITE_AROUND: "WRITE_AROUND",
} as const;

/**
 * 缓存类型常量
 */
export const CacheTypes = {
  /** 内存缓存 */
  MEMORY: "MEMORY",
  /** Redis缓存 */
  REDIS: "REDIS",
  /** 数据库缓存 */
  DATABASE: "DATABASE",
} as const;
