# Implementation Plan: SAAS Core Module Redevelopment

**Branch**: `007-saas-core-redevelopment` | **Date**: 2024-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-saas-core-redevelopment/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

重新开发SAAS Core模块，采用Clean Architecture + DDD + CQRS + ES + EDA混合架构模式，基于@hl8内核组件进行开发，实现多租户数据隔离、完整的领域模型、事件驱动架构和CQRS模式。保留现有目录结构和子领域划分，遵循全局配置标准化要求。

## Technical Context

**Language/Version**: TypeScript 5.9.2, Node.js >= 20  
**Primary Dependencies**: @hl8/domain-kernel, @hl8/application-kernel, @hl8/infrastructure-kernel, @hl8/interface-kernel, @hl8/exceptions, @hl8/caching, @hl8/config, @hl8/nestjs-fastify, NestJS, PostgreSQL, MongoDB  
**Storage**: PostgreSQL (default), MongoDB (optional), Redis (caching)  
**Testing**: Jest, 90% code coverage for unit tests, 100% coverage for critical business logic  
**Target Platform**: Linux server, Node.js runtime  
**Project Type**: libs/saas-core (business library module)  
**Performance Goals**: 1000 concurrent users without degradation, <200ms p95 response time  
**Constraints**: 8 weeks development timeline, preserve existing directory structure, follow global configuration standardization  
**Scale/Scope**: Multi-tenant SAAS platform supporting 5 tenant types (FREE/BASIC/PROFESSIONAL/ENTERPRISE/CUSTOM), 5-layer isolation architecture

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Architecture Compliance

- [x] **Clean Architecture**: Feature design follows four-layer architecture (Domain, Application, Infrastructure, Interface)
- [x] **DDD Compliance**: Rich domain models with business logic, no anemic domain models
- [x] **CQRS Pattern**: Commands and queries are properly separated
- [x] **Event Sourcing**: State changes are recorded as events where applicable
- [x] **Event-Driven Architecture**: Components communicate through events for loose coupling

### Monorepo Organization

- [x] **Project Structure**: Feature follows apps/libs/packages/examples structure
- [x] **Domain Module Independence**: Domain modules are developed as independent projects
- [x] **Service Naming**: Service modules in services directory drop "-service" suffix
- [x] **Package Management**: Uses pnpm as package manager

### Quality Assurance

- [x] **ESLint Configuration**: Extends root eslint.config.mjs
- [x] **TypeScript Configuration**: Extends monorepo root tsconfig.json
- [x] **Documentation**: Detailed design files use "XS" prefix

### Testing Architecture

- [x] **Unit Tests**: Located in same directory as source files with .spec.ts naming
- [x] **Integration Tests**: Located in **tests**/integration/ directory
- [x] **E2E Tests**: Located in **tests**/e2e/ directory
- [x] **Test Coverage**: Core business logic ≥ 80%, critical paths ≥ 90%

### Data Isolation

- [x] **Multi-level Isolation**: Supports platform/tenant/organization/department/user level isolation
- [x] **Data Classification**: Distinguishes between shared and non-shared data
- [x] **Access Rules**: All data access includes complete isolation context

### Unified Language

- [x] **Terminology**: Uses consistent domain terminology (Platform, Tenant, Organization, Department, User)
- [x] **Entity Mapping**: Technical implementation maps to business terminology

### TypeScript Standards

- [x] **NodeNext Module System**: Uses NodeNext module system for all server-side projects
- [x] **any Type Usage**: any type usage is justified and follows safety rules
- [x] **ESM Migration**: Migrated from CommonJS to NodeNext where applicable

### Error Handling

- [x] **Exception-First**: Uses exceptions for business logic, logs for monitoring
- [x] **Error Hierarchy**: Proper error handling at data/business/controller layers
- [x] **Anti-patterns Avoided**: No log-only error handling, no exception-only without logging

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
libs/saas-core/
├── src/
│   ├── domain/
│   │   ├── aggregates/
│   │   │   ├── department.aggregate.ts
│   │   │   ├── organization.aggregate.ts
│   │   │   └── tenant.aggregate.ts
│   │   ├── entities/
│   │   │   ├── casl-ability.entity.ts
│   │   │   ├── department.entity.ts
│   │   │   ├── organization.entity.ts
│   │   │   ├── platform.entity.ts
│   │   │   ├── role.entity.ts
│   │   │   ├── tenant.entity.ts
│   │   │   └── user.entity.ts
│   │   └── value-objects/
│   │       ├── base-value-object.ts
│   │       ├── casl-ability-id.vo.ts
│   │       ├── casl-condition.vo.ts
│   │       ├── casl-rule.vo.ts
│   │       ├── department-level-config.vo.ts
│   │       ├── permission-template.vo.ts
│   │       ├── platform-id.vo.ts
│   │       ├── platform-user.vo.ts
│   │       ├── resource-limits.vo.ts
│   │       ├── resource-usage.vo.ts
│   │       ├── role-level.vo.ts
│   │       ├── tenant-code.vo.ts
│   │       ├── tenant-name-review-request.vo.ts
│   │       ├── tenant-name-review-status.vo.ts
│   │       ├── tenant-name.vo.ts
│   │       ├── tenant-status.vo.ts
│   │       ├── tenant-type.vo.ts
│   │       ├── tenant-user.vo.ts
│   │       ├── trial-period-config.vo.ts
│   │       ├── user-department-assignment.vo.ts
│   │       └── user-organization-assignment.vo.ts
│   ├── application/
│   │   ├── commands/
│   │   │   ├── assign-permission.command.ts
│   │   │   ├── create-tenant.command.ts
│   │   │   ├── create-tenant.command.spec.ts
│   │   │   ├── delete-tenant.command.ts
│   │   │   └── update-tenant.command.ts
│   │   ├── queries/
│   │   │   ├── check-permission.query.ts
│   │   │   ├── get-tenant.query.ts
│   │   │   └── list-tenants.query.ts
│   │   └── use-cases/
│   │       ├── permission-management.use-case.ts
│   │       └── tenant-creation.use-case.ts
│   ├── infrastructure/
│   │   ├── repositories/
│   │   │   ├── mongodb/
│   │   │   ├── postgresql/
│   │   │   │   ├── department.repository.ts
│   │   │   │   ├── organization.repository.ts
│   │   │   │   ├── role.repository.ts
│   │   │   │   ├── tenant.repository.ts
│   │   │   │   └── user.repository.ts
│   │   │   ├── tenant.repository.adapter.ts
│   │   │   └── tenant.repository.impl.ts
│   │   ├── casl/
│   │   │   └── casl.config.ts
│   │   └── cache/
│   │       ├── cache.module.ts
│   │       ├── cache.service.adapter.ts
│   │       └── redis.config.ts
│   └── interface/
│       └── controllers/
│           └── tenant.controller.ts
├── package.json
├── tsconfig.json
└── eslint.config.mjs

tests/
├── integration/
└── e2e/
```

## Structure Decision

保留现有的libs/saas-core目录结构，遵循Clean Architecture四层架构（Domain, Application, Infrastructure, Interface），维持现有的子领域划分和文件组织方式。所有配置遵循全局配置标准化要求。

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
