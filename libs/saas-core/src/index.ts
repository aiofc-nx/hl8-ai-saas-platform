/**
 * SAAS Core模块主入口
 * 导出所有公共API和组件
 */

// 领域层导出
export * from "./domain/entities/index.js";
export * from "./domain/value-objects/index.js";
export * from "./domain/aggregates/index.js";
export * from "./domain/services/index.js";
export * from "./domain/events/index.js";

// 应用层导出
export * from "./application/commands/index.js";
export * from "./application/queries/index.js";
export * from "./application/use-cases/index.js";

// 基础设施层导出
export * from "./infrastructure/repositories/index.js";
export * from "./infrastructure/cache/index.js";
export * from "./infrastructure/database/index.js";

// 接口层导出
export * from "./interface/controllers/index.js";
export * from "./interface/dto/index.js";
export * from "./interface/guards/index.js";
