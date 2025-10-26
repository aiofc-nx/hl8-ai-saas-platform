# User Level Isolation

> **Level**: User  
> **Scope**: User-private data  
> **Isolation Strategy**: User_id filtering with permission-based access

---

## Overview

User level isolation provides the most granular data access control for user-private information. This level ensures that users can only access their own private data unless explicitly granted permissions to access shared or organization-level data.

---

## Data Scope

### User-Private Data

- **Personal Information**: User profile, preferences, settings
- **User Preferences**: UI settings, notification preferences
- **Personal Notes**: User-private notes and annotations
- **User Activity**: Personal activity logs and history

### Access Control

- Users can only access their own private data by default
- Access to organization/department data requires explicit permissions
- Permission hierarchy determines access levels
- Private data is invisible to other users

---

## Isolation Mechanisms

### User Filtering

```sql
-- User-private data
SELECT * FROM user_preferences
WHERE tenant_id = 'tenant_123'
  AND user_id = 'user_456';

-- User activity
SELECT * FROM user_activities
WHERE tenant_id = 'tenant_123'
  AND user_id = 'user_456'
ORDER BY created_at DESC;
```

### Permission-Based Access

```typescript
// Access user's own data
const userData = await userPreferenceService.get(userId, context);

// Check permission for department data
if (ability.can("read", "Department")) {
  const depts = await departmentService.findAll(context);
}
```

---

## Access Patterns

### User Self-Service

```typescript
// User accesses own profile
const context = IsolationContext.createUserLevel(
  platformId,
  tenantId,
  organizationId,
  departmentId,
  userId,
);

const profile = await userService.getProfile(userId, context);
const preferences = await userService.getPreferences(userId, context);
```

### Permission-Based Access

```typescript
// Check if user can access organization data
const canAccess = await permissionService.can(
  userId,
  organizationId,
  "read",
  "Organization",
);

if (canAccess) {
  const orgs = await organizationService.findAll(context);
}
```

---

## Privacy Rules

### Data Privacy

- User private data is not accessible by other users
- Even organization admins cannot access user private data
- Only platform admins can access for audit/legal purposes
- GDPR compliance for data access and deletion

### Data Sharing

```typescript
// User opts into data sharing
await userService.updatePrivacySettings({
  userId,
  shareProfile: true, // Share with organization
  shareActivity: false, // Keep activity private
  sharePreferences: true, // Share preferences
});
```

---

## Related Documentation

- [Department Level Isolation](./department-isolation.md)
- [Permission Hierarchy](../security/permission-hierarchy.md)
- [Privacy Settings](../security/privacy-settings.md)
