# User Assignment Rules

> **Purpose**: Document user assignment rules to organizations and departments  
> **Scope**: Multi-organization, single department per organization

---

## Overview

Users can be assigned to multiple organizations within a tenant, but can only belong to one department per organization. This provides flexibility for cross-organizational collaboration while maintaining clear reporting structures.

---

## Assignment Rules

### Core Rules

1. **Multiple Organizations**: Users can belong to multiple organizations
2. **Single Department**: Users can only belong to one department per organization
3. **Organization Membership**: Required for organization-level access
4. **Department Assignment**: Optional but recommended for proper hierarchy

### Assignment Matrix

```typescript
interface UserAssignmentRules {
  multipleOrganizations: true; // User can be in multiple orgs
  singleDepartmentPerOrganization: true; // Only one dept per org
  requireOrganizationMembership: true; // Must be in org
  requireDepartmentAssignment: false; // Optional department
}
```

---

## Assignment Scenarios

### Scenario 1: User in Single Organization

```
User: John Doe
├─ Organization: Engineering
│   └─ Department: Backend Team
```

```typescript
const assignment = {
  userId: 'user-123',
  tenantId: 'tenant-abc',
  organizations: [
    {
      organizationId: 'org-engineering',
      departmentId: 'dept-backend'
    }
  ]
};
```

### Scenario 2: User in Multiple Organizations

```
User: Jane Smith
├─ Organization: Engineering
│   └─ Department: Frontend Team
└─ Organization: Product
    └─ Department: Mobile Team
```

```typescript
const assignment = {
  userId: 'user-456',
  tenantId: 'tenant-abc',
  organizations: [
    {
      organizationId: 'org-engineering',
      departmentId: 'dept-frontend'
    },
    {
      organizationId: 'org-product',
      departmentId: 'dept-mobile'
    }
  ]
};
```

### Scenario 3: User Without Department

```
User: Bob Johnson
├─ Organization: Engineering
│   └─ Department: null (unassigned)
```

```typescript
const assignment = {
  userId: 'user-789',
  tenantId: 'tenant-abc',
  organizations: [
    {
      organizationId: 'org-engineering',
      departmentId: null // Can exist without department
    }
  ]
};
```

---

## Assignment Operations

### Add User to Organization

```typescript
async function addUserToOrganization(
  userId: UserId,
  organizationId: OrganizationId,
  departmentId?: DepartmentId,
  context: IsolationContext
) {
  // 1. Validate organization exists
  const organization = await organizationRepo.findById(organizationId, context);
  
  // 2. Validate department if provided
  if (departmentId) {
    const department = await departmentRepo.findById(departmentId, context);
    if (!department.organizationId.equals(organizationId)) {
      throw new Error('Department not in organization');
    }
  }
  
  // 3. Check for existing assignment
  const existing = await userOrgRepo.findByUserAndOrganization(
    userId,
    organizationId,
    context
  );
  
  if (existing) {
    throw new Error('User already in organization');
  }
  
  // 4. Create assignment
  const assignment = UserOrganizationAssignment.create(
    userId,
    organizationId,
    departmentId
  );
  
  await userOrgRepo.save(assignment, context);
}
```

### Update Department Assignment

```typescript
async function updateDepartmentAssignment(
  userId: UserId,
  organizationId: OrganizationId,
  newDepartmentId: DepartmentId,
  context: IsolationContext
) {
  // 1. Get existing assignment
  const assignment = await userOrgRepo.findByUserAndOrganization(
    userId,
    organizationId,
    context
  );
  
  if (!assignment) {
    throw new Error('User not in organization');
  }
  
  // 2. Validate new department
  const department = await departmentRepo.findById(newDepartmentId, context);
  if (!department.organizationId.equals(organizationId)) {
    throw new Error('Department not in organization');
  }
  
  // 3. Update assignment
  assignment.changeDepartment(newDepartmentId);
  await userOrgRepo.save(assignment, context);
}
```

### Remove User from Organization

```typescript
async function removeUserFromOrganization(
  userId: UserId,
  organizationId: OrganizationId,
  context: IsolationContext
) {
  // 1. Get assignment
  const assignment = await userOrgRepo.findByUserAndOrganization(
    userId,
    organizationId,
    context
  );
  
  if (!assignment) {
    throw new Error('User not in organization');
  }
  
  // 2. Check if user can be removed
  const userRoles = await roleRepo.findByUserAndOrganization(
    userId,
    organizationId,
    context
  );
  
  if (userRoles.some(role => role.isSystemRole)) {
    throw new Error('Cannot remove user with system role');
  }
  
  // 3. Delete assignment
  await userOrgRepo.delete(assignment, context);
}
```

---

## Validation Rules

### Organization Validation

```typescript
interface OrganizationAssignmentValidation {
  checkOrganizationExists: true;
  checkUserNotAlreadyAssigned: true;
  checkTenantMatch: true;
}

async function validateOrganizationAssignment(
  userId: UserId,
  organizationId: OrganizationId,
  context: IsolationContext
): Promise<ValidationResult> {
  // Check organization exists
  const organization = await organizationRepo.findById(organizationId, context);
  if (!organization) {
    return { valid: false, error: 'Organization not found' };
  }
  
  // Check tenant match
  const user = await userRepo.findById(userId, context);
  if (!user.tenantId.equals(organization.tenantId)) {
    return { valid: false, error: 'Different tenants' };
  }
  
  // Check not already assigned
  const existing = await userOrgRepo.findByUserAndOrganization(
    userId,
    organizationId,
    context
  );
  if (existing) {
    return { valid: false, error: 'Already assigned' };
  }
  
  return { valid: true };
}
```

### Department Validation

```typescript
async function validateDepartmentAssignment(
  userId: UserId,
  organizationId: OrganizationId,
  departmentId: DepartmentId,
  context: IsolationContext
): Promise<ValidationResult> {
  // Check department exists
  const department = await departmentRepo.findById(departmentId, context);
  if (!department) {
    return { valid: false, error: 'Department not found' };
  }
  
  // Check department in organization
  if (!department.organizationId.equals(organizationId)) {
    return { valid: false, error: 'Department not in organization' };
  }
  
  // Check user in organization
  const assignment = await userOrgRepo.findByUserAndOrganization(
    userId,
    organizationId,
    context
  );
  if (!assignment) {
    return { valid: false, error: 'User not in organization' };
  }
  
  return { valid: true };
}
```

---

## Query Operations

### Get User Organizations

```typescript
async function getUserOrganizations(
  userId: UserId,
  context: IsolationContext
): Promise<OrganizationWithDepartment[]> {
  const assignments = await userOrgRepo.findByUser(userId, context);
  
  return Promise.all(
    assignments.map(async (assignment) => {
      const org = await organizationRepo.findById(
        assignment.organizationId,
        context
      );
      
      const dept = assignment.departmentId
        ? await departmentRepo.findById(assignment.departmentId, context)
        : null;
      
      return {
        organization: org,
        department: dept,
        assignedAt: assignment.createdAt
      };
    })
  );
}
```

### Get Organization Users

```typescript
async function getOrganizationUsers(
  organizationId: OrganizationId,
  includeDepartments: boolean,
  context: IsolationContext
): Promise<UserWithDepartment[]> {
  const assignments = await userOrgRepo.findByOrganization(
    organizationId,
    context
  );
  
  return Promise.all(
    assignments.map(async (assignment) => {
      const user = await userRepo.findById(assignment.userId, context);
      
      const dept = includeDepartments && assignment.departmentId
        ? await departmentRepo.findById(assignment.departmentId, context)
        : null;
      
      return {
        user,
        department: dept,
        assignedAt: assignment.createdAt
      };
    })
  );
}
```

### Get Department Users

```typescript
async function getDepartmentUsers(
  departmentId: DepartmentId,
  context: IsolationContext
): Promise<User[]> {
  const assignments = await userOrgRepo.findByDepartment(departmentId, context);
  
  return Promise.all(
    assignments.map(assignment =>
      userRepo.findById(assignment.userId, context)
    )
  );
}
```

---

## Database Schema

### User Organization Assignment Table

```sql
CREATE TABLE user_organization_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  department_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  
  UNIQUE (user_id, organization_id)
);

-- Indexes
CREATE INDEX idx_user_org_user_id ON user_organization_assignments(user_id);
CREATE INDEX idx_user_org_org_id ON user_organization_assignments(organization_id);
CREATE INDEX idx_user_org_dept_id ON user_organization_assignments(department_id) 
  WHERE department_id IS NOT NULL;
```

---

## Related Documentation

- [Organization Types](./organization-types.md)
- [Department Hierarchy](./department-hierarchy.md)
- [Organization Hierarchy](./organization-hierarchy.md)
