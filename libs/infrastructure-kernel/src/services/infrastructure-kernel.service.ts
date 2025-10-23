/**
 * 基础设施层kernel服务
 *
 * @description 统一管理基础设施层的所有服务
 * @since 1.0.0
 */

import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { DatabaseService } from "./database/database-service.js";
import { ConnectionPoolService } from "./database/connection-pool-service.js";
import { TransactionService } from "./database/transaction-service.js";
import { CacheService } from "./cache/cache-service.js";
import { IsolationManager } from "./isolation/isolation-manager.js";
import { PerformanceMonitorService } from "./performance/performance-monitor.js";
import { HealthCheckService } from "./performance/health-check-service.js";
import { MetricsCollectorService } from "./performance/metrics-collector.js";
import { PerformanceOptimizerService } from "./performance/performance-optimizer.js";
import { MonitoringDashboardService } from "./performance/monitoring-dashboard.js";
import { ErrorHandlerService } from "./error-handling/error-handler.js";
import { CircuitBreakerService } from "./error-handling/circuit-breaker.js";
import { RetryManagerService } from "./error-handling/retry-manager.js";
import { ApplicationKernelIntegrationService } from "../integration/application-kernel-integration.js";
import { DomainKernelIntegrationService } from "../integration/domain-kernel-integration.js";

/**
 * 基础设施层kernel服务
 */
@Injectable()
export class InfrastructureKernelService
  implements OnModuleInit, OnModuleDestroy
{
  private _isInitialized = false;
  private services = new Map<string, unknown>();

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly connectionPoolService: ConnectionPoolService,
    private readonly transactionService: TransactionService,
    private readonly cacheService: CacheService,
    private readonly isolationManager: IsolationManager,
    private readonly performanceMonitor: PerformanceMonitorService,
    private readonly healthCheckService: HealthCheckService,
    private readonly metricsCollector: MetricsCollectorService,
    private readonly performanceOptimizer: PerformanceOptimizerService,
    private readonly monitoringDashboard: MonitoringDashboardService,
    private readonly errorHandler: ErrorHandlerService,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly retryManager: RetryManagerService,
    private readonly applicationKernelIntegration: ApplicationKernelIntegrationService,
    private readonly domainKernelIntegration: DomainKernelIntegrationService,
  ) {
    this.registerServices();
  }

  /**
   * 模块初始化
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.initialize();
      this._isInitialized = true;
    } catch (_error) {
      console.error("基础设施层kernel初始化失败:", _error);
      throw _error;
    }
  }

  /**
   * 模块销毁
   */
  async onModuleDestroy(): Promise<void> {
    try {
      await this.shutdown();
    } catch (_error) {
      console.error("基础设施层kernel关闭失败:", _error);
    }
  }

  /**
   * 初始化基础设施层
   */
  async initialize(): Promise<void> {
    try {
      // 初始化数据库服务
      // await this.databaseService.initialize();

      // 初始化连接池服务
      // await this.connectionPoolService.initialize();

      // 初始化缓存服务
      // await this.cacheService.initialize();

      // 初始化隔离管理器
      // await this.isolationManager.initialize();

      // 初始化性能监控
      this.performanceMonitor.startMonitoring();

      // 初始化健康检查
      // await this.healthCheckService.initialize();

      // 初始化指标收集器
      // await this.metricsCollector.initialize();

      // 初始化性能优化器
      this.performanceOptimizer.startAutoOptimization();

      // 初始化监控仪表板
      this.monitoringDashboard.startDashboardRefresh();

      // 初始化错误处理
      // await this.errorHandler.initialize();

      // 初始化熔断器
      // await this.circuitBreaker.initialize();

      // 初始化重试管理器
      // await this.retryManager.initialize();

      // 初始化应用层集成
      await this.applicationKernelIntegration.initialize();

      // 初始化领域层集成
      await this.domainKernelIntegration.initialize();

      console.log("基础设施层kernel初始化完成");
    } catch (_error) {
      throw new Error(
        `基础设施层kernel初始化失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 关闭基础设施层
   */
  async shutdown(): Promise<void> {
    try {
      // 停止性能监控
      this.performanceMonitor.stopMonitoring();

      // 停止性能优化器
      this.performanceOptimizer.stopAutoOptimization();

      // 停止监控仪表板
      this.monitoringDashboard.stopDashboardRefresh();

      // 关闭数据库连接
      // await this.databaseService.disconnectAll();

      // 关闭连接池
      await this.connectionPoolService.closeAllPools();

      // 关闭缓存服务
      // await this.cacheService.shutdown();

      // 关闭隔离管理器
      // await this.isolationManager.shutdown();

      console.log("基础设施层kernel关闭完成");
    } catch (_error) {
      console.error("基础设施层kernel关闭失败:", _error);
    }
  }

  /**
   * 获取服务
   */
  getService<T>(name: string): T | undefined {
    return this.services.get(name) as T;
  }

  /**
   * 获取所有服务
   */
  getAllServices(): Record<string, unknown> {
    return Object.fromEntries(this.services);
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const healthChecks: Record<string, boolean> = {};

    try {
      // 检查数据库服务
      const dbHealth = await this.databaseService.healthCheck();
      healthChecks["database"] =
        typeof dbHealth === "boolean"
          ? dbHealth
          : Object.values(dbHealth).every((status) => status === true);

      // 检查连接池服务
      const poolHealth = await this.connectionPoolService.healthCheck();
      healthChecks["connectionPool"] =
        typeof poolHealth === "boolean"
          ? poolHealth
          : Object.values(poolHealth).every((status) => status === true);

      // 检查缓存服务
      const cacheHealth = await this.cacheService.healthCheck();
      healthChecks["cache"] =
        typeof cacheHealth === "boolean"
          ? cacheHealth
          : Object.values(cacheHealth).every((status) => status === true);

      // 检查隔离管理器
      const isolationHealth = await this.isolationManager.healthCheck();
      healthChecks["isolation"] =
        typeof isolationHealth === "boolean"
          ? isolationHealth
          : Object.values(isolationHealth).every((status) => status === true);

      // 检查性能监控
      healthChecks["performanceMonitor"] =
        await this.performanceMonitor.healthCheck();

      // 检查健康检查服务
      healthChecks["healthCheck"] = await this.healthCheckService.healthCheck();

      // 检查指标收集器
      healthChecks["metricsCollector"] =
        await this.metricsCollector.healthCheck();

      // 检查性能优化器
      healthChecks["performanceOptimizer"] =
        await this.performanceOptimizer.healthCheck();

      // 检查监控仪表板
      healthChecks["monitoringDashboard"] =
        await this.monitoringDashboard.healthCheck();

      // 检查错误处理器
      healthChecks["errorHandler"] = await this.errorHandler.healthCheck();

      // 检查熔断器
      healthChecks["circuitBreaker"] = await this.circuitBreaker.healthCheck();

      // 检查重试管理器
      healthChecks["retryManager"] = await this.retryManager.healthCheck();

      // 检查应用层集成
      healthChecks["applicationKernelIntegration"] =
        await this.applicationKernelIntegration.healthCheck();

      // 检查领域层集成
      healthChecks["domainKernelIntegration"] =
        await this.domainKernelIntegration.healthCheck();
    } catch (_error) {
      console.error("健康检查失败:", _error);
      // 设置所有服务为不健康
      for (const key of Object.keys(healthChecks)) {
        healthChecks[key] = false;
      }
    }

    return healthChecks;
  }

  /**
   * 获取系统状态
   */
  async getSystemStatus(): Promise<Record<string, unknown>> {
    try {
      const healthChecks = await this.healthCheck();
      const performanceStats = this.performanceMonitor.getPerformanceStats();
      const isolationStats = await this.isolationManager.getIsolationStats();
      const errorStats = this.errorHandler.getErrorStats();

      return {
        initialized: this._isInitialized,
        healthChecks,
        performance: performanceStats,
        isolation: isolationStats,
        errors: errorStats,
        services: this.getAllServices(),
      };
    } catch (_error) {
      throw new Error(
        `获取系统状态失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 注册服务
   */
  private registerServices(): void {
    this.services.set("database", this.databaseService);
    this.services.set("connectionPool", this.connectionPoolService);
    this.services.set("transaction", this.transactionService);
    this.services.set("cache", this.cacheService);
    this.services.set("isolation", this.isolationManager);
    this.services.set("performanceMonitor", this.performanceMonitor);
    this.services.set("healthCheck", this.healthCheckService);
    this.services.set("metricsCollector", this.metricsCollector);
    this.services.set("performanceOptimizer", this.performanceOptimizer);
    this.services.set("monitoringDashboard", this.monitoringDashboard);
    this.services.set("errorHandler", this.errorHandler);
    this.services.set("circuitBreaker", this.circuitBreaker);
    this.services.set("retryManager", this.retryManager);
    this.services.set(
      "applicationKernelIntegration",
      this.applicationKernelIntegration,
    );
    this.services.set("domainKernelIntegration", this.domainKernelIntegration);
  }

  /**
   * 获取初始化状态
   */
  isInitialized(): boolean {
    return this._isInitialized;
  }
}
