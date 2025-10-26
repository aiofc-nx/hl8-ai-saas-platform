# User 子领域实现 TODO 清单

**焦点**: 领域层 (Domain Layer) - 用户子领域  
**目标**: 通过完成用户子领域的代码开发，验证是否符合规范要求  
**架构**: Clean Architecture + DDD + Rich Domain Model (充血模型)

---

## 📋 实现清单总览

### Phase 1: 基础设施准备 (Foundation Setup)

- [x] 目录结构创建（与租户/组织/部门子领域共用）
- [x] 基础值对象创建（使用 @hl8/domain-kernel）
- [x] 领域事件基类

### Phase 2: 值对象实现 (Value Objects)

- [ ] UserSource 枚举
- [ ] UserType 枚举
- [ ] UserRole 枚举
- [ ] UserStatus 枚举

### Phase 3: 实体与聚合根实现 (Entity-Aggregate Implementation)

- [ ] UserEntity (内部实体)
- [ ] User Aggregate Root

### Phase 4: 业务逻辑实现 (Business Logic)

- [ ] 用户创建业务逻辑
- [ ] 用户状态转换业务逻辑
- [ ] 用户组织/部门管理业务逻辑
- [ ] 用户权限验证业务逻辑

### Phase 5: 领域事件 (Domain Events)

- [ ] UserCreated 事件
- [ ] UserStatusChanged 事件
- [ ] UserJoinedOrganization 事件
- [ ] UserLeftOrganization 事件

### Phase 6: 验证与测试 (Validation & Testing)

- [ ] 架构合规性验证
- [ ] 业务规则验证
- [ ] 单元测试（可选）

---

## 🔨 Phase 2: 值对象实现

### T-001 [P] 使用 UserId 值对象

**说明**: 不创建新的 UserId 值对象，直接使用 @hl8/domain-kernel 提供的 UserId

**文件路径**: 直接 import from `@hl8/domain-kernel`

```typescript
import { UserId } from "@hl8/domain-kernel";
```

**验收标准**:

- [x] 继承自 @hl8/domain-kernel 的 EntityId
- [x] 类型安全，无法用其他ID类型混淆
- [x] 不可变对象
- [x] 包含缓存机制
- [x] 支持 create() 和 generate() 静态方法

---

### T-002 [P] 实现 UserSource 枚举

**文件路径**: `libs/saas-core/src/domain/value-objects/user-source.vo.ts`

**枚举定义**:

```typescript
/**
 * 用户来源
 * @description 用户的来源类型：平台用户、租户用户、系统用户
 */
export enum UserSource {
  /** 平台用户：平台级别的用户 */
  PLATFORM = "PLATFORM",

  /** 租户用户：租户级别的用户 */
  TENANT = "TENANT",

  /** 系统用户：系统级别的用户 */
  SYSTEM = "SYSTEM",
}
```

**验收标准**:

- [ ] 3种用户来源完整定义
- [ ] 每种类型都有完整的TSDoc注释
- [ ] 注释使用中文，遵循TSDoc规范

---

### T-003 [P] 实现 UserType 枚举

**文件路径**: `libs/saas-core/src/domain/value-objects/user-type.vo.ts`

**枚举定义**:

```typescript
/**
 * 用户类型
 * @description 用户的使用类型：个人用户、企业用户、社群用户、团队用户
 */
export enum UserType {
  /** 个人用户：独立的个人用户 */
  PERSONAL = "PERSONAL",

  /** 企业用户：企业内的用户 */
  ENTERPRISE = "ENTERPRISE",

  /** 社群用户：社群内的用户 */
  COMMUNITY = "COMMUNITY",

  /** 团队用户：团队内的用户 */
  TEAM = "TEAM",
}
```

**验收标准**:

- [ ] 4种用户类型完整定义
- [ ] 每种类型都有完整的TSDoc注释
- [ ] 注释使用中文，遵循TSDoc规范

---

### T-004 [P] 实现 UserRole 枚举

**文件路径**: `libs/saas-core/src/domain/value-objects/user-role.vo.ts`

**枚举定义**:

```typescript
/**
 * 用户角色
 * @description 用户在系统中的角色，按层级定义：平台管理员、租户管理员、组织管理员、部门管理员、普通用户
 */
export enum UserRole {
  /** 平台管理员：平台级别的管理员 */
  PLATFORM_ADMIN = "PLATFORM_ADMIN",

  /** 租户管理员：租户级别的管理员 */
  TENANT_ADMIN = "TENANT_ADMIN",

  /** 组织管理员：组织级别的管理员 */
  ORG_ADMIN = "ORG_ADMIN",

  /** 部门管理员：部门级别的管理员 */
  DEPT_ADMIN = "DEPT_ADMIN",

  /** 普通用户：普通用户 */
  USER = "USER",
}
```

**验收标准**:

- [ ] 5种用户角色完整定义
- [ ] 每种类型都有完整的TSDoc注释
- [ ] 注释使用中文，遵循TSDoc规范
- [ ] 包含角色层级关系说明

---

### T-005 [P] 实现 UserStatus 枚举

**文件路径**: `libs/saas-core/src/domain/value-objects/user-status.vo.ts`

**说明**: 可以引用 @hl8/domain-kernel 的 UserStatus，但需要扩展以满足业务需求

**状态定义**:

- PENDING: 待激活
- ACTIVE: 已激活
- DISABLED: 已禁用
- LOCKED: 已锁定
- EXPIRED: 已过期

**验收标准**:

- [ ] 5种状态完整定义
- [ ] 完整的TSDoc中文注释
- [ ] 状态转换规则明确
- [ ] 包含 UserStatusTransition 类实现
- [ ] 包含完整的业务规则验证方法

---

## 🎯 Phase 3: 实体与聚合根实现

### T-006A [P] 实现 UserEntity（内部实体）

**文件路径**: `libs/saas-core/src/domain/entities/user-entity.ts`

**核心要求**:

1. **实体与聚合根分离** ⚠️ **MANDATORY**: 内部实体执行具体业务操作和维护自身状态
2. **充血模型**: 实体包含业务逻辑，不只是数据容器
3. **多组织支持**: 支持用户属于多个组织
4. **单部门约束**: 在每个组织内只能属于一个部门
5. **T_chinese文档**: 所有公共方法必须有完整TSDoc注释

**验收标准**:

- [ ] 所有属性为private，通过方法访问
- [ ] 包含完整的业务方法（状态转换、组织/部门管理、权限验证）
- [ ] 支持多组织多部门管理
- [ ] 完整的TSDoc中文注释

---

### T-006B [P] 实现 User 聚合根

**文件路径**: `libs/saas-core/src/domain/aggregates/user.aggregate.ts`

**核心要求**:

1. 继承 @hl8/domain-kernel 的 AggregateRoot
2. 协调内部实体 UserEntity
3. 发布领域事件
4. 管理聚合边界

**验收标准**:

- [ ] 继承 AggregateRoot<UserId>
- [ ] 包含私有 UserEntity 实例
- [ ] 协调内部实体执行业务操作
- [ ] 发布领域事件
- [ ] 完整的TSDoc中文注释

---

## 📊 Phase 5: 领域事件

### T-007 [P] 实现 UserCreated 事件

**文件路径**: `libs/saas-core/src/domain/events/user-created.event.ts`

**验收标准**:

- [ ] 继承 DomainEvent 接口
- [ ] 包含完整的用户信息
- [ ] 使用 GenericEntityId 生成 eventId
- [ ] 完整的TSDoc中文注释

---

### T-008 [P] 实现 UserStatusChanged 事件

**文件路径**: `libs/saas-core/src/domain/events/user-status-changed.event.ts`

**验收标准**:

- [ ] 继承 DomainEvent 接口
- [ ] 包含旧状态和新状态
- [ ] 使用 GenericEntityId 生成 eventId
- [ ] 完整的TSDoc中文注释

---

### T-009 [P] 实现 UserJoinedOrganization 事件

**文件路径**: `libs/saas-core/src/domain/events/user-joined-organization.event.ts`

**验收标准**:

- [ ] 继承 DomainEvent 接口
- [ ] 包含组织信息和部门信息
- [ ] 使用 GenericEntityId 生成 eventId
- [ ] 完整的TSDoc中文注释

---

### T-010 [P] 实现 UserLeftOrganization 事件

**文件路径**: `libs/saas-core/src/domain/events/user-left-organization.event.ts`

**验收标准**:

- [ ] 继承 DomainEvent 接口
- [ ] 包含组织信息
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

### 业务规则

- [ ] ✅ 用户在每个组织内只能属于一个部门
- [ ] ✅ 用户状态转换规则正确
- [ ] ✅ 用户权限验证规则完整

### TSDoc 文档

- [ ] ✅ 所有公共类有 @description
- [ ] ✅ 所有公共方法有完整TSDoc
- [ ] ✅ 使用中文注释
- [ ] ✅ 包含 @example 示例

---

## 📝 执行顺序

### 推荐并行执行

**Phase 2 (值对象)**: 可以并行创建

- T-002 (UserSource) 和 T-004 (UserRole) 可以并行
- T-003 (UserType) 和 T-005 (UserStatus) 可以并行

**Phase 3 (实体与聚合根)**: 必须按顺序

- T-006A (UserEntity) 必须先完成，然后执行 T-006B (User Aggregate)

**Phase 5 (领域事件)**: 可以并行创建

- T-007, T-008, T-009, T-010 可以并行

### 依赖关系

1. Phase 2 (值对象) → Phase 3 (实体与聚合根)
2. T-006A (UserEntity) → T-006B (User Aggregate)
3. Phase 3 (实体与聚合根) → Phase 5 (领域事件)
4. 所有实现 → Phase 6 (验证)

---

## 📌 注意事项

1. **实体与聚合根分离原则**: 所有聚合都必须分离，即使是简单聚合
2. **优先使用 @hl8/domain-kernel**: 使用现有的 UserId
3. **多组织多部门支持**: 用户可以属于多个组织，但在每个组织内只能属于一个部门
4. **中文TSDoc文档**: 所有公共API必须有完整的中文TSDoc注释
5. **充血模型**: 业务逻辑在领域对象内，不是纯数据容器
