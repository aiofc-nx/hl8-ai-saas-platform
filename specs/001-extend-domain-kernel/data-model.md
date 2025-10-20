# Data Model: Domain Kernel（领域内核）

## Entities & Value Objects

### EntityId<T>

- Fields: value (UUID v4, readonly)
- Rules: 非空、UUID v4 格式、等价性（equals）、序列化（toString/getValue）、哈希（getHashCode）
- Notes: 可扩展具体类型（TenantId/OrganizationId/DepartmentId/UserId/GenericEntityId）

### IsolationContext

- Fields: tenantId?, organizationId?, departmentId?, userId?
- Derived: isolationLevel（Platform/Tenant/Organization/Department/User）
- Methods: buildCacheKey(), buildLogContext(), buildWhereClause(), canAccess()
- Rules:
  - 组织级必须有租户；部门级必须有租户与组织
  - 非共享：需完全匹配；共享：按 SharingLevel 判定

### DomainEvent

- Fields: eventId (EntityId), occurredAt (Date), aggregateId (EntityId), version (number), isolationContext (IsolationContext)
- Rules: 不可变；用于审计与重放

### AggregateRoot

- Fields: id (EntityId), version (number), pendingEvents (DomainEvent[])
- Methods: apply(event), pullEvents(), incrementVersion()
- Rules: 仅通过事件改变状态；保证幂等与版本一致性

## Contracts

### CQRS

- Command: 输入契约（DTO）
- CommandHandler: 产出 DomainEvent[]
- Query: 输入契约（DTO）
- QueryHandler: 从查询模型读取快照（不依赖命令侧存储）

### Repositories

- EventRepository (契约): 读写事件流、按聚合与版本查询
- SnapshotRepository (契约，可选): 读写聚合快照
- ReadModelRepository (契约): 查询模型访问接口

### SharingLevel

- PLATFORM / TENANT / ORGANIZATION / DEPARTMENT / USER
- 平台共享默认对所有租户可见（需审计控管）
