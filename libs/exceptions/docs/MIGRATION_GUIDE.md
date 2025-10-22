# 异常系统迁移指南

## 概述

本文档说明了从原有异常系统迁移到新的分类异常系统的变更和最佳实践。

## 主要变更

### 1. 重复异常类的迁移

以下原有异常类已被迁移到新的分类系统中：

#### 已删除的异常类

- `TenantNotFoundException` → 使用 `@hl8/exceptions/core/tenant` 中的 `TenantNotFoundException`
- `UnauthorizedOrganizationException` → 使用 `@hl8/exceptions/core/organization` 中的 `UnauthorizedOrganizationException`
- `InvalidIsolationContextException` → 使用 `@hl8/exceptions/core/tenant` 中的 `InvalidTenantContextException`

### 2. 新的导入路径

#### 租户相关异常

```typescript
// 旧方式 ❌
import { TenantNotFoundException } from "@hl8/exceptions";

// 新方式 ✅
import { TenantNotFoundException } from "@hl8/exceptions/core/tenant";
```

#### 组织相关异常

```typescript
// 旧方式 ❌
import { UnauthorizedOrganizationException } from "@hl8/exceptions";

// 新方式 ✅
import { UnauthorizedOrganizationException } from "@hl8/exceptions/core/organization";
```

#### 租户上下文异常

```typescript
// 旧方式 ❌
import { InvalidIsolationContextException } from "@hl8/exceptions";

// 新方式 ✅
import { InvalidTenantContextException } from "@hl8/exceptions/core/tenant";
```

### 3. 保留的通用异常类

以下通用异常类保持不变，继续使用：

- `GeneralBadRequestException` - 通用400错误
- `GeneralInternalServerException` - 通用500错误
- `GeneralNotFoundException` - 通用404错误

```typescript
// 继续使用 ✅
import { 
  GeneralBadRequestException,
  GeneralInternalServerException,
  GeneralNotFoundException
} from "@hl8/exceptions";
```

## 迁移步骤

### 步骤1: 更新导入语句

查找并替换以下导入语句：

```bash
# 搜索需要更新的文件
grep -r "TenantNotFoundException" src/
grep -r "UnauthorizedOrganizationException" src/
grep -r "InvalidIsolationContextException" src/
```

### 步骤2: 更新异常使用

#### 租户异常迁移示例

```typescript
// 旧代码 ❌
import { TenantNotFoundException } from "@hl8/exceptions";

export class TenantService {
  async findTenant(tenantId: string) {
    const tenant = await this.repository.findById(tenantId);
    if (!tenant) {
      throw new TenantNotFoundException(tenantId);
    }
    return tenant;
  }
}

// 新代码 ✅
import { TenantNotFoundException } from "@hl8/exceptions/core/tenant";

export class TenantService {
  async findTenant(tenantId: string) {
    const tenant = await this.repository.findById(tenantId);
    if (!tenant) {
      throw new TenantNotFoundException(tenantId);
    }
    return tenant;
  }
}
```

#### 组织异常迁移示例

```typescript
// 旧代码 ❌
import { UnauthorizedOrganizationException } from "@hl8/exceptions";

export class OrganizationService {
  async checkAccess(userId: string, organizationId: string) {
    const hasAccess = await this.checkUserAccess(userId, organizationId);
    if (!hasAccess) {
      throw new UnauthorizedOrganizationException(organizationId);
    }
  }
}

// 新代码 ✅
import { UnauthorizedOrganizationException } from "@hl8/exceptions/core/organization";

export class OrganizationService {
  async checkAccess(userId: string, organizationId: string) {
    const hasAccess = await this.checkUserAccess(userId, organizationId);
    if (!hasAccess) {
      throw new UnauthorizedOrganizationException(userId, organizationId);
    }
  }
}
```

### 步骤3: 利用新的分类异常

新的异常系统提供了更丰富的分类异常：

```typescript
// 认证相关异常
import {
  AuthenticationFailedException,
  UnauthorizedException,
  TokenExpiredException,
  InvalidTokenException,
  InsufficientPermissionsException
} from "@hl8/exceptions/core/auth";

// 用户管理异常
import {
  UserNotFoundException,
  UserAlreadyExistsException,
  InvalidUserStatusException,
  UserAccountLockedException,
  UserAccountDisabledException
} from "@hl8/exceptions/core/user";

// 数据验证异常
import {
  ValidationFailedException,
  BusinessRuleViolationException,
  ConstraintViolationException
} from "@hl8/exceptions/core/validation";

// 系统资源异常
import {
  RateLimitExceededException,
  ServiceUnavailableException,
  ResourceNotFoundException
} from "@hl8/exceptions/core/system";
```

## 向后兼容性

### 完全兼容

- 通用异常类 (`GeneralBadRequestException`, `GeneralInternalServerException`, `GeneralNotFoundException`)
- 抽象基类 (`AbstractHttpException`)
- 异常过滤器 (`HttpExceptionFilter`, `AnyExceptionFilter`)
- 消息提供者 (`ExceptionMessageProvider`, `DefaultMessageProvider`)

### 需要更新

- 租户相关异常的导入路径
- 组织相关异常的导入路径
- 租户上下文异常的导入路径

## 新功能优势

### 1. 分层架构支持

```typescript
// 新的分层异常基类
import { InterfaceLayerException } from "@hl8/exceptions/core/layers";
import { DomainLayerException } from "@hl8/exceptions/core/layers";
import { ApplicationLayerException } from "@hl8/exceptions/core/layers";
import { InfrastructureLayerException } from "@hl8/exceptions/core/layers";
```

### 2. 分类管理

```typescript
// 按业务域分类的异常
const exception = new AuthenticationFailedException("密码错误");
console.log(exception.getCategory()); // "auth"
console.log(exception.getLayer()); // "interface"
```

### 3. RFC7807标准

所有异常都完全符合RFC7807标准，提供统一的错误响应格式。

## 测试更新

如果您的项目中有针对已删除异常类的测试，需要更新测试文件：

```typescript
// 更新测试导入
import { TenantNotFoundException } from "@hl8/exceptions/core/tenant";
import { UnauthorizedOrganizationException } from "@hl8/exceptions/core/organization";
import { InvalidTenantContextException } from "@hl8/exceptions/core/tenant";
```

## 常见问题

### Q: 为什么删除了原有的异常类？

A: 新的分类异常系统提供了更好的功能，包括分层架构支持、RFC7807标准、更丰富的上下文数据等。删除重复的异常类可以避免混淆并确保一致性。

### Q: 通用异常类为什么不迁移？

A: 通用异常类（如 `GeneralBadRequestException`）是通用的，不特定于某个业务域，并且有很好的向后兼容性。保留它们可以确保现有代码继续工作。

### Q: 如何处理自定义异常？

A: 建议继承相应的分类异常基类：

```typescript
// 继承认证异常基类
export class CustomAuthException extends AuthException {
  constructor(reason: string, data?: Record<string, unknown>) {
    super("CUSTOM_AUTH_ERROR", "自定义认证错误", reason, 401, data);
  }
}
```

## 总结

迁移到新的异常系统提供了：

- 更好的代码组织
- 分层架构支持
- RFC7807标准兼容
- 丰富的异常分类
- 向后兼容性

遵循本指南可以确保平滑的迁移过程。
