# Research: 领域层的仓储接口

**Feature**: 领域层的仓储接口  
**Phase**: 0 - Research  
**Date**: 2024-12-19

## Research Questions

### Q1: 仓储接口应该定义什么内容？

**Question**: 仓储接口在领域层应该定义哪些方法和行为？

**Findings**:

- 仓储接口应该定义核心的业务查询和持久化方法
- 应该使用领域术语，而不是数据库术语
- 应该返回领域实体和值对象，而不是数据库记录
- 应该支持聚合根的一致性边界

**Decision**: 仓储接口定义包括：

- 基础CRUD操作（findById, save, delete）
- 业务查询方法（如 findByCode, existsByName）
- 聚合特定的查询方法
- 返回类型使用领域实体和聚合

**Rationale**: 遵循DDD原则，仓储接口关注业务语义而非技术实现

**Alternatives Considered**:

- 使用通用仓储接口：被拒绝，因为会失去业务语义
- 包含所有查询方法：被拒绝，因为会过度设计

---

### Q2: 仓储接口如何与现有的infrastructure-kernel集成？

**Question**: 如何利用现有的@hl8/infrastructure-kernel中的基础仓储类？

**Findings**:

- infrastructure-kernel提供了BaseRepositoryAdapter作为实现基类
- 应该保持领域层的仓储接口独立于基础设施细节
- 实现层可以使用基础设施的适配器模式

**Decision**:

- 领域层定义纯粹的TypeScript接口
- 基础设施层实现接口并继承BaseRepositoryAdapter
- 使用适配器模式桥接领域接口和基础设施实现

**Rationale**: 保持领域层纯净，不依赖基础设施细节

**Alternatives Considered**:

- 在领域层使用基础类：被拒绝，因为违反了依赖倒置原则
- 完全自定义实现：被拒绝，因为会重复基础设施的功能

---

### Q3: 仓储接口如何处理多租户数据隔离？

**Question**: 仓储接口是否需要包含多租户隔离参数？

**Findings**:

- 多租户隔离是基础设施层的职责，不应该暴露在领域接口中
- 领域层应该使用IsolationContext值对象表示隔离上下文
- 仓储实现负责将隔离上下文转换为数据访问过滤条件

**Decision**:

- 仓储接口方法接受IsolationContext参数（可选）
- 仓储接口不关心隔离的实现细节
- 实现层负责应用隔离策略（ROW_LEVEL_SECURITY等）

**Rationale**: 保持领域层与基础设施层解耦，符合Clean Architecture原则

**Alternatives Considered**:

- 不在接口中包含隔离参数：被拒绝，因为无法支持多租户隔离
- 在接口中包含具体隔离策略：被拒绝，因为会导致领域层依赖基础设施

---

### Q4: 仓储接口是否应该支持CQRS和Event Sourcing？

**Question**: 仓储接口如何支持CQRS的读写分离和Event Sourcing？

**Findings**:

- CQRS的读写分离在仓储层面体现为不同的查询方法
- Event Sourcing需要持久化领域事件
- 应该为聚合根提供事件存储接口
- 读模型可以有独立的查询接口

**Decision**:

- 标准仓储接口（IRepository）用于写操作
- 读模型接口（IReadModelRepository）用于查询操作
- 事件存储接口（IEventStore）用于Event Sourcing
- 快照接口（ISnapshotRepository）用于性能优化

**Rationale**: 支持CQRS和Event Sourcing架构模式，同时保持接口清晰

**Alternatives Considered**:

- 单一仓储接口：被拒绝，因为无法清晰表达CQRS的读写分离
- 完全分离的接口：被拒绝，因为会导致过多的接口定义

---

### Q5: 仓储接口的命名约定是什么？

**Question**: 应该使用什么命名约定来区分接口和实现？

**Findings**:

- 领域层接口通常使用I+EntityName+Repository模式
- 实现类通常使用EntityName+Repository+Adapter/Impl后缀
- TypeScript支持接口和类的不同约定

**Decision**:

- 领域层接口：`ITenantRepository`, `IOrganizationRepository`
- 基础设施实现：`TenantRepositoryAdapter`, `TenantRepositoryImpl`
- 索引文件导出：使用接口名称，隐藏实现细节

**Rationale**: 清晰的命名约定有助于区分接口和实现，遵循常见约定

**Alternatives Considered**:

- 接口不加I前缀：被拒绝，因为在TypeScript中不够明确
- 使用不同的后缀：被拒绝，因为会与现有代码不一致

---

## Technology Decisions

### Repository Interface Definition

**Decision**: 使用TypeScript interface定义仓储接口

**Rationale**:

- TypeScript interface提供类型安全和契约定义
- 不引入运行时开销
- 支持接口合并和扩展

**Alternatives Considered**:

- 使用抽象类：被拒绝，因为会增加运行时开销
- 使用类型别名：被拒绝，因为表达能力有限

---

### Integration with Infrastructure

**Decision**: 使用适配器模式连接领域接口和基础设施实现

**Rationale**:

- 保持领域层纯净，不依赖基础设施
- 基础设施可以实现多个领域接口
- 便于测试和替换实现

**Alternatives Considered**:

- 直接继承：被拒绝，因为违反了依赖倒置原则
- 使用装饰器模式：被拒绝，因为会增加复杂性

---

## Patterns and Best Practices

### Repository Pattern

**Description**: 仓储模式用于封装聚合的持久化逻辑

**Benefits**:

- 将数据访问逻辑从业务逻辑中分离
- 支持依赖倒置原则
- 便于测试和替换实现

**Usage**: 为每个聚合根定义仓储接口

---

### Adapter Pattern

**Description**: 适配器模式用于连接领域接口和基础设施实现

**Benefits**:

- 保持领域层独立
- 支持多种实现方式
- 符合开闭原则

**Usage**: 在基础设施层实现领域接口，使用BaseRepositoryAdapter作为基类

---

### Dependency Inversion Principle (DIP)

**Description**: 高层模块不应依赖低层模块，都应依赖抽象

**Benefits**:

- 提高系统的灵活性和可测试性
- 支持依赖注入
- 便于替换实现

**Usage**: 领域层定义接口，基础设施层实现接口

---

## References

- Clean Architecture - Robert C. Martin
- Domain-Driven Design - Eric Evans
- Implementing Domain-Driven Design - Vaughn Vernon
- .specify/memory/constitution.md
- .cursor/docs/architecture/ddd-layered-architecture.md

---

## Open Questions

无 - 所有问题已解决

---

## Next Steps

1. 创建仓储接口定义文件（Phase 1）
2. 更新领域层导出文件
3. 更新基础设施层的实现
4. 编写单元测试
