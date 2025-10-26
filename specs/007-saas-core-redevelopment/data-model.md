# Data Model: SAAS Core Module

**Date**: 2024-12-19  
**Feature**: SAAS Core Module Redevelopment  
**Phase**: 1 - Design

## Overview

This document defines the complete data model for the SAAS Core module redevelopment, including all domain entities, value objects, aggregates, and their relationships. The model follows Clean Architecture principles and uses @hl8/domain-kernel base classes.

## Core Domain Entities

### 1. Platform Entity

**职责**: SAAS服务提供商，负责系统开发、技术支持、商业服务，管理所有租户和用户

```typescript
/**
 * 平台实体 - SAAS服务提供商
 * @description 负责系统开发、技术支持、商业服务，管理所有租户和用户，具有全局配置和管理能力
 */
export class Platform extends BaseEntity<PlatformId> {
  private constructor(
    id: PlatformId,
    private _name: string,
    private _description: string,
    private _status: PlatformStatus,
    private _configuration: PlatformConfiguration,
    private _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  // 业务方法
  public createTenant(tenantData: CreateTenantData): Tenant {
    // 创建租户的业务逻辑
  }

  public suspendTenant(tenantId: TenantId, reason: string): void {
    // 暂停租户的业务逻辑
  }

  public getGlobalStatistics(): GlobalStatistics {
    // 获取全局统计信息
  }
}
```

**属性**:

- `id: PlatformId` - 平台唯一标识
- `name: string` - 平台名称
- `description: string` - 平台描述
- `status: PlatformStatus` - 平台状态 (ACTIVE, MAINTENANCE, SUSPENDED)
- `configuration: PlatformConfiguration` - 平台配置
- `createdAt: Date` - 创建时间
- `updatedAt: Date` - 更新时间

**业务规则**:

- 平台只能有一个活跃实例
- 平台状态变更必须记录审计日志
- 平台配置变更需要管理员权限

### 2. Tenant Entity

**职责**: 独立客户单位，具有隔离的数据空间和配置环境

```typescript
/**
 * 租户实体 - 独立客户单位
 * @description 具有隔离的数据空间和配置环境，支持企业租户、社群租户、团队租户、个人租户四种类型
 */
export class Tenant extends AggregateRoot<TenantId> {
  private constructor(
    id: TenantId,
    private _name: string,
    private _type: TenantType,
    private _status: TenantStatus,
    private _configuration: TenantConfiguration,
    private _resourceLimits: ResourceLimits,
    private _organizations: Set<OrganizationId>,
    private _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  // 业务方法
  public createOrganization(orgData: CreateOrganizationData): Organization {
    // 创建组织的业务逻辑
  }

  public updateResourceLimits(limits: ResourceLimits): void {
    // 更新资源限制的业务逻辑
  }

  public canCreateOrganization(): boolean {
    // 检查是否可以创建新组织
  }

  public suspend(reason: string): void {
    // 暂停租户的业务逻辑
  }
}
```

**属性**:

- `id: TenantId` - 租户唯一标识
- `name: string` - 租户名称
- `type: TenantType` - 租户类型 (ENTERPRISE, COMMUNITY, TEAM, PERSONAL)
- `status: TenantStatus` - 租户状态 (TRIAL, ACTIVE, SUSPENDED, EXPIRED, DELETED)
- `configuration: TenantConfiguration` - 租户配置
- `resourceLimits: ResourceLimits` - 资源限制
- `organizations: Set<OrganizationId>` - 组织集合
- `createdAt: Date` - 创建时间
- `updatedAt: Date` - 更新时间

**业务规则**:

- 租户名称在平台内必须唯一
- 租户资源使用不能超过限制
- 租户状态变更必须遵循生命周期规则
- 租户删除前必须处理所有依赖数据

### 3. Organization Entity

**职责**: 租户内的横向管理单位，用于特定功能

```typescript
/**
 * 组织实体 - 横向管理单位
 * @description 租户内的横向管理单位，用于特定功能，支持专业委员会、项目团队、质量控制小组、绩效管理小组
 */
export class Organization extends AggregateRoot<OrganizationId> {
  private constructor(
    id: OrganizationId,
    private _tenantId: TenantId,
    private _name: string,
    private _type: OrganizationType,
    private _description: string,
    private _status: OrganizationStatus,
    private _departments: Set<DepartmentId>,
    private _members: Set<UserId>,
    private _sharingLevel: SharingLevel,
    private _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  // 业务方法
  public createDepartment(deptData: CreateDepartmentData): Department {
    // 创建部门的业务逻辑
  }

  public addMember(userId: UserId, role: OrganizationRole): void {
    // 添加成员的业务逻辑
  }

  public removeMember(userId: UserId): void {
    // 移除成员的业务逻辑
  }

  public canAccessDepartment(departmentId: DepartmentId): boolean {
    // 检查是否可以访问部门
  }
}
```

**属性**:

- `id: OrganizationId` - 组织唯一标识
- `tenantId: TenantId` - 所属租户
- `name: string` - 组织名称
- `type: OrganizationType` - 组织类型 (COMMITTEE, PROJECT_TEAM, QUALITY_GROUP, PERFORMANCE_GROUP)
- `description: string` - 组织描述
- `status: OrganizationStatus` - 组织状态 (ACTIVE, INACTIVE, SUSPENDED)
- `departments: Set<DepartmentId>` - 部门集合
- `members: Set<UserId>` - 成员集合
- `sharingLevel: SharingLevel` - 共享级别
- `createdAt: Date` - 创建时间
- `updatedAt: Date` - 更新时间

**业务规则**:

- 组织名称在租户内必须唯一
- 组织类型决定管理结构
- 组织共享级别决定数据访问权限
- 组织删除前必须处理所有部门

### 4. Department Entity

**职责**: 组织内的纵向管理单位，具有层级结构

```typescript
/**
 * 部门实体 - 纵向管理单位
 * @description 组织内的纵向管理单位，具有层级结构，支持最多7层嵌套，具有父子关系和路径跟踪
 */
export class Department extends AggregateRoot<DepartmentId> {
  private constructor(
    id: DepartmentId,
    private _organizationId: OrganizationId,
    private _name: string,
    private _parentId: DepartmentId | null,
    private _path: string,
    private _level: number,
    private _description: string,
    private _status: DepartmentStatus,
    private _members: Set<UserId>,
    private _children: Set<DepartmentId>,
    private _sharingLevel: SharingLevel,
    private _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  // 业务方法
  public createSubDepartment(deptData: CreateDepartmentData): Department {
    // 创建子部门的业务逻辑
  }

  public moveToParent(newParentId: DepartmentId): void {
    // 移动到新父部门的业务逻辑
  }

  public addMember(userId: UserId): void {
    // 添加成员的业务逻辑
  }

  public removeMember(userId: UserId): void {
    // 移除成员的业务逻辑
  }

  public getAncestors(): Department[] {
    // 获取所有祖先部门
  }

  public getDescendants(): Department[] {
    // 获取所有后代部门
  }
}
```

**属性**:

- `id: DepartmentId` - 部门唯一标识
- `organizationId: OrganizationId` - 所属组织
- `name: string` - 部门名称
- `parentId: DepartmentId | null` - 父部门ID
- `path: string` - 部门路径
- `level: number` - 部门层级
- `description: string` - 部门描述
- `status: DepartmentStatus` - 部门状态 (ACTIVE, INACTIVE, SUSPENDED)
- `members: Set<UserId>` - 成员集合
- `children: Set<DepartmentId>` - 子部门集合
- `sharingLevel: SharingLevel` - 共享级别
- `createdAt: Date` - 创建时间
- `updatedAt: Date` - 更新时间

**业务规则**:

- 部门层级不能超过7层
- 部门路径必须唯一
- 部门移动必须更新路径
- 部门删除前必须处理所有子部门

### 5. User Entity

**职责**: 系统用户，按来源、类型、角色、状态和归属分类

```typescript
/**
 * 用户实体 - 系统用户
 * @description 按来源、类型、角色、状态和归属分类，支持平台用户、租户用户、系统用户
 */
export class User extends AggregateRoot<UserId> {
  private constructor(
    id: UserId,
    private _email: string,
    private _username: string,
    private _source: UserSource,
    private _type: UserType,
    private _role: UserRole,
    private _status: UserStatus,
    private _profile: UserProfile,
    private _organizations: Set<OrganizationId>,
    private _departments: Map<OrganizationId, DepartmentId>,
    private _permissions: Set<PermissionId>,
    private _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  // 业务方法
  public joinOrganization(
    organizationId: OrganizationId,
    departmentId: DepartmentId,
  ): void {
    // 加入组织的业务逻辑
  }

  public leaveOrganization(organizationId: OrganizationId): void {
    // 离开组织的业务逻辑
  }

  public changeDepartment(
    organizationId: OrganizationId,
    newDepartmentId: DepartmentId,
  ): void {
    // 更换部门的业务逻辑
  }

  public hasPermission(permission: Permission): boolean {
    // 检查权限的业务逻辑
  }

  public canAccessResource(
    resource: Resource,
    context: IsolationContext,
  ): boolean {
    // 检查资源访问权限
  }
}
```

**属性**:

- `id: UserId` - 用户唯一标识
- `email: string` - 邮箱地址
- `username: string` - 用户名
- `source: UserSource` - 用户来源 (PLATFORM, TENANT, SYSTEM)
- `type: UserType` - 用户类型 (PERSONAL, ENTERPRISE, COMMUNITY, TEAM)
- `role: UserRole` - 用户角色 (PLATFORM_ADMIN, TENANT_ADMIN, ORG_ADMIN, DEPT_ADMIN, USER)
- `status: UserStatus` - 用户状态 (ACTIVE, PENDING, DISABLED, LOCKED, EXPIRED)
- `profile: UserProfile` - 用户档案
- `organizations: Set<OrganizationId>` - 所属组织
- `departments: Map<OrganizationId, DepartmentId>` - 所属部门（每个组织一个）
- `permissions: Set<PermissionId>` - 权限集合
- `createdAt: Date` - 创建时间
- `updatedAt: Date` - 更新时间

**业务规则**:

- 用户在每个组织内只能属于一个部门
- 用户权限继承自角色和部门
- 用户状态变更必须记录审计日志
- 用户删除前必须处理所有关联数据

## Value Objects

### 1. TenantId Value Object

```typescript
/**
 * 租户ID值对象
 * @description 租户的唯一标识符，不可变值对象
 */
export class TenantId extends EntityId {
  constructor(value: string) {
    super(value);
  }

  public static generate(): TenantId {
    return new TenantId(`tenant_${uuidv4()}`);
  }
}
```

### 2. OrganizationId Value Object

```typescript
/**
 * 组织ID值对象
 * @description 组织的唯一标识符，不可变值对象
 */
export class OrganizationId extends EntityId {
  constructor(value: string) {
    super(value);
  }

  public static generate(): OrganizationId {
    return new OrganizationId(`org_${uuidv4()}`);
  }
}
```

### 3. DepartmentId Value Object

```typescript
/**
 * 部门ID值对象
 * @description 部门的唯一标识符，不可变值对象
 */
export class DepartmentId extends EntityId {
  constructor(value: string) {
    super(value);
  }

  public static generate(): DepartmentId {
    return new DepartmentId(`dept_${uuidv4()}`);
  }
}
```

### 4. UserId Value Object

```typescript
/**
 * 用户ID值对象
 * @description 用户的唯一标识符，不可变值对象
 */
export class UserId extends EntityId {
  constructor(value: string) {
    super(value);
  }

  public static generate(): UserId {
    return new UserId(`user_${uuidv4()}`);
  }
}
```

### 5. ResourceLimits Value Object

```typescript
/**
 * 资源限制值对象
 * @description 租户资源限制，不可变值对象
 */
export class ResourceLimits extends BaseValueObject {
  constructor(
    private readonly _maxUsers: number,
    private readonly _maxStorage: number,
    private readonly _maxOrganizations: number,
    private readonly _maxApiCalls: number,
  ) {
    super();
  }

  public get maxUsers(): number {
    return this._maxUsers;
  }

  public get maxStorage(): number {
    return this._maxStorage;
  }

  public get maxOrganizations(): number {
    return this._maxOrganizations;
  }

  public get maxApiCalls(): number {
    return this._maxApiCalls;
  }

  public canCreateUser(currentUsers: number): boolean {
    return currentUsers < this._maxUsers;
  }

  public canCreateOrganization(currentOrgs: number): boolean {
    return currentOrgs < this._maxOrganizations;
  }
}
```

## Aggregates

### 1. TenantAggregate

```typescript
/**
 * 租户聚合根
 * @description 管理租户及其所有组织的一致性边界
 */
export class TenantAggregate extends AggregateRoot<TenantId> {
  private constructor(
    private _tenant: Tenant,
    private _organizations: Map<OrganizationId, Organization>,
  ) {
    super(_tenant.id);
  }

  public createOrganization(orgData: CreateOrganizationData): Organization {
    // 创建组织的业务逻辑
    // 检查租户资源限制
    // 发布领域事件
  }

  public suspendOrganization(
    organizationId: OrganizationId,
    reason: string,
  ): void {
    // 暂停组织的业务逻辑
    // 更新组织状态
    // 发布领域事件
  }

  public getOrganizationStatistics(): OrganizationStatistics {
    // 获取组织统计信息
  }
}
```

### 2. OrganizationAggregate

```typescript
/**
 * 组织聚合根
 * @description 管理组织及其所有部门的一致性边界
 */
export class OrganizationAggregate extends AggregateRoot<OrganizationId> {
  private constructor(
    private _organization: Organization,
    private _departments: Map<DepartmentId, Department>,
  ) {
    super(_organization.id);
  }

  public createDepartment(deptData: CreateDepartmentData): Department {
    // 创建部门的业务逻辑
    // 检查部门层级限制
    // 更新部门路径
    // 发布领域事件
  }

  public moveDepartment(
    departmentId: DepartmentId,
    newParentId: DepartmentId,
  ): void {
    // 移动部门的业务逻辑
    // 更新所有子部门的路径
    // 发布领域事件
  }

  public getDepartmentHierarchy(): DepartmentHierarchy {
    // 获取部门层级结构
  }
}
```

### 3. DepartmentAggregate

```typescript
/**
 * 部门聚合根
 * @description 管理部门及其成员的一致性边界
 */
export class DepartmentAggregate extends AggregateRoot<DepartmentId> {
  private constructor(
    private _department: Department,
    private _members: Map<UserId, User>,
  ) {
    super(_department.id);
  }

  public addMember(userId: UserId): void {
    // 添加成员的业务逻辑
    // 检查用户是否已在其他部门
    // 更新用户部门归属
    // 发布领域事件
  }

  public removeMember(userId: UserId): void {
    // 移除成员的业务逻辑
    // 更新用户部门归属
    // 发布领域事件
  }

  public getMemberStatistics(): MemberStatistics {
    // 获取成员统计信息
  }
}
```

## Domain Events

### 1. TenantCreatedEvent

```typescript
/**
 * 租户创建事件
 * @description 租户创建时发布的领域事件
 */
export class TenantCreatedEvent extends DomainEvent {
  constructor(
    public readonly tenantId: TenantId,
    public readonly tenantName: string,
    public readonly tenantType: TenantType,
    public readonly createdAt: Date,
  ) {
    super();
  }
}
```

### 2. OrganizationCreatedEvent

```typescript
/**
 * 组织创建事件
 * @description 组织创建时发布的领域事件
 */
export class OrganizationCreatedEvent extends DomainEvent {
  constructor(
    public readonly organizationId: OrganizationId,
    public readonly tenantId: TenantId,
    public readonly organizationName: string,
    public readonly organizationType: OrganizationType,
    public readonly createdAt: Date,
  ) {
    super();
  }
}
```

### 3. DepartmentCreatedEvent

```typescript
/**
 * 部门创建事件
 * @description 部门创建时发布的领域事件
 */
export class DepartmentCreatedEvent extends DomainEvent {
  constructor(
    public readonly departmentId: DepartmentId,
    public readonly organizationId: OrganizationId,
    public readonly departmentName: string,
    public readonly parentId: DepartmentId | null,
    public readonly level: number,
    public readonly createdAt: Date,
  ) {
    super();
  }
}
```

### 4. UserJoinedOrganizationEvent

```typescript
/**
 * 用户加入组织事件
 * @description 用户加入组织时发布的领域事件
 */
export class UserJoinedOrganizationEvent extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly organizationId: OrganizationId,
    public readonly departmentId: DepartmentId,
    public readonly joinedAt: Date,
  ) {
    super();
  }
}
```

## Data Isolation Context

### IsolationContext Implementation

```typescript
/**
 * 数据隔离上下文
 * @description 管理多层级数据隔离的上下文信息
 */
export class IsolationContext {
  constructor(
    private readonly _platformId: PlatformId | null,
    private readonly _tenantId: TenantId | null,
    private readonly _organizationId: OrganizationId | null,
    private readonly _departmentId: DepartmentId | null,
    private readonly _userId: UserId | null,
    private readonly _sharingLevel: SharingLevel,
  ) {}

  public buildWhereClause(): string {
    // 构建数据库查询的WHERE子句
    const conditions: string[] = [];

    if (this._tenantId) {
      conditions.push(`tenant_id = '${this._tenantId.value}'`);
    }

    if (this._organizationId) {
      conditions.push(`organization_id = '${this._organizationId.value}'`);
    }

    if (this._departmentId) {
      conditions.push(`department_id = '${this._departmentId.value}'`);
    }

    if (this._userId) {
      conditions.push(`user_id = '${this._userId.value}'`);
    }

    return conditions.join(" AND ");
  }

  public buildCacheKey(prefix: string): string {
    // 构建缓存键
    const parts = [prefix];

    if (this._tenantId) parts.push(`t:${this._tenantId.value}`);
    if (this._organizationId) parts.push(`o:${this._organizationId.value}`);
    if (this._departmentId) parts.push(`d:${this._departmentId.value}`);
    if (this._userId) parts.push(`u:${this._userId.value}`);

    return parts.join(":");
  }

  public canAccess(targetContext: IsolationContext): boolean {
    // 检查是否可以访问目标上下文
    // 实现权限检查逻辑
  }
}
```

## Repository Interfaces

### 1. TenantRepository

```typescript
/**
 * 租户仓储接口
 * @description 租户聚合的持久化接口
 */
export interface TenantRepository {
  findById(id: TenantId): Promise<Tenant | null>;
  findByName(name: string): Promise<Tenant | null>;
  save(tenant: Tenant): Promise<void>;
  delete(id: TenantId): Promise<void>;
  findByStatus(status: TenantStatus): Promise<Tenant[]>;
  findByType(type: TenantType): Promise<Tenant[]>;
}
```

### 2. OrganizationRepository

```typescript
/**
 * 组织仓储接口
 * @description 组织聚合的持久化接口
 */
export interface OrganizationRepository {
  findById(id: OrganizationId): Promise<Organization | null>;
  findByTenantId(tenantId: TenantId): Promise<Organization[]>;
  findByName(tenantId: TenantId, name: string): Promise<Organization | null>;
  save(organization: Organization): Promise<void>;
  delete(id: OrganizationId): Promise<void>;
  findByType(
    tenantId: TenantId,
    type: OrganizationType,
  ): Promise<Organization[]>;
}
```

### 3. DepartmentRepository

```typescript
/**
 * 部门仓储接口
 * @description 部门聚合的持久化接口
 */
export interface DepartmentRepository {
  findById(id: DepartmentId): Promise<Department | null>;
  findByOrganizationId(organizationId: OrganizationId): Promise<Department[]>;
  findByParentId(parentId: DepartmentId): Promise<Department[]>;
  findByPath(
    organizationId: OrganizationId,
    path: string,
  ): Promise<Department | null>;
  save(department: Department): Promise<void>;
  delete(id: DepartmentId): Promise<void>;
  findHierarchy(organizationId: OrganizationId): Promise<DepartmentHierarchy>;
}
```

### 4. UserRepository

```typescript
/**
 * 用户仓储接口
 * @description 用户聚合的持久化接口
 */
export interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByOrganizationId(organizationId: OrganizationId): Promise<User[]>;
  findByDepartmentId(departmentId: DepartmentId): Promise<User[]>;
  save(user: User): Promise<void>;
  delete(id: UserId): Promise<void>;
  findByRole(role: UserRole): Promise<User[]>;
  findByStatus(status: UserStatus): Promise<User[]>;
}
```

## Business Rules and Validation

### 1. Tenant Business Rules

- 租户名称在平台内必须唯一
- 租户资源使用不能超过限制
- 租户状态变更必须遵循生命周期规则
- 租户删除前必须处理所有依赖数据

### 2. Organization Business Rules

- 组织名称在租户内必须唯一
- 组织类型决定管理结构
- 组织共享级别决定数据访问权限
- 组织删除前必须处理所有部门

### 3. Department Business Rules

- 部门层级不能超过7层
- 部门路径必须唯一
- 部门移动必须更新路径
- 部门删除前必须处理所有子部门

### 4. User Business Rules

- 用户在每个组织内只能属于一个部门
- 用户权限继承自角色和部门
- 用户状态变更必须记录审计日志
- 用户删除前必须处理所有关联数据

## Data Model Summary

The SAAS Core module data model implements a comprehensive multi-tenant architecture with 5-layer isolation (Platform → Tenant → Organization → Department → User). The model follows Clean Architecture principles, uses @hl8/domain-kernel base classes, and supports event sourcing and CQRS patterns. All entities are designed as rich domain models with business logic and behavior, ensuring proper data isolation and access control.
