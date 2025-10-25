# Tenant Status Management

> **Purpose**: Document tenant status state machine and transitions  
> **Scope**: PENDING → ACTIVE → SUSPENDED → EXPIRED → DELETED

---

## Overview

Tenant status management ensures proper lifecycle control and enforces business rules for tenant operations. Status transitions follow a strict state machine with validation rules.

---

## Tenant Status States

### PENDING

**Description**: Tenant created but not yet activated  
**Initial State**: All new tenants start in PENDING  
**Allowed Operations**: Limited (setup and configuration only)

**Characteristics**:
- Tenant record exists
- Resources initialized
- Not accessible for normal operations
- Awaiting activation or approval

**Transitions**:
- → ACTIVE: Activation approved
- → DELETED: Application rejected or cancelled

---

### ACTIVE

**Description**: Tenant is operational and accessible  
**Normal State**: Active tenants can use all features  
**Allowed Operations**: All tenant operations

**Characteristics**:
- Full functionality available
- Users can access the system
- Regular operations allowed
- Billing active (if applicable)

**Transitions**:
- → SUSPENDED: Admin action or policy violation
- → EXPIRED: Subscription period ended
- → DELETED: Tenant decommissioning

---

### SUSPENDED

**Description**: Tenant temporarily disabled  
**Temporary State**: Operations paused but data preserved  
**Allowed Operations**: Read-only access to data

**Characteristics**:
- Operations disabled
- Data retained
- Admin access for configuration
- Can be resumed or deleted

**Transitions**:
- → ACTIVE: Suspension lifted
- → DELETED: Permanent decommissioning

**Reasons for Suspension**:
- Non-payment
- Terms of service violation
- Security concerns
- Manual admin action

---

### EXPIRED

**Description**: Trial or subscription period ended  
**Expired State**: Limited access, data preserved  
**Allowed Operations**: Data export and renewal

**Characteristics**:
- Read-only access
- Data export available
- Renewal option provided
- Billing inactive

**Transitions**:
- → ACTIVE: Subscription renewed
- → DELETED: Data retention period ended

**Expiration Scenarios**:
- Trial period ended
- Subscription renewal failed
- Billing issue

---

### DELETED

**Description**: Tenant permanently removed  
**Final State**: Data deleted or archived  
**Allowed Operations**: None

**Characteristics**:
- Soft delete (data archived)
- Hard delete (data removed)
- No recovery option
- Audit trail retained

**Transitions**: None (terminal state)

---

## State Machine Diagram

```
                    ┌──────────┐
                    │ PENDING  │
                    └────┬─────┘
                         │
                         │ activate()
                         ▼
                    ┌─────────┐
           ◄────────│ ACTIVE  │──────┐
           │        └────┬────┘      │
    resume()│            │            │ expire()
           │            │            │
           │       suspend()          │
           │            │              │
           │            ▼              │
           │     ┌────────────┐       │
           └─────│ SUSPENDED  │       │
                 └────┬───────┘       │
                      │                │
                      │                │
                 delete()              │
                      │                │
                      ▼                │
                 ┌─────────┐           │
                 │ DELETED │◄──────────┘
                 └─────────┘
```

---

## Status Transition Rules

### activate()

**From**: PENDING  
**To**: ACTIVE  
**Conditions**:
- All validations passed
- Payment processed (if required)
- Approval granted (if required)

**Process**:
```typescript
async function activate(tenant: TenantAggregate, reason?: string) {
  // Validate transition allowed
  if (tenant.status !== TenantStatusEnum.PENDING) {
    throw new Error('Can only activate PENDING tenants');
  }
  
  // Check activation requirements
  await validateActivationRequirements(tenant);
  
  // Update status
  tenant.activate();
  
  // Save and publish events
  await tenantRepo.save(tenant, context);
  await eventBus.publish(new TenantActivatedEvent(tenant));
}
```

---

### suspend()

**From**: ACTIVE  
**To**: SUSPENDED  
**Conditions**:
- Admin action
- Non-payment
- Violation detected

**Process**:
```typescript
async function suspend(
  tenant: TenantAggregate, 
  reason: string,
  suspendedBy: UserId
) {
  // Validate transition
  if (tenant.status !== TenantStatusEnum.ACTIVE) {
    throw new Error('Can only suspend ACTIVE tenants');
  }
  
  // Update status
  tenant.suspend(reason, suspendedBy);
  
  // Save and notify
  await tenantRepo.save(tenant, context);
  await eventBus.publish(new TenantSuspendedEvent(tenant, reason));
  await notifyUser(tenant, { type: 'suspended', reason });
}
```

---

### resume()

**From**: SUSPENDED  
**To**: ACTIVE  
**Conditions**:
- Issue resolved
- Payment received
- Admin override

**Process**:
```typescript
async function resume(tenant: TenantAggregate, resumedBy: UserId) {
  // Validate transition
  if (tenant.status !== TenantStatusEnum.SUSPENDED) {
    throw new Error('Can only resume SUSPENDED tenants');
  }
  
  // Update status
  tenant.resume(resumedBy);
  
  // Save and notify
  await tenantRepo.save(tenant, context);
  await eventBus.publish(new TenantResumedEvent(tenant));
  await notifyUser(tenant, { type: 'resumed' });
}
```

---

### expire()

**From**: ACTIVE  
**To**: EXPIRED  
**Conditions**:
- Trial period ended
- Subscription expired
- Billing failed

**Process**:
```typescript
async function expire(tenant: TenantAggregate, reason: string) {
  // Check if can expire
  if (!canExpire(tenant)) {
    return; // Auto-renewal active
  }
  
  // Update status
  tenant.expire(reason);
  
  // Save and notify
  await tenantRepo.save(tenant, context);
  await eventBus.publish(new TenantExpiredEvent(tenant, reason));
  await notifyUser(tenant, { type: 'expired', reason });
}
```

---

### delete()

**From**: PENDING, SUSPENDED, or EXPIRED  
**To**: DELETED  
**Conditions**:
- Manual deletion
- Retention period ended
- Legal requirement

**Process**:
```typescript
async function deleteTenant(
  tenant: TenantAggregate,
  deletedBy: UserId,
  reason: string
) {
  // Validate can delete
  if (tenant.status === TenantStatusEnum.ACTIVE) {
    throw new Error('Cannot delete ACTIVE tenant - suspend first');
  }
  
  // Archive data
  await archiveTenantData(tenant);
  
  // Update status
  tenant.delete(deletedBy, reason);
  
  // Save and publish
  await tenantRepo.save(tenant, context);
  await eventBus.publish(new TenantDeletedEvent(tenant, reason));
}
```

---

## Automatic Transitions

### Trial Expiration

```typescript
// Scheduled job runs daily
async function checkTrialExpiration() {
  const expiringTenants = await tenantRepo.findExpiringTrials();
  
  for (const tenant of expiringTenants) {
    if (tenant.trialEndDate <= new Date()) {
      await expire(tenant, 'Trial period ended');
    }
  }
}
```

### Subscription Expiration

```typescript
// Check subscription status
async function checkSubscriptionExpiration() {
  const expiringSubscriptions = await subscriptionRepo.findExpiring();
  
  for (const subscription of expiringSubscriptions) {
    const tenant = await tenantRepo.findById(subscription.tenantId);
    
    if (subscription.endDate <= new Date()) {
      await expire(tenant, 'Subscription expired');
    }
  }
}
```

---

## Business Rules

### Activation Rules

- PENDING tenants can only be activated by admins or auto-activation
- Activation requires valid payment for paid plans
- Activation creates welcome email and onboarding

### Suspension Rules

- SUSPENDED tenants cannot access the system
- Admins can still access for configuration
- Data remains intact during suspension

### Expiration Rules

- EXPIRED tenants have 30-day grace period
- Data export available during grace period
- After grace period, data is archived

### Deletion Rules

- Cannot delete ACTIVE tenants directly
- Must suspend or expire first
- Soft delete by default (data archived)
- Hard delete after retention period

---

## Related Documentation

- [Tenant Types](./tenant-types.md)
- [Tenant Creation Workflow](./tenant-creation.md)
- [Tenant Upgrade Paths](./tenant-upgrades.md)
