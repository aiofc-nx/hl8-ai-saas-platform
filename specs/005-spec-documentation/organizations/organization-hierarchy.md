# Organization Hierarchy

> **Purpose**: Document organization hierarchy structure and rules  
> **Scope**: Multi-level hierarchy for DIVISION type, single-level for others

---

## Overview

Organizations support hierarchical structures for DIVISION type, allowing business units to be organized in a tree structure up to 7 levels deep. Other organization types are limited to single-level structures.

---

## Hierarchy Structure

### DIVISION Hierarchy

```
Level 1: Root Division
  └─ Level 2: Sub-Division
      └─ Level 3: Sub-Sub-Division
          └─ Level 4: ...
              └─ Level 5: ...
                  └─ Level 6: ...
                      └─ Level 7: Deepest Level
```

### Single-Level Types

```
Level 1: Organization (No hierarchy)
```

**Types**: COMPANY, PROJECT_TEAM, DEPARTMENT, COMMITTEE, WORKGROUP, PARTNERSHIP

---

## Hierarchy Rules

### DIVISION Rules

```typescript
interface DivisionHierarchyRules {
  maxDepth: 7; // Maximum 7 levels deep
  minDepth: 1; // At least root level
  parentConstraints: {
    mustBeDivision: true; // Parent must be DIVISION type
    cannotBeSelf: true; // Cannot be own parent
    cannotCreateCycle: true; // Cannot create circular references
  };
  childConstraints: {
    canHaveChildren: true; // Can have child divisions
    childMustBeDivision: true; // Child must be DIVISION type
    maxChildrenPerLevel: -1; // No limit on children
  };
}
```

### Single-Level Rules

```typescript
interface SingleLevelRules {
  parentConstraints: {
    cannotHaveParent: true; // Cannot have parent organization
  };
  childConstraints: {
    cannotHaveChildren: true; // Cannot have child organizations
  };
}
```

---

## Hierarchy Operations

### Creating Child Division

```typescript
async function createChildDivision(
  parentId: OrganizationId,
  childData: CreateDivisionDto,
  context: IsolationContext
) {
  // 1. Validate parent exists and is DIVISION
  const parent = await organizationRepo.findById(parentId, context);
  if (parent.type !== OrganizationTypeEnum.DIVISION) {
    throw new Error('Parent must be DIVISION type');
  }
  
  // 2. Check hierarchy depth
  const parentLevel = await getDivisionLevel(parentId);
  if (parentLevel >= 7) {
    throw new Error('Maximum hierarchy depth reached (7 levels)');
  }
  
  // 3. Create child division
  const child = OrganizationAggregate.create(
    organizationId.generate(),
    tenantId,
    parentId, // Set parent
    OrganizationTypeEnum.DIVISION,
    childData.name,
    childData.code,
    childData.description
  );
  
  // 4. Calculate level
  const childLevel = parentLevel + 1;
  child.setLevel(childLevel);
  
  // 5. Save
  await organizationRepo.save(child, context);
  
  return child;
}
```

### Moving Division in Hierarchy

```typescript
async function moveDivision(
  divisionId: OrganizationId,
  newParentId: OrganizationId | null,
  context: IsolationContext
) {
  // 1. Get division to move
  const division = await organizationRepo.findById(divisionId, context);
  
  // 2. Validate can move
  if (division.type !== OrganizationTypeEnum.DIVISION) {
    throw new Error('Only DIVISION can be moved');
  }
  
  // 3. Check for circular reference
  if (newParentId) {
    await validateNoCircularReference(divisionId, newParentId);
  }
  
  // 4. Calculate new level
  let newLevel = 1; // Root level
  if (newParentId) {
    const newParent = await organizationRepo.findById(newParentId, context);
    const parentLevel = newParent.level;
    newLevel = parentLevel + 1;
    
    // Check max depth
    if (newLevel > 7) {
      throw new Error('Moving would exceed maximum depth (7 levels)');
    }
  }
  
  // 5. Update division and all descendants
  await updateDivisionAndDescendants(divisionId, newParentId, newLevel);
  
  // 6. Save
  division.setParent(newParentId);
  division.setLevel(newLevel);
  await organizationRepo.save(division, context);
}
```

### Circular Reference Prevention

```typescript
async function validateNoCircularReference(
  divisionId: OrganizationId,
  newParentId: OrganizationId
): Promise<void> {
  // Get all ancestors of new parent
  const ancestors = await getAncestors(newParentId);
  
  // Check if division is an ancestor of new parent
  if (ancestors.some(a => a.id.equals(divisionId))) {
    throw new Error('Cannot create circular reference');
  }
}

async function getAncestors(
  organizationId: OrganizationId
): Promise<Organization[]> {
  const ancestors: Organization[] = [];
  let currentId: OrganizationId | null = organizationId;
  
  while (currentId) {
    const org = await organizationRepo.findById(currentId);
    if (org.parentId) {
      ancestors.push(org);
      currentId = org.parentId;
    } else {
      break;
    }
  }
  
  return ancestors;
}
```

---

## Hierarchy Queries

### Get All Descendants

```typescript
async function getDescendants(
  organizationId: OrganizationId,
  context: IsolationContext
): Promise<Organization[]> {
  // Recursive query for all child divisions
  const descendants: Organization[] = [];
  
  async function collectChildren(parentId: OrganizationId) {
    const children = await organizationRepo.findByParentId(parentId, context);
    
    for (const child of children) {
      descendants.push(child);
      await collectChildren(child.id); // Recursive
    }
  }
  
  await collectChildren(organizationId);
  return descendants;
}
```

### Get Division Tree

```typescript
interface DivisionTreeNode {
  organization: Organization;
  children: DivisionTreeNode[];
}

async function getDivisionTree(
  rootOrganizationId: OrganizationId,
  context: IsolationContext
): Promise<DivisionTreeNode> {
  const root = await organizationRepo.findById(rootOrganizationId, context);
  
  async function buildTree(org: Organization): Promise<DivisionTreeNode> {
    const children = await organizationRepo.findByParentId(org.id, context);
    
    return {
      organization: org,
      children: await Promise.all(
        children.map(child => buildTree(child))
      )
    };
  }
  
  return buildTree(root);
}
```

### Get Division Path

```typescript
async function getDivisionPath(
  organizationId: OrganizationId
): Promise<Organization[]> {
  const path: Organization[] = [];
  let currentId: OrganizationId | null = organizationId;
  
  // Traverse up the hierarchy
  while (currentId) {
    const org = await organizationRepo.findById(currentId);
    path.unshift(org); // Add to beginning
    
    currentId = org.parentId;
  }
  
  return path;
}

// Example: Return full path as string
function getPathString(path: Organization[]): string {
  return path.map(org => org.name).join(' / ');
}
// Result: "Root Division / Sub-Division / Sub-Sub-Division"
```

---

## Level Calculation

### Automatic Level Calculation

```typescript
async function calculateLevel(
  organizationId: OrganizationId
): Promise<number> {
  let level = 1; // Start at root level
  let currentId: OrganizationId | null = organizationId;
  
  // Count ancestors
  while (currentId) {
    const org = await organizationRepo.findById(currentId);
    if (org.parentId) {
      level++;
      currentId = org.parentId;
    } else {
      break;
    }
  }
  
  return level;
}
```

### Level Update on Hierarchy Change

```typescript
async function updateLevels(
  organizationId: OrganizationId,
  newLevel: number
): Promise<void> {
  // Update organization level
  const org = await organizationRepo.findById(organizationId);
  org.setLevel(newLevel);
  await organizationRepo.save(org);
  
  // Update all descendants recursively
  const children = await organizationRepo.findByParentId(organizationId);
  for (const child of children) {
    await updateLevels(child.id, newLevel + 1);
  }
}
```

---

## Hierarchy Constraints

### Database Constraints

```sql
-- Ensure no circular references
CREATE OR REPLACE FUNCTION check_circular_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    -- Check if parent is descendant
    IF EXISTS (
      WITH RECURSIVE descendants AS (
        SELECT id, parent_id FROM organizations WHERE id = NEW.id
        UNION
        SELECT o.id, o.parent_id FROM organizations o
        INNER JOIN descendants d ON o.id = d.parent_id
      )
      SELECT 1 FROM descendants WHERE id = NEW.parent_id
    ) THEN
      RAISE EXCEPTION 'Circular reference detected';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_circular_reference
BEFORE UPDATE ON organizations
FOR EACH ROW
WHEN (NEW.parent_id IS NOT NULL)
EXECUTE FUNCTION check_circular_reference();
```

### Level Depth Constraint

```sql
-- Ensure level does not exceed 7
ALTER TABLE organizations 
ADD CONSTRAINT check_max_level 
CHECK (level <= 7);
```

---

## Hierarchy Use Cases

### Example: Multi-Level Corporation

```
Root Division: "Global Corporation" (Level 1)
├─ Regional Division: "North America" (Level 2)
│   ├─ Business Division: "US Operations" (Level 3)
│   │   ├─ Product Division: "Consumer Products" (Level 4)
│   │   └─ Product Division: "Enterprise Products" (Level 4)
│   └─ Business Division: "Canada Operations" (Level 3)
├─ Regional Division: "Europe" (Level 2)
│   └─ Business Division: "EU Operations" (Level 3)
└─ Regional Division: "Asia Pacific" (Level 2)
    └─ Business Division: "APAC Operations" (Level 3)
```

### Example: Product Hierarchy

```
Root Division: "Product Development" (Level 1)
├─ Platform Division: "Core Platform" (Level 2)
│   ├─ Team Division: "Backend Services" (Level 3)
│   ├─ Team Division: "Frontend Services" (Level 3)
│   └─ Team Division: "Infrastructure" (Level 3)
├─ Application Division: "Mobile Apps" (Level 2)
│   ├─ Team Division: "iOS Team" (Level 3)
│   └─ Team Division: "Android Team" (Level 3)
└─ Integration Division: "Third-Party Integrations" (Level 2)
```

---

## Performance Considerations

### Indexing

```sql
-- Index for parent lookups
CREATE INDEX idx_organizations_parent_id 
ON organizations(parent_id) 
WHERE parent_id IS NOT NULL;

-- Index for level queries
CREATE INDEX idx_organizations_level 
ON organizations(level);

-- Composite index for hierarchy queries
CREATE INDEX idx_organizations_tenant_parent_level 
ON organizations(tenant_id, parent_id, level);
```

### Query Optimization

```typescript
// Efficient hierarchy query with CTE
async function getOrganizationWithDescendants(
  organizationId: OrganizationId
): Promise<OrganizationWithDescendants> {
  const query = `
    WITH RECURSIVE descendants AS (
      -- Base case: start with root organization
      SELECT id, name, parent_id, level, type
      FROM organizations
      WHERE id = $1
      
      UNION ALL
      
      -- Recursive case: find children
      SELECT o.id, o.name, o.parent_id, o.level, o.type
      FROM organizations o
      INNER JOIN descendants d ON o.parent_id = d.id
      WHERE o.tenant_id = $2  -- Add tenant filter
        AND o.level <= 7      -- Safety limit
    )
    SELECT * FROM descendants
  `;
  
  return db.query(query, [organizationId.value, tenantId.value]);
}
```

---

## Related Documentation

- [Organization Types](./organization-types.md)
- [Organization Creation](./organization-creation.md)
- [Organization Limits](./organization-limits.md)
