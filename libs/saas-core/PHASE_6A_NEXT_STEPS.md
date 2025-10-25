# Phase 6A: Multi-Database Support - Next Steps

## Current Status
**Overall Progress: 73% (22/30 sub-phases)**

### ✅ Completed Phases
- Phase 6A.1: Directory Restructuring (6/6) ✅ 100%
- Phase 6A.2: PostgreSQL Entities (6/6) ✅ 100%
- Phase 6A.3: PostgreSQL Mappers (6/6) ✅ 100%

### ⏳ Remaining Phases
- Phase 6A.4: PostgreSQL Repositories (1/6) - 17%
- Phase 6A.5: MongoDB Entities (0/6) - 0%
- Phase 6A.6: MongoDB Mappers (0/6) - 0%
- Phase 6A.7: MongoDB Repositories (0/6) - 0%
- Phase 6A.8: Repository Factory (0/7) - 0%
- Phase 6A.9: Testing and Integration (0/6) - 0%

---

## Next Implementation Tasks

### Phase 6A.4: PostgreSQL Repositories

**Objective**: Create PostgreSQL-specific repository implementations that:
1. Implement domain repository interfaces (ITenantRepository, IOrganizationRepository, etc.)
2. Use EntityManager from MikroORM
3. Use domain-specific mappers to convert between entities and aggregates
4. Handle IsolationContext for multi-tenant data filtering
5. Integrate with infrastructure-kernel's BaseRepositoryAdapter

**Required Files**:
- `libs/saas-core/src/infrastructure/repositories/postgresql/tenant.repository.ts`
- `libs/saas-core/src/infrastructure/repositories/postgresql/organization.repository.ts`
- `libs/saas-core/src/infrastructure/repositories/postgresql/department.repository.ts`
- `libs/saas-core/src/infrastructure/repositories/postgresql/user.repository.ts`
- `libs/saas-core/src/infrastructure/repositories/postgresql/role.repository.ts`
- `libs/saas-core/src/infrastructure/repositories/postgresql/index.ts`

**Implementation Pattern**:
```typescript
import { Injectable } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/core";
import { ITenantRepository } from "../../../domain/repositories/tenant.repository.js";
import { TenantAggregate } from "../../../domain/aggregates/tenant.aggregate.js";
import { TenantEntity } from "../../entities/postgresql/tenant.entity.js";
import { TenantMapper } from "../../mappers/postgresql/tenant.mapper.js";

@Injectable()
export class TenantRepositoryPostgreSQL implements ITenantRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: TenantId): Promise<TenantAggregate | null> {
    const entity = await this.em.findOne(TenantEntity, { id: id.getValue() });
    return entity ? TenantMapper.toDomain(entity) : null;
  }
  
  // ... implement other methods
}
```

---

## Recommendations

### Option 1: Complete PostgreSQL Implementation First
- Finish all PostgreSQL repositories (Phase 6A.4)
- Validate complete PostgreSQL data flow
- Then proceed with MongoDB implementation

### Option 2: Parallel Development
- Create basic repository structure for both databases
- Implement core CRUD operations
- Add advanced features incrementally

### Option 3: Incremental Approach (Recommended)
- Complete TenantRepository as a template
- Apply pattern to other repositories
- Test each repository as it's completed
- Move to MongoDB after PostgreSQL is stable

---

## Current Codebase State

### Existing Resources
- ✅ Domain repository interfaces defined
- ✅ PostgreSQL entities created
- ✅ PostgreSQL mappers implemented
- ✅ Infrastructure kernel BaseRepositoryAdapter available
- ⏳ Need MikroORM EntityManager integration
- ⏳ Need IsolationContext implementation

### Key Dependencies
- `@hl8/infrastructure-kernel` - Base repository adapter
- `@hl8/database` - MikroORM integration
- `@hl8/domain-kernel` - Domain entities and value objects
- `@mikro-orm/postgresql` - PostgreSQL driver

---

## Estimated Effort

- **Phase 6A.4**: ~6-8 hours (PostgreSQL repositories)
- **Phase 6A.5-6A.7**: ~12-15 hours (MongoDB support)
- **Phase 6A.8**: ~4-6 hours (Repository factory)
- **Phase 6A.9**: ~8-10 hours (Testing)

**Total Remaining**: ~30-39 hours

---

**Last Updated**: 2024-12-19
