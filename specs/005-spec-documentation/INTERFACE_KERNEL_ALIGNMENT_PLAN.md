# Interface Kernel Alignment Plan

**Date**: 2024-12-19  
**Feature**: Interface Kernel Alignment for SAAS Core  
**Branch**: `005-spec-documentation`

## Summary

Plan to align the interface layer of `libs/saas-core` with `libs/interface-kernel` to ensure proper integration and consistency across the SAAS platform.

## Current State Analysis

### Problems Identified

1. **Architectural Violations**: The interface layer contains directories that don't belong:
   - `commands/`, `queries/`, `handlers/`, `use-cases/` → belong in Application layer
   - `entities/`, `value-objects/`, `aggregates/` → belong in Domain layer
   - `repositories/`, `persistence/` → belong in Infrastructure layer

2. **Missing Integration**: The interface layer doesn't extend or integrate with `interface-kernel` services and base classes.

3. **Inconsistent Patterns**: Controllers, guards, and decorators don't follow interface-kernel patterns.

### Required Actions

1. **Cleanup**: Remove code that doesn't belong in the interface layer
2. **Alignment**: Extend interface-kernel base classes and use services
3. **Integration**: Inject interface-kernel services for authentication, authorization, validation, rate limiting, and monitoring
4. **Consistency**: Ensure all controllers, guards, and decorators follow interface-kernel patterns

## Interface Kernel Components

### Available from `libs/interface-kernel`

#### Controllers

- `RestController` - Base REST controller with standard CRUD operations

#### Services

- `AuthenticationService` - User authentication (JWT)
- `AuthorizationService` - Permission checks and authorization
- `ValidationService` - Request/response validation
- `RateLimitService` - API rate limiting
- `MonitoringService` - Metrics collection
- `HealthCheckService` - Health status monitoring

#### Middleware

- Request processing
- Logging
- Error handling

#### Guards

- Authentication guards
- Authorization guards

#### Decorators

- Request decorators
- Response decorators
- Validation decorators

#### Types

- Common interfaces and types

## Implementation Phases

### Phase 1: Interface Layer Cleanup

**Goal**: Remove code that doesn't belong in the interface layer.

**Tasks**:

1. Identify directories to delete:
   - `commands/`, `queries/`, `handlers/`, `use-cases/`
   - `entities/`, `value-objects/`, `aggregates/`
   - `repositories/`, `persistence/`

2. Identify directories to keep:
   - `controllers/`
   - `dto/`
   - `guards/`
   - Add: `decorators/`, `middleware/` if needed

3. Delete identified directories

**Output**: Clean interface layer with proper separation of concerns

### Phase 2: Controller Alignment

**Goal**: Align all controllers with interface-kernel patterns.

**Tasks**:

1. Create `base.controller.ts` extending `RestController` from interface-kernel
2. Update all existing controllers to extend `BaseController`
3. Ensure controllers inject interface-kernel services
4. Implement proper error handling using interface-kernel patterns

**Example**:

```typescript
import { RestController } from "@hl8/interface-kernel";

export class BaseController extends RestController {
  // Add common controller logic here
}

export class TenantController extends BaseController {
  // Tenant-specific endpoints
}
```

**Output**: Controllers aligned with interface-kernel patterns

### Phase 3: Service Integration

**Goal**: Integrate interface-kernel services into saas-core.

**Tasks**:

1. Import `InterfaceKernelModule` in `saas-core.module.ts`
2. Inject services in controllers:
   - `AuthenticationService` for user authentication
   - `AuthorizationService` for permission checks
   - `ValidationService` for request validation
   - `RateLimitService` for rate limiting
   - `MonitoringService` for metrics collection

**Example**:

```typescript
import { InterfaceKernelModule } from "@hl8/interface-kernel";

@Module({
  imports: [InterfaceKernelModule],
  // ...
})
export class SaasCoreModule {}
```

**Output**: Services properly integrated with interface-kernel

### Phase 4: Guards and Decorators

**Goal**: Align guards and decorators with interface-kernel.

**Tasks**:

1. Extend base guards from interface-kernel:
   - `AuthGuard` for authentication
   - `RolesGuard` for role-based access
   - CASL-based authorization guards

2. Use shared decorators from interface-kernel:
   - Request decorators (e.g., `@CurrentUser()`)
   - Response decorators (e.g., `@ApiResponse()`)
   - Validation decorators

**Output**: Guards and decorators aligned with interface-kernel

### Phase 5: Module Registration and Testing

**Goal**: Complete integration and test.

**Tasks**:

1. Register `InterfaceKernelModule` in saas-core module
2. Configure services and providers
3. Set up dependency injection
4. Write integration tests
5. Test authentication flow
6. Test authorization checks
7. Test rate limiting
8. Test monitoring

**Output**: Saas-core properly integrated with interface-kernel

## Success Criteria

All of the following must be met:

1. ✅ All controllers extend `RestController` from interface-kernel
2. ✅ All authentication uses `AuthenticationService` from interface-kernel
3. ✅ All authorization uses `AuthorizationService` from interface-kernel
4. ✅ All validation uses `ValidationService` from interface-kernel
5. ✅ All rate limiting uses `RateLimitService` from interface-kernel
6. ✅ All monitoring uses `MonitoringService` from interface-kernel
7. ✅ All guards extend base guards from interface-kernel
8. ✅ All decorators use shared decorators from interface-kernel
9. ✅ Interface layer only contains interface-specific code
10. ✅ No architectural boundaries violated

## Risk Assessment

### Risks

1. **Breaking Changes**: Modifying controllers may break existing API contracts
2. **Performance Impact**: Added abstraction layers may impact performance
3. **Complexity**: Integrating multiple kernel modules increases complexity

### Mitigation

1. **Incremental Migration**: Use feature flags for gradual rollout
2. **Comprehensive Testing**: Integration tests for all endpoints
3. **Performance Benchmarking**: Monitor metrics before and after changes
4. **Gradual Rollout**: Deploy to staging first, then production

## Next Steps

1. Review and approve this plan
2. Execute Phase 1: Interface Layer Cleanup
3. Execute Phase 2: Controller Alignment
4. Execute Phase 3: Service Integration
5. Execute Phase 4: Guards and Decorators
6. Execute Phase 5: Module Registration and Testing
7. Conduct end-to-end testing
8. Deploy to staging environment
9. Monitor and iterate

## Related Documentation

- `plan.md` - Implementation plan
- `libs/interface-kernel/README.md` - Interface kernel documentation
- `libs/saas-core/src/interface/` - Current interface layer
