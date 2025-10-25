# Tenant Context Handling

> **Purpose**: Document multi-tenant context handling in API  
> **Scope**: Tenant isolation, context validation, security

---

## Overview

Every API request must include tenant context to ensure proper data isolation and security. The tenant context is validated at multiple layers.

---

## Request Headers

### Required Headers

```http
X-Tenant-ID: tenant-123
Authorization: Bearer <token>
```

### Optional Headers

```http
X-Organization-ID: org-456
X-Department-ID: dept-789
```

---

## Context Validation

### Layer 1: Token Validation

JWT token must include tenantId:

```json
{
  "sub": "user-123",
  "tenantId": "tenant-123",
  ...
}
```

### Layer 2: Header Validation

X-Tenant-ID must match token tenantId

```typescript
if (headerTenantId !== tokenTenantId) {
  throw new ForbiddenException('Tenant mismatch');
}
```

### Layer 3: Database Isolation

All queries automatically filtered by tenantId:

```sql
SELECT * FROM organizations 
WHERE tenant_id = $1
```

---

## Context Propagation

### Request Context

```typescript
interface IsolationContext {
  platformId: PlatformId;
  tenantId: TenantId;
  organizationId?: OrganizationId;
  departmentId?: DepartmentId;
  userId: UserId;
}
```

### Automatic Propagation

Context flows through:

1. Middleware → validates and sets context
2. Controller → receives context
3. Service → uses context for operations
4. Repository → filters queries by context

---

## Cross-Tenant Prevention

### Detection

```typescript
if (requestedTenantId !== contextTenantId) {
  // Log security event
  await auditLog.log({
    event: 'cross_tenant_access_attempt',
    userId,
    requestedTenantId,
    contextTenantId
  });
  
  throw new SecurityException('Cross-tenant access prevented');
}
```

---

## Related Documentation

- [API Authentication](./authentication.md)
- [Multi-Tenant Security](../security/tenant-security.md)
