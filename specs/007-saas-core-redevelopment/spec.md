# Feature Specification: SAAS Core Module Redevelopment

**Feature Branch**: `007-saas-core-redevelopment`  
**Created**: 2024-12-19  
**Status**: Draft  
**Input**: User description: "saas-core有很多错误难以修复，我决定重新开发，请根据specs/005-spec-documentation重新编写规范，另外创建一个新的spec"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Clean Architecture Implementation (Priority: P1)

As a platform architect, I need to redevelop the SAAS Core module with proper Clean Architecture principles so that the system has clear separation of concerns, maintainable code structure, and follows domain-driven design patterns.

**Why this priority**: Clean Architecture is the foundation for maintainable and scalable code. The current implementation has architectural issues that need to be resolved through proper redevelopment.

**Independent Test**: Can be fully tested by implementing the core domain layer with proper entity, value object, and aggregate patterns, then validating the architecture through dependency injection and separation of concerns.

**Acceptance Scenarios**:

1. **Given** the existing problematic saas-core implementation, **When** I redevelop the module, **Then** it should follow Clean Architecture with clear domain, application, infrastructure, and presentation layers
2. **Given** the domain-driven design requirements, **When** I implement the domain layer, **Then** it should include proper entities, value objects, aggregates, and domain services with clear business logic
3. **Given** the multi-tenant requirements, **When** I implement the architecture, **Then** it should support proper tenant isolation and data separation at the architectural level

---

### User Story 2 - Multi-Tenant Data Isolation Implementation (Priority: P1)

As a security architect, I need to implement proper multi-tenant data isolation using ROW_LEVEL_SECURITY as the default strategy so that tenant data is properly separated and secure.

**Why this priority**: Multi-tenant data isolation is critical for security and compliance. The current implementation likely has data isolation issues that need to be resolved.

**Independent Test**: Can be fully tested by implementing tenant data isolation and validating that tenant data cannot be accessed across tenant boundaries.

**Acceptance Scenarios**:

1. **Given** the multi-tenant requirements, **When** I implement data isolation, **Then** all data access should be filtered by tenant_id using ROW_LEVEL_SECURITY
2. **Given** the tenant hierarchy (Platform/Tenant/Organization/Department/User), **When** I implement isolation, **Then** it should support proper data access patterns for each level
3. **Given** the security requirements, **When** I implement isolation, **Then** it should prevent cross-tenant data access and provide audit logging for all data operations

---

### User Story 3 - Domain Model Implementation (Priority: P1)

As a domain expert, I need to implement the complete domain model including Platform, Tenant, Organization, Department, and User entities with proper relationships and business rules so that the system accurately represents the business domain.

**Why this priority**: The domain model is the core of the system. Current implementation likely has domain modeling issues that need to be resolved through proper redevelopment.

**Independent Test**: Can be fully tested by implementing all domain entities and validating their relationships, business rules, and consistency boundaries.

**Acceptance Scenarios**:

1. **Given** the domain entities (Platform, Tenant, Organization, Department, User), **When** I implement the domain model, **Then** each entity should have proper attributes, validation rules, and business logic
2. **Given** the entity relationships, **When** I implement relationships, **Then** it should support proper parent-child relationships, many-to-many associations, and referential integrity
3. **Given** the business rules, **When** I implement business logic, **Then** it should enforce all tenant limits, validation rules, and organizational constraints

---

### User Story 4 - Event-Driven Architecture Implementation (Priority: P1)

As a system architect, I need to implement proper event-driven architecture with event sourcing for all core business subdomains so that the system supports scalable, loosely-coupled operations.

**Why this priority**: Event-driven architecture is essential for scalability and integration. The current implementation likely lacks proper event handling and sourcing.

**Independent Test**: Can be fully tested by implementing domain events and event sourcing, then validating event publishing, handling, and state reconstruction.

**Acceptance Scenarios**:

1. **Given** the domain events requirements, **When** I implement event sourcing, **Then** it should capture all business events for tenant, organization, department, user, and role management
2. **Given** the event handling requirements, **When** I implement event processing, **Then** it should support both synchronous and asynchronous event handling with proper ordering
3. **Given** the state reconstruction needs, **When** I implement event sourcing, **Then** it should allow complete state reconstruction from event history

---

### User Story 5 - CQRS Implementation (Priority: P2)

As a system architect, I need to implement Command Query Responsibility Segregation (CQRS) so that read and write operations are properly separated for better performance and scalability.

**Why this priority**: CQRS improves system performance and scalability by separating read and write concerns, but depends on the domain model being properly established first.

**Independent Test**: Can be fully tested by implementing separate command and query handlers, then validating that write operations go through command handlers and read operations go through query handlers.

**Acceptance Scenarios**:

1. **Given** the CQRS requirements, **When** I implement command handlers, **Then** all write operations should go through command handlers with proper validation and business logic
2. **Given** the query requirements, **When** I implement query handlers, **Then** all read operations should go through query handlers optimized for specific use cases
3. **Given** the consistency requirements, **When** I implement CQRS, **Then** it should maintain eventual consistency between read and write models

---

### User Story 6 - API Layer Implementation (Priority: P2)

As an API developer, I need to implement proper API endpoints with authentication, authorization, and tenant context so that external systems can interact with the SAAS Core module securely.

**Why this priority**: API layer is essential for integration and external access, but depends on the core domain model and business logic being properly implemented first.

**Independent Test**: Can be fully tested by implementing API endpoints and validating authentication, authorization, and tenant context handling.

**Acceptance Scenarios**:

1. **Given** the API requirements, **When** I implement endpoints, **Then** it should provide CRUD operations for all domain entities with proper HTTP methods and status codes
2. **Given** the security requirements, **When** I implement authentication, **Then** it should support proper token-based authentication with tenant context
3. **Given** the authorization requirements, **When** I implement authorization, **Then** it should enforce proper role-based access control and tenant isolation

---

### User Story 7 - Testing Implementation (Priority: P2)

As a QA engineer, I need to implement comprehensive testing including unit tests, integration tests, and end-to-end tests so that the system maintains high quality and reliability.

**Why this priority**: Testing is essential for quality assurance and prevents regressions, but depends on the core implementation being completed first.

**Independent Test**: Can be fully tested by implementing test suites and validating that all business logic, API endpoints, and integration points are properly tested.

**Acceptance Scenarios**:

1. **Given** the unit testing requirements, **When** I implement unit tests, **Then** it should achieve 90% code coverage for all domain logic and business rules
2. **Given** the integration testing requirements, **When** I implement integration tests, **Then** it should test all API endpoints, database operations, and external integrations
3. **Given** the end-to-end testing requirements, **When** I implement e2e tests, **Then** it should test complete user workflows and business scenarios

---

### User Story 8 - Performance and Scalability Implementation (Priority: P3)

As a performance engineer, I need to implement performance optimizations and scalability measures so that the system can handle the expected load and scale with business growth.

**Why this priority**: Performance and scalability are important for production systems, but can be optimized after the core functionality is implemented and tested.

**Independent Test**: Can be fully tested by implementing performance optimizations and validating that the system meets performance requirements under expected load.

**Acceptance Scenarios**:

1. **Given** the performance requirements, **When** I implement optimizations, **Then** the system should handle 1000 concurrent users without degradation
2. **Given** the scalability requirements, **When** I implement scaling measures, **Then** it should support horizontal scaling and database sharding for multi-tenant data
3. **Given** the resource requirements, **When** I implement resource management, **Then** it should enforce tenant resource limits and prevent resource exhaustion

---

### Edge Cases

- What happens when tenant creation fails during the process?
- How does the system handle tenant deletion with dependent data and relationships?
- What happens when organizational structure changes affect user permissions?
- How does the system handle tenant migration between isolation strategies?
- What happens when tenant names conflict during approval processes?
- How does the system handle partial failures during tenant creation or updates?
- What happens when users belong to multiple organizations with conflicting permissions?
- How does the system handle tenant suspension with active users and ongoing operations?
- What happens when event sourcing fails during state reconstruction?
- How does the system handle CQRS consistency issues between read and write models?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST implement Clean Architecture with clear separation between domain, application, infrastructure, and interface layers following the hybrid architecture pattern
- **FR-002**: System MUST implement proper domain entities (Platform, Tenant, Organization, Department, User) with complete attributes and business rules using @hl8/domain-kernel base classes
- **FR-003**: System MUST implement value objects with proper validation rules and immutability using @hl8/domain-kernel BaseValueObject and predefined ID value objects (TenantId, OrganizationId, DepartmentId, UserId, GenericEntityId)
- **FR-004**: System MUST implement aggregates with proper consistency boundaries and business logic using @hl8/domain-kernel AggregateRoot (TenantAggregate, OrganizationAggregate, DepartmentAggregate), following the entity-aggregate separation principle where aggregate roots coordinate internal entities and publish domain events. **⚠️ MANDATORY**: All aggregates (simple or complex) MUST separate aggregate roots from internal entities
- **FR-005**: System MUST implement multi-tenant data isolation using ROW_LEVEL_SECURITY as default strategy with IsolationContext and tenant_id filtering from @hl8/domain-kernel
- **FR-006**: System MUST implement event sourcing for all core business subdomains (tenant, organization, department, user, role management) using @hl8/domain-kernel event infrastructure
- **FR-007**: System MUST implement domain events for all business state changes with proper event publishing and handling using @hl8/domain-kernel DomainEvent base class
- **FR-008**: System MUST implement CQRS with separate command and query handlers using @hl8/application-kernel BaseCommand, BaseQuery, CommandHandler, and QueryHandler
- **FR-009**: System MUST implement proper tenant lifecycle management including creation, status transitions, and deletion processes with business rule validation
- **FR-010**: System MUST implement organization and department hierarchy with proper parent-child relationships and 8-level department nesting using domain entities
- **FR-011**: System MUST implement user management with multi-organization membership and single-department-per-organization constraints using proper domain relationships
- **FR-012**: System MUST implement role-based access control with proper permission hierarchy and inheritance using domain services
- **FR-013**: System MUST implement API endpoints with authentication, authorization, and tenant context using @hl8/interface-kernel RestController, AuthenticationGuard, and AuthorizationGuard
- **FR-014**: System MUST implement comprehensive testing including unit tests (90% coverage), integration tests, and end-to-end tests following the testing strategy guidelines
- **FR-015**: System MUST implement performance optimizations to handle 1000 concurrent users without degradation using proper caching and database optimization
- **FR-016**: System MUST implement proper error handling and logging using @hl8/exceptions DomainException, BusinessException, ValidationException, NotFoundException and @hl8/nestjs-fastify Logger
- **FR-017**: System MUST implement tenant resource limits and enforcement to prevent resource exhaustion using business rules and domain services
- **FR-018**: System MUST implement proper data validation and business rule enforcement for all domain operations using domain services and business rules
- **FR-019**: System MUST implement proper dependency injection and inversion of control for testability and maintainability using NestJS dependency injection
- **FR-020**: System MUST implement proper configuration management using @hl8/config ConfigService for different environments and tenant-specific settings
- **FR-021**: System MUST implement database support for both PostgreSQL (default) and MongoDB (optional) with proper repository implementations for each database type
- **FR-022**: System MUST implement caching using @hl8/caching ICacheService for performance optimization and data caching
- **FR-023**: System MUST implement messaging using @hl8/messaging for event-driven architecture and asynchronous processing
- **FR-024**: System MUST implement proper Chinese documentation and comments following TSDoc standards for all public APIs, classes, methods, interfaces, and enumerations
- **FR-025**: System MUST implement rich domain model (充血模型) where domain objects contain business logic and behavior, not just data containers, and MUST separate aggregate roots from internal entities according to the entity-aggregate separation principle (aggregate roots manage boundaries, coordinate internal entities, and publish events; internal entities execute business operations and maintain state). **⚠️ MANDATORY**: This separation applies to ALL aggregates regardless of complexity (business changes, architectural consistency, maintainability, team standards)
- **FR-026**: System MUST implement 5-layer multi-tenant isolation architecture (Platform → Tenant → Organization → Department → User) with proper access control and data isolation at each level
- **FR-027**: System MUST implement progressive database strategy selection supporting ROW_LEVEL_SECURITY (default), SCHEMA_PER_TENANT (medium tenants), and DATABASE_PER_TENANT (large tenants) based on tenant size and requirements
- **FR-028**: System MUST implement strict permission hierarchy (Platform Admin > Tenant Admin > Organization Admin > Department Admin > User) ensuring proper permission inheritance and access control
- **FR-029**: System MUST implement up to 8 levels of department hierarchy with path tracking, parent-child relationships, department movement, and hierarchical queries
- **FR-030**: System MUST implement organization sharing mechanisms supporting private and shared organizations with cross-organization resource sharing
- **FR-031**: System MUST implement user assignment rules ensuring users can only belong to one department per organization while supporting multi-organization membership
- **FR-032**: System MUST implement platform-level data isolation ensuring complete separation between platform administrator data and tenant data using independent schemas or databases
- **FR-033**: System MUST implement tenant type management supporting FREE (5 users, 100MB, 1 org), BASIC (50 users, 1GB, 2 orgs), PROFESSIONAL (500 users, 10GB, 10 orgs), ENTERPRISE (10,000 users, 100GB, 100 orgs), and CUSTOM (unlimited) with proper resource limits
- **FR-034**: System MUST implement tenant lifecycle management supporting TRIAL → ACTIVE → SUSPENDED → EXPIRED → DELETED state transitions with proper business rules
- **FR-035**: System MUST implement organization types supporting Committee (专业委员会), ProjectTeam (项目管理团队), QualityGroup (质量控制小组), and PerformanceGroup (绩效管理小组) with horizontal management structure
- **FR-036**: System MUST implement department hierarchy supporting up to 8 levels with vertical management structure and proper parent-child relationships
- **FR-037**: System MUST implement user classification system supporting platform users, tenant users, system users with proper role hierarchy (Platform Admin > Tenant Admin > Organization Admin > Department Admin > Regular User)
- **FR-038**: System MUST implement tenant creation workflow where platform users can apply to create tenants with proper validation, uniqueness constraints, and automatic admin assignment
- **FR-039**: System MUST implement resource monitoring and alerting system for user limits, storage usage, and API call limits with proper escalation and upgrade recommendations
- **FR-040**: System MUST implement audit logging for all tenant operations, user activities, and system changes with complete traceability and compliance support
- **FR-041**: System MUST preserve existing libs/saas-core directory structure (src/domain, src/application, src/infrastructure, src/interface) during redevelopment
- **FR-042**: System MUST follow global configuration standardization as defined in .cursor/docs/global-configuration-standardization.md for ESLint, TypeScript, Jest, and package.json configurations
- **FR-043**: System MUST maintain existing package.json structure with proper workspace dependencies and standardized scripts
- **FR-044**: System MUST ensure all configuration files (eslint.config.mjs, tsconfig.json, jest.config.ts) follow the global standardization patterns
- **FR-045**: System MUST preserve existing subdomain structure within each Clean Architecture layer (domain/aggregates, domain/entities, domain/value-objects, application/commands, application/queries, application/use-cases, infrastructure/repositories, infrastructure/casl, infrastructure/cache, interface/controllers, interface/dto, interface/guards)
- **FR-046**: System MUST maintain existing database subdomain separation (infrastructure/repositories/postgresql, infrastructure/repositories/mongodb) for multi-database support
- **FR-047**: System MUST preserve existing infrastructure subdomain organization (casl, cache, database, entities, mappers, repositories, services) for proper separation of concerns
- **FR-048**: System MUST prioritize using @hl8 kernel components as the foundation for saas-core business module development, leveraging generic base components from each layer
- **FR-049**: System MUST utilize @hl8/domain-kernel base classes (BaseEntity, AggregateRoot, BaseValueObject, EntityId) for all domain objects instead of creating custom implementations
- **FR-049A**: System MUST PRIORITIZE using existing value objects from @hl8/domain-kernel (TenantId, OrganizationId, DepartmentId, UserId, RoleId, GenericEntityId) instead of creating duplicate implementations
- **FR-050**: System MUST utilize @hl8/application-kernel components (BaseUseCase, BaseCommand, BaseQuery, CommandHandler, QueryHandler) for all application layer operations
- **FR-051**: System MUST utilize @hl8/infrastructure-kernel components for all infrastructure layer implementations instead of creating custom infrastructure code
- **FR-052**: System MUST utilize @hl8/interface-kernel components (RestController, AuthenticationGuard, AuthorizationGuard) for all interface layer implementations
- **FR-053**: System MUST utilize @hl8 cross-cutting concern components (@hl8/exceptions, @hl8/caching, @hl8/config, @hl8/nestjs-fastify) for all cross-cutting concerns instead of custom implementations
- **FR-054**: System MUST utilize @hl8/domain-kernel isolation components (IsolationContext, IsolationLevel, SharingLevel, DataAccessContext) for all data isolation requirements instead of custom isolation implementations
- **FR-055**: System MUST implement data isolation using IsolationContext.buildWhereClause() for all database queries to ensure proper tenant/organization/department/user level filtering
- **FR-056**: System MUST implement cache isolation using IsolationContext.buildCacheKey() for all cache operations to ensure proper data separation across isolation levels
- **FR-057**: System MUST implement access control using IsolationContext.canAccess() for all data access operations to ensure proper permission validation

### Key Entities _(include if feature involves data)_

- **Platform**: SAAS service provider responsible for system development, technical support, and commercial services, managing all tenants and users with global configuration and management capabilities
- **Tenant**: Independent customer units with isolated data space and configuration environment, supporting Enterprise (企业租户), Community (社群租户), Team (团队租户), and Personal (个人租户) types with resource limits (FREE: 5 users/100MB/1 org, BASIC: 50 users/1GB/2 orgs, PROFESSIONAL: 500 users/10GB/10 orgs, ENTERPRISE: 10,000 users/100GB/100 orgs, CUSTOM: unlimited)
- **Organization**: Horizontal management units within tenants for specific functions, supporting Committee (专业委员会), ProjectTeam (项目管理团队), QualityGroup (质量控制小组), and PerformanceGroup (绩效管理小组) with horizontal management structure
- **Department**: Vertical management units within organizations with hierarchical structure supporting up to 8 levels with parent-child relationships and path tracking
- **User**: System users classified by source (Platform, Tenant, System), type (Personal, Enterprise, Community, Team), role (Platform Admin > Tenant Admin > Organization Admin > Department Admin > Regular User), status (Active, Pending, Disabled, Locked, Expired), and affiliation (Platform-level, Tenant-level, Organization-level, Department-level)
- **Role**: User roles defining permissions and access levels within the strict hierarchy (Platform Admin > Tenant Admin > Organization Admin > Department Admin > Regular User)
- **Permission**: Access control entities defining what actions users can perform at different organizational levels with proper inheritance and access control
- **Authentication**: User authentication mechanisms and credentials management supporting platform users, tenant users, and system users
- **Authorization**: Access control and permission verification for multi-tenant operations with proper isolation and security
- **TenantConfiguration**: Tenant-specific settings including resource limits, feature flags, isolation strategy, and business rules
- **DomainEvent**: Business events representing important state changes in the system for event-driven architecture and audit trails

### Subdomains

SAAS Core module consists of 8 distinct subdomains that need to be redeveloped:

1. **Tenant Management Subdomain**: Tenant lifecycle, types, and configuration management
2. **Organization Management Subdomain**: Organization structure and type management
3. **Department Management Subdomain**: Department hierarchy and relationship management
4. **User Management Subdomain**: User identity and assignment management
5. **Role Management Subdomain**: Role definition and assignment within organizational hierarchy
6. **Authentication Subdomain**: User authentication mechanisms and credential management
7. **Authorization Subdomain**: Access control and permission verification for multi-tenant operations
8. **Multi-Tenant Architecture Subdomain**: Data isolation, security, and tenant-specific configurations

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Clean Architecture implementation is completed with proper separation of concerns and dependency injection using @hl8 kernel components within 4 weeks
- **SC-002**: All domain entities, value objects, and aggregates are implemented using @hl8/domain-kernel base classes with 100% business rule coverage, proper validation, and entity-aggregate separation principle (aggregate roots coordinate internal entities and publish events; internal entities execute business operations and maintain state). **⚠️ MANDATORY**: All aggregates (simple or complex) MUST implement entity-aggregate separation for future-proofing and architectural consistency
- **SC-003**: Multi-tenant data isolation is implemented with ROW_LEVEL_SECURITY using @hl8/domain-kernel IsolationContext and achieves 100% tenant data separation
- **SC-004**: Event sourcing is implemented for all core business subdomains using @hl8/domain-kernel event infrastructure with complete event capture and state reconstruction capabilities
- **SC-005**: CQRS implementation achieves proper separation of read and write operations using @hl8/application-kernel components with eventual consistency
- **SC-006**: API layer implementation provides complete CRUD operations for all domain entities using @hl8/interface-kernel components with proper authentication and authorization
- **SC-007**: Testing implementation achieves 90% code coverage for unit tests and 100% coverage for critical business logic following the testing strategy guidelines
- **SC-008**: Performance implementation supports 1000 concurrent users without degradation using @hl8/caching and database optimization
- **SC-009**: All 8 subdomains are properly implemented with clear boundaries and proper integration patterns using kernel components
- **SC-010**: System passes all security audits and compliance requirements for multi-tenant data isolation using proper kernel security mechanisms
- **SC-011**: New implementation resolves all existing architectural issues and provides a solid foundation for future development using hybrid architecture pattern
- **SC-012**: Development team can implement new features 50% faster due to improved architecture and code quality using kernel components
- **SC-013**: System maintains 99.9% uptime during normal operations and handles expected load without performance degradation using proper infrastructure components
- **SC-014**: All business requirements from the original specification are fully implemented and validated using kernel components
- **SC-015**: Database implementation supports both PostgreSQL (default) and MongoDB (optional) with proper repository implementations for each database type
- **SC-016**: All code follows Chinese documentation standards with TSDoc comments for all public APIs, classes, methods, interfaces, and enumerations
- **SC-017**: Rich domain model (充血模型) is implemented where domain objects contain business logic and behavior, not just data containers, and entity-aggregate separation is properly implemented (aggregate roots manage boundaries and coordinate internal entities; internal entities execute business operations and maintain state). **⚠️ MANDATORY**: Entity-aggregate separation is required for ALL aggregates, regardless of current complexity, to ensure future scalability and maintainability
- **SC-018**: All error handling and logging uses @hl8/exceptions and @hl8/nestjs-fastify components for consistent error management
- **SC-019**: Configuration management uses @hl8/config ConfigService for all environment and tenant-specific settings
- **SC-020**: Messaging implementation uses @hl8/messaging for event-driven architecture and asynchronous processing
- **SC-021**: 5-layer multi-tenant isolation architecture is implemented with proper RLS policies and access control at each level (Platform, Tenant, Organization, Department, User)
- **SC-022**: Progressive database strategy selection is implemented supporting RLS, SCHEMA_PER_TENANT, and DATABASE_PER_TENANT based on tenant requirements
- **SC-023**: Strict permission hierarchy is implemented with proper inheritance and access control (Platform Admin > Tenant Admin > Organization Admin > Department Admin > User)
- **SC-024**: Department hierarchy supports up to 8 levels with path tracking, parent-child relationships, and efficient hierarchical queries
- **SC-025**: Organization sharing mechanisms support both private and shared organizations with proper cross-organization resource access
- **SC-026**: User assignment rules ensure single department per organization while supporting multi-organization membership
- **SC-027**: Platform-level data isolation is implemented with complete separation between platform and tenant data using independent schemas or databases
- **SC-028**: Tenant type management supports all 5 tenant types (FREE, BASIC, PROFESSIONAL, ENTERPRISE, CUSTOM) with proper resource limits and validation
- **SC-029**: Tenant lifecycle management supports all state transitions (TRIAL → ACTIVE → SUSPENDED → EXPIRED → DELETED) with proper business rules and validation
- **SC-030**: Organization types support all 4 organization types (Committee, ProjectTeam, QualityGroup, PerformanceGroup) with horizontal management structure
- **SC-031**: Department hierarchy supports up to 8 levels with vertical management structure, proper parent-child relationships, and efficient hierarchical queries
- **SC-032**: User classification system supports platform users, tenant users, system users with proper role hierarchy and permission inheritance
- **SC-033**: Tenant creation workflow allows platform users to apply for tenant creation with proper validation, uniqueness constraints, and automatic admin assignment
- **SC-034**: Resource monitoring and alerting system provides real-time monitoring of user limits, storage usage, and API call limits with proper escalation and upgrade recommendations
- **SC-035**: Audit logging system captures all tenant operations, user activities, and system changes with complete traceability and compliance support
- **SC-036**: Existing libs/saas-core directory structure is preserved with proper Clean Architecture layer separation (src/domain, src/application, src/infrastructure, src/interface)
- **SC-037**: All configuration files follow global standardization patterns as defined in .cursor/docs/global-configuration-standardization.md
- **SC-038**: Package.json maintains proper workspace dependencies and standardized scripts following global configuration standards
- **SC-039**: ESLint, TypeScript, and Jest configurations are properly aligned with global standardization requirements
- **SC-040**: Existing subdomain structure is preserved within each Clean Architecture layer with proper separation of concerns
- **SC-041**: Database subdomain separation is maintained (postgresql, mongodb) for multi-database support
- **SC-042**: Infrastructure subdomain organization is preserved (casl, cache, database, entities, mappers, repositories, services) for proper separation of concerns
- **SC-043**: @hl8 kernel components are prioritized as the foundation for saas-core business module development with proper utilization of generic base components from each layer
- **SC-044**: All domain objects utilize @hl8/domain-kernel base classes (BaseEntity, AggregateRoot, BaseValueObject, EntityId) instead of custom implementations
- **SC-044A**: All value objects MUST utilize existing @hl8/domain-kernel value objects (TenantId, OrganizationId, DepartmentId, UserId, RoleId, GenericEntityId) instead of creating duplicate implementations
- **SC-045**: All application layer operations utilize @hl8/application-kernel components (BaseUseCase, BaseCommand, BaseQuery, CommandHandler, QueryHandler) instead of custom implementations
- **SC-046**: All infrastructure layer implementations utilize @hl8/infrastructure-kernel components instead of custom infrastructure code
- **SC-047**: All interface layer implementations utilize @hl8/interface-kernel components (RestController, AuthenticationGuard, AuthorizationGuard) instead of custom implementations
- **SC-048**: All cross-cutting concerns utilize @hl8 cross-cutting concern components (@hl8/exceptions, @hl8/caching, @hl8/config, @hl8/nestjs-fastify) instead of custom implementations
- **SC-049**: All data isolation requirements utilize @hl8/domain-kernel isolation components (IsolationContext, IsolationLevel, SharingLevel, DataAccessContext) instead of custom isolation implementations
- **SC-050**: All database queries implement data isolation using IsolationContext.buildWhereClause() to ensure proper tenant/organization/department/user level filtering
- **SC-051**: All cache operations implement cache isolation using IsolationContext.buildCacheKey() to ensure proper data separation across isolation levels
- **SC-052**: All data access operations implement access control using IsolationContext.canAccess() to ensure proper permission validation

## Clarifications

### Session 2024-12-19

- Q: 明确排除范围声明 - 什么功能应该明确排除在重新开发范围之外？ → A: 从现有saas-core实现的数据迁移不在范围内（专注于干净的重新开发）
- Q: 数据导入/导出格式 - 系统需要支持什么格式的数据导入/导出？ → A: 支持JSON格式的数据导入/导出（租户、组织、部门、用户数据）
- Q: 外部服务故障处理 - @hl8内核组件不可用时系统应该如何响应？ → A: 实现优雅降级和重试机制（@hl8内核组件不可用时提供基础功能）
- Q: 租户名称冲突解决 - 当租户名称已存在时系统应该如何处理？ → A: 要求用户重新输入不同的租户名称
- Q: 性能优化优先级 - 在性能优化方面应该优先关注哪个方面？ → A: 优先优化数据库查询和缓存（多租户数据隔离查询优化）
- Q: 目录结构和配置标准化 - 重新开发时是否需要保留现有目录结构并遵循全局配置标准化？ → A: 保留libs/saas-core现有的目录结构，配置要符合.cursor/docs/global-configuration-standardization.md
- Q: 子领域划分保留 - 重新开发时是否需要保留现有的子领域划分结构？ → A: 保留libs/saas-core的子领域划分
- Q: 内核组件优先使用 - saas-core业务模块开发是否要优先使用@hl8内核组件？ → A: 重点提示：saas-core业务模块的开发实在kernel的基础上进行开发的，要优先使用各层的kernel提供的通用基础组件和现有的架构层提供的基础设施

## Assumptions

- The existing @hl8 kernel infrastructure (@hl8/domain-kernel, @hl8/application-kernel, @hl8/infrastructure-kernel, @hl8/interface-kernel) provides stable foundation components that will be leveraged by the redeveloped SAAS Core module
- The current saas-core implementation has architectural issues that require complete redevelopment rather than incremental fixes
- The development team has sufficient experience with the hybrid architecture pattern (Clean Architecture + DDD + CQRS + ES + EDA) and kernel components to implement the redevelopment
- The business requirements from the original specification (specs/005-spec-documentation) are still valid and applicable
- The redevelopment will maintain backward compatibility with existing integrations where possible
- The new implementation will follow the hybrid architecture pattern and coding standards as defined in docs/architecture
- All stakeholders understand that redevelopment will take longer than incremental fixes but will result in better long-term maintainability
- All kernel components (@hl8/domain-kernel, @hl8/application-kernel, @hl8/infrastructure-kernel, @hl8/interface-kernel, @hl8/exceptions, @hl8/caching, @hl8/config, @hl8/nestjs-fastify) are stable and ready for use
- The database infrastructure supports both PostgreSQL (default) and MongoDB (optional) as specified in the architecture documentation
- The Chinese documentation and TSDoc standards are properly established and will be followed throughout the development
- **Multi-tenant isolation strategy**: The implementation must support 5-layer isolation architecture (Platform → Tenant → Organization → Department → User) with proper RLS policies
- **Database strategy selection**: The system must support progressive database strategies (RLS → SCHEMA_PER_TENANT → DATABASE_PER_TENANT) based on tenant size and requirements
- **Permission hierarchy**: The system must implement strict permission hierarchy (Platform Admin > Tenant Admin > Organization Admin > Department Admin > User)
- **Department hierarchy**: The system must support up to 8 levels of department hierarchy with proper path tracking and parent-child relationships
- **Kernel component prioritization**: saas-core business module development must be based on @hl8 kernel components, prioritizing the use of generic base components and existing infrastructure from each architectural layer

## Dependencies

- Access to existing @hl8 kernel infrastructure source code, documentation, and architectural patterns
- Complete business requirements from specs/005-spec-documentation for SAAS Core module
- Review and approval from senior architects, domain experts, and security specialists
- Development team with experience in hybrid architecture pattern (Clean Architecture + DDD + CQRS + ES + EDA) and kernel components
- Access to existing saas-core codebase for understanding current issues and requirements
- Integration with existing platform infrastructure and monitoring systems
- Testing infrastructure and tools for comprehensive testing implementation
- Access to docs/architecture documentation for architectural guidance and best practices
- Availability of all @hl8 kernel components (@hl8/domain-kernel, @hl8/application-kernel, @hl8/infrastructure-kernel, @hl8/interface-kernel, @hl8/exceptions, @hl8/caching, @hl8/config, @hl8/nestjs-fastify)
- Database infrastructure supporting both PostgreSQL (default) and MongoDB (optional)

## Constraints

- Redevelopment must follow the hybrid architecture pattern and coding standards as defined in docs/architecture
- The new implementation must use @hl8 kernel components and maintain compatibility with existing kernel infrastructure
- All code must follow TSDoc standards for documentation and be written in Chinese as per project requirements
- The redevelopment must be completed within 8 weeks to avoid impacting other project timelines
- The new implementation must support all existing tenant types and organizational structures
- All security and compliance requirements must be maintained or improved in the new implementation
- The redevelopment must not break existing integrations or require changes to other platform modules
- All domain objects must implement rich domain model (充血模型) with business logic and behavior, and must follow the entity-aggregate separation principle (aggregate roots manage boundaries, coordinate internal entities, and publish events; internal entities execute business operations and maintain state). **⚠️ MANDATORY**: Entity-aggregate separation is required for ALL aggregates, regardless of complexity, because: (1) business requirements change over time, (2) architectural consistency reduces cognitive load, (3) separation improves maintainability and extensibility, (4) unified patterns eliminate decision overhead
- Database implementation must support both PostgreSQL (default) and MongoDB (optional) with proper repository implementations
- All error handling and logging must use @hl8/exceptions and @hl8/nestjs-fastify components
- Configuration management must use @hl8/config ConfigService for all settings
- Caching implementation must use @hl8/caching ICacheService for performance optimization
- Messaging implementation must use @hl8/messaging for event-driven architecture
- Multi-tenant isolation must implement 5-layer architecture (Platform → Tenant → Organization → Department → User) with proper RLS policies
- Database strategy must support progressive migration from RLS to SCHEMA_PER_TENANT to DATABASE_PER_TENANT based on tenant requirements
- Permission hierarchy must be strictly enforced (Platform Admin > Tenant Admin > Organization Admin > Department Admin > User)
- Department hierarchy must support up to 8 levels with proper path tracking and parent-child relationships
- Organization sharing must support both private and shared organizations with proper access control
- User assignment must ensure single department per organization while supporting multi-organization membership
- Platform-level data must be completely isolated from tenant data using independent schemas or databases
- Tenant type management must support all 5 tenant types (FREE, BASIC, PROFESSIONAL, ENTERPRISE, CUSTOM) with proper resource limits and validation
- Tenant lifecycle management must support all state transitions (TRIAL → ACTIVE → SUSPENDED → EXPIRED → DELETED) with proper business rules
- Organization types must support all 4 organization types (Committee, ProjectTeam, QualityGroup, PerformanceGroup) with horizontal management structure
- Department hierarchy must support up to 8 levels with vertical management structure and proper parent-child relationships
- User classification system must support platform users, tenant users, system users with proper role hierarchy
- Tenant creation workflow must allow platform users to apply for tenant creation with proper validation and uniqueness constraints
- Resource monitoring and alerting system must provide real-time monitoring with proper escalation and upgrade recommendations
- Audit logging system must capture all operations with complete traceability and compliance support
- Existing libs/saas-core directory structure must be preserved during redevelopment (src/domain, src/application, src/infrastructure, src/interface)
- All configuration files must follow global standardization patterns as defined in .cursor/docs/global-configuration-standardization.md
- Package.json must maintain proper workspace dependencies and standardized scripts following global configuration standards
- ESLint, TypeScript, and Jest configurations must be properly aligned with global standardization requirements
- Existing subdomain structure must be preserved within each Clean Architecture layer (domain/aggregates, domain/entities, domain/value-objects, application/commands, application/queries, application/use-cases, infrastructure/repositories, infrastructure/casl, infrastructure/cache, interface/controllers, interface/dto, interface/guards)
- Database subdomain separation must be maintained (infrastructure/repositories/postgresql, infrastructure/repositories/mongodb) for multi-database support
- Infrastructure subdomain organization must be preserved (casl, cache, database, entities, mappers, repositories, services) for proper separation of concerns
- @hl8 kernel components must be prioritized as the foundation for saas-core business module development, leveraging generic base components from each layer
- All domain objects must utilize @hl8/domain-kernel base classes (BaseEntity, AggregateRoot, BaseValueObject, EntityId) instead of creating custom implementations
- All application layer operations must utilize @hl8/application-kernel components (BaseUseCase, BaseCommand, BaseQuery, CommandHandler, QueryHandler) instead of custom implementations
- All infrastructure layer implementations must utilize @hl8/infrastructure-kernel components instead of creating custom infrastructure code
- All interface layer implementations must utilize @hl8/interface-kernel components (RestController, AuthenticationGuard, AuthorizationGuard) instead of custom implementations
- All cross-cutting concerns must utilize @hl8 cross-cutting concern components (@hl8/exceptions, @hl8/caching, @hl8/config, @hl8/nestjs-fastify) instead of custom implementations
- All data isolation requirements must utilize @hl8/domain-kernel isolation components (IsolationContext, IsolationLevel, SharingLevel, DataAccessContext) instead of custom isolation implementations
- All database queries must implement data isolation using IsolationContext.buildWhereClause() to ensure proper tenant/organization/department/user level filtering
- All cache operations must implement cache isolation using IsolationContext.buildCacheKey() to ensure proper data separation across isolation levels
- All data access operations must implement access control using IsolationContext.canAccess() to ensure proper permission validation
