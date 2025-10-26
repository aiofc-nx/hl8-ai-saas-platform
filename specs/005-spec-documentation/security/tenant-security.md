# Multi-Tenant Security

> **Purpose**: Document multi-tenant security measures and data isolation  
> **Scope**: Data isolation, cross-tenant prevention, security controls

---

## Overview

Multi-tenant security is the foundation of the SAAS platform, ensuring complete data isolation between tenants while maintaining security and compliance. The platform implements multiple layers of security controls at the application and database levels.

---

## Security Layers

### Layer 1: Database-Level Security (RLS)

**ROW_LEVEL_SECURITY** enforces data isolation at the database level, preventing cross-tenant data access even if application logic has bugs.

```sql
-- Enable RLS on all tenant tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY tenant_isolation_policy ON organizations
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Application must set tenant context
SET app.current_tenant_id = 'tenant-123';
-- Now all queries are automatically filtered
```

**Benefits**:

- Automatic data filtering
- Protection against SQL injection
- Performance optimized with indexes
- Transparent to application code

### Layer 2: Application-Level Isolation

**IsolationContext** carries tenant information throughout the request lifecycle.

```typescript
// Create isolation context
const context = IsolationContext.createTenantLevel(
  platformId,
  tenantId,
  organizationId, // Optional
  departmentId, // Optional
  userId, // Optional
);

// All operations use context
await organizationService.create(data, context);
await userService.findAll(context);
```

**Validation Rules**:

- All operations validate tenant ID
- Cross-tenant operations are rejected
- Context is immutable once created
- Automatic logging of cross-tenant attempts

### Layer 3: API-Level Security

**Tenant Header Validation** ensures every API request is tied to a tenant.

```typescript
@Controller("api/organizations")
export class OrganizationController {
  @Post()
  async create(
    @Headers("x-tenant-id") tenantId: string,
    @Body() dto: CreateOrganizationDto,
  ) {
    // Validate tenant header
    const tenant = await this.validateTenant(tenantId);

    // Create context
    const context = IsolationContext.createTenantLevel(
      platformId,
      tenant.id,
      null, // No org yet
      null,
      currentUserId,
    );

    // Execute operation
    return this.organizationService.create(dto, context);
  }
}
```

---

## Cross-Tenant Prevention

### Prevention Mechanisms

#### 1. Tenant ID Validation

```typescript
async function validateTenantAccess(
  requestedTenantId: TenantId,
  context: IsolationContext,
): Promise<void> {
  if (!requestedTenantId.equals(context.tenantId)) {
    throw new SecurityException("Cross-tenant access attempted", {
      requestedTenantId: requestedTenantId.value,
      contextTenantId: context.tenantId.value,
    });
  }
}
```

#### 2. Automatic Query Filtering

```typescript
export class OrganizationRepository {
  async findAll(context: IsolationContext): Promise<Organization[]> {
    // Automatically filter by tenant_id
    return this.db.query("SELECT * FROM organizations WHERE tenant_id = $1", [
      context.tenantId.value,
    ]);
  }
}
```

#### 3. Entity Validation

```typescript
export class OrganizationService {
  async update(
    id: OrganizationId,
    data: UpdateOrganizationDto,
    context: IsolationContext,
  ): Promise<Organization> {
    // Get organization
    const org = await this.orgRepo.findById(id, context);

    // Validate tenant match
    if (!org.tenantId.equals(context.tenantId)) {
      throw new SecurityException("Tenant mismatch");
    }

    // Update
    return this.orgRepo.update(org, data, context);
  }
}
```

### Detection and Logging

```typescript
interface SecurityEvent {
  type: "cross_tenant_access" | "unauthorized_access" | "suspicious_activity";
  severity: "low" | "medium" | "high" | "critical";
  userId: UserId;
  tenantId: TenantId;
  action: string;
  timestamp: Date;
  details: Record<string, any>;
}

// Log security events
async function logSecurityEvent(event: SecurityEvent) {
  await auditLogService.log({
    ...event,
    sessionId: currentSessionId,
    ipAddress: request.ip,
    userAgent: request.headers["user-agent"],
  });

  // Alert on critical events
  if (event.severity === "critical") {
    await alertingService.sendAlert(event);
  }
}
```

---

## Data Isolation Strategies

### Strategy 1: RLS (Row-Level Security)

**Default Strategy** - All tenants in one database with automatic filtering.

```sql
-- All tenant data in one table
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,  -- RLS key
  name VARCHAR(255) NOT NULL
);

-- RLS automatically filters by tenant_id
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
```

**Security Features**:

- Automatic tenant filtering
- No application code changes needed
- Database-level enforcement
- Indexed for performance

### Strategy 2: Schema Isolation

**Future Strategy** - One database, multiple schemas.

```sql
-- Separate schema per tenant
CREATE SCHEMA tenant_abc123;
CREATE TABLE tenant_abc123.organizations (...);

CREATE SCHEMA tenant_def456;
CREATE TABLE tenant_def456.organizations (...);
```

**Security Features**:

- Schema-level isolation
- No tenant_id column needed
- Better resource isolation
- Simpler queries

### Strategy 3: Database Isolation

**Enterprise Strategy** - Separate database per tenant.

```sql
-- Tenant 1 database
CREATE DATABASE tenant_abc;
CREATE TABLE organizations (...);

-- Tenant 2 database
CREATE DATABASE tenant_def;
CREATE TABLE organizations (...);
```

**Security Features**:

- Complete physical isolation
- Maximum security
- Independent backup/recovery
- Best for compliance

---

## Security Controls

### Authentication

- JWT tokens with tenant claim
- Token validation on every request
- Token expiration and refresh
- Multi-factor authentication (MFA)

### Authorization

- RBAC (Role-Based Access Control) with CASL
- Permission inheritance
- Fine-grained permissions
- Context-aware authorization

### Encryption

- Data at rest: AES-256 encryption
- Data in transit: TLS 1.3
- Database encryption: PostgreSQL TDE
- Key rotation policies

### Monitoring

- Real-time security monitoring
- Anomaly detection
- Intrusion detection system (IDS)
- Security event correlation

---

## Compliance and Auditing

### Audit Requirements

All security events are logged:

- Authentication attempts
- Authorization failures
- Data access (who, what, when)
- Configuration changes
- Security violations

### Compliance Standards

- **GDPR**: Data privacy and right to deletion
- **SOC 2**: Security controls and procedures
- **HIPAA**: Healthcare data protection
- **PCI DSS**: Payment card data security

---

## Security Best Practices

### 1. Always Use IsolationContext

```typescript
// ✅ Good: Explicit context
await service.create(data, context);

// ❌ Bad: No context
await service.create(data);
```

### 2. Validate Tenant ID

```typescript
// Always validate tenant ID in operations
if (!entity.tenantId.equals(context.tenantId)) {
  throw new SecurityException("Tenant mismatch");
}
```

### 3. Use Prepared Statements

```typescript
// ✅ Good: Prepared statement (prevents SQL injection)
const query = "SELECT * FROM users WHERE tenant_id = $1";
await db.query(query, [tenantId]);

// ❌ Bad: String concatenation
const query = `SELECT * FROM users WHERE tenant_id = '${tenantId}'`;
await db.query(query);
```

### 4. Log Security Events

```typescript
// Log all security-related events
await auditLog.log({
  event: "cross_tenant_access_attempt",
  userId,
  tenantId,
  details: { attemptedTenant: otherTenantId },
});
```

---

## Related Documentation

- [Permission Hierarchy](./permission-hierarchy.md)
- [Audit Logging](./audit-logging.md)
- [RLS Implementation](../architecture/rls-implementation.md)
