# libs/infrastructure-kernel 异常系统集成指南

## 📋 概述

本文档详细说明 `libs/infrastructure-kernel` 与 `libs/exceptions` 的集成实现，包括使用方法、配置选项和最佳实践。

## 🎯 集成目标

### 主要目标

- **标准化异常处理**: 使用 `libs/exceptions` 提供的标准化异常类
- **RFC7807 合规**: 实现标准化的 HTTP 错误响应格式
- **类型安全**: 提供强类型的异常处理系统
- **向后兼容**: 保持现有 API 和功能的兼容性

### 次要目标

- **功能增强**: 在现有错误处理基础上增强功能
- **开发体验**: 提升开发者的使用体验
- **维护性**: 降低代码维护成本

## 🚀 快速开始

### 1. 安装依赖

```bash
# 依赖已添加到 package.json
cd libs/infrastructure-kernel
pnpm install
```

### 2. 基本使用

```typescript
import { InfrastructureExceptionConverter } from "./exceptions/infrastructure-exception.mapping.js";
import { EnhancedErrorHandlerService } from "./services/error-handling/enhanced-error-handler.service.js";

// 转换原生错误为标准化异常
const originalError = new Error("Database connection failed");
const standardException = InfrastructureExceptionConverter.convertToStandardException(
  originalError,
  "DATABASE",
  { operation: "getConnection", connectionName: "test-db" }
);

// 使用增强的错误处理器
const errorHandler = new EnhancedErrorHandlerService();
const result = await errorHandler.handleError(originalError, {
  operation: "database_query",
  context: "user_management"
});
```

## 📚 核心组件

### 1. InfrastructureExceptionConverter

**位置**: `src/exceptions/infrastructure-exception.mapping.ts`

**功能**: 将基础设施层错误转换为标准化异常

```typescript
// 错误类型映射
const errorTypes = {
  DATABASE: "数据库操作错误",
  CACHE: "缓存操作错误", 
  NETWORK: "网络连接错误",
  ISOLATION: "数据隔离违规",
  SYSTEM: "系统内部错误",
  INTEGRATION: "集成服务错误",
  VALIDATION: "数据验证失败",
  UNKNOWN: "未知基础设施错误"
};

// 使用示例
const standardException = InfrastructureExceptionConverter.convertToStandardException(
  error,
  "DATABASE",
  { operation: "createConnection" }
);
```

### 2. EnhancedErrorHandlerService

**位置**: `src/services/error-handling/enhanced-error-handler.service.ts`

**功能**: 增强的错误处理服务，集成标准化异常系统

```typescript
// 处理基础设施层错误
const result = await enhancedErrorHandler.handleInfrastructureError(
  error,
  "DATABASE",
  { connectionName: "test-db" }
);

// 批量处理错误
const results = await enhancedErrorHandler.handleBatchErrors([
  { error: dbError, type: "DATABASE" },
  { error: cacheError, type: "CACHE" },
  { error: networkError, type: "NETWORK" }
]);
```

### 3. 更新的服务类

#### DatabaseService

**位置**: `src/services/database/database-service.ts`

**更新内容**: 所有错误处理都使用标准化异常

```typescript
// 之前
throw new Error(`获取数据库连接失败: ${error.message}`);

// 现在
const standardError = error instanceof Error ? error : new Error(String(error));
throw InfrastructureExceptionConverter.convertToStandardException(
  standardError,
  "DATABASE",
  { operation: "getConnection", connectionName: name }
);
```

#### RepositoryAdapters

**位置**: `src/repositories/*/`

**更新内容**: 所有仓储适配器都使用标准化异常

```typescript
// 之前
throw new Error(`根据ID查找读模型失败: ${error.message}`);

// 现在
const standardError = error instanceof Error ? error : new Error(String(error));
throw InfrastructureExceptionConverter.convertToStandardException(
  standardError,
  "DATABASE",
  { operation: "findById", entityId: id }
);
```

## 🔧 配置选项

### 1. 错误类型映射

```typescript
// 自定义错误类型映射
const customMapping = {
  DATABASE: {
    errorType: "DATABASE",
    exceptionClass: SystemInternalException,
    httpStatus: 500,
    errorCode: "INFRA_DATABASE_ERROR",
  },
  // ... 其他映射
};
```

### 2. 错误处理器配置

```typescript
// 配置增强的错误处理器
const errorHandler = new EnhancedErrorHandlerService({
  enableLogging: true,
  enableMonitoring: true,
  logLevel: "info",
  monitoringEndpoint: "https://monitoring.example.com"
});
```

## 📊 异常分类

### 1. 按错误类型分类

| 错误类型 | 异常类 | HTTP状态码 | 错误代码 | 描述 |
|---------|--------|-----------|----------|------|
| DATABASE | SystemInternalException | 500 | INFRA_DATABASE_ERROR | 数据库操作错误 |
| CACHE | SystemInternalException | 500 | INFRA_CACHE_ERROR | 缓存操作错误 |
| NETWORK | ExternalServiceUnavailableException | 503 | INFRA_NETWORK_ERROR | 网络连接错误 |
| ISOLATION | InfrastructureLayerException | 403 | INFRA_ISOLATION_ERROR | 数据隔离违规 |
| SYSTEM | SystemInternalException | 500 | INFRA_SYSTEM_ERROR | 系统内部错误 |
| INTEGRATION | IntegrationServiceException | 502 | INFRA_INTEGRATION_ERROR | 集成服务错误 |
| VALIDATION | GeneralBadRequestException | 400 | INFRA_VALIDATION_ERROR | 数据验证失败 |
| UNKNOWN | GeneralInternalServerException | 500 | INFRA_UNKNOWN_ERROR | 未知基础设施错误 |

### 2. 按严重级别分类

| 严重级别 | 描述 | 处理策略 |
|---------|------|----------|
| CRITICAL | 严重错误，系统无法继续运行 | 立即停止服务，发送告警 |
| HIGH | 高优先级错误，影响核心功能 | 记录错误，尝试恢复 |
| MEDIUM | 中等优先级错误，影响部分功能 | 记录错误，继续运行 |
| LOW | 低优先级错误，不影响核心功能 | 记录日志，正常处理 |

## 🧪 测试

### 1. 单元测试

```typescript
// 测试异常转换器
describe("InfrastructureExceptionConverter", () => {
  it("should convert database errors to standardized exceptions", () => {
    const originalError = new Error("Database connection failed");
    const standardException = InfrastructureExceptionConverter.convertToStandardException(
      originalError,
      "DATABASE",
      { operation: "getConnection" }
    );
    
    expect(standardException).toBeInstanceOf(SystemInternalException);
    expect(standardException.errorCode).toBe("INFRA_DATABASE_ERROR");
  });
});
```

### 2. 集成测试

```typescript
// 测试服务集成
describe("DatabaseService Integration", () => {
  it("should throw standardized exceptions for connection failures", async () => {
    const dbService = new DatabaseService(mockConnectionManager);
    
    await expect(dbService.getConnection("test-db"))
      .rejects.toThrow(SystemInternalException);
  });
});
```

### 3. 运行测试

```bash
# 运行所有测试
npm test

# 运行集成测试
npm run test:integration

# 运行测试覆盖率
npm run test:cov
```

## 📈 监控和日志

### 1. 日志记录

```typescript
// 自动日志记录
const result = await enhancedErrorHandler.handleError(error, context);

// 日志包含以下信息：
// - 错误代码
// - 错误消息
// - 上下文数据
// - 堆栈跟踪
// - 时间戳
```

### 2. 监控集成

```typescript
// 监控数据格式
const monitoringData = {
  errorCode: "INFRA_DATABASE_ERROR",
  message: "数据库连接失败",
  detail: "数据库连接失败: Connection timeout",
  status: 500,
  timestamp: "2025-01-27T10:30:00.000Z",
  context: {
    operation: "getConnection",
    connectionName: "test-db"
  },
  tags: {
    layer: "infrastructure",
    severity: "CRITICAL"
  }
};
```

## 🔄 迁移指南

### 1. 从原生 Error 迁移

```typescript
// 之前的代码
try {
  await databaseOperation();
} catch (error) {
  throw new Error(`操作失败: ${error.message}`);
}

// 迁移后的代码
try {
  await databaseOperation();
} catch (error) {
  const standardError = error instanceof Error ? error : new Error(String(error));
  throw InfrastructureExceptionConverter.convertToStandardException(
    standardError,
    "DATABASE",
    { operation: "databaseOperation" }
  );
}
```

### 2. 错误处理器迁移

```typescript
// 之前的代码
const errorHandler = new ErrorHandlerService();

// 迁移后的代码
const errorHandler = new EnhancedErrorHandlerService();
```

### 3. 批量迁移

```typescript
// 批量转换错误处理
const errors = await Promise.allSettled(operations.map(op => op.execute()));
const failedOperations = errors
  .filter(result => result.status === 'rejected')
  .map(result => result.reason);

if (failedOperations.length > 0) {
  const batchResults = await enhancedErrorHandler.handleBatchErrors(
    failedOperations.map(error => ({ error }))
  );
}
```

## 🎯 最佳实践

### 1. 错误处理策略

```typescript
// 1. 使用适当的错误类型
const errorType = InfrastructureExceptionConverter.inferErrorType(error);

// 2. 提供丰富的上下文信息
const context = {
  operation: "user_creation",
  userId: user.id,
  tenantId: tenant.id,
  timestamp: new Date().toISOString()
};

// 3. 记录详细的错误信息
const standardException = InfrastructureExceptionConverter.convertToStandardException(
  error,
  errorType,
  context
);
```

### 2. 性能优化

```typescript
// 1. 缓存异常转换器
const converter = InfrastructureExceptionConverter;

// 2. 批量处理错误
const results = await enhancedErrorHandler.handleBatchErrors(errors);

// 3. 异步错误处理
setImmediate(() => {
  enhancedErrorHandler.handleError(error, context);
});
```

### 3. 安全考虑

```typescript
// 1. 不暴露敏感信息
const sanitizedContext = {
  operation: context.operation,
  // 不包含密码、令牌等敏感信息
};

// 2. 生产环境限制错误详情
const isProduction = process.env.NODE_ENV === 'production';
const errorDetail = isProduction ? "内部服务器错误" : error.message;
```

## 🔍 故障排除

### 1. 常见问题

#### 问题：异常转换失败

```typescript
// 解决方案：检查错误类型
const errorType = InfrastructureExceptionConverter.inferErrorType(error);
if (!errorType) {
  console.warn("无法推断错误类型，使用默认处理");
}
```

#### 问题：上下文数据丢失

```typescript
// 解决方案：确保上下文数据完整性
const context = {
  ...baseContext,
  operation: "specific_operation",
  timestamp: new Date().toISOString()
};
```

### 2. 调试技巧

```typescript
// 1. 启用详细日志
const errorHandler = new EnhancedErrorHandlerService({
  enableLogging: true,
  logLevel: "debug"
});

// 2. 检查异常堆栈
console.log("Exception stack:", exception.data.stack);

// 3. 验证 RFC7807 格式
const rfc7807Response = exception.toRFC7807();
console.log("RFC7807 response:", JSON.stringify(rfc7807Response, null, 2));
```

## 📚 参考资源

### 1. 相关文档

- [libs/exceptions 文档](../../exceptions/docs/)
- [RFC7807 标准](https://tools.ietf.org/html/rfc7807)
- [NestJS 异常处理](https://docs.nestjs.com/exception-filters)

### 2. 示例代码

- [异常转换示例](./examples/exception-conversion.example.ts)
- [错误处理示例](./examples/error-handling.example.ts)
- [集成测试示例](./tests/integration/exception-integration.spec.ts)

### 3. 工具和库

- [异常监控工具](./tools/exception-monitor.ts)
- [错误分析工具](./tools/error-analyzer.ts)
- [性能测试工具](./tools/performance-test.ts)

## 🎉 总结

通过集成 `libs/exceptions`，`libs/infrastructure-kernel` 现在提供了：

1. **标准化的异常处理**: 统一的错误响应格式
2. **类型安全**: 强类型的异常系统
3. **RFC7807 合规**: 标准化的 HTTP 错误响应
4. **增强的监控**: 详细的错误日志和监控数据
5. **向后兼容**: 保持现有 API 的兼容性

这个集成显著提升了代码质量、开发体验和系统可靠性，为整个 SAAS 平台提供了坚实的异常处理基础。
