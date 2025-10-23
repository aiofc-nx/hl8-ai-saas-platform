/**
 * 领域层集成服务
 *
 * @description 与@hl8/domain-kernel的集成服务
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import type { IDatabaseConnectionManager } from "../interfaces/database-adapter.interface.js";
import type { ICacheService } from "../interfaces/cache-service.interface.js";
import type { ILoggingService } from "../interfaces/logging-service.interface.js";
import type { IsolationContext } from "../types/isolation.types.js";

/**
 * 领域层集成配置
 */
export interface DomainKernelIntegrationConfig {
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
  /** 是否启用事件溯源 */
  enableEventSourcing: boolean;
  /** 是否启用聚合根缓存 */
  enableAggregateCaching: boolean;
}

/**
 * 领域层集成服务
 */
@Injectable()
export class DomainKernelIntegrationService {
  private config: DomainKernelIntegrationConfig = {
    enabled: true,
    databaseConnection: "default",
    timeout: 30000,
    retryAttempts: 3,
    enableEventSourcing: true,
    enableAggregateCaching: true,
  };

  constructor(
    private readonly connectionManager: IDatabaseConnectionManager,
    private readonly cacheService?: ICacheService,
    private readonly loggingService?: ILoggingService,
    private readonly isolationContext?: IsolationContext,
  ) {}

  /**
   * 设置集成配置
   */
  setConfig(config: Partial<DomainKernelIntegrationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 初始化领域层集成
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
      await this.logIntegrationEvent("INITIALIZED", "领域层集成初始化成功");
    } catch (_error) {
      await this.logIntegrationEvent(
        "INITIALIZATION_FAILED",
        `领域层集成初始化失败: ${_error}`,
      );
      throw new Error(
        `领域层集成初始化失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 获取数据库连接
   */
  async getDatabaseConnection(): Promise<any> {
    try {
      return await this.connectionManager.getConnection(
        this.config.databaseConnection,
      );
    } catch (_error) {
      throw new Error(
        `获取数据库连接失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
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
   * 执行领域层操作
   */
  async executeDomainOperation<T>(
    operation: (
      database: any,
      cache?: ICacheService,
      logging?: ILoggingService,
    ) => Promise<T>,
  ): Promise<T> {
    try {
      const database = await this.getDatabaseConnection();
      const result = await operation(
        database,
        this.cacheService,
        this.loggingService,
      );

      // 记录操作日志
      await this.logIntegrationEvent(
        "OPERATION_EXECUTED",
        "领域层操作执行成功",
      );

      return result;
    } catch (_error) {
      await this.logIntegrationEvent(
        "OPERATION_FAILED",
        `领域层操作执行失败: ${_error}`,
      );
      throw _error;
    }
  }

  /**
   * 执行聚合根操作
   */
  async executeAggregateOperation<T>(
    aggregateId: string,
    operation: (database: any) => Promise<T>,
  ): Promise<T> {
    try {
      const database = await this.getDatabaseConnection();

      // 检查聚合根缓存
      if (this.config.enableAggregateCaching && this.cacheService) {
        const cacheKey = `aggregate:${aggregateId}`;
        const cached = await this.cacheService.get<T>(cacheKey);
        if (cached) {
          return cached;
        }
      }

      // 执行操作
      const result = await operation(database);

      // 缓存聚合根
      if (this.config.enableAggregateCaching && this.cacheService) {
        const cacheKey = `aggregate:${aggregateId}`;
        await this.cacheService.set(cacheKey, result);
      }

      return result;
    } catch (_error) {
      throw new Error(
        `执行聚合根操作失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 执行事件溯源操作
   */
  async executeEventSourcingOperation<T>(
    aggregateId: string,
    operation: (database: any) => Promise<T>,
  ): Promise<T> {
    try {
      if (!this.config.enableEventSourcing) {
        throw new Error("事件溯源未启用");
      }

      const database = await this.getDatabaseConnection();

      // 在事务中执行事件溯源操作
      return await database.transaction(async (trx: any) => {
        return await operation(trx);
      });
    } catch (_error) {
      throw new Error(
        `执行事件溯源操作失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 执行领域事件操作
   */
  async executeDomainEventOperation<T>(
    eventType: string,
    eventData: any,
    operation: (database: any) => Promise<T>,
  ): Promise<T> {
    try {
      const database = await this.getDatabaseConnection();

      // 记录领域事件
      await this.logDomainEvent(eventType, eventData);

      // 执行操作
      const result = await operation(database);

      return result;
    } catch (_error) {
      throw new Error(
        `执行领域事件操作失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 验证数据库连接
   */
  private async validateDatabaseConnection(): Promise<void> {
    try {
      const connection = await this.connectionManager.getConnection(
        this.config.databaseConnection,
      );
      const isHealthy = await connection.healthCheck();

      if (!isHealthy) {
        throw new Error("数据库连接不健康");
      }
    } catch (_error) {
      throw new Error(
        `数据库连接验证失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 验证缓存服务
   */
  private async validateCacheService(): Promise<void> {
    try {
      if (!this.cacheService) {
        throw new Error("缓存服务未配置");
      }

      const isHealthy = await this.cacheService.healthCheck();
      if (!isHealthy) {
        throw new Error("缓存服务不健康");
      }
    } catch (_error) {
      throw new Error(
        `缓存服务验证失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 验证日志服务
   */
  private async validateLoggingService(): Promise<void> {
    try {
      if (!this.loggingService) {
        throw new Error("日志服务未配置");
      }

      // 简单的日志服务验证
      await this.loggingService.info(
        {
          requestId: "validation",
          tenantId: "system",
          operation: "validation",
          resource: "logging",
          timestamp: new Date(),
          level: "info",
          message: "日志服务验证",
        },
        "日志服务验证测试",
      );
    } catch (_error) {
      throw new Error(
        `日志服务验证失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 记录集成事件
   */
  private async logIntegrationEvent(
    event: string,
    message: string,
  ): Promise<void> {
    try {
      if (this.loggingService) {
        const logContext = {
          requestId: `domain_integration_${Date.now()}`,
          tenantId: this.isolationContext?.tenantId || "system",
          operation: "domain-integration",
          resource: "domain-kernel",
          timestamp: new Date(),
          level: "info" as const,
          message,
        };

        await this.loggingService.info(logContext, message);
      }
    } catch (_error) {
      console.error("记录集成事件失败:", _error);
    }
  }

  /**
   * 记录领域事件
   */
  private async logDomainEvent(
    eventType: string,
    eventData: any,
  ): Promise<void> {
    try {
      if (this.loggingService) {
        const logContext = {
          requestId: `domain_event_${Date.now()}`,
          tenantId: this.isolationContext?.tenantId || "system",
          operation: "domain-event",
          resource: "domain-kernel",
          timestamp: new Date(),
          level: "info" as const,
          message: `领域事件: ${eventType}`,
        };

        await this.loggingService.info(
          logContext,
          `领域事件: ${eventType}`,
          eventData,
        );
      }
    } catch (_error) {
      console.error("记录领域事件失败:", _error);
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
      retryAttempts: this.config.retryAttempts,
      enableEventSourcing: this.config.enableEventSourcing,
      enableAggregateCaching: this.config.enableAggregateCaching,
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
      const connection = await this.connectionManager.getConnection(
        this.config.databaseConnection,
      );
      const dbHealthy = await connection.healthCheck();

      // 检查缓存服务
      let cacheHealthy = true;
      if (this.cacheService) {
        cacheHealthy = await this.cacheService.healthCheck();
      }

      return dbHealthy && cacheHealthy;
    } catch (_error) {
      return false;
    }
  }
}
