import { RedisConfig } from "@hl8/caching";

/**
 * Redis缓存配置
 *
 * @description 配置Redis缓存连接和缓存策略
 * @since 1.0.0
 */
export const redisConfig: RedisConfig = {
  // Redis连接配置
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || "0"),

  // 连接池配置
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxLoadingTimeout: 5000,

  // 集群配置
  cluster:
    process.env.REDIS_CLUSTER_ENABLED === "true"
      ? {
          nodes: process.env.REDIS_CLUSTER_NODES?.split(",") || [
            { host: "localhost", port: 6379 },
            { host: "localhost", port: 6380 },
            { host: "localhost", port: 6381 },
          ],
          options: {
            redisOptions: {
              password: process.env.REDIS_PASSWORD,
            },
          },
        }
      : undefined,

  // 缓存策略配置
  defaultTTL: 300, // 5分钟默认TTL
  keyPrefix: "saas-core:",

  // 多租户隔离配置
  tenantIsolation: {
    enabled: true,
    keyPrefix: "tenant:",
    separator: ":",
  },

  // 组织隔离配置
  organizationIsolation: {
    enabled: true,
    keyPrefix: "org:",
    separator: ":",
  },

  // 部门隔离配置
  departmentIsolation: {
    enabled: true,
    keyPrefix: "dept:",
    separator: ":",
  },

  // 用户隔离配置
  userIsolation: {
    enabled: true,
    keyPrefix: "user:",
    separator: ":",
  },

  // 缓存策略配置
  strategies: {
    // 租户缓存策略
    tenant: {
      ttl: 3600, // 1小时
      maxSize: 1000,
      evictionPolicy: "lru",
    },

    // 组织缓存策略
    organization: {
      ttl: 1800, // 30分钟
      maxSize: 5000,
      evictionPolicy: "lru",
    },

    // 用户缓存策略
    user: {
      ttl: 900, // 15分钟
      maxSize: 10000,
      evictionPolicy: "lru",
    },

    // 角色缓存策略
    role: {
      ttl: 1800, // 30分钟
      maxSize: 1000,
      evictionPolicy: "lru",
    },

    // 权限缓存策略
    permission: {
      ttl: 3600, // 1小时
      maxSize: 500,
      evictionPolicy: "lru",
    },

    // 会话缓存策略
    session: {
      ttl: 1800, // 30分钟
      maxSize: 50000,
      evictionPolicy: "lru",
    },

    // 临时缓存策略
    temporary: {
      ttl: 300, // 5分钟
      maxSize: 10000,
      evictionPolicy: "lru",
    },
  },

  // 序列化配置
  serialization: {
    enabled: true,
    algorithm: "json", // json, msgpack, protobuf
    compression: false,
  },

  // 监控配置
  monitoring: {
    enabled: process.env.NODE_ENV === "development",
    metrics: {
      hitRate: true,
      missRate: true,
      evictionRate: true,
      memoryUsage: true,
    },
  },

  // 健康检查配置
  healthCheck: {
    enabled: true,
    interval: 30000, // 30秒
    timeout: 5000, // 5秒
  },

  // 错误处理配置
  errorHandling: {
    retryOnError: true,
    maxRetries: 3,
    retryDelay: 1000,
    fallbackToMemory: false,
  },

  // 性能优化配置
  performance: {
    pipeline: true,
    batchSize: 100,
    concurrency: 10,
  },
};
