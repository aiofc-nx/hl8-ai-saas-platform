# Organization API Contract

> **Purpose**: Organization API endpoints and specifications  
> **Base URL**: `/api/v1/organizations`

---

## Overview

The Organization API provides endpoints for managing organizational structures within tenants.

---

## Endpoints

### Create Organization

```http
POST /api/v1/organizations
```

**Request**:
```json
{
  "code": "ENG",
  "name": "Engineering",
  "type": "DIVISION",
  "description": "Engineering division"
}
```

**Response** (201):
```json
{
  "id": "org-123",
  "code": "ENG",
  "name": "Engineering",
  "type": "DIVISION",
  "status": "ACTIVE"
}
```

---

### List Organizations

```http
GET /api/v1/organizations?parentId=org-123
```

**Response** (200):
```json
{
  "organizations": [...],
  "pagination": {...}
}
```

---

### Get Organization

```http
GET /api/v1/organizations/:id
```

**Response** (200):
```json
{
  "id": "org-123",
  "code": "ENG",
  "name": "Engineering",
  "type": "DIVISION",
  "parentId": null,
  "status": "ACTIVE"
}
```

---

### Update Organization

```http
PUT /api/v1/organizations/:id
```

---

### Delete Organization

```http
DELETE /api/v1/organizations/:id
```

---

## Related Documentation

- [Tenant API](../api/tenant-api.md)
- [Department API](./department-api.md)
