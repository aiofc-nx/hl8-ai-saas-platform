# Organization Types

> **Purpose**: Define all organization types and their characteristics  
> **Scope**: 7 organization types in multi-tenant SAAS platform

---

## Overview

Organizations are horizontal management units within a tenant that provide flexible organizational structures. The platform supports 7 organization types, each serving different business purposes and collaboration models.

---

## Organization Type Comparison

| Type | Purpose | Sharing | Hierarchy | Use Case |
|------|---------|---------|-----------|----------|
| **COMPANY** | Main business entity | Private | Single level | Primary company structure |
| **DIVISION** | Business unit | Private | Multi-level | Large organizations, subsidiaries |
| **PROJECT_TEAM** | Project collaboration | Shared | Single level | Cross-functional teams |
| **DEPARTMENT** | Functional unit | Private | Single level | Traditional departments |
| **COMMITTEE** | Governance body | Shared | Single level | Board, committees |
| **WORKGROUP** | Ad-hoc collaboration | Shared | Single level | Temporary groups |
| **PARTNERSHIP** | External partner | Shared | Single level | External collaborations |

---

## COMPANY Organization Type

### Characteristics

**Purpose**: Primary business entity or main organization  
**Isolation**: Private (not shared)  
**Hierarchy**: Single level only  
**Typical Use**: Main company structure

### Features

- Single primary organization per tenant
- Private data isolation
- Full administrative control
- Complete feature access
- Cannot be shared with other organizations

### Use Cases

- Primary business entity
- Main company organization
- Tenant's core organizational structure

### Constraints

```typescript
interface CompanyOrganization {
  type: OrganizationTypeEnum.COMPANY;
  sharingConfig: {
    isShared: false;
    sharingLevel: null; // No sharing
  };
  hierarchyConfig: {
    maxLevel: 1; // Single level only
    parentId: null; // Cannot have parent
  };
  restrictions: {
    mustBeUnique: true; // Only one per tenant
    cannotBeDeleted: false;
    cannotChangeType: true;
  };
}
```

---

## DIVISION Organization Type

### Characteristics

**Purpose**: Business unit or subsidiary within tenant  
**Isolation**: Private (not shared)  
**Hierarchy**: Multi-level support  
**Typical Use**: Large organizations with divisions

### Features

- Can have sub-divisions
- Private data isolation
- Multi-level hierarchy support
- Independent management
- Can have up to 7 levels deep

### Use Cases

- Business divisions
- Subsidiary companies
- Regional units
- Product lines

### Constraints

```typescript
interface DivisionOrganization {
  type: OrganizationTypeEnum.DIVISION;
  sharingConfig: {
    isShared: false;
    sharingLevel: null;
  };
  hierarchyConfig: {
    maxLevel: 7; // Multi-level
    parentId: OrganizationId | null; // Can have parent
  };
  restrictions: {
    mustBeUnique: false;
    cannotBeDeleted: false;
    cannotChangeType: false;
  };
}
```

---

## PROJECT_TEAM Organization Type

### Characteristics

**Purpose**: Cross-functional project teams  
**Isolation**: Shared (can collaborate across organizations)  
**Hierarchy**: Single level only  
**Typical Use**: Project collaboration

### Features

- Shared data and collaboration
- Cross-organizational access
- Project-focused structure
- Temporary or permanent
- Team member collaboration

### Use Cases

- Project teams
- Product development teams
- Cross-functional initiatives
- Agile teams

### Constraints

```typescript
interface ProjectTeamOrganization {
  type: OrganizationTypeEnum.PROJECT_TEAM;
  sharingConfig: {
    isShared: true;
    sharingLevel: SharingLevel.TENANT_LEVEL;
  };
  hierarchyConfig: {
    maxLevel: 1; // Single level only
    parentId: null; // Cannot have parent
  };
  restrictions: {
    mustBeUnique: false;
    cannotBeDeleted: false;
    cannotChangeType: false;
  };
}
```

---

## DEPARTMENT Organization Type

### Characteristics

**Purpose**: Traditional functional department  
**Isolation**: Private (not shared)  
**Hierarchy**: Single level only  
**Typical Use**: Standard department structure

### Features

- Private department data
- Functional specialization
- Department head management
- Standard department features
- Cannot be shared

### Use Cases

- HR department
- Finance department
- Engineering department
- Sales department

### Constraints

```typescript
interface DepartmentOrganization {
  type: OrganizationTypeEnum.DEPARTMENT;
  sharingConfig: {
    isShared: false;
    sharingLevel: null;
  };
  hierarchyConfig: {
    maxLevel: 1; // Single level
    parentId: null; // Cannot have parent
  };
  restrictions: {
    mustBeUnique: false;
    cannotBeDeleted: false;
    cannotChangeType: false;
  };
}
```

---

## COMMITTEE Organization Type

### Characteristics

**Purpose**: Governance and decision-making bodies  
**Isolation**: Shared (stakeholder access)  
**Hierarchy**: Single level only  
**Typical Use**: Board meetings, committees

### Features

- Shared access for members
- Governance functions
- Decision-making processes
- Committee meetings
- Document approval workflows

### Use Cases

- Board of directors
- Steering committees
- Advisory committees
- Review committees

### Constraints

```typescript
interface CommitteeOrganization {
  type: OrganizationTypeEnum.COMMITTEE;
  sharingConfig: {
    isShared: true;
    sharingLevel: SharingLevel.TENANT_LEVEL;
  };
  hierarchyConfig: {
    maxLevel: 1; // Single level
    parentId: null; // Cannot have parent
  };
  restrictions: {
    mustBeUnique: false;
    cannotBeDeleted: false;
    cannotChangeType: false;
  };
}
```

---

## WORKGROUP Organization Type

### Characteristics

**Purpose**: Ad-hoc temporary collaboration groups  
**Isolation**: Shared (collaborative)  
**Hierarchy**: Single level only  
**Typical Use**: Temporary work groups

### Features

- Temporary collaboration
- Shared resources
- Flexible membership
- Task-focused
- Can be archived when complete

### Use Cases

- Task forces
- Working groups
- Temporary teams
- Special initiatives

### Constraints

```typescript
interface WorkgroupOrganization {
  type: OrganizationTypeEnum.WORKGROUP;
  sharingConfig: {
    isShared: true;
    sharingLevel: SharingLevel.TENANT_LEVEL;
  };
  hierarchyConfig: {
    maxLevel: 1; // Single level
    parentId: null; // Cannot have parent
  };
  restrictions: {
    mustBeUnique: false;
    cannotBeDeleted: false;
    cannotChangeType: false;
  };
  lifecycle: {
    temporary: true;
    canArchive: true;
    autoExpire?: Date;
  };
}
```

---

## PARTNERSHIP Organization Type

### Characteristics

**Purpose**: External partner collaboration  
**Isolation**: Shared (cross-tenant possible)  
**Hierarchy**: Single level only  
**Typical Use**: External partnerships

### Features

- External partner access
- Cross-tenant collaboration (if enabled)
- Partner-specific permissions
- Data sharing agreements
- Collaborative workspaces

### Use Cases

- Vendor partnerships
- Client collaborations
- Joint ventures
- External consultants

### Constraints

```typescript
interface PartnershipOrganization {
  type: OrganizationTypeEnum.PARTNERSHIP;
  sharingConfig: {
    isShared: true;
    sharingLevel: SharingLevel.PLATFORM_LEVEL; // Cross-tenant if enabled
  };
  hierarchyConfig: {
    maxLevel: 1; // Single level
    parentId: null; // Cannot have parent
  };
  restrictions: {
    mustBeUnique: false;
    cannotBeDeleted: false;
    cannotChangeType: false;
  };
  security: {
    externalAccess: true;
    requireApproval: true;
    auditLogRequired: true;
  };
}
```

---

## Type Selection Guidelines

### When to Use COMPANY

- Primary business entity
- Main organizational structure
- Core tenant organization
- First organization in tenant

### When to Use DIVISION

- Large organizations
- Multi-level structure needed
- Business units
- Subsidiaries

### When to Use PROJECT_TEAM

- Cross-functional projects
- Temporary projects
- Team collaboration needed
- Shared resources required

### When to Use DEPARTMENT

- Traditional departments
- Functional units
- Standard organizational units
- Private department data

### When to Use COMMITTEE

- Governance bodies
- Decision-making groups
- Board activities
- Review processes

### When to Use WORKGROUP

- Temporary groups
- Task forces
- Special initiatives
- Ad-hoc collaboration

### When to Use PARTNERSHIP

- External partners
- Vendor collaborations
- Client workspaces
- Joint ventures

---

## Sharing Configuration

### Private Organizations (isShared: false)

```typescript
{
  isShared: false,
  sharingLevel: null,
  accessRules: {
    // Only members of this organization can access
    allowedUsers: [...orgMembers],
    allowedRoles: [...orgRoles],
  }
}
```

**Types**: COMPANY, DIVISION, DEPARTMENT

### Shared Organizations (isShared: true)

```typescript
{
  isShared: true,
  sharingLevel: SharingLevel.TENANT_LEVEL,
  accessRules: {
    // All users in tenant can access (if permitted)
    allowedUsers: 'all_tenant_users',
    allowedRoles: [...],
  }
}
```

**Types**: PROJECT_TEAM, COMMITTEE, WORKGROUP, PARTNERSHIP

---

## Hierarchy Support

### Single-Level Types

- COMPANY
- PROJECT_TEAM
- DEPARTMENT
- COMMITTEE
- WORKGROUP
- PARTNERSHIP

**Constraints**: Cannot have parent or child organizations

### Multi-Level Type

- DIVISION

**Constraints**: Can have parent and child divisions up to 7 levels

---

## Related Documentation

- [Organization Hierarchy](./organization-hierarchy.md)
- [Organization Creation](./organization-creation.md)
- [User Assignment Rules](./user-assignment.md)
