# 异常处理集成总结

## 📋 概述

本文档总结了如何将当前的异常处理系统集成到 `libs/infrastructure-kernel` 中，提供了完整的集成方案和实现指南。

## 🎯 集成目标

### 主要目标

- **统一异常处理**: 将基础设施层的所有错误统一转换为标准化异常
- **RFC7807 合规**: 确保所有错误响应符合 RFC7807 标准
- **类型安全**: 提供强类型的异常处理系统
- **监控集成**: 支持错误监控和统计
- **向后兼容**: 保持现有 API 的兼容性

## 🚀 集成方案

### 方案 1: 直接异常转换（推荐用于新代码）

**适用场景**: 新开发的代码或可以完全重构的代码

```typescript
import { InfrastructureExceptionConverter } from "@hl8/infrastructure-kernel";

// 之前的代码
try {
  await databaseOperation();
} catch (error) {
  throw new Error(`数据库操作失败: ${error.message}`);
}

// 集成后的代码
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

### 方案 2: 使用装饰器（推荐用于服务方法）

**适用场景**: 需要为现有方法添加异常处理功能

```typescript
import { HandleInfrastructureException } from "@hl8/infrastructure-kernel";

@Injectable()
export class DatabaseService {
  @HandleInfrastructureException({
    errorType: "DATABASE",
    contextProvider: (args) => ({
      operation: "getConnection",
      connectionName: args[0],
    }),
    logError: true,
    retryable: true,
    maxRetries: 3,
  })
  async getConnection(name: string): Promise<IDatabaseAdapter> {
    return await this.connectionManager.getConnection(name);
  }
}
```

### 方案 3: 使用中间件（推荐用于批量操作）

**适用场景**: 需要在多个服务中统一应用错误处理

```typescript
import { ExceptionHandlingMiddleware } from "@hl8/infrastructure-kernel";

@Injectable()
export class CacheService {
  constructor(private readonly middleware: ExceptionHandlingMiddleware) {}

  async get<T>(key: string): Promise<T | null> {
    return await this.middleware.wrapInfrastructureOperation(
      async () => {
        return await this.cacheClient.get(key);
      },
      "CACHE",
      { operation: "get", cacheKey: key },
    );
  }
}
```

### 方案 4: 使用增强错误处理器（推荐用于复杂场景）

**适用场景**: 需要统一错误处理逻辑的服务

```typescript
import { EnhancedErrorHandlerService } from "@hl8/infrastructure-kernel";

@Injectable()
export class NetworkService {
  constructor(private readonly errorHandler: EnhancedErrorHandlerService) {}

  async makeHttpRequest(url: string): Promise<any> {
    try {
      return await this.httpClient.get(url);
    } catch (error) {
      const result = await this.errorHandler.handleInfrastructureError(
        error as Error,
        "NETWORK",
        { operation: "httpRequest", url },
      );
      throw result.error;
    }
  }
}
```

## 🔧 具体实现步骤

### 步骤 1: 安装依赖

```bash
cd libs/infrastructure-kernel
pnpm install @hl8/exceptions
```

### 步骤 2: 选择集成方案

根据您的具体需求选择上述方案之一：

- **新代码**: 使用方案 1（直接异常转换）
- **现有服务方法**: 使用方案 2（装饰器）
- **批量操作**: 使用方案 3（中间件）
- **复杂错误处理**: 使用方案 4（增强错误处理器）

### 步骤 3: 更新服务类

以数据库服务为例：

```typescript
// 之前的 DatabaseService
@Injectable()
export class DatabaseService {
  constructor(private readonly connectionManager: IDatabaseConnectionManager) {}

  async getConnection(name: string): Promise<IDatabaseAdapter> {
    try {
      return await this.connectionManager.getConnection(name);
    } catch (error) {
      throw new Error(`获取数据库连接失败: ${error.message}`);
    }
  }
}

// 集成后的 DatabaseService
@Injectable()
export class DatabaseService {
  constructor(
    private readonly connectionManager: IDatabaseConnectionManager,
    private readonly middleware: ExceptionHandlingMiddleware,
  ) {}

  async getConnection(name: string): Promise<IDatabaseAdapter> {
    return await this.middleware.wrapInfrastructureOperation(
      async () => {
        return await this.connectionManager.getConnection(name);
      },
      "DATABASE",
      { operation: "getConnection", connectionName: name },
    );
  }
}
```

### 步骤 4: 配置异常处理

```typescript
import { ExceptionHandlerManager } from "@hl8/infrastructure-kernel";

// 配置异常处理管理器
const exceptionManager = new ExceptionHandlerManager({
  enableLogging: true,
  logLevel: "info",
  enableMonitoring: true,
  monitoringEndpoint: "https://monitoring.example.com",
  defaultMaxRetries: 3,
  defaultRetryDelay: 1000,
});
```

### 步骤 5: 添加测试

```typescript
describe("DatabaseService Exception Handling", () => {
  it("should throw standardized exceptions for connection failures", async () => {
    const mockConnectionManager = {
      getConnection: jest
        .fn()
        .mockRejectedValue(new Error("Connection failed")),
    };

    const middleware = new ExceptionHandlingMiddleware();
    const dbService = new DatabaseService(mockConnectionManager, middleware);

    await expect(dbService.getConnection("test-db")).rejects.toThrow(
      GeneralInternalServerException,
    );
  });
});
```

## 📊 错误类型映射

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

## 🔍 监控和日志

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

## 🎯 最佳实践

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

## 🔄 迁移指南

### 从原生 Error 迁移

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
  const standardError =
    error instanceof Error ? error : new Error(String(error));
  throw InfrastructureExceptionConverter.convertToStandardException(
    standardError,
    "DATABASE",
    { operation: "databaseOperation" },
  );
}
```

### 批量迁移

```typescript
// 批量转换错误处理
const errors = await Promise.allSettled(operations.map((op) => op.execute()));
const failedOperations = errors
  .filter((result) => result.status === "rejected")
  .map((result) => result.reason);

if (failedOperations.length > 0) {
  const batchResults = await enhancedErrorHandler.handleBatchErrors(
    failedOperations.map((error) => ({ error })),
  );
}
```

## 📚 参考资源

### 相关文档

- [异常处理集成指南](./EXCEPTION_INTEGRATION_GUIDE.md)
- [异常处理最佳实践](./EXCEPTION_INTEGRATION_BEST_PRACTICES.md)
- [libs/exceptions 文档](../../exceptions/docs/)

### 示例代码

- [异常处理示例](../examples/exception-integration.example.ts)
- [集成测试示例](../src/tests/integration/exception-integration.spec.ts)

通过遵循这些指南和最佳实践，您可以有效地将当前的异常处理系统集成到 `libs/infrastructure-kernel` 中，实现统一、标准化、高性能的错误处理机制。

## 🔧 技术实现细节

### 异常转换器配置

```typescript
// 配置异常转换器
const converterConfig = {
  enableCaching: true,
  cacheSize: 1000,
  enableLogging: true,
  logLevel: "info",
  enableMonitoring: true,
  monitoringEndpoint: "https://monitoring.example.com",
};
```

### 错误处理器配置

```typescript
// 配置错误处理器
const handlerConfig = {
  enableRetry: true,
  maxRetries: 3,
  retryDelay: 1000,
  enableCircuitBreaker: true,
  circuitBreakerThreshold: 5,
  circuitBreakerTimeout: 30000,
};
```

### 中间件配置

```typescript
// 配置异常处理中间件
const middlewareConfig = {
  enableRequestLogging: true,
  enableResponseLogging: true,
  enableErrorLogging: true,
  logLevel: "info",
  enablePerformanceMonitoring: true,
};
```

## 🚀 部署和运维

### 环境变量配置

```bash
# 异常处理配置
EXCEPTION_HANDLING_ENABLED=true
EXCEPTION_LOGGING_ENABLED=true
EXCEPTION_MONITORING_ENABLED=true
EXCEPTION_CACHING_ENABLED=true

# 监控配置
MONITORING_ENDPOINT=https://monitoring.example.com
MONITORING_API_KEY=your-api-key
MONITORING_ENVIRONMENT=production

# 日志配置
LOG_LEVEL=info
LOG_FORMAT=json
LOG_OUTPUT=console,file
```

### 健康检查

```typescript
// 异常处理健康检查
@Injectable()
export class ExceptionHandlingHealthCheck {
  constructor(private readonly errorHandler: EnhancedErrorHandlerService) {}

  async checkHealth(): Promise<HealthCheckResult> {
    try {
      const stats = await this.errorHandler.getErrorStatistics();
      return {
        status: "healthy",
        details: {
          totalErrors: stats.totalErrors,
          errorsByType: stats.errorsByType,
          errorsBySeverity: stats.errorsBySeverity,
        },
      };
    } catch (error) {
      return {
        status: "unhealthy",
        details: { error: error.message },
      };
    }
  }
}
```

## 📊 监控和告警

### 错误率监控

```typescript
// 错误率监控
const errorRateMonitor = {
  threshold: 0.05, // 5% 错误率阈值
  windowSize: 300000, // 5分钟窗口
  alertChannels: ["email", "slack", "webhook"],
  alertRecipients: ["dev-team@example.com", "ops-team@example.com"],
};
```

### 性能监控

```typescript
// 性能监控
const performanceMonitor = {
  responseTimeThreshold: 1000, // 1秒响应时间阈值
  throughputThreshold: 1000, // 每秒1000个请求阈值
  memoryThreshold: 0.8, // 80% 内存使用率阈值
  cpuThreshold: 0.8, // 80% CPU使用率阈值
};
```

通过这个完整的集成方案，您可以有效地将当前的异常处理系统集成到 `libs/infrastructure-kernel` 中，实现统一、标准化、高性能的错误处理机制。这个方案提供了多种集成方式，可以根据具体需求选择最适合的方案，并提供了完整的测试、监控和运维支持。
