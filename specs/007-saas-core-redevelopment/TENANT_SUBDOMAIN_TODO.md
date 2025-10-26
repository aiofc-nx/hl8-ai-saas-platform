# 租户子领域实现 TODO 清单

**焦点**: 领域层 (Domain Layer) - 租户子领域  
**目标**: 通过完成租户子领域的代码开发，验证是否符合规范要求  
**架构**: Clean Architecture + DDD + Rich Domain Model (充血模型)

---

## 📋 实现清单总览

### Phase 1: 基础设施准备 (Foundation Setup)

- [ ] 目录结构创建
- [ ] 基础值对象创建
- [ ] 领域事件基类

### Phase 2: 租户聚合根实现 (Tenant Aggregate)

- [ ] TenantId 值对象
- [ ] TenantType 枚举
- [ ] TenantStatus 枚举
- [ ] Tenant 聚合根
- [ ] 领域事件

### Phase 3: 业务逻辑实现 (Business Logic)

- [ ] 租户创建业务逻辑
- [ ] 租户状态转换业务逻辑
- [ ] 租户资源限制验证
- [ ] 租户生命周期管理

### Phase 4: 验证与测试 (Validation & Testing)

- [ ] 架构合规性验证
- [ ] 业务规则验证
- [ ] 单元测试

---

## 🔨 Phase 1: 基础设施准备

### T-001 [P] 创建领域层目录结构

**说明**: 租户子领域的文件直接放在领域层的相应目录中，不创建单独的租户子目录

**文件路径**: `libs/saas-core/src/domain/`

**目录结构**:

```
libs/saas-core/src/domain/
├── entities/                # 内部实体（执行业务操作和维护状态）
│   └── tenant-entity.ts
├── aggregates/              # 聚合根（协调内部实体并发布事件）
│   └── tenant.aggregate.ts
├── value-objects/           # 值对象（使用@hl8/domain-kernel优先）
│   ├── tenant-type.vo.ts
│   └── tenant-status.vo.ts
├── events/                  # 领域事件
│   ├── tenant-created.event.ts
│   └── tenant-status-changed.event.ts
├── domain-services/         # 领域服务（如需）
└── index.ts                 # 导出文件
```

**⚠️ 重要说明**：

1. **entities/**: 包含内部实体 TenantEntity（执行具体业务操作和维护自身状态）
2. **aggregates/**: 包含聚合根 Tenant（协调内部实体并发布领域事件）
3. **实体与聚合根分离**：即使简单的聚合也必须分离（MANDATORY）
4. **TenantId**: 不在此目录创建，使用 @hl8/domain-kernel 的 TenantId

**验收标准**:

- [x] 目录结构创建完成
- [x] 所有目录遵循 Clean Architecture 层次结构
- [x] 清晰的职责分离（聚合、值对象、事件分离）

---

### T-002 [P] 安装和配置 @hl8/domain-kernel 依赖

**文件路径**: `libs/saas-core/package.json`

**依赖要求**:

- `@hl8/domain-kernel`: 提供 AggregateRoot, BaseEntity, BaseValueObject, EntityId, DomainEvent

**验收标准**:

- [x] package.json 中包含 @hl8/domain-kernel 依赖
- [x] 依赖版本正确且与项目兼容
- [x] 可以在代码中 import 基础类

---

## 🏗️ Phase 2: 值对象实现

### T-003 使用 TenantId 值对象（不创建新值对象）

**说明**: 不创建新的 TenantId 值对象，直接使用 @hl8/domain-kernel 提供的 TenantId

**文件路径**: 直接 import from `@hl8/domain-kernel`

```typescript
import { TenantId } from "@hl8/domain-kernel";
```

**理由**: 优先使用现有内核组件，避免重复实现（FR-049A）

**验收标准**:

- [x] 继承自 @hl8/domain-kernel 的 EntityId
- [x] 类型安全，无法用其他ID类型混淆
- [x] 不可变对象
- [x] 包含缓存机制
- [x] 支持 create() 和 generate() 静态方法

---

### T-004 [P] 实现 TenantType 枚举

**文件路径**: `libs/saas-core/src/domain/value-objects/tenant-type.vo.ts`

**已实现**: 创建完整的租户类型枚举和资源限制配置

**验收标准**:

- [x] 5种租户类型完整定义
- [x] 每种类型都有完整的TSDoc注释
- [x] 注释使用中文，遵循TSDoc规范
- [x] 包含getResourceLimits()函数
- [x] 所有类型支持8层部门架构（maxDepartmentLevels = 8）

**实现说明**: 已创建完整的 TenantType 枚举，包含5种类型和资源限制配置函数

---

### T-005 [P] 实现 TenantStatus 枚举

**文件路径**: `libs/saas-core/src/domain/value-objects/tenant-status.vo.ts`

**状态定义**:

- TRIAL: 试用
- ACTIVE: 活跃
- SUSPENDED: 暂停
- EXPIRED: 过期
- DELETED: 删除

**验收标准**:

- [x] 5种状态完整定义
- [x] 完整的TSDoc中文注释
- [x] 状态转换规则明确（类似 UserStatusTransition）
- [x] 包含 TenantStatusTransition 类实现
- [x] 包含完整的业务规则验证方法

**实现说明**: 已创建完整的 TenantStatus 枚举和 TenantStatusTransition 状态转换类，参考 UserStatusTransition 模式

---

## 🎯 Phase 3: 租户聚合根实现

### T-006A 实现 TenantEntity（内部实体）

**文件路径**: `libs/saas-core/src/domain/entities/tenant-entity.ts`

**核心要求**:

1. **实体与聚合根分离** ⚠️ **MANDATORY**: 内部实体执行具体业务操作和维护自身状态（即使简单聚合也必须分离）
2. **充血模型**: 实体包含业务逻辑，不只是数据容器
3. **8层部门支持**: 支持8层部门架构
4. **T_chinese文档**: 所有公共方法必须有完整TSDoc注释
5. **业务变化适应**: 确保架构可以应对未来业务变化

**属性定义**:

```typescript
export class TenantEntity {
  // 基础属性
  private _code: string;
  private _name: string;
  private _domain: string;

  // 租户类型和状态
  private _type: TenantType;
  private _status: TenantStatus;

  // 资源限制
  private _maxUsers: number;
  private _maxStorage: string;
  private _maxOrganizations: number;
  private _maxDepartmentLevels: number; // 默认8层
}
```

**验收标准**:

- [ ] 所有属性为private，通过方法访问
- [ ] 包含8层部门架构支持（maxDepartmentLevels = 8）
- [ ] 执行业务逻辑的实体方法
- [ ] 维护自身状态
- [ ] T_chinese文档注释完整

---

### T-006B 实现 Tenant 聚合根

**文件路径**: `libs/saas-core/src/domain/aggregates/tenant.aggregate.ts`

**核心要求**:

1. **继承**: 使用 @hl8/domain-kernel 的 AggregateRoot
2. **实体与聚合根分离** ⚠️ **MANDATORY**: 聚合根协调内部实体并发布领域事件（即使简单聚合也必须分离）
3. **职责**: 管理聚合边界、协调内部实体、发布领域事件、验证业务规则
4. **强制性**: 无论当前业务简单或复杂，都必须实现分离以应对未来变化

**属性定义**:

```typescript
export class Tenant extends AggregateRoot<TenantId> {
  private _tenant: TenantEntity; // 内部实体

  // 聚合根职责：协调内部实体
  public changeStatus(newStatus: TenantStatus): void {
    this._tenant.updateStatus(newStatus);
    this.raiseEvent("TenantStatusChanged", {...});
  }
}
```

**验收标准**:

- [ ] 继承自 @hl8/domain-kernel 的 AggregateRoot
- [ ] 聚合根协调内部实体（TenantEntity）
- [ ] 发布领域事件
- [ ] 验证业务规则
- [ ] 禁止贫血模型（必须有业务方法）
- [ ] T_chinese文档注释完整

---

### T-007 实现租户创建业务逻辑

**文件**: `libs/saas-core/src/domain/aggregates/tenant.aggregate.ts`

**方法**: `create(code: string, name: string, domain: string, type: TenantType): Tenant`

**业务规则**:

1. 租户代码必须唯一（由仓储验证）
2. 域名必须唯一（由仓储验证）
3. 代码格式：3-20个字符，字母数字开头结尾
4. 默认类型为FREE（如果未指定）
5. 初始状态为TRIAL
6. 创建租户时必须发布 TenantCreated 事件

**实现要点**:

- **聚合根职责**: 协调租户创建流程，发布领域事件
- **内部实体职责**: 执行具体业务逻辑，维护自身状态

**验收标准**:

- [ ] 聚合根协调租户创建流程
- [ ] 内部实体执行业务逻辑
- [ ] 发布 TenantCreated 领域事件
- [ ] 包含完整的业务规则验证
- [ ] T_chinese文档注释完整

---

### T-008 实现租户状态转换业务逻辑

**文件**: `libs/saas-core/src/domain/aggregates/tenant.aggregate.ts`

**聚合根方法**: `changeStatus(newStatus: TenantStatus): void`

**实现要点**:

- **聚合根职责**: 协调状态转换，发布领域事件
- **内部实体职责**: 执行状态变更，验证转换规则

**状态转换规则**:

- TRIAL → ACTIVE ✅
- TRIAL → EXPIRED ✅ (自动转换)
- ACTIVE → SUSPENDED ✅
- SUSPENDED → ACTIVE ✅
- 任何状态 → DELETED ✅
- DELETED → 任何状态 ❌ (禁止)

**验收标准**:

- [ ] 聚合根协调状态转换
- [ ] 内部实体执行状态变更
- [ ] 实现所有允许的状态转换
- [ ] 禁止不符合业务规则的转换
- [ ] 状态转换时发布 TenantStatusChanged 事件
- [ ] T_chinese文档注释完整

---

### T-009 实现租户资源限制验证

**方法**:

- `canCreateOrganization(): boolean`
- `canCreateDepartment(): boolean`
- `canAddUser(): boolean`

**验收标准**:

- [ ] 验证组织创建限制
- [ ] 验证部门层级限制（不超过8层）
- [ ] 验证用户数量限制
- [ ] 包含CUSTOM类型的特殊处理

---

## 📢 Phase 4: 领域事件实现

### T-010 [P] 实现 TenantCreated 事件

**文件路径**: `libs/saas-core/src/domain/events/tenant-created.event.ts`

**继承**: @hl8/domain-kernel DomainEvent

**验收标准**:

- [ ] 继承自 DomainEvent
- [ ] 包含租户基本信息
- [ ] 时间戳记录正确

---

### T-011 [P] 实现 TenantStatusChanged 事件

**文件路径**: `libs/saas-core/src/domain/events/tenant-status-changed.event.ts`

**验收标准**:

- [ ] 继承自 DomainEvent
- [ ] 记录旧状态和新状态
- [ ] 包含变更原因

---

## ✅ Phase 5: 验证与测试

### T-012 架构合规性验证

**验证清单**:

- [ ] 领域层不依赖基础设施层
- [ ] 使用 @hl8/domain-kernel 基础组件
- [ ] 没有使用 ORM 或其他数据库框架
- [ ] 所有业务逻辑在聚合根内
- [ ] 没有贫血模型（必须有业务方法）
- [ ] 8层部门架构支持验证

---

### T-013 业务规则验证

**验证清单**:

- [ ] 租户创建规则验证
- [ ] 状态转换规则验证
- [ ] 资源限制规则验证
- [ ] 8层部门层级限制验证
- [ ] 租户类型资源限制验证

---

### T-014 [可选] 单元测试

**文件路径**: `libs/saas-core/src/domain/aggregates/tenant.aggregate.spec.ts`

**测试覆盖**:

- [ ] 租户创建测试
- [ ] 状态转换测试
- [ ] 资源限制测试
- [ ] 业务规则违反测试

---

## 📊 验收检查表

### Clean Architecture 合规性

- [ ] ✅ 领域层独立性：不依赖任何外部框架
- [ ] ✅ 使用 @hl8/domain-kernel 基础组件
- [ ] ✅ 充血模型：业务逻辑在领域对象内
- [ ] ✅ 禁止贫血模型：不是纯数据容器
- [ ] ✅ 实体与聚合根分离：聚合根协调内部实体并发布事件，内部实体执行业务操作

### DDD 合规性

- [ ] ✅ 明确的聚合根边界
- [ ] ✅ 实体与聚合根分离（聚合根协调内部实体，内部实体执行业务操作）
- [ ] ✅ 值对象不可变性
- [ ] ✅ 领域事件发布
- [ ] ✅ 统一语言（中文术语）

### 8层部门架构

- [ ] ✅ maxDepartmentLevels 默认值为8
- [ ] ✅ 支持8层部门嵌套验证
- [ ] ✅ 业务规则中体现8层限制

### T_chinese文档

- [ ] ✅ 所有公共类有 @description
- [ ] ✅ 所有公共方法有完整TSDoc
- [ ] ✅ 使用中文注释
- [ ] ✅ 包含 @example 示例

### 规范遵循

- [ ] ✅ 遵循 .cursor/docs 中的规范
- [ ] ✅ 遵循 .specify/memory/constitution.md
- [ ] ✅ 遵循定义术语 .cursor/docs/definition-of-terms.mdc

---

## 🚀 执行顺序

1. **Setup**: T-001, T-002 (并行)
2. **Value Objects**: T-003, T-004, T-005 (并行)
3. **Entity-Aggregate Separation**:
   - T-006A: TenantEntity (内部实体) - 先执行
   - T-006B: Tenant Aggregate (聚合根) - 依赖T-006A
4. **Business Logic**: T-007, T-008, T-009 (顺序，依赖T-006A和T-006B)
5. **Events**: T-010, T-011 (并行)
6. **Validation**: T-012, T-013 (并行)
7. **Testing**: T-014 (可选)

---

## 📝 完成标准

当所有任务完成且验收检查表全部通过时，租户子领域的实现即为完成。

**最终验证**:

- 架构合规性 ✅
- 业务规则正确 ✅
- 8层部门架构支持 ✅
- T_chinese文档完整 ✅
- 代码符合规范 ✅
