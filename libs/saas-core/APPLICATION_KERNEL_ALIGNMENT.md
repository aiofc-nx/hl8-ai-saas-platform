# Application Kernel 对齐说明

**日期**: 2024-12-19  
**模块**: libs/saas-core  
**对齐目标**: libs/application-kernel

## 核心原则

`libs/saas-core/src/application` 层的开发**必须基于 `libs/application-kernel`**。

## application-kernel 提供的核心组件

### 1. CQRS 基础类

```typescript
// 从 application-kernel 导入
import {
  BaseCommand, // 基础命令抽象类
  BaseQuery, // 基础查询抽象类
  CommandHandler, // 命令处理器接口
  QueryHandler, // 查询处理器接口
} from "@hl8/application-kernel";
```

### 2. 用例基础类

```typescript
import {
  BaseUseCase, // 基础用例抽象类
  BaseCommandUseCase, // 命令用例基础类
} from "@hl8/application-kernel";
```

### 3. 上下文和事件

```typescript
import type {
  IUseCaseContext, // 用例上下文接口
  IEventBus, // 事件总线接口
  ITransactionManager, // 事务管理器接口
} from "@hl8/application-kernel";
```

### 4. 验证和异常

```typescript
import {
  BaseClassValidator,
  GeneralBadRequestException,
} from "@hl8/application-kernel";
```

## 当前应用层问题

### ❌ 不应该在应用层的目录

以下目录应该删除或移动到其他层：

1. **`abilities/`** - 能力定义（应该在其他层）
2. **`aggregates/`** - 聚合根（应该在领域层）
3. **`casl/`** - CASL配置（应该在接口层或基础设施层）
4. **`controllers/`** - 控制器（应该在接口层）
5. **`dto/`** - 数据传输对象（应该在接口层）
6. **`entities/`** - 实体（应该在领域层）
7. **`events/`** - 领域事件（应该在领域层）
8. **`guards/`** - 守卫（应该在接口层）
9. **`persistence/`** - 持久化（应该在基础设施层）
10. **`repositories/`** - 仓储（应该在基础设施层）
11. **`services/`** - 服务（大部分应该在基础设施层）

### ✅ 应该在应用层的目录

1. **`commands/`** - 命令定义
2. **`queries/`** - 查询定义
3. **`handlers/`** - 处理器（命令/查询处理器）
4. **`use-cases/`** - 用例实现

## 对齐方式

### ✅ 正确做法

#### 1. 命令（继承 BaseCommand）

```typescript
import { BaseCommand } from "@hl8/application-kernel";
import { IsolationContext } from "@hl8/domain-kernel";

export class CreateTenantCommand extends BaseCommand {
  constructor(
    public readonly name: string,
    public readonly code: string,
    isolationContext: IsolationContext,
  ) {
    super("CreateTenant", "Create a new tenant", isolationContext);
  }
}
```

#### 2. 查询（继承 BaseQuery）

```typescript
import { BaseQuery } from "@hl8/application-kernel";
import { IsolationContext } from "@hl8/domain-kernel";

export class GetTenantQuery extends BaseQuery {
  constructor(
    public readonly tenantId: string,
    isolationContext: IsolationContext,
  ) {
    super("GetTenant", "Get tenant by ID", isolationContext);
  }
}
```

#### 3. 命令处理器（实现 CommandHandler）

```typescript
import type { CommandHandler } from "@hl8/application-kernel";
import { CreateTenantCommand } from "../commands/create-tenant.command.js";

export class CreateTenantHandler
  implements CommandHandler<CreateTenantCommand, TenantAggregate>
{
  async execute(command: CreateTenantCommand): Promise<TenantAggregate> {
    // 实现命令逻辑
  }
}
```

#### 4. 查询处理器（实现 QueryHandler）

```typescript
import type { QueryHandler } from "@hl8/application-kernel";
import { GetTenantQuery } from "../queries/get-tenant.query.js";

export class GetTenantHandler
  implements QueryHandler<GetTenantQuery, TenantAggregate>
{
  async execute(query: GetTenantQuery): Promise<TenantAggregate | null> {
    // 实现查询逻辑
  }
}
```

#### 5. 用例（继承 BaseUseCase）

```typescript
import { BaseUseCase } from "@hl8/application-kernel";
import type { IUseCaseContext } from "@hl8/application-kernel";

export class CreateTenantUseCase extends BaseUseCase<
  CreateTenantCommand,
  TenantAggregate
> {
  constructor() {
    super("CreateTenant", "Create a new tenant with validation", "1.0.0", [
      "tenant:create",
    ]);
  }

  protected async executeUseCase(
    request: CreateTenantCommand,
    context: IUseCaseContext,
  ): Promise<TenantAggregate> {
    // 实现用例逻辑
  }
}
```

### ❌ 错误做法

#### 1. 不要自定义命令基类

```typescript
// ❌ 错误：自定义命令基类
export abstract class CustomCommand {
  id: string;
  timestamp: Date;
}

// ✅ 正确：继承 application-kernel 的 BaseCommand
export class CreateTenantCommand extends BaseCommand {}
```

#### 2. 不要直接实现用例逻辑

```typescript
// ❌ 错误：不使用用例基类
export class CreateTenantService {
  async createTenant(data: any) {
    // 直接实现逻辑
  }
}

// ✅ 正确：继承 BaseUseCase
export class CreateTenantUseCase extends BaseUseCase<
  CreateTenantCommand,
  TenantAggregate
> {}
```

#### 3. 不要在应用层定义实体

```typescript
// ❌ 错误：应用层不应该包含实体
// application/entities/user.entity.ts
export class User {
  // ...
}

// ✅ 正确：实体应该在领域层
// domain/entities/user.entity.ts
```

## 正确的应用层目录结构

```
libs/saas-core/src/application/
├── commands/                      # ✅ 命令定义（继承 BaseCommand）
│   ├── create-tenant.command.ts
│   ├── update-tenant.command.ts
│   ├── delete-tenant.command.ts
│   └── index.ts
├── queries/                       # ✅ 查询定义（继承 BaseQuery）
│   ├── get-tenant.query.ts
│   ├── list-tenants.query.ts
│   └── index.ts
├── handlers/                      # ✅ 处理器（实现 CommandHandler/QueryHandler）
│   ├── commands/
│   │   ├── create-tenant.handler.ts
│   │   ├── update-tenant.handler.ts
│   │   └── delete-tenant.handler.ts
│   ├── queries/
│   │   ├── get-tenant.handler.ts
│   │   └── list-tenants.handler.ts
│   └── index.ts
└── use-cases/                     # ✅ 用例实现（继承 BaseUseCase）
    ├── create-tenant.use-case.ts
    ├── update-tenant.use-case.ts
    ├── delete-tenant.use-case.ts
    └── index.ts
```

## 清理计划

### Step 1: 清理不需要的目录

```bash
# 删除不应该在应用层的目录
rm -rf libs/saas-core/src/application/abilities
rm -rf libs/saas-core/src/application/aggregates
rm -rf libs/saas-core/src/application/casl
rm -rf libs/saas-core/src/application/controllers
rm -rf libs/saas-core/src/application/dto
rm -rf libs/saas-core/src/application/entities
rm -rf libs/saas-core/src/application/events
rm -rf libs/saas-core/src/application/guards
rm -rf libs/saas-core/src/application/persistence
rm -rf libs/saas-core/src/application/repositories
rm -rf libs/saas-core/src/application/services
```

### Step 2: 重构现有代码

将所有命令、查询、处理器和用例对齐到 `application-kernel` 的基类。

### Step 3: 验证对齐

确保所有代码都正确继承或实现了 `application-kernel` 的基类和接口。

## 检查清单

### 命令和查询

- [ ] 所有命令继承 `BaseCommand`
- [ ] 所有查询继承 `BaseQuery`
- [ ] 命令和查询包含 `IsolationContext`
- [ ] 命令和查询包含适当的元数据

### 处理器

- [ ] 命令处理器实现 `CommandHandler` 接口
- [ ] 查询处理器实现 `QueryHandler` 接口
- [ ] 处理器正确实现 `execute` 方法

### 用例

- [ ] 所有用例继承 `BaseUseCase`
- [ ] 用例包含版本号
- [ ] 用例包含所需权限
- [ ] 用例实现 `executeUseCase` 方法
- [ ] 用例使用 `IUseCaseContext`

### 清理

- [ ] 删除不属于应用层的目录
- [ ] 移动实体到领域层
- [ ] 移动DTO到接口层
- [ ] 移动控制器到接口层
- [ ] 移动仓储到基础设施层

## 相关文档

- `libs/application-kernel/README.md` - Application Kernel 文档
- `ENTITY_MAPPER_EXPLANATION.md` - 实体映射器说明
- `INFRASTRUCTURE_KERNEL_ALIGNMENT.md` - Infrastructure Kernel 对齐说明
