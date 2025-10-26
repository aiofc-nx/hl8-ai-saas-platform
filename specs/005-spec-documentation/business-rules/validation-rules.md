# Validation Rules

> **Purpose**: Document validation rules for tenant codes, domains, names, and other fields  
> **Scope**: Input validation, business rule validation, constraint checking

---

## Overview

Validation rules ensure data integrity, prevent errors, and enforce business constraints. Validation occurs at multiple levels: input validation, domain validation, and database constraints.

---

## Tenant Code Validation

### Rules

```typescript
interface TenantCodeValidation {
  minLength: 3;
  maxLength: 20;
  pattern: /^[a-z0-9][a-z0-9_-]*[a-z0-9]$/; // Alphanumeric with dashes/underscores
  forbidden: ['admin', 'root', 'system', 'platform'];
  mustBeUnique: true;
  caseSensitive: false;
}
```

### Implementation

```typescript
async function validateTenantCode(code: string): Promise<ValidationResult> {
  // 1. Length check
  if (code.length < 3 || code.length > 20) {
    return { valid: false, error: "Code must be 3-20 characters" };
  }

  // 2. Pattern check
  if (!/^[a-z0-9][a-z0-9_-]*[a-z0-9]$/.test(code)) {
    return {
      valid: false,
      error:
        "Code must be alphanumeric with dashes/underscores, starting and ending with alphanumeric",
    };
  }

  // 3. Forbidden words check
  const forbidden = ["admin", "root", "system", "platform"];
  if (forbidden.includes(code.toLowerCase())) {
    return { valid: false, error: "Code is reserved and cannot be used" };
  }

  // 4. Uniqueness check
  const exists = await tenantRepo.existsByCode(code);
  if (exists) {
    return { valid: false, error: "Code already exists" };
  }

  return { valid: true };
}
```

---

## Tenant Name Validation

### Rules

```typescript
interface TenantNameValidation {
  minLength: 2;
  maxLength: 100;
  pattern: /^[\w\s\.&()-]+$/; // Alphanumeric, spaces, and common punctuation
  mustBeApproved: boolean; // For certain names
  restrictedWords: string[]; // Branded terms, trademarks
}
```

### Implementation

```typescript
async function validateTenantName(name: string): Promise<ValidationResult> {
  // 1. Length check
  if (name.length < 2 || name.length > 100) {
    return { valid: false, error: "Name must be 2-100 characters" };
  }

  // 2. Pattern check
  if (!/^[\w\s\.&()-]+$/.test(name)) {
    return {
      valid: false,
      error: "Name contains invalid characters",
    };
  }

  // 3. Restricted words check
  const restricted = await getRestrictedWords();
  for (const word of restricted) {
    if (name.toLowerCase().includes(word.toLowerCase())) {
      return {
        valid: false,
        error: `Name contains restricted word: ${word}`,
        requiresApproval: true,
      };
    }
  }

  // 4. Approval check (if needed)
  if (requiresApproval(name)) {
    return {
      valid: true,
      warning: "Name requires manual approval",
      requiresApproval: true,
    };
  }

  return { valid: true };
}
```

---

## Organization Code Validation

### Rules

```typescript
interface OrganizationCodeValidation {
  minLength: 2;
  maxLength: 50;
  pattern: /^[A-Z0-9][A-Z0-9_-]*[A-Z0-9]$/; // Uppercase alphanumeric
  mustBeUniqueWithinTenant: true;
  caseSensitive: false;
}
```

---

## Department Code Validation

### Rules

```typescript
interface DepartmentCodeValidation {
  minLength: 2;
  maxLength: 50;
  pattern: /^[A-Z0-9][A-Z0-9_-]*[A-Z0-9]$/; // Uppercase alphanumeric
  mustBeUniqueWithinOrganization: true;
  caseSensitive: false;
}
```

---

## Email Validation

### Rules

```typescript
interface EmailValidation {
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Standard email regex
  maxLength: 255;
  mustBeUnique: true;
  mustBeVerified: boolean; // Email verification required
}
```

---

## Password Validation

### Rules

```typescript
interface PasswordValidation {
  minLength: 8;
  maxLength: 128;
  requiredChars: {
    uppercase: 1;
    lowercase: 1;
    numbers: 1;
    special: 1;
  };
  forbiddenPatterns: [
    '123456',
    'password',
    /(.)\1{3,}/ // No repeated characters
  ];
}
```

### Implementation

```typescript
function validatePassword(password: string): ValidationResult {
  // Length
  if (password.length < 8 || password.length > 128) {
    return { valid: false, error: "Password must be 8-128 characters" };
  }

  // Required characters
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Password must contain uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Password must contain lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Password must contain number" };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, error: "Password must contain special character" };
  }

  // Forbidden patterns
  const forbidden = ["123456", "password", "qwerty"];
  if (forbidden.some((p) => password.toLowerCase().includes(p))) {
    return { valid: false, error: "Password is too common" };
  }

  return { valid: true };
}
```

---

## Resource Validation

### User Limit Validation

```typescript
async function validateUserCreation(
  tenantId: TenantId,
): Promise<ValidationResult> {
  const tenant = await tenantRepo.findById(tenantId);
  const limits = getTenantLimits(tenant.type);
  const currentUsers = await userRepo.countByTenant(tenantId);

  if (currentUsers >= limits.maxUsers && limits.maxUsers !== -1) {
    return {
      valid: false,
      error: `User limit reached: ${currentUsers}/${limits.maxUsers}`,
      currentUsage: currentUsers,
      limit: limits.maxUsers,
    };
  }

  return { valid: true };
}
```

### Storage Validation

```typescript
async function validateStorageQuota(
  tenantId: TenantId,
  fileSizeMB: number,
): Promise<ValidationResult> {
  const tenant = await tenantRepo.findById(tenantId);
  const limits = getTenantLimits(tenant.type);

  // Check file size
  if (fileSizeMB > limits.maxFileSizeMB) {
    return {
      valid: false,
      error: `File too large: ${fileSizeMB}MB (max: ${limits.maxFileSizeMB}MB)`,
    };
  }

  // Check total storage
  const currentStorage = await storageService.getUsedStorage(tenantId);
  if (
    currentStorage + fileSizeMB > limits.maxStorageGB * 1024 &&
    limits.maxStorageGB !== -1
  ) {
    return {
      valid: false,
      error: `Storage quota exceeded: ${currentStorage}MB/${limits.maxStorageGB * 1024}MB`,
    };
  }

  return { valid: true };
}
```

---

## Related Documentation

- [Resource Limits](./resource-limits.md)
- [Business Constraints](./constraints.md)
- [Tenant Types](../tenants/tenant-types.md)
