# 故障排除指南

## 概述

本文档提供了使用 `@hl8/exceptions` 模块时可能遇到的常见问题和解决方案。

## 目录

- [配置问题](#配置问题)
- [异常处理问题](#异常处理问题)
- [过滤器问题](#过滤器问题)
- [性能问题](#性能问题)
- [测试问题](#测试问题)
- [部署问题](#部署问题)

## 配置问题

### 问题1: 模块导入失败

**错误信息:**

```
Module not found: Can't resolve '@hl8/exceptions'
```

**解决方案:**

1. 确保已正确安装包：

```bash
pnpm add @hl8/exceptions
```

2. 检查package.json中的依赖：

```json
{
  "dependencies": {
    "@hl8/exceptions": "^2.0.0"
  }
}
```

3. 确保TypeScript配置正确：

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```

### 问题2: 过滤器未生效

**错误信息:**

```
异常没有被正确捕获和处理
```

**解决方案:**

1. 检查过滤器注册顺序：

```typescript
// ✅ 正确的注册顺序
app.useGlobalFilters(
  new HttpExceptionFilter(), // 优先处理已知异常
  new AnyExceptionFilter(), // 兜底处理未知异常
);
```

2. 确保在模块中正确配置：

```typescript
@Module({
  imports: [
    ExceptionModule.forRoot({
      registerGlobalFilters: true, // 确保启用全局过滤器
    }),
  ],
})
export class AppModule {}
```

3. 检查异常是否继承自正确的基类：

```typescript
// ✅ 正确的继承
class CustomException extends AbstractHttpException {
  // ...
}

// ❌ 错误的继承
class CustomException extends Error {
  // 不会被HttpExceptionFilter捕获
}
```

### 问题3: 消息提供者未生效

**错误信息:**

```
自定义消息没有被使用
```

**解决方案:**

1. 确保消息提供者正确实现接口：

```typescript
export class CustomMessageProvider implements ExceptionMessageProvider {
  getMessage(
    errorCode: string,
    messageType: "title" | "detail",
    params?: Record<string, unknown>,
  ): string | undefined {
    // 实现消息获取逻辑
  }

  hasMessage(errorCode: string, messageType: "title" | "detail"): boolean {
    // 实现消息存在检查
  }

  getAvailableErrorCodes(): string[] {
    // 返回可用错误代码
  }
}
```

2. 确保消息提供者正确注入：

```typescript
@Module({
  imports: [
    ExceptionModule.forRoot({
      messageProvider: new CustomMessageProvider(),
    }),
  ],
})
export class AppModule {}
```

## 异常处理问题

### 问题1: 异常响应格式不正确

**错误信息:**

```
响应不是RFC7807格式
```

**解决方案:**

1. 检查异常是否正确继承自AbstractHttpException：

```typescript
// ✅ 正确的实现
class UserNotFoundException extends AbstractHttpException {
  constructor(userId: string, data?: Record<string, unknown>) {
    super(
      "USER_NOT_FOUND",
      "用户未找到",
      `ID 为 "${userId}" 的用户不存在`,
      404,
      { userId, ...data },
    );
  }
}
```

2. 确保异常过滤器正确注册：

```typescript
app.useGlobalFilters(new HttpExceptionFilter());
```

3. 检查异常是否正确抛出：

```typescript
// ✅ 正确的抛出方式
throw new UserNotFoundException(userId);

// ❌ 错误的抛出方式
return new UserNotFoundException(userId); // 没有抛出异常
```

### 问题2: 异常数据丢失

**错误信息:**

```
异常响应中缺少自定义数据
```

**解决方案:**

1. 确保在构造函数中正确传递数据：

```typescript
throw new UserNotFoundException(userId, {
  requestId: request.id,
  timestamp: new Date(),
  additionalInfo: "custom data",
});
```

2. 检查toRFC7807方法是否正确实现：

```typescript
toRFC7807(): ProblemDetails {
  return {
    type: this.type || `https://docs.hl8.com/errors#${this.errorCode}`,
    title: this.title,
    detail: this.detail,
    status: this.httpStatus,
    errorCode: this.errorCode,
    instance: this.instance,
    data: this.data, // 确保数据被包含
  };
}
```

### 问题3: 异常堆栈信息丢失

**错误信息:**

```
异常堆栈信息不完整
```

**解决方案:**

1. 确保在构造函数中传递rootCause：

```typescript
try {
  await this.riskyOperation();
} catch (error) {
  throw new OperationFailedException(
    "risky_operation",
    "操作执行失败",
    { originalError: error.message },
    "https://docs.hl8.com/errors#OPERATION_FAILED",
    error, // 传递原始异常作为rootCause
  );
}
```

2. 检查日志记录配置：

```typescript
@Module({
  imports: [
    ExceptionModule.forRoot({
      enableLogging: true, // 确保启用日志记录
    }),
  ],
})
export class AppModule {}
```

## 过滤器问题

### 问题1: 过滤器重复注册

**错误信息:**

```
过滤器被重复注册
```

**解决方案:**

1. 检查模块配置：

```typescript
// ✅ 只在一个地方注册
@Module({
  imports: [
    ExceptionModule.forRoot({
      registerGlobalFilters: true, // 在模块中注册
    }),
  ],
})
export class AppModule {}

// 不要在main.ts中重复注册
```

2. 或者选择手动注册：

```typescript
// ✅ 手动注册
// main.ts
app.useGlobalFilters(new HttpExceptionFilter(), new AnyExceptionFilter());

// app.module.ts
@Module({
  imports: [
    ExceptionModule.forRoot({
      registerGlobalFilters: false, // 禁用自动注册
    }),
  ],
})
export class AppModule {}
```

### 问题2: 过滤器顺序错误

**错误信息:**

```
异常处理顺序不正确
```

**解决方案:**

1. 确保正确的过滤器顺序：

```typescript
// ✅ 正确的顺序
app.useGlobalFilters(
  new HttpExceptionFilter(), // 先处理已知异常
  new AnyExceptionFilter(), // 再处理未知异常
);
```

2. 检查@Catch装饰器：

```typescript
// ✅ 正确的装饰器使用
@Catch(AbstractHttpException)
export class HttpExceptionFilter
  implements ExceptionFilter<AbstractHttpException> {
  // ...
}

@Catch()
export class AnyExceptionFilter implements ExceptionFilter {
  // ...
}
```

### 问题3: 过滤器性能问题

**错误信息:**

```
过滤器处理异常时性能较差
```

**解决方案:**

1. 优化异常对象创建：

```typescript
// ✅ 使用工厂模式
class ExceptionFactory {
  static createUserNotFound(userId: string): UserNotFoundException {
    return new UserNotFoundException(userId);
  }
}
```

2. 避免在异常处理中进行复杂操作：

```typescript
// ✅ 简单的异常处理
catch(exception: AbstractHttpException, host: ArgumentsHost): void {
  const ctx = host.switchToHttp();
  const response = ctx.getResponse();
  const request = ctx.getRequest();

  const problemDetails = exception.toRFC7807();
  problemDetails.instance = request.id;

  response.code(problemDetails.status).send(problemDetails);
}
```

## 性能问题

### 问题1: 异常创建性能问题

**错误信息:**

```
异常创建耗时过长
```

**解决方案:**

1. 使用异常对象池：

```typescript
class ExceptionPool {
  private static readonly pool = new Map<string, AbstractHttpException>();

  static getException(type: string, ...args: any[]): AbstractHttpException {
    const key = `${type}_${JSON.stringify(args)}`;
    if (!this.pool.has(key)) {
      this.pool.set(key, this.createException(type, args));
    }
    return this.pool.get(key)!;
  }
}
```

2. 避免在异常构造函数中进行复杂计算：

```typescript
// ✅ 简单的构造函数
constructor(userId: string, data?: Record<string, unknown>) {
  super(
    'USER_NOT_FOUND',
    '用户未找到',
    `ID 为 "${userId}" 的用户不存在`,
    404,
    { userId, ...data }
  );
}

// ❌ 复杂的构造函数
constructor(userId: string, data?: Record<string, unknown>) {
  const complexData = this.calculateComplexData(userId); // 避免复杂计算
  super(/* ... */);
}
```

### 问题2: 内存泄漏

**错误信息:**

```
异常处理导致内存泄漏
```

**解决方案:**

1. 避免在异常中持有大量数据：

```typescript
// ✅ 只保存必要的数据
throw new UserNotFoundException(userId, {
  userId,
  timestamp: new Date(),
});

// ❌ 保存大量数据
throw new UserNotFoundException(userId, {
  userId,
  fullUserData: largeUserObject, // 避免保存大量数据
  allRelatedData: largeDataSet,
});
```

2. 定期清理异常对象池：

```typescript
class ExceptionPool {
  private static readonly maxSize = 1000;

  static cleanup(): void {
    if (this.pool.size > this.maxSize) {
      const entries = Array.from(this.pool.entries());
      const toDelete = entries.slice(0, entries.length - this.maxSize);
      toDelete.forEach(([key]) => this.pool.delete(key));
    }
  }
}
```

## 测试问题

### 问题1: 测试中异常未被捕获

**错误信息:**

```
测试中异常没有被正确捕获
```

**解决方案:**

1. 在测试中正确配置异常处理：

```typescript
describe("UserService", () => {
  let service: UserService;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ExceptionModule.forRoot({
          registerGlobalFilters: true,
        }),
      ],
      providers: [UserService],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    service = module.get<UserService>(UserService);
  });
});
```

2. 使用正确的测试断言：

```typescript
it("应该抛出UserNotFoundException", async () => {
  await expect(service.findUser("non-existent-user")).rejects.toThrow(
    UserNotFoundException,
  );
});
```

### 问题2: 测试覆盖率不足

**错误信息:**

```
测试覆盖率不达标
```

**解决方案:**

1. 为所有异常类创建测试：

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

    expect(problemDetails.type).toBe(
      "https://docs.hl8.com/errors#USER_NOT_FOUND",
    );
    expect(problemDetails.status).toBe(404);
  });
});
```

2. 测试异常过滤器的所有分支：

```typescript
describe("HttpExceptionFilter", () => {
  it("应该处理AbstractHttpException", () => {
    // 测试正常流程
  });

  it("应该处理带消息提供者的异常", () => {
    // 测试消息提供者流程
  });

  it("应该处理没有日志服务的情况", () => {
    // 测试没有日志服务的情况
  });
});
```

## 部署问题

### 问题1: 生产环境异常信息泄露

**错误信息:**

```
生产环境中暴露了敏感信息
```

**解决方案:**

1. 确保生产环境配置正确：

```typescript
@Module({
  imports: [
    ExceptionModule.forRoot({
      isProduction: process.env.NODE_ENV === "production", // 确保生产环境配置
    }),
  ],
})
export class AppModule {}
```

2. 检查异常数据是否包含敏感信息：

```typescript
// ✅ 安全的异常数据
throw new AuthenticationFailedException("认证失败", {
  attemptCount: 3,
  // 不包含密码、令牌等敏感信息
});

// ❌ 不安全的异常数据
throw new AuthenticationFailedException("认证失败", {
  password: userInput.password, // 敏感信息泄露
  token: authToken,
});
```

### 问题2: 日志配置问题

**错误信息:**

```
生产环境中日志配置不正确
```

**解决方案:**

1. 配置适当的日志级别：

```typescript
@Module({
  imports: [
    ExceptionModule.forRoot({
      enableLogging: true,
      isProduction: process.env.NODE_ENV === "production",
    }),
  ],
})
export class AppModule {}
```

2. 使用适当的日志服务：

```typescript
// 生产环境日志服务
export class ProductionLoggerService implements ILoggerService {
  log(message: string, context?: Record<string, unknown>): void {
    // 使用适当的日志库，如winston
    this.logger.info(message, context);
  }

  error(
    message: string,
    stack?: string,
    context?: Record<string, unknown>,
  ): void {
    this.logger.error(message, { stack, context });
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.logger.warn(message, context);
  }
}
```

## 调试技巧

### 1. 启用详细日志

```typescript
@Module({
  imports: [
    ExceptionModule.forRoot({
      enableLogging: true,
      isProduction: false, // 开发环境启用详细日志
    }),
  ],
})
export class AppModule {}
```

### 2. 使用调试工具

```typescript
// 在异常构造函数中添加调试信息
constructor(userId: string, data?: Record<string, unknown>) {
  console.log('Creating UserNotFoundException:', { userId, data });
  super(/* ... */);
}
```

### 3. 检查异常链

```typescript
// 检查异常链是否完整
try {
  await this.riskyOperation();
} catch (error) {
  console.log("Original error:", error);
  console.log("Error stack:", error.stack);

  throw new OperationFailedException(
    "risky_operation",
    "操作执行失败",
    { originalError: error.message },
    "https://docs.hl8.com/errors#OPERATION_FAILED",
    error,
  );
}
```

## 总结

通过本故障排除指南，您可以：

1. ✅ 快速定位和解决常见问题
2. ✅ 优化异常处理性能
3. ✅ 确保生产环境的安全配置
4. ✅ 提高测试覆盖率
5. ✅ 正确部署和配置异常处理系统

如果遇到本指南中未涵盖的问题，请：

1. 检查[API参考文档](./API_REFERENCE.md)
2. 查看[最佳实践指南](./BEST_PRACTICES.md)
3. 联系开发团队获取支持
