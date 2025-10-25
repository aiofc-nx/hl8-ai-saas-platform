# SAAS Core 域层清理报告

**日期**: 2024-12-19  
**清理范围**: `libs/saas-core/src/domain`

## 清理概述

本次清理遵循 Clean Architecture + DDD 原则，移除不属于领域层的目录和文件，确保域层保持纯净和独立。

## 已删除的目录（11 个空目录）

### 不在域层的目录结构

以下目录为空且不属于域层职责范围，已全部删除：

1. **`abilities/`** - 能力定义（应位于接口层或应用层）
2. **`casl/`** - CASL 相关配置（应位于基础设施层）
3. **`commands/`** - 命令定义（应位于应用层）
4. **`controllers/`** - 控制器（应位于接口层）
5. **`dto/`** - 数据传输对象（应位于接口层或应用层）
6. **`guards/`** - 守卫（应位于接口层）
7. **`handlers/`** - 处理器（应位于应用层）
8. **`persistence/`** - 持久化（应位于基础设施层）
9. **`queries/`** - 查询定义（应位于应用层）
10. **`repositories/`** - 仓储实现（接口定义应在域层，实现应在基础设施层）
11. **`use-cases/`** - 用例（应位于应用层）

## 已移动的文件（5 个文件）

### 基础设施层文件

以下文件包含基础设施关注点，已移动到 `libs/saas-core/src/infrastructure/services/`：

1. **`domain-cache-manager.service.ts`**
   - **原因**: 缓存管理属于基础设施关注点
   - **新位置**: `infrastructure/services/domain-cache-manager.service.ts`

2. **`domain-query-optimizer.service.ts`**
   - **原因**: 查询优化涉及数据库和性能监控，属于基础设施关注点
   - **新位置**: `infrastructure/services/domain-query-optimizer.service.ts`

3. **`domain-performance-monitor.service.ts`**
   - **原因**: 性能监控涉及系统级监控，属于基础设施关注点
   - **新位置**: `infrastructure/services/domain-performance-monitor.service.ts`

4. **`domain-event-bus.service.ts`**
   - **原因**: 事件总线实现涉及消息传递和事件路由，属于基础设施关注点
   - **新位置**: `infrastructure/services/domain-event-bus.service.ts`

5. **`domain-performance.event.ts`** (来自 `domain/events/`)
   - **原因**: 性能事件属于基础设施级事件，不属于业务域事件
   - **新位置**: `infrastructure/services/domain-performance.event.ts`

## 清理后的域层结构

### 保留的目录和文件

```
domain/
├── aggregates/           # 聚合根
│   ├── department.aggregate.ts
│   ├── organization.aggregate.ts
│   ├── tenant.aggregate.ts
│   └── index.ts
├── entities/             # 实体
│   ├── casl-ability.entity.ts
│   ├── department.entity.ts
│   ├── organization.entity.ts
│   ├── platform.entity.ts
│   ├── role.entity.ts
│   ├── tenant.entity.ts
│   ├── user.entity.ts
│   └── index.ts
├── events/               # 领域事件
│   ├── department-hierarchy-limit-exceeded.event.ts
│   ├── permission-changed.event.ts
│   ├── permission-conflict-detected.event.ts
│   ├── resource-limit-exceeded.event.ts
│   ├── resource-usage-warning.event.ts
│   ├── tenant-activated.event.ts
│   ├── tenant-created.event.ts
│   ├── tenant-creation-validation-failed.event.ts
│   ├── tenant-deleted.event.ts
│   ├── tenant-name-review-completed.event.ts
│   ├── tenant-name-review-requested.event.ts
│   ├── tenant-status-changed.event.ts
│   ├── trial-expired.event.ts
│   ├── user-assignment-conflict.event.ts
│   ├── user-identity-switched.event.ts
│   └── index.ts
├── services/             # 领域服务
│   ├── department-business-rules.service.ts
│   ├── department-hierarchy-manager.service.ts
│   ├── department-level-config.service.ts
│   ├── domain-business-rules-engine.service.ts
│   ├── domain-integration.service.ts
│   ├── domain-validation.service.ts
│   ├── domain-validator.service.ts
│   ├── organization-business-rules.service.ts
│   ├── permission-conflict-detector.service.ts
│   ├── permission-hierarchy-manager.service.ts
│   ├── permission-template.service.ts
│   ├── resource-monitoring.service.ts
│   ├── tenant-business-rules.service.ts
│   ├── tenant-code-validator.service.ts
│   ├── tenant-creation-rules.service.ts
│   ├── tenant-name-review-rules.service.ts
│   ├── tenant-name-review.service.ts
│   ├── trial-expiration.handler.service.ts
│   ├── trial-period.service.ts
│   ├── user-assignment-rules.service.ts
│   ├── user-identity-manager.service.ts
│   └── user-tenant-switcher.service.ts
├── value-objects/        # 值对象
│   ├── base-value-object.ts
│   ├── casl-ability-id.vo.ts
│   ├── casl-condition.vo.ts
│   ├── casl-rule.vo.ts
│   ├── department-id.vo.ts
│   ├── department-level-config.vo.ts
│   ├── isolation-context.vo.ts
│   ├── organization-id.vo.ts
│   ├── permission-template.vo.ts
│   ├── platform-id.vo.ts
│   ├── platform-user.vo.ts
│   ├── resource-limits.vo.ts
│   ├── resource-usage.vo.ts
│   ├── role-id.vo.ts
│   ├── role-level.vo.ts
│   ├── tenant-code.vo.ts
│   ├── tenant-id.vo.ts
│   ├── tenant-name-review-request.vo.ts
│   ├── tenant-name-review-status.vo.ts
│   ├── tenant-name.vo.ts
│   ├── tenant-status.vo.ts
│   ├── tenant-type.vo.ts
│   ├── tenant-user.vo.ts
│   ├── trial-period-config.vo.ts
│   ├── user-department-assignment.vo.ts
│   ├── user-id.vo.ts
│   ├── user-organization-assignment.vo.ts
│   └── index.ts
└── index.ts
```

## 清理原则

### DDD 域层职责

域层应仅包含：

- **聚合根（Aggregates）**: 业务实体聚合
- **实体（Entities）**: 具有唯一标识的业务对象
- **值对象（Value Objects）**: 不可变值
- **领域事件（Domain Events）**: 业务域事件
- **领域服务（Domain Services）**: 跨实体的业务逻辑
- **仓储接口（Repository Interfaces）**: 数据访问抽象（接口定义）

**注意**: 仓储接口定义应该在域层，但具体实现在基础设施层。这是依赖倒置原则的体现。

### 不属于域层的内容

以下内容不应出现在域层：

- ❌ 缓存管理实现
- ❌ 查询优化实现
- ❌ 性能监控实现
- ❌ 事件总线实现
- ❌ 控制器
- ❌ DTO
- ❌ 守卫
- ❌ 处理器
- ❌ 仓储实现（接口定义应在域层，实现在基础设施层）
- ❌ 用例
- ❌ 命令/查询定义

### 仓储模式说明

按照 DDD 和依赖倒置原则（DIP）：

- ✅ **域层**: 定义仓储接口（Repository Interface）

  ```typescript
  interface ITenantRepository {
    findById(id: TenantId): Promise<TenantAggregate | null>;
    save(tenant: TenantAggregate): Promise<void>;
  }
  ```

- ✅ **基础设施层**: 实现仓储接口

  ```typescript
  class TenantRepository implements ITenantRepository {
    async findById(id: TenantId): Promise<TenantAggregate | null> {
      // 数据库查询实现
    }
  }
  ```

这样域层不会依赖基础设施层，而是基础设施层依赖域层的接口定义。

## 下一步建议

1. 更新导入路径：检查并更新引用已移动文件的导入路径
2. 更新导出索引：更新 `domain/index.ts` 移除已移动文件的导出
3. 添加基础设施层导出：在 `infrastructure/services/index.ts` 中添加新文件的导出
4. 运行测试：确保所有测试通过
5. 更新文档：更新架构文档反映新的目录结构

## 参考

- Clean Architecture: <https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html>
- Domain-Driven Design: <https://www.domainlanguage.com/ddd/>
- DDD 分层架构指南: `.cursor/docs/architecture/ddd-layered-architecture.md`
