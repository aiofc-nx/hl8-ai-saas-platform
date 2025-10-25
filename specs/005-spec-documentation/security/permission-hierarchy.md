# Permission Hierarchy

> **Purpose**: Document the 5-level permission hierarchy and access control system  
> **Scope**: PlatformAdmin → TenantAdmin → OrganizationAdmin → DepartmentAdmin → RegularUser

---

## Overview

The permission system implements a 5-level hierarchical access control model, where each level inherits permissions from its parent while having specific responsibilities. This hierarchy ensures proper data isolation and administrative control across the multi-tenant SAAS platform.

---

## 5-Level Permission Hierarchy

```
Level 1: PlatformAdmin (Platform Level)
    │
    └─► Level 2: TenantAdmin (Tenant Level)
            │
            └─► Level 3: OrganizationAdmin (Organization Level)
                    │
                    └─► Level 4: DepartmentAdmin (Department Level)
                            │
                            └─► Level 5: RegularUser (User Level)
```

### Hierarchy Rules

- **Top-down inheritance**: Higher-level admins inherit access to lower-level resources
- **Bottom-up restriction**: Lower-level users cannot access higher-level resources
- **Isolated scopes**: Each level operates within its defined boundaries
- **Explicit permissions**: Granular control using CASL permission definitions

---

## Level 1: PlatformAdmin

### Scope

**Level**: Platform-wide  
**Access**: All tenants, all data  
**Primary Responsibility**: Platform management and operations

### Key Permissions

```typescript
interface PlatformAdminPermissions {
  // Platform Management
  'platform:manage': ['all']; // Full platform access
  
  // Tenant Management
  'tenant:create': ['all'];
  'tenant:update': ['all'];
  'tenant:delete': ['all'];
  'tenant:view': ['all'];
  'tenant:suspend': ['all'];
  'tenant:activate': ['all'];
  
  // System Management
  'system:configure': ['all'];
  'system:monitor': ['all'];
  'system:backup': ['all'];
  
  // User Management (all tenants)
  'user:view': ['all'];
  'user:manage': ['all'];
  
  // Data Access (cross-tenant)
  'data:view': ['all'];
  'data:export': ['all'];
}
```

### Use Cases

- Platform initialization and setup
- Tenant provisioning and management
- System-wide configuration changes
- Cross-tenant data analysis and reporting
- Platform security and compliance
- System maintenance and backups

### Access Boundaries

- ✅ Access: All platforms, tenants, organizations, departments, users
- ❌ Restricted: Cannot access individual user private data without audit trail

---

## Level 2: TenantAdmin

### Scope

**Level**: Tenant-wide  
**Access**: All data within their tenant  
**Primary Responsibility**: Tenant management and administration

### Key Permissions

```typescript
interface TenantAdminPermissions {
  // Inherit from parent: All platform-level permissions
  'platform:*': ['read']; // Read-only platform data
  
  // Tenant Management
  'tenant:update': ['own']; // Update own tenant only
  'tenant:configure': ['own'];
  
  // Organization Management
  'organization:create': ['all'];
  'organization:update': ['all'];
  'organization:delete': ['all'];
  'organization:view': ['all'];
  
  // User Management (tenant-wide)
  'user:create': ['all'];
  'user:update': ['all'];
  'user:delete': ['all'];
  'user:view': ['all'];
  
  // Department Management
  'department:create': ['all'];
  'department:update': ['all'];
  'department:delete': ['all'];
  'department:view': ['all'];
  
  // Data Access (tenant-wide)
  'data:view': ['all'];
  'data:export': ['all'];
  
  // Billing & Subscription
  'billing:view': ['all'];
  'billing:update': ['all'];
}
```

### Use Cases

- Tenant configuration and settings
- Organization structure management
- User provisioning and management
- Tenant-wide reporting and analytics
- Billing and subscription management
- Tenant security settings

### Access Boundaries

- ✅ Access: All organizations, departments, users within tenant
- ❌ Restricted: Cannot access other tenants or platform data (read-only)

---

## Level 3: OrganizationAdmin

### Scope

**Level**: Organization-wide  
**Access**: All data within their organization(s)  
**Primary Responsibility**: Organization management

### Key Permissions

```typescript
interface OrganizationAdminPermissions {
  // Inherit from parent: Tenant-level permissions (read-only)
  'tenant:*': ['read'];
  'user:view': ['all'];
  
  // Organization Management
  'organization:update': ['own']; // Update own organization only
  'organization:configure': ['own'];
  'organization:view': ['own'];
  
  // Department Management (in organization)
  'department:create': ['all'];
  'department:update': ['all'];
  'department:delete': ['all'];
  'department:view': ['all'];
  
  // User Management (in organization)
  'user:create': ['all'];
  'user:update': ['all'];
  'user:assign': ['all'];
  'user:view': ['all'];
  
  // Data Access (organization-wide)
  'data:view': ['all'];
  'data:export': ['all'];
  
  // Reporting (organization)
  'report:view': ['all'];
  'report:generate': ['all'];
}
```

### Use Cases

- Organization configuration and management
- Department structure design
- User assignment to departments
- Organization-level reporting
- Member management and onboarding
- Organization settings and preferences

### Access Boundaries

- ✅ Access: Own organization and all its departments/users
- ❌ Restricted: Cannot access other organizations or tenant-level settings

---

## Level 4: DepartmentAdmin

### Scope

**Level**: Department-wide  
**Access**: All data within their department(s)  
**Primary Responsibility**: Department management

### Key Permissions

```typescript
interface DepartmentAdminPermissions {
  // Inherit from parent: Organization-level permissions (read-only)
  'organization:*': ['read'];
  'department:view': ['all'];
  
  // Department Management
  'department:update': ['own']; // Update own department only
  'department:configure': ['own'];
  
  // User Management (in department)
  'user:assign': ['all'];
  'user:update': ['all'];
  'user:view': ['all'];
  'user:invite': ['all'];
  
  // Department Data Access
  'data:view': ['all'];
  'data:create': ['all'];
  'data:update': ['all'];
  'data:delete': ['own'];
  
  // Team Management
  'team:manage': ['all'];
  'team:view': ['all'];
}
```

### Use Cases

- Department configuration and settings
- User assignment to departments
- Department-level reporting
- Team member management
- Department-specific data management
- Team collaboration tools

### Access Boundaries

- ✅ Access: Own department and sub-departments
- ❌ Restricted: Cannot access other departments or organization settings

---

## Level 5: RegularUser

### Scope

**Level**: User-level  
**Access**: Own data and shared resources  
**Primary Responsibility**: Data access and operations

### Key Permissions

```typescript
interface RegularUserPermissions {
  // Inherit from parent: Department-level permissions (read-only)
  'department:*': ['read'];
  
  // Own Profile Management
  'profile:view': ['own'];
  'profile:update': ['own'];
  'profile:delete': ['own'];
  
  // Own Data Management
  'data:view': ['own'];
  'data:create': ['own'];
  'data:update': ['own'];
  'data:delete': ['own'];
  
  // Shared Resources
  'data:view': ['shared'];
  'document:view': ['shared'];
  'document:create': ['shared'];
  
  // Collaboration
  'team:view': ['all'];
  'comment:create': ['all'];
  'comment:view': ['all'];
}
```

### Use Cases

- Personal profile management
- Own data access and management
- Shared resource access
- Team collaboration
- Document management
- Task management

### Access Boundaries

- ✅ Access: Own data, shared resources, team data
- ❌ Restricted: Cannot access other users' private data or administrative functions

---

## Permission Inheritance Flow

```
PlatformAdmin
    │
    ├─► Inherits: Platform-level permissions
    └─► Can access: All levels below
         │
         ▼
TenantAdmin
    │
    ├─► Inherits: Platform-level (read-only) + Tenant-level permissions
    └─► Can access: Organization, Department, User levels
         │
         ▼
OrganizationAdmin
    │
    ├─► Inherits: Tenant-level (read-only) + Organization-level permissions
    └─► Can access: Department, User levels
         │
         ▼
DepartmentAdmin
    │
    ├─► Inherits: Organization-level (read-only) + Department-level permissions
    └─► Can access: User level
         │
         ▼
RegularUser
    │
    ├─► Inherits: Department-level (read-only) + User-level permissions
    └─► Can access: Own data and shared resources
```

---

## CASL Permission Implementation

### Role Ability Mapping

```typescript
import { defineAbility, PureAbility } from '@casl/ability';

// PlatformAdmin abilities
const platformAdminAbility = defineAbility((can, cannot) => {
  // Platform-wide access
  can('manage', 'all');
  can('access', 'platform');
  can('manage', 'tenant');
  can('manage', 'system');
});

// TenantAdmin abilities
const tenantAdminAbility = defineAbility((can, cannot) => {
  // Tenant-wide access
  can('read', 'platform');
  can('manage', 'tenant', { id: 'OWN_TENANT' });
  can('manage', 'organization');
  can('manage', 'department');
  can('manage', 'user');
});

// OrganizationAdmin abilities
const organizationAdminAbility = defineAbility((can, cannot) => {
  // Organization-wide access
  can('read', 'tenant');
  can('manage', 'organization', { id: 'OWN_ORG' });
  can('manage', 'department');
  can('manage', 'user');
});

// DepartmentAdmin abilities
const departmentAdminAbility = defineAbility((can, cannot) => {
  // Department-wide access
  can('read', 'organization');
  can('manage', 'department', { id: 'OWN_DEPT' });
  can('manage', 'user');
  can('read', 'data');
});

// RegularUser abilities
const regularUserAbility = defineAbility((can, cannot) => {
  // User-level access
  can('read', 'department');
  can('manage', 'profile', { userId: 'OWN_ID' });
  can('manage', 'data', { userId: 'OWN_ID' });
  can('read', 'shared');
});
```

---

## Access Control Rules

### Rule 1: Scope Isolation

- Each role can only manage resources within their scope
- Higher roles can read but not modify lower-level configuration
- Data isolation enforced at every level

### Rule 2: Permission Inheritance

- Child roles inherit read-only permissions from parent
- Each role adds its own specific permissions
- Permissions never flow upward (RegularUser cannot access DepartmentAdmin features)

### Rule 3: Explicit Override

- Permissions can be explicitly granted or denied
- Deny permissions override allow permissions
- System roles cannot be modified by users

---

## Related Documentation

- [Permission Inheritance](./permission-inheritance.md)
- [Role Permissions](./roles.md)
- [Multi-Tenant Security](./tenant-security.md)
