/**
 * 异常处理集成示例
 *
 * @description 展示如何在 libs/infrastructure-kernel 中使用异常处理系统
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import {
  InfrastructureExceptionConverter,
  InfrastructureErrorType,
  EnhancedErrorHandlerService,
  HandleInfrastructureException,
  ExceptionHandlingMiddleware,
  ExceptionHandlerUtils,
  ExceptionHandlerManager,
} from "../src/index.js";

// ==================== 示例 1: 基础异常转换 ====================

/**
 * 基础异常转换示例
 */
export class BasicExceptionConversionExample {
  async demonstrateBasicConversion() {
    try {
      // 模拟数据库连接失败
      throw new Error("Database connection failed");
    } catch (error) {
      // 转换为标准化异常
      const standardException = InfrastructureExceptionConverter.convertToStandardException(
        error as Error,
        "DATABASE",
        { operation: "connect", connectionName: "main-db" }
      );

      console.log("标准化异常:", {
        errorCode: standardException.errorCode,
        message: standardException.message,
        detail: standardException.detail,
        status: standardException.getStatus(),
        data: standardException.data,
      });
    }
  }
}

// ==================== 示例 2: 使用装饰器 ====================

/**
 * 使用装饰器的服务示例
 */
@Injectable()
export class DatabaseServiceExample {
  @HandleInfrastructureException({
    errorType: "DATABASE",
    contextProvider: (args) => ({ 
      operation: "getConnection", 
      connectionName: args[0] 
    }),
    logError: true,
    retryable: true,
    maxRetries: 3,
  })
  async getConnection(name: string): Promise<any> {
    // 模拟数据库连接
    if (Math.random() > 0.5) {
      throw new Error("Connection timeout");
    }
    return { name, connected: true };
  }

  @HandleInfrastructureException({
    errorType: "DATABASE",
    contextProvider: (args) => ({ 
      operation: "query", 
      sql: args[0],
      table: args[1] 
    }),
  })
  async executeQuery(sql: string, table: string): Promise<Record<string, unknown>[]> {
    // 模拟查询执行
    if (Math.random() > 0.7) {
      throw new Error("Query execution failed");
    }
    return [{ id: 1, name: "example" }];
  }
}

// ==================== 示例 3: 使用中间件 ====================

/**
 * 使用中间件的服务示例
 */
@Injectable()
export class CacheServiceExample {
  constructor(private readonly middleware: ExceptionHandlingMiddleware) {}

  async get<T>(key: string): Promise<T | null> {
    return await this.middleware.wrapInfrastructureOperation(
      async () => {
        // 模拟缓存获取
        if (Math.random() > 0.6) {
          throw new Error("Cache miss");
        }
        return { value: "cached-data" } as T;
      },
      "CACHE",
      { operation: "get", cacheKey: key },
    );
  }

  set<T>(key: string, value: T): void {
    this.middleware.wrapInfrastructureSyncOperation(
      () => {
        // 模拟缓存设置
        if (Math.random() > 0.8) {
          throw new Error("Cache set failed");
        }
        console.log(`Cache set: ${key} = ${value}`);
      },
      "CACHE",
      { operation: "set", cacheKey: key },
    );
  }

  async safeGet<T>(key: string): Promise<T | null> {
    const result = await this.middleware.wrapInfrastructureOperationSafe(
      async () => {
        // 模拟缓存获取
        if (Math.random() > 0.6) {
          throw new Error("Cache miss");
        }
        return { value: "cached-data" } as T;
      },
      "CACHE",
      { operation: "safeGet", cacheKey: key },
    );

    if (result.success) {
      return result.data!;
    } else {
      console.error("缓存获取失败:", result.error?.message);
      return null;
    }
  }
}

// ==================== 示例 4: 使用增强错误处理器 ====================

/**
 * 使用增强错误处理器的服务示例
 */
@Injectable()
export class NetworkServiceExample {
  constructor(private readonly errorHandler: EnhancedErrorHandlerService) {}

  async makeHttpRequest(url: string): Promise<any> {
    try {
      // 模拟 HTTP 请求
      if (Math.random() > 0.5) {
        throw new Error("Network timeout");
      }
      return { status: 200, data: "success" };
    } catch (error) {
      // 使用增强错误处理器
      const result = await this.errorHandler.handleInfrastructureError(
        error as Error,
        "NETWORK",
        { operation: "httpRequest", url }
      );

      if (result.handled) {
        console.log("错误已处理:", result);
      }

      throw result.error;
    }
  }

  async batchRequests(urls: string[]): Promise<Record<string, unknown>[]> {
    const errors = urls.map(url => ({
      error: new Error(`Request failed for ${url}`),
      type: "NETWORK" as InfrastructureErrorType,
      context: { url },
    }));

    const results = await this.errorHandler.handleBatchErrors(errors);
    
    return results.map(result => ({
      success: result.handled,
      error: result.error?.message,
    }));
  }
}

// ==================== 示例 5: 使用工具函数 ====================

/**
 * 使用工具函数的示例
 */
export class UtilityFunctionsExample {
  async demonstrateUtilities() {
    // 安全执行操作
    const result = await ExceptionHandlerUtils.safeExecute(
      async () => {
        // 模拟可能失败的操作
        if (Math.random() > 0.5) {
          throw new Error("Operation failed");
        }
        return "success";
      },
      "SYSTEM",
      { operation: "demo" }
    );

    console.log("安全执行结果:", result);

    // 重试执行操作
    try {
      const retryResult = await ExceptionHandlerUtils.retryExecute(
        async () => {
          // 模拟不稳定的操作
          if (Math.random() > 0.3) {
            throw new Error("Temporary failure");
          }
          return "retry success";
        },
        "NETWORK",
        3,
        1000,
        { operation: "retryDemo" }
      );

      console.log("重试执行结果:", retryResult);
    } catch (error) {
      console.error("重试失败:", error);
    }

    // 批量执行操作
    const operations = [
      async () => "operation1",
      async () => "operation2",
      async () => {
        throw new Error("operation3 failed");
      },
    ];

    const batchResults = await ExceptionHandlerUtils.batchExecute(
      operations,
      "SYSTEM",
      { batchId: "demo-batch" }
    );

    console.log("批量执行结果:", batchResults);

    // 并行执行操作
    const parallelResults = await ExceptionHandlerUtils.parallelExecute(
      operations,
      "SYSTEM",
      { parallelId: "demo-parallel" }
    );

    console.log("并行执行结果:", parallelResults);
  }
}

// ==================== 示例 6: 使用异常处理管理器 ====================

/**
 * 使用异常处理管理器的示例
 */
export class ExceptionManagerExample {
  private manager: ExceptionHandlerManager;

  constructor() {
    this.manager = new ExceptionHandlerManager({
      enableLogging: true,
      logLevel: "info",
      enableMonitoring: true,
      monitoringEndpoint: "https://monitoring.example.com",
      defaultMaxRetries: 3,
      defaultRetryDelay: 1000,
    });
  }

  async demonstrateManager() {
    try {
      // 模拟一个错误
      throw new Error("Manager demo error");
    } catch (error) {
      // 记录错误
      this.manager.logError(error as Error, { 
        operation: "demo",
        timestamp: new Date().toISOString() 
      });

      // 发送到监控系统
      await this.manager.sendToMonitoring(error as Error, {
        operation: "demo",
        severity: "MEDIUM",
      });

      // 获取配置
      const config = this.manager.getConfig();
      console.log("异常处理配置:", config);
    }
  }
}

// ==================== 示例 7: 综合使用示例 ====================

/**
 * 综合使用示例
 */
@Injectable()
export class ComprehensiveExample {
  constructor(
    private readonly errorHandler: EnhancedErrorHandlerService,
    private readonly middleware: ExceptionHandlingMiddleware,
  ) {}

  async demonstrateComprehensiveUsage() {
    console.log("=== 综合异常处理示例 ===");

    // 1. 数据库操作
    try {
      await this.middleware.wrapInfrastructureOperation(
        async () => {
          if (Math.random() > 0.5) {
            throw new Error("Database connection failed");
          }
          return { connected: true };
        },
        "DATABASE",
        { operation: "connect", database: "main" }
      );
      console.log("数据库连接成功");
    } catch (error) {
      console.error("数据库连接失败:", error);
    }

    // 2. 缓存操作
    try {
      await this.middleware.wrapInfrastructureOperation(
        async () => {
          if (Math.random() > 0.6) {
            throw new Error("Cache operation failed");
          }
          return { cached: true };
        },
        "CACHE",
        { operation: "set", key: "user:123" }
      );
      console.log("缓存操作成功");
    } catch (error) {
      console.error("缓存操作失败:", error);
    }

    // 3. 网络操作
    try {
      await this.middleware.wrapInfrastructureOperation(
        async () => {
          if (Math.random() > 0.7) {
            throw new Error("Network request failed");
          }
          return { response: "success" };
        },
        "NETWORK",
        { operation: "httpRequest", url: "https://api.example.com" }
      );
      console.log("网络请求成功");
    } catch (error) {
      console.error("网络请求失败:", error);
    }

    // 4. 批量错误处理
    const errors = [
      { error: new Error("Error 1"), type: "DATABASE" as InfrastructureErrorType },
      { error: new Error("Error 2"), type: "CACHE" as InfrastructureErrorType },
      { error: new Error("Error 3"), type: "NETWORK" as InfrastructureErrorType },
    ];

    const results = await this.errorHandler.handleBatchErrors(errors);
    console.log("批量错误处理结果:", results);

    // 5. 错误统计
    const stats = await this.errorHandler.getErrorStatistics();
    console.log("错误统计:", stats);
  }
}

// ==================== 运行示例 ====================

/**
 * 运行所有示例
 */
export async function runAllExamples() {
  console.log("开始运行异常处理集成示例...\n");

  // 基础异常转换示例
  console.log("1. 基础异常转换示例");
  const basicExample = new BasicExceptionConversionExample();
  await basicExample.demonstrateBasicConversion();
  console.log();

  // 工具函数示例
  console.log("2. 工具函数示例");
  const utilityExample = new UtilityFunctionsExample();
  await utilityExample.demonstrateUtilities();
  console.log();

  // 异常处理管理器示例
  console.log("3. 异常处理管理器示例");
  const managerExample = new ExceptionManagerExample();
  await managerExample.demonstrateManager();
  console.log();

  console.log("所有示例运行完成！");
}

// 如果直接运行此文件，则执行所有示例
if (require.main === module) {
  runAllExamples().catch(console.error);
}
