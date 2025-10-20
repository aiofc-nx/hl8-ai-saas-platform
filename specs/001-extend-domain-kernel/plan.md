# Implementation Plan: Domain Kernel（领域内核）

**Branch**: `001-extend-domain-kernel` | **Date**: 2025-10-20 | **Spec**: /home/arligle/hl8/hl8-ai-saas-platform/specs/001-extend-domain-kernel/spec.md
**Input**: Feature specification from `/specs/001-extend-domain-kernel/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

基于现有 `libs/isolation-model` 扩展为 `domain-kernel`：

- 统一实体 Id 值对象体系与取值规则；
- 提供统一领域范式基类（聚合根/实体/值对象）、仓储/用例/事件契约；
- 满足 CQRS、ES、EDA 契约要求（不绑定实现）；
- 落地多层级隔离与共享规则；
- 作为各业务模块的领域基础库。

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.9.x  
**Primary Dependencies**: 无（内核零依赖）；仅 Node 运行时 `crypto.randomUUID()`  ㅤ
**Storage**: N/A（仅定义契约，不实现事件存储/查询存储）  
**Testing**: Jest（就近单测，逻辑覆盖率≥90% 目标）  
**Target Platform**: Node.js ≥ 20（ESM/NodeNext）  
**Project Type**: Monorepo 下独立库（libs/domain-kernel）  
**Performance Goals**: 值对象/上下文计算为 O(1)；事件与用例契约零额外开销；无运行时依赖  
**Constraints**: 领域层纯净（不绑定 ORM/消息中间件）；中文 TSDoc 全覆盖  
**Scale/Scope**: 作为平台级内核，至少支撑 3+ 领域模块复用

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Architecture Compliance

- [x] **Clean Architecture**: 仅领域层契约与基类；不依赖基础设施实现
- [x] **DDD Compliance**: 充血模型基类与值对象；禁止贫血模型
- [x] **CQRS Pattern**: 命令/查询契约分离
- [x] **Event Sourcing**: 聚合版本/事件流/快照契约
- [x] **Event-Driven Architecture**: 领域事件契约与发布/订阅接口

### Monorepo Organization

- [x] **Project Structure**: 采用 apps/libs/packages/examples
- [x] **Domain Module Independence**: 作为独立库发布
- [x] **Service Naming**: 遵循命名规范
- [x] **Package Management**: 使用 pnpm

### Quality Assurance

- [x] **ESLint Configuration**: 子项目扩展根配置
- [x] **TypeScript Configuration**: 扩展根 tsconfig
- [x] **Documentation**: 详细设计使用 "XS" 前缀（如适用）

### Testing Architecture

- [x] **Unit Tests**: 就近 .spec.ts
- [ ] **Integration Tests**: N/A（内核不含集成依赖）
- [ ] **E2E Tests**: N/A（内核不含端到端）
- [x] **Test Coverage**: 目标逻辑覆盖≥90%

### Data Isolation

- [x] **Multi-level Isolation**: 平台/租户/组织/部门/用户
- [x] **Data Classification**: 共享/非共享与级别
- [x] **Access Rules**: 访问带完整隔离上下文

### Unified Language

- [x] **Terminology**: 统一术语
- [x] **Entity Mapping**: 技术命名映射业务术语

### TypeScript Standards

- [x] **NodeNext Module System**: 采用 NodeNext/ESM
- [x] **any Type Usage**: 遵循限制
- [x] **ESM Migration**: 已对齐

### Error Handling

- [x] **Exception-First**: 业务异常优先
- [x] **Error Hierarchy**: 内核仅定义异常模型
- [x] **Anti-patterns Avoided**: 避免反模式

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
libs/domain-kernel/
├── src/
│   ├── aggregates/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   ├── cqrs/
│   │   ├── commands/
│   │   └── queries/
│   ├── repositories/
│   ├── isolation/
│   └── index.ts
├── __tests__/ (可选，单测就近放置)
├── docs/
└── package.json
```

**Structure Decision**: 以独立库 `libs/domain-kernel` 提供领域内核，按上树组织；现有 `libs/isolation-model` 迁移整合至 `isolation/` 与 `value-objects/`。

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
