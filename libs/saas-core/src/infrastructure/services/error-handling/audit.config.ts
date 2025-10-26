// libs/saas-core/src/infrastructure/audit/audit.config.ts
import { registerAs } from "@nestjs/config";

/**
 * 审计日志配置
 *
 * 基于环境变量的审计日志配置，支持多种存储方式
 * 提供完整的审计日志配置选项
 */
export default registerAs("audit", () => ({
  // 基础配置
  enabled: process.env.AUDIT_ENABLED === "true",
  level: process.env.AUDIT_LEVEL || "INFO",
  storage: process.env.AUDIT_STORAGE || "file",

  // 数据库配置
  database: {
    tableName: process.env.AUDIT_DATABASE_TABLE_NAME || "audit_logs",
    connectionString: process.env.AUDIT_DATABASE_CONNECTION_STRING || "",
  },

  // 文件配置
  file: {
    path: process.env.AUDIT_FILE_PATH || "./logs/audit",
    maxSize: process.env.AUDIT_FILE_MAX_SIZE || "10MB",
    maxFiles: parseInt(process.env.AUDIT_FILE_MAX_FILES || "5", 10),
  },

  // 外部服务配置
  external: {
    endpoint: process.env.AUDIT_EXTERNAL_ENDPOINT || "",
    apiKey: process.env.AUDIT_EXTERNAL_API_KEY || "",
    timeout: parseInt(process.env.AUDIT_EXTERNAL_TIMEOUT || "5000", 10),
  },

  // 过滤配置
  filters: {
    // 包含的操作类型
    includeActions: process.env.AUDIT_INCLUDE_ACTIONS
      ? process.env.AUDIT_INCLUDE_ACTIONS.split(",")
      : ["CREATE", "UPDATE", "DELETE", "READ"],

    // 排除的操作类型
    excludeActions: process.env.AUDIT_EXCLUDE_ACTIONS
      ? process.env.AUDIT_EXCLUDE_ACTIONS.split(",")
      : [],

    // 包含的用户ID
    includeUsers: process.env.AUDIT_INCLUDE_USERS
      ? process.env.AUDIT_INCLUDE_USERS.split(",")
      : [],

    // 排除的用户ID
    excludeUsers: process.env.AUDIT_EXCLUDE_USERS
      ? process.env.AUDIT_EXCLUDE_USERS.split(",")
      : [],
  },

  // 性能配置
  performance: {
    // 批量保存大小
    batchSize: parseInt(process.env.AUDIT_BATCH_SIZE || "100", 10),

    // 批量保存间隔（毫秒）
    batchInterval: parseInt(process.env.AUDIT_BATCH_INTERVAL || "5000", 10),

    // 异步保存
    async: process.env.AUDIT_ASYNC === "true",

    // 缓存大小
    cacheSize: parseInt(process.env.AUDIT_CACHE_SIZE || "1000", 10),
  },

  // 安全配置
  security: {
    // 加密敏感数据
    encryptSensitiveData: process.env.AUDIT_ENCRYPT_SENSITIVE_DATA === "true",

    // 加密密钥
    encryptionKey: process.env.AUDIT_ENCRYPTION_KEY || "",

    // 数据脱敏
    maskSensitiveFields: process.env.AUDIT_MASK_SENSITIVE_FIELDS
      ? process.env.AUDIT_MASK_SENSITIVE_FIELDS.split(",")
      : ["password", "token", "secret"],
  },

  // 保留策略
  retention: {
    // 保留天数
    days: parseInt(process.env.AUDIT_RETENTION_DAYS || "90", 10),

    // 自动清理
    autoCleanup: process.env.AUDIT_AUTO_CLEANUP === "true",

    // 清理间隔（小时）
    cleanupInterval: parseInt(process.env.AUDIT_CLEANUP_INTERVAL || "24", 10),
  },
}));
