# Tenant Types

> **Purpose**: Define all tenant types with their resources and limits  
> **Scope**: 5 tenant types (FREE, BASIC, PROFESSIONAL, ENTERPRISE, CUSTOM)

---

## Overview

The SAAS platform supports 5 tenant types, each with specific resource limits, feature sets, and upgrade paths. Tenant type determines available features, resource quotas, and billing models.

---

## Tenant Type Comparison

| Feature           | FREE      | BASIC   | PROFESSIONAL | ENTERPRISE | CUSTOM |
| ----------------- | --------- | ------- | ------------ | ---------- | ------ |
| **Price**         | Free      | $99/mo  | $299/mo      | $999/mo    | Custom |
| **Users**         | 10        | 50      | 200          | Unlimited  | Custom |
| **Organizations** | 2         | 10      | 50           | Unlimited  | Custom |
| **Storage**       | 1 GB      | 10 GB   | 100 GB       | 500 GB     | Custom |
| **API Calls**     | 1K/day    | 10K/day | 100K/day     | Unlimited  | Custom |
| **Support**       | Community | Email   | Email+Chat   | 24/7 Phone | Custom |
| **SLA**           | None      | 99%     | 99.5%        | 99.9%      | Custom |

---

## FREE Tenant Type

### Characteristics

- **Target Audience**: Individual users, small teams, testing
- **Cost**: Free forever
- **Best For**: Evaluation, small projects, proof of concept

### Resource Limits

```typescript
interface FreeTenantLimits {
  maxUsers: 10;
  maxOrganizations: 2;
  maxStorageGB: 1;
  maxApiCallsPerDay: 1000;
  maxDepartments: 5;
  maxDocuments: 100;
  trialPeriodDays: 0; // No trial (already free)
}
```

### Feature Set

- ✅ Basic tenant management
- ✅ Up to 2 organizations
- ✅ Up to 10 users
- ✅ Basic reporting
- ✅ Community support
- ❌ Advanced analytics
- ❌ Custom integrations
- ❌ API access
- ❌ Priority support

### Upgrade Path

- Upgrade to **BASIC** for more users and features
- No downgrade path (already free tier)

---

## BASIC Tenant Type

### Characteristics

- **Target Audience**: Small businesses, startups
- **Cost**: $99/month (billed annually or $119/month)
- **Best For**: Small teams, growing businesses

### Resource Limits

```typescript
interface BasicTenantLimits {
  maxUsers: 50;
  maxOrganizations: 10;
  maxStorageGB: 10;
  maxApiCallsPerDay: 10000;
  maxDepartments: 20;
  maxDocuments: 1000;
  trialPeriodDays: 14;
}
```

### Feature Set

- ✅ All FREE features
- ✅ Up to 50 users
- ✅ Up to 10 organizations
- ✅ Basic reporting and analytics
- ✅ Email support
- ✅ Standard SLA (99%)
- ✅ Basic API access
- ❌ Advanced integrations
- ❌ Custom branding
- ❌ Dedicated support

### Upgrade Path

- Upgrade to **PROFESSIONAL** for more capacity
- Downgrade to **FREE** (data migration required)

---

## PROFESSIONAL Tenant Type

### Characteristics

- **Target Audience**: Medium businesses, growing companies
- **Cost**: $299/month (billed annually or $349/month)
- **Best For**: Established businesses, multiple teams

### Resource Limits

```typescript
interface ProfessionalTenantLimits {
  maxUsers: 200;
  maxOrganizations: 50;
  maxStorageGB: 100;
  maxApiCallsPerDay: 100000;
  maxDepartments: 100;
  maxDocuments: 10000;
  trialPeriodDays: 30;
}
```

### Feature Set

- ✅ All BASIC features
- ✅ Up to 200 users
- ✅ Up to 50 organizations
- ✅ Advanced reporting and analytics
- ✅ Email + Chat support
- ✅ Improved SLA (99.5%)
- ✅ Full API access
- ✅ Basic custom integrations
- ✅ Department hierarchy (7 levels)
- ❌ Custom branding
- ❌ Dedicated account manager
- ❌ White-label options

### Upgrade Path

- Upgrade to **ENTERPRISE** for unlimited capacity
- Downgrade to **BASIC** (with feature restrictions)

---

## ENTERPRISE Tenant Type

### Characteristics

- **Target Audience**: Large enterprises, Fortune 500 companies
- **Cost**: $999/month (custom pricing for high volume)
- **Best For**: Enterprise deployments, high-scale operations

### Resource Limits

```typescript
interface EnterpriseTenantLimits {
  maxUsers: -1; // Unlimited
  maxOrganizations: -1; // Unlimited
  maxStorageGB: 500; // Base, can increase
  maxApiCallsPerDay: -1; // Unlimited
  maxDepartments: -1; // Unlimited
  maxDocuments: -1; // Unlimited
  trialPeriodDays: 60;
}
```

### Feature Set

- ✅ All PROFESSIONAL features
- ✅ Unlimited users
- ✅ Unlimited organizations
- ✅ Enterprise reporting and analytics
- ✅ 24/7 phone + chat support
- ✅ Premium SLA (99.9%)
- ✅ Unlimited API access
- ✅ Custom integrations
- ✅ Custom branding
- ✅ White-label options
- ✅ Dedicated account manager
- ✅ Custom training
- ✅ Compliance features (SOC2, GDPR, HIPAA)

### Upgrade Path

- Upgrade to **CUSTOM** for specific requirements
- Can downgrade to **PROFESSIONAL** (data migration needed)

---

## CUSTOM Tenant Type

### Characteristics

- **Target Audience**: Special requirements, regulated industries
- **Cost**: Custom pricing (negotiated)
- **Best For**: Unique requirements, compliance needs, white-label

### Resource Limits

```typescript
interface CustomTenantLimits {
  maxUsers: number; // Custom negotiated
  maxOrganizations: number; // Custom negotiated
  maxStorageGB: number; // Custom negotiated
  maxApiCallsPerDay: number; // Custom negotiated
  maxDepartments: number; // Custom negotiated
  maxDocuments: number; // Custom negotiated
  trialPeriodDays: number; // Custom negotiated
}
```

### Feature Set

- ✅ All ENTERPRISE features
- ✅ Fully customizable resource limits
- ✅ Custom feature development
- ✅ Dedicated infrastructure (optional)
- ✅ On-premise deployment (optional)
- ✅ Custom SLA agreements
- ✅ Custom integrations and APIs
- ✅ White-label with custom domain
- ✅ Dedicated engineering support
- ✅ Custom security and compliance

### Upgrade Path

- Fully customizable (no standard path)
- Can modify resource limits as needed

---

## Upgrade and Downgrade Rules

### Upgrade Rules

```typescript
interface UpgradeRule {
  fromType: TenantType;
  toType: TenantType;
  allowed: boolean;
  requirements: {
    dataMigration?: boolean;
    downtime?: boolean;
    additionalCost?: number;
  };
  upgradeImmediately: boolean; // Or at end of billing cycle
}
```

### Common Upgrade Scenarios

1. **FREE → BASIC**: Immediate, requires billing setup
2. **BASIC → PROFESSIONAL**: Immediate or end of cycle
3. **PROFESSIONAL → ENTERPRISE**: Immediate or end of cycle
4. **Any → CUSTOM**: Requires contract negotiation

### Downgrade Rules

- Downgrades take effect at end of billing cycle
- Data exceeding new limits must be archived
- Features not available in lower tier are disabled
- User migration required if user limit exceeded

---

## Billing and Pricing

### Subscription Models

- **Monthly**: Pay monthly (higher cost per month)
- **Annual**: Pay annually (discounted rate)
- **Custom**: Negotiated contracts for ENTERPRISE/CUSTOM

### Overage Handling

```typescript
interface OveragePolicy {
  resource: "users" | "storage" | "api_calls";
  action: "block" | "charge" | "warn";
  chargeRate?: number; // Per unit cost
  billingCycle: "monthly" | "annual";
}
```

### Payment Methods

- Credit card (Visa, MasterCard, Amex)
- Bank transfer (for ENTERPRISE/CUSTOM)
- Purchase orders (for ENTERPRISE/CUSTOM)

---

## Related Documentation

- [Tenant Creation Workflow](./tenant-creation.md)
- [Tenant Status Management](./tenant-status.md)
- [Tenant Upgrade Paths](./tenant-upgrades.md)
