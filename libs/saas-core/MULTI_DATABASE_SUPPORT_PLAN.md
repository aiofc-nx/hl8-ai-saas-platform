# 多数据库支持规划

**日期**: 2024-12-19  
**模块**: libs/saas-core  
**目标**: 支持 PostgreSQL 和 MongoDB 两种数据库

## 背景

`libs/saas-core/src/infrastructure` 需要支持两种数据库：
- **PostgreSQL**: 关系型数据库，适合事务性操作
- **MongoDB**: 文档型数据库，适合灵活的文档存储

## 架构设计

### 适配器模式

使用适配器模式来抽象数据库操作，通过 `libs/infrastructure-kernel` 提供的数据库适配器实现：

```typescript
// infrastructure-kernel 提供的适配器
import { PostgreSQLAdapter } from "@hl8/infrastructure-kernel";
import { MongoDBAdapter } from "@hl8/infrastructure-kernel";

// saas-core 使用适配器
export class TenantRepositoryImpl extends AggregateRepositoryAdapter<TenantAggregate> {
  constructor(
    private readonly dbAdapter: IDatabaseAdapter, // PostgreSQLAdapter 或 MongoDBAdapter
    private readonly mapper: TenantMapper,
  ) {
    super(dbAdapter);
  }
}
```

## 目录结构

```
libs/saas-core/src/infrastructure/
├── database/
│   ├── postgresql/           # PostgreSQL 特定实现
│   │   ├── entities/         # PostgreSQL 实体
│   │   ├── mappers/          # PostgreSQL 映射器
│   │   └── repositories/     # PostgreSQL 仓储
│   └── mongodb/              # MongoDB 特定实现
│       ├── entities/         # MongoDB 实体
│       ├── mappers/          # MongoDB 映射器
│       └── repositories/     # MongoDB 仓储
├── shared/                   # 共享逻辑
│   ├── interfaces/           # 共享接口
│   └── services/             # 共享服务
└── index.ts                  # 统一导出
```

## 实现策略

### 1. 实体分离

PostgreSQL 和 MongoDB 使用不同的实体定义：

#### PostgreSQL 实体
```typescript
// database/postgresql/entities/tenant.entity.ts
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ tableName: "tenants" })
export class TenantEntity {
  @PrimaryKey({ type: "uuid" })
  id!: string;

  @Property({ type: "varchar", length: 100 })
  code!: string;
  // ...
}
```

#### MongoDB 实体
```typescript
// database/mongodb/entities/tenant.entity.ts
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ collection: "tenants" })
export class TenantEntity {
  @PrimaryKey({ type: "string" })
  id!: string;

  @Property({ type: "string" })
  code!: string;
  // ...
}
```

### 2. 映射器分离

PostgreSQL 和 MongoDB 使用不同的映射器：

#### PostgreSQL 映射器
```typescript
// database/postgresql/mappers/tenant.mapper.ts
export class TenantMapper {
  static toDomain(entity: TenantEntity): TenantAggregate {
    // PostgreSQL 特定转换逻辑
  }

  static toEntity(aggregate: TenantAggregate): TenantEntity {
    // PostgreSQL 特定转换逻辑
  }
}
```

#### MongoDB 映射器
```typescript
// database/mongodb/mappers/tenant.mapper.ts
export class TenantMapper {
  static toDomain(entity: TenantEntity): TenantAggregate {
    // MongoDB 特定转换逻辑
  }

  static toEntity(aggregate: TenantAggregate): TenantEntity {
    // MongoDB 特定转换逻辑
  }
}
```

### 3. 仓储实现

使用工厂模式根据配置选择数据库类型：

```typescript
// shared/factories/repository.factory.ts
export class RepositoryFactory {
  static createTenantRepository(
    dbType: "postgresql" | "mongodb",
    dbAdapter: IDatabaseAdapter,
  ): ITenantRepository {
    if (dbType === "postgresql") {
      return new PostgreSQLTenantRepository(dbAdapter, PostgreSQLTenantMapper);
    } else {
      return new MongoDBTenantRepository(dbAdapter, MongoDBTenantMapper);
    }
  }
}
```

## 配置管理

### 数据库配置

```typescript
// config/database.config.ts
export interface DatabaseConfig {
  type: "postgresql" | "mongodb";
  postgresql?: PostgreSQLConnectionConfig;
  mongodb?: MongoDBConnectionConfig;
}

// 使用配置
const config: DatabaseConfig = {
  type: "postgresql",
  postgresql: {
    host: "localhost",
    port: 5432,
    // ...
  },
};
```

## 迁移路径

### 阶段 1: 重构现有代码（当前）

1. **分离实体**
   - 将 `entities/` 移动到 `database/postgresql/entities/`
   - 创建 `database/mongodb/entities/`

2. **分离映射器**
   - 将 `mappers/` 移动到 `database/postgresql/mappers/`
   - 创建 `database/mongodb/mappers/`

3. **更新仓储**
   - 使用适配器模式
   - 实现数据库特定的仓储

### 阶段 2: 实现 MongoDB 支持

1. **创建 MongoDB 实体**
   - 适配 MikroORM MongoDB 装饰器
   - 处理文档结构差异

2. **创建 MongoDB 映射器**
   - 处理类型转换
   - 处理嵌套文档

3. **创建 MongoDB 仓储**
   - 实现特定查询逻辑
   - 处理事务

## 注意事项

### 数据类型差异

**PostgreSQL**
- UUID 类型
- JSON 类型
- 外键约束
- 索引优化

**MongoDB**
- ObjectId 类型
- 嵌套文档
- 无外键约束
- 聚合管道

### 事务处理

**PostgreSQL**
```typescript
// 支持 ACID 事务
await dbAdapter.transaction(async (em) => {
  // 事务逻辑
});
```

**MongoDB**
```typescript
// 支持多文档事务（需要副本集）
const session = mongoClient.startSession();
session.startTransaction();
try {
  // 事务逻辑
  await session.commitTransaction();
} catch {
  await session.abortTransaction();
}
```

## 实施计划

### 任务分解

1. **TBD-1**: 重构目录结构，分离 PostgreSQL 和 MongoDB 实现
2. **TBD-2**: 实现 PostgreSQL 实体和映射器
3. **TBD-3**: 实现 MongoDB 实体和映射器
4. **TBD-4**: 实现仓储工厂
5. **TBD-5**: 更新配置管理
6. **TBD-6**: 编写测试

## 结论

通过使用适配器模式和数据库特定的实现，我们可以在 `libs/saas-core` 中支持多种数据库，同时保持代码的清晰性和可维护性。
