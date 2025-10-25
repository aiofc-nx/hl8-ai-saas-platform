# 缺少实体映射器的说明

**日期**: 2024-12-19  
**模块**: libs/saas-core

## 问题发现

在进行基础设施层清理后，发现了以下问题：

### ❌ 缺少的组件

1. **实体映射器（Entity Mappers）** - 用于领域实体与数据库实体之间的转换
2. **MikroORM 实体（Entities）** - 数据库实体类定义

### 当前状态

```bash
libs/saas-core/src/infrastructure/
├── cache/                      # ✅ 存在
├── casl/                       # ✅ 存在
├── database/                   # ✅ 存在
├── repositories/               # ✅ 存在
│   ├── tenant.repository.impl.ts
│   └── tenant.repository.adapter.ts
├── entities/                   # ❌ 不存在
└── mappers/                    # ❌ 不存在
```

## 为什么需要实体映射器？

在 Clean Architecture + DDD 架构中：

1. **领域层**包含领域模型（聚合根、实体、值对象）
2. **基础设施层**需要与数据库交互（使用 MikroORM）
3. **需要映射器**将领域实体转换为数据库实体，反之亦然

### 具体原因

1. **值对象处理**: 领域层使用值对象（如 `TenantCode`），但数据库只能存储原始类型（如 `string`）
2. **领域独立**: 领域层不应该依赖 ORM 装饰器（`@Entity`, `@Property`）
3. **业务逻辑保护**: 数据库实体不包含业务逻辑，领域实体包含
4. **测试友好**: 领域层测试不需要数据库

## 解决方案

请参考以下文档：

1. **详细说明**: `libs/saas-core/ENTITY_MAPPER_EXPLANATION.md`
2. **实施计划**: `specs/005-spec-documentation/plan.md`

### 需要创建的目录和文件

```
libs/saas-core/src/infrastructure/
├── entities/                   # NEW: MikroORM 实体
│   ├── tenant.entity.ts
│   ├── organization.entity.ts
│   ├── department.entity.ts
│   ├── user.entity.ts
│   ├── role.entity.ts
│   └── index.ts
└── mappers/                    # NEW: 实体映射器
    ├── tenant.mapper.ts
    ├── organization.mapper.ts
    ├── department.mapper.ts
    ├── user.mapper.ts
    ├── role.mapper.ts
    └── index.ts
```

## 下一步行动

1. ✅ 已清理基础设施层（删除空目录）
2. ✅ 已创建说明文档（`ENTITY_MAPPER_EXPLANATION.md`）
3. ✅ 已创建实施计划（`plan.md`）
4. ⏳ 待实现：创建 MikroORM 实体
5. ⏳ 待实现：创建实体映射器
6. ⏳ 待实现：更新仓储实现以使用映射器
7. ⏳ 待实现：编写测试

## 相关文件

- `libs/saas-core/ENTITY_MAPPER_EXPLANATION.md` - 详细说明文档
- `specs/005-spec-documentation/plan.md` - 实施计划
- `libs/database/src/mapping/entity-mapper.ts` - 参考实现（通用映射器）
- `libs/domain-kernel/docs/07-DATABASE_ENTITY_MAPPING.md` - 数据库实体映射文档
