/**
 * 领域服务导出入口
 *
 * @description 统一导出所有领域服务
 * @since 1.0.0
 */

// Trial Period Management
export * from "./trial-period.service.js";
export * from "./trial-expiration.handler.service.js";

// Tenant Creation
export * from "./tenant-code-validator.service.js";
export * from "./domain-validator.service.js";
export * from "./tenant-creation-rules.service.js";

// Tenant Name Review
export * from "./tenant-name-review.service.js";
export * from "./tenant-name-review-rules.service.js";

// User Assignment
export * from "./user-assignment-rules.service.js";
export * from "./user-identity-manager.service.js";
export * from "./user-tenant-switcher.service.js";

// Resource Monitoring
export * from "./resource-monitoring.service.js";

// Permission Management
export * from "./permission-template.service.js";
export * from "./permission-conflict-detector.service.js";
export * from "./permission-hierarchy-manager.service.js";

// Department Hierarchy
export * from "./department-level-config.service.js";
export * from "./department-hierarchy-manager.service.js";

// Domain Integration and Validation
export * from "./domain-integration.service.js";
export * from "./domain-validation.service.js";
export * from "./domain-business-rules-engine.service.js";

// Domain Event Handling
export * from "./domain-event-handler.service.js";
export * from "./domain-event-publisher.service.js";
export * from "./domain-event-subscriber.service.js";
export * from "./domain-event-store.service.js";

// Business Rules
export * from "./tenant-business-rules.service.js";
export * from "./organization-business-rules.service.js";
export * from "./department-business-rules.service.js";
export * from "./user-business-rules.service.js";
export * from "./permission-business-rules.service.js";
