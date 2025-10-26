# API Authentication

> **Purpose**: Document API authentication mechanisms and security  
> **Scope**: JWT tokens, tenant context, authorization

---

## Overview

The API uses JWT (JSON Web Tokens) for authentication and authorization. All requests must include valid authentication credentials and tenant context.

---

## Authentication Flow

### Login Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Auth API
    participant D as Database

    C->>A: POST /auth/login
    A->>D: Verify credentials
    D-->>A: User validated
    A->>A: Generate JWT tokens
    A-->>C: Return access_token + refresh_token
```

### Request Flow

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "tenantId": "tenant-123"
}
```

**Response**:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}
```

---

## Using Tokens

### Authorization Header

All authenticated requests must include the token:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Tenant-ID: tenant-123
```

### Token Claims

JWT payload structure:

```json
{
  "sub": "user-123",
  "email": "user@example.com",
  "tenantId": "tenant-123",
  "roles": ["TenantAdmin", "OrganizationAdmin"],
  "permissions": ["tenant:read", "organization:manage"],
  "iat": 1705315800,
  "exp": 1705319400
}
```

---

## Refresh Tokens

Refresh access tokens when expired:

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**:

```json
{
  "accessToken": "new-access-token",
  "expiresIn": 3600
}
```

---

## Tenant Context

### Required Headers

```http
X-Tenant-ID: tenant-123
```

### Validation

- Token tenantId must match X-Tenant-ID header
- Cross-tenant requests are rejected
- Automatic isolation enforcement

---

## Error Responses

### 401 Unauthorized

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

### 403 Forbidden

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

---

## Security Best Practices

1. Store tokens securely (httpOnly cookies or secure storage)
2. Never expose refresh tokens to client-side JavaScript
3. Implement token rotation
4. Monitor for suspicious activity
5. Use HTTPS for all API communication

---

## Related Documentation

- [API Versioning](./versioning.md)
- [Tenant Context](./tenant-context.md)
