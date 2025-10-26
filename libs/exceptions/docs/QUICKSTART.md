# 快速开始指南

## 概述

本指南将帮助您快速上手 `@hl8/exceptions` 模块，在几分钟内完成基本配置并开始使用。

## 目录

- [安装](#安装)
- [基本配置](#基本配置)
- [使用异常](#使用异常)
- [自定义异常](#自定义异常)
- [配置过滤器](#配置过滤器)
- [下一步](#下一步)

## 安装

```bash
# 使用 pnpm（推荐）
pnpm add @hl8/exceptions

# 使用 npm
npm install @hl8/exceptions

# 使用 yarn
yarn add @hl8/exceptions
```

## 基本配置

### 1. 在模块中导入

```typescript
// app.module.ts
import { Module } from "@nestjs/common";
import { ExceptionModule } from "@hl8/exceptions";

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

### 2. 启动应用

```typescript
// main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

## 使用异常

### 1. 导入异常类

```typescript
// 导入常用的异常类
import {
  UserNotFoundException,
  AuthenticationFailedException,
  ValidationFailedException,
  RateLimitExceededException,
} from "@hl8/exceptions";
```

### 2. 在服务中使用

```typescript
// user.service.ts
import { Injectable } from "@nestjs/common";
import { UserNotFoundException } from "@hl8/exceptions";

@Injectable()
export class UserService {
  async findUser(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundException(userId);
    }

    return user;
  }
}
```

### 3. 查看异常响应

当访问不存在的用户时，您将收到以下RFC7807格式的响应：

```json
{
  "type": "https://docs.hl8.com/errors#USER_NOT_FOUND",
  "title": "用户未找到",
  "detail": "ID 为 \"user-123\" 的用户不存在",
  "status": 404,
  "errorCode": "USER_NOT_FOUND",
  "instance": "req-456789",
  "data": {
    "userId": "user-123"
  }
}
```

## 自定义异常

### 1. 创建自定义异常类

```typescript
// custom-exceptions.ts
import { AuthException } from "@hl8/exceptions/core/auth";

export class CustomAuthException extends AuthException {
  constructor(reason: string, data?: Record<string, unknown>) {
    super(
      "CUSTOM_AUTH_ERROR",
      "自定义认证错误",
      reason,
      401,
      data,
      "https://docs.hl8.com/errors#CUSTOM_AUTH_ERROR",
    );
  }
}
```

### 2. 使用自定义异常

```typescript
// auth.service.ts
import { Injectable } from "@nestjs/common";
import { CustomAuthException } from "./custom-exceptions";

@Injectable()
export class AuthService {
  async validateCustomAuth(token: string) {
    if (!this.isValidCustomToken(token)) {
      throw new CustomAuthException("自定义令牌无效", {
        tokenType: "custom",
        providedToken: token.substring(0, 10) + "...",
      });
    }
  }
}
```

## 配置过滤器

### 1. 手动注册过滤器

```typescript
// main.ts
import { NestFactory } from "@nestjs/core";
import { HttpExceptionFilter, AnyExceptionFilter } from "@hl8/exceptions";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 注册全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter(), new AnyExceptionFilter());

  await app.listen(3000);
}
```

### 2. 自定义日志服务

```typescript
// custom-logger.service.ts
import { Injectable } from "@nestjs/common";
import { ILoggerService } from "@hl8/exceptions";

@Injectable()
export class CustomLoggerService implements ILoggerService {
  log(message: string, context?: Record<string, unknown>): void {
    console.log(`[LOG] ${message}`, context);
  }

  error(
    message: string,
    stack?: string,
    context?: Record<string, unknown>,
  ): void {
    console.error(`[ERROR] ${message}`, { stack, context });
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(`[WARN] ${message}`, context);
  }
}
```

### 3. 使用自定义日志服务

```typescript
// app.module.ts
import { Module } from "@nestjs/common";
import { ExceptionModule } from "@hl8/exceptions";
import { CustomLoggerService } from "./custom-logger.service";

@Module({
  imports: [
    ExceptionModule.forRoot({
      enableLogging: true,
      isProduction: process.env.NODE_ENV === "production",
    }),
  ],
  providers: [CustomLoggerService],
})
export class AppModule {}
```

## 完整示例

### 1. 创建用户服务

```typescript
// user.service.ts
import { Injectable } from "@nestjs/common";
import {
  UserNotFoundException,
  UserAlreadyExistsException,
  ValidationFailedException,
} from "@hl8/exceptions";

@Injectable()
export class UserService {
  async findUser(userId: string) {
    if (!userId) {
      throw new ValidationFailedException("userId", "用户ID不能为空");
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    return user;
  }

  async createUser(userData: CreateUserDto) {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new UserAlreadyExistsException(userData.email, "email");
    }

    return await this.userRepository.create(userData);
  }
}
```

### 2. 创建用户控制器

```typescript
// user.controller.ts
import { Controller, Get, Post, Param, Body } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(":id")
  async findUser(@Param("id") id: string) {
    return await this.userService.findUser(id);
  }

  @Post()
  async createUser(@Body() userData: CreateUserDto) {
    return await this.userService.createUser(userData);
  }
}
```

### 3. 测试异常处理

```bash
# 测试用户不存在异常
curl http://localhost:3000/users/non-existent-user

# 响应示例：
{
  "type": "https://docs.hl8.com/errors#USER_NOT_FOUND",
  "title": "用户未找到",
  "detail": "ID 为 \"non-existent-user\" 的用户不存在",
  "status": 404,
  "errorCode": "USER_NOT_FOUND",
  "instance": "req-123456",
  "data": {
    "userId": "non-existent-user"
  }
}
```

## 下一步

### 1. 探索更多异常类型

查看 [API 参考文档](./API_REFERENCE.md) 了解所有可用的异常类型。

### 2. 学习最佳实践

阅读 [最佳实践指南](./BEST_PRACTICES.md) 了解如何正确使用异常处理系统。

### 3. 自定义消息提供者

创建自定义的消息提供者来支持国际化。

```typescript
// custom-message.provider.ts
import { ExceptionMessageProvider } from "@hl8/exceptions";

export class CustomMessageProvider implements ExceptionMessageProvider {
  getMessage(
    errorCode: string,
    messageType: "title" | "detail",
    params?: Record<string, unknown>,
  ): string | undefined {
    // 实现自定义消息逻辑
    const messages = {
      USER_NOT_FOUND: {
        title: "User Not Found",
        detail: `User with ID "${params?.userId}" does not exist`,
      },
    };

    return messages[errorCode]?.[messageType];
  }

  hasMessage(errorCode: string, messageType: "title" | "detail"): boolean {
    // 实现消息存在检查逻辑
    return true;
  }

  getAvailableErrorCodes(): string[] {
    // 返回所有可用的错误代码
    return ["USER_NOT_FOUND", "USER_ALREADY_EXISTS"];
  }
}
```

### 4. 配置生产环境

确保在生产环境中正确配置异常处理。

```typescript
// app.module.ts
import { Module } from "@nestjs/common";
import { ExceptionModule } from "@hl8/exceptions";

@Module({
  imports: [
    ExceptionModule.forRoot({
      enableLogging: true,
      isProduction: process.env.NODE_ENV === "production",
      registerGlobalFilters: true,
    }),
  ],
})
export class AppModule {}
```

## 常见问题

### Q: 如何自定义异常消息？

A: 可以通过消息提供者来自定义异常消息，或者直接修改异常构造函数中的消息。

### Q: 如何处理异步操作中的异常？

A: 异常处理系统完全支持异步操作，只需要在async函数中正常抛出异常即可。

### Q: 如何添加自定义的异常数据？

A: 在创建异常时，可以通过data参数传递自定义数据。

```typescript
throw new UserNotFoundException(userId, {
  requestId: request.id,
  timestamp: new Date(),
  additionalInfo: "custom data",
});
```

### Q: 如何测试异常处理？

A: 可以使用Jest等测试框架来测试异常处理，确保异常被正确抛出和处理。

## 总结

通过本指南，您已经学会了：

1. ✅ 安装和配置异常处理模块
2. ✅ 使用预定义的异常类
3. ✅ 创建自定义异常类
4. ✅ 配置异常过滤器
5. ✅ 测试异常处理功能

现在您可以开始在实际项目中使用 `@hl8/exceptions` 模块了！如有任何问题，请参考完整的文档或联系开发团队。
