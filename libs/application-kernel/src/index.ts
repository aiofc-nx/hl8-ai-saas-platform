// 应用层内核导出入口
// 包含 CQRS 契约、应用服务、上下文管理

// CQRS
export { Command } from "./cqrs/commands/command.js";
export type { CommandHandler } from "./cqrs/commands/command-handler.js";
export { Query } from "./cqrs/queries/query.js";
export type { QueryHandler } from "./cqrs/queries/query-handler.js";

// 上下文管理
export type { IsolationContextProvider } from "./context/isolation-context-provider.js";
export {
  DefaultIsolationContextProvider,
  globalIsolationContextProvider,
  getCurrentIsolationContext,
  setCurrentIsolationContext,
  clearCurrentIsolationContext,
} from "./context/isolation-context-provider.js";
