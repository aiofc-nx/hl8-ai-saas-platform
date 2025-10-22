/**
 * 重试管理器
 *
 * @description 实现智能重试机制，提高系统可靠性
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import type { IDatabaseAdapter } from '../../interfaces/database-adapter.interface.js';
import type { ILoggingService } from '../../interfaces/logging-service.interface.js';

/**
 * 重试策略
 */
export type RetryStrategy = 'FIXED' | 'EXPONENTIAL' | 'LINEAR' | 'CUSTOM';

/**
 * 重试配置
 */
export interface RetryConfig {
  /** 最大重试次数 */
  maxAttempts: number;
  /** 重试策略 */
  strategy: RetryStrategy;
  /** 初始延迟(毫秒) */
  initialDelay: number;
  /** 最大延迟(毫秒) */
  maxDelay: number;
  /** 延迟倍数 */
  delayMultiplier: number;
  /** 抖动因子 */
  jitterFactor: number;
  /** 是否启用重试 */
  enabled: boolean;
  /** 重试条件 */
  retryCondition?: (error: Error) => boolean;
}

/**
 * 重试结果
 */
export interface RetryResult<T> {
  /** 是否成功 */
  success: boolean;
  /** 返回数据 */
  data?: T;
  /** 错误信息 */
  error?: Error;
  /** 重试次数 */
  attempts: number;
  /** 总执行时间 */
  totalTime: number;
  /** 重试历史 */
  retryHistory: Array<{
    attempt: number;
    timestamp: Date;
    error?: Error;
    delay: number;
  }>;
}

/**
 * 重试管理器
 */
@Injectable()
export class RetryManagerService {
  private retryConfigs = new Map<string, RetryConfig>();
  private retryHistory: Array<{
    operation: string;
    attempts: number;
    success: boolean;
    totalTime: number;
    timestamp: Date;
  }> = [];
  
  private defaultConfig: RetryConfig = {
    maxAttempts: 3,
    strategy: 'EXPONENTIAL',
    initialDelay: 1000,
    maxDelay: 30000,
    delayMultiplier: 2,
    jitterFactor: 0.1,
    enabled: true
  };

  constructor(
    private readonly databaseAdapter: IDatabaseAdapter,
    private readonly loggingService?: ILoggingService
  ) {}

  /**
   * 执行重试操作
   */
  async executeWithRetry<T>(
    operation: string,
    fn: () => Promise<T>,
    config?: Partial<RetryConfig>
  ): Promise<RetryResult<T>> {
    const startTime = Date.now();
    const retryConfig = this.getRetryConfig(operation, config);
    
    if (!retryConfig.enabled) {
      try {
        const data = await fn();
        return {
          success: true,
          data,
          attempts: 1,
          totalTime: Date.now() - startTime,
          retryHistory: []
        };
      } catch (error) {
        return {
          success: false,
          error: error as Error,
          attempts: 1,
          totalTime: Date.now() - startTime,
          retryHistory: []
        };
      }
    }
    
    const retryHistory: Array<{
      attempt: number;
      timestamp: Date;
      error?: Error;
      delay: number;
    }> = [];
    
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      const attemptStartTime = Date.now();
      
      try {
        const data = await fn();
        
        // 记录成功
        this.recordRetrySuccess(operation, attempt, Date.now() - startTime);
        
        return {
          success: true,
          data,
          attempts: attempt,
          totalTime: Date.now() - startTime,
          retryHistory
        };
      } catch (error) {
        lastError = error as Error;
        
        // 检查是否应该重试
        if (!this.shouldRetry(error as Error, attempt, retryConfig)) {
          break;
        }
        
        // 计算延迟时间
        const delay = this.calculateDelay(attempt, retryConfig);
        
        // 记录重试历史
        retryHistory.push({
          attempt,
          timestamp: new Date(),
          error: error as Error,
          delay
        });
        
        // 记录重试日志
        await this.logRetryAttempt(operation, attempt, error as Error, delay);
        
        // 等待延迟时间
        if (attempt < retryConfig.maxAttempts) {
          await this.sleep(delay);
        }
      }
    }
    
    // 记录最终失败
    this.recordRetryFailure(operation, retryConfig.maxAttempts, Date.now() - startTime);
    
    return {
      success: false,
      error: lastError,
      attempts: retryConfig.maxAttempts,
      totalTime: Date.now() - startTime,
      retryHistory
    };
  }

  /**
   * 设置重试配置
   */
  setRetryConfig(operation: string, config: RetryConfig): void {
    this.retryConfigs.set(operation, config);
  }

  /**
   * 获取重试配置
   */
  getRetryConfig(operation: string, config?: Partial<RetryConfig>): RetryConfig {
    const existingConfig = this.retryConfigs.get(operation);
    const baseConfig = existingConfig || this.defaultConfig;
    
    if (config) {
      return { ...baseConfig, ...config };
    }
    
    return baseConfig;
  }

  /**
   * 获取重试历史
   */
  getRetryHistory(operation?: string): Array<{
    operation: string;
    attempts: number;
    success: boolean;
    totalTime: number;
    timestamp: Date;
  }> {
    if (operation) {
      return this.retryHistory.filter(h => h.operation === operation);
    }
    return [...this.retryHistory];
  }

  /**
   * 获取重试统计
   */
  getRetryStats(): Record<string, any> {
    const total = this.retryHistory.length;
    const successful = this.retryHistory.filter(h => h.success).length;
    const failed = total - successful;
    
    const byOperation = this.retryHistory.reduce((acc, h) => {
      if (!acc[h.operation]) {
        acc[h.operation] = { total: 0, successful: 0, failed: 0 };
      }
      acc[h.operation].total++;
      if (h.success) {
        acc[h.operation].successful++;
      } else {
        acc[h.operation].failed++;
      }
      return acc;
    }, {} as Record<string, { total: number; successful: number; failed: number }>);
    
    const averageAttempts = this.retryHistory.reduce((sum, h) => sum + h.attempts, 0) / total;
    const averageTime = this.retryHistory.reduce((sum, h) => sum + h.totalTime, 0) / total;
    
    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? successful / total : 0,
      byOperation,
      averageAttempts,
      averageTime
    };
  }

  /**
   * 清除重试历史
   */
  clearRetryHistory(): void {
    this.retryHistory = [];
  }

  /**
   * 检查是否应该重试
   */
  private shouldRetry(error: Error, attempt: number, config: RetryConfig): boolean {
    // 检查重试条件
    if (config.retryCondition && !config.retryCondition(error)) {
      return false;
    }
    
    // 检查最大重试次数
    if (attempt >= config.maxAttempts) {
      return false;
    }
    
    // 检查错误类型
    const message = error.message.toLowerCase();
    
    // 网络错误通常可以重试
    if (message.includes('timeout') || message.includes('connection')) {
      return true;
    }
    
    // 数据库连接错误可以重试
    if (message.includes('database') && message.includes('connection')) {
      return true;
    }
    
    // 缓存错误可以重试
    if (message.includes('cache') || message.includes('redis')) {
      return true;
    }
    
    // 其他错误默认不重试
    return false;
  }

  /**
   * 计算延迟时间
   */
  private calculateDelay(attempt: number, config: RetryConfig): number {
    let delay: number;
    
    switch (config.strategy) {
      case 'FIXED':
        delay = config.initialDelay;
        break;
      case 'EXPONENTIAL':
        delay = config.initialDelay * Math.pow(config.delayMultiplier, attempt - 1);
        break;
      case 'LINEAR':
        delay = config.initialDelay * attempt;
        break;
      case 'CUSTOM':
        // 自定义策略，这里可以实现更复杂的逻辑
        delay = config.initialDelay * attempt;
        break;
      default:
        delay = config.initialDelay;
    }
    
    // 应用最大延迟限制
    delay = Math.min(delay, config.maxDelay);
    
    // 应用抖动因子
    const jitter = delay * config.jitterFactor * Math.random();
    delay = delay + jitter;
    
    return Math.floor(delay);
  }

  /**
   * 睡眠指定时间
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 记录重试成功
   */
  private recordRetrySuccess(operation: string, attempts: number, totalTime: number): void {
    this.retryHistory.push({
      operation,
      attempts,
      success: true,
      totalTime,
      timestamp: new Date()
    });
  }

  /**
   * 记录重试失败
   */
  private recordRetryFailure(operation: string, attempts: number, totalTime: number): void {
    this.retryHistory.push({
      operation,
      attempts,
      success: false,
      totalTime,
      timestamp: new Date()
    });
  }

  /**
   * 记录重试尝试日志
   */
  private async logRetryAttempt(
    operation: string,
    attempt: number,
    error: Error,
    delay: number
  ): Promise<void> {
    try {
      if (this.loggingService) {
        const logContext = {
          requestId: `retry_${operation}_${Date.now()}`,
          tenantId: 'system',
          operation: 'retry-manager',
          resource: 'retry-manager',
          timestamp: new Date(),
          level: 'warn' as const,
          message: `重试操作 ${operation}: 第 ${attempt} 次尝试失败`
        };
        
        await this.loggingService.warn(logContext, `重试操作 ${operation}: 第 ${attempt} 次尝试失败`, {
          operation,
          attempt,
          error: error.message,
          delay
        });
      }
    } catch (error) {
      console.error('记录重试尝试日志失败:', error);
    }
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
