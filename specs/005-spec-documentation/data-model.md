# Data Model Design: SAAS Core Module with CASL Permission System

**Date**: 2024-12-19  
**Feature**: SAAS Core Module Specification Documentation  
**Phase**: Phase 1 - Design and Contracts

## Overview

This document defines the complete data model for the SAAS Core module with integrated CASL (Code Access Security Library) permission system, including domain entities, value objects, aggregates, and their relationships. The model extends the existing NestJS infrastructure libraries (@hl8/domain-kernel, @hl8/application-kernel, @hl8/infrastructure-kernel, @hl8/interface-kernel, @hl8/nestjs-fastify, @hl8/caching, @hl8/database, @hl8/messaging, @hl8/config, @hl8/exceptions, @hl8/nestjs-isolation), follows DDD principles, supports the 5-tier data isolation strategy (Platform/Tenant/Organization/Department/User), and includes comprehensive CASL integration for sophisticated permission and authorization management across all 8 subdomains.

## Domain Entities

### 1. Platform Entity

**Purpose**: Represents the SAAS platform provider with global configuration and management capabilities.

**Attributes**:

- `id: PlatformId` - 平台唯一标识
- `name: string` - 平台名称
- `description: string` - 平台描述
- `version: string` - 平台版本
- `configuration: PlatformConfiguration` - 平台配置
- `auditInfo: AuditInfo` - 审计信息

**Business Rules**:

- 平台名称必须唯一
- 平台版本必须遵循语义版本控制
- 平台配置必须包含默认租户限制和功能开关

**Relationships**:

- 一对多关系：Platform → Tenant

### 2. Tenant Entity

**Purpose**: Represents independent customer units with their own data space, configuration, and resource limits.

**Attributes**:

- `id: TenantId` - 租户唯一标识
- `code: TenantCode` - 租户代码（唯一标识）
- `name: TenantName` - 租户名称
- `type: TenantType` - 租户类型（FREE, BASIC, PROFESSIONAL, ENTERPRISE, CUSTOM）
- `status: TenantStatus` - 租户状态（TRIAL, ACTIVE, SUSPENDED, EXPIRED, DELETED）
- `configuration: TenantConfiguration` - 租户配置
- `resourceLimits: ResourceLimits` - 资源限制
- `auditInfo: AuditInfo` - 审计信息

**Business Rules**:

- 租户代码必须唯一且不可修改
- 租户名称必须通过审核流程
- 租户类型决定资源限制和功能集
- 租户状态转换必须遵循预定义规则

**Relationships**:

- 多对一关系：Tenant → Platform
- 一对多关系：Tenant → Organization

### 3. Organization Entity

**Purpose**: Represents horizontal management units within tenants responsible for specific functions.

**Attributes**:

- `id: OrganizationId` - 组织唯一标识
- `name: string` - 组织名称
- `type: OrganizationType` - 组织类型（Committee, Project Team, Quality Group, Performance Group）
- `description: string` - 组织描述
- `tenantId: TenantId` - 所属租户
- `auditInfo: AuditInfo` - 审计信息

**Business Rules**:

- 组织名称在同一租户内必须唯一
- 组织类型决定管理权限和功能范围
- 组织可以包含多个部门

**Relationships**:

- 多对一关系：Organization → Tenant
- 一对多关系：Organization → Department

### 4. Department Entity

**Purpose**: Represents vertical business execution units within organizations with hierarchical structure.

**Attributes**:

- `id: DepartmentId` - 部门唯一标识
- `name: string` - 部门名称
- `code: string` - 部门代码
- `parentId: DepartmentId | null` - 父部门ID
- `level: number` - 部门层级（1-7）
- `organizationId: OrganizationId` - 所属组织
- `tenantId: TenantId` - 所属租户
- `auditInfo: AuditInfo` - 审计信息

**Business Rules**:

- 部门层级不能超过7层
- 部门代码在同一组织内必须唯一
- 部门名称在同一组织内必须唯一
- 部门删除必须处理子部门和用户分配

**Relationships**:

- 多对一关系：Department → Organization
- 多对一关系：Department → Tenant
- 自引用关系：Department → Department (parent-child)

### 5. User Entity

**Purpose**: Represents individual users with platform identity who can be assigned to multiple organizations and departments.

**Attributes**:

- `id: UserId` - 用户唯一标识
- `username: string` - 用户名
- `email: Email` - 邮箱地址
- `status: UserStatus` - 用户状态（ACTIVE, INACTIVE, SUSPENDED, DELETED）
- `profile: UserProfile` - 用户资料
- `permissions: UserPermission[]` - 用户权限
- `auditInfo: AuditInfo` - 审计信息

**Business Rules**:

- 用户名和邮箱必须唯一
- 用户可以属于多个组织但每个组织只能属于一个部门
- 用户权限基于角色和部门层级继承

**Relationships**:

- 多对多关系：User ↔ Organization
- 多对多关系：User ↔ Department
- 多对多关系：User ↔ UserRole

### 6. Role Entity

**Purpose**: Represents user roles defining permissions and access levels within the system hierarchy.

**Attributes**:

- `id: RoleId` - 角色唯一标识
- `name: string` - 角色名称
- `description: string` - 角色描述
- `level: RoleLevel` - 角色层级（Platform, Tenant, Organization, Department, User）
- `permissions: Permission[]` - 角色权限
- `caslRules: CaslRule[]` - CASL权限规则
- `tenantId: TenantId` - 所属租户
- `auditInfo: AuditInfo` - 审计信息

**Business Rules**:

- 角色名称在同一租户内必须唯一
- 角色层级决定权限继承关系
- CASL权限规则定义角色的具体操作权限

**Relationships**:

- 多对一关系：Role → Tenant
- 多对多关系：Role ↔ User
- 一对多关系：Role → Permission
- 一对多关系：Role → CaslRule

### 7. CaslAbility Entity

**Purpose**: Represents CASL permission abilities for users within specific contexts.

**Attributes**:

- `id: CaslAbilityId` - 权限能力唯一标识
- `userId: UserId` - 用户ID
- `subject: string` - 权限主体（Tenant, Organization, Department, User等）
- `action: string` - 操作类型（create, read, update, delete, manage等）
- `conditions: CaslCondition[]` - 权限条件
- `context: IsolationContext` - 隔离上下文
- `auditInfo: AuditInfo` - 审计信息

**Business Rules**:

- 权限能力基于用户角色和组织上下文动态生成
- 权限条件必须符合隔离上下文规则
- 权限能力变更必须记录审计日志

**Relationships**:

- 多对一关系：CaslAbility → User
- 多对一关系：CaslAbility → Role

## Value Objects

### 1. TenantCode

**Purpose**: 租户代码值对象，确保唯一性和格式正确性。

**Attributes**:

- `value: string` - 租户代码值

**Validation Rules**:

- 长度：3-20个字符
- 格式：只能包含字母、数字、连字符
- 唯一性：全局唯一

### 2. TenantName

**Purpose**: 租户名称值对象，支持审核流程。

**Attributes**:

- `value: string` - 租户名称值
- `status: ApprovalStatus` - 审核状态

**Validation Rules**:

- 长度：2-100个字符
- 不能包含敏感词汇
- 需要通过审核流程

### 3. TenantType

**Purpose**: 租户类型枚举值对象。

**Values**:

- `FREE` - 免费版
- `BASIC` - 基础版
- `PROFESSIONAL` - 专业版
- `ENTERPRISE` - 企业版
- `CUSTOM` - 定制版

### 4. TenantStatus

**Purpose**: 租户状态枚举值对象。

**Values**:

- `TRIAL` - 试用期
- `ACTIVE` - 活跃状态
- `SUSPENDED` - 暂停状态
- `EXPIRED` - 过期状态
- `DELETED` - 已删除

### 5. IsolationContext

**Purpose**: 数据隔离上下文值对象。

**Attributes**:

- `platformId: PlatformId` - 平台ID
- `tenantId: TenantId` - 租户ID
- `organizationId: OrganizationId | null` - 组织ID
- `departmentId: DepartmentId | null` - 部门ID
- `userId: UserId | null` - 用户ID

### 6. CaslRule

**Purpose**: CASL权限规则值对象。

**Attributes**:

- `action: string` - 操作类型
- `subject: string` - 权限主体
- `conditions: object` - 权限条件
- `inverted: boolean` - 是否反向规则

**Validation Rules**:

- 操作类型必须符合预定义的操作集合
- 权限主体必须符合实体类型
- 权限条件必须为有效的JSON对象

### 7. CaslCondition

**Purpose**: CASL权限条件值对象。

**Attributes**:

- `field: string` - 字段名
- `operator: string` - 操作符
- `value: any` - 条件值

**Validation Rules**:

- 字段名必须符合实体属性
- 操作符必须符合预定义的操作符集合
- 条件值必须符合字段类型

### 8. RoleLevel

**Purpose**: 角色层级枚举值对象。

**Values**:

- `PLATFORM` - 平台级角色
- `TENANT` - 租户级角色
- `ORGANIZATION` - 组织级角色
- `DEPARTMENT` - 部门级角色
- `USER` - 用户级角色

## Aggregates

### 1. TenantAggregate

**Purpose**: 租户聚合根，管理租户的完整生命周期和业务规则。

**Root Entity**: Tenant
**Consistency Boundary**: 租户及其配置、资源限制、状态转换

**Business Rules**:

- 租户创建必须验证平台容量和资源可用性
- 租户状态转换必须遵循预定义规则
- 租户删除必须处理所有关联数据
- 租户升级必须验证新限制和功能

**Domain Events**:

- `TenantCreated` - 租户创建事件
- `TenantStatusChanged` - 租户状态变更事件
- `TenantUpgraded` - 租户升级事件
- `TenantDeleted` - 租户删除事件

### 2. OrganizationAggregate

**Purpose**: 组织聚合根，管理组织结构和权限。

**Root Entity**: Organization
**Consistency Boundary**: 组织及其部门、用户分配、权限设置

**Business Rules**:

- 组织创建必须验证租户权限
- 组织删除必须处理部门层级结构
- 组织权限变更必须影响所有子部门

**Domain Events**:

- `OrganizationCreated` - 组织创建事件
- `OrganizationUpdated` - 组织更新事件
- `OrganizationDeleted` - 组织删除事件

### 3. DepartmentAggregate

**Purpose**: 部门聚合根，管理部门层级结构和用户分配。

**Root Entity**: Department
**Consistency Boundary**: 部门及其子部门、用户分配、权限继承

**Business Rules**:

- 部门层级不能超过7层
- 部门删除必须处理子部门和用户重新分配
- 部门权限变更必须影响所有子部门

**Domain Events**:

- `DepartmentCreated` - 部门创建事件
- `DepartmentMoved` - 部门移动事件
- `DepartmentDeleted` - 部门删除事件

## Data Isolation Strategy

### 1. Platform Level Isolation

- 平台数据与租户数据完全隔离
- 平台管理数据仅平台管理员可访问
- 例如：平台配置、全局统计、系统监控数据

### 2. Tenant Level Isolation

- 不同租户的数据完全隔离
- 租户间数据不可跨访问
- 支持企业租户、社群租户、团队租户、个人租户四种类型

### 3. Organization Level Isolation

- 同一租户内，不同组织的非共享数据相互隔离
- 组织是租户内的横向管理单位
- 组织间是平行关系，无从属关系

### 4. Department Level Isolation

- 同一组织内，不同部门的非共享数据相互隔离
- 部门是纵向管理单位，具有层级关系，支持7层嵌套
- 部门间遵循上下级关系，上级部门可访问下级部门的共享数据

### 5. User Level Isolation

- 用户私有数据仅该用户可访问
- 即使在同一部门，用户私有数据也相互隔离

## Data Classification

### 1. Shared Data

- 可以在特定层级内被所有下级访问
- 必须明确定义共享级别
- 共享数据对指定层级及其所有下级层级可见

### 2. Non-Shared Data

- 仅限特定层级访问，不可跨层级访问
- 数据所有者层级决定访问权限
- 非共享数据是默认状态，确保数据安全

## Validation Rules

### 1. Tenant Validation

- 租户代码唯一性验证
- 租户名称格式和内容验证
- 租户类型和资源限制匹配验证
- 租户状态转换规则验证

### 2. Organization Validation

- 组织名称唯一性验证
- 组织类型和权限匹配验证
- 组织创建权限验证

### 3. Department Validation

- 部门层级深度验证（最大7层）
- 部门代码唯一性验证
- 部门名称唯一性验证
- 部门层级结构完整性验证

### 4. User Validation

- 用户名和邮箱唯一性验证
- 用户权限和角色匹配验证
- 用户多组织分配验证

## Performance Considerations

### 1. Indexing Strategy

- 为所有隔离字段创建复合索引
- 为查询频繁的字段创建单列索引
- 为外键关系创建索引

### 2. Caching Strategy

- 租户配置信息缓存
- 用户权限信息缓存
- 组织部门结构缓存

### 3. Query Optimization

- 使用隔离上下文进行查询过滤
- 避免跨租户数据查询
- 优化层级结构查询

## Security Considerations

### 1. Data Access Control

- 所有数据访问必须携带完整的隔离上下文
- 系统自动根据隔离上下文过滤数据
- 跨层级数据访问必须经过明确授权

### 2. Audit Logging

- 所有数据访问必须记录完整的隔离上下文
- 跨层级数据访问必须触发审计事件
- 数据访问拒绝必须记录原因和上下文

### 3. Data Encryption

- 敏感数据加密存储
- 传输数据加密保护
- 密钥管理和轮换策略
