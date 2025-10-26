# Role Permissions

> **Purpose**: Detailed documentation of all 5 role types and their specific permissions  
> **Scope**: PlatformAdmin, TenantAdmin, OrganizationAdmin, DepartmentAdmin, RegularUser

---

## Overview

The platform implements 5 distinct role types, each with specific permissions and access control. Roles are hierarchical, with higher-level roles having broader access and lower-level roles having restricted, focused access.

---

## PlatformAdmin

### Role Information

- **Level**: 1 (Highest)
- **Scope**: Platform-wide
- **Inherits from**: None (Base role)
- **Type**: System role

### Permissions

```typescript
interface PlatformAdminPermissions {
  // Platform Management
  "platform:manage": ["all"];
  "platform:configure": ["all"];
  "platform:monitor": ["all"];

  // Tenant Management
  "tenant:create": ["all"];
  "tenant:update": ["all"];
  "tenant:delete": ["all"];
  "tenant:view": ["all"];
  "tenant:suspend": ["all"];
  "tenant:activate": ["all"];

  // System Operations
  "system:configure": ["all"];
  "system:monitor": ["all"];
  "system:backup": ["all"];
  "system:maintenance": ["all"];

  // Cross-tenant Operations
  "data:view": ["all"];
  "data:export": ["all"];
  "audit:view": ["all"];

  // User Management (all tenants)
  "user:view": ["all"];
  "user:manage": ["all"];
}
```

### Access Capabilities

- ✅ Full platform configuration and management
- ✅ Create, modify, and delete tenants
- ✅ Access all tenant data (with audit logging)
- ✅ System-wide monitoring and backup
- ✅ Cross-tenant analytics and reporting
- ❌ Cannot access user private data without audit trail

---

## TenantAdmin

### Role Information

- **Level**: 2
- **Scope**: Tenant-wide
- **Inherits from**: PlatformAdmin (read-only)
- **Type**: Tenant role

### Permissions

```typescript
interface TenantAdminPermissions {
  // Inherited (read-only)
  "platform:read": ["all"];
  "system:read": ["all"];

  // Tenant Management
  "tenant:update": ["own"];
  "tenant:configure": ["own"];
  "tenant:view": ["own"];

  // Organization Management
  "organization:create": ["all"];
  "organization:update": ["all"];
  "organization:delete": ["all"];
  "organization:view": ["all"];

  // Department Management (tenant-wide)
  "department:create": ["all"];
  "department:update": ["all"];
  "department:delete": ["all"];
  "department:view": ["all"];

  // User Management (tenant-wide)
  "user:create": ["all"];
  "user:update": ["all"];
  "user:delete": ["all"];
  "user:view": ["all"];
  "user:invite": ["all"];

  // Role Management
  "role:create": ["all"];
  "role:update": ["all"];
  "role:assign": ["all"];

  // Data Access
  "data:view": ["all"];
  "data:export": ["all"];

  // Billing & Subscription
  "billing:view": ["all"];
  "billing:update": ["all"];

  // Reporting
  "report:view": ["all"];
  "report:generate": ["all"];
}
```

### Access Capabilities

- ✅ Manage all organizations within tenant
- ✅ Manage all users within tenant
- ✅ Configure tenant settings and preferences
- ✅ Access tenant-wide reporting and analytics
- ✅ Manage billing and subscriptions
- ❌ Cannot access other tenants
- ❌ Cannot modify platform configuration

---

## OrganizationAdmin

### Role Information

- **Level**: 3
- **Scope**: Organization-wide
- **Inherits from**: TenantAdmin (read-only)
- **Type**: Organization role

### Permissions

```typescript
interface OrganizationAdminPermissions {
  // Inherited (read-only)
  "tenant:read": ["all"];
  "platform:read": ["all"];

  // Organization Management
  "organization:update": ["own"];
  "organization:configure": ["own"];
  "organization:view": ["own"];

  // Department Management (in organization)
  "department:create": ["all"];
  "department:update": ["all"];
  "department:delete": ["all"];
  "department:view": ["all"];

  // User Management (in organization)
  "user:create": ["all"];
  "user:update": ["all"];
  "user:assign": ["all"];
  "user:view": ["all"];
  "user:invite": ["all"];

  // Role Assignment (within organization)
  "role:assign": ["all"];

  // Data Access (organization-wide)
  "data:view": ["all"];
  "data:create": ["all"];
  "data:update": ["all"];
  "data:export": ["all"];

  // Reporting (organization)
  "report:view": ["all"];
  "report:generate": ["all"];

  // Team Management
  "team:create": ["all"];
  "team:manage": ["all"];
}
```

### Access Capabilities

- ✅ Manage organization configuration and settings
- ✅ Create and manage departments within organization
- ✅ Assign users to departments
- ✅ Access organization-wide data and reports
- ✅ Manage organization teams
- ❌ Cannot access other organizations
- ❌ Cannot modify tenant settings

---

## DepartmentAdmin

### Role Information

- **Level**: 4
- **Scope**: Department-wide
- **Inherits from**: OrganizationAdmin (read-only)
- **Type**: Department role

### Permissions

```typescript
interface DepartmentAdminPermissions {
  // Inherited (read-only)
  "organization:read": ["all"];
  "department:read": ["all"];

  // Department Management
  "department:update": ["own"];
  "department:configure": ["own"];

  // User Management (in department)
  "user:assign": ["all"];
  "user:update": ["all"];
  "user:view": ["all"];
  "user:invite": ["all"];

  // Department Data Access
  "data:view": ["all"];
  "data:create": ["all"];
  "data:update": ["all"];
  "data:delete": ["own"];
  "data:export": ["all"];

  // Team Management
  "team:manage": ["all"];
  "team:view": ["all"];

  // Document Management
  "document:create": ["all"];
  "document:update": ["all"];
  "document:delete": ["own"];

  // Task Management
  "task:create": ["all"];
  "task:assign": ["all"];
  "task:update": ["all"];
}
```

### Access Capabilities

- ✅ Manage department configuration and settings
- ✅ Assign and manage users in department
- ✅ Access department-level data and documents
- ✅ Manage department teams and tasks
- ✅ Create and manage department reports
- ❌ Cannot access other departments
- ❌ Cannot modify organization settings

---

## RegularUser

### Role Information

- **Level**: 5 (Base)
- **Scope**: User-level
- **Inherits from**: DepartmentAdmin (read-only)
- **Type**: User role

### Permissions

```typescript
interface RegularUserPermissions {
  // Inherited (read-only)
  "department:read": ["all"];

  // Own Profile Management
  "profile:view": ["own"];
  "profile:update": ["own"];
  "profile:delete": ["own"];

  // Own Data Management
  "data:view": ["own"];
  "data:create": ["own"];
  "data:update": ["own"];
  "data:delete": ["own"];

  // Shared Resources
  "data:view": ["shared"];
  "document:view": ["shared"];
  "document:create": ["shared"];
  "document:comment": ["shared"];

  // Collaboration
  "team:view": ["all"];
  "team:join": ["invited"];
  "comment:create": ["all"];
  "comment:view": ["all"];

  // Tasks
  "task:view": ["assigned"];
  "task:update": ["assigned"];
  "task:complete": ["assigned"];

  // Notifications
  "notification:view": ["all"];
  "notification:update": ["own"];
}
```

### Access Capabilities

- ✅ Manage own profile and preferences
- ✅ Access and manage own data
- ✅ View and comment on shared resources
- ✅ Participate in team collaborations
- ✅ Manage assigned tasks
- ❌ Cannot access other users' private data
- ❌ Cannot perform administrative functions

---

## Role Assignment Rules

### Assignment Constraints

```typescript
interface RoleAssignmentRules {
  // One role per level
  oneRolePerLevel: true;

  // Multiple roles allowed (different levels)
  allowMultipleRoles: true;

  // System roles cannot be assigned
  systemRoles: ["PlatformAdmin"];

  // Assignment permissions
  canAssign: {
    PlatformAdmin: ["all"];
    TenantAdmin: [
      "TenantAdmin",
      "OrganizationAdmin",
      "DepartmentAdmin",
      "RegularUser",
    ];
    OrganizationAdmin: ["OrganizationAdmin", "DepartmentAdmin", "RegularUser"];
    DepartmentAdmin: ["DepartmentAdmin", "RegularUser"];
    RegularUser: [];
  };
}
```

### Assignment Workflow

```typescript
async function assignRole(
  userId: UserId,
  roleType: RoleType,
  scope: { tenantId?; organizationId?; departmentId? },
  assignedBy: UserId,
) {
  // 1. Validate assignment permissions
  const assigner = await getUserWithRoles(assignedBy);
  if (!canAssignRole(assigner, roleType)) {
    throw new Error("Insufficient permissions to assign role");
  }

  // 2. Validate scope
  validateRoleScope(roleType, scope);

  // 3. Create role assignment
  const assignment = RoleAssignment.create(userId, roleType, scope, assignedBy);

  // 4. Save
  await roleAssignmentRepo.save(assignment);
}
```

---

## Related Documentation

- [Permission Hierarchy](./permission-hierarchy.md)
- [Permission Inheritance](./permission-inheritance.md)
- [Multi-Tenant Security](./tenant-security.md)
