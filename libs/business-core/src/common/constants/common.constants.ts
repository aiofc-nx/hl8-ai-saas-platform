/**
 * 通用常量定义
 *
 * @description 定义通用的常量
 * @since 1.0.0
 */

/**
 * 分页常量
 */
export const PaginationConstants = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,
  DEFAULT_PAGE: 1,
} as const;

/**
 * 排序常量
 */
export const SortConstants = {
  ASC: "ASC",
  DESC: "DESC",
  DEFAULT_SORT_FIELD: "createdAt",
  DEFAULT_SORT_ORDER: "DESC",
} as const;

/**
 * 时间常量
 */
export const TimeConstants = {
  // 缓存时间（秒）
  CACHE_TTL_SHORT: 300, // 5分钟
  CACHE_TTL_MEDIUM: 1800, // 30分钟
  CACHE_TTL_LONG: 3600, // 1小时
  CACHE_TTL_VERY_LONG: 86400, // 24小时

  // 锁定时间（秒）
  LOCK_TTL_SHORT: 60, // 1分钟
  LOCK_TTL_MEDIUM: 300, // 5分钟
  LOCK_TTL_LONG: 1800, // 30分钟

  // 会话时间（秒）
  SESSION_TTL_SHORT: 1800, // 30分钟
  SESSION_TTL_MEDIUM: 3600, // 1小时
  SESSION_TTL_LONG: 86400, // 24小时
} as const;

/**
 * 系统常量
 */
export const SystemConstants = {
  /** 系统名称 */
  SYSTEM_NAME: "HL8 Business Core",
  /** 系统版本 */
  SYSTEM_VERSION: "1.0.0",
  /** 默认语言 */
  DEFAULT_LANGUAGE: "zh-CN",
  /** 默认时区 */
  DEFAULT_TIMEZONE: "Asia/Shanghai",
} as const;

/**
 * 正则表达式常量
 */
export const RegexConstants = {
  /** 邮箱正则 */
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  /** 手机号正则 */
  PHONE: /^1[3-9]\d{9}$/,
  /** 用户名正则 */
  USERNAME: /^[a-zA-Z0-9_]+$/,
  /** 密码正则 */
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  /** URL正则 */
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
} as const;

/**
 * 文件大小常量（字节）
 */
export const FileSizeConstants = {
  /** 1KB */
  KB: 1024,
  /** 1MB */
  MB: 1024 * 1024,
  /** 1GB */
  GB: 1024 * 1024 * 1024,
  /** 最大文件大小 */
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  /** 最大图片大小 */
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;
