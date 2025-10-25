# SAAS Core 基础设施层清理报告

**日期**: 2024-12-19  
**清理范围**: `libs/saas-core/src/infrastructure`

## 清理概述

本次清理遵循 Clean Architecture + DDD 原则，识别基础设施层中不属于本层的目录和代码，确保基础设施层保持纯净并专注于技术实现细节。

## 基础设施层的职责

基础设施层应该包含：

- ✅ 数据库连接和ORM配置
- ✅ 缓存服务实现
- ✅ 仓储实现
- ✅ 外部服务集成
- ✅ 配置文件管理
- ✅ 技术基础设施组件

基础设施层不应包含：

- ❌ 业务逻辑（应位于领域层）
- ❌ 应用用例（应位于应用层）
- ❌ API控制器（应位于接口层）
- ❌ 命令和查询定义（应位于应用层）
- ❌ DTO定义（应位于应用层或接口层）

## 已识别的空目录（15个）

以下目录为空且不属于基础设施层职责范围，应该删除：

### 应用层目录（应位于 application/）

1. **`commands/`** - 命令定义（应用层）
2. **`queries/`** - 查询定义（应用层）
3. **`use-cases/`** - 用例实现（应用层）
4. **`handlers/`** - 处理器（应用层）

### 接口层目录（应位于 interface/）

5. **`controllers/`** - 控制器（接口层）
6. **`guards/`** - 守卫（接口层）
7. **`dto/`** - 数据传输对象（接口层）

### 领域层目录（应位于 domain/）

8. **`aggregates/`** - 聚合根（领域层）
9. **`entities/`** - 实体（领域层）
10. **`value-objects/`** - 值对象（领域层）
11. **`events/`** - 领域事件（领域层）
12. **`abilities/`** - 能力定义（可能属于领域层或接口层）

### 其他不应在基础设施层的目录

13. **`persistence/`** - 持久化（可能是重复的，数据库目录已存在）
14. **`casl/`** - CASL配置（可能在接口层更合适）

## 基础设施层中位置合适的目录（6个）

### ✅ `repositories/` - 仓储实现

- **位置**: `libs/saas-core/src/infrastructure/repositories/`
- **文件**: `tenant.repository.impl.ts`, `tenant.repository.adapter.ts`
- **状态**: ✅ 正确位置
- **说明**: 仓储实现是基础设施层的核心职责

### ✅ `database/` - 数据库配置

- **位置**: `libs/saas-core/src/infrastructure/database/`
- **文件**: `mikro-orm.config.ts`, `database.module.ts`
- **状态**: ✅ 正确位置
- **说明**: 数据库配置和连接管理是基础设施层职责

### ✅ `cache/` - 缓存服务

- **位置**: `libs/saas-core/src/infrastructure/cache/`
- **文件**: `redis.config.ts`, `cache.service.adapter.ts`
- **状态**: ✅ 正确位置
- **说明**: 缓存服务实现是基础设施层职责

### ✅ `services/` - 基础设施服务

- **位置**: `libs/saas-core/src/infrastructure/services/`
- **文件**:
  - `domain-event-bus.service.ts`
  - `domain-cache-manager.service.ts`
  - `domain-query-optimizer.service.ts`
  - `domain-performance-monitor.service.ts`
  - `domain-performance.event.ts`
- **状态**: ✅ 正确位置
- **说明**: 这些是技术基础设施组件，之前从领域层移动过来

### ⚠️ `casl/` - CASL配置（需要评估）

- **位置**: `libs/saas-core/src/infrastructure/casl/`
- **文件**: `casl-ability.factory.ts`, `casl.config.ts`
- **状态**: ⚠️ 需要评估
- **说明**: CASL能力工厂创建领域实体，可能更适合在领域层

## 需要重新评估的文件

### 1. `casl/casl-ability.factory.ts`

**当前位置**: `libs/saas-core/src/infrastructure/casl/`

**问题**:

- 这个工厂创建领域实体 `CaslAbility`
- 创建业务对象应该属于领域层或应用层

**建议**:

- 移动到 `libs/saas-core/src/domain/factories/` 或
- 移动到 `libs/saas-core/src/application/factories/`

**理由**:

- 工厂模式用于创建领域对象，应该更接近业务逻辑
- 基础设施层应该关注技术实现，而非业务对象创建

### 2. `services/domain-*.service.ts` 文件

**当前位置**: `libs/saas-core/src/infrastructure/services/`

**状态**: ✅ 这些文件之前从领域层移动过来，位置正确

**说明**:

- 这些是技术基础设施组件（事件总线、缓存管理器、查询优化器、性能监控器）
- 属于基础设施层是合理的

## 清理后的基础设施层结构

### 保留的目录和文件

```
infrastructure/
├── repositories/           # 仓储实现
│   ├── tenant.repository.impl.ts
│   ├── tenant.repository.adapter.ts
│   └── index.ts
├── database/               # 数据库配置
│   ├── mikro-orm.config.ts
│   ├── database.module.ts
│   ├── migrations/
│   ├── seeders/
│   └── index.ts
├── cache/                  # 缓存服务
│   ├── redis.config.ts
│   ├── cache.service.adapter.ts
│   ├── cache.module.ts
│   └── index.ts
└── services/               # 基础设施服务
    ├── domain-event-bus.service.ts
    ├── domain-cache-manager.service.ts
    ├── domain-query-optimizer.service.ts
    ├── domain-performance-monitor.service.ts
    ├── domain-performance.event.ts
    └── index.ts
```

### 需要删除的空目录

```
infrastructure/
├── abilities/              # 删除（空目录）
├── aggregates/             # 删除（空目录）
├── commands/               # 删除（空目录）
├── controllers/            # 删除（空目录）
├── dto/                    # 删除（空目录）
├── entities/               # 删除（空目录）
├── events/                 # 删除（空目录）
├── guards/                 # 删除（空目录）
├── handlers/               # 删除（空目录）
├── persistence/            # 删除（空目录）
├── queries/                # 删除（空目录）
├── use-cases/              # 删除（空目录）
└── value-objects/          # 删除（空目录）
```

### 需要评估的目录

```
infrastructure/
├── casl/                   # 需要评估
│   ├── casl-ability.factory.ts   # 可能应该移到领域层
│   └── casl.config.ts            # 保留在基础设施层
```

## 清理原则

### 基础设施层职责

基础设施层应仅包含：

- **数据库实现**: ORM配置、连接管理、迁移脚本
- **仓储实现**: 实现领域层定义的仓储接口
- **缓存实现**: Redis或其他缓存系统集成
- **外部服务**: 第三方服务集成
- **配置管理**: 环境配置、技术配置
- **技术组件**: 事件总线、性能监控等技术基础设施

### 不属于基础设施层的内容

以下内容不应出现在基础设施层：

- ❌ 业务逻辑
- ❌ 领域实体和聚合
- ❌ 值对象定义
- ❌ 领域事件定义
- ❌ 用例实现
- ❌ 命令和查询定义
- ❌ API控制器
- ❌ DTO定义
- ❌ 守卫实现
- ❌ 能力定义

## 清理建议

### 1. 立即清理

```bash
# 删除所有空目录
rm -rf libs/saas-core/src/infrastructure/abilities
rm -rf libs/saas-core/src/infrastructure/aggregates
rm -rf libs/saas-core/src/infrastructure/commands
rm -rf libs/saas-core/src/infrastructure/controllers
rm -rf libs/saas-core/src/infrastructure/dto
rm -rf libs/saas-core/src/infrastructure/entities
rm -rf libs/saas-core/src/infrastructure/events
rm -rf libs/saas-core/src/infrastructure/guards
rm -rf libs/saas-core/src/infrastructure/handlers
rm -rf libs/saas-core/src/infrastructure/persistence
rm -rf libs/saas-core/src/infrastructure/queries
rm -rf libs/saas-core/src/infrastructure/use-cases
rm -rf libs/saas-core/src/infrastructure/value-objects
```

### 2. 评估并移动

```bash
# CASL能力工厂应该移到领域层或应用层
# 创建领域层工厂目录
mkdir -p libs/saas-core/src/domain/factories

# 移动文件
mv libs/saas-core/src/infrastructure/casl/casl-ability.factory.ts \
   libs/saas-core/src/domain/factories/

# CASL配置保留在基础设施层
```

### 3. 更新导入

- 更新所有引用 `casl-ability.factory.ts` 的文件
- 更新基础设施层的 `index.ts` 导出文件

## 下一步建议

1. **执行清理**: 删除所有空目录
2. **评估CASL**: 决定CASL能力工厂的最佳位置
3. **更新导出**: 更新各层的 `index.ts` 文件
4. **运行测试**: 确保所有测试通过
5. **更新文档**: 更新架构文档反映新的目录结构

## 参考

- Clean Architecture: <https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html>
- Domain-Driven Design: <https://www.domainlanguage.com/ddd/>
- DDD 分层架构指南: `.cursor/docs/architecture/ddd-layered-architecture.md`
