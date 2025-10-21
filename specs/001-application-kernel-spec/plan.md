# Implementation Plan: Application Kernel Development Standards

**Branch**: `001-application-kernel-spec` | **Date**: 2024-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-application-kernel-spec/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Develop a comprehensive application kernel library that provides unified CQRS patterns, context management, and application layer infrastructure for business modules. The kernel will offer generic base classes, interfaces, and utilities that enable consistent application layer development across all business modules while maintaining framework-agnostic design and supporting multi-tenant isolation.

## Technical Context

**Language/Version**: TypeScript 5.9.2 with NodeNext module system  
**Primary Dependencies**: @hl8/domain-kernel (workspace dependency), no external framework dependencies  
**Storage**: N/A (application kernel is infrastructure layer, no direct storage)  
**Testing**: Jest with ts-jest, coverage requirements: core logic ≥ 80%, critical paths ≥ 90%  
**Target Platform**: Node.js >= 20, framework-agnostic design  
**Project Type**: Library (libs/application-kernel)  
**Performance Goals**: Zero runtime overhead for base classes, <1ms initialization time  
**Constraints**: Framework-agnostic, no business domain dependencies, must support multi-tenant isolation  
**Scale/Scope**: Support unlimited business modules, maintain consistent patterns across platform

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Architecture Compliance

- [x] **Clean Architecture**: Application kernel provides application layer infrastructure following Clean Architecture principles
- [x] **DDD Compliance**: Kernel supports rich domain models through proper interfaces and base classes
- [x] **CQRS Pattern**: Provides BaseCommand, BaseQuery, CommandHandler, QueryHandler for CQRS implementation
- [x] **Event Sourcing**: Provides DomainEvent interface and IEventBus for event sourcing support
- [x] **Event-Driven Architecture**: Components communicate through events via IEventBus interface

### Monorepo Organization

- [x] **Project Structure**: Located in libs/application-kernel following monorepo structure
- [x] **Domain Module Independence**: Kernel is independent library that business modules can depend on
- [x] **Service Naming**: No service modules in this kernel (provides base classes and interfaces)
- [x] **Package Management**: Uses pnpm as package manager with workspace dependencies

### Quality Assurance

- [x] **ESLint Configuration**: Extends root eslint.config.mjs
- [x] **TypeScript Configuration**: Extends monorepo root tsconfig.json
- [x] **Documentation**: All public APIs have comprehensive TSDoc comments in Chinese

### Testing Architecture

- [x] **Unit Tests**: Located in same directory as source files with .spec.ts naming
- [x] **Integration Tests**: Located in **tests**/integration/ directory
- [x] **E2E Tests**: Located in **tests**/e2e/ directory
- [x] **Test Coverage**: Core business logic ≥ 80%, critical paths ≥ 90%

### Data Isolation

- [x] **Multi-level Isolation**: Provides IsolationContext and IUseCaseContext for multi-tenant isolation
- [x] **Data Classification**: Context management supports shared/non-shared data classification
- [x] **Access Rules**: All interfaces include tenant/user context parameters

### Unified Language

- [x] **Terminology**: Uses consistent domain terminology in interfaces and documentation
- [x] **Entity Mapping**: Technical implementation maps to business terminology through proper naming

### TypeScript Standards

- [x] **NodeNext Module System**: Uses NodeNext module system with .js extensions
- [x] **any Type Usage**: Avoids any type usage, uses proper generic constraints
- [x] **ESM Migration**: Uses ESM modules throughout

### Error Handling

- [x] **Exception-First**: Uses exceptions for business logic validation
- [x] **Error Hierarchy**: Proper error handling in base classes and interfaces
- [x] **Anti-patterns Avoided**: No log-only error handling, proper exception propagation

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
libs/application-kernel/
├── src/
│   ├── cqrs/
│   │   ├── commands/
│   │   │   ├── base-command.ts
│   │   │   └── command-handler.interface.ts
│   │   └── queries/
│   │       ├── base-query.ts
│   │       └── query-handler.interface.ts
│   ├── use-cases/
│   │   ├── base-use-case.ts
│   │   └── base-command-use-case.ts
│   ├── context/
│   │   ├── isolation-context.interface.ts
│   │   └── use-case-context.interface.ts
│   ├── events/
│   │   ├── domain-event.interface.ts
│   │   └── event-bus.interface.ts
│   ├── transactions/
│   │   └── transaction-manager.interface.ts
│   └── index.ts
├── tests/
│   ├── integration/
│   └── unit/
├── package.json
├── tsconfig.json
├── eslint.config.mjs
└── jest.config.ts
```

**Structure Decision**: Library structure with clear separation of concerns. The application kernel is organized into logical modules (CQRS, use-cases, context, events, transactions) with comprehensive testing support. Each module provides interfaces and base classes that business modules can extend.

## Complexity Tracking

Fill ONLY if Constitution Check has violations that must be justified

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
