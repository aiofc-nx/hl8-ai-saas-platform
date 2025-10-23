/**
 * 异常处理工具类
 *
 * @description 提供便捷的异常处理工具函数和装饰器
 * @since 1.0.0
 */

import {
  InfrastructureExceptionConverter,
  InfrastructureErrorType,
} from "../exceptions/infrastructure-exception.mapping.js";

/**
 * 异常处理装饰器选项
 */
export interface ExceptionHandlerOptions {
  /** 错误类型 */
  errorType: InfrastructureErrorType;
  /** 上下文提供器 */
  contextProvider?: (args: unknown[]) => Record<string, unknown>;
  /** 是否记录错误 */
  logError?: boolean;
  /** 是否重试 */
  retryable?: boolean;
  /** 最大重试次数 */
  maxRetries?: number;
}

/**
 * 异常处理结果
 */
export interface ExceptionHandleResult<T> {
  success: boolean;
  data?: T;
  _error?: Error;
  retryCount?: number;
}

/**
 * 基础设施异常处理装饰器
 *
 * @param options - 异常处理选项
 * @returns 装饰器函数
 */
export function HandleInfrastructureException(
  options: ExceptionHandlerOptions,
) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      let retryCount = 0;
      const maxRetries = options.maxRetries || 0;

      while (retryCount <= maxRetries) {
        try {
          const result = await originalMethod.apply(this, args);

          if (options.logError) {
            console.log(`操作成功: ${propertyKey}`, { retryCount });
          }

          return result;
        } catch (_error) {
          retryCount++;

          if (options.logError) {
            console.error(`操作失败: ${propertyKey}`, {
              _error: _error instanceof Error ? _error.message : String(_error),
              retryCount,
              maxRetries,
            });
          }

          // 如果是最后一次重试，或者不需要重试，则抛出标准化异常
          if (retryCount > maxRetries || !options.retryable) {
            const standardError =
              _error instanceof Error ? _error : new Error(String(_error));
            const context = options.contextProvider
              ? options.contextProvider(args)
              : {};

            throw InfrastructureExceptionConverter.convertToStandardException(
              standardError,
              options.errorType,
              { ...context, retryCount, maxRetries },
            );
          }

          // 等待一段时间后重试
          if (retryCount <= maxRetries) {
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * retryCount),
            );
          }
        }
      }
    };

    return descriptor;
  };
}

/**
 * 异常处理中间件类
 */
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
    } catch (_error) {
      const standardError =
        _error instanceof Error ? _error : new Error(String(_error));
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
    } catch (_error) {
      const standardError =
        _error instanceof Error ? _error : new Error(String(_error));
      throw InfrastructureExceptionConverter.convertToStandardException(
        standardError,
        errorType,
        context,
      );
    }
  }

  /**
   * 包装操作并返回结果，不抛出异常
   */
  async wrapInfrastructureOperationSafe<T>(
    operation: () => Promise<T>,
    errorType: InfrastructureErrorType,
    context?: Record<string, unknown>,
  ): Promise<ExceptionHandleResult<T>> {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (_error) {
      const standardError =
        _error instanceof Error ? _error : new Error(String(_error));
      const exception =
        InfrastructureExceptionConverter.convertToStandardException(
          standardError,
          errorType,
          context,
        );
      return { success: false, _error: exception };
    }
  }

  /**
   * 包装同步操作并返回结果，不抛出异常
   */
  wrapInfrastructureSyncOperationSafe<T>(
    operation: () => T,
    errorType: InfrastructureErrorType,
    context?: Record<string, unknown>,
  ): ExceptionHandleResult<T> {
    try {
      const data = operation();
      return { success: true, data };
    } catch (_error) {
      const standardError =
        _error instanceof Error ? _error : new Error(String(_error));
      const exception =
        InfrastructureExceptionConverter.convertToStandardException(
          standardError,
          errorType,
          context,
        );
      return { success: false, _error: exception };
    }
  }
}

/**
 * 异常处理工具函数
 */
export class ExceptionHandlerUtils {
  /**
   * 安全执行异步操作
   */
  static async safeExecute<T>(
    operation: () => Promise<T>,
    errorType: InfrastructureErrorType,
    context?: Record<string, unknown>,
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (_error) {
      const standardError =
        _error instanceof Error ? _error : new Error(String(_error));
      const exception =
        InfrastructureExceptionConverter.convertToStandardException(
          standardError,
          errorType,
          context,
        );

      console.error("操作执行失败:", exception.message, exception.data);
      return null;
    }
  }

  /**
   * 安全执行同步操作
   */
  static safeExecuteSync<T>(
    operation: () => T,
    errorType: InfrastructureErrorType,
    context?: Record<string, unknown>,
  ): T | null {
    try {
      return operation();
    } catch (_error) {
      const standardError =
        _error instanceof Error ? _error : new Error(String(_error));
      const exception =
        InfrastructureExceptionConverter.convertToStandardException(
          standardError,
          errorType,
          context,
        );

      console.error("操作执行失败:", exception.message, exception.data);
      return null;
    }
  }

  /**
   * 重试执行操作
   */
  static async retryExecute<T>(
    operation: () => Promise<T>,
    errorType: InfrastructureErrorType,
    maxRetries: number = 3,
    delay: number = 1000,
    context?: Record<string, unknown>,
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (_error) {
        lastError =
          _error instanceof Error ? _error : new Error(String(_error));

        if (attempt < maxRetries) {
          console.warn(`操作失败，第 ${attempt} 次重试:`, lastError.message);
          await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        }
      }
    }

    // 所有重试都失败，抛出标准化异常
    const standardError = lastError!;
    throw InfrastructureExceptionConverter.convertToStandardException(
      standardError,
      errorType,
      { ...context, maxRetries, attempts: maxRetries },
    );
  }

  /**
   * 批量执行操作
   */
  static async batchExecute<T>(
    operations: Array<() => Promise<T>>,
    errorType: InfrastructureErrorType,
    context?: Record<string, unknown>,
  ): Promise<Array<ExceptionHandleResult<T>>> {
    const results: Array<ExceptionHandleResult<T>> = [];

    for (let i = 0; i < operations.length; i++) {
      try {
        const data = await operations[i]();
        results.push({ success: true, data });
      } catch (_error) {
        const standardError =
          _error instanceof Error ? _error : new Error(String(_error));
        const exception =
          InfrastructureExceptionConverter.convertToStandardException(
            standardError,
            errorType,
            { ...context, operationIndex: i },
          );
        results.push({ success: false, _error: exception });
      }
    }

    return results;
  }

  /**
   * 并行执行操作
   */
  static async parallelExecute<T>(
    operations: Array<() => Promise<T>>,
    errorType: InfrastructureErrorType,
    context?: Record<string, unknown>,
  ): Promise<Array<ExceptionHandleResult<T>>> {
    const promises = operations.map(async (operation, index) => {
      try {
        const data = await operation();
        return { success: true, data };
      } catch (_error) {
        const standardError =
          _error instanceof Error ? _error : new Error(String(_error));
        const exception =
          InfrastructureExceptionConverter.convertToStandardException(
            standardError,
            errorType,
            { ...context, operationIndex: index },
          );
        return { success: false, _error: exception };
      }
    });

    return Promise.all(promises);
  }

  /**
   * 检查错误是否可重试
   */
  static isRetryableError(_error: Error): boolean {
    const retryablePatterns = [
      /timeout/i,
      /connection/i,
      /network/i,
      /temporary/i,
      /unavailable/i,
    ];

    return retryablePatterns.some((pattern) => pattern.test(_error.message));
  }

  /**
   * 获取错误严重级别
   */
  static getErrorSeverity(
    _error: Error,
  ): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    const criticalPatterns = [
      /fatal/i,
      /critical/i,
      /database.*down/i,
      /connection.*refused/i,
    ];

    const highPatterns = [/_error/i, /failed/i, /exception/i];

    const lowPatterns = [/warning/i, /info/i, /debug/i];

    if (criticalPatterns.some((pattern) => pattern.test(_error.message))) {
      return "CRITICAL";
    }

    if (highPatterns.some((pattern) => pattern.test(_error.message))) {
      return "HIGH";
    }

    if (lowPatterns.some((pattern) => pattern.test(_error.message))) {
      return "LOW";
    }

    return "MEDIUM";
  }

  /**
   * 格式化错误信息
   */
  static formatError(_error: Error, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context) : "{}";

    return `[${timestamp}] ${_error.name}: ${_error.message}\nContext: ${contextStr}\nStack: ${_error.stack}`;
  }

  /**
   * 创建错误摘要
   */
  static createErrorSummary(
    _error: Error,
    context?: Record<string, unknown>,
  ): {
    message: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    timestamp: string;
    context: Record<string, unknown>;
    retryable: boolean;
  } {
    return {
      message: _error.message,
      severity: this.getErrorSeverity(_error),
      timestamp: new Date().toISOString(),
      context: context || {},
      retryable: this.isRetryableError(_error),
    };
  }
}

/**
 * 异常处理配置
 */
export interface ExceptionHandlerConfig {
  /** 是否启用日志记录 */
  enableLogging: boolean;
  /** 日志级别 */
  logLevel: "debug" | "info" | "warn" | "_error";
  /** 是否启用监控 */
  enableMonitoring: boolean;
  /** 监控端点 */
  monitoringEndpoint?: string;
  /** 默认重试次数 */
  defaultMaxRetries: number;
  /** 默认重试延迟 */
  defaultRetryDelay: number;
}

/**
 * 全局异常处理配置
 */
export const defaultExceptionHandlerConfig: ExceptionHandlerConfig = {
  enableLogging: true,
  logLevel: "info",
  enableMonitoring: false,
  defaultMaxRetries: 3,
  defaultRetryDelay: 1000,
};

/**
 * 异常处理管理器
 */
export class ExceptionHandlerManager {
  private config: ExceptionHandlerConfig;

  constructor(config: Partial<ExceptionHandlerConfig> = {}) {
    this.config = { ...defaultExceptionHandlerConfig, ...config };
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<ExceptionHandlerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取配置
   */
  getConfig(): ExceptionHandlerConfig {
    return { ...this.config };
  }

  /**
   * 记录错误
   */
  logError(_error: Error, context?: Record<string, unknown>): void {
    if (!this.config.enableLogging) {
      return;
    }

    const summary = ExceptionHandlerUtils.createErrorSummary(_error, context);
    const formattedError = ExceptionHandlerUtils.formatError(_error, context);

    switch (this.config.logLevel) {
      case "debug":
        console.debug("异常详情:", formattedError);
        break;
      case "info":
        console.info("异常摘要:", summary);
        break;
      case "warn":
        console.warn("异常警告:", summary);
        break;
      case "_error":
        console.error("异常错误:", formattedError);
        break;
    }
  }

  /**
   * 发送到监控系统
   */
  async sendToMonitoring(
    _error: Error,
    context?: Record<string, unknown>,
  ): Promise<void> {
    if (!this.config.enableMonitoring || !this.config.monitoringEndpoint) {
      return;
    }

    try {
      const summary = ExceptionHandlerUtils.createErrorSummary(_error, context);

      // 这里可以集成实际的监控系统
      console.log("发送到监控系统:", {
        endpoint: this.config.monitoringEndpoint,
        data: summary,
      });
    } catch (monitoringError) {
      console.error("发送监控数据失败:", monitoringError);
    }
  }
}
