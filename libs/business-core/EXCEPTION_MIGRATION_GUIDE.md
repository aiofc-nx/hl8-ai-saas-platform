# 异常体系迁移指南

## 概述

本指南展示如何从69个细粒度异常类迁移到4个核心异常类型的简化体系。

## 迁移前后对比

### 迁移前 (69个异常类)

```typescript
// 过度细分的异常
TenantNameAlreadyExistsException;
InvalidTenantTypeException;
TenantStateException;
EmailValidationException;
InvalidEmailException;
EmailAlreadyExistsException;
// ... 还有63个异常类
```

### 迁移后 (4个核心异常类)

```typescript
// 简化的异常体系
BusinessRuleException; // 业务规则违反
ValidationException; // 数据验证失败
StateException; // 状态转换错误
PermissionException; // 权限不足
```

## 迁移示例

### 1. 租户相关异常迁移

#### 迁移前

```typescript
// 旧方式 - 需要记住多个异常类型
try {
  tenant.rename("新名称");
} catch (error) {
  if (error instanceof TenantNameAlreadyExistsException) {
    // 处理租户名称重复
  } else if (error instanceof InvalidTenantNameException) {
    // 处理租户名称无效
  } else if (error instanceof TenantStateException) {
    // 处理租户状态错误
  }
}
```

#### 迁移后

```typescript
// 新方式 - 只需记住4种异常类型
try {
  tenant.rename("新名称");
} catch (error) {
  if (error instanceof BusinessRuleException) {
    // 处理业务规则违反
    console.log(`规则: ${error.ruleName}`);
    console.log(`上下文: ${JSON.stringify(error.context)}`);
  } else if (error instanceof ValidationException) {
    // 处理验证错误
    console.log(`字段: ${error.fieldName}`);
    console.log(`值: ${error.fieldValue}`);
  } else if (error instanceof StateException) {
    // 处理状态错误
    console.log(`当前状态: ${error.currentState}`);
    console.log(`请求操作: ${error.requestedOperation}`);
  }
}
```

### 2. 用户相关异常迁移

#### 迁移前

```typescript
// 旧方式
throw new EmailValidationException("邮箱格式无效", email);
throw new EmailAlreadyExistsException(email, existingUserId);
throw new InvalidEmailException(email);
```

#### 迁移后

```typescript
// 新方式
const factory = SimplifiedExceptionFactory.getInstance();

// 邮箱格式验证
throw factory.createValidationError("邮箱格式无效", "email", email, {
  entity: "User",
});

// 邮箱已存在
throw factory.createEmailAlreadyExists(email, existingUserId, tenantId);

// 或者使用通用方法
throw factory.createBusinessRuleViolation(
  `邮箱 "${email}" 已存在`,
  "USER_EMAIL_UNIQUE",
  { email, existingUserId, tenantId, entity: "User" },
);
```

### 3. 聚合根异常迁移

#### 迁移前

```typescript
// 旧方式 - 复杂的异常处理
export class TenantAggregate {
  updateTenantName(name: string): void {
    if (!name) {
      throw this._exceptionFactory.createInvalidTenantName("租户名称不能为空");
    }
    if (this._tenant.isDeleted) {
      throw this._exceptionFactory.createTenantStateException("租户已被删除");
    }
    // ...
  }
}
```

#### 迁移后

```typescript
// 新方式 - 简化的异常处理
export class TenantAggregate {
  private _exceptionFactory = SimplifiedExceptionFactory.getInstance();

  updateTenantName(name: string): void {
    if (!name) {
      throw this._exceptionFactory.createValidationError(
        "租户名称不能为空",
        "name",
        name,
        { entity: "Tenant" },
      );
    }
    if (this._tenant.isDeleted) {
      throw this._exceptionFactory.createStateError(
        "租户已被删除",
        "deleted",
        "update",
        { tenantId: this._tenant.id.toString(), entity: "Tenant" },
      );
    }
    // ...
  }
}
```

## 迁移步骤

### 阶段1: 并行使用

```typescript
// 1. 导入新的异常体系
import {
  SimplifiedExceptionFactory,
  BusinessRuleException,
  ValidationException,
  StateException,
  PermissionException,
} from "../exceptions/simplified-exception-factory.js";

// 2. 在现有代码中逐步使用新异常
const factory = SimplifiedExceptionFactory.getInstance();

// 3. 保留旧异常体系以确保兼容性
```

### 阶段2: 逐步迁移

```typescript
// 1. 识别异常使用模式
// 2. 将相似异常合并为4个核心类型
// 3. 通过context传递具体信息
// 4. 更新异常处理逻辑
```

### 阶段3: 清理旧异常

```typescript
// 1. 标记旧异常为deprecated
// 2. 移除未使用的异常类
// 3. 更新文档和示例
```

## 最佳实践

### 1. 异常创建

```typescript
// ✅ 推荐：使用便捷方法
throw factory.createTenantNameAlreadyExists(tenantName, existingTenantId);

// ✅ 推荐：使用通用方法
throw factory.createBusinessRuleViolation(
  `租户名称 "${tenantName}" 已存在`,
  "TENANT_NAME_UNIQUE",
  { tenantName, existingTenantId, entity: "Tenant" },
);

// ❌ 避免：直接创建异常
throw new BusinessRuleException(message, ruleName, context);
```

### 2. 异常处理

```typescript
// ✅ 推荐：基于异常类型处理
try {
  // 业务逻辑
} catch (error) {
  if (error instanceof BusinessRuleException) {
    // 处理业务规则违反
    this.logger.warn(`业务规则违反: ${error.ruleName}`, error.context);
  } else if (error instanceof ValidationException) {
    // 处理验证错误
    this.logger.warn(`验证失败: ${error.fieldName}`, error.context);
  }
}

// ✅ 推荐：基于错误码处理
try {
  // 业务逻辑
} catch (error) {
  if (error.errorCode === "BUSINESS_RULE_VIOLATION") {
    // 处理业务规则违反
  } else if (error.errorCode === "VALIDATION_FAILED") {
    // 处理验证错误
  }
}
```

### 3. 上下文信息

```typescript
// ✅ 推荐：提供丰富的上下文信息
throw factory.createBusinessRuleViolation(
  "租户名称已存在",
  "TENANT_NAME_UNIQUE",
  {
    tenantName: "example",
    existingTenantId: "tenant-123",
    entity: "Tenant",
    operation: "create",
    timestamp: new Date().toISOString(),
  },
);
```

## 迁移检查清单

- [ ] 创建新的简化异常体系
- [ ] 更新异常工厂为简化版本
- [ ] 迁移实体类使用新异常体系
- [ ] 迁移聚合根使用新异常体系
- [ ] 更新异常处理逻辑
- [ ] 更新单元测试
- [ ] 更新文档和示例
- [ ] 标记旧异常为deprecated
- [ ] 清理未使用的异常类

## 总结

通过迁移到4个核心异常类型，我们实现了：

1. **简化维护**: 从69个异常类减少到4个
2. **提高可读性**: 异常类型直接对应业务概念
3. **降低复杂度**: 开发者只需记住4种异常类型
4. **保持灵活性**: 通过context传递具体信息
5. **符合DDD**: 异常类型直接反映业务规则

这种简化的异常体系既保持了业务逻辑的清晰性，又大大降低了维护成本。
