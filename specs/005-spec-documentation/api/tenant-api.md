# Tenant API Contract

> **Purpose**: Document Tenant API endpoints, requests, and responses  
> **Base URL**: `/api/v1/tenants`  
> **Version**: 1.0.0

---

## Overview

The Tenant API provides endpoints for managing tenant resources in the multi-tenant SAAS platform. All endpoints require authentication and proper tenant context.

---

## Authentication

All API requests require authentication via Bearer token:

```http
Authorization: Bearer <access_token>
```

Additional required headers:

```http
X-Tenant-ID: <tenant_id>
Content-Type: application/json
```

---

## Endpoints

### Create Tenant

Creates a new tenant in the system.

```http
POST /api/v1/tenants
```

**Request Body**:

```json
{
  "code": "acme-corp",
  "name": "Acme Corporation",
  "type": "ENTERPRISE",
  "description": "A leading technology company"
}
```

**Response** (201 Created):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "code": "acme-corp",
  "name": "Acme Corporation",
  "type": "ENTERPRISE",
  "description": "A leading technology company",
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "createdBy": "system",
  "updatedBy": "system"
}
```

**Validation Rules**:

- `code`: Required, 3-20 characters, alphanumeric with dashes/underscores
- `name`: Required, 2-100 characters
- `type`: Required, enum (FREE|BASIC|PROFESSIONAL|ENTERPRISE|CUSTOM)
- `description`: Optional, max 1000 characters

**Error Responses**:

- `400 Bad Request`: Validation failed
- `409 Conflict`: Tenant code already exists
- `422 Unprocessable Entity`: Business rule violation

---

### Get Tenant List

Retrieves a paginated list of tenants.

```http
GET /api/v1/tenants?page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

**Query Parameters**:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): asc or desc (default: desc)
- `status` (optional): Filter by status
- `type` (optional): Filter by type
- `search` (optional): Search by name or code

**Response** (200 OK):

```json
{
  "tenants": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "code": "acme-corp",
      "name": "Acme Corporation",
      "type": "ENTERPRISE",
      "status": "ACTIVE",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### Get Tenant by ID

Retrieves a specific tenant by ID.

```http
GET /api/v1/tenants/:id
```

**Path Parameters**:

- `id`: Tenant UUID

**Response** (200 OK):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "code": "acme-corp",
  "name": "Acme Corporation",
  "type": "ENTERPRISE",
  "description": "A leading technology company",
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "createdBy": "system",
  "updatedBy": "system"
}
```

**Error Responses**:

- `404 Not Found`: Tenant not found

---

### Update Tenant

Updates an existing tenant.

```http
PUT /api/v1/tenants/:id
```

**Path Parameters**:

- `id`: Tenant UUID

**Request Body**:

```json
{
  "name": "Acme Corp Updated",
  "description": "Updated description",
  "status": "ACTIVE"
}
```

**Response** (200 OK):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "code": "acme-corp",
  "name": "Acme Corp Updated",
  "type": "ENTERPRISE",
  "description": "Updated description",
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T11:00:00Z",
  "createdBy": "system",
  "updatedBy": "admin-user"
}
```

**Validation Rules**:

- Cannot update `code` or `type` (immutable fields)
- Can update `name`, `description`, `status`
- Status transitions must be valid

**Error Responses**:

- `404 Not Found`: Tenant not found
- `400 Bad Request`: Validation failed
- `409 Conflict`: Status transition invalid

---

### Delete Tenant

Soft deletes a tenant.

```http
DELETE /api/v1/tenants/:id
```

**Path Parameters**:

- `id`: Tenant UUID

**Response** (204 No Content)

**Business Rules**:

- Only ACTIVE, SUSPENDED, or EXPIRED tenants can be deleted
- Soft delete with 30-day retention period
- Automatic backup before deletion

**Error Responses**:

- `404 Not Found`: Tenant not found
- `409 Conflict`: Cannot delete tenant (has dependencies)

---

### Suspend Tenant

Suspends a tenant's access.

```http
POST /api/v1/tenants/:id/suspend
```

**Path Parameters**:

- `id`: Tenant UUID

**Request Body**:

```json
{
  "reason": "Payment overdue"
}
```

**Response** (200 OK):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "SUSPENDED",
  "suspendedAt": "2024-01-15T12:00:00Z",
  "suspendedBy": "admin-user",
  "suspensionReason": "Payment overdue"
}
```

---

### Activate Tenant

Activates a suspended or expired tenant.

```http
POST /api/v1/tenants/:id/activate
```

**Path Parameters**:

- `id`: Tenant UUID

**Response** (200 OK):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "ACTIVE",
  "activatedAt": "2024-01-15T13:00:00Z",
  "activatedBy": "admin-user"
}
```

---

### Upgrade/Downgrade Tenant

Changes tenant type (upgrade or downgrade).

```http
POST /api/v1/tenants/:id/upgrade
```

**Path Parameters**:

- `id`: Tenant UUID

**Request Body**:

```json
{
  "newType": "PROFESSIONAL",
  "effectiveDate": "2024-02-01T00:00:00Z"
}
```

**Response** (200 OK):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "PROFESSIONAL",
  "previousType": "BASIC",
  "upgradedAt": "2024-01-15T14:00:00Z",
  "effectiveDate": "2024-02-01T00:00:00Z"
}
```

**Business Rules**:

- Check resource usage against new limits
- May require data cleanup before downgrade
- Effective date allows delayed activation

---

## Error Responses

All error responses follow this structure:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Tenant code validation failed",
    "details": {
      "field": "code",
      "reason": "Code already exists"
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

### Error Codes

- `VALIDATION_FAILED`: Input validation failed
- `RESOURCE_NOT_FOUND`: Resource not found
- `CONFLICT`: Resource conflict (e.g., duplicate code)
- `FORBIDDEN`: Insufficient permissions
- `UNAUTHORIZED`: Authentication required
- `BUSINESS_RULE_VIOLATION`: Business rule violation
- `INTERNAL_ERROR`: Internal server error

---

## Rate Limits

- **Standard**: 100 requests per minute per tenant
- **Burst**: 200 requests per minute (short bursts)
- Rate limit headers:
  ```
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1705315800
  ```

---

## Related Documentation

- [API Authentication](./authentication.md)
- [API Versioning](./versioning.md)
- [Organization API](./organization-api.md)
- [Department API](./department-api.md)
