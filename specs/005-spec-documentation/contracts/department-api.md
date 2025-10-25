# Department API Contract

> **Purpose**: Department API endpoints and specifications  
> **Base URL**: `/api/v1/departments`

---

## Overview

The Department API provides endpoints for managing departments within organizations.

---

## Endpoints

### Create Department

```http
POST /api/v1/departments
```

**Request**:
```json
{
  "code": "DEV",
  "name": "Development",
  "organizationId": "org-123",
  "parentId": null
}
```

**Response** (201):
```json
{
  "id": "dept-123",
  "code": "DEV",
  "name": "Development",
  "organizationId": "org-123",
  "parentId": null,
  "status": "ACTIVE"
}
```

---

### List Departments

```http
GET /api/v1/departments?organizationId=org-123
```

---

### Get Department

```http
GET /api/v1/departments/:id
```

---

### Update Department

```http
PUT /api/v1/departments/:id
```

---

### Delete Department

```http
DELETE /api/v1/departments/:id
```

---

## Related Documentation

- [Tenant API](../api/tenant-api.md)
- [Organization API](./organization-api.md)
