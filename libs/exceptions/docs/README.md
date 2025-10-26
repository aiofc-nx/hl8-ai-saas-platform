# 文档索引

欢迎使用 `@hl8/exceptions` 异常处理模块的文档中心！

## 📚 文档导航

### 🚀 快速开始

- **[快速开始指南](./QUICKSTART.md)** - 快速上手指南，包含基本配置和使用示例
  - 安装和配置
  - 基本使用
  - 自定义异常
  - 完整示例

### 📖 核心文档

- **[API 参考文档](./API_REFERENCE.md)** - 完整的API接口文档
  - 核心异常类
  - 分层异常基类
  - 业务域异常类
  - 异常过滤器
  - 消息提供者
  - 配置选项

- **[最佳实践指南](./BEST_PRACTICES.md)** - 异常设计和使用最佳实践
  - 异常设计原则
  - 使用指南
  - 分层架构异常映射
  - 性能优化建议
  - 安全最佳实践
  - 测试策略

### 🔧 故障排除

- **[故障排除指南](./TROUBLESHOOTING.md)** - 常见问题和解决方案
  - 配置问题
  - 异常处理问题
  - 过滤器问题
  - 性能问题
  - 测试问题
  - 部署问题

### 🔄 迁移指南

- **[迁移指南](./MIGRATION_GUIDE.md)** - 从旧版本迁移到新版本
  - 主要变更
  - 迁移步骤
  - 向后兼容性
  - 新功能优势

### 🔗 集成文档

- **[Domain Kernel 集成评估](./DOMAIN_KERNEL_INTEGRATION_ASSESSMENT.md)** - 评估 libs/domain-kernel 集成 libs/exceptions 的可行性
  - 架构兼容性分析
  - 集成方案评估
  - 风险评估和缓解措施
  - 预期收益分析

- **[Domain Kernel 集成计划](./DOMAIN_KERNEL_INTEGRATION_PLAN.md)** - 详细的集成实施计划和代码示例
  - 分阶段实施计划
  - 具体代码示例
  - 测试策略
  - 迁移指南

## 🏗️ 架构概览

### 异常分类体系

```
异常分类体系
├── 认证授权异常 (auth)
│   ├── AuthenticationFailedException
│   ├── UnauthorizedException
│   ├── TokenExpiredException
│   ├── InvalidTokenException
│   └── InsufficientPermissionsException
├── 用户管理异常 (user)
│   ├── UserNotFoundException
│   ├── UserAlreadyExistsException
│   ├── InvalidUserStatusException
│   ├── UserAccountLockedException
│   └── UserAccountDisabledException
├── 多租户异常 (tenant)
│   ├── CrossTenantAccessException
│   ├── DataIsolationViolationException
│   └── InvalidTenantContextException
├── 数据验证异常 (validation)
│   ├── ValidationFailedException
│   ├── BusinessRuleViolationException
│   └── ConstraintViolationException
├── 系统资源异常 (system)
│   ├── RateLimitExceededException
│   ├── ServiceUnavailableException
│   └── ResourceNotFoundException
├── 组织管理异常 (organization)
│   ├── OrganizationNotFoundException
│   └── UnauthorizedOrganizationException
├── 部门管理异常 (department)
│   ├── DepartmentNotFoundException
│   ├── UnauthorizedDepartmentException
│   └── InvalidDepartmentHierarchyException
├── 业务逻辑异常 (business)
│   ├── OperationFailedException
│   ├── InvalidStateTransitionException
│   └── StepFailedException
├── 集成异常 (integration)
│   ├── ExternalServiceUnavailableException
│   ├── ExternalServiceErrorException
│   └── ExternalServiceTimeoutException
└── 通用异常 (general)
    ├── NotImplementedException
    └── MaintenanceModeException
```

### 分层架构映射

```
分层架构异常映射
├── 接口层 (Interface Layer)
│   ├── 认证授权异常
│   ├── 用户管理异常
│   └── 通用异常
├── 应用层 (Application Layer)
│   ├── 组织管理异常
│   └── 部门管理异常
├── 领域层 (Domain Layer)
│   ├── 多租户异常
│   ├── 数据验证异常
│   └── 业务逻辑异常
└── 基础设施层 (Infrastructure Layer)
    ├── 系统资源异常
    └── 集成异常
```

## 🎯 使用场景

### 1. 认证授权

```typescript
import {
  AuthenticationFailedException,
  UnauthorizedException,
} from "@hl8/exceptions/core/auth";

// 认证失败
throw new AuthenticationFailedException("用户名或密码错误");

// 未授权访问
throw new UnauthorizedException("您没有权限访问此资源");
```

### 2. 用户管理

```typescript
import {
  UserNotFoundException,
  UserAlreadyExistsException,
} from "@hl8/exceptions/core/user";

// 用户不存在
throw new UserNotFoundException(userId);

// 用户已存在
throw new UserAlreadyExistsException(email, "email");
```

### 3. 多租户

```typescript
import {
  CrossTenantAccessException,
  DataIsolationViolationException,
} from "@hl8/exceptions/core/tenant";

// 跨租户访问违规
throw new CrossTenantAccessException(currentTenantId, targetTenantId);

// 数据隔离违规
throw new DataIsolationViolationException("违反了数据隔离规则");
```

### 4. 数据验证

```typescript
import {
  ValidationFailedException,
  BusinessRuleViolationException,
} from "@hl8/exceptions/core/validation";

// 数据验证失败
throw new ValidationFailedException("email", "邮箱格式无效");

// 业务规则违规
throw new BusinessRuleViolationException(
  "ORDER_AMOUNT_LIMIT",
  "订单金额超过限制",
);
```

## 🔧 配置示例

### 基本配置

```typescript
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

### 自定义消息提供者

```typescript
import { ExceptionMessageProvider } from "@hl8/exceptions";

export class CustomMessageProvider implements ExceptionMessageProvider {
  getMessage(
    errorCode: string,
    messageType: "title" | "detail",
    params?: Record<string, unknown>,
  ): string | undefined {
    // 实现自定义消息逻辑
  }

  hasMessage(errorCode: string, messageType: "title" | "detail"): boolean {
    // 实现消息存在检查
  }

  getAvailableErrorCodes(): string[] {
    // 返回所有可用的错误代码
  }
}
```

### 自定义日志服务

```typescript
import { ILoggerService } from "@hl8/exceptions";

export class CustomLoggerService implements ILoggerService {
  log(message: string, context?: Record<string, unknown>): void {
    // 实现日志记录
  }

  error(
    message: string,
    stack?: string,
    context?: Record<string, unknown>,
  ): void {
    // 实现错误日志记录
  }

  warn(message: string, context?: Record<string, unknown>): void {
    // 实现警告日志记录
  }
}
```

## 📊 特性概览

- ✅ **RFC7807 标准** - 完全遵循RFC7807标准
- ✅ **Clean Architecture** - 支持清洁架构设计
- ✅ **分类管理** - 按业务域分类的异常管理
- ✅ **分层支持** - 支持四层架构异常映射
- ✅ **类型安全** - 完整的TypeScript支持
- ✅ **性能优化** - 轻量级设计，最小化性能开销
- ✅ **安全防护** - 生产环境自动隐藏敏感信息
- ✅ **Fastify兼容** - 完美支持Fastify HTTP适配器
- ✅ **测试完善** - 100%测试覆盖率

## 🚀 开始使用

1. **安装模块**

   ```bash
   pnpm add @hl8/exceptions
   ```

2. **配置模块**

   ```typescript
   import { ExceptionModule } from "@hl8/exceptions";

   @Module({
     imports: [ExceptionModule.forRoot()],
   })
   export class AppModule {}
   ```

3. **使用异常**

   ```typescript
   import { UserNotFoundException } from "@hl8/exceptions/core/user";

   throw new UserNotFoundException(userId);
   ```

4. **查看响应**

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

## 📞 获取帮助

如果您在使用过程中遇到问题，请：

1. 查看 [故障排除指南](./TROUBLESHOOTING.md)
2. 阅读 [最佳实践指南](./BEST_PRACTICES.md)
3. 搜索已有的 [Issues](https://github.com/hl8/exceptions/issues)
4. 创建新的 Issue 并提供详细信息

---

**Made with ❤️ by HL8 Team**
