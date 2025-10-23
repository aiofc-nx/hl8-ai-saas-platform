# Implementation Plan: SAAS Core Module with CASL Permission System

**Branch**: `005-spec-documentation` | **Date**: 2024-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-spec-documentation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create comprehensive technical documentation for the SAAS Core module that covers multi-tenant architecture, tenant lifecycle management, organizational structures, permission systems, and event-driven architecture. The documentation must follow Clean Architecture + DDD + CQRS + Event Sourcing + Event-Driven Architecture patterns and support the 5-tier data isolation strategy (Platform/Tenant/Organization/Department/User) with ROW_LEVEL_SECURITY as the default isolation strategy. Additionally, integrate CASL (Code Access Security Library) for sophisticated permission and authorization management across all 8 subdomains.

## Technical Context

**Language/Version**: TypeScript 5.9.2, Node.js >= 20  
**Primary Dependencies**: NestJS, @hl8/domain-kernel, @hl8/application-kernel, @hl8/infrastructure-kernel, @hl8/interface-kernel, @casl/ability, @casl/prisma, @casl/mongoose  
**Storage**: PostgreSQL with MikroORM, Redis for caching, Event Store for event sourcing  
**Testing**: Jest with ts-jest, unit tests (.spec.ts), integration tests, e2e tests  
**Target Platform**: Linux server environment, Docker containerized  
**Project Type**: Monorepo library module (libs/saas-core) with CASL permission system integration  
**Performance Goals**: Support 10,000+ concurrent tenants, <100ms tenant operations, 99.9% uptime, <50ms permission checks  
**Constraints**: Must follow Clean Architecture + DDD + CQRS + ES + EDA patterns, 5-tier data isolation, Chinese documentation, CASL integration for all 8 subdomains  
**Scale/Scope**: Multi-tenant SAAS platform supporting 5 tenant types, 7-level department hierarchy, complex permission systems with CASL-based authorization

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Architecture Compliance

- [x] **Clean Architecture**: Documentation will follow four-layer architecture (Domain, Application, Infrastructure, Interface)
- [x] **DDD Compliance**: Documentation will specify rich domain models with business logic, no anemic domain models
- [x] **CQRS Pattern**: Documentation will specify commands and queries separation
- [x] **Event Sourcing**: Documentation will specify event recording for state changes
- [x] **Event-Driven Architecture**: Documentation will specify event-based communication for loose coupling

### Monorepo Organization

- [x] **Project Structure**: Documentation will follow apps/libs/packages/examples structure
- [x] **Domain Module Independence**: SAAS Core will be developed as independent domain module
- [x] **Service Naming**: Service modules will drop "-service" suffix
- [x] **Package Management**: Uses pnpm as package manager

### Quality Assurance

- [x] **ESLint Configuration**: Will extend root eslint.config.mjs
- [x] **TypeScript Configuration**: Will extend monorepo root tsconfig.json
- [x] **Documentation**: Detailed design files will use "XS" prefix

### Testing Architecture

- [x] **Unit Tests**: Will be located in same directory as source files with .spec.ts naming
- [x] **Integration Tests**: Will be located in **tests**/integration/ directory
- [x] **E2E Tests**: Will be located in **tests**/e2e/ directory
- [x] **Test Coverage**: Core business logic ≥ 80%, critical paths ≥ 90%

### Data Isolation

- [x] **Multi-level Isolation**: Documentation will specify platform/tenant/organization/department/user level isolation
- [x] **Data Classification**: Documentation will distinguish between shared and non-shared data
- [x] **Access Rules**: Documentation will specify complete isolation context for all data access

### Unified Language

- [x] **Terminology**: Documentation will use consistent domain terminology (Platform, Tenant, Organization, Department, User)
- [x] **Entity Mapping**: Technical implementation will map to business terminology

### TypeScript Standards

- [x] **NodeNext Module System**: Will use NodeNext module system for all server-side projects
- [x] **any Type Usage**: any type usage will be justified and follow safety rules
- [x] **ESM Migration**: Will use NodeNext module system (no CommonJS)

### Error Handling

- [x] **Exception-First**: Documentation will specify exceptions for business logic, logs for monitoring
- [x] **Error Hierarchy**: Documentation will specify proper error handling at data/business/controller layers
- [x] **Anti-patterns Avoided**: Documentation will avoid log-only error handling, exception-only without logging

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
libs/saas-core/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── platform.entity.ts
│   │   │   ├── tenant.entity.ts
│   │   │   ├── organization.entity.ts
│   │   │   ├── department.entity.ts
│   │   │   ├── user.entity.ts
│   │   │   └── role.entity.ts
│   │   ├── value-objects/
│   │   │   ├── tenant-code.vo.ts
│   │   │   ├── tenant-name.vo.ts
│   │   │   ├── tenant-type.vo.ts
│   │   │   ├── tenant-status.vo.ts
│   │   │   ├── isolation-context.vo.ts
│   │   │   └── permission.vo.ts
│   │   ├── aggregates/
│   │   │   ├── tenant.aggregate.ts
│   │   │   ├── organization.aggregate.ts
│   │   │   ├── department.aggregate.ts
│   │   │   └── user.aggregate.ts
│   │   ├── services/
│   │   │   ├── tenant-creation.service.ts
│   │   │   ├── organization-management.service.ts
│   │   │   ├── permission-verification.service.ts
│   │   │   └── casl-ability.service.ts
│   │   ├── events/
│   │   │   ├── tenant-created.event.ts
│   │   │   ├── organization-changed.event.ts
│   │   │   ├── user-assigned.event.ts
│   │   │   └── permission-changed.event.ts
│   │   └── repositories/
│   │       ├── tenant.repository.ts
│   │       ├── organization.repository.ts
│   │       ├── department.repository.ts
│   │       └── user.repository.ts
│   ├── application/
│   │   ├── commands/
│   │   │   ├── create-tenant.command.ts
│   │   │   ├── update-tenant.command.ts
│   │   │   ├── delete-tenant.command.ts
│   │   │   └── assign-permission.command.ts
│   │   ├── queries/
│   │   │   ├── get-tenant.query.ts
│   │   │   ├── list-tenants.query.ts
│   │   │   ├── get-tenant-stats.query.ts
│   │   │   └── check-permission.query.ts
│   │   ├── handlers/
│   │   │   ├── create-tenant.handler.ts
│   │   │   ├── update-tenant.handler.ts
│   │   │   ├── delete-tenant.handler.ts
│   │   │   └── assign-permission.handler.ts
│   │   ├── use-cases/
│   │   │   ├── tenant-creation.use-case.ts
│   │   │   ├── tenant-upgrade.use-case.ts
│   │   │   ├── tenant-suspension.use-case.ts
│   │   │   └── permission-management.use-case.ts
│   │   └── abilities/
│   │       ├── tenant.abilities.ts
│   │       ├── organization.abilities.ts
│   │       ├── department.abilities.ts
│   │       └── user.abilities.ts
│   ├── infrastructure/
│   │   ├── repositories/
│   │   │   ├── tenant.repository.impl.ts
│   │   │   ├── organization.repository.impl.ts
│   │   │   ├── department.repository.impl.ts
│   │   │   └── user.repository.impl.ts
│   │   ├── persistence/
│   │   │   ├── tenant.entity.ts
│   │   │   ├── organization.entity.ts
│   │   │   ├── department.entity.ts
│   │   │   └── user.entity.ts
│   │   ├── events/
│   │   │   ├── event-publisher.ts
│   │   │   └── event-store.ts
│   │   └── casl/
│   │       ├── casl-ability.factory.ts
│   │       ├── casl-ability.repository.ts
│   │       └── casl-ability.service.ts
│   └── interface/
│       ├── controllers/
│       │   ├── tenant.controller.ts
│       │   ├── organization.controller.ts
│       │   ├── department.controller.ts
│       │   └── permission.controller.ts
│       ├── dto/
│       │   ├── create-tenant.dto.ts
│       │   ├── update-tenant.dto.ts
│       │   ├── tenant-response.dto.ts
│       │   └── permission.dto.ts
│       └── guards/
│           ├── tenant-isolation.guard.ts
│           ├── permission.guard.ts
│           └── casl-ability.guard.ts
├── tests/
│   ├── unit/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── casl/
│   ├── integration/
│   │   ├── tenant-management.integration.spec.ts
│   │   ├── organization-management.integration.spec.ts
│   │   └── permission-system.integration.spec.ts
│   └── e2e/
│       ├── tenant-lifecycle.e2e.spec.ts
│       ├── multi-tenant-security.e2e.spec.ts
│       └── casl-permission.e2e.spec.ts
├── package.json
├── tsconfig.json
└── README.md
```

**Structure Decision**: Monorepo library module structure following Clean Architecture with four distinct layers (Domain, Application, Infrastructure, Interface) and integrated CASL permission system. The structure supports the 5-tier data isolation strategy, follows DDD principles with rich domain models, aggregates, and value objects, and includes comprehensive CASL integration for sophisticated permission management across all 8 subdomains. Each layer has clear responsibilities and dependencies flow inward only.

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
