/**
 * 健康检查服务
 *
 * @description 实现系统健康检查功能
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import type { IHealthCheckService, HealthIndicatorResult, HealthCheckResult } from '../interfaces/health-service.interface.js';
import type { IDatabaseAdapter } from '../interfaces/database-adapter.interface.js';
import type { ICacheService } from '../interfaces/cache-service.interface.js';
import type { ILoggingService } from '../interfaces/logging-service.interface.js';

/**
 * 健康检查服务
 */
@Injectable()
export class HealthCheckService implements IHealthCheckService {
  private indicators = new Map<string, () => Promise<HealthIndicatorResult>>();
  private config = {
    timeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000
  };

  constructor(
    private readonly databaseAdapter: IDatabaseAdapter,
    private readonly cacheService?: ICacheService,
    private readonly loggingService?: ILoggingService
  ) {
    this.registerDefaultIndicators();
  }

  /**
   * 注册健康指示器
   */
  registerIndicator(name: string, indicator: () => Promise<HealthIndicatorResult>): void {
    this.indicators.set(name, indicator);
  }

  /**
   * 注销健康指示器
   */
  deregisterIndicator(name: string): void {
    this.indicators.delete(name);
  }

  /**
   * 执行健康检查
   */
  async check(): Promise<HealthCheckResult> {
    try {
      const startTime = Date.now();
      const results: Record<string, HealthIndicatorResult> = {};
      const errors: Record<string, HealthIndicatorResult> = {};
      
      // 并行执行所有健康指示器
      const indicatorPromises = Array.from(this.indicators.entries()).map(
        async ([name, indicator]) => {
          try {
            const result = await this.executeIndicator(name, indicator);
            if (result.status === 'up') {
              results[name] = result;
            } else {
              errors[name] = result;
            }
          } catch (error) {
            const errorResult: HealthIndicatorResult = {
              status: 'down',
              message: error instanceof Error ? error.message : '健康检查失败',
              details: { error: error instanceof Error ? error.message : '未知错误' }
            };
            errors[name] = errorResult;
          }
        }
      );

      await Promise.all(indicatorPromises);

      // 确定整体健康状态
      const overallStatus = this.determineOverallStatus(results, errors);
      const executionTime = Date.now() - startTime;

      const healthCheckResult: HealthCheckResult = {
        status: overallStatus,
        info: results,
        error: Object.keys(errors).length > 0 ? errors : undefined,
        details: {
          executionTime,
          totalIndicators: this.indicators.size,
          healthyIndicators: Object.keys(results).length,
          unhealthyIndicators: Object.keys(errors).length
        }
      };

      // 记录健康检查日志
      await this.logHealthCheck(healthCheckResult);

      return healthCheckResult;
    } catch (error) {
      throw new Error(`健康检查失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 执行单个健康指示器
   */
  private async executeIndicator(
    name: string,
    indicator: () => Promise<HealthIndicatorResult>
  ): Promise<HealthIndicatorResult> {
    try {
      // 设置超时
      const timeoutPromise = new Promise<HealthIndicatorResult>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`健康指示器 ${name} 执行超时`));
        }, this.config.timeout);
      });

      const result = await Promise.race([
        indicator(),
        timeoutPromise
      ]);

      return result;
    } catch (error) {
      return {
        status: 'down',
        message: error instanceof Error ? error.message : '健康指示器执行失败',
        details: { error: error instanceof Error ? error.message : '未知错误' }
      };
    }
  }

  /**
   * 确定整体健康状态
   */
  private determineOverallStatus(
    results: Record<string, HealthIndicatorResult>,
    errors: Record<string, HealthIndicatorResult>
  ): 'up' | 'down' | 'degraded' {
    const totalIndicators = Object.keys(results).length + Object.keys(errors).length;
    const healthyIndicators = Object.keys(results).length;
    const unhealthyIndicators = Object.keys(errors).length;

    if (unhealthyIndicators === 0) {
      return 'up';
    } else if (unhealthyIndicators < totalIndicators) {
      return 'degraded';
    } else {
      return 'down';
    }
  }

  /**
   * 注册默认健康指示器
   */
  private registerDefaultIndicators(): void {
    // 数据库健康指示器
    this.registerIndicator('database', async () => {
      try {
        const isHealthy = await this.databaseAdapter.healthCheck();
        return {
          status: isHealthy ? 'up' : 'down',
          message: isHealthy ? '数据库连接正常' : '数据库连接异常',
          details: {
            type: 'database',
            healthy: isHealthy
          }
        };
      } catch (error) {
        return {
          status: 'down',
          message: '数据库健康检查失败',
          details: { error: error instanceof Error ? error.message : '未知错误' }
        };
      }
    });

    // 缓存健康指示器
    if (this.cacheService) {
      this.registerIndicator('cache', async () => {
        try {
          const isHealthy = await this.cacheService.healthCheck();
          return {
            status: isHealthy ? 'up' : 'down',
            message: isHealthy ? '缓存服务正常' : '缓存服务异常',
            details: {
              type: 'cache',
              healthy: isHealthy
            }
          };
        } catch (error) {
          return {
            status: 'down',
            message: '缓存健康检查失败',
            details: { error: error instanceof Error ? error.message : '未知错误' }
          };
        }
      });
    }

    // 日志健康指示器
    if (this.loggingService) {
      this.registerIndicator('logging', async () => {
        try {
          // 简单的日志服务健康检查
          await this.loggingService.info(
            { requestId: 'health_check', tenantId: 'system', operation: 'health-check', resource: 'health-check', timestamp: new Date(), level: 'info', message: '健康检查' },
            '健康检查测试'
          );
          return {
            status: 'up',
            message: '日志服务正常',
            details: {
              type: 'logging',
              healthy: true
            }
          };
        } catch (error) {
          return {
            status: 'down',
            message: '日志服务健康检查失败',
            details: { error: error instanceof Error ? error.message : '未知错误' }
          };
        }
      });
    }

    // 内存健康指示器
    this.registerIndicator('memory', async () => {
      try {
        const memUsage = process.memoryUsage();
        const totalMem = require('os').totalmem();
        const memoryUsage = memUsage.heapUsed / totalMem;
        const isHealthy = memoryUsage < 0.8; // 80%阈值

        return {
          status: isHealthy ? 'up' : 'down',
          message: isHealthy ? '内存使用正常' : '内存使用过高',
          details: {
            type: 'memory',
            usage: memoryUsage,
            healthy: isHealthy,
            heapUsed: memUsage.heapUsed,
            heapTotal: memUsage.heapTotal,
            external: memUsage.external
          }
        };
      } catch (error) {
        return {
          status: 'down',
          message: '内存健康检查失败',
          details: { error: error instanceof Error ? error.message : '未知错误' }
        };
      }
    });

    // 磁盘健康指示器
    this.registerIndicator('disk', async () => {
      try {
        const fs = require('fs');
        const path = require('path');
        const os = require('os');
        
        const tempDir = os.tmpdir();
        const testFile = path.join(tempDir, 'health_check_test.txt');
        
        // 测试磁盘写入
        fs.writeFileSync(testFile, 'health check test');
        fs.unlinkSync(testFile);
        
        return {
          status: 'up',
          message: '磁盘访问正常',
          details: {
            type: 'disk',
            healthy: true,
            tempDir
          }
        };
      } catch (error) {
        return {
          status: 'down',
          message: '磁盘健康检查失败',
          details: { error: error instanceof Error ? error.message : '未知错误' }
        };
      }
    });
  }

  /**
   * 记录健康检查日志
   */
  private async logHealthCheck(result: HealthCheckResult): Promise<void> {
    try {
      if (this.loggingService) {
        const logContext = {
          requestId: `health_check_${Date.now()}`,
          tenantId: 'system',
          operation: 'health-check',
          resource: 'health-check',
          timestamp: new Date(),
          level: result.status === 'up' ? 'info' : 'warn' as const,
          message: `健康检查: ${result.status}`
        };
        
        await this.loggingService.info(logContext, `健康检查: ${result.status}`, result);
      }
    } catch (error) {
      console.error('记录健康检查日志失败:', error);
    }
  }

  /**
   * 获取健康检查配置
   */
  getConfig(): Record<string, any> {
    return { ...this.config };
  }

  /**
   * 设置健康检查配置
   */
  setConfig(config: Partial<typeof this.config>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取注册的健康指示器
   */
  getRegisteredIndicators(): string[] {
    return Array.from(this.indicators.keys());
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.check();
      return result.status === 'up';
    } catch (error) {
      return false;
    }
  }
}
