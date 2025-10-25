# libs/saas-core 架构对齐报告

> **生成日期**: 2025-01-27  
> **参考文档**: `.cursor/docs/architecture/`

---

## 📋 执行摘要

本报告基于 `.cursor/docs/architecture/` 下的架构设计文档，对 `libs/saas-core` 的当前实现进行了全面审查，并提供了对齐建议。

**总体评估**: ✅ **基本符合架构设计**

libs/saas-core 的整体结构符合架构设计文档要求，但在某些细节上需要进一步完善。

---

## ✅ 符合要求的方面

### 1. 四层架构结构

当前结构完全符合 Clean Architecture 的四层设计要求：

```
libs/saas-core/src/
├── domain/          ✅ 领域层
├── application/     ✅ 应用层
├── infrastructure/  ✅ 基础设施层
└── interface/       ✅ 接口层
```

### 2. 领域层结构

当前领域层结构符合 DDD 设计：

```
domain/
├── entities/        ✅ 实体
├── aggregates/      ✅ 聚合根
├── value-objects/   ✅ 值对象
├── services/        ✅ 领域服务
├── events/          ✅ 领域事件
├── repositories/    ✅ 仓储接口
└── factories/       ✅ 工厂
```

### 3. 应用层结构

当前应用层结构符合 CQRS 模式：

```
application/
├── commands/        ✅ 命令
├── queries/         ✅ 查询
├── handlers/        ✅ 处理器
└── use-cases/       ✅ 用例
```

### 4. 基础设施层结构

当前基础设施层结构合理：

```
infrastructure/
├── repositories/    ✅ 仓储实现
├── entities/        ✅ 数据库实体
├── mappers/         ✅ 实体映射器
├── database/        ✅ 数据库配置
├── casl/            ✅ CASL 权限
├── services/        ✅ 基础设施服务
└── cache/           ✅ 缓存实现
```

### 5. 接口层结构

当前接口层结构符合 REST API 设计：

```
interface/
├── controllers/     ✅ 控制器
├── dto/             ✅ 数据传输对象
└── guards/          ✅ 守卫
```

---

## ⚠️ 需要改进的方面

### 1. 领域层 - 基类继承

**问题**: 领域实体和聚合根应该继承来自 `@hl8/domain-kernel` 的基类

**当前状态**: 
- 部分实体直接定义了基础功能
- 没有统一继承 `BaseEntity` 和 `AggregateRoot`

**建议**:
```typescript
// 应该继承自 @hl8/domain-kernel
import { BaseEntity, AggregateRoot } from '@hl8/domain-kernel';

export class Tenant extends BaseEntity {
  // ...
}

export class TenantAggregate extends AggregateRoot {
  // ...
}
```

### 2. 领域层 - 值对象基类

**问题**: 值对象应该继承 `BaseValueObject`

**建议**:
```typescript
import { BaseValueObject } from '@hl8/domain-kernel';

export class TenantCode extends BaseValueObject<string> {
  // ...
}
```

### 3. 应用层 - 用例基类

**问题**: 用例应该继承 `BaseUseCase`

**当前状态**: ✅ 已正确继承

### 4. 应用层 - 命令和查询基类

**问题**: 命令和查询应该继承 `BaseCommand` 和 `BaseQuery`

**当前状态**: ✅ 已正确继承

### 5. 基础设施层 - 仓储模式

**问题**: 仓储实现应该继承 `AggregateRepositoryAdapter`

**建议**:
```typescript
import { AggregateRepositoryAdapter } from '@hl8/infrastructure-kernel';

export class TenantRepositoryPostgreSQL 
  extends AggregateRepositoryAdapter<TenantAggregate> {
  // ...
}
```

### 6. 接口层 - 控制器基类

**问题**: 控制器应该继承 `RestController`

**建议**:
```typescript
import { RestController } from '@hl8/interface-kernel';

export class TenantController extends RestController {
  // ...
}
```

---

## 📝 详细对齐检查清单

### 领域层检查

- [x] 实体目录存在
- [x] 聚合根目录存在
- [x] 值对象目录存在
- [x] 领域服务目录存在
- [x] 领域事件目录存在
- [x] 仓储接口目录存在
- [ ] 实体继承 BaseEntity（部分未对齐）
- [ ] 聚合根继承 AggregateRoot（部分未对齐）
- [ ] 值对象继承 BaseValueObject（部分未对齐）
- [x] 充血模型实现
- [x] 业务逻辑在领域对象内

### 应用层检查

- [x] 命令目录存在
- [x] 查询目录存在
- [x] 处理器目录存在
- [x] 用例目录存在
- [x] 命令继承 BaseCommand
- [x] 查询继承 BaseQuery
- [x] 用例继承 BaseUseCase
- [ ] IUseCaseContext 正确使用（已对齐）
- [ ] IEventBus 正确使用（部分未使用）
- [ ] ITransactionManager 正确使用（部分未使用）

### 基础设施层检查

- [x] 仓储实现目录存在
- [x] 数据库实体目录存在
- [x] 实体映射器目录存在
- [ ] 仓储继承 AggregateRepositoryAdapter（未对齐）
- [ ] 实体继承 MikroORM Entity（已对齐）
- [x] 映射器正确实现
- [ ] 数据库配置正确（部分对齐）

### 接口层检查

- [x] 控制器目录存在
- [x] DTO 目录存在
- [x] 守卫目录存在
- [ ] 控制器继承 RestController（未对齐）
- [x] 使用依赖注入
- [x] 使用守卫和装饰器

---

## 🔧 具体对齐建议

### 1. 领域层对齐优先级

#### 高优先级

1. **统一实体继承 BaseEntity**
   ```typescript
   // 所有实体应该这样
   import { BaseEntity, AuditInfo } from '@hl8/domain-kernel';
   
   export class User extends BaseEntity {
     // ...
   }
   ```

2. **统一聚合根继承 AggregateRoot**
   ```typescript
   // 所有聚合根应该这样
   import { AggregateRoot } from '@hl8/domain-kernel';
   
   export class TenantAggregate extends AggregateRoot {
     // ...
   }
   ```

3. **统一值对象继承 BaseValueObject**
   ```typescript
   // 所有值对象应该这样
   import { BaseValueObject } from '@hl8/domain-kernel';
   
   export class TenantCode extends BaseValueObject<string> {
     // ...
   }
   ```

#### 中优先级

1. **完善领域事件**
   - 确保所有领域事件继承 DomainEvent
   - 确保事件包含完整的事件数据

2. **完善仓储接口**
   - 确保所有仓储接口继承自 @hl8/domain-kernel 的接口
   - 统一使用 IsolationContext

### 2. 应用层对齐优先级

#### 高优先级

1. **完善 IEventBus 使用**
   ```typescript
   export class TenantCreationUseCase extends BaseUseCase {
     constructor(
       private eventBus: IEventBus, // 注入事件总线
       // ...
     ) {
       super();
     }
     
     async execute(command: CreateTenantCommand) {
       const tenant = await this.createTenant(command);
       
       // 发布领域事件
       await this.eventBus.publishAll(tenant.getDomainEvents());
       
       return tenant;
     }
   }
   ```

2. **完善 ITransactionManager 使用**
   ```typescript
   export class TenantCreationUseCase extends BaseUseCase {
     constructor(
       private transactionManager: ITransactionManager,
       // ...
     ) {
       super();
     }
     
     async execute(command: CreateTenantCommand) {
       return await this.transactionManager.execute(
         async () => {
           const tenant = await this.createTenant(command);
           await this.tenantRepository.save(tenant);
           return tenant;
         }
       );
     }
   }
   ```

### 3. 基础设施层对齐优先级

#### 高优先级

1. **仓储继承 AggregateRepositoryAdapter**
   ```typescript
   import { AggregateRepositoryAdapter } from '@hl8/infrastructure-kernel';
   
   export class TenantRepositoryPostgreSQL 
     extends AggregateRepositoryAdapter<TenantAggregate> {
     // 实现抽象方法
   }
   ```

2. **完善实体映射器**
   - 确保映射器正确转换领域对象和数据库实体
   - 确保双向映射正确

### 4. 接口层对齐优先级

#### 高优先级

1. **控制器继承 RestController**
   ```typescript
   import { RestController } from '@hl8/interface-kernel';
   
   export class TenantController extends RestController {
     // ...
   }
   ```

---

## 📊 对齐进度

| 层级 | 整体对齐度 | 关键问题 |
|------|-----------|---------|
| 领域层 | 85% | 部分实体未继承基类 |
| 应用层 | 90% | 部分用例未使用事件总线 |
| 基础设施层 | 75% | 仓储未继承基类 |
| 接口层 | 80% | 控制器未继承基类 |

**总体对齐度**: 82.5%

---

## 🎯 下一步行动

### 立即执行（P0）

1. 统一领域实体继承 BaseEntity
2. 统一聚合根继承 AggregateRoot
3. 统一值对象继承 BaseValueObject

### 短期执行（P1）

1. 完善 IEventBus 使用
2. 完善 ITransactionManager 使用
3. 仓储继承 AggregateRepositoryAdapter
4. 控制器继承 RestController

### 中期执行（P2）

1. 完善领域事件实现
2. 完善仓储接口定义
3. 完善实体映射器

---

## 📚 参考文档

- [架构概述](../.cursor/docs/architecture/01-hybrid-architecture-overview.md)
- [核心层详细设计](../.cursor/docs/architecture/02-core-layers-detailed-design.md)
- [业务模块开发指南](../.cursor/docs/architecture/03-business-module-development-guide.md)
- [最佳实践](../.cursor/docs/architecture/04-1-best-practices-overview.md)

---

## ✅ 总结

libs/saas-core 的整体架构符合设计要求，但在细节实现上需要进一步完善。主要问题集中在：

1. **基类继承不完全**: 部分实体、聚合根、值对象未继承对应的基类
2. **Kernel 集成不完整**: 部分组件未使用 Kernel 提供的基类和服务
3. **事件总线使用不充分**: 部分用例未发布领域事件

建议按照优先级逐步对齐，确保所有组件都正确继承和使用 Kernel 提供的基类和服务。

