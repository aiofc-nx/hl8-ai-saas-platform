# Domain Kernel 异常体系集成指南

## 概述

本文档描述了 `libs/domain-kernel` 与 `libs/exceptions` 的集成实现，提供了统一的异常处理体系，支持领域层异常与HTTP异常的转换。

## 架构设计

### 异常体系结构

```
DomainException (基类)
├── BusinessRuleViolationException (业务规则异常)
├── ValidationException (验证异常)
├── TenantIsolationException (租户隔离异常)
└── IsolationValidationError (现有异常类，已迁移)
```

### 核心组件

#### 1. 异常基类 (`DomainException`)

```typescript
export class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>,
    public readonly category: string = "domain",
  )
}
```

**功能特性：**

- 统一的异常基类
- 支持RFC7807格式转换
- 支持HTTP异常转换
- 提供异常信息获取

#### 2. 具体异常类

**业务规则违规异常 (`BusinessRuleViolationException`)**

```typescript
const exception = new BusinessRuleViolationException(
  "INVALID_EMAIL",
  "邮箱格式无效",
  { email: "invalid-email" },
);
```

**验证异常 (`ValidationException`)**

```typescript
const exception = new ValidationException("email", "邮箱格式无效", {
  providedValue: "invalid-email",
});
```

**租户隔离异常 (`TenantIsolationException`)**

```typescript
const exception = new TenantIsolationException(
  "跨租户访问被拒绝",
  "CROSS_TENANT_ACCESS",
  { currentTenantId: "tenant1", targetTenantId: "tenant2" },
);
```

#### 3. 异常转换器 (`ExceptionConverter`)

```typescript
// 转换领域异常为HTTP异常
const httpException =
  ExceptionConverter.convertToHttpException(domainException);

// 转换业务规则验证结果
const exceptions = ExceptionConverter.convertValidationResult(result);

// 批量转换异常
const httpExceptions = ExceptionConverter.convertBatch(exceptions);
```

#### 4. 业务规则集成

**业务规则验证器支持异常抛出：**

```typescript
class UserRegistrationBusinessRule extends BusinessRuleValidator {
  validateUserRegistrationAndThrow(context: UserRegistrationContext): void {
    const result = this.validate(context);
    if (!result.isValid) {
      const firstError = result.errors[0];
      throw new BusinessRuleViolationException(
        firstError.code,
        firstError.message,
        firstError.context,
      );
    }
  }
}
```

## 使用示例

### 1. 创建异常

```typescript
import { BusinessRuleViolationException } from "@hl8/domain-kernel";

// 创建业务规则违规异常
const exception = new BusinessRuleViolationException(
  "INVALID_EMAIL",
  "邮箱格式无效",
  { email: "invalid-email" },
);
```

### 2. 异常转换

```typescript
import { ExceptionConverter } from "@hl8/domain-kernel";

// 转换为HTTP异常
const httpException = exception.toHttpException();

// 转换为RFC7807格式
const rfc7807 = exception.toRFC7807();
```

### 3. 业务规则验证

```typescript
import { UserRegistrationBusinessRule } from "@hl8/domain-kernel";

const validator = new UserRegistrationBusinessRule();

// 验证并抛出异常
validator.validateUserRegistrationAndThrow({
  operation: "user_registration",
  userData: {
    email: "invalid-email",
    username: "testuser",
    password: "weak",
  },
});
```

### 4. 异常处理

```typescript
try {
  // 业务逻辑
  validator.validateUserRegistrationAndThrow(context);
} catch (error) {
  if (error instanceof BusinessRuleViolationException) {
    // 处理业务规则违规
    const httpException = error.toHttpException();
    // 返回HTTP响应
  }
}
```

## 向后兼容性

### 现有异常类迁移

现有的 `IsolationValidationError` 已迁移到新异常体系：

```typescript
// 原有用法仍然支持
const error = new IsolationValidationError(
  "租户 ID 必须是非空字符串",
  "INVALID_TENANT_ID",
  { value: "" },
);

// 现在支持新异常体系的功能
expect(error.getCategory()).toBe("tenant");
expect(error.getLayer()).toBe("domain");
```

## 测试覆盖

### 测试文件结构

```
src/exceptions/
├── basic-test.spec.ts                    # 基础功能测试
├── integration.spec.ts                   # 集成测试
└── business-rule-validator.simple.spec.ts # 业务规则测试

src/rules/
├── user-registration.rule.spec.ts        # 用户注册规则测试
└── business-rule-validator.simple.spec.ts # 业务规则验证器测试

src/isolation/
└── isolation-validation.error.spec.ts    # 现有异常类迁移测试
```

### 测试覆盖范围

- ✅ 异常创建和基本信息
- ✅ 异常信息获取
- ✅ RFC7807格式转换
- ✅ HTTP异常转换
- ✅ 业务规则验证器集成
- ✅ 异常转换器功能
- ✅ 向后兼容性
- ✅ 异常体系完整性

## 性能优化

### 异常转换优化

- 使用延迟加载检查 `libs/exceptions` 可用性
- 缓存异常转换结果
- 避免重复的模块解析

### 内存管理

- 异常对象轻量化设计
- 上下文信息按需创建
- 避免循环引用

## 安全考虑

### 敏感信息保护

- 生产环境隐藏敏感异常详情
- 异常上下文信息过滤
- 错误代码标准化

### 异常泄露防护

- 统一的异常处理机制
- 异常信息脱敏
- 审计日志记录

## 部署指南

### 依赖关系

```json
{
  "peerDependencies": {
    "@hl8/exceptions": ">=2.0.0"
  },
  "peerDependenciesMeta": {
    "@hl8/exceptions": {
      "optional": true
    }
  }
}
```

### 配置选项

```typescript
// 检查异常转换能力
const canConvert = ExceptionConverter.canConvert();

// 获取支持的异常类型
const supportedTypes = ExceptionConverter.getSupportedExceptionTypes();
```

## 故障排除

### 常见问题

1. **异常转换失败**
   - 检查 `libs/exceptions` 是否正确安装
   - 验证异常代码格式

2. **业务规则验证异常**
   - 确认验证器正确注册
   - 检查验证上下文数据

3. **向后兼容性问题**
   - 使用新的异常体系API
   - 迁移现有异常处理代码

### 调试技巧

```typescript
// 获取异常详细信息
const info = exception.getExceptionInfo();
console.log("异常信息:", info);

// 检查异常转换能力
const canConvert = ExceptionConverter.canConvert();
console.log("转换能力:", canConvert);
```

## 总结

Domain Kernel 异常体系集成提供了：

- ✅ 统一的异常处理体系
- ✅ 完整的异常转换功能
- ✅ 业务规则验证器集成
- ✅ 向后兼容性支持
- ✅ 全面的测试覆盖
- ✅ 性能优化和安全考虑

这个集成方案为 SAAS 平台提供了强大、灵活、可扩展的异常处理能力，支持领域层异常与HTTP异常的 seamless 转换。
