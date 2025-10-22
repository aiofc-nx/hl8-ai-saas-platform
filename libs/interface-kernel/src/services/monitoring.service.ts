/**
 * @fileoverview 监控服务
 * @description 提供系统监控功能，包括指标收集、性能监控、日志记录等
 */

import { Injectable, Logger } from "@nestjs/common";
import type { MetricData, InterfaceFastifyRequest } from "../types/index.js";

/**
 * 性能指标接口
 */
interface PerformanceMetrics {
  requestCount: number;
  responseTime: number;
  errorCount: number;
  successRate: number;
  throughput: number;
  memoryUsage: number;
  cpuUsage: number;
}

/**
 * 监控服务
 * @description 提供系统监控相关功能
 */
@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private readonly metrics: Map<string, MetricData[]> = new Map();
  private readonly performanceMetrics: PerformanceMetrics = {
    requestCount: 0,
    responseTime: 0,
    errorCount: 0,
    successRate: 100,
    throughput: 0,
    memoryUsage: 0,
    cpuUsage: 0,
  };
  private readonly startTime: number = Date.now();
  private metricsCollectionInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.logger.log("Monitoring Service initialized");
    this.startMetricsCollection();
  }

  /**
   * 记录请求指标
   * @description 记录HTTP请求的相关指标
   * @param request 请求对象
   * @param responseTime 响应时间
   * @param statusCode 状态码
   */
  recordRequestMetrics(
    request: InterfaceFastifyRequest,
    responseTime: number,
    statusCode: number,
  ): void {
    try {
      this.logger.debug(
        `Recording request metrics for ${request.method} ${request.url}`,
      );

      // 更新性能指标
      this.performanceMetrics.requestCount++;
      this.performanceMetrics.responseTime = responseTime;

      if (statusCode >= 400) {
        this.performanceMetrics.errorCount++;
      }

      // 计算成功率
      this.performanceMetrics.successRate =
        ((this.performanceMetrics.requestCount -
          this.performanceMetrics.errorCount) /
          this.performanceMetrics.requestCount) *
        100;

      // 计算吞吐量（请求/秒）
      const uptime = (Date.now() - this.startTime) / 1000;
      this.performanceMetrics.throughput =
        this.performanceMetrics.requestCount / uptime;

      // 记录详细指标
      this.recordMetric("http_requests_total", 1, {
        method: request.method,
        url: request.url,
        status_code: statusCode.toString(),
        tenant_id: request.tenantId || "unknown",
      });

      this.recordMetric("http_request_duration_seconds", responseTime / 1000, {
        method: request.method,
        url: request.url,
        status_code: statusCode.toString(),
      });

      this.recordMetric(
        "http_request_size_bytes",
        this.getRequestSize(request),
        {
          method: request.method,
          url: request.url,
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to record request metrics: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 记录错误指标
   * @description 记录系统错误的相关指标
   * @param error 错误对象
   * @param context 错误上下文
   */
  recordErrorMetrics(error: Error, context?: any): void {
    try {
      this.logger.debug(
        `Recording error metrics: ${error instanceof Error ? error.message : String(error)}`,
      );

      this.recordMetric("errors_total", 1, {
        error_type: error.constructor.name,
        error_message: error instanceof Error ? error.message : String(error),
        context: context ? JSON.stringify(context) : "unknown",
      });
    } catch (err) {
      this.logger.error(
        `Failed to record error metrics: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  /**
   * 记录业务指标
   * @description 记录业务相关的指标
   * @param name 指标名称
   * @param value 指标值
   * @param labels 标签
   */
  recordBusinessMetric(
    name: string,
    value: number,
    labels?: Record<string, string>,
  ): void {
    try {
      this.logger.debug(`Recording business metric: ${name} = ${value}`);

      this.recordMetric(name, value, labels);
    } catch (error) {
      this.logger.error(
        `Failed to record business metric: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 记录指标
   * @description 记录通用指标
   * @param name 指标名称
   * @param value 指标值
   * @param labels 标签
   */
  private recordMetric(
    name: string,
    value: number,
    labels?: Record<string, string>,
  ): void {
    try {
      const metric: MetricData = {
        name,
        value,
        labels: labels || {},
        timestamp: Date.now(),
      };

      const metrics = this.metrics.get(name) || [];
      metrics.push(metric);

      // 只保留最近1000个指标
      if (metrics.length > 1000) {
        metrics.splice(0, metrics.length - 1000);
      }

      this.metrics.set(name, metrics);
    } catch (error) {
      this.logger.error(
        `Failed to record metric: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 获取性能指标
   * @description 获取当前系统性能指标
   * @returns 性能指标
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * 获取指标数据
   * @description 获取指定指标的最近数据
   * @param name 指标名称
   * @param limit 数据条数限制
   * @returns 指标数据
   */
  getMetricData(name: string, limit?: number): MetricData[] {
    const metrics = this.metrics.get(name) || [];
    return limit ? metrics.slice(-limit) : metrics;
  }

  /**
   * 获取所有指标名称
   * @description 获取所有已记录的指标名称
   * @returns 指标名称列表
   */
  getAllMetricNames(): string[] {
    return Array.from(this.metrics.keys());
  }

  /**
   * 获取系统信息
   * @description 获取系统运行信息
   * @returns 系统信息
   */
  getSystemInfo(): {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    version: string;
    platform: string;
    arch: string;
  } {
    return {
      uptime: Date.now() - this.startTime,
      memoryUsage: process.memoryUsage(),
      version: process.version,
      platform: process.platform,
      arch: process.arch,
    };
  }

  /**
   * 获取请求大小
   * @description 计算请求的大小
   * @param request 请求对象
   * @returns 请求大小（字节）
   */
  private getRequestSize(request: InterfaceFastifyRequest): number {
    try {
      let size = 0;

      // 计算URL大小
      size += Buffer.byteLength(request.url, "utf8");

      // 计算请求头大小
      for (const [key, value] of Object.entries(request.headers)) {
        size += Buffer.byteLength(key, "utf8");
        size += Buffer.byteLength(value as string, "utf8");
      }

      // 计算请求体大小
      if (request.body) {
        size += Buffer.byteLength(JSON.stringify(request.body), "utf8");
      }

      return size;
    } catch (error) {
      this.logger.error(
        `Failed to calculate request size: ${error instanceof Error ? error.message : String(error)}`,
      );
      return 0;
    }
  }

  /**
   * 启动指标收集
   * @description 启动定期收集系统指标的任务
   */
  private startMetricsCollection(): void {
    try {
      // 每30秒收集一次系统指标
      this.metricsCollectionInterval = setInterval(() => {
        this.collectSystemMetrics();
      }, 30 * 1000);

      this.logger.debug("Metrics collection started");
    } catch (error) {
      this.logger.error(
        `Failed to start metrics collection: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 收集系统指标
   * @description 收集系统运行指标
   */
  private collectSystemMetrics(): void {
    try {
      const memoryUsage = process.memoryUsage();

      // 记录内存使用情况
      this.recordMetric("memory_usage_bytes", memoryUsage.heapUsed, {
        type: "heap_used",
      });

      this.recordMetric("memory_usage_bytes", memoryUsage.heapTotal, {
        type: "heap_total",
      });

      this.recordMetric("memory_usage_bytes", memoryUsage.rss, {
        type: "rss",
      });

      this.recordMetric("memory_usage_bytes", memoryUsage.external, {
        type: "external",
      });

      // 记录CPU使用情况（简化版本）
      const cpuUsage = process.cpuUsage();
      this.recordMetric("cpu_usage_microseconds", cpuUsage.user, {
        type: "user",
      });

      this.recordMetric("cpu_usage_microseconds", cpuUsage.system, {
        type: "system",
      });

      // 更新性能指标中的内存使用情况
      this.performanceMetrics.memoryUsage = memoryUsage.heapUsed;
    } catch (error) {
      this.logger.error(
        `Failed to collect system metrics: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 清理旧指标
   * @description 清理过期的指标数据
   * @param maxAge 最大保留时间（毫秒）
   */
  cleanupOldMetrics(maxAge: number = 24 * 60 * 60 * 1000): void {
    try {
      const cutoffTime = Date.now() - maxAge;
      let cleanedCount = 0;

      for (const [name, metrics] of this.metrics.entries()) {
        const filteredMetrics = metrics.filter(
          (metric) => metric.timestamp > cutoffTime,
        );

        if (filteredMetrics.length !== metrics.length) {
          this.metrics.set(name, filteredMetrics);
          cleanedCount += metrics.length - filteredMetrics.length;
        }
      }

      if (cleanedCount > 0) {
        this.logger.debug(`Cleaned up ${cleanedCount} old metrics`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to cleanup old metrics: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 导出指标数据
   * @description 导出所有指标数据
   * @returns 指标数据
   */
  exportMetrics(): Record<string, MetricData[]> {
    const exported: Record<string, MetricData[]> = {};

    for (const [name, metrics] of this.metrics.entries()) {
      exported[name] = [...metrics];
    }

    return exported;
  }

  /**
   * 重置指标
   * @description 重置所有指标数据
   */
  resetMetrics(): void {
    try {
      this.metrics.clear();
      this.performanceMetrics.requestCount = 0;
      this.performanceMetrics.responseTime = 0;
      this.performanceMetrics.errorCount = 0;
      this.performanceMetrics.successRate = 100;
      this.performanceMetrics.throughput = 0;
      this.performanceMetrics.memoryUsage = 0;
      this.performanceMetrics.cpuUsage = 0;

      this.logger.debug("All metrics reset");
    } catch (error) {
      this.logger.error(
        `Failed to reset metrics: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 清理资源
   * @description 清理定时器和资源，用于测试环境
   */
  cleanup(): void {
    try {
      if (this.metricsCollectionInterval) {
        clearInterval(this.metricsCollectionInterval);
        this.metricsCollectionInterval = null;
        this.logger.debug("Metrics collection stopped");
      }
    } catch (error) {
      this.logger.error(
        `Failed to cleanup monitoring service: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 销毁服务
   * @description 销毁服务时清理资源
   */
  onDestroy(): void {
    this.cleanup();
  }
}
