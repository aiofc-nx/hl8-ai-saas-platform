# libs/infrastructure-kernel 异常处理集成最佳实践

## 📋 概述

本文档详细说明如何结合当前的异常处理系统来改进 `libs/infrastructure-kernel` 的错误处理，提供完整的集成方案和最佳实践。

## 🎯 集成目标

### 主要目标

- **统一异常处理**: 将基础设施层的所有错误统一转换为标准化异常
- **RFC7807 合规**: 确保所有错误响应符合 RFC7807 标准
- **类型安全**: 提供强类型的异常处理系统
- **监控集成**: 支持错误监控和统计
- **向后兼容**: 保持现有 API 的兼容性

## 🚀 核心组件

### 1. InfrastructureExceptionConverter

**功能**: 将基础设施层错误转换为标准化异常

```typescript
import { InfrastructureExceptionConverter } from "./exceptions/infrastructure-exception.mapping.js";

// 自动推断错误类型并转换
const standardException =
  InfrastructureExceptionConverter.convertToStandardException(
    error,
    "DATABASE",
    { operation: "getConnection", connectionName: "test-db" },
  );

// 手动指定错误类型
const networkException =
  InfrastructureExceptionConverter.convertToStandardException(
    error,
    "NETWORK",
    { endpoint: "https://api.example.com" },
  );
```

### 2. EnhancedErrorHandlerService

**功能**: 增强的错误处理器，集成标准化异常系统

```typescript
import { EnhancedErrorHandlerService } from "./services/error-handling/enhanced-error-handler.service.js";

const errorHandler = new EnhancedErrorHandlerService();

// 处理单个错误
const result = await errorHandler.handleError(error, {
  operation: "database_query",
  context: "user_management",
});

// 处理基础设施层特定错误
const result = await errorHandler.handleInfrastructureError(error, "DATABASE", {
  connectionName: "test-db",
});

// 批量处理错误
const results = await errorHandler.handleBatchErrors([
  { error: dbError, type: "DATABASE" },
  { error: cacheError, type: "CACHE" },
  { error: networkError, type: "NETWORK" },
]);
```

## 🔧 集成方案

### 方案 1: 直接替换原生错误

**适用场景**: 新代码或可以完全重构的代码

```typescript
// 之前的代码
try {
  await databaseOperation();
} catch (error) {
  throw new Error(`数据库操作失败: ${error.message}`);
}

// 集成后的代码
import { InfrastructureExceptionConverter } from "./exceptions/infrastructure-exception.mapping.js";

try {
  await databaseOperation();
} catch (error) {
  const standardError =
    error instanceof Error ? error : new Error(String(error));
  throw InfrastructureExceptionConverter.convertToStandardException(
    standardError,
    "DATABASE",
    { operation: "databaseOperation" },
  );
}
```

### 方案 2: 使用增强的错误处理器

**适用场景**: 需要统一错误处理逻辑的服务

```typescript
import { EnhancedErrorHandlerService } from "./services/error-handling/enhanced-error-handler.service.js";

@Injectable()
export class DatabaseService {
  constructor(
    private readonly connectionManager: IDatabaseConnectionManager,
    private readonly errorHandler: EnhancedErrorHandlerService,
  ) {}

  async getConnection(name: string): Promise<IDatabaseAdapter> {
    try {
      return await this.connectionManager.getConnection(name);
    } catch (error) {
      const standardError =
        error instanceof Error ? error : new Error(String(error));

      // 使用增强的错误处理器
      const result = await this.errorHandler.handleInfrastructureError(
        standardError,
        "DATABASE",
        { operation: "getConnection", connectionName: name },
      );

      // 如果错误处理器无法处理，抛出标准化异常
      if (!result.handled) {
        throw InfrastructureExceptionConverter.convertToStandardException(
          standardError,
          "DATABASE",
          { operation: "getConnection", connectionName: name },
        );
      }

      throw result.error;
    }
  }
}
```

### 方案 3: 中间件模式

**适用场景**: 需要在多个服务中统一应用错误处理

```typescript
import { Injectable } from "@nestjs/common";
import { InfrastructureExceptionConverter } from "./exceptions/infrastructure-exception.mapping.js";

@Injectable()
export class ExceptionHandlingMiddleware {
  /**
   * 包装异步操作，自动处理异常
   */
  async wrapInfrastructureOperation<T>(
    operation: () => Promise<T>,
    errorType: InfrastructureErrorType,
    context?: Record<string, unknown>,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const standardError =
        error instanceof Error ? error : new Error(String(error));
      throw InfrastructureExceptionConverter.convertToStandardException(
        standardError,
        errorType,
        context,
      );
    }
  }

  /**
   * 包装同步操作，自动处理异常
   */
  wrapInfrastructureSyncOperation<T>(
    operation: () => T,
    errorType: InfrastructureErrorType,
    context?: Record<string, unknown>,
  ): T {
    try {
      return operation();
    } catch (error) {
      const standardError =
        error instanceof Error ? error : new Error(String(error));
      throw InfrastructureExceptionConverter.convertToStandardException(
        standardError,
        errorType,
        context,
      );
    }
  }
}

// 使用示例
@Injectable()
export class CacheService {
  constructor(private readonly middleware: ExceptionHandlingMiddleware) {}

  async get<T>(key: string): Promise<T | null> {
    return await this.middleware.wrapInfrastructureOperation(
      async () => {
        // 缓存操作逻辑
        return await this.cacheClient.get(key);
      },
      "CACHE",
      { operation: "get", cacheKey: key },
    );
  }

  set<T>(key: string, value: T): void {
    this.middleware.wrapInfrastructureSyncOperation(
      () => {
        // 缓存设置逻辑
        this.cacheClient.set(key, value);
      },
      "CACHE",
      { operation: "set", cacheKey: key },
    );
  }
}
```

### 方案 4: 装饰器模式

**适用场景**: 需要为现有方法添加异常处理功能

```typescript
import {
  InfrastructureExceptionConverter,
  InfrastructureErrorType,
} from "./exceptions/infrastructure-exception.mapping.js";

/**
 * 基础设施异常处理装饰器
 */
export function HandleInfrastructureException(
  errorType: InfrastructureErrorType,
  contextProvider?: (args: any[]) => Record<string, unknown>,
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        const standardError =
          error instanceof Error ? error : new Error(String(error));
        const context = contextProvider ? contextProvider(args) : {};

        throw InfrastructureExceptionConverter.convertToStandardException(
          standardError,
          errorType,
          context,
        );
      }
    };

    return descriptor;
  };
}

// 使用示例
@Injectable()
export class DatabaseService {
  @HandleInfrastructureException("DATABASE", (args) => ({
    operation: "getConnection",
    connectionName: args[0],
  }))
  async getConnection(name: string): Promise<IDatabaseAdapter> {
    return await this.connectionManager.getConnection(name);
  }

  @HandleInfrastructureException("DATABASE", (args) => ({
    operation: "createConnection",
    connectionName: args[0],
  }))
  async createConnection(name: string, config: any): Promise<IDatabaseAdapter> {
    return await this.connectionManager.createConnection(name, config);
  }
}
```

## 📊 错误类型映射策略

### 数据库错误

```typescript
// 连接错误
const connectionError =
  InfrastructureExceptionConverter.convertToStandardException(
    error,
    "DATABASE",
    { operation: "connect", connectionName: "main-db" },
  );

// 查询错误
const queryError = InfrastructureExceptionConverter.convertToStandardException(
  error,
  "DATABASE",
  { operation: "query", sql: "SELECT * FROM users", table: "users" },
);

// 事务错误
const transactionError =
  InfrastructureExceptionConverter.convertToStandardException(
    error,
    "DATABASE",
    { operation: "transaction", transactionId: "tx-123" },
  );
```

### 缓存错误

```typescript
// Redis 连接错误
const redisError = InfrastructureExceptionConverter.convertToStandardException(
  error,
  "CACHE",
  { operation: "connect", cacheType: "redis", host: "localhost:6379" },
);

// 缓存操作错误
const cacheError = InfrastructureExceptionConverter.convertToStandardException(
  error,
  "CACHE",
  { operation: "get", cacheKey: "user:123", cacheType: "redis" },
);
```

### 网络错误

```typescript
// HTTP 请求错误
const httpError = InfrastructureExceptionConverter.convertToStandardException(
  error,
  "NETWORK",
  {
    operation: "http_request",
    endpoint: "https://api.example.com",
    method: "POST",
  },
);

// 超时错误
const timeoutError =
  InfrastructureExceptionConverter.convertToStandardException(
    error,
    "NETWORK",
    {
      operation: "timeout",
      endpoint: "https://api.example.com",
      timeout: 5000,
    },
  );
```

### 隔离错误

```typescript
// 租户隔离违规
const isolationError =
  InfrastructureExceptionConverter.convertToStandardException(
    error,
    "ISOLATION",
    {
      operation: "tenant_access",
      tenantId: "tenant-123",
      resource: "user-data",
    },
  );

// 数据隔离违规
const dataIsolationError =
  InfrastructureExceptionConverter.convertToStandardException(
    error,
    "ISOLATION",
    { operation: "data_access", tenantId: "tenant-123", table: "users" },
  );
```

## 🔍 监控和日志集成

### 错误统计

```typescript
// 获取错误统计信息
const stats = await errorHandler.getErrorStatistics();
console.log("错误统计:", {
  总错误数: stats.totalErrors,
  按类型分布: stats.errorsByType,
  按严重级别分布: stats.errorsBySeverity,
  最近错误: stats.recentErrors,
});
```

### 监控数据格式

```typescript
const monitoringData = {
  errorCode: "INFRA_DATABASE_ERROR",
  message: "数据库连接失败",
  detail: "数据库连接失败: Connection timeout",
  status: 500,
  timestamp: "2025-01-27T10:30:00.000Z",
  context: {
    operation: "getConnection",
    connectionName: "test-db",
    tenantId: "tenant-123",
  },
  tags: {
    layer: "infrastructure",
    severity: "CRITICAL",
    service: "database",
    environment: "production",
  },
};
```

## 🧪 测试策略

### 单元测试

```typescript
describe("DatabaseService Exception Handling", () => {
  it("should throw standardized exceptions for connection failures", async () => {
    const mockConnectionManager = {
      getConnection: jest
        .fn()
        .mockRejectedValue(new Error("Connection failed")),
    };

    const dbService = new DatabaseService(mockConnectionManager);

    await expect(dbService.getConnection("test-db")).rejects.toThrow(
      GeneralInternalServerException,
    );
  });

  it("should include proper context in exceptions", async () => {
    const mockConnectionManager = {
      getConnection: jest
        .fn()
        .mockRejectedValue(new Error("Connection failed")),
    };

    const dbService = new DatabaseService(mockConnectionManager);

    try {
      await dbService.getConnection("test-db");
    } catch (error) {
      expect(error.data.operation).toBe("getConnection");
      expect(error.data.connectionName).toBe("test-db");
    }
  });
});
```

### 集成测试

```typescript
describe("Exception Integration", () => {
  it("should handle batch errors correctly", async () => {
    const errors = [
      { error: new Error("Database error"), type: "DATABASE" as const },
      { error: new Error("Cache error"), type: "CACHE" as const },
      { error: new Error("Network error"), type: "NETWORK" as const },
    ];

    const results = await errorHandler.handleBatchErrors(errors);

    expect(results).toHaveLength(3);
    expect(results[0].error).toBeInstanceOf(GeneralInternalServerException);
    expect(results[1].error).toBeInstanceOf(GeneralInternalServerException);
    expect(results[2].error).toBeInstanceOf(
      ExternalServiceUnavailableException,
    );
  });
});
```

## 📈 性能优化

### 1. 异常转换缓存

```typescript
class CachedExceptionConverter {
  private static conversionCache = new Map<
    string,
    InfrastructureLayerException
  >();

  static convertToStandardException(
    error: Error,
    errorType: InfrastructureErrorType,
    context?: Record<string, unknown>,
  ): InfrastructureLayerException {
    const cacheKey = `${error.message}:${errorType}:${JSON.stringify(context)}`;

    if (this.conversionCache.has(cacheKey)) {
      return this.conversionCache.get(cacheKey)!;
    }

    const standardException =
      InfrastructureExceptionConverter.convertToStandardException(
        error,
        errorType,
        context,
      );

    this.conversionCache.set(cacheKey, standardException);
    return standardException;
  }
}
```

### 2. 异步错误处理

```typescript
// 使用 setImmediate 避免阻塞主线程
const handleErrorAsync = (error: Error, context: Record<string, unknown>) => {
  setImmediate(() => {
    errorHandler.handleError(error, context);
  });
};
```

### 3. 错误处理性能监控

```typescript
const performanceMonitor = {
  async measureErrorHandling<T>(
    operation: () => Promise<T>,
    errorType: InfrastructureErrorType,
  ): Promise<T> {
    const startTime = performance.now();

    try {
      const result = await operation();
      const endTime = performance.now();

      console.log(`操作成功，耗时: ${endTime - startTime}ms`);
      return result;
    } catch (error) {
      const endTime = performance.now();
      const handlingTime = endTime - startTime;

      console.log(`操作失败，处理耗时: ${handlingTime}ms`);

      const standardException =
        InfrastructureExceptionConverter.convertToStandardException(
          error as Error,
          errorType,
          { handlingTime },
        );

      throw standardException;
    }
  },
};
```

## 🎯 最佳实践总结

### 1. 错误处理原则

- **尽早捕获**: 在错误发生的地方立即捕获并转换
- **保持上下文**: 始终提供足够的上下文信息
- **统一格式**: 使用统一的异常格式和错误代码
- **适当记录**: 记录错误但不暴露敏感信息

### 2. 性能考虑

- **避免过度转换**: 只在必要时进行异常转换
- **异步处理**: 使用异步方式处理错误，避免阻塞主线程
- **缓存机制**: 对频繁出现的错误使用缓存机制

### 3. 监控和调试

- **错误统计**: 定期收集和分析错误统计信息
- **性能监控**: 监控错误处理的性能影响
- **日志记录**: 记录详细的错误日志用于调试

### 4. 测试策略

- **全面测试**: 测试各种错误场景和异常类型
- **集成测试**: 确保异常处理在整个系统中的正确性
- **性能测试**: 验证错误处理的性能影响

通过遵循这些最佳实践，您可以有效地将当前的异常处理系统集成到 `libs/infrastructure-kernel` 中，实现统一、标准化、高性能的错误处理机制。
