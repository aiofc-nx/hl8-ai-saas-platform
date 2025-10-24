# SAAS Core Module Quick Start Guide

**Date**: 2024-12-19  
**Feature**: SAAS Core Module Specification Documentation  
**Phase**: Phase 1 - Design and Contracts

## 概述

本快速入门指南将帮助您快速理解和使用SAAS Core模块。该模块是HL8 SAAS平台的核心组件，提供多租户架构、组织管理、部门管理和用户管理功能。

## 架构概述

SAAS Core模块采用混合架构模式，结合了以下设计模式：

- **Clean Architecture**: 四层架构（领域层、应用层、基础设施层、接口层）
- **DDD (Domain-Driven Design)**: 领域驱动设计，丰富的领域模型
- **CQRS**: 命令查询职责分离
- **Event Sourcing**: 事件溯源，完整的状态变更记录
- **Event-Driven Architecture**: 事件驱动架构，松耦合的组件通信

## 核心概念

### 1. 多租户架构

SAAS Core模块支持5层数据隔离：

1. **平台级隔离**: 平台数据与租户数据完全隔离
2. **租户级隔离**: 不同租户的数据完全隔离
3. **组织级隔离**: 同一租户内不同组织的非共享数据相互隔离
4. **部门级隔离**: 同一组织内不同部门的非共享数据相互隔离
5. **用户级隔离**: 用户私有数据仅该用户可访问

### 2. 租户类型

支持5种租户类型：

- **FREE**: 免费版，基础功能
- **BASIC**: 基础版，标准功能
- **PROFESSIONAL**: 专业版，高级功能
- **ENTERPRISE**: 企业版，企业级功能
- **CUSTOM**: 定制版，定制化功能

### 3. 组织类型

支持4种组织类型：

- **COMMITTEE**: 专业委员会
- **PROJECT_TEAM**: 项目团队
- **QUALITY_GROUP**: 质量小组
- **PERFORMANCE_GROUP**: 绩效小组

### 4. 部门层级

支持最多7层的部门层级结构，支持树形组织架构。

## 快速开始

### 1. 环境要求

- Node.js >= 20
- TypeScript 5.9.2
- PostgreSQL 14+
- Redis 6+
- pnpm 10.12.1

### 2. 安装依赖

```bash
# 安装项目依赖
pnpm install

# 安装SAAS Core模块依赖
cd libs/saas-core
pnpm install
```

### 3. 配置环境

创建环境配置文件：

```bash
# 复制环境配置模板
cp .env.example .env

# 编辑环境配置
nano .env
```

环境配置示例：

```env
# 数据库配置
DATABASE_URL=postgresql://username:password@localhost:5432/hl8_saas
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=hl8_saas
DATABASE_USERNAME=username
DATABASE_PASSWORD=password

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# 应用配置
APP_PORT=3000
APP_ENV=development
APP_NAME=HL8 SAAS Platform

# JWT配置
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h

# 租户配置
DEFAULT_TENANT_LIMIT=1000
MAX_TENANT_USERS=10000
```

### 4. 数据库迁移

```bash
# 运行数据库迁移
pnpm run migration:run

# 生成数据库迁移文件
pnpm run migration:generate --name=initial-schema
```

### 5. 启动应用

```bash
# 开发模式启动
pnpm run dev

# 生产模式启动
pnpm run start:prod
```

## API使用示例

### 1. 创建租户

```bash
curl -X POST http://localhost:3000/v1/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "code": "acme-corp",
    "name": "Acme Corporation",
    "type": "ENTERPRISE",
    "description": "Acme Corporation tenant"
  }'
```

### 2. 获取租户列表

```bash
curl -X GET http://localhost:3000/v1/tenants \
  -H "Authorization: Bearer your-jwt-token" \
  -H "X-Tenant-Id: your-tenant-id"
```

### 3. 创建组织

```bash
curl -X POST http://localhost:3000/v1/tenants/{tenantId}/organizations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "X-Tenant-Id: your-tenant-id" \
  -d '{
    "name": "技术委员会",
    "type": "COMMITTEE",
    "description": "技术委员会组织"
  }'
```

### 4. 创建部门

```bash
curl -X POST http://localhost:3000/v1/tenants/{tenantId}/organizations/{organizationId}/departments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "X-Tenant-Id: your-tenant-id" \
  -d '{
    "name": "前端开发部",
    "code": "frontend-dev",
    "description": "前端开发部门"
  }'
```

## 数据隔离示例

### 1. 租户级隔离

```typescript
// 获取租户数据，自动应用租户级隔离
const tenants = await tenantRepository.findByTenantId(tenantId);

// 创建租户数据，自动设置租户ID
const newTenant = new Tenant({
  code: "new-tenant",
  name: "New Tenant",
  type: TenantType.BASIC,
  tenantId: currentTenantId,
});
```

### 2. 组织级隔离

```typescript
// 获取组织数据，自动应用组织级隔离
const organizations =
  await organizationRepository.findByOrganizationId(organizationId);

// 创建组织数据，自动设置组织ID
const newOrganization = new Organization({
  name: "New Organization",
  type: OrganizationType.COMMITTEE,
  tenantId: currentTenantId,
  organizationId: currentOrganizationId,
});
```

### 3. 部门级隔离

```typescript
// 获取部门数据，自动应用部门级隔离
const departments = await departmentRepository.findByDepartmentId(departmentId);

// 创建部门数据，自动设置部门ID
const newDepartment = new Department({
  name: "New Department",
  code: "new-dept",
  tenantId: currentTenantId,
  organizationId: currentOrganizationId,
  departmentId: currentDepartmentId,
});
```

## 事件驱动架构示例

### 1. 发布领域事件

```typescript
// 在租户聚合中发布事件
export class TenantAggregate extends AggregateRoot {
  createTenant(command: CreateTenantCommand): void {
    // 创建租户逻辑
    const tenant = new Tenant(command);
    this.addDomainEvent(new TenantCreatedEvent(tenant));
  }
}
```

### 2. 处理领域事件

```typescript
// 事件处理器
@EventHandler(TenantCreatedEvent)
export class TenantCreatedEventHandler {
  async handle(event: TenantCreatedEvent): Promise<void> {
    // 处理租户创建事件
    await this.sendWelcomeEmail(event.tenant);
    await this.createDefaultOrganization(event.tenant);
  }
}
```

## 测试示例

### 1. 单元测试

```typescript
describe("TenantAggregate", () => {
  it("应该能够创建租户", () => {
    const command = new CreateTenantCommand({
      code: "test-tenant",
      name: "Test Tenant",
      type: TenantType.BASIC,
    });

    const aggregate = new TenantAggregate();
    aggregate.createTenant(command);

    expect(aggregate.getUncommittedEvents()).toHaveLength(1);
    expect(aggregate.getUncommittedEvents()[0]).toBeInstanceOf(
      TenantCreatedEvent,
    );
  });
});
```

### 2. 集成测试

```typescript
describe("Tenant Management Integration", () => {
  it("应该能够创建和查询租户", async () => {
    // 创建租户
    const tenant = await tenantService.createTenant({
      code: "integration-test",
      name: "Integration Test Tenant",
      type: TenantType.BASIC,
    });

    // 查询租户
    const foundTenant = await tenantService.getTenant(tenant.id);
    expect(foundTenant).toBeDefined();
    expect(foundTenant.code).toBe("integration-test");
  });
});
```

## 最佳实践

### 1. 领域模型设计

- 使用丰富的领域模型，避免贫血模型
- 将业务逻辑封装在领域对象内部
- 使用值对象表示无标识的概念
- 使用聚合根管理一致性边界

### 2. 数据隔离

- 所有数据访问必须携带完整的隔离上下文
- 使用数据库行级安全策略（RLS）实现隔离
- 为隔离字段创建复合索引以优化查询性能

### 3. 事件处理

- 使用领域事件记录重要的业务事实
- 实现事件溯源以支持状态重建
- 使用事件驱动架构实现组件解耦

### 4. 错误处理

- 使用异常处理业务逻辑错误
- 使用日志记录技术错误和监控信息
- 实现适当的错误恢复机制

## 故障排除

### 1. 常见问题

**问题**: 租户创建失败
**解决方案**: 检查租户代码是否唯一，验证输入参数格式

**问题**: 数据隔离不生效
**解决方案**: 确保请求头包含正确的租户ID，检查数据库RLS策略

**问题**: 事件处理失败
**解决方案**: 检查事件处理器注册，验证事件序列化/反序列化

### 2. 调试技巧

- 启用详细日志记录
- 使用数据库查询日志分析性能问题
- 使用事件存储查看事件历史
- 使用API文档测试端点

## 下一步

1. 阅读完整的API文档：`contracts/saas-core-api.yaml`
2. 查看数据模型设计：`data-model.md`
3. 了解架构设计：`research.md`
4. 开始实现具体的业务功能

## 支持

如果您在使用过程中遇到问题，请：

1. 查看本文档的故障排除部分
2. 参考API文档和代码示例
3. 联系开发团队获取支持

---

**注意**: 本文档基于SAAS Core模块的当前设计，随着功能的发展可能会有所更新。请定期查看最新版本。
