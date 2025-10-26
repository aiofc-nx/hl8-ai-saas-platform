# Event Publishing

> **Purpose**: Document event publishing mechanism  
> **Scope**: Domain events, event bus, event subscription

---

## Overview

The platform uses an event-driven architecture for loose coupling and scalability.

---

## Event Types

### Tenant Events

```typescript
interface TenantCreatedEvent {
  type: "tenant.created";
  tenantId: string;
  timestamp: Date;
  data: TenantData;
}
```

### Organization Events

```typescript
interface OrganizationCreatedEvent {
  type: "organization.created";
  organizationId: string;
  tenantId: string;
  timestamp: Date;
}
```

---

## Publishing Events

```typescript
await eventBus.publish(new TenantCreatedEvent(tenantData));
```

---

## Event Subscription

```typescript
eventBus.subscribe("tenant.created", async (event) => {
  // Handle event
});
```

---

## Related Documentation

- [Webhooks](./webhooks.md)
- [Event-Driven Architecture](../events/)
