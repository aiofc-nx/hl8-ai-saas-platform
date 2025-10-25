/**
 * 领域层导出入口
 *
 * @description 统一导出所有领域层组件
 * @since 1.0.0
 */

// 值对象
export * from "./value-objects/index.js";

// 实体
export * from "./entities/index.js";

// 聚合根
export * from "./aggregates/index.js";

// 领域事件
export * from "./events/index.js";

// 仓储接口
export * from "./repositories/index.js";

// 领域工厂
export * from "./factories/index.js";

// 领域服务
export * from "./services/index.js";
