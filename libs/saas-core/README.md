# SAAS Core Module with CASL Permission System

## 概述

SAAS Core模块是HL8 AI SAAS平台的核心业务模块，集成了CASL（Code Access Security Library）权限系统，提供完整的多租户架构、租户生命周期管理、组织部门结构管理和权限访问控制功能。

## 架构特性

- **Clean Architecture**: 四层架构设计（领域层、应用层、基础设施层、接口层）
- **DDD**: 领域驱动设计，富领域模型
- **CQRS**: 命令查询职责分离
- **Event Sourcing**: 事件溯源，完整审计追踪
- **Event-Driven Architecture**: 事件驱动架构
- **CASL Integration**: 集成CASL权限系统，支持复杂权限管理

## 技术栈

- **Language**: TypeScript 5.9.2
- **Runtime**: Node.js >= 20
- **Framework**: NestJS
- **Database**: PostgreSQL with MikroORM
- **Cache**: Redis
- **Permission**: CASL (@casl/ability, @casl/prisma, @casl/mongoose)
- **Testing**: Jest with ts-jest

## 子领域

1. **租户管理子领域** (Tenant Management)
2. **组织管理子领域** (Organization Management)
3. **部门管理子领域** (Department Management)
4. **用户管理子领域** (User Management)
5. **角色管理子领域** (Role Management)
6. **认证子领域** (Authentication)
7. **授权子领域** (Authorization)
8. **多租户架构子领域** (Multi-Tenant Architecture)

## 数据隔离策略

支持5层数据隔离：

- **平台级隔离** (Platform Level)
- **租户级隔离** (Tenant Level)
- **组织级隔离** (Organization Level)
- **部门级隔离** (Department Level)
- **用户级隔离** (User Level)

默认使用ROW_LEVEL_SECURITY策略，支持未来扩展到SCHEMA_PER_TENANT和DATABASE_PER_TENANT。

## CASL权限系统

集成了CASL权限系统，提供：

- 基于角色的访问控制（RBAC）
- 基于属性的访问控制（ABAC）
- 多租户上下文感知的权限检查
- 高性能权限验证（<50ms）
- 类型安全的权限规则定义

## 开发指南

### 安装依赖

```bash
pnpm install
```

### 构建项目

```bash
pnpm build
```

### 开发模式

```bash
pnpm dev
```

### 运行测试

```bash
pnpm test
```

### 代码检查

```bash
pnpm lint
```

## 项目结构

```
src/
├── domain/           # 领域层
│   ├── entities/     # 实体
│   ├── value-objects/ # 值对象
│   ├── aggregates/   # 聚合根
│   ├── services/     # 领域服务
│   ├── events/       # 领域事件
│   └── repositories/ # 仓储接口
├── application/      # 应用层
│   ├── commands/     # 命令
│   ├── queries/      # 查询
│   ├── handlers/     # 处理器
│   ├── use-cases/    # 用例
│   └── abilities/    # CASL能力定义
├── infrastructure/   # 基础设施层
│   ├── repositories/ # 仓储实现
│   ├── persistence/  # 持久化实体
│   ├── events/       # 事件发布
│   └── casl/         # CASL基础设施
└── interface/        # 接口层
    ├── controllers/  # 控制器
    ├── dto/         # 数据传输对象
    └── guards/      # 守卫
```

## 许可证

MIT License
