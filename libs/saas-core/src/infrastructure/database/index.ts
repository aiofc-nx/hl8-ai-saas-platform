/**
 * 数据库基础设施导出入口
 * 
 * @description 统一导出数据库相关的配置和模块
 * @since 1.0.0
 */

// 数据库模块
export { DatabaseModule } from "./database.module.js";

// MikroORM配置
export { mikroOrmConfig } from "./mikro-orm.config.js";

// 仓储适配器
export { TenantRepositoryAdapter } from "../repositories/tenant.repository.adapter.js";
