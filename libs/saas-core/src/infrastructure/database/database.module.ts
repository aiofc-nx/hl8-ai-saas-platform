import { Module } from "@nestjs/common";
import { DatabaseModule as Hl8DatabaseModule } from "@hl8/database";
import { mikroOrmConfig } from "./mikro-orm.config.js";

/**
 * SAAS Core数据库模块
 *
 * @description 配置SAAS Core模块的数据库连接和实体管理
 * @since 1.0.0
 */
@Module({
  imports: [Hl8DatabaseModule.forRoot(mikroOrmConfig)],
  exports: [Hl8DatabaseModule],
})
export class DatabaseModule {}
