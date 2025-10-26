# Business Constraints

> **Purpose**: Document business constraints including trial periods, upgrades, and deletion rules  
> **Scope**: Operational constraints, lifecycle constraints, resource constraints

---

## Overview

Business constraints define the operational boundaries and rules that govern tenant lifecycle, upgrades, deletions, and resource management. These constraints ensure consistent behavior across all tenants while protecting platform stability.

---

## Lifecycle Constraints

### Trial Period Constraints

```typescript
interface TrialPeriodConstraints {
  trialDuration: {
    [TenantTypeEnum.FREE]: 0; // No trial
    [TenantTypeEnum.BASIC]: 14; // 14 days
    [TenantTypeEnum.PROFESSIONAL]: 30; // 30 days
    [TenantTypeEnum.ENTERPRISE]: 60; // 60 days
  };

  trialRestrictions: {
    limitedFeatures: true;
    watermarkedOutput: true;
    noSupport: true;
  };

  conversionRequirement: {
    requiresPayment: true;
    canUpgrade: true;
    canDowngrade: false;
  };
}
```

### Activation Constraints

```typescript
interface ActivationConstraints {
  // Auto-activation for FREE/BASIC
  autoActivate: [TenantTypeEnum.FREE, TenantTypeEnum.BASIC];

  // Manual approval for PROFESSIONAL/ENTERPRISE
  manualApproval: [TenantTypeEnum.PROFESSIONAL, TenantTypeEnum.ENTERPRISE];

  // Required for activation
  prerequisites: {
    emailVerified: true;
    paymentSetup: boolean; // Required for paid plans
    termsAccepted: true;
  };
}
```

---

## Upgrade Constraints

### Upgrade Rules

```typescript
interface UpgradeConstraints {
  // Upgrade allowed
  allowedUpgrades: [
    {
      from: TenantTypeEnum.FREE;
      to: [
        TenantTypeEnum.BASIC,
        TenantTypeEnum.PROFESSIONAL,
        TenantTypeEnum.ENTERPRISE,
      ];
    },
    {
      from: TenantTypeEnum.BASIC;
      to: [TenantTypeEnum.PROFESSIONAL, TenantTypeEnum.ENTERPRISE];
    },
    { from: TenantTypeEnum.PROFESSIONAL; to: [TenantTypeEnum.ENTERPRISE] },
  ];

  // Downgrade restrictions
  downgradeRestrictions: {
    requireDataCleanup: true;
    requireArchiving: true;
    notifyUsers: true;
    gracePeriod: "30 days";
  };

  // Upgrade timing
  upgradeTiming: {
    immediate: ["FREE → BASIC", "BASIC → PROFESSIONAL"];
    endOfCycle: ["PROFESSIONAL → ENTERPRISE"];
  };
}
```

### Downgrade Constraints

```typescript
interface DowngradeConstraints {
  // Validate resource usage
  checkUsage: true;

  // Require action if over limit
  requireAction: {
    archiveUsers: true;
    archiveOrganizations: true;
    deleteFiles: false; // Archive instead
  };

  // Warning period
  warningPeriod: 30; // days
}
```

---

## Deletion Constraints

### Deletion Rules

```typescript
interface DeletionConstraints {
  // Cannot delete ACTIVE tenants directly
  requiresStatus: ["SUSPENDED", "EXPIRED", "PENDING"];

  // Data retention
  retentionPeriod: 30; // days

  // Deletion confirmation
  confirmation: {
    requireConfirmation: true;
    requireReason: true;
    requirePassword: true;
  };

  // Backup before deletion
  backup: {
    createBackup: true;
    retainBackup: 90; // days
  };
}
```

### Soft Delete

```typescript
async function softDeleteTenant(
  tenantId: TenantId,
  reason: string,
  deletedBy: UserId,
): Promise<void> {
  // 1. Mark as deleted
  const tenant = await tenantRepo.findById(tenantId);
  tenant.markAsDeleted(reason, deletedBy);

  // 2. Archive data
  await archiveTenantData(tenantId);

  // 3. Cancel subscriptions
  await cancelSubscriptions(tenantId);

  // 4. Send notification
  await notifyTenantDeletion(tenant, reason);
}
```

---

## Resource Constraints

### User Assignment Constraints

```typescript
interface UserAssignmentConstraints {
  // Single department per organization
  singleDepartmentPerOrganization: true;

  // Multiple organizations allowed
  allowMultipleOrganizations: true;

  // Required assignment
  requireAssignment: {
    organization: true; // Must be in at least one org
    department: false; // Optional
  };
}
```

### Department Hierarchy Constraints

```typescript
interface DepartmentHierarchyConstraints {
  // Maximum depth
  maxDepth: 7;

  // Circular reference prevention
  preventCircularReference: true;

  // Parent constraints
  parentRules: {
    mustBeSameOrganization: true;
    mustBeDepartmentType: true;
    cannotBeSelf: true;
  };
}
```

---

## Operational Constraints

### API Rate Limits

```typescript
interface RateLimitConstraints {
  perTenant: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };

  perUser: {
    requestsPerMinute: number;
  };

  burstAllowance: {
    allowBurst: true;
    burstLimit: number;
  };
}
```

### Concurrency Constraints

```typescript
interface ConcurrencyConstraints {
  maxConcurrentRequests: number;
  maxConcurrentUsers: number;
  maxConcurrentSessions: number;
}
```

---

## Data Integrity Constraints

### Referential Integrity

```typescript
interface ReferentialIntegrityConstraints {
  // Cascade deletion rules
  cascadeDelete: {
    tenant: {
      organizations: "CASCADE";
      users: "CASCADE";
      data: "CASCADE";
    };
    organization: {
      departments: "CASCADE";
      users: "SET NULL";
    };
    department: {
      users: "SET NULL";
    };
  };

  // Orphan cleanup
  orphanCleanup: {
    enabled: true;
    schedule: "daily";
    retention: 7; // days
  };
}
```

### Data Validation

```typescript
interface DataValidationConstraints {
  // Required fields
  requiredFields: {
    tenant: ["code", "name", "type", "status"];
    user: ["email", "name"];
    organization: ["code", "name", "type"];
  };

  // Immutable fields
  immutableFields: {
    tenant: ["code", "type"];
    organization: ["code", "tenantId"];
  };

  // Enum constraints
  enumValues: {
    tenantType: ["FREE", "BASIC", "PROFESSIONAL", "ENTERPRISE", "CUSTOM"];
    tenantStatus: ["PENDING", "ACTIVE", "SUSPENDED", "EXPIRED", "DELETED"];
    organizationType: [
      "COMPANY",
      "DIVISION",
      "PROJECT_TEAM",
      "DEPARTMENT",
      "COMMITTEE",
      "WORKGROUP",
      "PARTNERSHIP",
    ];
  };
}
```

---

## Related Documentation

- [Resource Limits](./resource-limits.md)
- [Validation Rules](./validation-rules.md)
- [Tenant Lifecycle](../tenants/tenant-creation.md)
