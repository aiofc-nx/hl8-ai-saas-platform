# Quick Start Guide: libs/saas-core

> **日期**: 2025-01-27  
> **版本**: 1.0.0  
> **目的**: 快速开始使用 libs/saas-core 模块

---

## 📋 概述

本指南将帮助您快速了解如何使用 `libs/saas-core` 模块的核心功能。

---

## 🚀 安装

### 1. 依赖要求

```bash
# Node.js 20+
node --version

# pnpm 8+
pnpm --version
```

### 2. 安装依赖

```bash
# 在项目根目录
pnpm install
```

---

## 📦 模块结构

```
libs/saas-core/
├── src/
│   ├── domain/          # 领域层
│   ├── application/     # 应用层
│   ├── infrastructure/  # 基础设施层
│   └── interface/       # 接口层
└── tests/              # 测试
```

---

## 🎯 核心概念

### 1. 多租户架构

libs/saas-core 支持 5 级数据隔离：

- **Platform（平台级）**: 平台管理员数据
- **Tenant（租户级）**: 租户级数据
- **Organization（组织级）**: 组织级数据
- **Department（部门级）**: 部门级数据
- **User（用户级）**: 用户级数据

### 2. 领域驱动设计（DDD）

- **聚合根（Aggregate Root）**: 管理业务一致性
- **实体（Entity）**: 有标识的业务对象
- **值对象（Value Object）**: 无标识的不可变对象
- **领域事件（Domain Event）**: 业务事件

### 3. CQRS 模式

- **命令（Command）**: 改变系统状态
- **查询（Query）**: 只读操作
- **用例（Use Case）**: 业务流程执行

---

## 💻 使用示例

### 1. 创建租户

```typescript
import { CreateTenantCommand } from "@hl8/saas-core/application";
import { TenantCode, TenantName, TenantType } from "@hl8/saas-core/domain";
import { TenantCreationUseCase } from "@hl8/saas-core/application";

// 1. 创建命令
const command = new CreateTenantCommand(
  new TenantCode("tenant_001"),
  new TenantName("示例租户"),
  new TenantType(TenantTypeEnum.ENTERPRISE),
  "租户描述",
  "user_001",
);

// 2. 执行用例
const useCase = new TenantCreationUseCase(
  tenantRepository,
  eventBus,
  transactionManager,
);

const tenantAggregate = await useCase.execute(command, context);
```

### 2. 查询租户

```typescript
import { GetTenantQuery } from "@hl8/saas-core/application";
import { TenantId } from "@hl8/domain-kernel";

// 1. 创建查询
const query = new GetTenantQuery(TenantId.create("tenant_id"), "user_001");

// 2. 执行查询
const tenant = await tenantQueryHandler.execute(query);
```

### 3. 更新租户

```typescript
import { UpdateTenantCommand } from "@hl8/saas-core/application";

// 1. 创建命令
const command = new UpdateTenantCommand(
  TenantId.create("tenant_id"),
  new TenantName("新名称"),
  undefined, // 不更新类型
  "新描述",
);

// 2. 执行用例
await updateUseCase.execute(command, context);
```

### 4. 发布领域事件

```typescript
// 用例会自动发布领域事件
const tenantAggregate = await createUseCase.execute(command, context);

// 事件会自动发布到 IEventBus
// 例如：TenantCreatedEvent
```

---

## 🔧 配置

### 1. 数据库配置

```typescript
// config/database.ts
export default {
  postgresql: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || "saas_db",
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
  },
  mongodb: {
    // MongoDB 配置（可选）
  },
};
```

### 2. 隔离配置

```typescript
// config/isolation.ts
export default {
  defaultStrategy: "ROW_LEVEL_SECURITY",
  database: "postgresql", // 默认数据库
  supportMongoDB: true, // 是否支持 MongoDB
};
```

---

## 🧪 测试

### 单元测试

```bash
# 运行单元测试
pnpm test libs/saas-core

# 运行特定测试文件
pnpm test libs/saas-core/src/domain/aggregates/tenant.aggregate.spec.ts
```

### 集成测试

```bash
# 运行集成测试
pnpm test:integration libs/saas-core
```

---

## 📚 API 使用

### 1. REST API

```bash
# 创建租户
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "code": "tenant_001",
    "name": "示例租户",
    "type": "ENTERPRISE",
    "description": "租户描述"
  }'

# 获取租户
curl -X GET http://localhost:3000/api/tenants/tenant_id \
  -H "Authorization: Bearer <token>"
```

---

## 🔐 权限控制

### CASL 权限示例

```typescript
import { CaslAbilityFactory } from "@hl8/saas-core";

// 创建用户权限
const ability = await caslAbilityFactory.createForUser(
  userId,
  tenantId,
  organizationId,
  departmentId,
);

// 检查权限
if (ability.can("update", "Tenant")) {
  // 允许更新
}
```

---

## 📖 最佳实践

### 1. 使用用例而不是直接访问仓储

```typescript
// ✅ 正确
await createTenantUseCase.execute(command, context);

// ❌ 错误
await tenantRepository.save(tenant);
```

### 2. 使用领域事件

```typescript
// ✅ 正确 - 聚合自动发布事件
const tenant = TenantAggregate.create(code, name, type);

// ❌ 错误 - 手动创建事件
tenantRepository.save(tenant);
eventBus.publish(new TenantCreatedEvent(...));
```

### 3. 使用隔离上下文

```typescript
// ✅ 正确
const context = IsolationContext.createTenantLevel(platformId, tenantId);

// ❌ 错误 - 不传递上下文
await repository.findById(id);
```

---

## 📚 相关文档

- [数据模型](./data-model.md) - 完整数据模型定义
- [API 合约](./contracts/tenant-api.md) - API 接口文档
- [架构设计](../../docs/architecture/) - 架构设计文档

---

## ❓ 常见问题

### Q: 如何添加新的用例？

A: 创建新的 Use Case 类，继承 `BaseUseCase` 或 `BaseCommandUseCase`：

```typescript
export class YourUseCase extends BaseUseCase<Request, Response> {
  protected async executeUseCase(
    request: Request,
    context: IUseCaseContext,
  ): Promise<Response> {
    // 实现业务逻辑
  }
}
```

### Q: 如何处理事务？

A: 使用 `ITransactionManager`：

```typescript
await this.transactionManager.begin();
try {
  // 执行业务逻辑
  await this.transactionManager.commit();
} catch (error) {
  await this.transactionManager.rollback();
  throw error;
}
```

### Q: 如何发布领域事件？

A: 使用 `IEventBus`，用例会自动发布聚合根的事件：

```typescript
const aggregate = await this.createTenant(command);
const events = aggregate.pullEvents();
await this.eventBus.publishAll(events);
```

---

## 🎉 下一步

1. 阅读[数据模型文档](./data-model.md)
2. 查看[API 合约文档](./contracts/)
3. 探索[示例代码](../../libs/saas-core/examples/)

祝您使用愉快！ 🚀
