# Resource Limits

> **Purpose**: Document resource limits by tenant type  
> **Scope**: Users, organizations, storage, API calls, and other resources

---

## Overview

Resource limits define the maximum capacity for each tenant type, ensuring fair resource usage and supporting scalability. Limits are enforced at the application level and monitored continuously.

---

## Resource Limits by Tenant Type

### FREE Tenant Limits

```typescript
interface FreeTenantLimits {
  // User Limits
  maxUsers: 10;
  maxActiveUsers: 10;
  
  // Organization Limits
  maxOrganizations: 2;
  
  // Department Limits
  maxDepartments: 5;
  maxDepartmentLevels: 3;
  
  // Storage Limits
  maxStorageGB: 1;
  maxFileSizeMB: 10;
  
  // API Limits
  maxApiCallsPerDay: 1000;
  maxApiCallsPerMinute: 20;
  
  // Document Limits
  maxDocuments: 100;
  maxDocumentSizeMB: 5;
  
  // Integration Limits
  maxIntegrations: 0;
  maxWebhooks: 0;
  
  // Feature Flags
  features: {
    apiAccess: false;
    customIntegrations: false;
    advancedReporting: false;
    sso: false;
  };
}
```

### BASIC Tenant Limits

```typescript
interface BasicTenantLimits {
  // User Limits
  maxUsers: 50;
  maxActiveUsers: 50;
  
  // Organization Limits
  maxOrganizations: 10;
  
  // Department Limits
  maxDepartments: 20;
  maxDepartmentLevels: 5;
  
  // Storage Limits
  maxStorageGB: 10;
  maxFileSizeMB: 50;
  
  // API Limits
  maxApiCallsPerDay: 10000;
  maxApiCallsPerMinute: 100;
  
  // Document Limits
  maxDocuments: 1000;
  maxDocumentSizeMB: 25;
  
  // Integration Limits
  maxIntegrations: 3;
  maxWebhooks: 5;
  
  // Feature Flags
  features: {
    apiAccess: true;
    customIntegrations: false;
    advancedReporting: false;
    sso: false;
  };
}
```

### PROFESSIONAL Tenant Limits

```typescript
interface ProfessionalTenantLimits {
  // User Limits
  maxUsers: 200;
  maxActiveUsers: 200;
  
  // Organization Limits
  maxOrganizations: 50;
  
  // Department Limits
  maxDepartments: 100;
  maxDepartmentLevels: 7;
  
  // Storage Limits
  maxStorageGB: 100;
  maxFileSizeMB: 100;
  
  // API Limits
  maxApiCallsPerDay: 100000;
  maxApiCallsPerMinute: 500;
  
  // Document Limits
  maxDocuments: 10000;
  maxDocumentSizeMB: 100;
  
  // Integration Limits
  maxIntegrations: 10;
  maxWebhooks: 20;
  
  // Feature Flags
  features: {
    apiAccess: true;
    customIntegrations: true;
    advancedReporting: true;
    sso: true;
  };
}
```

### ENTERPRISE Tenant Limits

```typescript
interface EnterpriseTenantLimits {
  // User Limits
  maxUsers: -1; // Unlimited
  maxActiveUsers: -1;
  
  // Organization Limits
  maxOrganizations: -1; // Unlimited
  
  // Department Limits
  maxDepartments: -1; // Unlimited
  maxDepartmentLevels: 7;
  
  // Storage Limits
  maxStorageGB: 500; // Base, can increase
  maxFileSizeMB: 500;
  
  // API Limits
  maxApiCallsPerDay: -1; // Unlimited
  maxApiCallsPerMinute: 1000;
  
  // Document Limits
  maxDocuments: -1; // Unlimited
  maxDocumentSizeMB: 500;
  
  // Integration Limits
  maxIntegrations: -1; // Unlimited
  maxWebhooks: -1; // Unlimited
  
  // Feature Flags
  features: {
    apiAccess: true;
    customIntegrations: true;
    advancedReporting: true;
    sso: true;
    customBranding: true;
    dedicatedSupport: true;
  };
}
```

### CUSTOM Tenant Limits

```typescript
interface CustomTenantLimits {
  // All limits are negotiable
  maxUsers: number;
  maxOrganizations: number;
  maxDepartments: number;
  maxDepartmentLevels: number;
  maxStorageGB: number;
  maxApiCallsPerDay: number;
  maxIntegrations: number;
  // ... all limits customized
}
```

---

## Enforcement

### Check Limits

```typescript
async function checkResourceLimits(
  tenant: Tenant,
  resource: ResourceType,
  requestedAmount: number
): Promise<ValidationResult> {
  const limits = getTenantLimits(tenant.type);
  const current = await getCurrentUsage(tenant.id, resource);
  
  const limit = limits[`max${resource}`];
  if (limit === -1) {
    return { valid: true }; // Unlimited
  }
  
  if (current + requestedAmount > limit) {
    return {
      valid: false,
      error: `Exceeded ${resource} limit: ${current + requestedAmount}/${limit}`,
      currentUsage: current,
      limit
    };
  }
  
  return { valid: true };
}
```

### Override Limits

```typescript
async function overrideResourceLimit(
  tenantId: TenantId,
  resource: ResourceType,
  newLimit: number,
  reason: string
): Promise<void> {
  // Only for ENTERPRISE and CUSTOM tenants
  const tenant = await tenantRepo.findById(tenantId);
  if (tenant.type !== TenantTypeEnum.ENTERPRISE && 
      tenant.type !== TenantTypeEnum.CUSTOM) {
    throw new Error('Limit override only for ENTERPRISE and CUSTOM');
  }
  
  // Create override
  const override = ResourceLimitOverride.create(
    tenantId,
    resource,
    newLimit,
    reason
  );
  
  await overrideRepo.save(override);
}
```

---

## Monitoring

### Usage Tracking

```typescript
interface ResourceUsage {
  tenantId: TenantId;
  resource: ResourceType;
  current: number;
  limit: number;
  percentage: number;
  lastUpdated: Date;
}

async function getResourceUsage(
  tenantId: TenantId
): Promise<ResourceUsage[]> {
  const tenant = await tenantRepo.findById(tenantId);
  const limits = getTenantLimits(tenant.type);
  
  const usages: ResourceUsage[] = [];
  for (const resource of Object.keys(limits)) {
    const current = await getCurrentUsage(tenantId, resource);
    const limit = limits[resource];
    
    usages.push({
      tenantId,
      resource,
      current,
      limit,
      percentage: limit === -1 ? 0 : (current / limit) * 100,
      lastUpdated: new Date()
    });
  }
  
  return usages;
}
```

### Alerts

```typescript
async function checkResourceAlerts(tenantId: TenantId): Promise<void> {
  const usages = await getResourceUsage(tenantId);
  
  for (const usage of usages) {
    if (usage.percentage >= 90) {
      await sendAlert({
        tenantId,
        type: 'resource_approaching_limit',
        resource: usage.resource,
        usage: usage.percentage,
        current: usage.current,
        limit: usage.limit
      });
    }
    
    if (usage.percentage >= 100) {
      await sendAlert({
        tenantId,
        type: 'resource_limit_exceeded',
        resource: usage.resource,
        usage: usage.percentage,
        current: usage.current,
        limit: usage.limit,
        severity: 'critical'
      });
    }
  }
}
```

---

## Related Documentation

- [Tenant Types](../tenants/tenant-types.md)
- [Validation Rules](./validation-rules.md)
- [Business Constraints](./constraints.md)
