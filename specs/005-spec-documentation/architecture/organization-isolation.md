# Organization Level Isolation

> **Level**: Organization  
> **Scope**: Organization-specific data within a tenant  
> **Isolation Strategy**: Organization_id filtering within tenant boundary

---

## Overview

Organization level isolation provides data segregation within a tenant's boundaries. Organizations are horizontal management units that can have their own data and configurations, with optional sharing across organizations within the same tenant.

---

## Data Scope

### Organization-Specific Data

- **Organization Configuration**: Organization settings, preferences, feature flags
- **Organization Resources**: Departments, users assigned to the organization
- **Organization Data**: Business data owned by the organization
- **Organization Activity**: Organization-specific audit logs

### Cross-Organization Access

- Organizations can be **private** (isolated) or **shared** (accessible across organizations)
- `isShared` flag controls cross-organization access
- Organization admins manage organization boundaries
- Users can belong to multiple organizations

---

## Isolation Mechanisms

### Database Filtering

```sql
-- Organization-specific queries
SELECT * FROM departments
WHERE tenant_id = 'tenant_123'
  AND organization_id = 'org_456';

-- Query with sharing check
SELECT * FROM documents
WHERE tenant_id = 'tenant_123'
  AND (
    organization_id = 'org_456'  -- Same organization
    OR is_shared = true           -- Shared across organizations
  );
```

### Application-Level Filtering

```typescript
// Organization filtering in application
export class DepartmentRepository {
  async findByOrganization(
    organizationId: OrganizationId,
    tenantId: TenantId
  ) {
    return this.db
      .select()
      .from('departments')
      .where('tenant_id', '=', tenantId.value)
      .where('organization_id', '=', organizationId.value);
  }
}
```

---

## Sharing Configuration

### Private Organizations

```typescript
// Organization is private (isolated)
const organization = new Organization(
  id,
  tenantId,
  name,
  OrganizationTypeEnum.COMMITTEE,
  OrganizationStatusEnum.ACTIVE,
  false  // isShared = false (private)
);

// Only accessible within the organization
await departmentService.create(deptData, organization);
```

### Shared Organizations

```typescript
// Organization is shared across tenant
const organization = new Organization(
  id,
  tenantId,
  name,
  OrganizationTypeEnum.PROJECT_TEAM,
  OrganizationStatusEnum.ACTIVE,
  true,  // isShared = true (shared)
  SharingLevel.TENANT_LEVEL  // Sharing level
);

// Accessible across all organizations in tenant
await documentService.create(docData, organization);
```

---

## Access Patterns

### Organization Admin Access

```typescript
// Organization admin sees only their organization
const context = IsolationContext.createOrganizationLevel(
  platformId,
  tenantId,
  organizationId
);

const departments = await departmentService.findAll(context);
// Returns only departments in this organization
```

### Cross-Organization Access

```typescript
// Access shared organizations
const sharedDocs = await documentService.findShared({
  tenantId,
  organizationId,  // Current organization
  includeShared: true  // Include shared documents
});

// Returns: current org docs + shared docs
```

---

## Security Rules

### Organization Boundaries

- Organization IDs are scoped within tenant
- Cannot access other tenants' organizations
- Organization admins manage organization data
- Tenant admins can access all organizations

### Permission Hierarchy

```
Tenant Admin > Organization Admin > Department Admin
- Tenant Admin: Access all organizations
- Organization Admin: Access only their organization
- Department Admin: Access only their department
```

---

## Related Documentation

- [Tenant Level Isolation](./tenant-isolation.md)
- [Department Level Isolation](./department-isolation.md)
- [User Assignment Rules](../organizations/user-assignment.md)
