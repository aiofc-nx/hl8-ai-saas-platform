# Edge Cases and Scenarios

> **Purpose**: Document edge cases and scenarios for business rules  
> **Scope**: Edge cases, error scenarios, boundary conditions, exceptional cases

---

## Overview

Edge cases represent unusual or exceptional scenarios that must be handled correctly to ensure system stability and data integrity. This document provides comprehensive examples and scenarios covering various edge cases.

---

## Tenant Edge Cases

### Edge Case 1: Duplicate Tenant Code

**Scenario**: Two users try to create tenants with the same code simultaneously.

```typescript
// Request 1
POST /api/tenants
{ "code": "acme-corp", "name": "Acme Corp" }

// Request 2 (simultaneous)
POST /api/tenants
{ "code": "acme-corp", "name": "Acme Corporation" }

// Expected Behavior
Request 1: Success (tenant created with code "acme-corp")
Request 2: Failure with error "Tenant code already exists"
```

**Implementation**:

```typescript
async function createTenant(data: CreateTenantDto): Promise<Tenant> {
  // Check if code exists
  const exists = await tenantRepo.existsByCode(data.code);
  if (exists) {
    throw new ConflictException("Tenant code already exists");
  }

  // Create tenant (database constraint ensures uniqueness)
  return tenantRepo.create(data);
}
```

### Edge Case 2: Tenant Code Generation Conflict

**Scenario**: System-generated tenant code collides with existing code.

```typescript
async function generateTenantCode(): Promise<string> {
  const base = "tenant-";
  let attempts = 0;
  let code = "";

  do {
    code = `${base}${generateRandomString(8)}`;
    const exists = await tenantRepo.existsByCode(code);

    if (!exists) {
      return code;
    }

    attempts++;
  } while (attempts < 100);

  throw new Error("Failed to generate unique tenant code");
}
```

### Edge Case 3: Tenant Suspension During Active Operations

**Scenario**: Tenant is suspended while users are performing operations.

```typescript
async function suspendTenant(tenantId: TenantId): Promise<void> {
  // 1. Mark tenant as suspended
  const tenant = await tenantRepo.findById(tenantId);
  tenant.suspend();
  await tenantRepo.save(tenant);

  // 2. Notify active users
  const activeUsers = await sessionService.getActiveUsers(tenantId);
  for (const user of activeUsers) {
    await notifyUser(user, {
      type: "tenant_suspended",
      message: "Your tenant has been suspended",
      redirectTo: "/suspended",
    });
  }

  // 3. Queue background jobs for cleanup
  await queueBackgroundJob({
    type: "suspend_tenant_cleanup",
    tenantId: tenantId.value,
  });
}
```

### Edge Case 4: Tenant Upgrade with Over-Limit Resources

**Scenario**: Tenant tries to upgrade but has resources exceeding new plan limits.

```typescript
async function upgradeTenant(
  tenantId: TenantId,
  newType: TenantType,
): Promise<UpgradeResult> {
  const tenant = await tenantRepo.findById(tenantId);
  const newLimits = getTenantLimits(newType);

  // Check resource usage
  const usage = await getResourceUsage(tenantId);
  const violations = checkLimitsViolations(usage, newLimits);

  if (violations.length > 0) {
    return {
      canUpgrade: false,
      violations,
      actionRequired: true,
      suggestedActions: generateActionPlan(violations),
    };
  }

  // Proceed with upgrade
  return {
    canUpgrade: true,
    actions: await executeUpgrade(tenantId, newType),
  };
}
```

---

## Organization Edge Cases

### Edge Case 5: Circular Organization Hierarchy

**Scenario**: Attempting to create a circular reference in organization hierarchy.

```typescript
async function setOrganizationParent(
  organizationId: OrganizationId,
  parentId: OrganizationId,
): Promise<void> {
  // Prevent self-parent
  if (organizationId.equals(parentId)) {
    throw new Error("Organization cannot be its own parent");
  }

  // Check for circular reference
  const parentChain = await getParentChain(parentId);
  if (parentChain.includes(organizationId.value)) {
    throw new Error("Circular reference detected");
  }

  // Set parent
  const org = await orgRepo.findById(organizationId);
  org.setParent(parentId);
  await orgRepo.save(org);
}
```

### Edge Case 6: Organization Merge with Conflicting Data

**Scenario**: Merging organizations with conflicting data.

```typescript
async function mergeOrganizations(
  sourceId: OrganizationId,
  targetId: OrganizationId,
): Promise<MergeResult> {
  const source = await orgRepo.findById(sourceId);
  const target = await orgRepo.findById(targetId);

  // Check for conflicts
  const conflicts = await detectConflicts(source, target);
  if (conflicts.length > 0) {
    return {
      canMerge: false,
      conflicts,
      resolutionRequired: true,
    };
  }

  // Execute merge
  await executeMerge(source, target);
  return { canMerge: true, merged: true };
}
```

---

## Department Edge Cases

### Edge Case 7: Max Department Depth Reached

**Scenario**: Creating a department at the maximum hierarchy depth.

```typescript
async function createDepartment(
  data: CreateDepartmentDto,
  context: IsolationContext,
): Promise<Department> {
  // Calculate depth
  let depth = 0;
  let currentId = data.parentId;

  while (currentId) {
    const parent = await deptRepo.findById(currentId, context);
    depth++;
    currentId = parent.parentId;

    if (depth >= MAX_DEPARTMENT_DEPTH) {
      throw new Error("Maximum department depth reached");
    }
  }

  // Create department
  return deptRepo.create(data, context);
}
```

### Edge Case 8: Department with Orphan Users

**Scenario**: Department deletion with users assigned.

```typescript
async function deleteDepartment(
  departmentId: DepartmentId,
  context: IsolationContext,
): Promise<void> {
  const department = await deptRepo.findById(departmentId, context);
  const userCount = await userRepo.countByDepartment(departmentId, context);

  if (userCount > 0) {
    // Option 1: Require user reassignment first
    throw new Error(
      `Cannot delete department with ${userCount} users. Reassign users first.`,
    );

    // Option 2: Auto-reassign to parent or root
    // await reassignUsers(departmentId, department.parentId);
  }

  await deptRepo.delete(departmentId, context);
}
```

---

## User Edge Cases

### Edge Case 9: User in Multiple Organizations

**Scenario**: User belongs to multiple organizations with different roles.

```typescript
interface UserOrganizationContext {
  userId: UserId;
  organizations: Array<{
    organizationId: OrganizationId;
    role: RoleType;
    departmentId?: DepartmentId;
  }>;

  getEffectiveRole(organizationId: OrganizationId): RoleType {
    const assignment = this.organizations.find(
      o => o.organizationId.equals(organizationId)
    );
    return assignment?.role || RoleType.RegularUser;
  }
}

async function getUserContext(userId: UserId): Promise<UserOrganizationContext> {
  const assignments = await userOrgRepo.findByUser(userId);
  return new UserOrganizationContext(userId, assignments);
}
```

### Edge Case 10: Concurrent User Assignment

**Scenario**: Assigning the same user to multiple organizations simultaneously.

```typescript
async function assignUserToOrganization(
  userId: UserId,
  organizationId: OrganizationId,
  role: RoleType,
): Promise<void> {
  // Check if already assigned
  const exists = await userOrgRepo.exists(userId, organizationId);
  if (exists) {
    throw new ConflictException("User already assigned to organization");
  }

  // Create assignment (database constraint ensures uniqueness)
  await userOrgRepo.create({
    userId,
    organizationId,
    role,
  });
}
```

---

## Resource Limit Edge Cases

### Edge Case 11: Burst API Calls

**Scenario**: Sudden burst of API calls approaching rate limits.

```typescript
async function checkRateLimit(
  tenantId: TenantId,
  endpoint: string,
): Promise<void> {
  const limits = getTenantLimits(await getTenantType(tenantId));
  const key = `rate-limit:${tenantId.value}:${endpoint}`;

  // Get current count
  const count = (await cache.get(key)) || 0;

  if (count >= limits.maxApiCallsPerMinute) {
    throw new RateLimitExceededException("API rate limit exceeded");
  }

  // Increment and set TTL
  await cache.set(key, count + 1, 60); // 60 second TTL
}
```

### Edge Case 12: Storage Quota Exceeded During Upload

**Scenario**: Storage quota is exceeded while large file is being uploaded.

```typescript
async function uploadFile(
  tenantId: TenantId,
  file: File,
  context: IsolationContext,
): Promise<FileMetadata> {
  // Pre-check: Verify quota before starting upload
  const tenant = await tenantRepo.findById(tenantId);
  const limits = getTenantLimits(tenant.type);

  const currentStorage = await storageService.getUsedStorage(tenantId);
  if (currentStorage + file.size > limits.maxStorageGB * 1024) {
    throw new QuotaExceededException("Storage quota exceeded");
  }

  // Upload file (check again after upload for safety)
  const metadata = await storageService.upload(file, context);

  const finalStorage = await storageService.getUsedStorage(tenantId);
  if (finalStorage > limits.maxStorageGB * 1024) {
    // Rollback upload
    await storageService.delete(metadata.id);
    throw new QuotaExceededException("Storage quota exceeded during upload");
  }

  return metadata;
}
```

---

## Status Transition Edge Cases

### Edge Case 13: Invalid Status Transitions

**Scenario**: Attempting invalid status transitions.

```typescript
const ALLOWED_TRANSITIONS = {
  [TenantStatus.PENDING]: [TenantStatus.ACTIVE, TenantStatus.DELETED],
  [TenantStatus.ACTIVE]: [TenantStatus.SUSPENDED, TenantStatus.EXPIRED],
  [TenantStatus.SUSPENDED]: [TenantStatus.ACTIVE, TenantStatus.DELETED],
  [TenantStatus.EXPIRED]: [TenantStatus.ACTIVE, TenantStatus.DELETED],
  [TenantStatus.DELETED]: [], // Terminal state
};

async function transitionStatus(
  tenant: Tenant,
  newStatus: TenantStatus,
): Promise<void> {
  const allowed = ALLOWED_TRANSITIONS[tenant.status];

  if (!allowed.includes(newStatus)) {
    throw new Error(
      `Invalid status transition from ${tenant.status} to ${newStatus}`,
    );
  }

  tenant.transitionToStatus(newStatus);
  await tenantRepo.save(tenant);
}
```

### Edge Case 14: Concurrent Status Updates

**Scenario**: Multiple concurrent status update attempts.

```typescript
async function updateTenantStatus(
  tenantId: TenantId,
  newStatus: TenantStatus,
  updatedBy: UserId,
): Promise<void> {
  // Use optimistic locking
  const tenant = await tenantRepo.findById(tenantId);
  const originalVersion = tenant.version;

  try {
    // Attempt update with version check
    const updated = await tenantRepo.updateWithVersion(
      tenantId,
      { status: newStatus },
      originalVersion,
    );

    return updated;
  } catch (error) {
    if (error.code === "VERSION_CONFLICT") {
      throw new ConflictException(
        "Tenant status was modified by another operation",
      );
    }
    throw error;
  }
}
```

---

## Related Documentation

- [Validation Rules](./validation-rules.md)
- [Business Constraints](./constraints.md)
- [Resource Limits](./resource-limits.md)
