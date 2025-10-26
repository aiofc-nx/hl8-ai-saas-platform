# Implementation Plan: Align libs/saas-core with Architecture Documentation

**Branch**: `005-spec-documentation` | **Date**: 2025-01-27 | **Spec**: specs/005-spec-documentation/spec.md
**Input**: Feature specification from `specs/005-spec-documentation/spec.md`

**Note**: This plan focuses on aligning libs/saas-core with architecture documentation in docs/architecture/

## Summary

This plan aims to align the `libs/saas-core` module with the architecture design documentation. Based on the current alignment status report, the module is 90% aligned with the architecture requirements. The main remaining tasks are:

1. Complete IEventBus integration in use cases
2. Add ITransactionManager support where needed
3. Ensure all domain events are properly published
4. Verify database support (PostgreSQL by default, MongoDB optional)
5. Ensure row-level isolation strategy is properly implemented

## Technical Context

**Language/Version**: TypeScript 5.x with NodeNext module system  
**Primary Dependencies**: NestJS 10.x, Fastify, MikroORM  
**Storage**: PostgreSQL (default) + MongoDB (optional), Redis for caching  
**Testing**: Jest with 80%+ coverage for core business logic, 90%+ for critical paths  
**Target Platform**: Node.js 20+ on Linux server  
**Project Type**: Monorepo business module (lib)  
**Performance Goals**: <200ms p95 API response time  
**Constraints**: Must support 5-tier data isolation (Platform/Tenant/Organization/Department/User)  
**Scale/Scope**: Support for 10k+ tenants with multi-tenant data isolation

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
- [ ] **Test Coverage**: Core business logic ≥ 80%, critical paths ≥ 90% (IN PROGRESS)

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

```
specs/005-spec-documentation/
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
│   ├── domain/          # Domain Layer
│   │   ├── entities/    # Domain entities
│   │   ├── aggregates/  # Aggregate roots
│   │   ├── value-objects/  # Value objects
│   │   ├── services/    # Domain services
│   │   ├── events/      # Domain events
│   │   ├── repositories/  # Repository interfaces
│   │   └── factories/   # Factories
│   ├── application/     # Application Layer
│   │   ├── commands/    # Commands
│   │   ├── queries/     # Queries
│   │   ├── handlers/    # Command/Query handlers
│   │   └── use-cases/   # Use cases
│   ├── infrastructure/  # Infrastructure Layer
│   │   ├── repositories/  # Repository implementations
│   │   ├── entities/    # Database entities (MikroORM)
│   │   ├── mappers/     # Entity mappers
│   │   ├── database/    # Database configuration
│   │   ├── casl/        # CASL permissions
│   │   ├── services/    # Infrastructure services
│   │   └── cache/       # Cache implementation
│   └── interface/       # Interface Layer
│       ├── controllers/ # REST controllers
│       ├── dto/         # Data Transfer Objects
│       └── guards/      # Guards
├── tests/
│   ├── integration/     # Integration tests
│   └── e2e/             # E2E tests
├── package.json
├── tsconfig.json
├── eslint.config.mjs
└── jest.config.ts
```

**Structure Decision**: This is a standard monorepo library structure following Clean Architecture with clear separation of concerns across four layers. The domain layer remains pure and independent of infrastructure concerns. The application layer coordinates business workflows. The infrastructure layer handles all external integrations. The interface layer exposes REST APIs.

## Complexity Tracking

_No violations detected - the current structure follows all architecture principles._
