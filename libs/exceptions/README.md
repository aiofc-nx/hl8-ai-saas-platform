# @hl8/exceptions

[![npm version](https://badge.fury.io/js/%40hl8%2Fexceptions.svg)](https://badge.fury.io/js/%40hl8%2Fexceptions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 统一的异常处理模块，遵循 RFC7807 标准，为 NestJS 应用提供完整的异常处理解决方案

## 📋 目录

- [特性](#特性)
- [架构设计](#架构设计)
- [安装](#安装)
- [快速开始](#快速开始)
- [核心概念](#核心概念)
- [API 参考](#api-参考)
- [配置选项](#配置选项)
- [使用示例](#使用示例)
- [最佳实践](#最佳实践)
- [故障排除](#故障排除)
- [更新日志](#更新日志)
- [许可证](#许可证)

## ✨ 特性

- 🎯 **RFC7807 标准**：完全遵循 RFC7807 标准，提供统一的错误响应格式
- 🏗️ **Clean Architecture**：采用清洁架构设计，支持领域驱动开发
- 🔧 **高度可配置**：支持同步和异步配置，灵活的消息提供者
- 📝 **完整日志记录**：自动记录异常详情和请求上下文
- 🌐 **国际化支持**：通过消息提供者支持多语言错误消息
- 🛡️ **类型安全**：完整的 TypeScript 支持，提供类型安全保障
- ⚡ **性能优化**：轻量级设计，最小化性能开销
- 🔄 **事件驱动**：支持异常事件发布，便于监控和追踪

## 🏗️ 架构设计

### 模块结构

```
@hl8/exceptions/
├── core/                    # 核心异常类
│   ├── AbstractHttpException    # 抽象基类
│   ├── GeneralBadRequestException    # 通用 400 错误
│   ├── GeneralInternalServerException # 通用 500 错误
│   ├── GeneralNotFoundException      # 通用 404 错误
│   └── 业务异常类...           # 特定业务异常
├── filters/                 # 异常过滤器
│   ├── HttpExceptionFilter      # HTTP 异常过滤器
│   └── AnyExceptionFilter       # 通用异常过滤器
├── providers/              # 消息提供者
│   ├── ExceptionMessageProvider # 消息提供者接口
│   └── DefaultMessageProvider   # 默认消息提供者
├── config/                 # 配置模块
│   └── ExceptionConfig          # 配置选项
└── ExceptionModule         # 主模块
```

### 设计原则

1. **单一职责**：每个组件只负责一个特定功能
2. **开闭原则**：对扩展开放，对修改封闭
3. **依赖倒置**：依赖抽象而非具体实现
4. **接口隔离**：提供细粒度的接口定义
5. **RFC7807 兼容**：严格遵循国际标准

## 📦 安装

```bash
# 使用 pnpm（推荐）
pnpm add @hl8/exceptions

# 使用 npm
npm install @hl8/exceptions

# 使用 yarn
yarn add @hl8/exceptions
```

### 依赖要求

- Node.js >= 18.0.0
- NestJS >= 11.0.0
- TypeScript >= 5.0.0

## 🚀 快速开始

### 1. 基本配置

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

### 2. 创建自定义异常

```typescript
// user.exceptions.ts
import { AbstractHttpException } from "@hl8/exceptions";

export class UserNotFoundException extends AbstractHttpException {
  constructor(userId: string) {
    super(
      "USER_NOT_FOUND",
      "用户未找到",
      `ID 为 "${userId}" 的用户不存在`,
      404,
      { userId },
    );
  }
}
```

### 3. 在服务中使用

```typescript
// user.service.ts
import { Injectable } from "@nestjs/common";
import { UserNotFoundException } from "./user.exceptions";

@Injectable()
export class UserService {
  async findById(id: string) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new UserNotFoundException(id);
    }

    return user;
  }
}
```

### 4. 异常响应示例

当抛出 `UserNotFoundException` 时，客户端将收到以下 RFC7807 格式的响应：

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

## 🧠 核心概念

### RFC7807 标准

本模块严格遵循 [RFC7807](https://tools.ietf.org/html/rfc7807) 标准，提供统一的错误响应格式：

- **type**: 错误类型的 URI 引用
- **title**: 错误的简短摘要
- **detail**: 错误的详细说明
- **status**: HTTP 状态码
- **instance**: 请求实例的唯一标识符
- **errorCode**: 应用自定义的错误代码
- **data**: 附加数据（可选）

### 异常层次结构

```
AbstractHttpException (抽象基类)
├── GeneralBadRequestException (400)
├── GeneralInternalServerException (500)
├── GeneralNotFoundException (404)
└── 业务异常类...
    ├── UserNotFoundException
    ├── TenantNotFoundException
    └── UnauthorizedOrganizationException
```

### 过滤器处理流程

```
异常抛出 → HttpExceptionFilter → RFC7807 转换 → 日志记录 → 响应发送
                ↓
            消息提供者 (可选)
```

## 📚 API 参考

### AbstractHttpException

所有自定义异常的抽象基类。

```typescript
abstract class AbstractHttpException extends HttpException {
  constructor(
    errorCode: string,
    title: string,
    detail: string,
    status: number,
    data?: any,
    type?: string,
    rootCause?: Error,
  );

  toRFC7807(): ProblemDetails;
}
```

### 预定义异常类

#### GeneralBadRequestException

通用 400 错误请求异常。

```typescript
class GeneralBadRequestException extends AbstractHttpException {
  constructor(title: string, detail: string, data?: any);
}
```

#### GeneralNotFoundException

通用 404 未找到异常。

```typescript
class GeneralNotFoundException extends AbstractHttpException {
  constructor(title: string, detail: string, data?: any);
}
```

#### GeneralInternalServerException

通用 500 内部服务器错误异常。

```typescript
class GeneralInternalServerException extends AbstractHttpException {
  constructor(title: string, detail: string, data?: any);
}
```

### 异常过滤器

#### HttpExceptionFilter

处理 `AbstractHttpException` 及其子类的过滤器。

```typescript
@Injectable()
@Catch(AbstractHttpException)
class HttpExceptionFilter implements ExceptionFilter<AbstractHttpException> {
  constructor(
    @Optional() logger?: ILoggerService,
    @Optional() messageProvider?: IExceptionMessageProvider
  );
}
```

#### AnyExceptionFilter

处理所有未捕获异常的过滤器。

```typescript
@Injectable()
@Catch()
class AnyExceptionFilter implements ExceptionFilter {
  constructor(@Optional() logger?: ILoggerService);
}
```

### 消息提供者

#### ExceptionMessageProvider

异常消息提供者接口，支持国际化。

```typescript
interface ExceptionMessageProvider {
  getMessage(
    errorCode: string,
    messageType: "title" | "detail",
    params?: Record<string, any>,
  ): string | undefined;

  hasMessage(errorCode: string, messageType: "title" | "detail"): boolean;
}
```

## ⚙️ 配置选项

### ExceptionModuleOptions

```typescript
interface ExceptionModuleOptions {
  enableLogging?: boolean; // 是否启用日志记录 (默认: true)
  logger?: ILoggerService; // 自定义日志服务
  messageProvider?: ExceptionMessageProvider; // 自定义消息提供者
  isProduction?: boolean; // 是否为生产环境
  registerGlobalFilters?: boolean; // 是否全局注册过滤器 (默认: true)
}
```

### 同步配置

```typescript
ExceptionModule.forRoot({
  enableLogging: true,
  isProduction: process.env.NODE_ENV === "production",
  messageProvider: new CustomMessageProvider(),
});
```

### 异步配置

```typescript
ExceptionModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (config: ConfigService) => ({
    enableLogging: config.get("LOGGING_ENABLED"),
    isProduction: config.get("NODE_ENV") === "production",
  }),
  inject: [ConfigService],
});
```

## 💡 使用示例

### 业务异常示例

```typescript
// 用户相关异常
export class UserNotFoundException extends AbstractHttpException {
  constructor(userId: string) {
    super(
      "USER_NOT_FOUND",
      "用户未找到",
      `ID 为 "${userId}" 的用户不存在`,
      404,
      { userId },
    );
  }
}

export class UserAlreadyExistsException extends AbstractHttpException {
  constructor(email: string) {
    super(
      "USER_ALREADY_EXISTS",
      "用户已存在",
      `邮箱 "${email}" 已被注册`,
      409,
      { email },
    );
  }
}

// 订单相关异常
export class OrderNotFoundException extends AbstractHttpException {
  constructor(orderId: string) {
    super(
      "ORDER_NOT_FOUND",
      "订单未找到",
      `ID 为 "${orderId}" 的订单不存在`,
      404,
      { orderId },
    );
  }
}

export class InsufficientStockException extends AbstractHttpException {
  constructor(productId: string, requested: number, available: number) {
    super(
      "INSUFFICIENT_STOCK",
      "库存不足",
      `产品 "${productId}" 库存不足，请求 ${requested}，可用 ${available}`,
      400,
      { productId, requested, available },
    );
  }
}
```

### 服务层使用示例

```typescript
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(userData: CreateUserDto): Promise<User> {
    // 检查用户是否已存在
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new UserAlreadyExistsException(userData.email);
    }

    try {
      const user = await this.userRepository.create(userData);
      return user;
    } catch (error) {
      // 包装数据库错误
      throw new GeneralInternalServerException(
        "用户创建失败",
        "创建用户时发生内部错误",
        { originalError: error.message },
      );
    }
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new UserNotFoundException(id);
    }

    return user;
  }
}
```

### 控制器层使用示例

```typescript
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() userData: CreateUserDto): Promise<User> {
    return this.userService.createUser(userData);
  }

  @Get(":id")
  async getUser(@Param("id") id: string): Promise<User> {
    return this.userService.findById(id);
  }

  @Put(":id")
  async updateUser(
    @Param("id") id: string,
    @Body() updateData: UpdateUserDto,
  ): Promise<User> {
    // 先检查用户是否存在
    await this.userService.findById(id);

    // 执行更新
    return this.userService.update(id, updateData);
  }
}
```

### 自定义消息提供者

```typescript
@Injectable()
export class I18nMessageProvider implements ExceptionMessageProvider {
  constructor(private readonly i18nService: I18nService) {}

  getMessage(
    errorCode: string,
    messageType: "title" | "detail",
    params?: Record<string, any>,
  ): string | undefined {
    const key = `errors.${errorCode}.${messageType}`;
    return this.i18nService.translate(key, params);
  }

  hasMessage(errorCode: string, messageType: "title" | "detail"): boolean {
    const key = `errors.${errorCode}.${messageType}`;
    return this.i18nService.exists(key);
  }
}

// 注册自定义消息提供者
@Module({
  imports: [
    ExceptionModule.forRoot({
      messageProvider: new I18nMessageProvider(i18nService),
    }),
  ],
})
export class AppModule {}
```

### 自定义日志服务

```typescript
@Injectable()
export class CustomLoggerService implements ILoggerService {
  constructor(private readonly logger: Logger) {}

  log(message: string, context?: any): void {
    this.logger.log(message, context);
  }

  error(message: string, stack?: string, context?: any): void {
    this.logger.error(message, stack, context);
  }

  warn(message: string, context?: any): void {
    this.logger.warn(message, context);
  }
}

// 注册自定义日志服务
@Module({
  imports: [
    ExceptionModule.forRoot({
      logger: new CustomLoggerService(logger),
    }),
  ],
})
export class AppModule {}
```

## 🎯 最佳实践

### 1. 异常命名规范

```typescript
// ✅ 好的命名
class UserNotFoundException extends AbstractHttpException {}
class InvalidPasswordException extends AbstractHttpException {}
class OrderPaymentFailedException extends AbstractHttpException {}

// ❌ 避免的命名
class UserError extends AbstractHttpException {}
class Error1 extends AbstractHttpException {}
class BadException extends AbstractHttpException {}
```

### 2. 错误代码规范

```typescript
// ✅ 使用大写蛇形命名法
"USER_NOT_FOUND";
"INVALID_PASSWORD";
"ORDER_PAYMENT_FAILED";
"INSUFFICIENT_STOCK";

// ❌ 避免的格式
"userNotFound";
"user_not_found";
"USERNOTFOUND";
"UserNotFound";
```

### 3. 异常消息规范

```typescript
// ✅ 清晰的消息
new UserNotFoundException(userId); // title: "用户未找到", detail: "ID 为 \"123\" 的用户不存在"

// ✅ 包含上下文信息
new InsufficientStockException(productId, requested, available);
// title: "库存不足"
// detail: "产品 \"ABC123\" 库存不足，请求 10，可用 5"

// ❌ 模糊的消息
new GeneralBadRequestException("错误", "出错了", {});
```

### 4. 数据字段规范

```typescript
// ✅ 包含有用的上下文数据
throw new UserNotFoundException(userId, {
  userId,
  timestamp: new Date().toISOString(),
  requestId: request.id,
});

// ❌ 包含敏感信息
throw new UserNotFoundException(userId, {
  userId,
  password: user.password, // 敏感信息
  apiKey: user.apiKey, // 敏感信息
});
```

### 5. 异常链处理

```typescript
@Injectable()
export class UserService {
  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      // 数据库操作
      return await this.userRepository.create(userData);
    } catch (error) {
      // 包装原始错误
      throw new GeneralInternalServerException(
        "用户创建失败",
        "创建用户时发生内部错误",
        { originalError: error.message },
        undefined,
        error, // 保留原始错误链
      );
    }
  }
}
```

### 6. 模块配置最佳实践

```typescript
// 开发环境配置
const developmentConfig = {
  enableLogging: true,
  isProduction: false,
  registerGlobalFilters: true,
};

// 生产环境配置
const productionConfig = {
  enableLogging: true,
  isProduction: true,
  registerGlobalFilters: true,
  logger: new StructuredLogger(), // 结构化日志
  messageProvider: new I18nMessageProvider(), // 国际化支持
};

// 测试环境配置
const testConfig = {
  enableLogging: false,
  isProduction: false,
  registerGlobalFilters: false, // 测试时不注册全局过滤器
};
```

## 🔧 故障排除

### 常见问题

#### 1. 异常没有被捕获

**问题**: 自定义异常没有被 `HttpExceptionFilter` 捕获

**解决方案**: 确保异常继承自 `AbstractHttpException`

```typescript
// ✅ 正确
class MyException extends AbstractHttpException {
  constructor() {
    super("MY_ERROR", "我的错误", "错误详情", 400);
  }
}

// ❌ 错误
class MyException extends Error {
  constructor() {
    super("我的错误");
  }
}
```

#### 2. 响应格式不正确

**问题**: 响应不是 RFC7807 格式

**解决方案**: 检查过滤器是否正确注册

```typescript
// 确保模块配置正确
@Module({
  imports: [
    ExceptionModule.forRoot({
      registerGlobalFilters: true, // 确保为 true
    }),
  ],
})
export class AppModule {}
```

#### 3. 日志没有记录

**问题**: 异常日志没有被记录

**解决方案**: 检查日志服务配置

```typescript
@Module({
  imports: [
    ExceptionModule.forRoot({
      enableLogging: true, // 确保启用日志
      logger: new CustomLoggerService(), // 提供日志服务
    }),
  ],
})
export class AppModule {}
```

#### 4. 消息提供者不生效

**问题**: 自定义消息没有被使用

**解决方案**: 检查消息提供者实现

```typescript
// 确保实现了正确的接口
class MyMessageProvider implements ExceptionMessageProvider {
  getMessage(
    errorCode: string,
    messageType: "title" | "detail",
    params?: any,
  ): string | undefined {
    // 实现逻辑
  }

  hasMessage(errorCode: string, messageType: "title" | "detail"): boolean {
    // 实现逻辑
  }
}
```

### 调试技巧

#### 1. 启用详细日志

```typescript
// 开发环境启用详细日志
const config = {
  enableLogging: true,
  isProduction: false,
  logger: new ConsoleLogger("ExceptionModule", {
    logLevels: ["error", "warn", "log", "debug", "verbose"],
  }),
};
```

#### 2. 检查异常堆栈

```typescript
// 在异常中添加原始错误
try {
  // 业务逻辑
} catch (error) {
  throw new GeneralInternalServerException(
    "操作失败",
    "执行操作时发生错误",
    { originalError: error.message },
    undefined,
    error, // 保留原始错误链
  );
}
```

#### 3. 验证 RFC7807 格式

```typescript
// 手动验证异常格式
const exception = new UserNotFoundException("user-123");
const problemDetails = exception.toRFC7807();
console.log(JSON.stringify(problemDetails, null, 2));
```

## 📝 更新日志

### v0.1.0 (2024-01-01)

- 🎉 初始版本发布
- ✨ 实现 RFC7807 标准支持
- ✨ 提供完整的异常处理解决方案
- ✨ 支持自定义消息提供者
- ✨ 支持自定义日志服务
- ✨ 提供预定义异常类
- ✨ 完整的 TypeScript 支持

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 📞 支持

如果您在使用过程中遇到问题，请：

1. 查看 [故障排除](#故障排除) 部分
2. 搜索已有的 [Issues](https://github.com/hl8/exceptions/issues)
3. 创建新的 Issue 并提供详细信息

---

**Made with ❤️ by HL8 Team**
