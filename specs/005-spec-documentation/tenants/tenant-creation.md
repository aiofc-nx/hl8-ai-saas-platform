# Tenant Creation Workflow

> **Purpose**: Document the complete tenant creation process  
> **Scope**: From registration to tenant activation

---

## Overview

The tenant creation workflow guides new users through the onboarding process, from initial registration to fully functional tenant. The process includes validation, automatic initialization, and configuration.

---

## Workflow Steps

### Step 1: Platform User Registration

**Actor**: New platform user  
**Goal**: Create platform account

```typescript
// Registration request
interface RegistrationRequest {
  email: string;
  password: string;
  displayName: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}
```

**Process**:
1. User provides email, password, and display name
2. System validates email format and password strength
3. System checks if email already exists
4. System sends verification email
5. User clicks verification link
6. System creates platform user account

**Events**:
- `PlatformUserCreatedEvent`
- `EmailVerificationSentEvent`
- `EmailVerifiedEvent`

---

### Step 2: Tenant Application

**Actor**: Verified platform user  
**Goal**: Request tenant creation

```typescript
// Tenant application
interface TenantApplication {
  tenantCode: string;  // Unique tenant code
  tenantName: string;  // Display name
  tenantType: TenantType;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  description?: string;
}
```

**Validation Rules**:
- Tenant code must be unique across platform
- Tenant code must be 3-20 characters
- Tenant code must be alphanumeric with dashes/underscores
- Tenant name must be 2-100 characters
- Contact email must be valid and verified

**Process**:
1. User submits tenant application
2. System validates tenant code uniqueness
3. System validates business rules
4. System creates pending tenant record
5. System triggers validation process

**Events**:
- `TenantApplicationSubmittedEvent`
- `TenantCodeValidationEvent`

---

### Step 3: System Validation

**Actor**: System (automated)  
**Goal**: Validate tenant application

**Validation Checks**:

```typescript
interface ValidationCheck {
  name: string;
  description: string;
  check: (application: TenantApplication) => Promise<ValidationResult>;
  severity: 'error' | 'warning' | 'info';
}

const validationChecks: ValidationCheck[] = [
  {
    name: 'UniqueTenantCode',
    description: 'Verify tenant code is unique',
    check: async (app) => {
      const exists = await tenantRepo.existsByCode(app.tenantCode);
      return { valid: !exists, error: exists ? 'Code already exists' : null };
    },
    severity: 'error'
  },
  {
    name: 'ValidTenantType',
    description: 'Verify tenant type is valid',
    check: async (app) => {
      const valid = Object.values(TenantTypeEnum).includes(app.tenantType);
      return { valid, error: valid ? null : 'Invalid tenant type' };
    },
    severity: 'error'
  },
  {
    name: 'NameApproval',
    description: 'Check tenant name against approval rules',
    check: async (app) => {
      const needsApproval = containsRestrictedWords(app.tenantName);
      if (needsApproval) {
        await nameReviewService.requestReview(app.tenantName);
        return { valid: true, warning: 'Name requires manual review' };
      }
      return { valid: true, error: null };
    },
    severity: 'warning'
  }
];
```

**Process**:
1. Run all validation checks in parallel
2. Collect validation results
3. If all critical checks pass, approve automatically
4. If critical checks fail, reject and notify user
5. If warnings exist, flag for review

**Events**:
- `TenantValidationStartedEvent`
- `TenantValidationCompletedEvent`
- `TenantValidationFailedEvent`
- `TenantNameReviewRequestedEvent`

---

### Step 4: Tenant Creation

**Actor**: System (automated)  
**Goal**: Create tenant record and resources

**Process**:

```typescript
async function createTenant(application: TenantApplication) {
  // 1. Create tenant entity
  const tenant = TenantAggregate.create(
    application.tenantCode,
    application.tenantName,
    application.tenantType,
    application.description
  );
  
  // 2. Save tenant
  await tenantRepo.save(tenant, platformContext);
  
  // 3. Initialize tenant resources
  await initializeTenantResources(tenant);
  
  // 4. Set tenant status to PENDING
  tenant.markAsPending();
  
  // 5. Save updated tenant
  await tenantRepo.save(tenant, platformContext);
  
  return tenant;
}

async function initializeTenantResources(tenant: TenantAggregate) {
  // Create default organization
  const defaultOrg = await createDefaultOrganization(tenant);
  
  // Create default roles
  const defaultRoles = await createDefaultRoles(tenant);
  
  // Create default admin user
  const adminUser = await createAdminUser(tenant);
  
  // Create default settings
  const defaultSettings = await createDefaultSettings(tenant);
  
  // Publish events
  await eventBus.publishAll([
    ...tenant.pullEvents(),
    new TenantResourcesInitializedEvent(tenant.id)
  ]);
}
```

**Events**:
- `TenantCreatedEvent`
- `TenantResourcesInitializedEvent`
- `DefaultOrganizationCreatedEvent`
- `DefaultRolesCreatedEvent`
- `AdminUserCreatedEvent`

---

### Step 5: Tenant Activation

**Actor**: System or Tenant Admin  
**Goal**: Activate tenant for use

**Activation Modes**:

#### Auto-Activation (FREE/BASIC)

```typescript
// Automatic activation for free/basic tenants
if (tenant.type === TenantTypeEnum.FREE || 
    tenant.type === TenantTypeEnum.BASIC) {
  await tenant.activate();
  await tenantRepo.save(tenant, context);
  await sendWelcomeEmail(tenant);
}
```

#### Manual Activation (PROFESSIONAL/ENTERPRISE)

```typescript
// Requires approval for professional/enterprise
if (tenant.type === TenantTypeEnum.PROFESSIONAL ||
    tenant.type === TenantTypeEnum.ENTERPRISE) {
  await sendActivationApprovalRequest(tenant);
  // Wait for manual approval
}
```

**Process**:
1. Check tenant type and activation rules
2. If auto-activate, activate immediately
3. If manual, send approval request
4. On approval, activate tenant
5. Send welcome email
6. Trigger onboarding workflow

**Events**:
- `TenantActivatedEvent`
- `WelcomeEmailSentEvent`
- `OnboardingWorkflowStartedEvent`

---

## Workflow Diagram

```
┌─────────────────────────────────────────────────────┐
│  1. Platform User Registration                      │
│     • Email verification                            │
│     • Account creation                              │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  2. Tenant Application                              │
│     • Submit tenant details                         │
│     • Validate input                                │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  3. System Validation                               │
│     • Code uniqueness check                         │
│     • Business rules validation                     │
│     • Name approval (if needed)                     │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
  ┌─────────┐             ┌──────────────┐
  │  Valid  │             │ Invalid      │
  └────┬────┘             └──────┬───────┘
       │                         │
       │                    ┌────▼────┐
       │                    │ Reject  │
       │                    └─────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│  4. Tenant Creation                                 │
│     • Create tenant record                          │
│     • Initialize resources                          │
│     • Create default org, roles, admin              │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  5. Tenant Activation                               │
│     • Auto-activate (FREE/BASIC)                    │
│     • Manual approval (PRO/ENT)                     │
│     • Send welcome email                            │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
              ✅ Tenant Active
```

---

## Error Handling

### Common Errors

1. **Duplicate Tenant Code**
   - Error: "Tenant code already exists"
   - Action: Suggest alternative codes
   - Recovery: User provides new code

2. **Invalid Tenant Name**
   - Error: "Name contains restricted words"
   - Action: Flag for manual review
   - Recovery: Admin approves or rejects

3. **System Error During Creation**
   - Error: "Failed to create tenant"
   - Action: Rollback all changes
   - Recovery: User retries or contacts support

---

## Related Documentation

- [Tenant Types](./tenant-types.md)
- [Tenant Status Management](./tenant-status.md)
- [Onboarding Process](../onboarding/workflow.md)
