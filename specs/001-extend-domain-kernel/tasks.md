# Tasks: Domain Kernel（领域内核）

## Phase 1 – Setup

- [ ] T001 Create library skeleton libs/domain-kernel per plan.md
- [ ] T002 Configure package.json, exports, types, build scripts in libs/domain-kernel/package.json
- [ ] T003 Configure tsconfig.json/tsconfig.build.json extending monorepo root in libs/domain-kernel
- [ ] T004 Configure eslint.config.mjs extending root in libs/domain-kernel
- [ ] T005 Initialize jest.config.ts and coverage thresholds in libs/domain-kernel

## Phase 2 – Foundational

- [ ] T006 Migrate isolation model into libs/domain-kernel/isolation with ESM paths fixed
- [ ] T007 Extract common value objects under libs/domain-kernel/value-objects (EntityId & Id subclasses)
- [ ] T008 Provide DomainError base and specific error codes in libs/domain-kernel/errors
- [ ] T009 Define SharingLevel/IsolationLevel enums under libs/domain-kernel/enums
- [ ] T010 Create index.ts exporting public APIs in libs/domain-kernel/src/index.ts

## Phase 3 – US1（统一实体标识）

- [ ] T011 [US1] Provide EntityId<T> base with uuid v4 validation in libs/domain-kernel/src/value-objects/entity-id.ts
- [ ] T012 [P] [US1] Implement TenantId/OrganizationId/DepartmentId/UserId/GenericEntityId under libs/domain-kernel/src/value-objects/
- [ ] T013 [US1] Add TSDoc in Chinese for EntityId & Id subclasses (files above)
- [ ] T014 [US1] Add unit tests for Id creation/equality/serialization next to files

## Phase 4 – US2（统一开发范式）

- [ ] T015 [US2] Add AggregateRoot base (versioning, apply/pullEvents) libs/domain-kernel/src/aggregates/aggregate-root.ts
- [ ] T016 [US2] Define DomainEvent contract (id, occurredAt, aggregateId, version, isolationContext) libs/domain-kernel/src/events/domain-event.ts
- [ ] T017 [US2] Define CQRS contracts: Command/CommandHandler/Query/QueryHandler libs/domain-kernel/src/cqrs/
- [ ] T018 [US2] Define Repository contracts: EventRepository/SnapshotRepository/ReadModelRepository libs/domain-kernel/src/repositories/
- [ ] T019 [US2] Provide example minimal use case wiring in docs/quickstart snippet specs/001-extend-domain-kernel/quickstart.md
- [ ] T020 [US2] Add unit tests for AggregateRoot event application and handler contracts next to files

## Phase 5 – US3（多层级隔离）

- [ ] T021 [US3] Port IsolationContext and integrate with enums libs/domain-kernel/src/isolation/isolation-context.ts
- [ ] T022 [P] [US3] Ensure buildCacheKey/buildLogContext/buildWhereClause behaviors unchanged in same file
- [ ] T023 [US3] Add unit tests for non-shared vs shared access across levels next to files
- [ ] T024 [US3] Add DataAccessDeniedEvent contract and tests libs/domain-kernel/src/events/data-access-denied.event.ts

## Phase 6 – Polish & Cross-Cutting

- [ ] T025 Ensure Chinese TSDoc across all public APIs per constitution (various files)
- [ ] T026 Validate ESLint rules and fix all warnings in libs/domain-kernel
- [ ] T027 Ensure Jest config runs near-file unit tests and coverage ≥ 90% in libs/domain-kernel
- [ ] T028 Update root README and examples to reference domain-kernel README.md
- [ ] T029 Prepare migration notes from libs/isolation-model to libs/domain-kernel in specs/001-extend-domain-kernel/docs/migration.md

## Dependencies

- US1 → US2 → US3（US1/US2 可并行部分在 [P] 标记）

## Parallel Opportunities

- T012 与 T013 可并行（不同文件）
- T022 与 T023 可并行（实现与测试分离）

## Implementation Strategy (MVP)

- 首先交付 US1（统一 Id 与校验），使下游模块可立即复用；随后落地 US2 契约；最后整合 US3 隔离上下文。
