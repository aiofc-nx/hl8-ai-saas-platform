# Unit Testing Strategy

> **Purpose**: Document unit testing approach and best practices  
> **Coverage Target**: 80%+ for core business logic

---

## Overview

Unit tests focus on testing individual components in isolation, ensuring each unit functions correctly.

---

## Testing Framework

- **Framework**: Jest
- **Coverage Tool**: Istanbul/NYC
- **Mocking**: Jest mocks

---

## Test Structure

```
src/
  domain/
    entities/
      tenant.entity.ts
      tenant.entity.spec.ts
  application/
    use-cases/
      create-tenant.use-case.ts
      create-tenant.use-case.spec.ts
```

---

## Best Practices

1. **AAA Pattern**: Arrange, Act, Assert
2. **One concept per test**
3. **Descriptive test names**
4. **Isolation**: Tests should be independent

---

## Coverage Requirements

- Core domain logic: 80%+
- Use cases: 70%+
- Controllers: 60%+

---

## Related Documentation

- [Integration Testing](./integration-testing.md)
- [E2E Testing](./e2e-testing.md)
