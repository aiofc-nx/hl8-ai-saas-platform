# Integration Testing Strategy

> **Purpose**: Test component interactions and integration points

---

## Overview

Integration tests verify that different parts of the system work together correctly.

---

## Test Categories

1. **Repository Integration**: Test data persistence
2. **Service Integration**: Test service interactions
3. **API Integration**: Test HTTP endpoints

---

## Test Database

- Use test database (in-memory or separate PostgreSQL instance)
- Reset database between tests
- Use transactions for cleanup

---

## Related Documentation

- [Unit Testing](./unit-testing.md)
- [Multi-Tenant Testing](./multi-tenant-testing.md)
