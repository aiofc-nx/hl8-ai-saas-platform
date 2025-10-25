# Webhook Notifications

> **Purpose**: Document webhook system for event notifications  
> **Scope**: Webhook registration, events, delivery, retries

---

## Overview

Webhooks allow external systems to receive real-time notifications of events in the platform.

---

## Webhook Registration

### Create Webhook

```http
POST /api/v1/webhooks
```

**Request**:
```json
{
  "url": "https://example.com/webhook",
  "events": ["tenant.created", "tenant.updated"],
  "secret": "your-secret-key"
}
```

**Response** (201):
```json
{
  "id": "webhook-123",
  "url": "https://example.com/webhook",
  "events": ["tenant.created", "tenant.updated"],
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

## Webhook Events

### Available Events

- `tenant.created`
- `tenant.updated`
- `tenant.suspended`
- `organization.created`
- `department.created`

---

## Webhook Delivery

### Payload

```json
{
  "event": "tenant.created",
  "data": {
    "id": "tenant-123",
    "code": "acme-corp",
    ...
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Signature

```http
X-Webhook-Signature: sha256=...
```

---

## Retry Logic

- Max attempts: 3
- Exponential backoff
- Dead letter queue after failures

---

## Related Documentation

- [API Events](./events.md)
