// 纯领域层导出入口
// 只包含领域层组件：实体、值对象、领域事件、聚合根、领域错误

// 基础实体和值对象
export { BaseEntity } from "./entities/base-entity.js";
export { BaseValueObject } from "./value-objects/base-value-object.js";

// 审计信息相关
export {
  AuditInfo,
  AuditInfoBuilder,
  type IAuditInfo,
  type IPartialAuditInfo,
} from "./value-objects/audit-info.vo.js";

// 值对象
export { EntityId } from "./value-objects/ids/entity-id.vo.js";
export { TenantId } from "./value-objects/ids/tenant-id.vo.js";
export { OrganizationId } from "./value-objects/ids/organization-id.vo.js";
export { DepartmentId } from "./value-objects/ids/department-id.vo.js";
export { UserId } from "./value-objects/ids/user-id.vo.js";
export { GenericEntityId } from "./value-objects/ids/generic-entity-id.vo.js";

// 数据隔离相关
export * from "./isolation/index.js";

// 接口
export type {
  IBaseEntity,
  IEntity,
  IEntityFactory,
  IEntitySpecification,
  IEntityValidator,
  IEntityValidationResult,
  IEntityAuditInfo,
} from "./interfaces/index.js";

// 聚合根
export { AggregateRoot } from "./aggregates/aggregate-root.js";
export type { DomainEvent } from "./aggregates/aggregate-root.js";

// 领域事件
export { DomainEvent as DomainEventBase } from "./events/domain-event.js";
// 注意：隔离相关事件（包括DataAccessDeniedEvent）已通过 isolation 模块导出

// 领域服务
export { BaseDomainService } from "./services/base-domain-service.js";

// 业务规则（整合后的规则系统）
export {
  BusinessRuleValidator,
  BusinessRuleManager,
  BusinessRules,
  BusinessRuleFactory,
  type BusinessRuleValidationResult,
  type BusinessRuleValidationError,
  type BusinessRuleValidationWarning,
} from "./rules/index.js";

// 具体业务规则验证器
export {
  UserRegistrationBusinessRule,
  OrderCreationBusinessRule,
  UserStateBusinessRule,
} from "./rules/index.js";

// 规格模式（Specification Pattern）
export type {
  ISpecification,
  SpecificationResult,
  SpecificationMetadata,
} from "./specifications/index.js";

export {
  BaseSpecification,
  AndSpecification,
  OrSpecification,
  NotSpecification,
  SpecificationFactory,
} from "./specifications/index.js";

// 具体规格实现
export {
  UserActiveSpecification,
  UserEmailFormatSpecification,
  UsernameFormatSpecification,
  UserLifecycleSpecification,
  ValidUserSpecification,
  OrderAmountSpecification,
  OrderStatusSpecification,
  OrderItemsSpecification,
  OrderLifecycleSpecification,
  ValidOrderSpecification,
  type UserData,
  type OrderData,
  type OrderItemData,
} from "./specifications/index.js";

// 示例实现
export {
  UserStatus,
  UserStatusTransition,
} from "./examples/user-status.enum.js";
export { Email } from "./examples/email.vo.js";
export { Username } from "./examples/username.vo.js";
export { User } from "./examples/user.entity.js";

// 领域异常（从 libs/exceptions 导入）
export * from "/home/arligle/hl8/hl8-ai-saas-platform/libs/exceptions/dist/core/domain/index.js";

// 领域错误
// 注意：IsolationValidationError 已移动到 isolation 目录
