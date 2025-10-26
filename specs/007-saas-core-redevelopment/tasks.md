# Implementation Tasks: SAAS Core Module Redevelopment

**Feature**: SAAS Core Module Redevelopment  
**Branch**: `007-saas-core-redevelopment`  
**Date**: 2024-12-27 (Updated)  
**Approach**: Layered Development (Domain → Application → Infrastructure → Interface)

## Overview

This document outlines the implementation tasks for redeveloping the SAAS Core module using Clean Architecture + DDD + CQRS + ES + EDA hybrid architecture pattern, based on @hl8 kernel components with layered development approach.

**⚠️ MANDATORY Principle**: Entity-Aggregate Separation - All aggregates (simple or complex) MUST separate aggregate roots from internal entities.

**Key Requirements**:

- **Internal Entities**: Execute business operations and maintain state
- **Aggregate Roots**: Coordinate internal entities, manage boundaries, and publish events
- **Priority**: Use existing @hl8/domain-kernel value objects (TenantId, OrganizationId, DepartmentId, UserId, RoleId, GenericEntityId)

**Total Tasks**: 156  
**Completed Tasks**: 45 (~29% Domain Layer Complete)

## Implementation Status

**Domain Layer**: ✅ 95% Complete (45 tasks completed)

- ✅ All Value Objects (14): TenantType, TenantStatus, OrganizationType, OrganizationStatus, DepartmentStatus, DepartmentPath, UserSource, UserType, UserRole, UserStatus, PermissionAction, PermissionScope, RoleType, CredentialType
- ✅ All Entities (7): TenantEntity, OrganizationEntity, DepartmentEntity, UserEntity, PermissionEntity, RoleEntity, CredentialEntity
- ✅ All Aggregates (7): Tenant, Organization, Department, User, Permission, Role, Credential
- ✅ Domain Services (4): PermissionService, RoleService, AuthenticationService, AuthorizationService
- ✅ Business Rules (5): PermissionAssignmentBusinessRule, AuthorizationCheckBusinessRule, RoleInheritanceBusinessRule, CredentialValidationBusinessRule, UserActiveSpecification
- ✅ Specifications (4): UserActiveSpecification, UserPermissionSpecification, UserOrganizationSpecification, TenantActiveSpecification, TenantResourceLimitSpecification
- ✅ Repository Interfaces (7): IUserRepository, ITenantRepository, IOrganizationRepository, IDepartmentRepository, IPermissionRepository, IRoleRepository, ICredentialRepository
- ✅ Domain Events (26+): All major events defined

**Application Layer**: ⏸️ 0% (Not Started - Next Priority)
**Infrastructure Layer**: ⏸️ 0% (Not Started)
**Interface Layer**: ⏸️ 0% (Not Started)

## Phase 1: Project Setup

- [ ] T001 Create project structure per implementation plan in libs/saas-core/
- [ ] T002 Configure package.json with proper workspace dependencies and standardized scripts
- [ ] T003 Setup ESLint configuration extending root eslint.config.mjs
- [ ] T004 Setup TypeScript configuration extending monorepo root tsconfig.json
- [ ] T005 Setup Jest configuration for testing architecture
- [ ] T006 Create directory structure preserving existing subdomain organization
- [ ] T007 Setup database connection configuration for PostgreSQL and MongoDB
- [ ] T008 Setup Redis cache configuration
- [ ] T009 Configure @hl8 kernel component dependencies
- [ ] T010 Setup development environment and tooling

## Phase 2: Foundational Tasks

- [ ] T011 [P] Setup @hl8/domain-kernel base classes and interfaces
- [ ] T012 [P] Setup @hl8/application-kernel components and handlers
- [ ] T013 [P] Setup @hl8/infrastructure-kernel components and adapters
- [ ] T014 [P] Setup @hl8/interface-kernel components and controllers
- [ ] T015 [P] Setup @hl8 cross-cutting concern components (exceptions, caching, config, nestjs-fastify)
- [ ] T016 [P] Setup @hl8/domain-kernel isolation components (IsolationContext, IsolationLevel, SharingLevel)
- [ ] T017 [P] Configure database schemas and RLS policies
- [ ] T018 [P] Setup event sourcing infrastructure
- [ ] T019 [P] Setup CQRS infrastructure
- [ ] T020 [P] Setup audit logging infrastructure

## Phase 3: Domain Layer Implementation (User Story 1 - Clean Architecture) ✅ 95% COMPLETE

### Value Objects ✅

- [x] T031 [US1] Skip PlatformId - use existing @hl8/domain-kernel value objects (GenericEntityId) ✅
- [x] T032 [US1] Skip TenantId - use existing @hl8/domain-kernel value object (TenantId) ✅
- [x] T035 [P] [US1] Create TenantType value object ✅
- [x] T036 [P] [US1] Create TenantStatus value object ✅
- [x] T037 [US1] Skip OrganizationId - use existing @hl8/domain-kernel value object (OrganizationId) ✅
- [x] T038 [US1] Skip DepartmentId - use existing @hl8/domain-kernel value object (DepartmentId) ✅
- [x] T039 [US1] Skip UserId - use existing @hl8/domain-kernel value object (UserId) ✅
- [x] T033 [P] [US1] Create OrganizationType value object ✅
- [x] T034 [P] [US1] Create OrganizationStatus value object ✅
- [x] T040 [P] [US1] Create DepartmentStatus value object ✅
- [x] T041 [P] [US1] Create DepartmentPath value object (8-level hierarchy) ✅
- [x] T042 [P] [US1] Create UserSource value object ✅
- [x] T043 [P] [US1] Create UserType value object ✅
- [x] T044 [P] [US1] Create UserRole value object ✅
- [x] T045 [P] [US1] Create UserStatus value object ✅
- [x] T046 [P] [US1] Create PermissionAction value object ✅
- [x] T047 [P] [US1] Create PermissionScope value object ✅
- [x] T048 [P] [US1] Create RoleType value object ✅
- [x] T049 [P] [US1] Create CredentialType value object ✅

### Internal Entities ✅

- [x] T021 [P] [US1] Create TenantEntity (内部实体) ✅
- [x] T022 [P] [US1] Create OrganizationEntity (内部实体) ✅
- [x] T023 [P] [US1] Create DepartmentEntity (内部实体) ✅
- [x] T024 [P] [US1] Create UserEntity (内部实体) ✅
- [x] T025 [P] [US1] Create RoleEntity (内部实体) ✅
- [x] T026 [P] [US1] Create PermissionEntity (内部实体) ✅
- [x] T028 [P] [US1] Create CredentialEntity (内部实体) ✅

### Aggregate Roots ✅

- [x] T050 [P] [US1] Create Tenant aggregate root ✅
- [x] T051 [P] [US1] Create Organization aggregate root ✅
- [x] T052 [P] [US1] Create Department aggregate root ✅
- [x] T053 [P] [US1] Create User aggregate root ✅
- [x] T054 [P] [US1] Create Role aggregate root ✅
- [x] T055 [P] [US1] Create Permission aggregate root ✅
- [x] T056 [P] [US1] Create Credential aggregate root ✅

### Domain Services ✅

- [x] T057 [P] [US1] Create PermissionService ✅
- [x] T058 [P] [US1] Create RoleService ✅
- [x] T059 [P] [US1] Create AuthenticationService ✅
- [x] T060 [P] [US1] Create AuthorizationService ✅

### Business Rules ✅

- [x] T061 [P] [US1] Create PermissionAssignmentBusinessRule ✅
- [x] T062 [P] [US1] Create AuthorizationCheckBusinessRule ✅
- [x] T063 [P] [US1] Create RoleInheritanceBusinessRule ✅
- [x] T064 [P] [US1] Create CredentialValidationBusinessRule ✅

### Specifications ✅

- [x] T065 [P] [US1] Create UserActiveSpecification ✅
- [x] T066 [P] [US1] Create UserPermissionSpecification ✅
- [x] T067 [P] [US1] Create UserOrganizationSpecification ✅
- [x] T068 [P] [US1] Create TenantActiveSpecification ✅
- [x] T069 [P] [US1] Create TenantResourceLimitSpecification ✅

### Repository Interfaces ✅

- [x] T070 [P] [US1] Create IUserRepository interface ✅
- [x] T071 [P] [US1] Create ITenantRepository interface ✅
- [x] T072 [P] [US1] Create IOrganizationRepository interface ✅
- [x] T073 [P] [US1] Create IDepartmentRepository interface ✅
- [x] T074 [P] [US1] Create IPermissionRepository interface ✅
- [x] T075 [P] [US1] Create IRoleRepository interface ✅
- [x] T076 [P] [US1] Create ICredentialRepository interface ✅

### Domain Events ✅

- [x] T077 [P] [US1] Create all Tenant domain events ✅
- [x] T078 [P] [US1] Create all Organization domain events ✅
- [x] T079 [P] [US1] Create all Department domain events ✅
- [x] T080 [P] [US1] Create all User domain events ✅
- [x] T081 [P] [US1] Create all Role domain events ✅
- [x] T082 [P] [US1] Create all Permission domain events ✅
- [x] T083 [P] [US1] Create all Credential domain events ✅
- [x] T084 [P] [US1] Create all Authentication domain events ✅

### Pending Domain Tasks

- [ ] T085 [P] [US1] Create PlatformEntity (内部实体)
- [ ] T086 [P] [US1] Create Platform aggregate root
- [ ] T087 [US1] Skip PlatformId - use GenericEntityId
- [ ] T088 [P] [US1] Create TenantConfigurationEntity
- [ ] T089 [P] [US1] Create TenantBusinessRulesService
- [ ] T090 [P] [US1] Create UserBusinessRulesService
- [ ] T091 [P] [US1] Create OrganizationBusinessRulesService
- [ ] T092 [P] [US1] Create DepartmentBusinessRulesService
- [ ] T093 [P] [US1] Create IsolationContextService

## Phase 4: Application Layer Implementation (User Story 2 - Multi-Tenant Data Isolation) ⏸️ NEXT PRIORITY

### Commands

- [ ] T094 [P] [US2] Create CreateTenantCommand in src/application/commands/create-tenant.command.ts
- [ ] T095 [P] [US2] Create UpdateTenantCommand in src/application/commands/update-tenant.command.ts
- [ ] T096 [P] [US2] Create CreateUserCommand in src/application/commands/create-user.command.ts
- [ ] T097 [P] [US2] Create CreateOrganizationCommand in src/application/commands/create-organization.command.ts
- [ ] T098 [P] [US2] Create CreateDepartmentCommand in src/application/commands/create-department.command.ts
- [ ] T099 [P] [US2] Create AssignPermissionCommand in src/application/commands/assign-permission.command.ts
- [ ] T100 [P] [US2] Create AssignRoleCommand in src/application/commands/assign-role.command.ts

### Queries

- [ ] T101 [P] [US2] Create GetTenantQuery in src/application/queries/get-tenant.query.ts
- [ ] T102 [P] [US2] Create GetUserQuery in src/application/queries/get-user.query.ts
- [ ] T103 [P] [US2] Create ListUsersQuery in src/application/queries/list-users.query.ts
- [ ] T104 [P] [US2] Create GetOrganizationQuery in src/application/queries/get-organization.query.ts
- [ ] T105 [P] [US2] Create GetDepartmentQuery in src/application/queries/get-department.query.ts
- [ ] T106 [P] [US2] Create CheckPermissionQuery in src/application/queries/check-permission.query.ts

### Use Cases

- [ ] T107 [P] [US2] Create CreateUserUseCase in src/application/use-cases/create-user.use-case.ts
- [ ] T108 [P] [US2] Create CreateTenantUseCase in src/application/use-cases/create-tenant.use-case.ts
- [ ] T109 [P] [US2] Create CreateOrganizationUseCase in src/application/use-cases/create-organization.use-case.ts
- [ ] T110 [P] [US2] Create UserManagementUseCase in src/application/use-cases/user-management.use-case.ts
- [ ] T111 [P] [US2] Create PermissionManagementUseCase in src/application/use-cases/permission-management.use-case.ts

### Command Handlers

- [ ] T112 [P] [US2] Create CreateUserCommandHandler in src/application/handlers/create-user.command.handler.ts
- [ ] T113 [P] [US2] Create CreateTenantCommandHandler in src/application/handlers/create-tenant.command.handler.ts
- [ ] T114 [P] [US2] Create CreateOrganizationCommandHandler in src/application/handlers/create-organization.command.handler.ts
- [ ] T115 [P] [US2] Create AssignPermissionCommandHandler in src/application/handlers/assign-permission.command.handler.ts

### Query Handlers

- [ ] T116 [P] [US2] Create GetUserQueryHandler in src/application/handlers/get-user.query.handler.ts
- [ ] T117 [P] [US2] Create ListUsersQueryHandler in src/application/handlers/list-users.query.handler.ts
- [ ] T118 [P] [US2] Create CheckPermissionQueryHandler in src/application/handlers/check-permission.query.handler.ts

## Phase 5: Infrastructure Layer Implementation (User Story 3 - Domain Model)

### Repositories (PostgreSQL)

- [ ] T119 [P] [US3] Create UserRepository implementation in src/infrastructure/repositories/postgresql/user.repository.ts
- [ ] T120 [P] [US3] Create TenantRepository implementation in src/infrastructure/repositories/postgresql/tenant.repository.ts
- [ ] T121 [P] [US3] Create OrganizationRepository implementation in src/infrastructure/repositories/postgresql/organization.repository.ts
- [ ] T122 [P] [US3] Create DepartmentRepository implementation in src/infrastructure/repositories/postgresql/department.repository.ts
- [ ] T123 [P] [US3] Create PermissionRepository implementation in src/infrastructure/repositories/postgresql/permission.repository.ts
- [ ] T124 [P] [US3] Create RoleRepository implementation in src/infrastructure/repositories/postgresql/role.repository.ts

### Mappers

- [ ] T125 [P] [US3] Create UserMapper in src/infrastructure/mappers/user.mapper.ts
- [ ] T126 [P] [US3] Create TenantMapper in src/infrastructure/mappers/tenant.mapper.ts
- [ ] T127 [P] [US3] Create OrganizationMapper in src/infrastructure/mappers/organization.mapper.ts
- [ ] T128 [P] [US3] Create DepartmentMapper in src/infrastructure/mappers/department.mapper.ts

### Database Services

- [ ] T129 [P] [US3] Create DatabaseService in src/infrastructure/services/database/database.service.ts
- [ ] T130 [P] [US3] Create PostgreSQLService in src/infrastructure/services/database/postgresql.service.ts

### Cache Services

- [ ] T131 [P] [US3] Create CacheService in src/infrastructure/services/cache/cache.service.ts
- [ ] T132 [P] [US3] Create RedisCacheAdapter in src/infrastructure/services/cache/redis-cache.adapter.ts

### Event Sourcing

- [ ] T133 [P] [US3] Create EventStoreAdapter in src/infrastructure/event-sourcing/event-store.adapter.ts
- [ ] T134 [P] [US3] Create EventPublisher in src/infrastructure/event-sourcing/event-publisher.ts

### Isolation Services

- [ ] T135 [P] [US3] Create IsolationContextProvider in src/infrastructure/services/isolation/isolation-context.provider.ts
- [ ] T136 [P] [US3] Create TenantContextService in src/infrastructure/services/isolation/tenant-context.service.ts

## Phase 6: Interface Layer Implementation (User Story 4 - Event-Driven Architecture)

### REST Controllers

- [ ] T137 [P] [US4] Create UserController in src/interface/controllers/user.controller.ts
- [ ] T138 [P] [US4] Create TenantController in src/interface/controllers/tenant.controller.ts
- [ ] T139 [P] [US4] Create OrganizationController in src/interface/controllers/organization.controller.ts
- [ ] T140 [P] [US4] Create DepartmentController in src/interface/controllers/department.controller.ts
- [ ] T141 [P] [US4] Create PermissionController in src/interface/controllers/permission.controller.ts

### DTOs

- [ ] T142 [P] [US4] Create UserDto in src/interface/dto/user.dto.ts
- [ ] T143 [P] [US4] Create TenantDto in src/interface/dto/tenant.dto.ts
- [ ] T144 [P] [US4] Create OrganizationDto in src/interface/dto/organization.dto.ts
- [ ] T145 [P] [US4] Create DepartmentDto in src/interface/dto/department.dto.ts
- [ ] T146 [P] [US4] Create CreateUserDto in src/interface/dto/create-user.dto.ts
- [ ] T147 [P] [US4] Create UpdateUserDto in src/interface/dto/update-user.dto.ts

### Guards and Middleware

- [ ] T148 [P] [US4] Create AuthenticationGuard in src/interface/guards/authentication.guard.ts
- [ ] T149 [P] [US4] Create AuthorizationGuard in src/interface/guards/authorization.guard.ts
- [ ] T150 [P] [US4] Create TenantContextGuard in src/interface/guards/tenant-context.guard.ts
- [ ] T151 [P] [US4] Create IsolationContextMiddleware in src/interface/middleware/isolation-context.middleware.ts

### Event Handlers

- [ ] T152 [P] [US4] Create UserEventHandler in src/interface/events/user.event.handler.ts
- [ ] T153 [P] [US4] Create TenantEventHandler in src/interface/events/tenant.event.handler.ts
- [ ] T154 [P] [US4] Create OrganizationEventHandler in src/interface/events/organization.event.handler.ts

## Phase 7: CQRS Implementation (User Story 5 - CQRS)

- [ ] T155 [P] [US5] Create CommandBus in src/application/command-bus/command.bus.ts
- [ ] T156 [P] [US5] Create QueryBus in src/application/query-bus/query.bus.ts
- [ ] T157 [P] [US5] Create EventBus in src/application/event-bus/event.bus.ts
- [ ] T158 [P] [US5] Register all command handlers in command bus
- [ ] T159 [P] [US5] Register all query handlers in query bus

## Phase 8: Testing Implementation (User Story 7 - Testing)

### Unit Tests

- [ ] T160 [P] [US7] Create unit tests for all domain entities
- [ ] T161 [P] [US7] Create unit tests for all aggregates
- [ ] T162 [P] [US7] Create unit tests for all domain services
- [ ] T163 [P] [US7] Create unit tests for all command handlers
- [ ] T164 [P] [US7] Create unit tests for all query handlers

### Integration Tests

- [ ] T165 [P] [US7] Create integration tests for repositories
- [ ] T166 [P] [US7] Create integration tests for API endpoints
- [ ] T167 [P] [US7] Create integration tests for event handling

### End-to-End Tests

- [ ] T168 [P] [US7] Create e2e tests for user creation workflow
- [ ] T169 [P] [US7] Create e2e tests for tenant management
- [ ] T170 [P] [US7] Create e2e tests for organization management

## Dependencies

### Story Completion Order

1. **User Story 1 (Clean Architecture)**: ✅ 95% Complete - Domain Layer foundation established
2. **User Story 2 (Multi-Tenant Data Isolation)**: ⏸️ Next Priority - Depends on User Story 1
3. **User Story 3 (Domain Model)**: Infrastructure Layer implementation
4. **User Story 4 (Event-Driven Architecture)**: Interface Layer implementation
5. **User Story 5 (CQRS)**: Command/Query separation
6. **User Story 6 (API Layer)**: RESTful endpoints
7. **User Story 7 (Testing)**: Comprehensive test coverage
8. **User Story 8 (Performance)**: Performance optimization

## Implementation Strategy

### Current Status: Domain Layer 95% Complete

✅ **Completed**:

- All core domain components (entities, aggregates, value objects)
- Domain services with business rules integration
- Repository interfaces
- Specifications and business rules

⏸️ **Next Priority**: Application Layer

- Use Case services for core operations
- Command and Query handlers
- CQRS implementation

### MVP Scope

The MVP scope includes completing User Story 1 (remaining domain tasks) and User Story 2 (Application Layer) to establish the foundational architecture and use case orchestration.

### Next Steps

1. **Complete Domain Layer (5% remaining)**: PlatformEntity, additional domain services
2. **Implement Application Layer**: Use cases, commands, queries, and handlers
3. **Implement Infrastructure Layer**: Repository implementations and data access
4. **Implement Interface Layer**: REST controllers and DTOs

## Notes

- Domain Layer is 95% complete with all core components implemented
- All tasks follow the layered development approach: Domain → Application → Infrastructure → Interface
- All domain layer tasks must utilize @hl8 kernel components as the foundation
- Application Layer is the next priority for implementation
- Next focus: Implement use case services and CQRS command/query handlers
