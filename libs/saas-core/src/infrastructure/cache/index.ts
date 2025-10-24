/**
 * 缓存基础设施导出入口
 *
 * @description 统一导出缓存相关的配置和服务
 * @since 1.0.0
 */

// 缓存模块
export { CacheModule } from "./cache.module.js";

// Redis配置
export { redisConfig } from "./redis.config.js";

// 缓存服务适配器
export { CacheServiceAdapter } from "./cache.service.adapter.js";
