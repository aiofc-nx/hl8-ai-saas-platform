/**
 * 应用层集成服务
 *
 * @description 与@hl8/application-kernel的集成服务
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import type { IDatabaseConnectionManager } from '../interfaces/database-adapter.interface.js';
import type { ICacheService } from '../interfaces/cache-service.interface.js';
import type { ILoggingService } from '../interfaces/logging-service.interface.js';
import type { IsolationContext } from '../types/isolation.types.js';

/**
 * 应用层集成配置
 */
export interface ApplicationKernelIntegrationConfig {
  /** 是否启用集成 */
  enabled: boolean;
  /** 数据库连接名称 */
  databaseConnection: string;
  /** 缓存服务名称 */
  cacheService?: string;
  /** 日志服务名称 */
  loggingService?: string;
  /** 隔离上下文 */
  isolationContext?: IsolationContext;
  /** 超时时间(毫秒) */
  timeout: number;
  /** 重试次数 */
  retryAttempts: number;
}

/**
 * 应用层集成服务
 */
@Injectable()
export class ApplicationKernelIntegrationService {
  private config: ApplicationKernelIntegrationConfig = {
    enabled: true,
    databaseConnection: 'default',
    timeout: 30000,
    retryAttempts: 3
  };

  constructor(
    private readonly connectionManager: IDatabaseConnectionManager,
    private readonly cacheService?: ICacheService,
    private readonly loggingService?: ILoggingService,
    private readonly isolationContext?: IsolationContext
  ) {}

  /**
   * 设置集成配置
   */
  setConfig(config: Partial<ApplicationKernelIntegrationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 初始化应用层集成
   */
  async initialize(): Promise<void> {
    try {
      if (!this.config.enabled) {
        return;
      }

      // 验证数据库连接
      await this.validateDatabaseConnection();
      
      // 验证缓存服务
      if (this.cacheService) {
        await this.validateCacheService();
      }
      
      // 验证日志服务
      if (this.loggingService) {
        await this.validateLoggingService();
      }

      // 记录集成初始化日志
      await this.logIntegrationEvent('INITIALIZED', '应用层集成初始化成功');
    } catch (error) {
      await this.logIntegrationEvent('INITIALIZATION_FAILED', `应用层集成初始化失败: ${error}`);
      throw new Error(`应用层集成初始化失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取数据库连接
   */
  async getDatabaseConnection(): Promise<any> {
    try {
      return await this.connectionManager.getConnection(this.config.databaseConnection);
    } catch (error) {
      throw new Error(`获取数据库连接失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取缓存服务
   */
  getCacheService(): ICacheService | undefined {
    return this.cacheService;
  }

  /**
   * 获取日志服务
   */
  getLoggingService(): ILoggingService | undefined {
    return this.loggingService;
  }

  /**
   * 获取隔离上下文
   */
  getIsolationContext(): IsolationContext | undefined {
    return this.isolationContext || this.config.isolationContext;
  }

  /**
   * 执行应用层操作
   */
  async executeApplicationOperation<T>(
    operation: (database: any, cache?: ICacheService, logging?: ILoggingService) => Promise<T>
  ): Promise<T> {
    try {
      const database = await this.getDatabaseConnection();
      const result = await operation(database, this.cacheService, this.loggingService);
      
      // 记录操作日志
      await this.logIntegrationEvent('OPERATION_EXECUTED', '应用层操作执行成功');
      
      return result;
    } catch (error) {
      await this.logIntegrationEvent('OPERATION_FAILED', `应用层操作执行失败: ${error}`);
      throw error;
    }
  }

  /**
   * 执行带缓存的应用层操作
   */
  async executeCachedApplicationOperation<T>(
    cacheKey: string,
    operation: (database: any) => Promise<T>,
    ttl?: number
  ): Promise<T> {
    try {
      // 尝试从缓存获取
      if (this.cacheService) {
        const cached = await this.cacheService.get<T>(cacheKey);
        if (cached) {
          return cached;
        }
      }

      // 执行操作
      const database = await this.getDatabaseConnection();
      const result = await operation(database);

      // 缓存结果
      if (this.cacheService) {
        await this.cacheService.set(cacheKey, result, { ttl });
      }

      return result;
    } catch (error) {
      throw new Error(`执行缓存应用层操作失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 执行事务性应用层操作
   */
  async executeTransactionalApplicationOperation<T>(
    operation: (database: any) => Promise<T>
  ): Promise<T> {
    try {
      const database = await this.getDatabaseConnection();
      
      return await database.transaction(async (trx: any) => {
        return await operation(trx);
      });
    } catch (error) {
      throw new Error(`执行事务性应用层操作失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 验证数据库连接
   */
  private async validateDatabaseConnection(): Promise<void> {
    try {
      const connection = await this.connectionManager.getConnection(this.config.databaseConnection);
      const isHealthy = await connection.healthCheck();
      
      if (!isHealthy) {
        throw new Error('数据库连接不健康');
      }
    } catch (error) {
      throw new Error(`数据库连接验证失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 验证缓存服务
   */
  private async validateCacheService(): Promise<void> {
    try {
      if (!this.cacheService) {
        throw new Error('缓存服务未配置');
      }
      
      const isHealthy = await this.cacheService.healthCheck();
      if (!isHealthy) {
        throw new Error('缓存服务不健康');
      }
    } catch (error) {
      throw new Error(`缓存服务验证失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 验证日志服务
   */
  private async validateLoggingService(): Promise<void> {
    try {
      if (!this.loggingService) {
        throw new Error('日志服务未配置');
      }
      
      // 简单的日志服务验证
      await this.loggingService.info(
        { requestId: 'validation', tenantId: 'system', operation: 'validation', resource: 'logging', timestamp: new Date(), level: 'info', message: '日志服务验证' },
        '日志服务验证测试'
      );
    } catch (error) {
      throw new Error(`日志服务验证失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 记录集成事件
   */
  private async logIntegrationEvent(event: string, message: string): Promise<void> {
    try {
      if (this.loggingService) {
        const logContext = {
          requestId: `integration_${Date.now()}`,
          tenantId: this.isolationContext?.tenantId || 'system',
          operation: 'integration',
          resource: 'application-kernel',
          timestamp: new Date(),
          level: 'info' as const,
          message
        };
        
        await this.loggingService.info(logContext, message);
      }
    } catch (error) {
      console.error('记录集成事件失败:', error);
    }
  }

  /**
   * 获取集成状态
   */
  getIntegrationStatus(): Record<string, any> {
    return {
      enabled: this.config.enabled,
      databaseConnection: this.config.databaseConnection,
      hasCacheService: !!this.cacheService,
      hasLoggingService: !!this.loggingService,
      hasIsolationContext: !!this.isolationContext,
      timeout: this.config.timeout,
      retryAttempts: this.config.retryAttempts
    };
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.config.enabled) {
        return true;
      }

      // 检查数据库连接
      const connection = await this.connectionManager.getConnection(this.config.databaseConnection);
      const dbHealthy = await connection.healthCheck();
      
      // 检查缓存服务
      let cacheHealthy = true;
      if (this.cacheService) {
        cacheHealthy = await this.cacheService.healthCheck();
      }
      
      return dbHealthy && cacheHealthy;
    } catch (error) {
      return false;
    }
  }
}
