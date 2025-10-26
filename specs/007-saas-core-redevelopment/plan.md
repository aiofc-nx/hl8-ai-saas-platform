# Implementation Plan: SAAS Core Module Redevelopment

**Branch**: `007-saas-core-redevelopment` | **Date**: 2024-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-saas-core-redevelopment/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

SAAS Core模块重新开发，采用Clean Architecture + DDD + CQRS + ES + EDA混合架构模式。核心要求：实现实体与聚合根分离（无论简单或复杂都必须分离）、充血模型设计、多租户数据隔离、事件驱动架构、优先使用@hl8/domain-kernel核心组件。

**技术路径**：

1. 领域层：使用@hl8/domain-kernel实现实体、值对象、聚合根，严格分离聚合根与内部实体
2. 应用层：使用@hl8/application-kernel实现CQRS命令查询分离
3. 基础设施层：实现PostgreSQL/MongoDB双重数据库支持，ROW_LEVEL_SECURITY隔离策略
4. 接口层：使用@hl8/interface-kernel实现RESTful API和认证授权

**核心约束**：

- 必须实现实体与聚合根分离（MANDATORY）
- 优先使用@hl8内核组件的现有值对象
- 保持libs/saas-core现有目录结构
- 支持8层部门架构

## Technical Context

**Language/Version**: TypeScript 5.x with NodeNext module system  
**Primary Dependencies**: NestJS, @hl8/domain-kernel, @hl8/application-kernel, @hl8/infrastructure-kernel, @hl8/interface-kernel  
**Storage**: PostgreSQL (default), MongoDB (optional)  
**Testing**: Jest with 90% coverage requirement  
**Target Platform**: Node.js server-side application  
**Project Type**: Monorepo using Turborepo, libs/saas-core subproject  
**Performance Goals**: Support 1000 concurrent users without degradation  
**Constraints**:

- Entity-aggregate separation is MANDATORY for all aggregates (regardless of complexity)
- Priority: use existing @hl8/domain-kernel value objects (TenantId, OrganizationId, DepartmentId, UserId, RoleId, GenericEntityId)
- Support 8-layer department hierarchy
- Maintain existing libs/saas-core directory structure
- ROW_LEVEL_SECURITY for multi-tenant data isolation (default)
- Rich domain model (充血模型) with business logic in domain objects
- No anemic domain models allowed
  **Scale/Scope**:
- 8 distinct subdomains (Tenant, Organization, Department, User, Role, Auth, Authorization, Multi-Tenant Architecture)
- 5 isolation levels (Platform → Tenant → Organization → Department → User)
- 4 tenant types (FREE, BASIC, PROFESSIONAL, ENTERPRISE, CUSTOM)
- 8-layer department nesting support

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Architecture Compliance

- [x] **Clean Architecture**: Feature design follows four-layer architecture (Domain, Application, Infrastructure, Interface)
- [x] **DDD Compliance**: Rich domain models with business logic, no anemic domain models
- [x] **Entity-Aggregate Separation**: Aggregate roots are separated from internal entities (aggregate roots coordinate and publish events; internal entities execute operations and maintain state). **⚠️ MANDATORY**: ALL aggregates (simple or complex) MUST implement this separation
- [x] **CQRS Pattern**: Commands and queries are properly separated
- [x] **Event Sourcing**: State changes are recorded as events where applicable
- [x] **Event-Driven Architecture**: Components communicate through events for loose coupling

### Monorepo Organization

- [x] **Project Structure**: Feature follows apps/libs/packages/examples structure (libs/saas-core)
- [x] **Domain Module Independence**: Domain modules are developed as independent projects
- [x] **Service Naming**: Service modules in services directory drop "-service" suffix
- [x] **Package Management**: Uses pnpm as package manager

### Quality Assurance

- [x] **ESLint Configuration**: Extends root eslint.config.mjs
- [x] **TypeScript Configuration**: Extends monorepo root tsconfig.json
- [x] **Documentation**: Detailed design files use "XS" prefix

### Testing Architecture

- [x] **Unit Tests**: Located in same directory as source files with .spec.ts naming
- [x] **Integration Tests**: Located in **tests**/integration/ directory
- [x] **E2E Tests**: Located in **tests**/e2e/ directory
- [x] **Test Coverage**: Core business logic ≥ 80%, critical paths ≥ 90%

### Data Isolation

- [x] **Multi-level Isolation**: Supports platform/tenant/organization/department/user level isolation
- [x] **Data Classification**: Distinguishes between shared and non-shared data
- [x] **Access Rules**: All data access includes complete isolation context

### Unified Language

- [x] **Terminology**: Uses consistent domain terminology (Platform, Tenant, Organization, Department, User)
- [x] **Entity Mapping**: Technical implementation maps to business terminology

### TypeScript Standards

- [x] **NodeNext Module System**: Uses NodeNext module system for all server-side projects
- [x] **any Type Usage**: any type usage is justified and follows safety rules
- [x] **ESM Migration**: Migrated from CommonJS to NodeNext where applicable

### Error Handling

- [x] **Exception-First**: Uses exceptions for business logic, logs for monitoring
- [x] **Error Hierarchy**: Proper error handling at data/business/controller layers
- [x] **Anti-patterns Avoided**: No log-only error handling, no exception-only without logging

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
libs/saas-core/
├── src/
│   ├── domain/
│   │   ├── aggregates/          # 聚合根（协调内部实体并发布事件）
│   │   │   ├── tenant.aggregate.ts
│   │   │   ├── organization.aggregate.ts
│   │   │   └── department.aggregate.ts
│   │   ├── entities/            # 内部实体（执行业务操作和维护状态）
│   │   │   ├── tenant-entity.ts
│   │   │   ├── organization-entity.ts
│   │   │   └── department-entity.ts
│   │   ├── value-objects/       # 值对象（使用@hl8/domain-kernel优先）
│   │   ├── domain-services/     # 领域服务
│   │   └── events/              # 领域事件
│   ├── application/
│   │   ├── commands/            # 命令
│   │   ├── queries/             # 查询
│   │   └── use-cases/           # 用例
│   ├── infrastructure/
│   │   ├── repositories/
│   │   │   ├── postgresql/
│   │   │   └── mongodb/
│   │   ├── casl/                # 权限规则
│   │   ├── entities/            # 基础设施层实体
│   │   ├── mappers/             # 映射器
│   │   │   ├── postgresql/      # PostgreSQL 映射器
│   │   │   └── mongodb/         # MongoDB 映射器
│   │   ├── services/            # 基础设施服务
│   │   │   ├── cqrs/            # CQRS 服务
│   │   │   ├── isolation/       # 隔离服务
│   │   │   ├── performance/     # 性能服务
│   │   │   ├── database/        # 数据库服务
│   │   │   ├── cache/           # 缓存服务
│   │   │   └── error-handling/  # 错误处理服务
│   │   ├── adapters/            # 适配器
│   │   ├── kernel/              # 内核适配
│   │   ├── event-sourcing/      # 事件溯源
│   │   ├── interfaces/          # 基础设施接口
│   │   ├── types/               # 类型定义
│   │   └── utils/               # 工具类
│   └── interface/
│       ├── controllers/         # RESTful控制器
│       ├── dto/                 # 数据传输对象
│       └── guards/              # 认证授权守卫
├── tests/
│   ├── integration/             # 集成测试
│   └── e2e/                     # 端到端测试
└── *.spec.ts                    # 单元测试（与源文件同目录）

libs/domain-kernel/              # @hl8/domain-kernel（内核组件）
libs/application-kernel/         # @hl8/application-kernel
libs/infrastructure-kernel/      # @hl8/infrastructure-kernel
libs/interface-kernel/           # @hl8/interface-kernel
```

**Structure Decision**:

- 采用monorepo结构，libs/saas-core为核心业务模块
- Clean Architecture四层架构：domain → application → infrastructure → interface
- 实体与聚合根分离：aggregates/包含聚合根，entities/包含内部实体
- 优先使用@hl8内核组件提供的基类和值对象
- 保持现有libs/saas-core目录结构不变
- 支持PostgreSQL和MongoDB双重数据库

## Complexity Tracking

_No violations: All Constitution Check items passed with proper architectural decisions._

**Key Architectural Decisions**:

1. **Entity-Aggregate Separation (MANDATORY)**: All aggregates (simple or complex) must separate aggregate roots from internal entities for future-proofing and consistency
2. **Priority on @hl8 Kernel Components**: Reuse existing value objects and base classes from @hl8/domain-kernel instead of creating duplicates
3. **Dual Database Support**: PostgreSQL as default, MongoDB as optional to support flexible data storage strategies
4. **8-Layer Department Hierarchy**: Support deep organizational structures with path tracking and hierarchical queries
5. **ROW_LEVEL_SECURITY**: Default multi-tenant isolation strategy with progressive scaling options (SCHEMA_PER_TENANT, DATABASE_PER_TENANT)
