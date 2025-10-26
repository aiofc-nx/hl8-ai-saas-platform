# HL8 SAAS平台混合架构设计文档

> **版本**: 1.0.0 | **创建日期**: 2025-01-27 | **模块**: 架构设计文档

---

## 📋 文档概述

本系列文档详细阐述了HL8 SAAS平台的混合架构设计，为业务模块开发提供完整的指导。该架构集成了Clean Architecture + DDD + CQRS + 事件溯源(ES) + 事件驱动架构(EDA)等多种架构模式，为SAAS平台提供高可扩展性、高性能、高可靠性和高可维护性。

## 📚 文档结构

### 1. [混合架构设计概述](./01-hybrid-architecture-overview.md)

**核心内容**:

- 架构概述和目标
- 核心设计原则
- 混合架构模式
- 技术栈与基础设施
- 核心层设计

**适用对象**: 架构师、技术负责人、开发团队

### 2. [核心层详细设计](./02-core-layers-detailed-design.md)

**核心内容**:

- 领域层详细设计
- 应用层详细设计
- 基础设施层详细设计
- 接口层详细设计
- 层间交互设计
- 核心组件设计

**适用对象**: 开发人员、架构师

### 3. [业务模块开发指南](./03-business-module-development-guide.md)

**核心内容**:

- 业务模块开发概述
- 开发环境准备
- 业务模块结构
- 开发流程
- 代码实现指南
- 测试策略
- 部署和集成
- 最佳实践

**适用对象**: 开发人员、项目经理

### 4. [最佳实践和示例](./04-1-best-practices-overview.md)

**核心内容**:

- 架构设计最佳实践
- 代码质量最佳实践
- 性能优化最佳实践
- 安全最佳实践
- 测试最佳实践

**适用对象**: 开发人员、代码审查员

### 5. [代码示例](./04-2-code-examples.md)

**核心内容**:

- 领域层代码示例
- 应用层代码示例
- 基础设施层代码示例
- 接口层代码示例
- 完整业务模块示例

**适用对象**: 开发人员、新团队成员

## ⚠️ 重要提示

### 业务模块开发必须基于 kernel 层

业务模块的开发**必须基于** kernel 层提供的通用基础组件，包括：

- **@hl8/domain-kernel** - 领域层核心
- **@hl8/application-kernel** - 应用层核心
- **@hl8/infrastructure-kernel** - 基础设施层核心
- **@hl8/interface-kernel** - 接口层核心

以及其他基础库：

- **@hl8/exceptions** - 异常处理
- **@hl8/caching** - 缓存管理
- **@hl8/config** - 配置管理
- **@hl8/nestjs-fastify** - Fastify 集成和 logging

因此，在开发业务模块时，**必须优先使用**这些 kernel 和基础库提供的组件，而不是重新定义：

### 1. Domain-Kernel 组件

**必须优先使用** `@hl8/domain-kernel` 提供的以下组件：

#### 基类和接口

```typescript
import { BaseEntity, AggregateRoot, BaseValueObject } from "@hl8/domain-kernel";
```

#### ID 值对象

```typescript
import {
  TenantId,
  OrganizationId,
  DepartmentId,
  UserId,
  GenericEntityId,
} from "@hl8/domain-kernel";
```

#### 数据隔离机制

```typescript
import { IsolationContext, SharingLevel } from "@hl8/domain-kernel";
```

### 2. Application-Kernel 组件

**必须优先使用** `@hl8/application-kernel` 提供的以下组件：

```typescript
import {
  BaseCommand,
  BaseQuery,
  BaseUseCase,
  CommandHandler,
  QueryHandler,
} from "@hl8/application-kernel";
```

### 3. Infrastructure-Kernel 组件

**必须优先使用** `@hl8/infrastructure-kernel` 提供的以下组件：

```typescript
import {
  IDatabaseAdapter,
  ICacheService,
  IMessageBroker,
} from "@hl8/infrastructure-kernel";
```

### 4. Interface-Kernel 组件

**必须优先使用** `@hl8/interface-kernel` 提供的以下组件：

```typescript
import {
  RestController,
  AuthenticationGuard,
  AuthorizationGuard,
} from "@hl8/interface-kernel";
```

### 5. Exceptions 组件

**必须优先使用** `@hl8/exceptions` 提供的异常类：

```typescript
import {
  DomainException,
  BusinessException,
  ValidationException,
  NotFoundException,
} from "@hl8/exceptions";
```

### 6. Caching 组件

**必须优先使用** `@hl8/caching` 提供的缓存服务：

```typescript
import { ICacheService } from "@hl8/caching";
```

### 7. Config 组件

**必须优先使用** `@hl8/config` 提供的配置管理：

```typescript
import { ConfigService } from "@hl8/config";
```

### 8. NestJS-Fastify 组件（Logging）

**必须优先使用** `@hl8/nestjs-fastify` 提供的 logging 组件：

```typescript
import { Logger } from "@hl8/nestjs-fastify";
```

**为什么这样做？**

- ✅ **统一架构** - 所有业务模块基于相同的架构
- ✅ **保证一致性** - 使用相同的基类和接口，确保行为一致
- ✅ **减少重复** - 避免在每个模块中重复定义相同的类
- ✅ **简化维护** - 只需在一个地方维护和更新
- ✅ **类型安全** - 统一的类型定义确保类型安全
- ✅ **多租户支持** - 正确的数据隔离机制

详见：[业务模块开发指南 - 优先使用 kernel 组件](./03-business-module-development-guide.md#33-优先使用-kernel-组件)

---

## 🏗️ 架构特点

### 混合架构模式

HL8 SAAS平台采用以下架构模式的有机结合：

```
Clean Architecture (清洁架构)
    ↓
DDD (领域驱动设计)
    ↓
CQRS (命令查询职责分离)
    ↓
ES (事件溯源)
    ↓
EDA (事件驱动架构)
```

### 核心层设计

```
┌─────────────────────────────────────────────────────────────────┐
│                    HL8 SAAS Platform                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Business      │  │   Business      │  │   Business      │  │
│  │   Module A      │  │   Module B      │  │   Module C      │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                    Core Kernel Layers                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐  │
│  │  Interface  │  │Application │  │Infrastructure│  │ Domain  │  │
│  │   Kernel    │  │   Kernel    │  │   Kernel     │  │ Kernel  │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                NestJS Framework Extensions                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐  │
│  │   Config    │  │   Logging   │  │   Caching   │  │Database │  │
│  │   Module    │  │   Module    │  │   Module    │  │ Module  │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐  │
│  │  Messaging  │  │  Isolation  │  │  Exception  │  │Fastify  │  │
│  │   Module    │  │   Module    │  │   Module    │  │ Module  │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                    NestJS + Fastify                            │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 设计原则

### 1. 中文优先原则

**所有代码注释、文档、错误消息和用户界面必须使用中文**

- 代码注释必须使用中文，遵循TSDoc规范
- 技术文档必须使用中文编写
- 用户界面文本必须使用中文
- 错误消息和日志必须使用中文

### 2. 代码即文档原则

**代码注释必须清晰、准确、完整地描述业务规则与逻辑**

- 遵循TSDoc注释规范
- 所有公共API、类、方法、接口、枚举都必须添加完整的TSDoc注释
- 注释必须包含：@description、@param、@returns、@throws、@example标记
- 业务规则详细描述
- 代码变更时必须同步更新注释

### 3. 架构原则

**项目采用混合架构模式：Clean Architecture + DDD + CQRS + 事件溯源(ES) + 事件驱动架构(EDA)**

#### 3.1 Clean Architecture

- **四层架构**：领域层、应用层、基础设施层、接口层
- **依赖关系**：从外向内，内层不依赖外层
- **核心业务逻辑**：独立于框架和基础设施
- **用例要求**：用例（Use Cases）必须在文档和设计中明确提及

#### 3.2 领域驱动设计(DDD)

**充血模型（Rich Domain Model）要求**：

- 领域对象必须包含业务逻辑和数据，禁止使用贫血模型
- 实体和聚合根必须封装业务行为，而非仅作为数据容器
- 业务规则必须在领域对象内部实现，而非在服务层
- 领域对象通过方法暴露行为，而非直接暴露属性
- 对象状态变更必须通过业务方法，确保业务规则的执行

#### 3.3 CQRS模式

- 命令（Command）和查询（Query）必须分离
- 命令处理器负责业务逻辑执行
- 查询处理器负责数据读取
- 支持读写分离和性能优化

#### 3.4 事件溯源(ES)

- 聚合状态通过事件流重建
- 支持事件版本管理和迁移
- 提供审计跟踪和状态回放能力

#### 3.5 事件驱动架构(EDA)

- 领域事件驱动业务流程
- 支持异步处理和系统解耦
- 提供事件总线和消息队列支持

## 🛠️ 技术栈

### 核心技术栈

- **Web框架**: NestJS + Fastify
- **数据库**: PostgreSQL + MikroORM
- **缓存**: Redis
- **消息队列**: Kafka + RabbitMQ + Redis
- **监控**: Prometheus + Grafana
- **日志**: Pino
- **类型系统**: TypeScript

### 基础设施模块

- **@hl8/config**: 类型安全的配置管理
- **@hl8/database**: 数据库连接和事务管理
- **@hl8/caching**: Redis分布式缓存
- **@hl8/messaging**: 消息队列和事件总线
- **@hl8/nestjs-isolation**: 多租户数据隔离
- **@hl8/exceptions**: 统一异常处理
- **@hl8/nestjs-fastify**: Fastify框架扩展

## 📖 使用指南

### 新团队成员

1. **阅读架构概述**: 从[混合架构设计概述](./01-hybrid-architecture-overview.md)开始
2. **理解核心层设计**: 学习[核心层详细设计](./02-core-layers-detailed-design.md)
3. **学习开发指南**: 参考[业务模块开发指南](./03-business-module-development-guide.md)
4. **查看代码示例**: 学习[代码示例](./04-2-code-examples.md)

### 开发人员

1. **熟悉最佳实践**: 阅读[最佳实践概述](./04-1-best-practices-overview.md)
2. **参考代码示例**: 使用[代码示例](./04-2-code-examples.md)作为开发参考
3. **遵循开发指南**: 按照[业务模块开发指南](./03-business-module-development-guide.md)进行开发

### 架构师

1. **理解整体架构**: 从[混合架构设计概述](./01-hybrid-architecture-overview.md)开始
2. **深入核心层设计**: 学习[核心层详细设计](./02-core-layers-detailed-design.md)
3. **制定开发规范**: 基于[最佳实践概述](./04-1-best-practices-overview.md)制定团队规范

## 🔄 文档维护

### 更新原则

- **及时更新**: 架构变更时及时更新相关文档
- **版本控制**: 使用版本控制管理文档变更
- **团队协作**: 团队成员共同维护文档质量
- **定期审查**: 定期审查文档的准确性和完整性

### 贡献指南

1. **发现问题**: 发现文档问题及时反馈
2. **提出改进**: 提出文档改进建议
3. **提交变更**: 通过Pull Request提交文档变更
4. **代码审查**: 文档变更需要代码审查

## 📞 联系方式

如有问题或建议，请联系：

- **技术负责人**: [技术负责人邮箱]
- **架构师**: [架构师邮箱]
- **开发团队**: [开发团队邮箱]

## 📄 许可证

本文档遵循项目许可证，详见项目根目录的LICENSE文件。

---

## 📝 总结

HL8 SAAS平台混合架构设计文档为团队提供了完整的架构指导。通过遵循这些设计原则和最佳实践，可以确保：

- **高可扩展性**: 支持业务模块的快速开发和部署
- **高可维护性**: 清晰的架构层次和职责分离
- **高性能**: 基于Fastify的高性能Web框架
- **高可靠性**: 完善的异常处理和监控体系
- **多租户支持**: 内置5级数据隔离机制
- **类型安全**: 完整的TypeScript类型系统

该架构为SAAS平台提供了统一的基础设施和开发模式，支持快速、高质量的软件开发。
