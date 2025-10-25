# Permission Inheritance Patterns

> **Purpose**: Document permission inheritance mechanisms and patterns  
> **Scope**: Hierarchical permission inheritance across 5 levels

---

## Overview

The permission system uses a hierarchical inheritance model where each role level inherits read-only permissions from parent levels while maintaining its own specific permissions. This ensures proper access control while avoiding permission conflicts.

---

## Inheritance Patterns

### Pattern 1: Read-Only Inheritance

**Principle**: Child roles inherit read-only access to parent-level resources.

```typescript
// TenantAdmin inherits from PlatformAdmin
interface TenantAdminInheritance {
  from: 'PlatformAdmin';
  permissions: {
    'platform:*': ['read']; // Read-only platform access
    'system:*': ['read'];   // Read-only system access
  };
  
  // Plus own permissions
  own: {
    'tenant:*': ['manage'];
    'organization:*': ['manage'];
    'department:*': ['manage'];
  };
}
```

### Pattern 2: Scoped Read Access

**Principle**: Inherit read access with automatic scope filtering.

```typescript
// OrganizationAdmin inherits from TenantAdmin
interface OrganizationAdminInheritance {
  from: 'TenantAdmin';
  
  // Inherited (scoped to tenant)
  inherited: {
    'tenant:*': ['read'];        // Read tenant info
    'organization:*': ['read'];   // Read all organizations in tenant
  };
  
  // Own (scoped to own organization)
  own: {
    'organization:*': ['manage']; // Manage own organization only
    'department:*': ['manage'];
  };
}
```

### Pattern 3: Resource-Specific Inheritance

**Principle**: Inherit specific resource types, not all resources.

```typescript
// DepartmentAdmin inherits from OrganizationAdmin
interface DepartmentAdminInheritance {
  from: 'OrganizationAdmin';
  
  inherited: {
    'organization:view': ['read'];
    'organization:config': ['read'];
    'department:view': ['read'];  // View all departments
  };
  
  own: {
    'department:*': ['manage'];  // Manage own department
    'user:*': ['manage'];
  };
}
```

---

## Inheritance Rules

### Rule 1: One-Way Inheritance

Permissions only flow downward, never upward.

```
✅ Correct: TenantAdmin ← PlatformAdmin (inherits)
❌ Wrong: PlatformAdmin ← TenantAdmin (does not inherit)
```

### Rule 2: Read-Only by Default

All inherited permissions are read-only unless explicitly granted.

```typescript
// TenantAdmin inherits from PlatformAdmin
const inheritedPermissions = {
  'platform:read': ['all'],  // ✅ Can read
  'platform:write': [],      // ❌ Cannot write (not inherited)
  'tenant:manage': ['own']   // ✅ Own permission (not inherited)
};
```

### Rule 3: Scope Restriction

Inherited permissions are automatically scoped to the child's level.

```typescript
// OrganizationAdmin with inheritance
interface ScopedInheritance {
  // Inherited from TenantAdmin (read-only, tenant-scoped)
  inherited: {
    'tenant:read': ['tenant-scope'], // Only own tenant
    'organization:read': ['tenant-scope'], // All orgs in tenant
  };
  
  // Own permissions (organization-scoped)
  own: {
    'organization:manage': ['org-scope'], // Own org only
    'department:manage': ['org-scope'],
  };
}
```

---

## Permission Resolution

### Resolution Order

1. **System role permissions** (highest priority)
2. **Inherited permissions** from parent roles
3. **Own permissions** for the role
4. **Custom permissions** (if any)

```typescript
function resolvePermissions(role: Role): PermissionSet {
  return {
    // 1. System permissions (hardcoded)
    ...getSystemPermissions(role),
    
    // 2. Inherited permissions (from parent)
    ...getInheritedPermissions(role),
    
    // 3. Own role permissions
    ...getRolePermissions(role),
    
    // 4. Custom permissions (user-specific)
    ...getCustomPermissions(role, userId)
  };
}
```

### Permission Override

Deny permissions always override allow permissions.

```typescript
interface PermissionOverride {
  allowed: ['tenant:read', 'tenant:write'];
  denied: ['tenant:write'];  // Overrides allowed
  
  // Result: Can read but cannot write
  effective: ['tenant:read'];
}
```

---

## CASL Implementation

### Defining Inheritance

```typescript
import { defineAbility, PureAbility } from '@casl/ability';

// Base ability (PlatformAdmin)
const baseAbility = defineAbility((can) => {
  can('manage', 'all'); // Platform-wide access
});

// TenantAdmin ability (inherits from base)
const tenantAdminAbility = defineAbility((can, cannot) => {
  // Inherit read-only from parent
  can('read', 'platform');
  can('read', 'system');
  
  // Own permissions
  can('manage', 'tenant', { id: 'OWN_TENANT' });
  can('manage', 'organization');
  can('manage', 'department');
  can('manage', 'user');
  
  // Explicit denial
  cannot('delete', 'tenant'); // Override inheritance
});

// OrganizationAdmin ability
const orgAdminAbility = defineAbility((can) => {
  // Inherit from TenantAdmin (read-only)
  can('read', 'tenant');
  can('read', 'organization');
  
  // Own permissions
  can('manage', 'organization', { id: 'OWN_ORG' });
  can('manage', 'department');
  can('manage', 'user');
});
```

---

## Inheritance Examples

### Example 1: Simple Inheritance

```typescript
// PlatformAdmin
can('manage', 'all');

// TenantAdmin (inherits PlatformAdmin)
can('read', 'platform');  // Inherited (read-only)
can('manage', 'tenant');  // Own

// OrganizationAdmin (inherits TenantAdmin)
can('read', 'tenant');    // Inherited from TenantAdmin (read-only)
can('manage', 'organization'); // Own
```

### Example 2: Multi-Level Inheritance

```
PlatformAdmin
  ├─► System access: manage all
  └─► TenantAdmin (inherits: read system)
      ├─► Tenant access: manage tenant
      └─► OrganizationAdmin (inherits: read tenant)
          ├─► Organization access: manage organization
          └─► DepartmentAdmin (inherits: read organization)
              ├─► Department access: manage department
              └─► RegularUser (inherits: read department)
                  └─► User access: manage own data
```

### Example 3: Scoped Inheritance

```typescript
// Level 1: PlatformAdmin
can('manage', 'all');

// Level 2: TenantAdmin
can('read', 'platform');
can('manage', 'tenant', { tenantId: 'OWN_TENANT' });
can('manage', 'organization', { tenantId: 'OWN_TENANT' });

// Level 3: OrganizationAdmin (inherits TenantAdmin)
can('read', 'tenant');                           // Inherited
can('read', 'organization', { tenantId: 'OWN_TENANT' }); // Inherited
can('manage', 'organization', { orgId: 'OWN_ORG' });     // Own
can('manage', 'department', { orgId: 'OWN_ORG' });       // Own
```

---

## Permission Conflict Resolution

### Rule Priority

1. **Explicit deny** (highest priority)
2. **Explicit allow** 
3. **Inherited deny**
4. **Inherited allow** (lowest priority)

```typescript
// Example: TenantAdmin
const permissions = {
  inherited: {
    'tenant:write': ['allow']  // From PlatformAdmin
  },
  own: {
    'tenant:delete': ['deny']  // Explicit deny
  },
  custom: {
    'tenant:write': ['deny']   // Custom deny (overrides inherited allow)
  }
};

// Resolution:
// - tenant:write → DENY (custom overrides inherited)
// - tenant:delete → DENY (explicit)
// - All other tenant permissions → ALLOW (inherited)
```

---

## Related Documentation

- [Permission Hierarchy](./permission-hierarchy.md)
- [Role Permissions](./roles.md)
- [Multi-Tenant Security](./tenant-security.md)
