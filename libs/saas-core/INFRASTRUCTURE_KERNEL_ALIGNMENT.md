# Infrastructure Kernel 对齐说明

**日期**: 2024-12-19  
**模块**: libs/saas-core  
**对齐目标**: libs/infrastructure-kernel

## 核心原则

`libs/saas-core/src/infrastructure` 层的开发**必须基于 `libs/infrastructure-kernel`**。

## infrastructure-kernel 提供的核心组件

### 1. 仓储适配器基类

```typescript
// 从 infrastructure-kernel 导入
import {
  BaseRepositoryAdapter, // 基础仓储适配器
  AggregateRepositoryAdapter, // 聚合根仓储适配器（支持事件溯源）
  ReadModelRepositoryAdapter, // 读模型仓储适配器
} from "@hl8/infrastructure-kernel";
```

### 2. 接口定义

```typescript
import type {
  IDatabaseAdapter, // 数据库适配器接口
  ICacheService, // 缓存服务接口
  IsolationContext, // 隔离上下文类型
} from "@hl8/infrastructure-kernel";
```

### 3. 服务和工具

- 数据库适配器（PostgreSQL, MongoDB）
- 缓存服务
- 隔离上下文管理
- 访问控制服务
- 事务管理
- 错误处理

## 对齐方式

### ✅ 正确做法

```typescript
// 1. 继承基础设施 Kernel 的基类
import { AggregateRepositoryAdapter } from "@hl8/infrastructure-kernel";
import type {
  IDatabaseAdapter,
  ICacheService,
} from "@hl8/infrastructure-kernel";

export class TenantRepositoryImpl extends AggregateRepositoryAdapter<TenantAggregate> {
  constructor(databaseAdapter: IDatabaseAdapter, cacheService: ICacheService) {
    super(databaseAdapter, cacheService);
  }

  // 重写或添加特定方法
  async findByCode(code: string): Promise<TenantAggregate | null> {
    // 使用基类的 findOne 方法
    const entity = await this.findOne({ code });
    return entity ? this.mapToAggregate(entity) : null;
  }
}
```

### ❌ 错误做法

```typescript
// 1. 不要直接实现接口而不继承基类
export class TenantRepositoryImpl implements IRepository<TenantAggregate> {
  // 直接实现所有方法（重复代码）
}

// 2. 不要自定义基础设施组件
export class TenantRepositoryImpl {
  constructor(private mysql: MySQLDatabase) {}
}

// 3. 不要重新实现已存在的功能
export class TenantRepositoryImpl {
  private cache: RedisCache;
  private transaction: TransactionManager;
  // ...
}
```

## 实现步骤

### Step 1: 创建 MikroORM 实体

```typescript
// infrastructure/entities/tenant.entity.ts
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ tableName: "tenants" })
export class TenantEntity {
  @PrimaryKey()
  id!: string;

  @Property()
  code!: string;

  @Property()
  name!: string;
}
```

### Step 2: 创建实体映射器

```typescript
// infrastructure/mappers/tenant.mapper.ts
import { TenantAggregate } from "../../domain/aggregates/tenant.aggregate.js";
import { TenantEntity } from "../entities/tenant.entity.js";

export class TenantMapper {
  static toDomain(entity: TenantEntity): TenantAggregate {
    // 转换逻辑
  }

  static toEntity(aggregate: TenantAggregate): TenantEntity {
    // 转换逻辑
  }
}
```

### Step 3: 创建仓储实现（继承基类）

```typescript
// infrastructure/repositories/tenant.repository.impl.ts
import { AggregateRepositoryAdapter } from "@hl8/infrastructure-kernel";
import type {
  IDatabaseAdapter,
  ICacheService,
} from "@hl8/infrastructure-kernel";

export class TenantRepositoryImpl extends AggregateRepositoryAdapter<TenantAggregate> {
  constructor(databaseAdapter: IDatabaseAdapter, cacheService: ICacheService) {
    super(databaseAdapter, cacheService);
  }

  protected getEntityClass(): typeof TenantEntity {
    return TenantEntity;
  }
}
```

## 目录结构

```
libs/saas-core/src/infrastructure/
├── entities/                    # MikroORM 实体
│   ├── tenant.entity.ts
│   ├── organization.entity.ts
│   ├── department.entity.ts
│   ├── user.entity.ts
│   ├── role.entity.ts
│   └── index.ts
├── mappers/                     # 实体映射器
│   ├── tenant.mapper.ts
│   ├── organization.mapper.ts
│   ├── department.mapper.ts
│   ├── user.mapper.ts
│   ├── role.mapper.ts
│   └── index.ts
└── repositories/                # 仓储实现（继承 infrastructure-kernel 基类）
    ├── tenant.repository.impl.ts
    ├── organization.repository.impl.ts
    ├── department.repository.impl.ts
    ├── user.repository.impl.ts
    ├── role.repository.impl.ts
    └── index.ts
```

## 检查清单

- [ ] 继承 `BaseRepositoryAdapter` 或 `AggregateRepositoryAdapter`
- [ ] 使用 `IDatabaseAdapter` 类型
- [ ] 使用 `ICacheService` 类型
- [ ] 使用 `IsolationContext` 类型
- [ ] 不重新实现基础设施 Kernel 已有的功能
- [ ] 使用实体映射器进行领域实体与数据库实体转换
- [ ] 重写 `getEntityClass()` 方法返回 MikroORM 实体类
- [ ] 通过构造函数注入依赖

## 相关文档

- `ENTITY_MAPPER_EXPLANATION.md` - 实体映射器详细说明
- `MISSING_ENTITY_MAPPERS.md` - 缺少实体映射器的说明
- `libs/infrastructure-kernel/README.md` - 基础设施 Kernel 文档
