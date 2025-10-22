/**
 * Application Kernel - 应用层内核
 *
 * 提供统一的 CQRS 模式、上下文管理和应用层基础设施
 * 为业务模块提供通用的基础组件，支持多租户隔离和框架无关设计
 *
 * @since 1.0.0
 */

// 从 domain-kernel 导入核心值对象和实体
export { EntityId } from "@hl8/domain-kernel";
export { IsolationContext } from "@hl8/domain-kernel";
export type { DomainEvent } from "@hl8/domain-kernel";

// CQRS 基础类
export { BaseCommand } from "./cqrs/commands/base-command.js";
export { BaseQuery } from "./cqrs/queries/base-query.js";

// CQRS 处理器接口
export type { CommandHandler } from "./cqrs/commands/command-handler.interface.js";
export type { QueryHandler } from "./cqrs/queries/query-handler.interface.js";

// 用例基础类
export { BaseUseCase } from "./use-cases/base-use-case.js";
export { BaseCommandUseCase } from "./use-cases/base-command-use-case.js";

// 上下文管理
export type { IUseCaseContext } from "./context/use-case-context.interface.js";

// 事件系统
export type { IEventBus } from "./events/event-bus.interface.js";

// 事务管理
export type { ITransactionManager } from "./transactions/transaction-manager.interface.js";

// 验证系统
export { BaseClassValidator } from "./validation/base-class.validator.js";
export { InterfaceComplianceValidator } from "./validation/interface-compliance.validator.js";
export { PatternComplianceChecker } from "./validation/pattern-compliance.checker.js";
export { PatternComplianceValidator } from "./validation/pattern-compliance.validator.js";
