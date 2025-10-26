# libs/domain-kernel 数据隔离异常使用指南

## 概述

本指南展示如何在 `libs/domain-kernel` 中使用新的数据隔离异常体系。`IsolationValidationError` 现在会根据错误代码自动选择合适的异常类型，提供更精确的错误处理。

## 异常类型映射

`IsolationValidationError` 现在根据错误代码自动选择合适的异常类型：

| 错误代码                       | 映射到的异常类型                     | 描述             |
| ------------------------------ | ------------------------------------ | ---------------- |
| `INVALID_TENANT_ID`            | `TenantContextViolationException`    | 租户ID无效       |
| `TENANT_ID_TOO_LONG`           | `TenantContextViolationException`    | 租户ID过长       |
| `INVALID_TENANT_ID_FORMAT`     | `TenantContextViolationException`    | 租户ID格式无效   |
| `INVALID_ORGANIZATION_ID`      | `OrganizationIsolationException`     | 组织ID无效       |
| `INVALID_ORGANIZATION_CONTEXT` | `OrganizationIsolationException`     | 组织上下文无效   |
| `INVALID_DEPARTMENT_ID`        | `DepartmentIsolationException`       | 部门ID无效       |
| `INVALID_DEPARTMENT_CONTEXT`   | `DepartmentIsolationException`       | 部门上下文无效   |
| `INVALID_USER_ID`              | `TenantDataIsolationException`       | 用户ID无效       |
| `ACCESS_DENIED`                | `TenantPermissionViolationException` | 访问被拒绝       |
| 其他                           | `TenantDataIsolationException`       | 默认数据隔离异常 |

## 使用示例

### 1. 基本使用

```typescript
import { IsolationValidationError } from "../isolation/isolation-validation.error.js";

// 租户ID验证失败
throw new IsolationValidationError(
  "租户 ID 必须是非空字符串",
  "INVALID_TENANT_ID",
  { value: "" },
);

// 组织上下文验证失败
throw new IsolationValidationError(
  "组织上下文缺少租户信息",
  "INVALID_ORGANIZATION_CONTEXT",
  { organizationId: "org-123" },
);

// 部门上下文验证失败
throw new IsolationValidationError(
  "部门上下文缺少组织信息",
  "INVALID_DEPARTMENT_CONTEXT",
  { departmentId: "dept-123" },
);
```

### 2. 在值对象中使用

```typescript
import { IsolationValidationError } from "../isolation/isolation-validation.error.js";

export class TenantId extends BaseValueObject {
  private readonly value: string;

  private constructor(value: string) {
    super();
    this.value = value;
    this.validate();
  }

  protected validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new IsolationValidationError(
        "租户 ID 不能为空",
        "INVALID_TENANT_ID",
        { value: this.value },
      );
    }

    if (this.value.length > 255) {
      throw new IsolationValidationError(
        "租户 ID 长度不能超过255个字符",
        "TENANT_ID_TOO_LONG",
        { value: this.value, maxLength: 255 },
      );
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(this.value)) {
      throw new IsolationValidationError(
        "租户 ID 格式无效，必须是UUID格式",
        "INVALID_TENANT_ID_FORMAT",
        { value: this.value, expectedFormat: "uuid" },
      );
    }
  }

  getValue(): string {
    return this.value;
  }
}
```

### 3. 在实体中使用

```typescript
import { IsolationValidationError } from "../isolation/isolation-validation.error.js";

export class User extends BaseEntity<UserId> {
  private _email: Email;
  private _username: Username;
  private _status: UserStatus;

  private constructor(
    id: UserId,
    tenantId: TenantId,
    email: Email,
    username: Username,
    status: UserStatus,
    createdAt?: Date,
    updatedAt?: Date,
    _version: number = 0,
  ) {
    super(id, tenantId, undefined, undefined, undefined, false, undefined, {
      createdAt: createdAt || new Date(),
      updatedAt: updatedAt || new Date(),
      version: _version,
    });

    this._email = email;
    this._username = username;
    this._status = status;
  }

  updateEmail(newEmail: Email): void {
    if (this._status === UserStatus.DELETED) {
      throw new IsolationValidationError(
        "无法更新已删除用户的邮箱",
        "INVALID_USER_ID",
        {
          userId: this.id.getValue(),
          status: this._status,
          operation: "update_email",
        },
      );
    }

    this._email = newEmail;
    this.updateTimestamp();
  }
}
```

### 4. 在业务规则验证器中使用

```typescript
import { IsolationValidationError } from "../isolation/isolation-validation.error.js";

export class UserRegistrationBusinessRule extends BusinessRuleValidator<UserRegistrationContext> {
  validateUserRegistrationAndReturnException(
    context: UserRegistrationContext,
  ): DomainBusinessRuleViolationException | null {
    // 检查租户上下文
    if (!context.tenantId || !context.tenantId.getValue()) {
      throw new IsolationValidationError(
        "用户注册需要有效的租户上下文",
        "INVALID_TENANT_ID",
        {
          operation: "user_registration",
          context: "tenant_validation",
        },
      );
    }

    // 检查组织上下文
    if (context.organizationId && !context.organizationId.getValue()) {
      throw new IsolationValidationError(
        "组织ID无效",
        "INVALID_ORGANIZATION_ID",
        {
          organizationId: context.organizationId.getValue(),
          operation: "user_registration",
        },
      );
    }

    // 检查部门上下文
    if (context.departmentId && !context.departmentId.getValue()) {
      throw new IsolationValidationError(
        "部门ID无效",
        "INVALID_DEPARTMENT_ID",
        {
          departmentId: context.departmentId.getValue(),
          organizationId: context.organizationId?.getValue(),
          operation: "user_registration",
        },
      );
    }

    // 其他业务规则验证...
    return null;
  }
}
```

### 5. 在隔离上下文中使用

```typescript
import { IsolationValidationError } from "./isolation-validation.error.js";

export class IsolationContext {
  private _tenantId: TenantId;
  private _organizationId?: OrganizationId;
  private _departmentId?: DepartmentId;

  constructor(
    tenantId: TenantId,
    organizationId?: OrganizationId,
    departmentId?: DepartmentId,
  ) {
    this._tenantId = tenantId;
    this._organizationId = organizationId;
    this._departmentId = departmentId;
    this.validate();
  }

  private validate(): void {
    // 验证租户ID
    if (!this._tenantId || !this._tenantId.getValue()) {
      throw new IsolationValidationError(
        "隔离上下文必须包含有效的租户ID",
        "INVALID_TENANT_ID",
        { contextType: "isolation_context" },
      );
    }

    // 验证组织上下文
    if (this._organizationId && !this._organizationId.getValue()) {
      throw new IsolationValidationError(
        "组织上下文无效",
        "INVALID_ORGANIZATION_CONTEXT",
        {
          organizationId: this._organizationId.getValue(),
          tenantId: this._tenantId.getValue(),
        },
      );
    }

    // 验证部门上下文
    if (this._departmentId && !this._departmentId.getValue()) {
      throw new IsolationValidationError(
        "部门上下文无效",
        "INVALID_DEPARTMENT_CONTEXT",
        {
          departmentId: this._departmentId.getValue(),
          organizationId: this._organizationId?.getValue(),
          tenantId: this._tenantId.getValue(),
        },
      );
    }

    // 验证部门必须属于组织
    if (this._departmentId && !this._organizationId) {
      throw new IsolationValidationError(
        "部门上下文缺少组织信息",
        "INVALID_DEPARTMENT_CONTEXT",
        {
          departmentId: this._departmentId.getValue(),
          tenantId: this._tenantId.getValue(),
        },
      );
    }
  }
}
```

## 异常处理

### 1. 捕获和处理异常

```typescript
import { IsolationValidationError } from "../isolation/isolation-validation.error.js";

try {
  const tenantId = TenantId.create("invalid-tenant-id");
} catch (error) {
  if (error instanceof IsolationValidationError) {
    // 获取内部异常实例
    const internalException = error.getInternalException();

    // 根据异常类型进行不同处理
    if (internalException instanceof TenantContextViolationException) {
      console.log("租户上下文验证失败:", error.getIsolationInfo());
    } else if (internalException instanceof OrganizationIsolationException) {
      console.log("组织隔离验证失败:", error.getIsolationInfo());
    } else if (internalException instanceof DepartmentIsolationException) {
      console.log("部门隔离验证失败:", error.getIsolationInfo());
    }

    // 获取RFC7807格式的错误信息
    const rfc7807 = error.toRFC7807();
    console.log("RFC7807格式:", rfc7807);
  }
}
```

### 2. 异常信息获取

```typescript
import { IsolationValidationError } from "../isolation/isolation-validation.error.js";

const error = new IsolationValidationError(
  "租户 ID 格式无效",
  "INVALID_TENANT_ID_FORMAT",
  { value: "invalid-id", expectedFormat: "uuid" },
);

// 获取隔离信息
const isolationInfo = error.getIsolationInfo();
console.log("隔离代码:", isolationInfo.isolationCode);
console.log("隔离消息:", isolationInfo.isolationMessage);
console.log("隔离上下文:", isolationInfo.isolationContext);
console.log("时间戳:", isolationInfo.timestamp);

// 获取内部异常实例
const internalException = error.getInternalException();
console.log("异常类型:", internalException.constructor.name);
console.log("错误代码:", internalException.errorCode);
console.log("HTTP状态码:", internalException.status);
```

## 最佳实践

### 1. 错误代码命名

- 使用清晰、描述性的错误代码
- 遵循现有的命名约定
- 避免使用过于通用的错误代码

### 2. 上下文信息

- 提供足够的上下文信息用于调试
- 包含相关的ID、操作类型、期望格式等信息
- 避免包含敏感信息

### 3. 异常处理

- 根据异常类型进行不同的处理
- 记录详细的错误信息用于监控和调试
- 提供用户友好的错误消息

### 4. 测试

- 为每个错误代码编写测试用例
- 验证异常类型映射是否正确
- 测试异常信息的完整性

## 总结

通过使用新的数据隔离异常体系，`libs/domain-kernel` 现在可以：

1. **自动选择合适的异常类型**：根据错误代码自动映射到最合适的异常类
2. **提供丰富的上下文信息**：包含详细的调试和监控信息
3. **保持向后兼容性**：现有的代码可以继续使用 `IsolationValidationError`
4. **支持多种异常类型**：租户、组织、部门、上下文、权限等不同类型的异常
5. **遵循RFC7807标准**：提供标准化的错误响应格式

这使得数据隔离异常处理更加精确和可维护，同时保持了良好的开发体验。
