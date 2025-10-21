/**
 * 数据隔离模块导出入口
 * @description 统一导出所有数据隔离相关的组件
 *
 * @since 1.0.0
 */

// 核心实体
export { IsolationContext } from "./isolation-context.entity.js";

// 枚举
export { IsolationLevel } from "./isolation-level.enum.js";
export { SharingLevel } from "./sharing-level.enum.js";

// 接口
export type { IIsolationContextProvider } from "./isolation-context-provider.interface.js";
export type { DataAccessContext } from "./data-access-context.interface.js";
export type { IIsolationValidator } from "./isolation-validator.interface.js";

// 事件
export { IsolationContextCreatedEvent } from "./context-created.event.js";
export { IsolationContextSwitchedEvent } from "./context-switched.event.js";
export { DataAccessDeniedEvent } from "./data-access-denied.event.js";

// 错误
export { IsolationValidationError } from "./isolation-validation.error.js";
