# 最佳实践指南

## 概述

本文档提供了使用 `@hl8/exceptions` 模块的最佳实践建议，帮助开发者正确、高效地使用异常处理系统。

## 目录

- [异常设计原则](#异常设计原则)
- [异常使用指南](#异常使用指南)
- [分层架构异常映射](#分层架构异常映射)
- [性能优化建议](#性能优化建议)
- [安全最佳实践](#安全最佳实践)
- [测试策略](#测试策略)
- [常见反模式](#常见反模式)

## 异常设计原则

### 1. 单一职责原则

每个异常类应该只负责一种特定的错误情况。

```typescript
// ✅ 好的做法
class UserNotFoundException extends UserException {
  constructor(userId: string, data?: Record<string, unknown>) {
    super("USER_NOT_FOUND", "用户未找到", `ID 为 "${userId}" 的用户不存在`, 404, { userId, ...data });
  }
}

// ❌ 不好的做法
class UserException extends AbstractHttpException {
  constructor(type: 'not_found' | 'already_exists' | 'invalid_status', ...args: any[]) {
    // 一个异常类处理多种情况
  }
}
```

### 2. 明确的错误信息

异常消息应该清晰、具体，便于调试和理解。

```typescript
// ✅ 好的做法
throw new ValidationFailedException("email", "邮箱格式无效", {
  providedValue: "invalid-email",
  expectedFormat: "user@example.com"
});

// ❌ 不好的做法
throw new ValidationFailedException("field", "invalid");
```

### 3. 丰富的上下文信息

提供足够的上下文数据，便于问题定位和监控。

```typescript
// ✅ 好的做法
throw new AuthenticationFailedException("密码错误", {
  username: "john.doe",
  attemptCount: 3,
  lastAttemptTime: new Date(),
  ipAddress: request.ip,
  userAgent: request.headers['user-agent']
});
```

## 异常使用指南

### 1. 选择合适的异常类型

根据业务场景选择合适的异常类型。

```typescript
// 认证相关
throw new AuthenticationFailedException("密码错误");
throw new UnauthorizedException("您没有权限访问此资源");

// 用户管理相关
throw new UserNotFoundException(userId);
throw new UserAlreadyExistsException(email, "email");

// 数据验证相关
throw new ValidationFailedException("email", "邮箱格式无效");
throw new BusinessRuleViolationException("ORDER_AMOUNT_LIMIT", "订单金额超过限制");

// 系统资源相关
throw new RateLimitExceededException("API请求频率超出限制");
throw new ServiceUnavailableException("数据库连接超时");
```

### 2. 使用分层异常基类

根据Clean Architecture的分层原则选择合适的异常基类。

```typescript
// 接口层异常 - 处理HTTP请求相关的错误
class AuthenticationFailedException extends AuthException {} // 继承自InterfaceLayerException

// 应用层异常 - 处理应用服务相关的错误
class OrganizationNotFoundException extends OrganizationException {} // 继承自ApplicationLayerException

// 领域层异常 - 处理业务规则相关的错误
class CrossTenantAccessException extends TenantException {} // 继承自DomainLayerException

// 基础设施层异常 - 处理外部系统相关的错误
class ExternalServiceUnavailableException extends IntegrationException {} // 继承自InfrastructureLayerException
```

### 3. 异常链传递

正确处理异常链，保留原始异常信息。

```typescript
// ✅ 好的做法
try {
  await this.externalService.call();
} catch (error) {
  throw new ExternalServiceUnavailableException("payment-gateway", "服务调用失败", {
    serviceUrl: this.externalService.url,
    requestId: request.id
  }, "https://docs.hl8.com/errors#INTEGRATION_EXTERNAL_SERVICE_UNAVAILABLE", error);
}
```

## 分层架构异常映射

### 接口层 (Interface Layer)

处理HTTP请求相关的异常，通常返回4xx状态码。

```typescript
// 认证授权异常
throw new AuthenticationFailedException("用户名或密码错误");
throw new UnauthorizedException("您没有权限访问此资源");
throw new TokenExpiredException("访问令牌已过期");

// 用户管理异常
throw new UserNotFoundException(userId);
throw new UserAccountLockedException("账户因多次登录失败被锁定");
```

### 应用层 (Application Layer)

处理应用服务相关的异常，通常返回4xx或5xx状态码。

```typescript
// 组织管理异常
throw new OrganizationNotFoundException(organizationId);
throw new UnauthorizedOrganizationException(userId, organizationId);

// 部门管理异常
throw new DepartmentNotFoundException(departmentId);
throw new InvalidDepartmentHierarchyException("部门不能成为自己的子部门");
```

### 领域层 (Domain Layer)

处理业务规则相关的异常，通常返回4xx状态码。

```typescript
// 多租户异常
throw new CrossTenantAccessException(currentTenantId, targetTenantId);
throw new DataIsolationViolationException("违反了数据隔离规则");

// 数据验证异常
throw new ValidationFailedException("email", "邮箱格式无效");
throw new BusinessRuleViolationException("ORDER_AMOUNT_LIMIT", "订单金额超过限制");

// 业务逻辑异常
throw new OperationFailedException("order_creation", "订单创建失败");
throw new InvalidStateTransitionException("order", "cancelled", "shipped");
```

### 基础设施层 (Infrastructure Layer)

处理外部系统相关的异常，通常返回5xx状态码。

```typescript
// 系统资源异常
throw new RateLimitExceededException("API请求频率超出限制");
throw new ServiceUnavailableException("数据库连接超时");

// 集成异常
throw new ExternalServiceUnavailableException("payment-gateway", "支付网关服务不可用");
throw new ExternalServiceTimeoutException("payment-gateway", 5000);
```

## 性能优化建议

### 1. 异常对象复用

避免频繁创建异常对象，考虑使用工厂模式。

```typescript
// ✅ 好的做法
class ExceptionFactory {
  private static readonly userNotFound = new UserNotFoundException("template");
  
  static createUserNotFound(userId: string): UserNotFoundException {
    return new UserNotFoundException(userId);
  }
}
```

### 2. 延迟计算

对于复杂的上下文数据，使用延迟计算。

```typescript
// ✅ 好的做法
throw new ValidationFailedException("email", "邮箱格式无效", {
  providedValue: email,
  validationRules: () => this.getValidationRules("email"), // 延迟计算
  timestamp: new Date()
});
```

### 3. 避免深层嵌套

避免异常处理中的深层嵌套，使用早期返回。

```typescript
// ✅ 好的做法
async validateUser(userId: string): Promise<User> {
  if (!userId) {
    throw new ValidationFailedException("userId", "用户ID不能为空");
  }
  
  const user = await this.userRepository.findById(userId);
  if (!user) {
    throw new UserNotFoundException(userId);
  }
  
  return user;
}
```

## 安全最佳实践

### 1. 敏感信息保护

确保敏感信息不会在异常响应中泄露。

```typescript
// ✅ 好的做法
throw new AuthenticationFailedException("认证失败", {
  attemptCount: 3,
  // 不包含密码、令牌等敏感信息
});

// ❌ 不好的做法
throw new AuthenticationFailedException("认证失败", {
  password: userInput.password, // 敏感信息泄露
  token: authToken
});
```

### 2. 生产环境配置

在生产环境中启用安全防护。

```typescript
// ✅ 好的做法
@Module({
  imports: [
    ExceptionModule.forRoot({
      enableLogging: true,
      isProduction: process.env.NODE_ENV === "production", // 生产环境配置
    }),
  ],
})
export class AppModule {}
```

### 3. 错误信息脱敏

对错误信息进行脱敏处理。

```typescript
// ✅ 好的做法
const sanitizedData = {
  ...data,
  password: undefined, // 移除敏感字段
  token: data.token ? "***" : undefined, // 脱敏处理
};
```

## 测试策略

### 1. 异常测试覆盖

确保所有异常类都有完整的测试覆盖。

```typescript
describe("UserNotFoundException", () => {
  it("应该创建基本异常实例", () => {
    const exception = new UserNotFoundException("user-123");
    
    expect(exception.errorCode).toBe("USER_NOT_FOUND");
    expect(exception.title).toBe("用户未找到");
    expect(exception.httpStatus).toBe(404);
  });
  
  it("应该转换为RFC7807格式", () => {
    const exception = new UserNotFoundException("user-123");
    const problemDetails = exception.toRFC7807();
    
    expect(problemDetails.type).toBe("https://docs.hl8.com/errors#USER_NOT_FOUND");
    expect(problemDetails.status).toBe(404);
  });
});
```

### 2. 集成测试

测试异常过滤器是否正确处理异常。

```typescript
describe("HttpExceptionFilter", () => {
  it("应该正确处理UserNotFoundException", async () => {
    const response = await request(app.getHttpServer())
      .get("/users/invalid-id")
      .expect(404);
    
    expect(response.body).toEqual({
      type: "https://docs.hl8.com/errors#USER_NOT_FOUND",
      title: "用户未找到",
      detail: 'ID 为 "invalid-id" 的用户不存在',
      status: 404,
      errorCode: "USER_NOT_FOUND",
      instance: expect.any(String),
      data: { userId: "invalid-id" }
    });
  });
});
```

### 3. 性能测试

测试异常处理的性能影响。

```typescript
describe("异常处理性能", () => {
  it("异常创建性能测试", () => {
    const start = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      new UserNotFoundException(`user-${i}`);
    }
    
    const end = performance.now();
    expect(end - start).toBeLessThan(100); // 1000次异常创建应在100ms内完成
  });
});
```

## 常见反模式

### 1. 异常滥用

不要使用异常来控制正常的业务流程。

```typescript
// ❌ 不好的做法
function findUser(userId: string): User | null {
  try {
    return this.userRepository.findById(userId);
  } catch (error) {
    return null; // 使用异常控制流程
  }
}

// ✅ 好的做法
function findUser(userId: string): User | null {
  return this.userRepository.findById(userId); // 正常返回null
}

function getUser(userId: string): User {
  const user = this.findUser(userId);
  if (!user) {
    throw new UserNotFoundException(userId); // 在需要时抛出异常
  }
  return user;
}
```

### 2. 忽略异常

不要忽略或吞掉异常。

```typescript
// ❌ 不好的做法
try {
  await this.riskyOperation();
} catch (error) {
  // 忽略异常，可能导致问题难以发现
}

// ✅ 好的做法
try {
  await this.riskyOperation();
} catch (error) {
  this.logger.error("操作失败", error.stack, { operation: "riskyOperation" });
  throw new OperationFailedException("risky_operation", "操作执行失败", { originalError: error.message });
}
```

### 3. 异常信息不足

不要提供过于简单的异常信息。

```typescript
// ❌ 不好的做法
throw new ValidationFailedException("field", "invalid");

// ✅ 好的做法
throw new ValidationFailedException("email", "邮箱格式无效", {
  providedValue: "invalid-email",
  expectedFormat: "user@example.com",
  validationRule: "email_format"
});
```

### 4. 异常类型混乱

不要使用错误的异常类型。

```typescript
// ❌ 不好的做法
throw new UserNotFoundException("数据库连接失败"); // 错误类型

// ✅ 好的做法
throw new ServiceUnavailableException("数据库连接失败"); // 正确类型
```

## 总结

遵循这些最佳实践可以帮助您：

1. **提高代码质量** - 清晰的异常设计和正确的使用方式
2. **增强系统稳定性** - 完善的异常处理和安全防护
3. **改善开发体验** - 丰富的上下文信息和清晰的错误消息
4. **便于维护和调试** - 结构化的异常系统和完整的测试覆盖

记住，异常处理不仅仅是技术问题，更是架构设计的重要组成部分。正确的异常处理策略可以显著提高系统的可维护性和用户体验。
