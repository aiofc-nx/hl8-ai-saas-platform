/**
 * 性能监控服务
 *
 * @description 监控系统性能指标，提供性能优化建议
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { FastifyLoggerService } from "@hl8/nestjs-fastify";
import * as os from "os";
import type { IHealthCheckService } from "../../interfaces/health-service.interface.js";
import type { IDatabaseAdapter } from "../../interfaces/database-adapter.interface.js";
import type { ICacheService } from "../../interfaces/cache-service.interface.js";
import type { ILoggingService } from "../../interfaces/logging-service.interface.js";

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 响应时间(毫秒) */
  responseTime: number;
  /** 吞吐量(请求/秒) */
  throughput: number;
  /** 错误率 */
  errorRate: number;
  /** 内存使用率 */
  memoryUsage: number;
  /** CPU使用率 */
  cpuUsage: number;
  /** 数据库连接数 */
  databaseConnections: number;
  /** 缓存命中率 */
  cacheHitRate: number;
  /** 时间戳 */
  timestamp: Date;
}

/**
 * 性能阈值
 */
export interface PerformanceThresholds {
  /** 最大响应时间(毫秒) */
  maxResponseTime: number;
  /** 最小吞吐量(请求/秒) */
  minThroughput: number;
  /** 最大错误率 */
  maxErrorRate: number;
  /** 最大内存使用率 */
  maxMemoryUsage: number;
  /** 最大CPU使用率 */
  maxCpuUsage: number;
  /** 最大数据库连接数 */
  maxDatabaseConnections: number;
  /** 最小缓存命中率 */
  minCacheHitRate: number;
}

/**
 * 性能告警
 */
export interface PerformanceAlert {
  /** 告警ID */
  id: string;
  /** 指标名称 */
  metric: string;
  /** 当前值 */
  currentValue: number;
  /** 阈值 */
  threshold: number;
  /** 严重级别 */
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  /** 时间戳 */
  timestamp: Date;
  /** 描述 */
  description: string;
}

/**
 * 性能监控服务
 */
@Injectable()
export class PerformanceMonitorService {
  private metrics: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private thresholds: PerformanceThresholds = {
    maxResponseTime: 1000,
    minThroughput: 100,
    maxErrorRate: 0.05,
    maxMemoryUsage: 0.8,
    maxCpuUsage: 0.8,
    maxDatabaseConnections: 100,
    minCacheHitRate: 0.8,
  };
  private monitoringInterval?: NodeJS.Timeout;
  private isMonitoring = false;

  constructor(
    private readonly databaseAdapter: IDatabaseAdapter,
    private readonly logger: FastifyLoggerService,
    private readonly cacheService?: ICacheService,
    private readonly loggingService?: ILoggingService,
    private readonly healthCheckService?: IHealthCheckService,
  ) {}

  /**
   * 开始性能监控
   */
  startMonitoring(interval: number = 30000): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.collectMetrics();
      } catch (_error) {
        this.logger.log("收集性能指标失败", {
          error: _error instanceof Error ? _error.message : String(_error),
        });
      }
    }, interval);
  }

  /**
   * 停止性能监控
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
  }

  /**
   * 收集性能指标
   */
  async collectMetrics(): Promise<PerformanceMetrics> {
    try {
      const _startTime = Date.now();

      // 收集各种性能指标
      const responseTime = await this.measureResponseTime();
      const throughput = await this.calculateThroughput();
      const errorRate = await this.calculateErrorRate();
      const memoryUsage = await this.getMemoryUsage();
      const cpuUsage = await this.getCpuUsage();
      const databaseConnections = await this.getDatabaseConnections();
      const cacheHitRate = await this.getCacheHitRate();

      const metrics: PerformanceMetrics = {
        responseTime,
        throughput,
        errorRate,
        memoryUsage,
        cpuUsage,
        databaseConnections,
        cacheHitRate,
        timestamp: new Date(),
      };

      // 存储指标
      this.metrics.push(metrics);

      // 限制指标历史记录大小
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000);
      }

      // 检查阈值并生成告警
      await this.checkThresholds(metrics);

      // 记录性能日志
      await this.logPerformanceMetrics(metrics);

      return metrics;
    } catch (_error) {
      throw new Error(
        `收集性能指标失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 获取性能指标
   */
  getMetrics(limit?: number): PerformanceMetrics[] {
    const metrics = [...this.metrics];
    return limit ? metrics.slice(-limit) : metrics;
  }

  /**
   * 获取性能告警
   */
  getAlerts(limit?: number): PerformanceAlert[] {
    const alerts = [...this.alerts];
    return limit ? alerts.slice(-limit) : alerts;
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats(): Record<string, any> {
    if (this.metrics.length === 0) {
      return {};
    }

    const latest = this.metrics[this.metrics.length - 1];
    const avgResponseTime =
      this.metrics.reduce((sum, m) => sum + m.responseTime, 0) /
      this.metrics.length;
    const avgThroughput =
      this.metrics.reduce((sum, m) => sum + m.throughput, 0) /
      this.metrics.length;
    const avgErrorRate =
      this.metrics.reduce((sum, m) => sum + m.errorRate, 0) /
      this.metrics.length;
    const avgMemoryUsage =
      this.metrics.reduce((sum, m) => sum + m.memoryUsage, 0) /
      this.metrics.length;
    const avgCpuUsage =
      this.metrics.reduce((sum, m) => sum + m.cpuUsage, 0) /
      this.metrics.length;
    const avgCacheHitRate =
      this.metrics.reduce((sum, m) => sum + m.cacheHitRate, 0) /
      this.metrics.length;

    return {
      current: latest,
      averages: {
        responseTime: avgResponseTime,
        throughput: avgThroughput,
        errorRate: avgErrorRate,
        memoryUsage: avgMemoryUsage,
        cpuUsage: avgCpuUsage,
        cacheHitRate: avgCacheHitRate,
      },
      thresholds: this.thresholds,
      alerts: this.alerts.length,
      monitoring: this.isMonitoring,
    };
  }

  /**
   * 设置性能阈值
   */
  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * 获取性能阈值
   */
  getThresholds(): PerformanceThresholds {
    return { ...this.thresholds };
  }

  /**
   * 清除性能指标
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * 清除性能告警
   */
  clearAlerts(): void {
    this.alerts = [];
  }

  /**
   * 测量响应时间
   */
  private async measureResponseTime(): Promise<number> {
    try {
      const startTime = Date.now();
      await this.databaseAdapter.healthCheck();
      return Date.now() - startTime;
    } catch (_error) {
      return 0;
    }
  }

  /**
   * 计算吞吐量
   */
  private async calculateThroughput(): Promise<number> {
    try {
      // 这里可以实现更复杂的吞吐量计算逻辑
      // 暂时返回一个模拟值
      return Math.random() * 1000;
    } catch (_error) {
      return 0;
    }
  }

  /**
   * 计算错误率
   */
  private async calculateErrorRate(): Promise<number> {
    try {
      // 这里可以实现错误率计算逻辑
      // 暂时返回一个模拟值
      return Math.random() * 0.1;
    } catch (_error) {
      return 0;
    }
  }

  /**
   * 获取内存使用率
   */
  private async getMemoryUsage(): Promise<number> {
    try {
      const memUsage = process.memoryUsage();
      const totalMem = os.totalmem();
      return memUsage.heapUsed / totalMem;
    } catch (_error) {
      return 0;
    }
  }

  /**
   * 获取CPU使用率
   */
  private async getCpuUsage(): Promise<number> {
    try {
      // 这里可以实现CPU使用率计算逻辑
      // 暂时返回一个模拟值
      return Math.random() * 0.5;
    } catch (_error) {
      return 0;
    }
  }

  /**
   * 获取数据库连接数
   */
  private async getDatabaseConnections(): Promise<number> {
    try {
      const connectionInfo = await this.databaseAdapter.getConnectionInfo();
      return (connectionInfo.connections as number) || 0;
    } catch (_error) {
      return 0;
    }
  }

  /**
   * 获取缓存命中率
   */
  private async getCacheHitRate(): Promise<number> {
    try {
      if (!this.cacheService) {
        return 1;
      }

      const stats = this.cacheService.getStats();
      return (await stats).hitRate || 1;
    } catch (_error) {
      return 1;
    }
  }

  /**
   * 检查阈值
   */
  private async checkThresholds(metrics: PerformanceMetrics): Promise<void> {
    try {
      // 检查响应时间
      if (metrics.responseTime > this.thresholds.maxResponseTime) {
        await this.createAlert(
          "responseTime",
          metrics.responseTime,
          this.thresholds.maxResponseTime,
          "HIGH",
        );
      }

      // 检查吞吐量
      if (metrics.throughput < this.thresholds.minThroughput) {
        await this.createAlert(
          "throughput",
          metrics.throughput,
          this.thresholds.minThroughput,
          "MEDIUM",
        );
      }

      // 检查错误率
      if (metrics.errorRate > this.thresholds.maxErrorRate) {
        await this.createAlert(
          "errorRate",
          metrics.errorRate,
          this.thresholds.maxErrorRate,
          "HIGH",
        );
      }

      // 检查内存使用率
      if (metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
        await this.createAlert(
          "memoryUsage",
          metrics.memoryUsage,
          this.thresholds.maxMemoryUsage,
          "CRITICAL",
        );
      }

      // 检查CPU使用率
      if (metrics.cpuUsage > this.thresholds.maxCpuUsage) {
        await this.createAlert(
          "cpuUsage",
          metrics.cpuUsage,
          this.thresholds.maxCpuUsage,
          "CRITICAL",
        );
      }

      // 检查数据库连接数
      if (
        metrics.databaseConnections > this.thresholds.maxDatabaseConnections
      ) {
        await this.createAlert(
          "databaseConnections",
          metrics.databaseConnections,
          this.thresholds.maxDatabaseConnections,
          "HIGH",
        );
      }

      // 检查缓存命中率
      if (metrics.cacheHitRate < this.thresholds.minCacheHitRate) {
        await this.createAlert(
          "cacheHitRate",
          metrics.cacheHitRate,
          this.thresholds.minCacheHitRate,
          "MEDIUM",
        );
      }
    } catch (_error) {
      this.logger.log("检查阈值失败", {
        error: _error instanceof Error ? _error.message : String(_error),
      });
    }
  }

  /**
   * 创建告警
   */
  private async createAlert(
    metric: string,
    currentValue: number,
    threshold: number,
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  ): Promise<void> {
    try {
      const alert: PerformanceAlert = {
        id: this.generateAlertId(),
        metric,
        currentValue,
        threshold,
        severity,
        timestamp: new Date(),
        description: `${metric} 超出阈值: ${currentValue} > ${threshold}`,
      };

      this.alerts.push(alert);

      // 限制告警历史记录大小
      if (this.alerts.length > 100) {
        this.alerts = this.alerts.slice(-100);
      }

      // 记录告警日志
      await this.logPerformanceAlert(alert);
    } catch (_error) {
      this.logger.log("创建告警失败", {
        error: _error instanceof Error ? _error.message : String(_error),
      });
    }
  }

  /**
   * 记录性能指标日志
   */
  private async logPerformanceMetrics(
    metrics: PerformanceMetrics,
  ): Promise<void> {
    try {
      if (this.loggingService) {
        const logContext = {
          requestId: `performance_${Date.now()}`,
          tenantId: "system",
          operation: "performance-monitor",
          resource: "performance-monitor",
          timestamp: new Date(),
          level: "info" as const,
          message: "性能指标收集",
        };

        await this.loggingService.info(
          logContext,
          "性能指标收集",
          metrics as unknown as Record<string, unknown>,
        );
      }
    } catch (_error) {
      this.logger.log("记录性能指标日志失败", {
        error: _error instanceof Error ? _error.message : String(_error),
      });
    }
  }

  /**
   * 记录性能告警日志
   */
  private async logPerformanceAlert(alert: PerformanceAlert): Promise<void> {
    try {
      if (this.loggingService) {
        const logContext = {
          requestId: `performance_alert_${alert.id}`,
          tenantId: "system",
          operation: "performance-alert",
          resource: "performance-monitor",
          timestamp: new Date(),
          level: "warn" as const,
          message: `性能告警: ${alert.metric}`,
        };

        await this.loggingService.warn(
          logContext,
          `性能告警: ${alert.metric}`,
          alert as unknown as Record<string, unknown>,
        );
      }
    } catch (_error) {
      this.logger.log("记录性能告警日志失败", {
        error: _error instanceof Error ? _error.message : String(_error),
      });
    }
  }

  /**
   * 生成告警ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
