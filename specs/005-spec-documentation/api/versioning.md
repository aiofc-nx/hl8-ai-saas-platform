# API Versioning Strategy

> **Purpose**: Document API versioning approach and backward compatibility  
> **Strategy**: URL-based versioning (semantic versioning)

---

## Overview

The API uses URL-based versioning following semantic versioning principles. Major versions are maintained in separate URL paths, ensuring backward compatibility and clear migration paths.

---

## Version Format

```
/api/v{major}/...
```

Examples:

- `/api/v1/tenants` - Version 1
- `/api/v2/tenants` - Version 2 (future)

---

## Versioning Strategy

### Major Version

- Breaking changes (incompatible changes)
- Requires new version number
- Old version supported for at least 1 year

### Minor Version

- New features (backward compatible)
- No URL change
- Indicated in response headers

### Patch Version

- Bug fixes (backward compatible)
- No URL change
- Indicated in response headers

---

## Version Headers

```http
GET /api/v1/tenants

Response Headers:
API-Version: 1.2.3
X-API-Version: 1.2.3
```

---

## Migration Path

### Deprecation Timeline

1. **Announcement** (6 months before removal)
   - Add deprecation header
   - Document migration guide

2. **Warning Period** (3 months)
   - Log deprecation warnings
   - Encourage migration

3. **Removal** (After 12 months)
   - Version removed
   - Redirect to new version

---

## Backward Compatibility

### Supported Changes

✅ Adding new fields to responses
✅ Adding new endpoints
✅ Adding optional query parameters
✅ Adding new HTTP methods

### Breaking Changes

❌ Removing fields
❌ Changing field types
❌ Removing endpoints
❌ Changing required parameters

---

## Version Documentation

- Each version has dedicated documentation
- Migration guides for each major version
- Deprecation notices in API responses

---

## Related Documentation

- [API Authentication](./authentication.md)
- [Tenant API Contract](./tenant-api.md)
