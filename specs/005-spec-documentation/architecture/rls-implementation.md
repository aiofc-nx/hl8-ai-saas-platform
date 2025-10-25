# ROW_LEVEL_SECURITY Implementation Details

> **Strategy**: ROW_LEVEL_SECURITY (Default)  
> **Database**: PostgreSQL  
> **Scope**: All tenant data tables

---

## Overview

ROW_LEVEL_SECURITY (RLS) is the default data isolation strategy for multi-tenant architecture. It provides automatic data filtering at the database level, ensuring complete tenant isolation without application-level filtering logic.

---

## RLS Configuration

### Enable RLS on Tables

```sql
-- Enable RLS on all tenant data tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
-- ... all other tenant tables
```

### Create RLS Policies

```sql
-- Basic tenant isolation policy
CREATE POLICY tenant_isolation_policy ON organizations
  FOR ALL  -- SELECT, INSERT, UPDATE, DELETE
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- For INSERT operations, also check WITH CHECK
CREATE POLICY tenant_isolation_policy ON organizations
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

## Context Setting

### Application-Level Context

```typescript
// Set tenant context before database operations
export class DatabaseContext {
  async withTenantContext<T>(
    tenantId: TenantId,
    operation: () => Promise<T>
  ): Promise<T> {
    // Set context for RLS
    await this.db.query(
      `SET app.current_tenant_id = $1`,
      [tenantId.value]
    );
    
    try {
      return await operation();
    } finally {
      // Clear context
      await this.db.query(`RESET app.current_tenant_id`);
    }
  }
}
```

### Transaction-Level Context

```typescript
// Use within transaction
await db.transaction(async (trx) => {
  // Set tenant context
  await trx.raw(
    `SET LOCAL app.current_tenant_id = $1`,
    [tenantId.value]
  );
  
  // All queries now filtered by tenant_id automatically
  const orgs = await trx('organizations').select();
  // Only returns organizations for this tenant
});
```

---

## Advanced RLS Patterns

### Multi-Level Isolation

```sql
-- Organization-level isolation (nested within tenant)
CREATE POLICY org_isolation_policy ON departments
  FOR ALL
  USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
    AND organization_id = current_setting('app.current_organization_id')::uuid
  );
```

### Department Hierarchy Access

```sql
-- Allow access to department and its sub-departments
CREATE POLICY dept_hierarchy_policy ON documents
  FOR ALL
  USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
    AND (
      department_id = current_setting('app.current_department_id')::uuid
      OR department_id IN (
        SELECT id FROM departments 
        WHERE path LIKE (
          SELECT path || '/%' FROM departments 
          WHERE id = current_setting('app.current_department_id')::uuid
        )
      )
    )
  );
```

### Sharing and Permissions

```sql
-- Allow access to shared resources
CREATE POLICY shared_resource_policy ON documents
  FOR ALL
  USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
    AND (
      -- Own organization
      organization_id = current_setting('app.current_organization_id')::uuid
      OR
      -- Shared across organizations
      (is_shared = true AND sharing_level = 'TENANT_LEVEL')
      OR
      -- User has permission
      has_permission(current_setting('app.current_user_id')::uuid, 'read', 'Document')
    )
  );
```

---

## Performance Optimization

### Index on RLS Key

```sql
-- Ensure tenant_id has index for RLS performance
CREATE INDEX idx_organizations_tenant_id ON organizations(tenant_id);
CREATE INDEX idx_departments_tenant_org ON departments(tenant_id, organization_id);
CREATE INDEX idx_users_tenant_org_dept ON users(tenant_id, organization_id, department_id);
```

### Query Analysis

```sql
-- Analyze RLS policy performance
EXPLAIN ANALYZE 
SELECT * FROM organizations;

-- Ensure index is used for tenant filtering
EXPLAIN (FORMAT JSON)
SELECT * FROM organizations 
WHERE tenant_id = '123-456-789';
```

---

## Testing RLS

### Unit Tests

```sql
-- Test tenant isolation
SET app.current_tenant_id = 'tenant-1';
INSERT INTO organizations (id, tenant_id, name) 
VALUES ('org-1', 'tenant-1', 'Org 1');

SET app.current_tenant_id = 'tenant-2';
SELECT * FROM organizations;  -- Should return empty (different tenant)

SET app.current_tenant_id = 'tenant-1';
SELECT * FROM organizations;  -- Should return org-1
```

### Integration Tests

```typescript
// Test RLS in application
describe('RLS Isolation', () => {
  it('should isolate tenant data', async () => {
    const tenant1Context = await createTenantContext('tenant-1');
    const tenant2Context = await createTenantContext('tenant-2');
    
    // Create org in tenant 1
    await orgService.create({ name: 'Org 1' }, tenant1Context);
    
    // Query from tenant 2 should not see tenant 1 data
    const orgs = await orgService.findAll(tenant2Context);
    expect(orgs).toHaveLength(0);
  });
});
```

---

## Migration Strategy

### Enable RLS on Existing Tables

```sql
-- Step 1: Add RLS to table
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Step 2: Create policy
CREATE POLICY tenant_isolation_policy ON organizations
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Step 3: Verify existing data
SELECT COUNT(*) FROM organizations;
-- Should return all rows (no context set)

-- Step 4: Test with context
SET app.current_tenant_id = 'specific-tenant';
SELECT COUNT(*) FROM organizations;
-- Should return only rows for that tenant
```

---

## Monitoring and Debugging

### RLS Statistics

```sql
-- Check RLS usage
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('organizations', 'departments', 'users');
```

### Debug RLS Policies

```sql
-- Show all policies on a table
SELECT * FROM pg_policies 
WHERE tablename = 'organizations';

-- Check current context
SELECT current_setting('app.current_tenant_id', true);
```

---

## Related Documentation

- [Tenant Isolation](./tenant-isolation.md)
- [Access Control Flow](./isolation-diagrams.md#access-control-flow)
- [Multi-Database Strategy](./multi-database-strategy.md)
