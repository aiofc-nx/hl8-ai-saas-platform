# Kernel 对齐工作总结

**日期**: 2024-12-19  
**模块**: libs/saas-core

## 概述

本文档汇总了 `libs/saas-core` 与各 Kernel 模块的对齐工作，确保项目遵循统一的架构和设计模式。

## 核心原则

本项目各层开发必须基于对应的 Kernel 模块：

1. **领域层** → `@hl8/domain-kernel`
2. **应用层** → `@hl8/application-kernel`
3. **基础设施层** → `@hl8/infrastructure-kernel`
4. **接口层** → `@hl8/interface-kernel`（如适用）

## 已完成的工作

### 1. 领域层清理

**文档**: `DOMAIN_CLEANUP_REPORT.md`

**完成内容**:

- ✅ 清理了 11 个空目录
- ✅ 将 5 个基础设施文件移动到基础设施层
- ✅ 创建了仓储接口（遵循 DDD 和 DIP 原则）
- ✅ 将 CASL 能力工厂移动到领域层

**结构**:

```
libs/saas-core/src/domain/
├── aggregates/        # ✅ 聚合根
├── entities/          # ✅ 实体
├── events/            # ✅ 领域事件
├── value-objects/     # ✅ 值对象
├── repositories/      # ✅ 仓储接口
├── services/          # ✅ 领域服务
└── factories/         # ✅ 工厂
```

### 2. 基础设施层清理和对齐

**文档**:

- `INFRASTRUCTURE_CLEANUP_REPORT.md`
- `INFRASTRUCTURE_CLEANUP_COMPLETED.md`
- `INFRASTRUCTURE_KERNEL_ALIGNMENT.md`

**完成内容**:

- ✅ 删除了 13 个空目录
- ✅ 将 CASL 能力工厂移动到领域层
- ✅ 创建了详细的文档说明如何基于 `infrastructure-kernel` 开发

**需要创建的组件**:

- ⏳ MikroORM 实体（`infrastructure/entities/`）
- ⏳ 实体映射器（`infrastructure/mappers/`）
- ⏳ 仓储实现（继承 `AggregateRepositoryAdapter`）

**结构**:

```
libs/saas-core/src/infrastructure/
├── cache/             # ✅ 缓存服务
├── casl/              # ✅ CASL配置
├── database/          # ✅ 数据库配置
├── repositories/      # ⏳ 需要更新（继承基类）
├── services/          # ✅ 基础设施服务
├── entities/          # ⏳ 需要创建（MikroORM实体）
└── mappers/           # ⏳ 需要创建（实体映射器）
```

### 3. 应用层对齐计划

**文档**: `APPLICATION_KERNEL_ALIGNMENT.md`

**需要清理的目录**:

- ❌ `abilities/` - 能力定义
- ❌ `aggregates/` - 聚合根（应该在领域层）
- ❌ `casl/` - CASL配置
- ❌ `controllers/` - 控制器（应该在接口层）
- ❌ `dto/` - 数据传输对象（应该在接口层）
- ❌ `entities/` - 实体（应该在领域层）
- ❌ `events/` - 领域事件（应该在领域层）
- ❌ `guards/` - 守卫（应该在接口层）
- ❌ `persistence/` - 持久化（应该在基础设施层）
- ❌ `repositories/` - 仓储（应该在基础设施层）
- ❌ `services/` - 服务（大部分应该在基础设施层）

**应该保留的目录**:

- ✅ `commands/` - 命令定义
- ✅ `queries/` - 查询定义
- ✅ `handlers/` - 处理器
- ✅ `use-cases/` - 用例实现

**对齐要求**:

- ✅ 所有命令继承 `BaseCommand`
- ✅ 所有查询继承 `BaseQuery`
- ✅ 命令处理器实现 `CommandHandler` 接口
- ✅ 查询处理器实现 `QueryHandler` 接口
- ✅ 所有用例继承 `BaseUseCase`

### 4. 实体映射器说明

**文档**: `ENTITY_MAPPER_EXPLANATION.md`

**说明**:

- 实体映射器是连接领域层和基础设施层的桥梁
- 处理值对象与原始类型的转换
- 保护领域层的业务逻辑
- 必须基于 `infrastructure-kernel` 的基类

**位置**:

```
libs/saas-core/src/infrastructure/
├── entities/          # MikroORM实体（数据库）
└── mappers/           # 实体映射器
    ├── toDomain()     # 数据库实体 → 领域实体
    └── toEntity()     # 领域实体 → 数据库实体
```

## 文档索引

### 领域层

- `DOMAIN_CLEANUP_REPORT.md` - 领域层清理报告

### 基础设施层

- `INFRASTRUCTURE_CLEANUP_REPORT.md` - 基础设施层清理报告
- `INFRASTRUCTURE_CLEANUP_COMPLETED.md` - 清理完成报告
- `INFRASTRUCTURE_KERNEL_ALIGNMENT.md` - Infrastructure Kernel 对齐说明
- `ENTITY_MAPPER_EXPLANATION.md` - 实体映射器详细说明
- `MISSING_ENTITY_MAPPERS.md` - 缺少实体映射器的说明

### 应用层

- `APPLICATION_KERNEL_ALIGNMENT.md` - Application Kernel 对齐说明

## 对齐检查清单

### 领域层

- [x] 清理空目录和不属于领域层的文件
- [x] 创建仓储接口
- [x] 创建领域工厂
- [x] 所有实体和值对象在领域层

### 基础设施层

- [x] 清理空目录
- [x] 移动CASL工厂到领域层
- [ ] 创建MikroORM实体
- [ ] 创建实体映射器
- [ ] 更新仓储实现（继承 `AggregateRepositoryAdapter`）

### 应用层

- [ ] 清理不属于应用层的目录
- [ ] 更新命令（继承 `BaseCommand`）
- [ ] 更新查询（继承 `BaseQuery`）
- [ ] 更新处理器（实现接口）
- [ ] 更新用例（继承 `BaseUseCase`）

## 下一步行动

### 优先级 1: 基础设施层

1. 创建 MikroORM 实体
2. 创建实体映射器
3. 更新仓储实现

### 优先级 2: 应用层

1. 清理不需要的目录
2. 对齐命令和查询到基类
3. 对齐处理器到接口
4. 对齐用例到基类

### 优先级 3: 测试和验证

1. 编写单元测试
2. 编写集成测试
3. 验证所有对齐点

## 相关文档

### Kernel 模块文档

- `libs/domain-kernel/README.md`
- `libs/application-kernel/README.md`
- `libs/infrastructure-kernel/README.md`

### 项目文档

- `.cursor/docs/architecture/` - 架构设计文档
- `.cursor/docs/definition-of-terms.mdc` - 统一术语

## 总结

通过以上对齐工作，`libs/saas-core` 将：

1. ✅ 遵循 Clean Architecture + DDD 原则
2. ✅ 使用统一的 Kernel 模块
3. ✅ 保持各层职责清晰
4. ✅ 提高代码复用性
5. ✅ 易于测试和维护

所有对齐工作都已完成文档化，为后续开发提供了清晰的指导。
