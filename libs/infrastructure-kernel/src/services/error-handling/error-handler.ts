/**
 * 错误处理器
 *
 * @description 统一处理系统错误，提供错误恢复机制
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import type { IDatabaseAdapter } from '../../interfaces/database-adapter.interface.js';
import type { ILoggingService } from '../../interfaces/logging-service.interface.js';

/**
 * 错误类型
 */
export type ErrorType = 'DATABASE' | 'CACHE' | 'NETWORK' | 'VALIDATION' | 'BUSINESS' | 'SYSTEM' | 'UNKNOWN';

/**
 * 错误严重级别
 */
export type ErrorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

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
  context?: Record<string, any>;
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
  error?: ErrorInfo;
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
  private recoveryStrategies = new Map<ErrorType, (error: ErrorInfo) => Promise<boolean>>();
  private config = {
    maxErrorHistory: 1000,
    autoRecovery: true,
    retryAttempts: 3,
    retryDelay: 1000
  };

  constructor(
    private readonly databaseAdapter: IDatabaseAdapter,
    private readonly loggingService?: ILoggingService
  ) {
    this.registerDefaultRecoveryStrategies();
  }

  /**
   * 处理错误
   */
  async handleError(error: Error, context?: Record<string, any>): Promise<ErrorHandleResult> {
    const startTime = Date.now();
    
    try {
      // 创建错误信息
      const errorInfo = this.createErrorInfo(error, context);
      
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
        error: errorInfo,
        recovery,
        processingTime: Date.now() - startTime
      };
      
      return result;
    } catch (handleError) {
      const result: ErrorHandleResult = {
        success: false,
        error: {
          id: this.generateErrorId(),
          type: 'SYSTEM',
          severity: 'CRITICAL',
          message: '错误处理失败',
          timestamp: new Date(),
          recoverable: false
        },
        processingTime: Date.now() - startTime
      };
      
      return result;
    }
  }

  /**
   * 处理数据库错误
   */
  async handleDatabaseError(error: Error, context?: Record<string, any>): Promise<ErrorHandleResult> {
    const errorInfo = this.createErrorInfo(error, context);
    errorInfo.type = 'DATABASE';
    errorInfo.recoverable = this.isDatabaseErrorRecoverable(error);
    errorInfo.recoveryStrategy = this.getDatabaseRecoveryStrategy(error);
    
    return await this.handleError(error, context);
  }

  /**
   * 处理缓存错误
   */
  async handleCacheError(error: Error, context?: Record<string, any>): Promise<ErrorHandleResult> {
    const errorInfo = this.createErrorInfo(error, context);
    errorInfo.type = 'CACHE';
    errorInfo.recoverable = this.isCacheErrorRecoverable(error);
    errorInfo.recoveryStrategy = this.getCacheRecoveryStrategy(error);
    
    return await this.handleError(error, context);
  }

  /**
   * 处理网络错误
   */
  async handleNetworkError(error: Error, context?: Record<string, any>): Promise<ErrorHandleResult> {
    const errorInfo = this.createErrorInfo(error, context);
    errorInfo.type = 'NETWORK';
    errorInfo.recoverable = this.isNetworkErrorRecoverable(error);
    errorInfo.recoveryStrategy = this.getNetworkRecoveryStrategy(error);
    
    return await this.handleError(error, context);
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
  getErrorStats(): Record<string, any> {
    const total = this.errorHistory.length;
    const byType = this.errorHistory.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const bySeverity = this.errorHistory.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const recoverable = this.errorHistory.filter(e => e.recoverable).length;
    const recovered = this.errorHistory.filter(e => e.recoveryStrategy).length;
    
    return {
      total,
      byType,
      bySeverity,
      recoverable,
      recovered,
      recoveryRate: total > 0 ? recovered / total : 0
    };
  }

  /**
   * 注册恢复策略
   */
  registerRecoveryStrategy(type: ErrorType, strategy: (error: ErrorInfo) => Promise<boolean>): void {
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
  getConfig(): Record<string, any> {
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
  private createErrorInfo(error: Error, context?: Record<string, any>): ErrorInfo {
    return {
      id: this.generateErrorId(),
      type: this.determineErrorType(error),
      severity: this.determineErrorSeverity(error),
      message: error.message,
      stack: error.stack,
      code: (error as any).code,
      timestamp: new Date(),
      context,
      recoverable: this.isErrorRecoverable(error),
      recoveryStrategy: this.getRecoveryStrategy(error)
    };
  }

  /**
   * 确定错误类型
   */
  private determineErrorType(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    
    if (message.includes('database') || message.includes('connection')) {
      return 'DATABASE';
    }
    
    if (message.includes('cache') || message.includes('redis')) {
      return 'CACHE';
    }
    
    if (message.includes('network') || message.includes('timeout')) {
      return 'NETWORK';
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return 'VALIDATION';
    }
    
    if (message.includes('business') || message.includes('domain')) {
      return 'BUSINESS';
    }
    
    return 'UNKNOWN';
  }

  /**
   * 确定错误严重级别
   */
  private determineErrorSeverity(error: Error): ErrorSeverity {
    const message = error.message.toLowerCase();
    
    if (message.includes('critical') || message.includes('fatal')) {
      return 'CRITICAL';
    }
    
    if (message.includes('error') || message.includes('failed')) {
      return 'HIGH';
    }
    
    if (message.includes('warning') || message.includes('timeout')) {
      return 'MEDIUM';
    }
    
    return 'LOW';
  }

  /**
   * 检查错误是否可恢复
   */
  private isErrorRecoverable(error: Error): boolean {
    const message = error.message.toLowerCase();
    
    // 网络错误通常可恢复
    if (message.includes('timeout') || message.includes('connection')) {
      return true;
    }
    
    // 数据库连接错误可恢复
    if (message.includes('database') && message.includes('connection')) {
      return true;
    }
    
    // 缓存错误可恢复
    if (message.includes('cache') || message.includes('redis')) {
      return true;
    }
    
    return false;
  }

  /**
   * 检查数据库错误是否可恢复
   */
  private isDatabaseErrorRecoverable(error: Error): boolean {
    const message = error.message.toLowerCase();
    return message.includes('connection') || message.includes('timeout');
  }

  /**
   * 检查缓存错误是否可恢复
   */
  private isCacheErrorRecoverable(error: Error): boolean {
    const message = error.message.toLowerCase();
    return message.includes('connection') || message.includes('timeout');
  }

  /**
   * 检查网络错误是否可恢复
   */
  private isNetworkErrorRecoverable(error: Error): boolean {
    const message = error.message.toLowerCase();
    return message.includes('timeout') || message.includes('connection');
  }

  /**
   * 获取恢复策略
   */
  private getRecoveryStrategy(error: Error): string | undefined {
    const type = this.determineErrorType(error);
    
    switch (type) {
      case 'DATABASE':
        return 'retry_connection';
      case 'CACHE':
        return 'retry_connection';
      case 'NETWORK':
        return 'retry_request';
      default:
        return undefined;
    }
  }

  /**
   * 获取数据库恢复策略
   */
  private getDatabaseRecoveryStrategy(error: Error): string | undefined {
    const message = error.message.toLowerCase();
    
    if (message.includes('connection')) {
      return 'retry_connection';
    }
    
    if (message.includes('timeout')) {
      return 'retry_with_timeout';
    }
    
    return undefined;
  }

  /**
   * 获取缓存恢复策略
   */
  private getCacheRecoveryStrategy(error: Error): string | undefined {
    const message = error.message.toLowerCase();
    
    if (message.includes('connection')) {
      return 'retry_connection';
    }
    
    if (message.includes('timeout')) {
      return 'retry_with_timeout';
    }
    
    return undefined;
  }

  /**
   * 获取网络恢复策略
   */
  private getNetworkRecoveryStrategy(error: Error): string | undefined {
    const message = error.message.toLowerCase();
    
    if (message.includes('timeout')) {
      return 'retry_request';
    }
    
    if (message.includes('connection')) {
      return 'retry_connection';
    }
    
    return undefined;
  }

  /**
   * 记录错误
   */
  private recordError(error: ErrorInfo): void {
    this.errorHistory.push(error);
    
    // 限制错误历史记录大小
    if (this.errorHistory.length > this.config.maxErrorHistory) {
      this.errorHistory = this.errorHistory.slice(-this.config.maxErrorHistory);
    }
  }

  /**
   * 尝试恢复
   */
  private async attemptRecovery(error: ErrorInfo): Promise<{
    action: string;
    result: boolean;
    message: string;
  }> {
    try {
      const strategy = this.recoveryStrategies.get(error.type);
      if (!strategy) {
        return {
          action: 'no_strategy',
          result: false,
          message: '没有可用的恢复策略'
        };
      }
      
      const result = await strategy(error);
      
      return {
        action: error.recoveryStrategy || 'unknown',
        result,
        message: result ? '恢复成功' : '恢复失败'
      };
    } catch (error) {
      return {
        action: 'recovery_failed',
        result: false,
        message: error instanceof Error ? error.message : '恢复操作失败'
      };
    }
  }

  /**
   * 记录错误日志
   */
  private async logError(error: ErrorInfo): Promise<void> {
    try {
      if (this.loggingService) {
        const logContext = {
          requestId: `error_${error.id}`,
          tenantId: 'system',
          operation: 'error-handling',
          resource: 'error-handler',
          timestamp: error.timestamp,
          level: error.severity === 'CRITICAL' ? 'error' : 'warn' as const,
          message: `错误处理: ${error.message}`
        };
        
        await this.loggingService.error(logContext as any, `错误处理: ${error.message}`, error as any);
      }
    } catch (error) {
      console.error('记录错误日志失败:', error);
    }
  }

  /**
   * 注册默认恢复策略
   */
  private registerDefaultRecoveryStrategies(): void {
    // 数据库恢复策略
    this.registerRecoveryStrategy('DATABASE', async (error) => {
      try {
        // 尝试重新连接数据库
        await this.databaseAdapter.healthCheck();
        return true;
      } catch (error) {
        return false;
      }
    });
    
    // 缓存恢复策略
    this.registerRecoveryStrategy('CACHE', async (error) => {
      try {
        // 这里应该实现缓存恢复逻辑
        return true;
      } catch (error) {
        return false;
      }
    });
    
    // 网络恢复策略
    this.registerRecoveryStrategy('NETWORK', async (error) => {
      try {
        // 这里应该实现网络恢复逻辑
        return true;
      } catch (error) {
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
    } catch (error) {
      return false;
    }
  }
}
