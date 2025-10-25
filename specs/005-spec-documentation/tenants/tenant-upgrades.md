# Tenant Upgrade Paths

> **Purpose**: Document tenant type upgrade and downgrade procedures  
> **Scope**: All tenant type transitions

---

## Overview

Tenant upgrades and downgrades allow tenants to adjust their plan based on changing needs. The process handles resource limit changes, feature activation, and data migration.

---

## Upgrade Flow

### Initiate Upgrade

**Actor**: Tenant Admin  
**Goal**: Request upgrade to higher tier

```typescript
interface UpgradeRequest {
  currentType: TenantType;
  targetType: TenantType;
  effectiveDate: 'immediate' | 'end_of_cycle';
  paymentMethod?: PaymentMethod;
}
```

**Process**:
1. User selects target tenant type
2. System calculates price difference
3. User confirms upgrade
4. Payment processed (if required)
5. Upgrade applied based on effective date

---

### Immediate Upgrade

**Applies to**: FREE → BASIC, BASIC → PROFESSIONAL, PROFESSIONAL → ENTERPRISE

**Process**:
```typescript
async function upgradeImmediate(
  tenant: TenantAggregate,
  newType: TenantType
) {
  // 1. Validate upgrade allowed
  validateUpgradePath(tenant.type, newType);
  
  // 2. Process payment
  await billingService.processUpgrade(tenant, newType);
  
  // 3. Update tenant type
  tenant.upgradeType(newType);
  
  // 4. Activate new features
  await enableNewFeatures(tenant, newType);
  
  // 5. Send notification
  await notifyUpgradeComplete(tenant, newType);
}
```

**Effects**:
- Immediate access to new features
- Higher resource limits apply immediately
- Prorated billing adjustment
- No data migration needed

---

### End-of-Cycle Upgrade

**Applies to**: Any paid plan upgrade

**Process**:
```typescript
async function upgradeEndOfCycle(
  tenant: TenantAggregate,
  newType: TenantType
) {
  // 1. Schedule upgrade
  await upgradeScheduler.schedule(
    tenant.id,
    newType,
    tenant.billingCycleEnd
  );
  
  // 2. Send confirmation
  await notifyUpgradeScheduled(tenant, newType, tenant.billingCycleEnd);
}
```

**Effects**:
- Upgrade applied at billing cycle end
- No immediate charge
- Current billing cycle unchanged
- Smooth transition

---

## Downgrade Flow

### Initiate Downgrade

**Actor**: Tenant Admin  
**Goal**: Request downgrade to lower tier

```typescript
interface DowngradeRequest {
  currentType: TenantType;
  targetType: TenantType;
  effectiveDate: 'immediate' | 'end_of_cycle';
}
```

**Process**:
1. User selects target tenant type
2. System checks data/migration requirements
3. User confirms downgrade
4. Downgrade applied at effective date

---

### Downgrade Validation

**Critical Checks**:

```typescript
async function validateDowngrade(
  tenant: TenantAggregate,
  targetType: TenantType
): Promise<DowngradeValidation> {
  const limits = getTypeLimits(targetType);
  
  // Check if current usage exceeds new limits
  const validation = {
    canDowngrade: true,
    warnings: [] as string[],
    actions: [] as string[]
  };
  
  // Check users
  const userCount = await getActiveUserCount(tenant);
  if (userCount > limits.maxUsers) {
    validation.warnings.push(
      `Current users (${userCount}) exceed limit (${limits.maxUsers})`
    );
    validation.actions.push('Archive excess users');
  }
  
  // Check storage
  const storageUsed = await getStorageUsed(tenant);
  if (storageUsed > limits.maxStorageGB) {
    validation.warnings.push(
      `Current storage (${storageUsed}GB) exceeds limit (${limits.maxStorageGB}GB)`
    );
    validation.actions.push('Archive or delete files');
  }
  
  // Check organizations
  const orgCount = await getOrganizationCount(tenant);
  if (orgCount > limits.maxOrganizations) {
    validation.warnings.push(
      `Current organizations (${orgCount}) exceed limit (${limits.maxOrganizations})`
    );
    validation.actions.push('Archive excess organizations');
  }
  
  return validation;
}
```

---

### Immediate Downgrade

**Process**:
```typescript
async function downgradeImmediate(
  tenant: TenantAggregate,
  newType: TenantType
) {
  // 1. Validate downgrade
  const validation = await validateDowngrade(tenant, newType);
  
  if (!validation.canDowngrade) {
    throw new Error('Downgrade not allowed - resolve issues first');
  }
  
  // 2. Archive excess data (if needed)
  await archiveExcessData(tenant, newType);
  
  // 3. Disable premium features
  await disablePremiumFeatures(tenant, newType);
  
  // 4. Update tenant type
  tenant.downgradeType(newType);
  
  // 5. Process refund (prorated)
  await billingService.processDowngrade(tenant, newType);
  
  // 6. Send notification
  await notifyDowngradeComplete(tenant, newType);
}
```

---

### End-of-Cycle Downgrade

**Process**:
```typescript
async function downgradeEndOfCycle(
  tenant: TenantAggregate,
  newType: TenantType
) {
  // 1. Validate and warn user
  const validation = await validateDowngrade(tenant, newType);
  await notifyDowngradeWarnings(tenant, validation);
  
  // 2. Schedule downgrade
  await downgradeScheduler.schedule(
    tenant.id,
    newType,
    tenant.billingCycleEnd
  );
  
  // 3. Send confirmation
  await notifyDowngradeScheduled(tenant, newType, tenant.billingCycleEnd);
}
```

**Effects**:
- Downgrade applied at billing cycle end
- No immediate refund
- Current features remain until cycle end
- User has time to prepare

---

## Upgrade Path Matrix

| From → To | FREE | BASIC | PROFESSIONAL | ENTERPRISE | CUSTOM |
|-----------|------|-------|--------------|------------|--------|
| **FREE** | - | ✅ Immediate | ✅ Immediate | ✅ Immediate | 📝 Manual |
| **BASIC** | ⚠️ Warning | - | ✅ Immediate | ✅ Immediate | 📝 Manual |
| **PROFESSIONAL** | ⚠️ Archive | ⚠️ Archive | - | ✅ Immediate | 📝 Manual |
| **ENTERPRISE** | ⚠️ Archive | ⚠️ Archive | ⚠️ Archive | - | 📝 Manual |
| **CUSTOM** | 📝 Manual | 📝 Manual | 📝 Manual | 📝 Manual | 📝 Modify |

**Legend**:
- ✅ **Immediate**: Upgrade available immediately
- ⚠️ **Archive**: Data migration required
- 📝 **Manual**: Requires manual process

---

## Feature Activation/Deactivation

### On Upgrade

```typescript
async function enableNewFeatures(tenant: TenantAggregate, newType: TenantType) {
  const features = getFeaturesForType(newType);
  
  for (const feature of features) {
    // Enable feature flag
    await featureFlagService.enable(tenant.id, feature);
    
    // Send feature announcement
    await notifyFeatureUnlocked(tenant, feature);
  }
}
```

### On Downgrade

```typescript
async function disablePremiumFeatures(
  tenant: TenantAggregate,
  newType: TenantType
) {
  const currentFeatures = getCurrentFeatures(tenant);
  const allowedFeatures = getFeaturesForType(newType);
  const disabledFeatures = currentFeatures.filter(f => !allowedFeatures.includes(f));
  
  for (const feature of disabledFeatures) {
    // Disable feature flag
    await featureFlagService.disable(tenant.id, feature);
    
    // Notify users
    await notifyFeatureRemoved(tenant, feature);
    
    // Archive feature data (if applicable)
    await archiveFeatureData(tenant, feature);
  }
}
```

---

## Billing Adjustments

### Prorated Charges

```typescript
async function calculateProratedUpgrade(
  currentType: TenantType,
  newType: TenantType,
  daysRemaining: number
): Promise<number> {
  const currentPrice = getMonthlyPrice(currentType);
  const newPrice = getMonthlyPrice(newType);
  const priceDiff = newPrice - currentPrice;
  
  // Prorate based on days remaining
  const dailyRate = priceDiff / 30;
  return dailyRate * daysRemaining;
}
```

### Refunds

```typescript
async function calculateDowngradeRefund(
  currentType: TenantType,
  newType: TenantType,
  daysRemaining: number
): Promise<number> {
  const currentPrice = getMonthlyPrice(currentType);
  const newPrice = getMonthlyPrice(newType);
  const priceDiff = currentPrice - newPrice;
  
  // Refund prorated difference
  const dailyRate = priceDiff / 30;
  return dailyRate * daysRemaining;
}
```

---

## Related Documentation

- [Tenant Types](./tenant-types.md)
- [Tenant Creation Workflow](./tenant-creation.md)
- [Tenant Status Management](./tenant-status.md)
