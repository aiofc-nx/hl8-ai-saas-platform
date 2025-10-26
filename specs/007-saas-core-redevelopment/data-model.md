# Data Model: SAAS Core Module

**Date**: 2024-12-19  
**Feature**: SAAS Core Module Redevelopment  
**Branch**: 007-saas-core-redevelopment

## Overview

本文档定义了SAAS Core模块的完整数据模型，基于Clean Architecture + DDD + CQRS + ES + EDA混合架构模式，使用@hl8内核组件进行开发。所有数据隔离功能必须基于 `@hl8/domain-kernel/src/isolation` 组件实现。

## Core Entities

### 1. Platform (平台)

**职责**: 平台级数据管理，全局配置和监控

```typescript
// 基于@hl8/domain-kernel的BaseEntity
export class Platform extends BaseEntity<PlatformId> {
  private constructor(
    id: PlatformId,
    private _name: string,
    private _description: string,
    private _settings: PlatformSettings,
    private _status: PlatformStatus,
    private _createdAt: Date,
    private _updatedAt: Date
  ) {
    super(id);
  }

  // 业务方法
  public updateSettings(settings: PlatformSettings): void {
    // 业务逻辑：更新平台设置
  }

  public activate(): void {
    // 业务逻辑：激活平台
  }

  public deactivate(): void {
    // 业务逻辑：停用平台
  }
}
```

**字段定义**:

- `id`: PlatformId (值对象)
- `name`: string (平台名称)
- `description`: string (平台描述)
- `settings`: PlatformSettings (平台设置)
- `status`: PlatformStatus (平台状态)
- `createdAt`: Date (创建时间)
- `updatedAt`: Date (更新时间)

**业务规则**:

- 平台名称必须唯一
- 平台设置必须符合业务规则
- 平台状态变更必须记录审计日志

### 2. Tenant (租户)

**职责**: 租户级数据管理，多租户隔离的核心实体

```typescript
// 基于@hl8/domain-kernel的AggregateRoot
export class Tenant extends AggregateRoot<TenantId> {
  private constructor(
    id: TenantId,
    private _name: TenantName,
    private _code: TenantCode,
    private _type: TenantType,
    private _status: TenantStatus,
    private _settings: TenantSettings,
    private _resourceLimits: ResourceLimits,
    private _resourceUsage: ResourceUsage,
    private _trialConfig: TrialPeriodConfig,
    private _createdAt: Date,
    private _updatedAt: Date
  ) {
    super(id);
  }

  // 业务方法
  public createOrganization(name: string, type: OrganizationType): Organization {
    // 业务逻辑：创建组织
  }

  public updateSettings(settings: TenantSettings): void {
    // 业务逻辑：更新租户设置
  }

  public checkResourceLimits(): boolean {
    // 业务逻辑：检查资源限制
  }
}
```

**字段定义**:

- `id`: TenantId (值对象)
- `name`: TenantName (值对象)
- `code`: TenantCode (值对象)
- `type`: TenantType (值对象)
- `status`: TenantStatus (值对象)
- `settings`: TenantSettings (值对象)
- `resourceLimits`: ResourceLimits (值对象)
- `resourceUsage`: ResourceUsage (值对象)
- `trialConfig`: TrialPeriodConfig (值对象)
- `createdAt`: Date (创建时间)
- `updatedAt`: Date (更新时间)

**业务规则**:

- 租户名称在平台内必须唯一
- 租户类型决定资源限制
- 租户状态变更必须记录审计日志
- 资源使用不能超过限制

### 3. Organization (组织)

**职责**: 组织级数据管理，租户内的横向管理单位

```typescript
// 基于@hl8/domain-kernel的BaseEntity
export class Organization extends BaseEntity<OrganizationId> {
  private constructor(
    id: OrganizationId,
    private _tenantId: TenantId,
    private _name: string,
    private _type: OrganizationType,
    private _description: string,
    private _isShared: boolean,
    private _settings: OrganizationSettings,
    private _createdAt: Date,
    private _updatedAt: Date
  ) {
    super(id);
  }

  // 业务方法
  public createDepartment(name: string, level: number): Department {
    // 业务逻辑：创建部门
  }

  public shareWithTenant(): void {
    // 业务逻辑：与租户共享
  }

  public makePrivate(): void {
    // 业务逻辑：设为私有
  }
}
```

**字段定义**:

- `id`: OrganizationId (值对象)
- `tenantId`: TenantId (租户ID)
- `name`: string (组织名称)
- `type`: OrganizationType (值对象)
- `description`: string (组织描述)
- `isShared`: boolean (是否共享)
- `settings`: OrganizationSettings (值对象)
- `createdAt`: Date (创建时间)
- `updatedAt`: Date (更新时间)

**业务规则**:

- 组织名称在租户内必须唯一
- 组织类型决定权限范围
- 共享组织对租户内所有用户可见
- 私有组织仅对组织成员可见

### 4. Department (部门)

**职责**: 部门级数据管理，组织内的纵向管理单位

```typescript
// 基于@hl8/domain-kernel的BaseEntity
export class Department extends BaseEntity<DepartmentId> {
  private constructor(
    id: DepartmentId,
    private _organizationId: OrganizationId,
    private _name: string,
    private _level: number,
    private _parentId: DepartmentId | null,
    private _path: string,
    private _description: string,
    private _settings: DepartmentSettings,
    private _createdAt: Date,
    private _updatedAt: Date
  ) {
    super(id);
  }

  // 业务方法
  public createSubDepartment(name: string): Department {
    // 业务逻辑：创建子部门
  }

  public moveToParent(newParentId: DepartmentId): void {
    // 业务逻辑：移动到新父部门
  }

  public getFullPath(): string {
    // 业务逻辑：获取完整路径
  }
}
```

**字段定义**:

- `id`: DepartmentId (值对象)
- `organizationId`: OrganizationId (组织ID)
- `name`: string (部门名称)
- `level`: number (部门层级)
- `parentId`: DepartmentId | null (父部门ID)
- `path`: string (部门路径)
- `description`: string (部门描述)
- `settings`: DepartmentSettings (值对象)
- `createdAt`: Date (创建时间)
- `updatedAt`: Date (更新时间)

**业务规则**:

- 部门层级不能超过7层
- 部门名称在组织内必须唯一
- 部门路径必须正确反映层级关系
- 部门移动必须更新所有子部门路径

### 5. User (用户)

**职责**: 用户级数据管理，系统的最小访问单位

```typescript
// 基于@hl8/domain-kernel的BaseEntity
export class User extends BaseEntity<UserId> {
  private constructor(
    id: UserId,
    private _tenantId: TenantId,
    private _username: string,
    private _email: string,
    private _profile: UserProfile,
    private _status: UserStatus,
    private _type: UserType,
    private _source: UserSource,
    private _affiliation: UserAffiliation,
    private _organizations: UserOrganizationAssignment[],
    private _departments: UserDepartmentAssignment[],
    private _createdAt: Date,
    private _updatedAt: Date
  ) {
    super(id);
  }

  // 业务方法
  public assignToOrganization(organizationId: OrganizationId, role: string): void {
    // 业务逻辑：分配到组织
  }

  public assignToDepartment(departmentId: DepartmentId, role: string): void {
    // 业务逻辑：分配到部门
  }

  public switchContext(organizationId: OrganizationId, departmentId: DepartmentId): void {
    // 业务逻辑：切换工作上下文
  }
}
```

**字段定义**:

- `id`: UserId (值对象)
- `tenantId`: TenantId (租户ID)
- `username`: string (用户名)
- `email`: string (邮箱)
- `profile`: UserProfile (值对象)
- `status`: UserStatus (值对象)
- `type`: UserType (值对象)
- `source`: UserSource (值对象)
- `affiliation`: UserAffiliation (值对象)
- `organizations`: UserOrganizationAssignment[] (组织分配)
- `departments`: UserDepartmentAssignment[] (部门分配)
- `createdAt`: Date (创建时间)
- `updatedAt`: Date (更新时间)

**业务规则**:

- 用户名在租户内必须唯一
- 邮箱在平台内必须唯一
- 用户只能属于一个组织内的一个部门
- 用户可以同时属于多个组织
- 用户状态变更必须记录审计日志

## Value Objects

### 1. TenantType (租户类型)

```typescript
// 基于@hl8/domain-kernel的BaseValueObject
export class TenantType extends BaseValueObject<string> {
  public static readonly FREE = new TenantType('FREE');
  public static readonly BASIC = new TenantType('BASIC');
  public static readonly PROFESSIONAL = new TenantType('PROFESSIONAL');
  public static readonly ENTERPRISE = new TenantType('ENTERPRISE');
  public static readonly CUSTOM = new TenantType('CUSTOM');

  private constructor(value: string) {
    super(value);
  }

  public getResourceLimits(): ResourceLimits {
    // 业务逻辑：获取资源限制
  }
}
```

### 2. ResourceLimits (资源限制)

```typescript
// 基于@hl8/domain-kernel的BaseValueObject
export class ResourceLimits extends BaseValueObject<ResourceLimitsData> {
  private constructor(
    private _maxUsers: number,
    private _maxStorage: number,
    private _maxOrganizations: number,
    private _maxApiCalls: number
  ) {
    super({ maxUsers: _maxUsers, maxStorage: _maxStorage, maxOrganizations: _maxOrganizations, maxApiCalls: _maxApiCalls });
  }

  public checkLimit(usage: ResourceUsage): boolean {
    // 业务逻辑：检查是否超出限制
  }
}
```

### 3. TenantStatus (租户状态)

```typescript
// 基于@hl8/domain-kernel的BaseValueObject
export class TenantStatus extends BaseValueObject<string> {
  public static readonly TRIAL = new TenantStatus('TRIAL');
  public static readonly ACTIVE = new TenantStatus('ACTIVE');
  public static readonly SUSPENDED = new TenantStatus('SUSPENDED');
  public static readonly EXPIRED = new TenantStatus('EXPIRED');
  public static readonly DELETED = new TenantStatus('DELETED');

  private constructor(value: string) {
    super(value);
  }

  public canTransitionTo(newStatus: TenantStatus): boolean {
    // 业务逻辑：检查状态转换是否合法
  }
}
```

## Domain Events

### 1. TenantCreatedEvent

```typescript
export class TenantCreatedEvent extends DomainEvent {
  constructor(
    public readonly tenantId: TenantId,
    public readonly tenantName: string,
    public readonly tenantType: TenantType,
    public readonly occurredOn: Date
  ) {
    super();
  }
}
```

### 2. OrganizationCreatedEvent

```typescript
export class OrganizationCreatedEvent extends DomainEvent {
  constructor(
    public readonly organizationId: OrganizationId,
    public readonly tenantId: TenantId,
    public readonly organizationName: string,
    public readonly occurredOn: Date
  ) {
    super();
  }
}
```

### 3. UserAssignedToOrganizationEvent

```typescript
export class UserAssignedToOrganizationEvent extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly organizationId: OrganizationId,
    public readonly role: string,
    public readonly occurredOn: Date
  ) {
    super();
  }
}
```

## Data Isolation Strategy

### 基于 @hl8/domain-kernel 隔离组件实现

所有数据隔离功能必须基于 `@hl8/domain-kernel/src/isolation` 组件实现：

#### 核心隔离组件使用

```typescript
// 导入隔离组件
import { 
  IsolationContext, 
  IsolationLevel, 
  SharingLevel, 
  DataAccessContext,
  IsolationContextCreatedEvent,
  DataAccessDeniedEvent,
  IsolationValidationError
} from "@hl8/domain-kernel";

// 创建隔离上下文
const tenantContext = IsolationContext.tenant(tenantId);
const orgContext = IsolationContext.organization(tenantId, organizationId);
const deptContext = IsolationContext.department(tenantId, organizationId, departmentId);
const userContext = IsolationContext.user(userId, tenantId);

// 使用隔离上下文进行数据访问
const whereClause = context.buildWhereClause('u'); // 生成数据库查询条件
const cacheKey = context.buildCacheKey('user', 'list'); // 生成缓存键
const canAccess = context.canAccess(dataContext, SharingLevel.ORGANIZATION); // 检查访问权限
```

#### 数据库查询隔离实现

```typescript
// 仓储层实现示例
async findById(id: TenantId, context?: IsolationContext): Promise<TenantAggregate | null> {
  const whereClause = context?.buildWhereClause('t') || {};
  const entity = await this.em.findOne(TenantEntity, {
    id: id.getValue(),
    ...whereClause
  });
  
  if (!entity) return null;
  
  // 验证访问权限
  if (context && !context.canAccess(IsolationContext.tenant(id), SharingLevel.TENANT)) {
    throw new IsolationValidationError("无权限访问租户数据", "ACCESS_DENIED");
  }
  
  return TenantMapper.toDomain(entity);
}
```

#### 缓存隔离实现

```typescript
// 缓存服务实现示例
async get(key: string, context: IsolationContext): Promise<any> {
  const cacheKey = context.buildCacheKey('data', key);
  return await this.cache.get(cacheKey);
}

async set(key: string, value: any, context: IsolationContext): Promise<void> {
  const cacheKey = context.buildCacheKey('data', key);
  await this.cache.set(cacheKey, value);
}
```

### 1. 5层隔离架构

```text
Platform Level (平台级)
├── Tenant Level (租户级)
│   ├── Organization Level (组织级)
│   │   ├── Department Level (部门级)
│   │   │   └── User Level (用户级)
```

### 2. 数据分类

**共享数据 (Shared Data)**:

- 平台级共享：所有租户可见
- 租户级共享：租户内所有组织可见
- 组织级共享：组织内所有部门可见
- 部门级共享：部门内所有用户可见

**非共享数据 (Non-Shared Data)**:

- 用户级私有：仅用户本人可见
- 部门级私有：仅部门成员可见
- 组织级私有：仅组织成员可见
- 租户级私有：仅租户成员可见

### 3. 访问规则

**隔离规则**:

- 所有数据访问必须携带完整的隔离上下文
- 系统自动根据隔离上下文过滤数据
- 跨层级数据访问必须经过明确授权

**共享规则**:

- 上级层级的共享数据对下级可见
- 下级层级的数据对上级不可见
- 同级层级的非共享数据相互隔离

## Database Schema

### 1. 核心表结构

```sql
-- 平台表
CREATE TABLE platforms (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  settings JSONB,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- 租户表
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  settings JSONB,
  resource_limits JSONB,
  resource_usage JSONB,
  trial_config JSONB,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- 组织表
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  is_shared BOOLEAN NOT NULL DEFAULT FALSE,
  settings JSONB,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  UNIQUE(tenant_id, name)
);

-- 部门表
CREATE TABLE departments (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  level INTEGER NOT NULL,
  parent_id UUID REFERENCES departments(id),
  path VARCHAR(1000) NOT NULL,
  description TEXT,
  settings JSONB,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  UNIQUE(organization_id, name)
);

-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  profile JSONB,
  status VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL,
  source VARCHAR(50) NOT NULL,
  affiliation VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  UNIQUE(tenant_id, username),
  UNIQUE(email)
);
```

### 2. RLS策略

```sql
-- 启用RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 租户级隔离策略
CREATE POLICY tenant_isolation ON tenants
  FOR ALL TO application_role
  USING (id = current_setting('app.current_tenant_id')::UUID);

-- 组织级隔离策略
CREATE POLICY organization_isolation ON organizations
  FOR ALL TO application_role
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- 部门级隔离策略
CREATE POLICY department_isolation ON departments
  FOR ALL TO application_role
  USING (organization_id = current_setting('app.current_organization_id')::UUID);

-- 用户级隔离策略
CREATE POLICY user_isolation ON users
  FOR ALL TO application_role
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

## Validation Rules

### 1. 实体验证规则

**Platform**:

- 名称不能为空且长度不超过255字符
- 描述长度不超过1000字符
- 状态必须是有效值

**Tenant**:

- 名称不能为空且长度不超过255字符
- 代码必须是唯一标识符
- 类型必须是有效值
- 资源限制必须大于0

**Organization**:

- 名称不能为空且长度不超过255字符
- 类型必须是有效值
- 描述长度不超过1000字符

**Department**:

- 名称不能为空且长度不超过255字符
- 层级不能超过7层
- 路径必须正确反映层级关系

**User**:

- 用户名不能为空且长度不超过255字符
- 邮箱必须是有效格式
- 状态必须是有效值

### 2. 业务规则验证

**租户创建**:

- 租户名称在平台内必须唯一
- 租户类型决定资源限制
- 试用期配置必须有效

**组织管理**:

- 组织名称在租户内必须唯一
- 组织类型决定权限范围
- 共享设置必须符合业务规则

**部门管理**:

- 部门名称在组织内必须唯一
- 部门层级不能超过7层
- 部门路径必须正确

**用户管理**:

- 用户名在租户内必须唯一
- 邮箱在平台内必须唯一
- 用户分配必须符合业务规则

## State Transitions

### 1. 租户状态转换

```
TRIAL → ACTIVE (试用期结束，激活)
TRIAL → EXPIRED (试用期结束，未激活)
ACTIVE → SUSPENDED (暂停服务)
SUSPENDED → ACTIVE (恢复服务)
ACTIVE → EXPIRED (服务到期)
EXPIRED → DELETED (删除租户)
```

### 2. 用户状态转换

```
PENDING → ACTIVE (用户激活)
ACTIVE → SUSPENDED (暂停用户)
SUSPENDED → ACTIVE (恢复用户)
ACTIVE → INACTIVE (停用用户)
INACTIVE → DELETED (删除用户)
```

## Performance Considerations

### 1. 索引策略

```sql
-- 租户表索引
CREATE INDEX idx_tenants_name ON tenants(name);
CREATE INDEX idx_tenants_code ON tenants(code);
CREATE INDEX idx_tenants_type ON tenants(type);
CREATE INDEX idx_tenants_status ON tenants(status);

-- 组织表索引
CREATE INDEX idx_organizations_tenant_id ON organizations(tenant_id);
CREATE INDEX idx_organizations_name ON organizations(name);
CREATE INDEX idx_organizations_type ON organizations(type);

-- 部门表索引
CREATE INDEX idx_departments_organization_id ON departments(organization_id);
CREATE INDEX idx_departments_parent_id ON departments(parent_id);
CREATE INDEX idx_departments_path ON departments(path);

-- 用户表索引
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
```

### 2. 查询优化

- 使用适当的索引
- 避免全表扫描
- 使用分页查询
- 缓存频繁查询结果

### 3. 数据分区

- 按租户ID分区
- 按时间分区
- 使用表分区策略

## Security Considerations

### 1. 数据加密

- 敏感数据加密存储
- 传输数据加密
- 密钥管理

### 2. 访问控制

- 基于角色的访问控制
- 细粒度权限管理
- 审计日志记录

### 3. 数据备份

- 定期数据备份
- 灾难恢复计划
- 数据完整性检查

## Next Steps

1. **Phase 1**: 生成API合约（contracts/）
2. **Phase 1**: 生成快速开始指南（quickstart.md）
3. **Phase 1**: 更新代理上下文
4. **Phase 2**: 生成任务分解（tasks.md）

## Data Model Status

✅ **Core entities defined**  
✅ **Value objects defined**  
✅ **Domain events defined**  
✅ **Data isolation strategy defined**  
✅ **Database schema designed**  
✅ **Validation rules defined**  
✅ **State transitions defined**  
✅ **Performance considerations documented**  
✅ **Security considerations documented**  

## Ready for Phase 1: API Contracts Generation
