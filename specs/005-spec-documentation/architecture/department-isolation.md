# Department Level Isolation

> **Level**: Department  
> **Scope**: Department-specific data within an organization  
> **Isolation Strategy**: Department_id filtering with hierarchical structure

---

## Overview

Department level isolation provides the most granular data segregation within organizations. Departments are organized in a hierarchical structure (up to 7 levels) and can have their own data, with parent-child relationships.

---

## Data Scope

### Department-Specific Data

- **Department Configuration**: Department settings, hierarchy level, parent department
- **Department Resources**: Users assigned to the department
- **Department Data**: Department-specific business data
- **Department Activity**: Department-level audit logs

### Hierarchical Structure

- Departments can be nested up to 7 levels
- Parent-child relationships via `parent_id`
- Hierarchical queries for department tree
- Path tracking for efficient querying

---

## Hierarchical Structure

### 7-Level Hierarchy

```
Level 1: Root Department (e.g., "Engineering")
├── Level 2: Sub-department (e.g., "Backend")
│   ├── Level 3: Team (e.g., "API Team")
│   │   ├── Level 4: Squad (e.g., "Authentication Squad")
│   │   │   ├── Level 5: Unit (e.g., "OAuth Unit")
│   │   │   │   ├── Level 6: Sub-unit (e.g., "Token Management")
│   │   │   │   │   └── Level 7: Group (e.g., "JWT Group")
```

### Database Representation

```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  parent_id UUID,  -- Self-referencing for hierarchy
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  level INT NOT NULL CHECK (level BETWEEN 1 AND 7),
  path TEXT,  -- Full path: /Engineering/Backend/API
  -- ...
);
```

---

## Access Patterns

### Department Access

```typescript
// Access single department
const context = IsolationContext.createDepartmentLevel(
  platformId,
  tenantId,
  organizationId,
  departmentId
);

const dept = await departmentService.findById(departmentId, context);
```

### Hierarchical Queries

```typescript
// Get department tree
const tree = await departmentService.getTree(
  organizationId,
  tenantId
);

// Returns: Hierarchical structure
// {
//   Engineering: {
//     Backend: {
//       API: { ... },
//       Database: { ... }
//     },
//     Frontend: { ... }
//   }
// }
```

### Sub-department Access

```typescript
// Get all sub-departments
const subs = await departmentService.findChildren(
  departmentId,
  tenantId,
  organizationId
);

// Get full path
const path = await departmentService.getPath(departmentId);
// Returns: ["Engineering", "Backend", "API"]
```

---

## Isolation Mechanisms

### Department Filtering

```sql
-- Department-specific query
SELECT * FROM department_data
WHERE tenant_id = 'tenant_123'
  AND organization_id = 'org_456'
  AND department_id = 'dept_789';

-- Include sub-departments
SELECT * FROM department_data
WHERE tenant_id = 'tenant_123'
  AND organization_id = 'org_456'
  AND (
    department_id = 'dept_789'
    OR path LIKE '/Engineering/Backend/API/%'
  );
```

### Path-Based Queries

```sql
-- Use path for efficient hierarchical queries
SELECT * FROM departments
WHERE tenant_id = 'tenant_123'
  AND path LIKE '/Engineering/%';  -- All Engineering sub-depts
```

---

## User Assignment

### Single Department Rule

- Users can be assigned to multiple organizations
- Users can only belong to **one department per organization**
- Department assignment is mandatory within organizations

```typescript
// User assignment to department
await userService.assignToDepartment(
  userId,
  organizationId,
  departmentId  // Single department per organization
);
```

---

## Department Management

### Creating Departments

```typescript
// Create root department (level 1)
const rootDept = await departmentService.create({
  name: "Engineering",
  code: "ENG",
  organizationId,
  tenantId,
  level: 1,
  parentId: null
});

// Create sub-department (level 2)
const subDept = await departmentService.create({
  name: "Backend",
  code: "BE",
  organizationId,
  tenantId,
  level: 2,
  parentId: rootDept.id
});
```

### Moving Departments

```typescript
// Move department to new parent
await departmentService.move(
  departmentId,
  newParentId,
  context
);

// Auto-updates: path, level, all descendants
```

---

## Related Documentation

- [Organization Level Isolation](./organization-isolation.md)
- [Department Hierarchy](../organizations/department-hierarchy.md)
- [Department Limits](../organizations/department-limits.md)
