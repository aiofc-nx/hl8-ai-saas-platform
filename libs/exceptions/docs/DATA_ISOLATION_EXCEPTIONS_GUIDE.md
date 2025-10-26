# 数据隔离异常使用指南

## 概述

数据隔离是SAAS平台的核心功能，本异常体系提供了完整的租户、组织、部门级别的数据隔离异常处理机制。

## 异常层次结构

```
TenantException (基类)
├── CrossTenantAccessException (跨租户访问异常)
├── DataIsolationViolationException (数据隔离违规异常)
├── InvalidTenantContextException (无效租户上下文异常)
├── TenantDataIsolationException (租户数据隔离异常)
├── OrganizationIsolationException (组织隔离异常)
├── DepartmentIsolationException (部门隔离异常)
├── TenantContextViolationException (租户上下文违规异常)
└── TenantPermissionViolationException (租户权限违规异常)
```

## 使用场景

### 1. 租户数据隔离异常

用于处理租户级别的数据隔离验证失败：

```typescript
import { TenantDataIsolationException } from "@hl8/exceptions/core/tenant";

// 基本使用
throw new TenantDataIsolationException("租户数据隔离验证失败");

// 带上下文数据
throw new TenantDataIsolationException("租户数据隔离验证失败", {
  isolationLevel: "tenant",
  resourceType: "user",
  tenantId: "tenant-123",
  violationType: "cross_tenant_access",
});

// 获取隔离信息
const info = exception.getIsolationInfo();
console.log(info.isolationLevel); // 'tenant'
console.log(info.resourceType); // 'user'
```

### 2. 组织隔离异常

用于处理组织级别的数据隔离违规：

```typescript
import { OrganizationIsolationException } from "@hl8/exceptions/core/tenant";

// 基本使用
throw new OrganizationIsolationException("组织数据隔离验证失败");

// 带上下文数据
throw new OrganizationIsolationException("组织数据隔离验证失败", {
  organizationId: "org-123",
  resourceType: "department",
  violationType: "cross_organization_access",
});

// 获取组织隔离信息
const info = exception.getOrganizationIsolationInfo();
console.log(info.organizationId); // 'org-123'
console.log(info.isolationLevel); // 'organization'
```

### 3. 部门隔离异常

用于处理部门级别的数据隔离违规：

```typescript
import { DepartmentIsolationException } from "@hl8/exceptions/core/tenant";

// 基本使用
throw new DepartmentIsolationException("部门数据隔离验证失败");

// 带上下文数据
throw new DepartmentIsolationException("部门数据隔离验证失败", {
  departmentId: "dept-123",
  organizationId: "org-456",
  resourceType: "user",
  violationType: "cross_department_access",
});

// 获取部门隔离信息
const info = exception.getDepartmentIsolationInfo();
console.log(info.departmentId); // 'dept-123'
console.log(info.organizationId); // 'org-456'
```

### 4. 租户上下文违规异常

用于处理租户上下文验证失败：

```typescript
import { TenantContextViolationException } from "@hl8/exceptions/core/tenant";

// 基本使用
throw new TenantContextViolationException("租户上下文验证失败");

// 带上下文数据
throw new TenantContextViolationException("租户上下文验证失败", {
  contextType: "tenant_id",
  providedValue: "invalid-tenant-id",
  expectedFormat: "uuid",
  userId: "user-123",
});

// 获取上下文违规信息
const info = exception.getContextViolationInfo();
console.log(info.contextType); // 'tenant_id'
console.log(info.providedValue); // 'invalid-tenant-id'
```

### 5. 租户权限违规异常

用于处理租户权限验证失败：

```typescript
import { TenantPermissionViolationException } from "@hl8/exceptions/core/tenant";

// 基本使用
throw new TenantPermissionViolationException("租户权限验证失败");

// 带上下文数据
throw new TenantPermissionViolationException("租户权限验证失败", {
  permission: "read",
  resource: "user",
  tenantId: "tenant-123",
  userId: "user-456",
});

// 获取权限违规信息
const info = exception.getPermissionViolationInfo();
console.log(info.permission); // 'read'
console.log(info.resource); // 'user'
```

## 实际应用示例

### 数据访问控制

```typescript
import {
  TenantDataIsolationException,
  OrganizationIsolationException,
  DepartmentIsolationException,
} from "@hl8/exceptions/core/tenant";

class DataAccessService {
  async getUser(userId: string, currentTenantId: string, userTenantId: string) {
    // 检查租户隔离
    if (currentTenantId !== userTenantId) {
      throw new TenantDataIsolationException("跨租户访问用户数据", {
        isolationLevel: "tenant",
        resourceType: "user",
        tenantId: currentTenantId,
        violationType: "cross_tenant_access",
      });
    }

    // 检查组织隔离
    const userOrgId = await this.getUserOrganization(userId);
    const currentOrgId = await this.getCurrentUserOrganization();

    if (userOrgId !== currentOrgId) {
      throw new OrganizationIsolationException("跨组织访问用户数据", {
        organizationId: currentOrgId,
        resourceType: "user",
        violationType: "cross_organization_access",
      });
    }

    // 检查部门隔离
    const userDeptId = await this.getUserDepartment(userId);
    const currentDeptId = await this.getCurrentUserDepartment();

    if (userDeptId !== currentDeptId) {
      throw new DepartmentIsolationException("跨部门访问用户数据", {
        departmentId: currentDeptId,
        organizationId: currentOrgId,
        resourceType: "user",
        violationType: "cross_department_access",
      });
    }

    return await this.getUserData(userId);
  }
}
```

### 租户上下文验证

```typescript
import { TenantContextViolationException } from "@hl8/exceptions/core/tenant";

class TenantContextService {
  validateTenantContext(tenantId: string, userId: string) {
    // 检查租户ID格式
    if (!this.isValidTenantId(tenantId)) {
      throw new TenantContextViolationException("租户ID格式无效", {
        contextType: "tenant_id",
        providedValue: tenantId,
        expectedFormat: "uuid",
        userId: userId,
      });
    }

    // 检查用户是否属于该租户
    if (!this.isUserInTenant(userId, tenantId)) {
      throw new TenantContextViolationException("用户不属于指定租户", {
        contextType: "user_tenant_association",
        providedValue: userId,
        expectedFormat: "user_in_tenant",
        userId: userId,
      });
    }
  }
}
```

### 权限验证

```typescript
import { TenantPermissionViolationException } from "@hl8/exceptions/core/tenant";

class PermissionService {
  checkPermission(
    userId: string,
    resource: string,
    permission: string,
    tenantId: string,
  ) {
    if (!this.hasPermission(userId, resource, permission, tenantId)) {
      throw new TenantPermissionViolationException("用户没有权限执行此操作", {
        permission: permission,
        resource: resource,
        tenantId: tenantId,
        userId: userId,
      });
    }
  }
}
```

## 异常处理最佳实践

### 1. 分层异常处理

```typescript
import {
  TenantDataIsolationException,
  OrganizationIsolationException,
  DepartmentIsolationException,
} from "@hl8/exceptions/core/tenant";

try {
  await dataAccessService.getUser(userId, tenantId, userTenantId);
} catch (error) {
  if (error instanceof TenantDataIsolationException) {
    // 处理租户隔离异常
    console.log("租户隔离违规:", error.getIsolationInfo());
  } else if (error instanceof OrganizationIsolationException) {
    // 处理组织隔离异常
    console.log("组织隔离违规:", error.getOrganizationIsolationInfo());
  } else if (error instanceof DepartmentIsolationException) {
    // 处理部门隔离异常
    console.log("部门隔离违规:", error.getDepartmentIsolationInfo());
  } else {
    // 处理其他异常
    console.error("未知异常:", error);
  }
}
```

### 2. 异常信息记录

```typescript
import { TenantDataIsolationException } from "@hl8/exceptions/core/tenant";

try {
  await dataAccessService.getUser(userId, tenantId, userTenantId);
} catch (error) {
  if (error instanceof TenantDataIsolationException) {
    const info = error.getIsolationInfo();

    // 记录详细的隔离违规信息
    logger.warn("数据隔离违规", {
      isolationLevel: info.isolationLevel,
      resourceType: info.resourceType,
      tenantId: info.tenantId,
      violationType: info.violationType,
      timestamp: info.timestamp,
      userId: getCurrentUserId(),
    });
  }

  throw error;
}
```

### 3. 异常转换

```typescript
import { TenantDataIsolationException } from "@hl8/exceptions/core/tenant";

class ExceptionConverter {
  convertToUserFriendlyMessage(error: TenantDataIsolationException): string {
    const info = error.getIsolationInfo();

    switch (info.violationType) {
      case "cross_tenant_access":
        return "您没有权限访问其他租户的数据";
      case "cross_organization_access":
        return "您没有权限访问其他组织的数据";
      case "cross_department_access":
        return "您没有权限访问其他部门的数据";
      default:
        return "数据访问权限不足";
    }
  }
}
```

## 总结

数据隔离异常体系为SAAS平台提供了完整的多层级数据隔离异常处理机制，包括：

- **租户级别隔离**：确保不同租户之间的数据完全隔离
- **组织级别隔离**：在同一租户内实现组织级别的数据隔离
- **部门级别隔离**：在组织内实现部门级别的数据隔离
- **上下文验证**：确保租户上下文的完整性和安全性
- **权限控制**：实现细粒度的权限验证

通过使用这些异常类，可以确保SAAS平台的数据隔离功能得到有效的异常处理和错误报告。
