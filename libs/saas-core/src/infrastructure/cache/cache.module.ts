import { Module } from "@nestjs/common";
import { CachingModule } from "@hl8/caching";
import { redisConfig } from "./redis.config.js";

/**
 * SAAS Core缓存模块
 *
 * @description 配置SAAS Core模块的Redis缓存
 * @since 1.0.0
 */
@Module({
  imports: [CachingModule.forRoot(redisConfig)],
  exports: [CachingModule],
})
export class CacheModule {}
