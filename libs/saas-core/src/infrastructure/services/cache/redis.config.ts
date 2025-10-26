/**
 * Redis缓存配置
 * 基于@hl8/caching组件的Redis缓存配置
 */

import { databaseConfig } from "../database/database.config.js";

export const redisConfig = {
  host: databaseConfig.redis.host,
  port: databaseConfig.redis.port,
  password: databaseConfig.redis.password,
  db: databaseConfig.redis.db,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  lazyConnect: true,
  keyPrefix: "saas-core:",
  ttl: {
    default: 3600, // 1小时
    tenant: 7200, // 2小时
    user: 1800, // 30分钟
    organization: 3600, // 1小时
    department: 3600, // 1小时
  },
};
