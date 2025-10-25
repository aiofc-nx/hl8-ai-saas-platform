# Data Model: libs/saas-core

> **日期**: 2025-01-27  
> **分支**: 005-spec-documentation  
> **目的**: 定义 libs/saas-core 模块的完整数据模型

---

## 📋 模型概览

libs/saas-core 模块实现了多租户 SAAS 平台的核心业务域，包含租户、组织、部门、用户、角色等核心聚合。

---

## 🏗️ 聚合根（Aggregate Roots）

### 1. TenantAggregate（租户聚合）

**聚合根**: TenantAggregate  
**实体**: Tenant  
**边界**: 租户本身及其所有配置和资源限制

#### 属性

```typescript
class TenantAggregate extends AggregateRoot {
  // 核心实体
  private _tenant: Tenant;
  
  // 服务依赖
  private _trialPeriodService: TrialPeriodService;
  private _trialPeriodConfig: TrialPeriodConfig;
  private _tenantCreationRules: TenantCreationRules;
  private _resourceMonitoringService: ResourceMonitoringService;
}
```

#### Tenant 实体

```typescript
class Tenant extends BaseEntity<TenantId> {
  private _code: TenantCode;              // 租户代码
  private _name: TenantName;              // 租户名称
  private _type: TenantType;              // 租户类型
  private _status: TenantStatus;          // 租户状态
  private _description?: string;          // 描述
  private _contactEmail?: string;         // 联系邮箱
  private _contactPhone?: string;         // 联系电话
  private _address?: string;              // 地址
  private _subscriptionStartDate?: Date;  // 订阅开始日期
  private _subscriptionEndDate?: Date;    // 订阅结束日期
  private _settings: Record<string, any>; // 设置
}
```

#### 值对象

- **TenantCode**: 租户代码（唯一标识）
- **TenantName**: 租户名称
- **TenantType**: 租户类型（FREE, BASIC, PROFESSIONAL, ENTERPRISE, CUSTOM）
- **TenantStatus**: 租户状态（PENDING, ACTIVE, SUSPENDED, EXPIRED, DELETED）

#### 领域事件

- **TenantCreatedEvent**: 租户创建
- **TenantActivatedEvent**: 租户激活
- **TenantSuspendedEvent**: 租户暂停
- **TenantResumedEvent**: 租户恢复
- **TenantCancelledEvent**: 租户取消
- **TrialExpiredEvent**: 试用期过期

#### 业务规则

1. 租户代码必须唯一
2. 租户状态转换必须遵循状态机
3. 试用期到期后自动转为过期状态
4. 资源使用超过限制时发布警告或错误事件

---

### 2. OrganizationAggregate（组织聚合）

**聚合根**: OrganizationAggregate  
**实体**: Organization  
**边界**: 组织本身及其组织结构

#### 属性

```typescript
class OrganizationAggregate extends AggregateRoot<OrganizationId> {
  private _organization: Organization;
  private _userAssignmentRules: UserAssignmentRules;
}
```

#### Organization 实体

```typescript
class Organization extends BaseEntity<OrganizationId> {
  private _name: string;                     // 组织名称
  private _description?: string;             // 描述
  private _type: OrganizationTypeEnum;       // 组织类型
  private _status: OrganizationStatusEnum;   // 组织状态
  private _parentId?: OrganizationId;        // 父组织ID
  private _level: number;                    // 层级
  private _path: string;                     // 路径
  private _settings: Record<string, unknown>; // 设置
  private _metadata: Record<string, unknown>; // 元数据
  private _isShared: boolean;                // 是否共享
  private _sharingLevel?: SharingLevel;      // 共享级别
}
```

#### 组织类型（OrganizationTypeEnum）

- **COMMITTEE**: 委员会
- **PROJECT_TEAM**: 项目团队
- **QUALITY_GROUP**: 质量小组
- **PERFORMANCE_GROUP**: 绩效小组

#### 领域事件

- **UserAssignmentConflictEvent**: 用户分配冲突

---

### 3. DepartmentAggregate（部门聚合）

**聚合根**: DepartmentAggregate  
**实体**: Department  
**边界**: 部门本身及其层级结构

#### 属性

```typescript
class DepartmentAggregate extends AggregateRoot<DepartmentId> {
  private _department: Department;
}
```

#### Department 实体

```typescript
class Department extends BaseEntity<DepartmentId> {
  private _name: string;                    // 部门名称
  private _code: string;                    // 部门代码
  private _organizationId: OrganizationId;  // 组织ID
  private _parentId: DepartmentId | null;   // 父部门ID
  private _level: number;                   // 层级
}
```

#### 业务规则

1. 部门最多支持 8 层嵌套
2. 部门不能是其自己的子部门（避免循环引用）

---

### 4. UserAggregate（用户聚合）

**聚合根**: UserAggregate（待实现）  
**实体**: User

#### 属性

```typescript
class User extends BaseEntity<UserId> {
  private _email: string;               // 邮箱
  private _username: string;            // 用户名
  private _displayName: string;         // 显示名称
  private _type: UserTypeEnum;          // 用户类型
  private _status: UserStatusEnum;      // 用户状态
  private _firstName?: string;          // 名
  private _lastName?: string;           // 姓
  private _phone?: string;              // 电话
  private _avatar?: string;             // 头像
  private _timezone?: string;           // 时区
  private _language?: string;           // 语言
  private _organizationId?: OrganizationId;   // 组织ID
  private _departmentId?: DepartmentId;       // 部门ID
}
```

---

## 🎯 值对象（Value Objects）

### 租户相关

- **TenantCode**: 租户代码（唯一）
- **TenantName**: 租户名称
- **TenantType**: 租户类型
- **TenantStatus**: 租户状态
- **TrialPeriodConfig**: 试用期配置

### 组织相关

- **OrganizationTypeEnum**: 组织类型枚举
- **OrganizationStatusEnum**: 组织状态枚举

### 用户相关

- **UserTypeEnum**: 用户类型枚举
- **UserStatusEnum**: 用户状态枚举
- **UserOrganizationAssignment**: 用户组织分配
- **UserDepartmentAssignment**: 用户部门分配

### 资源相关

- **ResourceLimits**: 资源限制
- **ResourceUsage**: 资源使用情况
- **ResourceType**: 资源类型

### 权限相关

- **RoleLevel**: 角色级别
- **PermissionTemplate**: 权限模板
- **CaslRule**: CASL 规则
- **CaslCondition**: CASL 条件

---

## 🔗 关系图

```
Platform (平台)
    │
    ├─ Tenant (租户) - 1:N
    │   │
    │   ├─ Organization (组织) - 1:N
    │   │   │
    │   │   ├─ Department (部门) - 1:N
    │   │   │   │
    │   │   │   └─ User (用户) - N:1
    │   │   │
    │   │   └─ User (用户) - N:1
    │   │
    │   ├─ User (用户) - N:1
    │   │
    │   └─ Role (角色) - 1:N
    │       │
    │       └─ CaslAbility (权限) - 1:N
    │
    └─ PlatformUser (平台用户) - 1:N
```

---

## 📊 数据隔离层级

### 隔离级别

1. **Platform (平台级)**: 平台管理员数据
2. **Tenant (租户级)**: 租户级数据（默认隔离级别）
3. **Organization (组织级)**: 组织级数据
4. **Department (部门级)**: 部门级数据
5. **User (用户级)**: 用户级数据

### 隔离字段

所有实体都包含以下隔离字段：

```typescript
abstract class BaseEntity {
  protected readonly _tenantId: TenantId;          // 必填
  protected readonly _organizationId?: OrganizationId; // 可选
  protected readonly _departmentId?: DepartmentId;     // 可选
  protected readonly _userId?: UserId;                 // 可选
  protected readonly _isShared: boolean;               // 是否共享
  protected readonly _sharingLevel?: SharingLevel;     // 共享级别
}
```

---

## 🔄 状态转换

### Tenant 状态机

```
PENDING → ACTIVE → SUSPENDED → CANCELLED
    ↓        ↓
  EXPIRED  EXPIRED → DELETED
```

### Organization 状态机

```
INACTIVE → ACTIVE → INACTIVE
```

### User 状态机

```
PENDING → ACTIVE → INACTIVE
    ↓        ↓
  LOCKED   SUSPENDED → DELETED
```

---

## 📝 验证规则

### Tenant

1. 租户代码必须唯一
2. 租户名称不能为空
3. 租户类型必须是有效的枚举值
4. 试用期配置必须有效

### Organization

1. 组织名称不能为空
2. 组织类型必须是有效的枚举值
3. 组织层级不能超过限制

### Department

1. 部门名称不能为空
2. 部门代码在组织内必须唯一
3. 部门层级不能超过 8 层
4. 不能形成循环引用

### User

1. 邮箱必须唯一
2. 用户名必须唯一
3. 显示名称不能为空

---

## 🔐 权限模型

### 角色层级

```
PlatformAdmin (平台管理员)
    ↓
TenantAdmin (租户管理员)
    ↓
OrganizationAdmin (组织管理员)
    ↓
DepartmentAdmin (部门管理员)
    ↓
RegularUser (普通用户)
```

### CASL 权限

使用 CASL 定义细粒度权限：

```typescript
interface CaslAbility {
  userId: UserId;
  roleId?: RoleId;
  subject: string;      // 资源类型
  action: string;       // 操作类型
  conditions: CaslCondition[]; // 条件
  context: IsolationContext;   // 隔离上下文
}
```

---

## 📈 资源管理

### 资源限制

```typescript
interface ResourceLimits {
  maxUsers: number;           // 最大用户数
  maxOrganizations: number;   // 最大组织数
  maxStorage: number;         // 最大存储
  maxBandwidth: number;       // 最大带宽
}
```

### 资源使用

```typescript
interface ResourceUsage {
  currentUsers: number;       // 当前用户数
  currentOrganizations: number; // 当前组织数
  currentStorage: number;     // 当前存储
  currentBandwidth: number;   // 当前带宽
}
```

---

## 🎯 总结

libs/saas-core 数据模型支持：

- ✅ 5 级数据隔离（Platform/Tenant/Organization/Department/User）
- ✅ 多租户架构（8 个业务子域）
- ✅ 完整的状态管理和业务规则
- ✅ 细粒度的权限控制（CASL）
- ✅ 资源限制和监控
- ✅ 事件驱动的领域建模
