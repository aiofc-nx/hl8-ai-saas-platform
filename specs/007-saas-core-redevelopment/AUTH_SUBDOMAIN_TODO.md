# 权限、角色、认证、授权子领域实现 TODO 清单

**焦点**: 领域层 (Domain Layer) - 权限、角色、认证、授权子领域  
**目标**: 通过完成权限、角色、认证、授权子领域的代码开发，验证是否符合规范要求  
**架构**: Clean Architecture + DDD + Rich Domain Model (充血模型)

---

## 📋 实现清单总览

### Phase 1: 基础设施准备 (Foundation Setup)

- [x] 目录结构创建（与其他子领域共用）
- [x] 基础值对象创建（使用 @hl8/domain-kernel）
- [x] 领域事件基类

### Phase 2: 值对象实现 (Value Objects)

- [ ] PermissionCode 值对象
- [ ] PermissionAction 枚举
- [ ] PermissionScope 枚举
- [ ] RoleCode 值对象
- [ ] RoleType 枚举
- [ ] CredentialType 枚举

### Phase 3: 实体与聚合根实现 (Entity-Aggregate Implementation)

- [ ] PermissionEntity (内部实体)
- [ ] Permission Aggregate Root
- [ ] RoleEntity (内部实体)
- [ ] Role Aggregate Root
- [ ] CredentialEntity (内部实体)
- [ ] Credential Aggregate Root

### Phase 4: 业务逻辑实现 (Business Logic)

- [ ] 权限创建和分配业务逻辑
- [ ] 角色创建和分配业务逻辑
- [ ] 用户认证业务逻辑
- [ ] 权限验证业务逻辑
- [ ] 角色权限继承逻辑
- [ ] 访问控制逻辑

### Phase 5: 领域事件 (Domain Events)

- [ ] PermissionCreated 事件
- [ ] PermissionAssigned 事件
- [ ] PermissionRevoked 事件
- [ ] RoleCreated 事件
- [ ] RoleAssigned 事件
- [ ] RoleRevoked 事件
- [ ] CredentialCreated 事件
- [ ] CredentialUpdated 事件
- [ ] AuthenticationSuccess 事件
- [ ] AuthenticationFailed 事件

### Phase 6: 领域服务 (Domain Services)

- [ ] PermissionService (权限管理服务)
- [ ] RoleService (角色管理服务)
- [ ] AuthenticationService (认证服务)
- [ ] AuthorizationService (授权服务)

### Phase 7: 验证与测试 (Validation & Testing)

- [ ] 架构合规性验证
- [ ] 业务规则验证
- [ ] 权限层级验证
- [ ] 单元测试（可选）

---

## 🔨 Phase 2: 值对象实现

### T-001 [P] 使用 PermissionId 和 RoleId 值对象

**说明**: 不创建新的 PermissionId 和 RoleId 值对象，直接使用 @hl8/domain-kernel 提供的基础ID类型

**文件路径**: 直接 import from `@hl8/domain-kernel`

```typescript
import { GenericEntityId } from "@hl8/domain-kernel";

// 使用 GenericEntityId 作为 PermissionId 和 RoleId
type PermissionId = GenericEntityId;
type RoleId = GenericEntityId;
```

**验收标准**:

- [x] 继承自 @hl8/domain-kernel 的 EntityId
- [x] 类型安全，无法用其他ID类型混淆
- [x] 不可变对象
- [x] 包含缓存机制

---

### T-002 [P] 实现 PermissionAction 枚举

**文件路径**: `libs/saas-core/src/domain/value-objects/permission-action.vo.ts`

**枚举定义**:

```typescript
/**
 * 权限操作类型
 * @description 定义用户可以执行的操作类型
 */
export enum PermissionAction {
  /** 创建：创建新资源 */
  CREATE = "CREATE",

  /** 读取：查看资源 */
  READ = "READ",

  /** 更新：修改资源 */
  UPDATE = "UPDATE",

  /** 删除：删除资源 */
  DELETE = "DELETE",

  /** 执行：执行特定操作 */
  EXECUTE = "EXECUTE",

  /** 管理：管理资源 */
  MANAGE = "MANAGE",
}
```

**验收标准**:

- [ ] 6种操作类型完整定义
- [ ] 每种操作都有完整的TSDoc注释
- [ ] 注释使用中文，遵循TSDoc规范

---

### T-003 [P] 实现 PermissionScope 枚举

**文件路径**: `libs/saas-core/src/domain/value-objects/permission-scope.vo.ts`

**枚举定义**:

```typescript
/**
 * 权限范围
 * @description 定义权限的作用范围
 */
export enum PermissionScope {
  /** 平台级：平台级别的权限 */
  PLATFORM = "PLATFORM",

  /** 租户级：租户级别的权限 */
  TENANT = "TENANT",

  /** 组织级：组织级别的权限 */
  ORGANIZATION = "ORGANIZATION",

  /** 部门级：部门级别的权限 */
  DEPARTMENT = "DEPARTMENT",

  /** 用户级：用户级别的权限 */
  USER = "USER",
}
```

**验收标准**:

- [ ] 5种范围类型完整定义
- [ ] 每种范围都有完整的TSDoc注释
- [ ] 注释使用中文，遵循TSDoc规范
- [ ] 包含权限层级关系说明

---

### T-004 [P] 实现 RoleType 枚举

**文件路径**: `libs/saas-core/src/domain/value-objects/role-type.vo.ts`

**枚举定义**:

```typescript
/**
 * 角色类型
 * @description 定义角色的类型，按权限层级定义
 */
export enum RoleType {
  /** 平台管理员：平台级别的管理员 */
  PLATFORM_ADMIN = "PLATFORM_ADMIN",

  /** 租户管理员：租户级别的管理员 */
  TENANT_ADMIN = "TENANT_ADMIN",

  /** 组织管理员：组织级别的管理员 */
  ORGANIZATION_ADMIN = "ORGANIZATION_ADMIN",

  /** 部门管理员：部门级别的管理员 */
  DEPARTMENT_ADMIN = "DEPARTMENT_ADMIN",

  /** 普通用户：普通用户 */
  REGULAR_USER = "REGULAR_USER",

  /** 自定义角色：自定义角色 */
  CUSTOM = "CUSTOM",
}
```

**验收标准**:

- [ ] 6种角色类型完整定义
- [ ] 每种类型都有完整的TSDoc注释
- [ ] 注释使用中文，遵循TSDoc规范
- [ ] 包含角色层级关系说明

---

### T-005 [P] 实现 CredentialType 枚举

**文件路径**: `libs/saas-core/src/domain/value-objects/credential-type.vo.ts`

**枚举定义**:

```typescript
/**
 * 凭证类型
 * @description 定义用户认证凭证的类型
 */
export enum CredentialType {
  /** 密码：用户名密码认证 */
  PASSWORD = "PASSWORD",

  /** 令牌：令牌认证 */
  TOKEN = "TOKEN",

  /** OAuth：OAuth认证 */
  OAUTH = "OAUTH",

  /** 证书：证书认证 */
  CERTIFICATE = "CERTIFICATE",
}
```

**验收标准**:

- [ ] 4种凭证类型完整定义
- [ ] 每种类型都有完整的TSDoc注释
- [ ] 注释使用中文，遵循TSDoc规范

---

## 🎯 Phase 3: 实体与聚合根实现

### T-006A [P] 实现 PermissionEntity（内部实体）

**文件路径**: `libs/saas-core/src/domain/entities/permission-entity.ts`

**核心要求**:

1. **实体与聚合根分离** ⚠️ **MANDATORY**: 内部实体执行具体业务操作和维护自身状态
2. **充血模型**: 实体包含业务逻辑，不只是数据容器
3. **权限层级支持**: 支持权限层级和继承
4. **中文TSDoc文档**: 所有公共方法必须有完整TSDoc注释

**验收标准**:

- [ ] 所有属性为private，通过方法访问
- [ ] 包含完整的业务方法（验证、权限检查、范围判断）
- [ ] 支持权限层级和继承
- [ ] 完整的TSDoc中文注释

---

### T-006B [P] 实现 Permission 聚合根

**文件路径**: `libs/saas-core/src/domain/aggregates/permission.aggregate.ts`

**核心要求**:

1. 继承 @hl8/domain-kernel 的 AggregateRoot
2. 协调内部实体 PermissionEntity
3. 发布领域事件
4. 管理聚合边界

**验收标准**:

- [ ] 继承 AggregateRoot
- [ ] 包含私有 PermissionEntity 实例
- [ ] 协调内部实体执行业务操作
- [ ] 发布领域事件
- [ ] 完整的TSDoc中文注释

---

### T-007A [P] 实现 RoleEntity（内部实体）

**文件路径**: `libs/saas-core/src/domain/entities/role-entity.ts`

**核心要求**:

1. **实体与聚合根分离** ⚠️ **MANDATORY**: 内部实体执行具体业务操作和维护自身状态
2. **充血模型**: 实体包含业务逻辑，不只是数据容器
3. **角色权限管理**: 支持角色权限的分配和继承
4. **中文TSDoc文档**: 所有公共方法必须有完整TSDoc注释

**验收标准**:

- [ ] 所有属性为private，通过方法访问
- [ ] 包含完整的业务方法（添加权限、移除权限、权限检查）
- [ ] 支持角色权限继承
- [ ] 完整的TSDoc中文注释

---

### T-007B [P] 实现 Role 聚合根

**文件路径**: `libs/saas-core/src/domain/aggregates/role.aggregate.ts`

**核心要求**:

1. 继承 @hl8/domain-kernel 的 AggregateRoot
2. 协调内部实体 RoleEntity
3. 发布领域事件
4. 管理聚合边界

**验收标准**:

- [ ] 继承 AggregateRoot
- [ ] 包含私有 RoleEntity 实例
- [ ] 协调内部实体执行业务操作
- [ ] 发布领域事件
- [ ] 完整的TSDoc中文注释

---

### T-008A [P] 实现 CredentialEntity（内部实体）

**文件路径**: `libs/saas-core/src/domain/entities/credential-entity.ts`

**核心要求**:

1. **实体与聚合根分离** ⚠️ **MANDATORY**: 内部实体执行具体业务操作和维护自身状态
2. **充血模型**: 实体包含业务逻辑，不只是数据容器
3. **凭证管理**: 支持多种凭证类型的管理
4. **中文TSDoc文档**: 所有公共方法必须有完整TSDoc注释

**验收标准**:

- [ ] 所有属性为private，通过方法访问
- [ ] 包含完整的业务方法（验证、更新、过期检查）
- [ ] 支持多种凭证类型
- [ ] 完整的TSDoc中文注释

---

### T-008B [P] 实现 Credential 聚合根

**文件路径**: `libs/saas-core/src/domain/aggregates/credential.aggregate.ts`

**核心要求**:

1. 继承 @hl8/domain-kernel 的 AggregateRoot
2. 协调内部实体 CredentialEntity
3. 发布领域事件
4. 管理聚合边界

**验收标准**:

- [ ] 继承 AggregateRoot
- [ ] 包含私有 CredentialEntity 实例
- [ ] 协调内部实体执行业务操作
- [ ] 发布领域事件
- [ ] 完整的TSDoc中文注释

---

## 📊 Phase 5: 领域事件

### T-009-T016 [P] 实现领域事件

**文件路径**: `libs/saas-core/src/domain/events/`

**事件列表**:

- [ ] PermissionCreated 事件
- [ ] PermissionAssigned 事件
- [ ] PermissionRevoked 事件
- [ ] RoleCreated 事件
- [ ] RoleAssigned 事件
- [ ] RoleRevoked 事件
- [ ] CredentialCreated 事件
- [ ] CredentialUpdated 事件
- [ ] AuthenticationSuccess 事件
- [ ] AuthenticationFailed 事件

**验收标准**:

- [ ] 每个事件继承 DomainEvent 接口
- [ ] 包含完整的事件数据
- [ ] 使用 GenericEntityId 生成 eventId
- [ ] 完整的TSDoc中文注释

---

## 🔧 Phase 6: 领域服务

### T-017 [P] 实现 PermissionService

**文件路径**: `libs/saas-core/src/domain/domain-services/permission.service.ts`

**核心要求**:

1. 权限分配和撤销逻辑
2. 权限验证逻辑
3. 权限层级检查

---

### T-018 [P] 实现 RoleService

**文件路径**: `libs/saas-core/src/domain/domain-services/role.service.ts`

**核心要求**:

1. 角色分配和撤销逻辑
2. 角色权限继承逻辑
3. 角色层级检查

---

### T-019 [P] 实现 AuthenticationService

**文件路径**: `libs/saas-core/src/domain/domain-services/authentication.service.ts`

**核心要求**:

1. 用户认证逻辑
2. 凭证验证逻辑
3. 会话管理逻辑

---

### T-020 [P] 实现 AuthorizationService

**文件路径**: `libs/saas-core/src/domain/domain-services/authorization.service.ts`

**核心要求**:

1. 访问控制逻辑
2. 权限检查逻辑
3. 授权决策逻辑

---

## ✅ Phase 7: 验收检查表

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

- [ ] ✅ 权限层级正确实现（Platform Admin > Tenant Admin > Organization Admin > Department Admin > User）
- [ ] ✅ 角色权限继承正确实现
- [ ] ✅ 权限验证规则完整
- [ ] ✅ 访问控制逻辑正确

### TSDoc 文档

- [ ] ✅ 所有公共类有 @description
- [ ] ✅ 所有公共方法有完整TSDoc
- [ ] ✅ 使用中文注释
- [ ] ✅ 包含 @example 示例

---

## 📝 执行顺序

### 推荐并行执行

**Phase 2 (值对象)**: 可以并行创建

**Phase 3 (实体与聚合根)**: 必须按顺序

- T-006A (PermissionEntity) → T-006B (Permission Aggregate)
- T-007A (RoleEntity) → T-007B (Role Aggregate)
- T-008A (CredentialEntity) → T-008B (Credential Aggregate)

**Phase 5 (领域事件)**: 可以并行创建

---

## 📌 注意事项

1. **实体与聚合根分离原则**: 所有聚合都必须分离，即使是简单聚合
2. **优先使用 @hl8/domain-kernel**: 使用现有的 ID 类型
3. **权限层级**: 严格遵循权限层级（Platform Admin > Tenant Admin > Organization Admin > Department Admin > User）
4. **中文TSDoc文档**: 所有公共API必须有完整的中文TSDoc注释
5. **充血模型**: 业务逻辑在领域对象内，不是纯数据容器
