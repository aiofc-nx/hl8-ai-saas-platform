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

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [single/web/mobile - determines source structure]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

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
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
