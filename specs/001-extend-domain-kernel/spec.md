# Feature Specification: Domain Kernel（领域内核）

**Feature Branch**: `001-extend-domain-kernel`  
**Created**: 2025-10-20  
**Status**: Draft  
**Input**: 以现在的`libs/isolation-model`模块为基础，扩展为`domain-kernel`（重命名模块）扩展以下能力：

1. 统一领域实体的 Id 类型和取值；2) 统一业务模块领域层的开发范式，提供通用的基础功能组件；3) 满足 CQRS、ES、EDA 的要求；4) 满足多层级的数据隔离；5) 为具体的业务模块开发奠定基础。

## User Scenarios & Testing _(mandatory)_

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - 作为平台架构师，我希望统一实体标识 (Priority: P1)

通过统一的 Id 值对象与约束（UUID v4、只读、等价性、一致序列化），降低跨领域模块集成成本。

**Why this priority**: 统一标识是所有领域对象与事件的基石，影响数据一致性与跨模块互操作。

**Independent Test**: 在新建的领域模块中，仅引入内核 Id 值对象创建实体，即可验证创建/比较/序列化的正确性。

**Acceptance Scenarios**:

1. **Given** 领域服务需要创建订单实体，**When** 使用内核提供的`EntityId`子类创建 Id，**Then** Id 校验/等价性/序列化符合规范。
2. **Given** 两个模块分别创建同值 Id，**When** 比较等价性，**Then** 返回相等且可作为 Map 键一致工作。

---

### User Story 2 - 作为领域团队，我希望有统一的开发范式 (Priority: P1)

通过统一的聚合根、仓储接口、领域事件、用例契约、读写分离规范，使不同业务模块可快速落地并保持一致性。

**Why this priority**: 没有范式将导致风格分裂、维护成本上升。

**Independent Test**: 新建示例模块时，仅依赖内核提供的接口和基类，即可完成一个读写分离的用例与事件发布闭环。

**Acceptance Scenarios**:

1. **Given** 新建聚合根，**When** 实现统一仓储接口，**Then** 可通过内核用例契约进行命令处理与事件发布。
2. **Given** 查询用例，**When** 通过查询模型接口访问，**Then** 不依赖命令侧存储即可返回快照。

---

### User Story 3 - 作为平台安全负责人，我需要多层级隔离可落地 (Priority: P1)

在读写用例、仓储查询、事件处理和日志/缓存键中，能够一致地套用隔离上下文与共享规则。

**Why this priority**: 隔离直接影响数据合规与租户安全。

**Independent Test**: 在沙箱模块内，通过`IsolationContext`与共享级别，验证非共享与共享数据访问判定，以及缓存键/日志上下文/查询条件生成。

**Acceptance Scenarios**:

1. **Given** 部门级用户上下文，**When** 访问组织级共享数据，**Then** 允许访问；**When** 访问其他部门非共享数据，**Then** 拒绝访问。
2. **Given** 平台级上下文，**When** 处理任意数据读取，**Then** 不受隔离限制且键/日志包含平台标记。

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- Id 生成冲突：当外部传入非 UUID v4 值时应抛出领域错误并带错误码。
- 事件去重：同一聚合版本重复应用事件应被拒绝或忽略。
- 隔离缺失：组织/部门级上下文缺少上级标识应抛出验证错误。
- 共享级别为空：共享数据但未指定共享级别时，应拒绝访问。
- 跨边界查询：查询模型不应泄露上级或跨租户数据。

## Requirements _(mandatory)_

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001 统一标识**: 必须提供标准 Id 值对象体系（UUID v4、等价性、序列化、哈希、比较、Flyweight 可选）。
- **FR-002 隔离上下文**: 必须提供多层级隔离（平台/租户/组织/部门/用户）与共享级别判定，并能生成缓存键、日志上下文、查询条件。
- **FR-003 范式与基类**: 必须提供聚合根/实体/值对象基类、领域事件接口、用例契约（命令/查询）、统一错误模型与错误码规范。
- **FR-004 CQRS**: 必须显式区分命令侧与查询侧契约，命令处理产出事件，查询从查询模型读取，不得直接依赖命令侧存储。
- **FR-005 事件溯源（ES）契约**: 必须定义聚合版本、事件流、快照（可选）契约与事件幂等/去重规则。
- **FR-006 事件驱动（EDA）契约**: 必须提供领域事件结构、上下文信息与最小可用的事件发布/订阅接口契约（不绑定实现）。
- **FR-007 可观测性**: 必须在内核层提供最小一致的领域日志上下文结构与审计事件（如访问拒绝）。
- **FR-008 可扩展性**: 必须允许业务模块自定义 Id 子类、扩展共享策略与自定义验证器接口。
- **FR-009 文档与注释**: 必须提供中文 TSDoc 规范化注释与示例，覆盖公共 API。

### Clarifications Resolved

- **FR-010 事件持久化边界（已定）**: 内核仅定义契约，不提供事件存储抽象实现（选择 Q1:A）。
- **FR-011 快照策略（已定）**: 由业务模块自决，内核仅提供契约与钩子（选择 Q2:A）。
- **FR-012 跨租户共享默认策略（已定）**: 默认允许平台→租户下发共享；`SharingLevel.PLATFORM` 视为对所有租户可见（选择 Q3:A），需具备审计与控制机制。

### Key Entities _(include if feature involves data)_

- **EntityId<>/子类**: 通用实体标识（值、比较、哈希、序列化）。
- **IsolationContext**: 隔离上下文（tenantId、organizationId、departmentId、userId、level、共享级别判定、键/日志/查询生成）。
- **DomainEvent**: 领域事件（事件 Id、发生时间、聚合信息、隔离上下文、版本）。
- **AggregateRoot**: 聚合根（标识、版本、变更事件收集）。
- **Command/Query 契约**: 命令与查询输入输出契约。
- **Repository 契约**: 事件流/快照读写接口、查询模型访问接口（抽象）。

## Success Criteria _(mandatory)_

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001 一致性**: 新建示例业务模块在1天内完成最小用例（命令+事件+查询）落地，且不需要新增通用基础代码。
- **SC-002 可复用性**: 至少3个不同领域模块共用同一套 Id/事件/用例契约，无需重复实现，代码重复率下降≥50%。
- **SC-003 安全性**: 100% 的读写路径均通过隔离上下文与共享级别判定，未经授权访问在审计中可见且可追踪。
- **SC-004 可测试性**: 统一契约下，样例模块可在独立测试中完成命令处理、事件产出与查询校验，覆盖率≥90%（逻辑层）。

## Assumptions

- 实体 Id 统一采用 UUID v4；如需其它编码由业务模块自定义子类实现。
- 内核不绑定具体框架或基础设施实现，仅提供契约与基类。
- 事件持久化与消息路由由基础设施层实现，内核仅定义接口与最小事件结构。

## Out of Scope

- 不提供具体数据库/消息中间件实现。
- 不提供跨服务编排或 Saga 具体实现，仅与事件契约兼容。

## 宪章一致性检查（Constitution Check）

- **中文优先原则**：本规范与未来内核注释/错误信息必须使用中文，并遵循 TSDoc（已满足）。
- **代码即文档原则**：公共 API、类、方法、接口、枚举需提供中文 TSDoc，含 @description/@param/@returns/@throws/@example（已在要求 FR-009 中明确）。
- **Clean Architecture**：仅定义领域层契约与基类；不绑定数据库/消息实现；与基础设施通过接口交互（FR-003/004/005/006 已体现）。
- **领域层纯净性**：禁止持久化细节进入领域层；允许框架装饰器但不依赖 ORM；事件存储不在内核实现（FR-010 已定为“仅定义契约”）。
- **DDD 充血模型**：实体/聚合根封装业务行为；提供值对象与领域事件（FR-003）。
- **CQRS**：命令/查询分离，命令产出事件，查询读取投影（FR-004）。
- **事件溯源（ES）**：聚合版本、事件流与快照契约、幂等/去重（FR-005，快照策略由业务决定）。
- **事件驱动架构（EDA）**：领域事件结构与最小发布/订阅契约（FR-006）。
- **多层级数据隔离**：平台/租户/组织/部门/用户隔离与共享级别规则一致（FR-002，默认平台→租户共享开启）。
- **Monorepo 原则**：作为独立 `libs/domain-kernel` 模块交付，便于未来微服务化。
- **测试架构原则**：就近单测、覆盖率门槛；读写契约和事件行为可独立测试（SC-004）。
