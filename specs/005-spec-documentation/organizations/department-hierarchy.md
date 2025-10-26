# Department Hierarchy

> **Purpose**: Document the 7-level department hierarchy structure and rules  
> **Scope**: Department nesting, parent-child relationships, and user assignment

---

## Overview

Departments within organizations support a hierarchical structure up to 7 levels deep, allowing flexible organizational design for complex business structures. This hierarchy provides natural data isolation and access control.

---

## 7-Level Hierarchy Structure

### Hierarchy Levels

```
Level 1: Department         (Root department)
  └─ Level 2: Sub-Department
      └─ Level 3: Section
          └─ Level 4: Sub-Section
              └─ Level 5: Unit
                  └─ Level 6: Sub-Unit
                      └─ Level 7: Group (Deepest level)
```

### Example: Engineering Department Hierarchy

```
Engineering (Level 1)
├─ Backend Engineering (Level 2)
│   ├─ API Services (Level 3)
│   │   ├─ Authentication Team (Level 4)
│   │   │   ├─ OAuth Unit (Level 5)
│   │   │   │   ├─ Token Management (Level 6)
│   │   │   │   │   └─ JWT Group (Level 7)
│   │   │   │   └─ Session Management (Level 6)
│   │   │   └─ SSO Unit (Level 5)
│   │   └─ Integration Services (Level 4)
│   └─ Data Services (Level 3)
├─ Frontend Engineering (Level 2)
│   ├─ Web Platform (Level 3)
│   └─ Mobile Apps (Level 3)
└─ DevOps & Infrastructure (Level 2)
    ├─ Infrastructure (Level 3)
    └─ CI/CD (Level 3)
```

---

## Department Hierarchy Rules

### Hierarchy Constraints

```typescript
interface DepartmentHierarchyRules {
  maxDepth: 7; // Maximum 7 levels deep
  minDepth: 1; // At least root level
  parentConstraints: {
    mustBeDepartment: true; // Parent must be a department
    cannotBeSelf: true; // Cannot be own parent
    cannotCreateCycle: true; // Cannot create circular references
    mustBeInSameOrganization: true; // Parent must be in same organization
  };
  childConstraints: {
    canHaveChildren: true; // Can have child departments
    childMustBeDepartment: true; // Child must be a department
    maxChildrenPerLevel: -1; // No limit on children
  };
}
```

### Level Assignment Rules

```typescript
interface DepartmentLevelRules {
  level: number; // 1-7
  calculation: 'automatic' | 'manual';
  validation: {
    rootDepartmentLevel: 1; // Root departments are always level 1
    childLevel: (parentLevel: number) => parentLevel + 1;
    maxLevel: 7; // Cannot exceed level 7
  };
}
```

---

## Department Operations

### Creating Child Department

```typescript
async function createChildDepartment(
  parentDepartmentId: DepartmentId,
  departmentData: CreateDepartmentDto,
  context: IsolationContext,
) {
  // 1. Validate parent exists
  const parent = await departmentRepo.findById(parentDepartmentId, context);

  // 2. Check hierarchy depth
  if (parent.level >= 7) {
    throw new Error("Maximum hierarchy depth reached (7 levels)");
  }

  // 3. Create child department
  const child = DepartmentAggregate.create(
    departmentId.generate(),
    parent.tenantId,
    parent.organizationId,
    parentDepartmentId, // Set parent
    departmentData.name,
    departmentData.code,
    departmentData.description,
    departmentData.managerId,
  );

  // 4. Calculate level
  const childLevel = parent.level + 1;
  child.setLevel(childLevel);

  // 5. Build path
  const path = `${parent.path}/${child.code}`;
  child.setPath(path);

  // 6. Save
  await departmentRepo.save(child, context);

  return child;
}
```

### Moving Department in Hierarchy

```typescript
async function moveDepartment(
  departmentId: DepartmentId,
  newParentId: DepartmentId | null,
  context: IsolationContext,
) {
  // 1. Get department to move
  const department = await departmentRepo.findById(departmentId, context);

  // 2. Check for circular reference
  if (newParentId) {
    await validateNoCircularReference(departmentId, newParentId);
  }

  // 3. Calculate new level
  let newLevel = 1; // Root level
  if (newParentId) {
    const newParent = await departmentRepo.findById(newParentId, context);
    const parentLevel = newParent.level;
    newLevel = parentLevel + 1;

    // Check max depth
    if (newLevel > 7) {
      throw new Error("Moving would exceed maximum depth (7 levels)");
    }
  }

  // 4. Update department and all descendants
  await updateDepartmentAndDescendants(departmentId, newParentId, newLevel);

  // 5. Update paths
  await updateDepartmentPaths(departmentId);

  return department;
}
```

---

## User Assignment Rules

### Single Department Per Organization

**Key Rule**: Users can belong to only one department per organization, but can belong to multiple departments across different organizations.

```typescript
interface UserDepartmentAssignment {
  userId: UserId;
  assignments: {
    tenantId: TenantId;
    organizationId: OrganizationId;
    departmentId: DepartmentId; // Only one per organization
  }[];
}

// Example: User in multiple organizations
const userAssignments = {
  userId: "user-123",
  assignments: [
    {
      tenantId: "tenant-abc",
      organizationId: "org-engineering",
      departmentId: "dept-backend", // Engineering org
    },
    {
      tenantId: "tenant-abc",
      organizationId: "org-product",
      departmentId: "dept-mobile-apps", // Product org
    },
    // Cannot have two departments in same organization
  ],
};
```

### Assignment Validation

```typescript
async function assignUserToDepartment(
  userId: UserId,
  organizationId: OrganizationId,
  departmentId: DepartmentId,
  context: IsolationContext,
) {
  // 1. Check if user already has a department in this organization
  const existingAssignment = await userRepo.findDepartmentAssignment(
    userId,
    organizationId,
    context,
  );

  if (existingAssignment) {
    // Update existing assignment
    await updateDepartmentAssignment(userId, departmentId, context);
  } else {
    // Create new assignment
    await createDepartmentAssignment(userId, departmentId, context);
  }

  // 2. Validate department exists in organization
  const department = await departmentRepo.findById(departmentId, context);
  if (!department.organizationId.equals(organizationId)) {
    throw new Error("Department not in specified organization");
  }

  // 3. Create assignment
  const assignment = UserDepartmentAssignment.create(
    userId,
    organizationId,
    departmentId,
  );

  await assignmentRepo.save(assignment, context);
}
```

---

## Department Queries

### Get Department Tree

```typescript
interface DepartmentTreeNode {
  department: Department;
  children: DepartmentTreeNode[];
  userCount: number;
}

async function getDepartmentTree(
  organizationId: OrganizationId,
  context: IsolationContext,
): Promise<DepartmentTreeNode> {
  const rootDepartments = await departmentRepo.findRootDepartments(
    organizationId,
    context,
  );

  async function buildTree(dept: Department): Promise<DepartmentTreeNode> {
    const children = await departmentRepo.findByParentId(dept.id, context);
    const userCount = await userRepo.countByDepartment(dept.id, context);

    return {
      department: dept,
      children: await Promise.all(children.map((child) => buildTree(child))),
      userCount,
    };
  }

  // Return array of trees (multiple root departments)
  return Promise.all(rootDepartments.map((root) => buildTree(root)));
}
```

### Get Department Path

```typescript
async function getDepartmentPath(
  departmentId: DepartmentId,
): Promise<Department[]> {
  const path: Department[] = [];
  let currentId: DepartmentId | null = departmentId;

  // Traverse up the hierarchy
  while (currentId) {
    const dept = await departmentRepo.findById(currentId);
    path.unshift(dept); // Add to beginning

    currentId = dept.parentId;
  }

  return path;
}

// Example: Get path string
function getPathString(path: Department[]): string {
  return path.map((dept) => dept.name).join(" > ");
}
// Result: "Engineering > Backend Engineering > API Services > Authentication Team"
```

---

## Use Cases

### Example 1: Corporate Department Structure

```
Level 1: Corporate Departments
├─ Level 2: HR Department
│   ├─ Level 3: Recruitment Section
│   │   ├─ Level 4: Campus Recruitment
│   │   └─ Level 4: Professional Recruitment
│   └─ Level 3: Employee Relations Section
├─ Level 2: Finance Department
│   ├─ Level 3: Accounting Section
│   │   └─ Level 4: Accounts Payable
│   └─ Level 3: Treasury Section
└─ Level 2: IT Department
    ├─ Level 3: Infrastructure Section
    └─ Level 3: Application Support Section
```

### Example 2: Product Development Structure

```
Level 1: Product Development
├─ Level 2: Product Line A
│   ├─ Level 3: Design Team
│   ├─ Level 3: Engineering Team
│   │   ├─ Level 4: Frontend Squad
│   │   │   └─ Level 5: React Unit
│   │   └─ Level 4: Backend Squad
│   └─ Level 3: QA Team
├─ Level 2: Product Line B
└─ Level 2: Platform Services
    └─ Level 3: Shared Services
```

---

## Database Schema

### Department Table

```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  parent_id UUID REFERENCES departments(id),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  level INT NOT NULL CHECK (level BETWEEN 1 AND 7),
  path TEXT NOT NULL,
  manager_id UUID,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (manager_id) REFERENCES users(id),

  UNIQUE (tenant_id, organization_id, code)
);

-- Indexes
CREATE INDEX idx_departments_tenant_org ON departments(tenant_id, organization_id);
CREATE INDEX idx_departments_parent_id ON departments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_departments_level ON departments(level);
CREATE INDEX idx_departments_path ON departments USING GIN(path);
```

---

## Related Documentation

- [Organization Types](./organization-types.md)
- [Organization Hierarchy](./organization-hierarchy.md)
- [User Assignment Rules](./user-assignment.md)
