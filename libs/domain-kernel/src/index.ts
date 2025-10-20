// 领域内核导出入口

// 值对象
export { EntityId } from "./value-objects/entity-id.vo.js";
export { TenantId } from "./value-objects/tenant-id.vo.js";
export { OrganizationId } from "./value-objects/organization-id.vo.js";
export { DepartmentId } from "./value-objects/department-id.vo.js";
export { UserId } from "./value-objects/user-id.vo.js";
export { GenericEntityId } from "./value-objects/generic-entity-id.vo.js";

// 枚举
export { IsolationLevel } from "./enums/isolation-level.enum.js";
export { SharingLevel } from "./enums/sharing-level.enum.js";

// 隔离
export { IsolationContext } from "./isolation/isolation-context.js";

// 聚合根
export { AggregateRoot } from "./aggregates/aggregate-root.js";
export type { DomainEvent } from "./aggregates/aggregate-root.js";

// 事件
export { DomainEvent as DomainEventBase } from "./events/domain-event.js";
export { DataAccessDeniedEvent } from "./events/data-access-denied.event.js";

// CQRS
export { Command } from "./cqrs/commands/command.js";
export type { CommandHandler } from "./cqrs/commands/command-handler.js";
export { Query } from "./cqrs/queries/query.js";
export type { QueryHandler } from "./cqrs/queries/query-handler.js";

// 仓储
export type { EventRepository } from "./repositories/event-repository.js";
export type { SnapshotRepository } from "./repositories/snapshot-repository.js";
export type { ReadModelRepository } from "./repositories/read-model-repository.js";

// 错误
export { IsolationValidationError } from "./errors/isolation-validation.error.js";
