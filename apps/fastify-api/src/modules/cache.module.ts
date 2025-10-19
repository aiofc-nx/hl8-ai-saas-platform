/**
 * 缓存测试模块
 *
 * @description 提供缓存功能的集成测试模块
 */

import { Module } from "@nestjs/common";
import { CacheController } from "../controllers/cache.controller.js";

/**
 * 缓存测试模块
 *
 * @description 注册缓存测试控制器和相关服务
 */
@Module({
  controllers: [CacheController],
  providers: [],
  exports: [],
})
export class CacheModule {}
