# Event Sourcing Implementation

> **Purpose**: Document event sourcing architecture and implementation  
> **Scope**: Event store, snapshots, replay, projections

---

## Overview

The platform uses Event Sourcing to store all state changes as a sequence of events. This provides a complete audit trail and enables event replay.

---

## Event Store

### Event Storage

```sql
CREATE TABLE event_store (
  id UUID PRIMARY KEY,
  aggregate_id UUID NOT NULL,
  aggregate_type VARCHAR(50) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,
  event_metadata JSONB,
  version INTEGER NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Snapshots

Periodic snapshots for performance:

```typescript
interface Snapshot {
  aggregateId: string;
  aggregateType: string;
  state: any;
  version: number;
  createdAt: Date;
}
```

---

## Event Replay

```typescript
async function replayEvents(aggregateId: string): Promise<Aggregate> {
  const events = await eventStore.getEvents(aggregateId);
  const snapshot = await snapshotStore.getLatest(aggregateId);

  let aggregate = snapshot ? reconstructFromSnapshot(snapshot) : createNew();

  for (const event of events) {
    aggregate.apply(event);
  }

  return aggregate;
}
```

---

## Related Documentation

- [Event Handling](./event-handling.md)
- [Event Error Handling](./event-error-handling.md)
