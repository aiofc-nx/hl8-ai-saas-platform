# Research: Domain Kernel（领域内核）

## Decisions

### ES 事件存储边界

- Decision: 仅定义契约，不提供事件存储抽象实现
- Rationale: 保持领域层纯净，适配多种基础设施（事件存储、消息总线）
- Alternatives: 提供最小抽象接口；内存默认实现（放弃以减少复杂度）

### 快照策略

- Decision: 由业务模块自决，内核仅提供契约与钩子
- Rationale: 不同聚合的事件量、重放成本差异大，强制统一会影响通用性
- Alternatives: 默认每 N 事件创建快照；固定策略（放弃，灵活性不足）

### 平台→租户共享默认策略

- Decision: 默认允许平台级共享对所有租户可见（需审计控制）
- Rationale: 便于全局参数/字典/公告下发；以审计与策略控制保障安全
- Alternatives: 禁止跨租户；基于白名单（可在业务层策略扩展实现）

## Notes

- 领域层保持零依赖，Node 运行时随机 Id 使用 `crypto.randomUUID()`
- 单测就近，覆盖聚合/事件/隔离判定/契约一致性
