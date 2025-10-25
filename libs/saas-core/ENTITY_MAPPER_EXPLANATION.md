# 实体映射器说明

**日期**: 2024-12-19  
**模块**: libs/saas-core  
**对齐**: libs/infrastructure-kernel

## 为什么需要实体映射器？

在 Clean Architecture + DDD 架构中，**实体映射器（Entity Mappers）**是连接领域层和基础设施层的桥梁。它们负责将领域实体转换为数据库实体，以及将数据库实体转换为领域实体。

## 基础设施层必须基于 libs/infrastructure-kernel

### 对齐原则

`libs/saas-core/src/infrastructure` 层的开发**必须基于 `libs/infrastructure-kernel`**，遵循以下原则：

1. **使用基础设施 Kernel 的基类**
   - `BaseRepositoryAdapter` - 基础仓储适配器
   - `AggregateRepositoryAdapter` - 聚合根仓储适配器
   - `ReadModelRepositoryAdapter` - 读模型仓储适配器

2. **遵循基础设施 Kernel 的架构**
   - 继承基类而非重新实现
   - 实现接口而非创建新接口
   - 使用现有的类型定义

3. **复用基础设施 Kernel 的功能**
   - 隔离上下文管理
   - 缓存服务
   - 事务管理
   - 错误处理

## infrastructure-kernel 提供的核心组件

### 1. 仓储适配器

```typescript
// infrastructure-kernel 提供的基类
import {
  BaseRepositoryAdapter,
  AggregateRepositoryAdapter,
  ReadModelRepositoryAdapter,
} from "@hl8/infrastructure-kernel";

// ✅ 正确：继承基础设施 Kernel 的基类
export class TenantRepositoryImpl extends AggregateRepositoryAdapter<TenantAggregate> {
  // 实现特定方法
}
```

### 2. 数据库适配器

```typescript
import type { IDatabaseAdapter } from "@hl8/infrastructure-kernel";

export class TenantRepositoryImpl extends AggregateRepositoryAdapter<TenantAggregate> {
  constructor(databaseAdapter: IDatabaseAdapter, ...) {
    super(databaseAdapter, ...);
  }
}
```

### 3. 隔离上下文

```typescript
import type { IsolationContext } from "@hl8/infrastructure-kernel";

export class TenantMapper {
  static toDomain(
    entity: TenantEntity,
    context: IsolationContext,
  ): TenantAggregate {
    // 使用隔离上下文
  }
}
```

### 4. 缓存服务

```typescript
import type { ICacheService } from "@hl8/infrastructure-kernel";

export class TenantRepositoryImpl extends AggregateRepositoryAdapter<TenantAggregate> {
  constructor(databaseAdapter: IDatabaseAdapter, cacheService: ICacheService) {
    super(databaseAdapter, cacheService);
  }
}
```

## 映射器在基础设施层的位置

### 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                     libs/infrastructure-kernel                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ BaseRepositoryAdapter                                    │   │
│  │ AggregateRepositoryAdapter                               │   │
│  │ ReadModelRepositoryAdapter                               │   │
│  └────────────────────┬──────────────────────────────────────┘   │
└───────────────────────┼──────────────────────────────────────────┘
                        │ 继承
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                  libs/saas-core/src/infrastructure               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ repositories/                                             │   │
│  │ ├── TenantRepositoryImpl ──────┐                         │   │
│  │ │   extends AggregateRepositoryAdapter                   │   │
│  │ └───────────────────────────────┼──────────────┐          │   │
│  │                                 │              │          │   │
│  ├── entities/                     │              │          │   │
│  │ ├── TenantEntity ───────────────┤              │          │   │
│  │ └── ...                         │              │          │   │
│  │                                 │              │          │   │
│  └── mappers/                      │              │          │   │
│      ├── TenantMapper ─────────────┘              │          │   │
│      │  - toDomain(entity) ──────────┐            │          │   │
│      │  - toEntity(aggregate) ────────┘            │          │   │
│      └── ...                        │              │          │   │
└────────────────────────────────────┼──────────────┼──────────┘
                                     │              │
                                     ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  libs/saas-core/src/domain                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ TenantAggregate ◄────────────────────────────────────────┘   │
│  │ User Entity                                                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 实现示例（对齐 infrastructure-kernel）

### 1. MikroORM 实体（基础设施层）

```typescript
// infrastructure/entities/tenant.entity.ts
import { Entity, PrimaryKey, Property, Index } from "@mikro-orm/core";

@Entity({ tableName: "tenants" })
@Index({ properties: ["tenantId"] })
export class TenantEntity {
  @PrimaryKey()
  id!: string;

  @Property()
  tenantId!: string;

  @Property({ unique: true })
  code!: string;

  @Property()
  name!: string;

  @Property()
  status!: string;

  @Property()
  createdAt!: Date;

  @Property()
  updatedAt!: Date;
}
```

### 2. 领域聚合根（领域层）

```typescript
// domain/aggregates/tenant.aggregate.ts
export class TenantAggregate {
  private constructor(
    private readonly _id: TenantId,
    private readonly _code: TenantCode,
    private _name: string,
    private _status: TenantStatus,
  ) {}

  static create(id: TenantId, code: TenantCode, name: string): TenantAggregate {
    return new TenantAggregate(id, code, name, TenantStatus.PENDING);
  }

  activate(): void {
    this._status = TenantStatus.ACTIVE;
  }

  getCode(): TenantCode {
    return this._code;
  }
}
```

### 3. 实体映射器（基础设施层）

```typescript
// infrastructure/mappers/tenant.mapper.ts
import { TenantAggregate } from "../../domain/aggregates/tenant.aggregate.js";
import { TenantEntity } from "../entities/tenant.entity.js";
import { TenantId } from "../../domain/value-objects/tenant-id.vo.js";
import { TenantCode } from "../../domain/value-objects/tenant-code.vo.js";
import { TenantStatus } from "../../domain/entities/tenant-status.enum.js";

export class TenantMapper {
  /**
   * 将数据库实体转换为领域聚合根
   */
  static toDomain(entity: TenantEntity): TenantAggregate {
    // 重建值对象
    const id = TenantId.create(entity.id);
    const code = TenantCode.create(entity.code);

    // 创建聚合根
    const aggregate = TenantAggregate.create(id, code, entity.name);

    // 设置状态
    aggregate.setStatus(entity.status as TenantStatus);

    // 设置审计信息
    aggregate.setCreatedAt(entity.createdAt);
    aggregate.setUpdatedAt(entity.updatedAt);

    return aggregate;
  }

  /**
   * 将领域聚合根转换为数据库实体
   */
  static toEntity(aggregate: TenantAggregate): TenantEntity {
    const entity = new TenantEntity();
    entity.id = aggregate.id.getValue();
    entity.tenantId = aggregate.getTenantId().getValue();
    entity.code = aggregate.getCode().getValue(); // 值对象解包
    entity.name = aggregate.getName();
    entity.status = aggregate.getStatus().getValue(); // 枚举转字符串
    entity.createdAt = aggregate.createdAt;
    entity.updatedAt = aggregate.updatedAt;
    return entity;
  }
}
```

### 4. 仓储实现（继承 infrastructure-kernel 基类）

```typescript
// infrastructure/repositories/tenant.repository.impl.ts
import { AggregateRepositoryAdapter } from "@hl8/infrastructure-kernel";
import type {
  IDatabaseAdapter,
  ICacheService,
  IsolationContext,
} from "@hl8/infrastructure-kernel";
import { TenantAggregate } from "../../domain/aggregates/tenant.aggregate.js";
import { TenantEntity } from "../entities/tenant.entity.js";
import { TenantMapper } from "../mappers/tenant.mapper.js";
import { TenantId } from "../../domain/value-objects/tenant-id.vo.js";

/**
 * ✅ 继承 infrastructure-kernel 的基类
 */
export class TenantRepositoryImpl extends AggregateRepositoryAdapter<TenantAggregate> {
  constructor(
    databaseAdapter: IDatabaseAdapter,
    cacheService?: ICacheService,
    isolationContext?: IsolationContext,
  ) {
    super(databaseAdapter, cacheService, isolationContext);
  }

  protected getEntityClass(): typeof TenantEntity {
    return TenantEntity;
  }

  async findById(id: TenantId): Promise<TenantAggregate | null> {
    const entity = await this.findOne({ id: id.getValue() });
    if (!entity) return null;

    // 使用映射器转换为领域实体
    return TenantMapper.toDomain(entity);
  }

  async save(aggregate: TenantAggregate): Promise<void> {
    // 使用映射器转换为数据库实体
    const entity = TenantMapper.toEntity(aggregate);
    await this.saveAggregate(entity);
  }
}
```

## 目录结构（对齐 infrastructure-kernel）

```
libs/saas-core/src/
├── domain/
│   ├── aggregates/              # 领域聚合根
│   │   ├── tenant.aggregate.ts
│   │   ├── organization.aggregate.ts
│   │   └── department.aggregate.ts
│   ├── entities/                # 领域实体
│   │   ├── user.entity.ts
│   │   └── role.entity.ts
│   └── value-objects/           # 值对象
│       ├── tenant-id.vo.ts
│       └── tenant-code.vo.ts
└── infrastructure/
    ├── entities/                # MikroORM 实体（数据库）
    │   ├── tenant.entity.ts
    │   ├── organization.entity.ts
    │   ├── department.entity.ts
    │   ├── user.entity.ts
    │   └── role.entity.ts
    ├── mappers/                 # 实体映射器
    │   ├── tenant.mapper.ts
    │   ├── organization.mapper.ts
    │   ├── department.mapper.ts
    │   ├── user.mapper.ts
    │   ├── role.mapper.ts
    │   └── index.ts
    └── repositories/            # 仓储实现（继承 infrastructure-kernel 基类）
        ├── tenant.repository.impl.ts
        ├── organization.repository.impl.ts
        ├── department.repository.impl.ts
        ├── user.repository.impl.ts
        └── role.repository.impl.ts
```

## 关键对齐点

### 1. 继承基础设施 Kernel 基类

```typescript
// ✅ 正确：继承 AggregateRepositoryAdapter
import { AggregateRepositoryAdapter } from "@hl8/infrastructure-kernel";

export class TenantRepositoryImpl extends AggregateRepositoryAdapter<TenantAggregate> {
  // ...
}

// ❌ 错误：直接实现接口
export class TenantRepositoryImpl implements ITenantRepository {
  // ...
}
```

### 2. 使用基础设施 Kernel 的类型

```typescript
// ✅ 正确：使用基础设施 Kernel 的类型
import type {
  IDatabaseAdapter,
  ICacheService,
  IsolationContext,
} from "@hl8/infrastructure-kernel";

export class TenantRepositoryImpl extends AggregateRepositoryAdapter<TenantAggregate> {
  constructor(
    databaseAdapter: IDatabaseAdapter,
    cacheService: ICacheService,
    isolationContext: IsolationContext,
  ) {
    super(databaseAdapter, cacheService, isolationContext);
  }
}

// ❌ 错误：自定义类型
export class TenantRepositoryImpl {
  constructor(
    private database: MySQLDatabase,
    private cache: RedisCache,
  ) {}
}
```

### 3. 实现基础设施 Kernel 的接口

```typescript
// ✅ 正确：实现基础设施 Kernel 的接口
import type { IRepository } from "@hl8/infrastructure-kernel";

export class TenantRepositoryImpl extends AggregateRepositoryAdapter<TenantAggregate> {
  // 自动实现 IRepository 接口的方法
}

// ❌ 错误：定义新接口
interface ITenantRepository {
  // ...
}
```

## 优势

### 1. 基础设施统一

- 所有项目使用相同的基础设施抽象
- 减少代码重复
- 提高代码复用性

### 2. 框架集成

- 直接使用 MikroORM
- 自动支持缓存
- 自动处理隔离上下文

### 3. 测试友好

- 可以模拟基础设施 Kernel 的服务
- 基础设施 Kernel 本身已经过测试
- 只需测试业务逻辑

### 4. 维护性

- 基础设施变更集中管理
- 业务代码与基础设施解耦
- 易于升级和维护

## 总结

实体映射器在基础设施层的作用：

1. ✅ 连接领域层和数据库层
2. ✅ 处理值对象与原始类型的转换
3. ✅ 保护领域层的业务逻辑
4. ✅ 基于 `libs/infrastructure-kernel` 提供的基类
5. ✅ 遵循基础设施 Kernel 的架构模式

这就是为什么 `libs/saas-core` 需要实体映射器，以及如何与 `libs/infrastructure-kernel` 对齐的原因。
