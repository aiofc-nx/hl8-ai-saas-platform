# Multi-Database Strategy

> **Default**: Single Database with RLS  
> **Scaling**: SCHEMA_PER_TENANT, DATABASE_PER_TENANT  
> **Implementation**: Gradual migration based on tenant needs

---

## Strategy Overview

The multi-tenant architecture supports three database isolation strategies, allowing for gradual scaling from single database to per-tenant databases based on tenant size and requirements.

---

## Strategy 1: Single Database with RLS (Default)

### Implementation

- **All tenants share one database**
- **RLS enforces tenant isolation**
- **Default for all new tenants**
- **Low operational overhead**

### Database Structure

```sql
-- Single database with multiple tables
CREATE DATABASE saas_platform;

-- Platform schema
CREATE SCHEMA platform;
CREATE TABLE platform.settings (...);
CREATE TABLE platform.admins (...);

-- Public schema for tenant data
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,  -- RLS key
  name VARCHAR(255) NOT NULL,
  -- ... other columns
);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON organizations
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

### Advantages

- ✅ Simple setup and maintenance
- ✅ Low operational costs
- ✅ Easy backup and recovery
- ✅ Efficient resource utilization
- ✅ Perfect for small-to-medium tenants

### Limitations

- ❌ All tenants compete for database resources
- ❌ One tenant's heavy load affects others
- ❌ Difficult to customize per-tenant database settings
- ❌ Limited scalability for large tenants

---

## Strategy 2: SCHEMA_PER_TENANT (Future)

### Implementation

- **One database, multiple schemas**
- **Each tenant gets own schema**
- **Automatic context switching**
- **Better resource isolation**

### Database Structure

```sql
-- One database
CREATE DATABASE saas_platform;

-- Tenant schemas
CREATE SCHEMA tenant_abc123;
CREATE SCHEMA tenant_def456;

-- Each schema has complete table structure
CREATE TABLE tenant_abc123.organizations (
  id UUID PRIMARY KEY,
  -- No tenant_id needed (schema isolation)
  name VARCHAR(255) NOT NULL,
  -- ...
);

CREATE TABLE tenant_def456.organizations (
  id UUID PRIMARY KEY,
  -- No tenant_id needed
  name VARCHAR(255) NOT NULL,
  -- ...
);
```

### Context Switching

```typescript
// Switch tenant context before queries
export class TenantDatabaseAdapter {
  async queryWithTenant(tenantId: TenantId, query: string, params: any[]) {
    // Switch to tenant schema
    await this.db.query(`SET search_path TO tenant_${tenantId.value}, public`);

    try {
      return await this.db.query(query, params);
    } finally {
      // Reset to default schema
      await this.db.query(`SET search_path TO public`);
    }
  }
}
```

### Advantages

- ✅ Better resource isolation than single DB
- ✅ Per-tenant database customization
- ✅ Easier tenant migration
- ✅ Simplified queries (no tenant_id filter)
- ✅ Better for medium-sized tenants

### Limitations

- ❌ More complex schema management
- ❌ Tenant schema migration overhead
- ❌ All schemas in one database
- ❌ Database-level operations affect all tenants

### Migration from RLS

```sql
-- Step 1: Create tenant schema
CREATE SCHEMA tenant_abc123;

-- Step 2: Create tables in tenant schema
CREATE TABLE tenant_abc123.organizations (
  LIKE public.organizations INCLUDING ALL
);

-- Step 3: Migrate data
INSERT INTO tenant_abc123.organizations
SELECT * FROM public.organizations
WHERE tenant_id = 'abc123';

-- Step 4: Update application to use schema
```

---

## Strategy 3: DATABASE_PER_TENANT (Enterprise)

### Implementation

- **Separate database per tenant**
- **Complete physical isolation**
- **Independent scaling and configuration**
- **Maximum security and performance**

### Database Structure

```sql
-- Tenant 1 database
CREATE DATABASE tenant_abc123;
USE tenant_abc123;

CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  -- No tenant_id needed (database isolation)
  name VARCHAR(255) NOT NULL,
  -- ...
);

-- Tenant 2 database
CREATE DATABASE tenant_def456;
USE tenant_def456;

CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  -- ...
);
```

### Connection Management

```typescript
// Connection pool per tenant database
export class TenantConnectionManager {
  private connections: Map<TenantId, Database> = new Map();

  async getTenantDb(tenantId: TenantId): Promise<Database> {
    if (!this.connections.has(tenantId)) {
      // Connect to tenant-specific database
      const db = await this.connect(`tenant_${tenantId.value}`);
      this.connections.set(tenantId, db);
    }
    return this.connections.get(tenantId)!;
  }

  async query<T>(tenantId: TenantId, query: string, params: any[]): Promise<T> {
    const db = await this.getTenantDb(tenantId);
    return db.query(query, params);
  }
}
```

### Advantages

- ✅ Complete physical isolation
- ✅ Independent scaling per tenant
- ✅ Custom database configuration
- ✅ Better security and compliance
- ✅ Isolated performance impact
- ✅ Tenant-specific backups

### Limitations

- ❌ High operational overhead
- ❌ Complex connection management
- ❌ Database proliferation
- ❌ Higher costs
- ❌ Cross-tenant queries difficult

### Migration from Schema Strategy

```bash
# Step 1: Create new database
createdb tenant_abc123

# Step 2: Export schema
pg_dump -s source_db -n tenant_abc123 > tenant_abc123.schema.sql

# Step 3: Import to new database
psql tenant_abc123 < tenant_abc123.schema.sql

# Step 4: Export data
pg_dump -a source_db -n tenant_abc123 > tenant_abc123.data.sql

# Step 5: Import data
psql tenant_abc123 < tenant_abc123.data.sql

# Step 6: Update tenant registry
UPDATE tenants
SET database_name = 'tenant_abc123'
WHERE id = 'abc123';
```

---

## Strategy Selection Criteria

### RLS Strategy (Default)

**Use when:**

- Small-to-medium tenants (< 10,000 users)
- Low-to-medium data volume
- Standard configuration acceptable
- Cost optimization needed
- Simple operations preferred

### Schema per Tenant

**Use when:**

- Medium-to-large tenants (10,000 - 100,000 users)
- Moderate data volume
- Need per-tenant customization
- Balance isolation and cost
- Planning future database migration

### Database per Tenant

**Use when:**

- Large enterprise tenants (> 100,000 users)
- High data volume
- Strict security/compliance requirements
- Need independent scaling
- Custom database configuration required

---

## Tenant Registry

### Configuration Storage

```typescript
// Tenant registry tracks database strategy
interface TenantDatabaseConfig {
  tenantId: TenantId;
  strategy: "RLS" | "SCHEMA" | "DATABASE";
  databaseName?: string;
  schemaName?: string;
  connectionString?: string;
}
```

### Tenant Routing

```typescript
// Route requests to correct database
export class TenantRouter {
  async route<T>(
    tenantId: TenantId,
    operation: (db: Database) => Promise<T>,
  ): Promise<T> {
    const config = await this.getTenantConfig(tenantId);

    switch (config.strategy) {
      case "RLS":
        return this.rlsDatabase.withContext(tenantId, operation);

      case "SCHEMA":
        return this.schemaDatabase.withSchema(config.schemaName!, operation);

      case "DATABASE":
        return this.tenantDatabase.withDb(config.databaseName!, operation);
    }
  }
}
```

---

## Related Documentation

- [RLS Implementation](./rls-implementation.md)
- [Isolation Diagrams](./isolation-diagrams.md)
- [Tenant Isolation](./tenant-isolation.md)
