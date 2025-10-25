# Multi-Database Support Implementation Plan

**Date**: 2024-12-19  
**Feature**: Multi-Database Support for PostgreSQL and MongoDB  
**Status**: Draft  

## Summary

Implement multi-database support for `libs/saas-core` infrastructure layer, enabling support for both PostgreSQL and MongoDB databases through adapter pattern and database-specific implementations.

## Objectives

1. **Support PostgreSQL**: Relational database for transactional operations
2. **Support MongoDB**: Document database for flexible document storage
3. **Maintain Clean Architecture**: Keep domain layer database-agnostic
4. **Leverage Infrastructure Kernel**: Use existing database adapters from `@hl8/infrastructure-kernel`

## Technical Context

### Current State

- **Infrastructure Kernel**: Provides `PostgreSQLAdapter` and `MongoDBAdapter`
- **Domain Layer**: Database-agnostic with repository interfaces
- **Infrastructure Layer**: Currently has unified entities in `entities/` directory

### Required Changes

1. **Directory Restructuring**: Separate PostgreSQL and MongoDB implementations
2. **Entity Separation**: Create database-specific entities
3. **Mapper Implementation**: Create database-specific mappers
4. **Repository Factory**: Create factory to select database-specific repositories

## Architecture

### Directory Structure

```
libs/saas-core/src/infrastructure/
├── database/
│   ├── postgresql/           # PostgreSQL implementation
│   │   ├── entities/         # PostgreSQL-specific entities
│   │   ├── mappers/          # PostgreSQL-specific mappers
│   │   └── repositories/     # PostgreSQL-specific repositories
│   └── mongodb/              # MongoDB implementation
│       ├── entities/         # MongoDB-specific entities
│       ├── mappers/          # MongoDB-specific mappers
│       └── repositories/     # MongoDB-specific repositories
├── shared/                   # Shared infrastructure logic
│   ├── interfaces/           # Shared interfaces
│   ├── services/             # Shared services
│   └── factories/            # Repository factory
└── index.ts                  # Unified exports
```

### Adapter Pattern

```typescript
// Using infrastructure-kernel adapters
import { PostgreSQLAdapter, MongoDBAdapter } from "@hl8/infrastructure-kernel";

// Repository implementation
export class TenantRepositoryImpl extends AggregateRepositoryAdapter<TenantAggregate> {
  constructor(
    private readonly dbAdapter: IDatabaseAdapter, // PostgreSQLAdapter or MongoDBAdapter
    private readonly mapper: TenantMapper,
  ) {
    super(dbAdapter);
  }
}
```

## Implementation Tasks

### Phase 1: Restructure Infrastructure Layer

#### Task 1.1: Create PostgreSQL Directory Structure

- [ ] Create `database/postgresql/entities/` directory
- [ ] Create `database/postgresql/mappers/` directory  
- [ ] Create `database/postgresql/repositories/` directory

#### Task 1.2: Move Existing PostgreSQL Code

- [ ] Move entities from `entities/` to `database/postgresql/entities/`
- [ ] Move mappers from `mappers/` to `database/postgresql/mappers/`
- [ ] Update entity imports to use new paths

#### Task 1.3: Create MongoDB Directory Structure

- [ ] Create `database/mongodb/entities/` directory
- [ ] Create `database/mongodb/mappers/` directory
- [ ] Create `database/mongodb/repositories/` directory

### Phase 2: Implement PostgreSQL Support

#### Task 2.1: PostgreSQL Entities

- [ ] Create TenantEntity for PostgreSQL
- [ ] Create OrganizationEntity for PostgreSQL
- [ ] Create DepartmentEntity for PostgreSQL
- [ ] Create UserEntity for PostgreSQL
- [ ] Create RoleEntity for PostgreSQL

#### Task 2.2: PostgreSQL Mappers

- [ ] Create TenantMapper for PostgreSQL
- [ ] Create OrganizationMapper for PostgreSQL
- [ ] Create DepartmentMapper for PostgreSQL
- [ ] Create UserMapper for PostgreSQL
- [ ] Create RoleMapper for PostgreSQL

#### Task 2.3: PostgreSQL Repositories

- [ ] Create PostgreSQL-specific TenantRepository
- [ ] Create PostgreSQL-specific OrganizationRepository
- [ ] Create PostgreSQL-specific DepartmentRepository
- [ ] Create PostgreSQL-specific UserRepository
- [ ] Create PostgreSQL-specific RoleRepository

### Phase 3: Implement MongoDB Support

#### Task 3.1: MongoDB Entities

- [ ] Create TenantEntity for MongoDB
- [ ] Create OrganizationEntity for MongoDB
- [ ] Create DepartmentEntity for MongoDB
- [ ] Create UserEntity for MongoDB
- [ ] Create RoleEntity for MongoDB

#### Task 3.2: MongoDB Mappers

- [ ] Create TenantMapper for MongoDB
- [ ] Create OrganizationMapper for MongoDB
- [ ] Create DepartmentMapper for MongoDB
- [ ] Create UserMapper for MongoDB
- [ ] Create RoleMapper for MongoDB

#### Task 3.3: MongoDB Repositories

- [ ] Create MongoDB-specific TenantRepository
- [ ] Create MongoDB-specific OrganizationRepository
- [ ] Create MongoDB-specific DepartmentRepository
- [ ] Create MongoDB-specific UserRepository
- [ ] Create MongoDB-specific RoleRepository

### Phase 4: Repository Factory

#### Task 4.1: Configuration Interface

- [ ] Create DatabaseConfig interface
- [ ] Support database type selection

#### Task 4.2: Factory Implementation

- [ ] Create RepositoryFactory
- [ ] Implement tenant repository factory method
- [ ] Implement organization repository factory method
- [ ] Implement department repository factory method
- [ ] Implement user repository factory method
- [ ] Implement role repository factory method

### Phase 5: Testing and Validation

#### Task 5.1: Unit Tests

- [ ] Test PostgreSQL entity mapping
- [ ] Test MongoDB entity mapping
- [ ] Test repository factory

#### Task 5.2: Integration Tests

- [ ] Test PostgreSQL integration
- [ ] Test MongoDB integration
- [ ] Test database switching

## Technical Considerations

### Data Type Differences

**PostgreSQL**:

- UUID for IDs
- JSON for complex types
- Foreign key constraints
- Transactional integrity

**MongoDB**:

- String/ObjectId for IDs
- Nested documents
- No foreign keys
- Aggregation pipelines

### Transaction Handling

**PostgreSQL**:

```typescript
await dbAdapter.transaction(async (em) => {
  // ACID transaction logic
});
```

**MongoDB**:

```typescript
const session = client.startSession();
session.startTransaction();
try {
  // Transaction logic
  await session.commitTransaction();
} catch {
  await session.abortTransaction();
}
```

## Dependencies

- `@hl8/infrastructure-kernel`: Database adapters
- `@mikro-orm/core`: ORM functionality
- `@mikro-orm/postgresql`: PostgreSQL driver
- `@mikro-orm/mongodb`: MongoDB driver

## Success Criteria

1. ✓ Both PostgreSQL and MongoDB are supported
2. ✓ Domain layer remains database-agnostic
3. ✓ Repository factory works correctly
4. ✓ All tests pass
5. ✓ Documentation is complete

## Timeline

- **Phase 1**: 2 days (Directory restructuring)
- **Phase 2**: 3 days (PostgreSQL implementation)
- **Phase 3**: 3 days (MongoDB implementation)
- **Phase 4**: 2 days (Factory implementation)
- **Phase 5**: 2 days (Testing)

**Total**: ~12 days
