// 纯领域层导出入口
// 只包含领域层组件：实体、值对象、领域事件、聚合根、领域错误

// 实体
export { IsolationContext } from "./entities/isolation-context.entity.js";

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

// 接口
export type { IIsolationContextProvider, DataAccessContext, IIsolationValidator } from "./interfaces/index.js";

// 聚合根
export { AggregateRoot } from "./aggregates/aggregate-root.js";
export type { DomainEvent } from "./aggregates/aggregate-root.js";

// 领域事件
export { DomainEvent as DomainEventBase } from "./events/domain-event.js";
export { DataAccessDeniedEvent } from "./events/data-access-denied.event.js";
export { IsolationContextCreatedEvent } from "./events/context-created.event.js";
export { IsolationContextSwitchedEvent } from "./events/context-switched.event.js";

// 领域错误
export { IsolationValidationError } from "./errors/isolation-validation.error.js";
