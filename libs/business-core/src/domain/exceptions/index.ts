/**
 * 领域异常模块导出
 *
 * @description 导出领域异常相关的所有公共API
 * @since 1.0.0
 */

// 基础设施
export * from "./base/index.js";

// 简化的异常体系 (推荐使用)
export * from "./domain-exceptions.js";
export * from "./domain-exception-factory.js";

// 注意：传统异常体系已移除，请使用简化的异常体系
