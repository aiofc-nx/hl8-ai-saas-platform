/**
 * 错误处理器
 *
 * @description 统一处理系统错误，提供错误恢复机制
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import type { IDatabaseAdapter } from "../../interfaces/database-adapter.interface.js";
import type { ILoggingService } from "../../interfaces/logging-service.interface.js";
import type { LogContext } from "../../types/logging.types.js";

/**
 * 错误类型
 */
export type ErrorType =
  | "DATABASE"
  | "CACHE"
  | "NETWORK"
  | "VALIDATION"
  | "BUSINESS"
  | "SYSTEM"
  | "UNKNOWN";

/**
 * 错误严重级别
 */
export type ErrorSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/**
 * 错误信息
 */
export interface ErrorInfo {
  /** 错误ID */
  id: string;
  /** 错误类型 */
  type: ErrorType;
  /** 严重级别 */
  severity: ErrorSeverity;
  /** 错误消息 */
  message: string;
  /** 错误堆栈 */
  stack?: string;
  /** 错误代码 */
  code?: string;
  /** 时间戳 */
  timestamp: Date;
  /** 上下文信息 */
  context?: Record<string, unknown>;
  /** 是否可恢复 */
  recoverable: boolean;
  /** 恢复策略 */
  recoveryStrategy?: string;
}

/**
 * 错误处理结果
 */
export interface ErrorHandleResult {
  /** 是否处理成功 */
  success: boolean;
  /** 处理后的错误信息 */
  _error?: ErrorInfo;
  /** 恢复操作 */
  recovery?: {
    action: string;
    result: boolean;
    message: string;
  };
  /** 处理时间 */
  processingTime: number;
}

/**
 * 错误处理器
 */
@Injectable()
export class ErrorHandlerService {
  private errorHistory: ErrorInfo[] = [];
  private recoveryStrategies = new Map<
    ErrorType,
    (_error: ErrorInfo) => Promise<boolean>
  >();
  private config = {
    maxErrorHistory: 1000,
    autoRecovery: true,
    retryAttempts: 3,
    retryDelay: 1000,
  };

  constructor(
    private readonly databaseAdapter: IDatabaseAdapter,
    private readonly loggingService?: ILoggingService,
  ) {
    this.registerDefaultRecoveryStrategies();
  }

  /**
   * 处理错误
   */
  async handleError(
    _error: Error,
    context?: Record<string, unknown>,
  ): Promise<ErrorHandleResult> {
    const startTime = Date.now();

    try {
      // 创建错误信息
      const errorInfo = this.createErrorInfo(_error, context);

      // 记录错误
      this.recordError(errorInfo);

      // 记录错误日志
      await this.logError(errorInfo);

      // 尝试恢复
      let recovery = null;
      if (this.config.autoRecovery && errorInfo.recoverable) {
        recovery = await this.attemptRecovery(errorInfo);
      }

      const result: ErrorHandleResult = {
        success: true,
        _error: errorInfo,
        recovery,
        processingTime: Date.now() - startTime,
      };

      return result;
    } catch (handleError) {
      const result: ErrorHandleResult = {
        success: false,
        _error: {
          id: this.generateErrorId(),
          type: "SYSTEM",
          severity: "CRITICAL",
          message: "错误处理失败",
          timestamp: new Date(),
          recoverable: false,
        },
        processingTime: Date.now() - startTime,
      };

      return result;
    }
  }

  /**
   * 处理数据库错误
   */
  async handleDatabaseError(
    _error: Error,
    context?: Record<string, unknown>,
  ): Promise<ErrorHandleResult> {
    const errorInfo = this.createErrorInfo(_error, context);
    errorInfo.type = "DATABASE";
    errorInfo.recoverable = this.isDatabaseErrorRecoverable(_error);
    errorInfo.recoveryStrategy = this.getDatabaseRecoveryStrategy(_error);

    return await this.handleError(_error, context);
  }

  /**
   * 处理缓存错误
   */
  async handleCacheError(
    _error: Error,
    context?: Record<string, unknown>,
  ): Promise<ErrorHandleResult> {
    const errorInfo = this.createErrorInfo(_error, context);
    errorInfo.type = "CACHE";
    errorInfo.recoverable = this.isCacheErrorRecoverable(_error);
    errorInfo.recoveryStrategy = this.getCacheRecoveryStrategy(_error);

    return await this.handleError(_error, context);
  }

  /**
   * 处理网络错误
   */
  async handleNetworkError(
    _error: Error,
    context?: Record<string, unknown>,
  ): Promise<ErrorHandleResult> {
    const errorInfo = this.createErrorInfo(_error, context);
    errorInfo.type = "NETWORK";
    errorInfo.recoverable = this.isNetworkErrorRecoverable(_error);
    errorInfo.recoveryStrategy = this.getNetworkRecoveryStrategy(_error);

    return await this.handleError(_error, context);
  }

  /**
   * 获取错误历史
   */
  getErrorHistory(limit?: number): ErrorInfo[] {
    const history = [...this.errorHistory];
    return limit ? history.slice(-limit) : history;
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): Record<string, unknown> {
    const total = this.errorHistory.length;
    const byType = this.errorHistory.reduce(
      (acc, _error) => {
        acc[_error.type] = (acc[_error.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const bySeverity = this.errorHistory.reduce(
      (acc, _error) => {
        acc[_error.severity] = (acc[_error.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const recoverable = this.errorHistory.filter((e) => e.recoverable).length;
    const recovered = this.errorHistory.filter(
      (e) => e.recoveryStrategy,
    ).length;

    return {
      total,
      byType,
      bySeverity,
      recoverable,
      recovered,
      recoveryRate: total > 0 ? recovered / total : 0,
    };
  }

  /**
   * 注册恢复策略
   */
  registerRecoveryStrategy(
    type: ErrorType,
    strategy: (_error: ErrorInfo) => Promise<boolean>,
  ): void {
    this.recoveryStrategies.set(type, strategy);
  }

  /**
   * 设置配置
   */
  setConfig(config: Partial<typeof this.config>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取配置
   */
  getConfig(): Record<string, unknown> {
    return { ...this.config };
  }

  /**
   * 清除错误历史
   */
  clearErrorHistory(): void {
    this.errorHistory = [];
  }

  /**
   * 创建错误信息
   */
  private createErrorInfo(
    _error: Error,
    context?: Record<string, unknown>,
  ): ErrorInfo {
    return {
      id: this.generateErrorId(),
      type: this.determineErrorType(_error),
      severity: this.determineErrorSeverity(_error),
      message: _error.message,
      stack: _error.stack,
      code: (_error as { code?: string }).code,
      timestamp: new Date(),
      context,
      recoverable: this.isErrorRecoverable(_error),
      recoveryStrategy: this.getRecoveryStrategy(_error),
    };
  }

  /**
   * 确定错误类型
   */
  private determineErrorType(_error: Error): ErrorType {
    const message = _error.message.toLowerCase();

    if (message.includes("database") || message.includes("connection")) {
      return "DATABASE";
    }

    if (message.includes("cache") || message.includes("redis")) {
      return "CACHE";
    }

    if (message.includes("network") || message.includes("timeout")) {
      return "NETWORK";
    }

    if (message.includes("validation") || message.includes("invalid")) {
      return "VALIDATION";
    }

    if (message.includes("business") || message.includes("domain")) {
      return "BUSINESS";
    }

    return "UNKNOWN";
  }

  /**
   * 确定错误严重级别
   */
  private determineErrorSeverity(_error: Error): ErrorSeverity {
    const message = _error.message.toLowerCase();

    if (message.includes("critical") || message.includes("fatal")) {
      return "CRITICAL";
    }

    if (message.includes("_error") || message.includes("failed")) {
      return "HIGH";
    }

    if (message.includes("warning") || message.includes("timeout")) {
      return "MEDIUM";
    }

    return "LOW";
  }

  /**
   * 检查错误是否可恢复
   */
  private isErrorRecoverable(_error: Error): boolean {
    const message = _error.message.toLowerCase();

    // 网络错误通常可恢复
    if (message.includes("timeout") || message.includes("connection")) {
      return true;
    }

    // 数据库连接错误可恢复
    if (message.includes("database") && message.includes("connection")) {
      return true;
    }

    // 缓存错误可恢复
    if (message.includes("cache") || message.includes("redis")) {
      return true;
    }

    return false;
  }

  /**
   * 检查数据库错误是否可恢复
   */
  private isDatabaseErrorRecoverable(_error: Error): boolean {
    const message = _error.message.toLowerCase();
    return message.includes("connection") || message.includes("timeout");
  }

  /**
   * 检查缓存错误是否可恢复
   */
  private isCacheErrorRecoverable(_error: Error): boolean {
    const message = _error.message.toLowerCase();
    return message.includes("connection") || message.includes("timeout");
  }

  /**
   * 检查网络错误是否可恢复
   */
  private isNetworkErrorRecoverable(_error: Error): boolean {
    const message = _error.message.toLowerCase();
    return message.includes("timeout") || message.includes("connection");
  }

  /**
   * 获取恢复策略
   */
  private getRecoveryStrategy(_error: Error): string | undefined {
    const type = this.determineErrorType(_error);

    switch (type) {
      case "DATABASE":
        return "retry_connection";
      case "CACHE":
        return "retry_connection";
      case "NETWORK":
        return "retry_request";
      default:
        return undefined;
    }
  }

  /**
   * 获取数据库恢复策略
   */
  private getDatabaseRecoveryStrategy(_error: Error): string | undefined {
    const message = _error.message.toLowerCase();

    if (message.includes("connection")) {
      return "retry_connection";
    }

    if (message.includes("timeout")) {
      return "retry_with_timeout";
    }

    return undefined;
  }

  /**
   * 获取缓存恢复策略
   */
  private getCacheRecoveryStrategy(_error: Error): string | undefined {
    const message = _error.message.toLowerCase();

    if (message.includes("connection")) {
      return "retry_connection";
    }

    if (message.includes("timeout")) {
      return "retry_with_timeout";
    }

    return undefined;
  }

  /**
   * 获取网络恢复策略
   */
  private getNetworkRecoveryStrategy(_error: Error): string | undefined {
    const message = _error.message.toLowerCase();

    if (message.includes("timeout")) {
      return "retry_request";
    }

    if (message.includes("connection")) {
      return "retry_connection";
    }

    return undefined;
  }

  /**
   * 记录错误
   */
  private recordError(_error: ErrorInfo): void {
    this.errorHistory.push(_error);

    // 限制错误历史记录大小
    if (this.errorHistory.length > this.config.maxErrorHistory) {
      this.errorHistory = this.errorHistory.slice(-this.config.maxErrorHistory);
    }
  }

  /**
   * 尝试恢复
   */
  private async attemptRecovery(_error: ErrorInfo): Promise<{
    action: string;
    result: boolean;
    message: string;
  }> {
    try {
      const strategy = this.recoveryStrategies.get(_error.type);
      if (!strategy) {
        return {
          action: "no_strategy",
          result: false,
          message: "没有可用的恢复策略",
        };
      }

      const result = await strategy(_error);

      return {
        action: _error.recoveryStrategy || "unknown",
        result,
        message: result ? "恢复成功" : "恢复失败",
      };
    } catch (_error) {
      return {
        action: "recovery_failed",
        result: false,
        message: _error instanceof Error ? _error.message : "恢复操作失败",
      };
    }
  }

  /**
   * 记录错误日志
   */
  private async logError(_error: ErrorInfo): Promise<void> {
    try {
      if (this.loggingService) {
        const logContext: LogContext = {
          requestId: `error_${_error.id}`,
          tenantId: "system",
          operation: "error-handling",
          resource: "error-handler",
          userId: (_error.context?.userId as string) || "system",
          timestamp: _error.timestamp,
          level: _error.severity === "CRITICAL" ? "_error" : ("warn" as const),
          message: `错误处理: ${_error.message}`,
        };

        await this.loggingService._error(
          logContext,
          `错误处理: ${_error.message}`,
          new Error(_error.message),
        );
      }
    } catch (_error) {
      console.error("记录错误日志失败:", _error);
    }
  }

  /**
   * 注册默认恢复策略
   */
  private registerDefaultRecoveryStrategies(): void {
    // 数据库恢复策略
    this.registerRecoveryStrategy("DATABASE", async (_error) => {
      try {
        // 尝试重新连接数据库
        await this.databaseAdapter.healthCheck();
        return true;
      } catch (_error) {
        return false;
      }
    });

    // 缓存恢复策略
    this.registerRecoveryStrategy("CACHE", async (_error) => {
      try {
        // 这里应该实现缓存恢复逻辑
        return true;
      } catch (_error) {
        return false;
      }
    });

    // 网络恢复策略
    this.registerRecoveryStrategy("NETWORK", async (_error) => {
      try {
        // 这里应该实现网络恢复逻辑
        return true;
      } catch (_error) {
        return false;
      }
    });
  }

  /**
   * 生成错误ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      return await this.databaseAdapter.healthCheck();
    } catch (_error) {
      return false;
    }
  }
}
