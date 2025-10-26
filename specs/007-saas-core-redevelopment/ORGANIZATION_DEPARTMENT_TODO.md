# Organization & Department 子领域实现 TODO 清单

**焦点**: 领域层 (Domain Layer) - 组织与部门子领域  
**目标**: 通过完成组织与部门子领域的代码开发，验证是否符合规范要求  
**架构**: Clean Architecture + DDD + Rich Domain Model (充血模型)

---

## 📋 实现清单总览

### Phase 1: 基础设施准备 (Foundation Setup)

- [x] 目录结构创建（与租户子领域共用）
- [x] 基础值对象创建（使用 @hl8/domain-kernel）
- [x] 领域事件基类

### Phase 2: 值对象实现 (Value Objects)

**Organization**:

- [ ] OrganizationType 枚举
- [ ] OrganizationStatus 枚举

**Department**:

- [ ] DepartmentStatus 枚举
- [ ] DepartmentPath 值对象

### Phase 3: 实体与聚合根实现 (Entity-Aggregate Implementation)

**Organization**:

- [ ] OrganizationEntity (内部实体)
- [ ] Organization Aggregate Root

**Department**:

- [ ] DepartmentEntity (内部实体)
- [ ] Department Aggregate Root

### Phase 4: 业务逻辑实现 (Business Logic)

**Organization**:

- [ ] 组织创建业务逻辑
- [ ] 组织状态转换业务逻辑
- [ ] 组织成员管理业务逻辑
- [ ] 组织部门管理业务逻辑

**Department**:

- [ ] 部门创建业务逻辑
- [ ] 部门状态转换业务逻辑
- [ ] 部门层级管理业务逻辑
- [ ] 部门成员管理业务逻辑

### Phase 5: 领域事件 (Domain Events)

- [ ] OrganizationCreated 事件
- [ ] OrganizationStatusChanged 事件
- [ ] DepartmentCreated 事件
- [ ] DepartmentStatusChanged 事件

### Phase 6: 验证与测试 (Validation & Testing)

- [ ] 架构合规性验证
- [ ] 业务规则验证
- [ ] 单元测试（可选）

---

## 🔨 Phase 2: 值对象实现

### T-001 [P] 使用 OrganizationId 值对象

**说明**: 不创建新的 OrganizationId 值对象，直接使用 @hl8/domain-kernel 提供的 OrganizationId

**文件路径**: 直接 import from `@hl8/domain-kernel`

```typescript
import { OrganizationId } from "@hl8/domain-kernel";
```

**验收标准**:

- [x] 继承自 @hl8/domain-kernel 的 EntityId
- [x] 类型安全，无法用其他ID类型混淆
- [x] 不可变对象
- [x] 包含缓存机制
- [x] 支持 create() 和 generate() 静态方法

---

### T-002 [P] 使用 DepartmentId 值对象

**说明**: 不创建新的 DepartmentId 值对象，直接使用 @hl8/domain-kernel 提供的 DepartmentId

**文件路径**: 直接 import from `@hl8/domain-kernel`

```typescript
import { DepartmentId } from "@hl8/domain-kernel";
```

**验收标准**:

- [x] 继承自 @hl8/domain-kernel 的 EntityId
- [x] 类型安全，无法用其他ID类型混淆
- [x] 不可变对象
- [x] 包含缓存机制
- [x] 支持 create() 和 generate() 静态方法

---

### T-003 [P] 实现 OrganizationType 枚举

**文件路径**: `libs/saas-core/src/domain/value-objects/organization-type.vo.ts`

**枚举定义**:

```typescript
/**
 * 组织类型
 * @description 支持4种组织类型：委员会、项目团队、质量控制小组、绩效管理小组
 */
export enum OrganizationType {
  /** 专业委员会：负责特定领域的决策和管理 */
  COMMITTEE = "COMMITTEE",

  /** 项目团队：负责特定项目的执行和管理 */
  PROJECT_TEAM = "PROJECT_TEAM",

  /** 质量控制小组：负责质量管理和监控 */
  QUALITY_GROUP = "QUALITY_GROUP",

  /** 绩效管理小组：负责绩效评估和管理 */
  PERFORMANCE_GROUP = "PERFORMANCE_GROUP",
}
```

**验收标准**:

- [ ] 4种组织类型完整定义
- [ ] 每种类型都有完整的TSDoc注释
- [ ] 注释使用中文，遵循TSDoc规范
- [ ] 包含组织和说明信息

---

### T-004 [P] 实现 OrganizationStatus 枚举

**文件路径**: `libs/saas-core/src/domain/value-objects/organization-status.vo.ts`

**状态定义**:

- ACTIVE: 活跃
- INACTIVE: 非活跃
- SUSPENDED: 暂停

**验收标准**:

- [ ] 3种状态完整定义
- [ ] 完整的TSDoc中文注释
- [ ] 状态转换规则明确
- [ ] 包含 OrganizationStatusTransition 类实现
- [ ] 包含完整的业务规则验证方法

---

### T-005 [P] 实现 DepartmentStatus 枚举

**文件路径**: `libs/saas-core/src/domain/value-objects/department-status.vo.ts`

**状态定义**:

- ACTIVE: 活跃
- INACTIVE: 非活跃
- ARCHIVED: 已归档

**验收标准**:

- [ ] 3种状态完整定义
- [ ] 完整的TSDoc中文注释
- [ ] 状态转换规则明确
- [ ] 包含 DepartmentStatusTransition 类实现
- [ ] 包含完整的业务规则验证方法

---

### T-006 [P] 实现 DepartmentPath 值对象

**文件路径**: `libs/saas-core/src/domain/value-objects/department-path.vo.ts`

**说明**: 部门路径值对象，用于支持8层部门层级结构

**验收标准**:

- [ ] 支持8层路径结构
- [ ] 包含路径验证逻辑
- [ ] 包含路径操作方法（append, remove, getParent, getLevel）
- [ ] 完整的TSDoc中文注释

---

## 🎯 Phase 3: 实体与聚合根实现

### T-007A [P] 实现 OrganizationEntity（内部实体）

**文件路径**: `libs/saas-core/src/domain/entities/organization-entity.ts`

**核心要求**:

1. **实体与聚合根分离** ⚠️ **MANDATORY**: 内部实体执行具体业务操作和维护自身状态
2. **充血模型**: 实体包含业务逻辑，不只是数据容器
3. **组织类型支持**: 支持4种组织类型
4. **T_chinese文档**: 所有公共方法必须有完整TSDoc注释

**验收标准**:

- [ ] 所有属性为private，通过方法访问
- [ ] 包含完整的业务方法（创建、更新、成员管理、部门管理）
- [ ] 完整的TSDoc中文注释
- [ ] 支持组织共享级别管理

---

### T-007B [P] 实现 Organization 聚合根

**文件路径**: `libs/saas-core/src/domain/aggregates/organization.aggregate.ts`

**核心要求**:

1. 继承 @hl8/domain-kernel 的 AggregateRoot
2. 协调内部实体 OrganizationEntity
3. 发布领域事件
4. 管理聚合边界

**验收标准**:

- [ ] 继承 AggregateRoot<OrganizationId>
- [ ] 包含私有 OrganizationEntity 实例
- [ ] 协调内部实体执行业务操作
- [ ] 发布领域事件
- [ ] 完整的TSDoc中文注释

---

### T-008A [P] 实现 DepartmentEntity（内部实体）

**文件路径**: `libs/saas-core/src/domain/entities/department-entity.ts`

**核心要求**:

1. **实体与聚合根分离** ⚠️ **MANDATORY**: 内部实体执行具体业务操作和维护自身状态
2. **充血模型**: 实体包含业务逻辑，不只是数据容器
3. **8层部门支持**: 支持8层部门架构
4. **T_chinese文档**: 所有公共方法必须有完整TSDoc注释

**验收标准**:

- [ ] 所有属性为private，通过方法访问
- [ ] 包含完整的业务方法（创建、移动、成员管理、层级查询）
- [ ] 支持父子关系和路径跟踪
- [ ] 完整的TSDoc中文注释

---

### T-008B [P] 实现 Department 聚合根

**文件路径**: `libs/saas-core/src/domain/aggregates/department.aggregate.ts`

**核心要求**:

1. 继承 @hl8/domain-kernel 的 AggregateRoot
2. 协调内部实体 DepartmentEntity
3. 发布领域事件
4. 管理聚合边界

**验收标准**:

- [ ] 继承 AggregateRoot<DepartmentId>
- [ ] 包含私有 DepartmentEntity 实例
- [ ] 协调内部实体执行业务操作
- [ ] 发布领域事件
- [ ] 完整的TSDoc中文注释

---

## 📊 Phase 5: 领域事件

### T-009 [P] 实现 OrganizationCreated 事件

**文件路径**: `libs/saas-core/src/domain/events/organization-created.event.ts`

**验收标准**:

- [ ] 继承 DomainEvent 接口
- [ ] 包含完整的组织信息
- [ ] 使用 GenericEntityId 生成 eventId
- [ ] 完整的TSDoc中文注释

---

### T-010 [P] 实现 OrganizationStatusChanged 事件

**文件路径**: `libs/saas-core/src/domain/events/organization-status-changed.event.ts`

**验收标准**:

- [ ] 继承 DomainEvent 接口
- [ ] 包含旧状态和新状态
- [ ] 使用 GenericEntityId 生成 eventId
- [ ] 完整的TSDoc中文注释

---

### T-011 [P] 实现 DepartmentCreated 事件

**文件路径**: `libs/saas-core/src/domain/events/department-created.event.ts`

**验收标准**:

- [ ] 继承 DomainEvent 接口
- [ ] 包含完整的部门信息
- [ ] 使用 GenericEntityId 生成 eventId
- [ ] 完整的TSDoc中文注释

---

### T-012 [P] 实现 DepartmentStatusChanged 事件

**文件路径**: `libs/saas-core/src/domain/events/department-status-changed.event.ts`

**验收标准**:

- [ ] 继承 DomainEvent 接口
- [ ] 包含旧状态和新状态
- [ ] 使用 GenericEntityId 生成 eventId
- [ ] 完整的TSDoc中文注释

---

## ✅ Phase 6: 验收检查表

### Clean Architecture 合规性

- [ ] ✅ 领域层独立性：不依赖任何外部框架
- [ ] ✅ 使用 @hl8/domain-kernel 基础组件
- [ ] ✅ 充血模型：业务逻辑在领域对象内
- [ ] ✅ 禁止贫血模型：不是纯数据容器
- [ ] ✅ 实体与聚合根分离：聚合根协调内部实体并发布事件，内部实体执行业务操作

### DDD 合规性

- [ ] ✅ 明确的聚合根边界
- [ ] ✅ 实体与聚合根分离
- [ ] ✅ 值对象不可变性
- [ ] ✅ 领域事件发布
- [ ] ✅ 统一语言（中文术语）

### 8层部门架构

- [ ] ✅ 支持8层部门嵌套验证
- [ ] ✅ 部门路径跟踪和层级管理
- [ ] ✅ 业务规则中体现8层限制

### T_chinese文档

- [ ] ✅ 所有公共类有 @description
- [ ] ✅ 所有公共方法有完整TSDoc
- [ ] ✅ 使用中文注释
- [ ] ✅ 包含 @example 示例

---

## 📝 执行顺序

### 推荐并行执行

**Phase 2 (值对象)**: 可以并行创建

- T-003 (OrganizationType) 和 T-005 (DepartmentStatus) 可以并行
- T-004 (OrganizationStatus) 和 T-006 (DepartmentPath) 可以并行

**Phase 3 (实体与聚合根)**: 可以并行创建

- T-007A (OrganizationEntity) 和 T-008A (DepartmentEntity) 可以并行
- T-007B (Organization Aggregate) 和 T-008B (Department Aggregate) 可以并行

**Phase 5 (领域事件)**: 可以并行创建

- T-009, T-010, T-011, T-012 可以并行

### 依赖关系

1. Phase 2 (值对象) → Phase 3 (实体与聚合根)
2. Phase 3 (实体与聚合根) → Phase 5 (领域事件)
3. 所有实现 → Phase 6 (验证)

---

## 📌 注意事项

1. **实体与聚合根分离原则**: 所有聚合都必须分离，即使是简单聚合
2. **优先使用 @hl8/domain-kernel**: 使用现有的 TenantId, OrganizationId, DepartmentId
3. **8层部门支持**: 确保所有相关业务逻辑支持8层部门结构
4. **中文TSDoc文档**: 所有公共API必须有完整的中文TSDoc注释
5. **充血模型**: 业务逻辑在领域对象内，不是纯数据容器
