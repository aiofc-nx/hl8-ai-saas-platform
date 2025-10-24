# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.9.2, Node.js >= 20, NestJS 11.x  
**Primary Dependencies**: NestJS (existing), @hl8/domain-kernel (existing), @hl8/application-kernel (existing), @hl8/infrastructure-kernel (existing), @hl8/interface-kernel (existing), @hl8/nestjs-fastify (existing), @hl8/caching (existing), @hl8/database (existing), @hl8/messaging (existing), @hl8/config (existing), @hl8/exceptions (existing), @hl8/nestjs-isolation (existing), @casl/ability, @casl/prisma, @casl/mongoose  
**Storage**: PostgreSQL with MikroORM (@hl8/database), Redis for caching (@hl8/caching), Event Store for event sourcing (@hl8/messaging)  
**Testing**: Jest with ts-jest, unit tests (.spec.ts), integration tests, e2e tests  
**Target Platform**: Linux server environment, Docker containerized  
**Project Type**: Monorepo library module (libs/saas-core) with CASL permission system integration, extending existing NestJS infrastructure libraries  
**Performance Goals**: Support 10,000+ concurrent tenants, <100ms tenant operations, 99.9% uptime, <50ms permission checks  
**Constraints**: Must follow Clean Architecture + DDD + CQRS + ES + EDA patterns, 5-tier data isolation, Chinese documentation, CASL integration for all 8 subdomains, prioritize existing NestJS infrastructure libraries  
**Scale/Scope**: Multi-tenant SAAS platform supporting 5 tenant types, 7-level department hierarchy, complex permission systems with CASL-based authorization

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Architecture Compliance

- [ ] **Clean Architecture**: Feature design follows four-layer architecture (Domain, Application, Infrastructure, Interface)
- [ ] **DDD Compliance**: Rich domain models with business logic, no anemic domain models
- [ ] **CQRS Pattern**: Commands and queries are properly separated
- [ ] **Event Sourcing**: State changes are recorded as events where applicable
- [ ] **Event-Driven Architecture**: Components communicate through events for loose coupling

### Monorepo Organization

- [ ] **Project Structure**: Feature follows apps/libs/packages/examples structure
- [ ] **Domain Module Independence**: Domain modules are developed as independent projects
- [ ] **Service Naming**: Service modules in services directory drop "-service" suffix
- [ ] **Package Management**: Uses pnpm as package manager

### Quality Assurance

- [ ] **ESLint Configuration**: Extends root eslint.config.mjs
- [ ] **TypeScript Configuration**: Extends monorepo root tsconfig.json
- [ ] **Documentation**: Detailed design files use "XS" prefix

### Testing Architecture

- [ ] **Unit Tests**: Located in same directory as source files with .spec.ts naming
- [ ] **Integration Tests**: Located in **tests**/integration/ directory
- [ ] **E2E Tests**: Located in **tests**/e2e/ directory
- [ ] **Test Coverage**: Core business logic ≥ 80%, critical paths ≥ 90%

### Data Isolation

- [ ] **Multi-level Isolation**: Supports platform/tenant/organization/department/user level isolation
- [ ] **Data Classification**: Distinguishes between shared and non-shared data
- [ ] **Access Rules**: All data access includes complete isolation context

### Unified Language

- [ ] **Terminology**: Uses consistent domain terminology (Platform, Tenant, Organization, Department, User)
- [ ] **Entity Mapping**: Technical implementation maps to business terminology

### TypeScript Standards

- [ ] **NodeNext Module System**: Uses NodeNext module system for all server-side projects
- [ ] **any Type Usage**: any type usage is justified and follows safety rules
- [ ] **ESM Migration**: Migrated from CommonJS to NodeNext where applicable

### Error Handling

- [ ] **Exception-First**: Uses exceptions for business logic, logs for monitoring
- [ ] **Error Hierarchy**: Proper error handling at data/business/controller layers
- [ ] **Anti-patterns Avoided**: No log-only error handling, no exception-only without logging

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

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

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
│   │   │   ├── casl-rule.vo.ts
│   │   │   ├── casl-condition.vo.ts
│   │   │   └── role-level.vo.ts
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
│   ├── interface/
│   │   ├── controllers/
│   │   │   ├── tenant.controller.ts
│   │   │   ├── organization.controller.ts
│   │   │   ├── department.controller.ts
│   │   │   └── permission.controller.ts
│   │   ├── dto/
│   │   │   ├── create-tenant.dto.ts
│   │   │   ├── update-tenant.dto.ts
│   │   │   ├── tenant-response.dto.ts
│   │   │   └── permission.dto.ts
│   │   └── guards/
│   │       ├── tenant-isolation.guard.ts
│   │       ├── permission.guard.ts
│   │       └── casl-ability.guard.ts
│   └── saas-core.module.ts
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

**Structure Decision**: Monorepo library module structure following Clean Architecture with four distinct layers (Domain, Application, Infrastructure, Interface) and integrated CASL permission system. The structure extends existing NestJS infrastructure libraries (@hl8/domain-kernel, @hl8/application-kernel, @hl8/infrastructure-kernel, @hl8/interface-kernel, @hl8/nestjs-fastify, @hl8/caching, @hl8/database, @hl8/messaging, @hl8/config, @hl8/exceptions, @hl8/nestjs-isolation) and supports the 5-tier data isolation strategy, follows DDD principles with rich domain models, aggregates, and value objects, and includes comprehensive CASL integration for sophisticated permission management across all 8 subdomains. Each layer has clear responsibilities and dependencies flow inward only. The module follows NestJS module structure with saas-core.module.ts as the main module entry point.

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
