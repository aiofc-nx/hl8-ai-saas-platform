# Tenant Level Isolation

> **Level**: Tenant  
> **Scope**: Tenant-specific data and configuration  
> **Isolation Strategy**: ROW_LEVEL_SECURITY with tenant_id filtering (default)

---

## Overview

Tenant level isolation is the primary data segregation mechanism in the multi-tenant SAAS architecture. Every tenant's data is isolated at the database level using tenant_id, ensuring complete data separation between different tenants.

---

## Data Scope

### Tenant-Specific Data

- **Tenant Configuration**: Tenant settings, preferences, feature flags
- **Tenant Resources**: Organizations, departments, users (all child entities)
- **Tenant Data**: All business data owned by the tenant
- **Tenant Activity**: Tenant-specific audit logs and activity

### Cross-Tenant Restrictions

- Tenant A CANNOT access Tenant B's data
- Tenant B CANNOT access Tenant A's data
- Tenants operate in complete isolation
- Data sharing only within tenant boundaries

---

## Isolation Mechanisms

### ROW_LEVEL_SECURITY (Default Strategy)

```sql
-- Enable RLS on tenant tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY tenant_isolation_policy ON tenants
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Application sets tenant context
SET app.current_tenant_id = 'tenant_123';
-- Now all queries only see data for tenant_123
```

### Application-Level Filtering

```typescript
// Automatic tenant filtering in queries
export class TenantRepository {
  async findByTenant(tenantId: TenantId) {
    // Always filter by tenant_id
    return this.db
      .select()
      .from('organizations')
      .where('tenant_id', '=', tenantId.value);
  }
}
```

---

## Data Storage Patterns

### Single Database Pattern

```sql
-- All tenants in one database
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,  -- Required for all tenant data
  name VARCHAR(255) NOT NULL,
  -- ... other columns
);

-- Index on tenant_id for performance
CREATE INDEX idx_organizations_tenant_id ON organizations(tenant_id);
```

### Multi-Schema Pattern

```sql
-- Separate schema per tenant
CREATE SCHEMA tenant_123;
CREATE TABLE tenant_123.organizations (
  id UUID PRIMARY KEY,
  -- tenant_id not needed (schema isolation)
  name VARCHAR(255) NOT NULL
);
```

---

## Implementation Patterns

### Domain Entity Pattern

```typescript
import { BaseEntity, TenantId } from '@hl8/domain-kernel';

// Every entity includes tenant_id
export class Organization extends BaseEntity<OrganizationId> {
  constructor(
    id: OrganizationId,
    tenantId: TenantId,  // Required for all tenant entities
    name: string,
    // ...
  ) {
    super(id, tenantId);  // Pass to BaseEntity
  }
}
```

### Repository Pattern

```typescript
// Repository enforces tenant isolation
export class OrganizationRepository {
  async save(org: Organization, context: IsolationContext): Promise<void> {
    // Ensure tenant_id matches context
    if (!org.tenantId.equals(context.tenantId)) {
      throw new Error('Tenant ID mismatch');
    }
    
    // Save with tenant_id
    await this.db.organizations.insert({
      id: org.id,
      tenant_id: org.tenantId.value,
      name: org.name,
    });
  }
}
```

---

## Access Control

### Context Injection

```typescript
// IsolationContext carries tenant information
const context = IsolationContext.createTenantLevel(
  platformId,
  tenantId
);

// All operations use context
await organizationService.create(data, context);
```

### Query Filtering

```typescript
// Automatic tenant filtering
export class OrganizationRepository {
  private applyTenantFilter(query: QueryBuilder, tenantId: TenantId) {
    return query.where('tenant_id', '=', tenantId.value);
  }
  
  async findByName(name: string, tenantId: TenantId) {
    let query = this.db.select().from('organizations');
    query = this.applyTenantFilter(query, tenantId);
    query = query.where('name', '=', name);
    return query.execute();
  }
}
```

---

## Security Rules

### Tenant ID Validation

- Every database operation validates tenant_id
- Cross-tenant queries are automatically rejected
- Tenant_id cannot be modified after creation
- Tenant_id is immutable throughout entity lifecycle

### Data Leakage Prevention

- Never return data from other tenants
- Validate tenant_id on all operations
- Log tenant access for audit
- Monitor for suspicious cross-tenant access

---

## Performance Optimization

### Indexing Strategy

```sql
-- Composite index for tenant-specific queries
CREATE INDEX idx_organizations_tenant_name 
  ON organizations(tenant_id, name);

-- Partition by tenant_id for large datasets
CREATE TABLE organizations (
  -- ...
) PARTITION BY HASH (tenant_id);
```

### Query Optimization

```typescript
// Efficient tenant-specific queries
// Good: Tenant filter first
SELECT * FROM organizations 
WHERE tenant_id = '123' AND name = 'Acme';

// Bad: No tenant filter
SELECT * FROM organizations WHERE name = 'Acme';
```

---

## Migration & Scaling

### Tenant Migration

```typescript
// Migrate tenant data to new database
async function migrateTenant(
  tenantId: TenantId,
  sourceDb: Database,
  targetDb: Database
) {
  const orgs = await sourceDb.organizations
    .where('tenant_id', '=', tenantId.value)
    .find();
  
  await targetDb.organizations.insert(orgs);
}
```

### Horizontal Scaling

- Distribute tenants across multiple databases
- Tenant location in tenant registry
- Transparent tenant routing
- Load balancing per tenant

---

## Related Documentation

- [Platform Level Isolation](./platform-isolation.md)
- [Organization Level Isolation](./organization-isolation.md)
- [Isolation Diagrams](./isolation-diagrams.md)
