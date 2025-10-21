/**
 * 指标收集器
 *
 * @description 收集和聚合系统性能指标
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import type { IDatabaseAdapter } from '../interfaces/database-adapter.interface.js';
import type { ICacheService } from '../interfaces/cache-service.interface.js';
import type { ILoggingService } from '../interfaces/logging-service.interface.js';

/**
 * 指标类型
 */
export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';

/**
 * 指标标签
 */
export interface MetricLabel {
  name: string;
  value: string;
}

/**
 * 指标值
 */
export interface MetricValue {
  /** 指标名称 */
  name: string;
  /** 指标类型 */
  type: MetricType;
  /** 指标值 */
  value: number;
  /** 标签 */
  labels?: MetricLabel[];
  /** 时间戳 */
  timestamp: Date;
  /** 描述 */
  description?: string;
}

/**
 * 指标聚合
 */
export interface MetricAggregation {
  /** 指标名称 */
  name: string;
  /** 总数 */
  count: number;
  /** 总和 */
  sum: number;
  /** 平均值 */
  average: number;
  /** 最小值 */
  min: number;
  /** 最大值 */
  max: number;
  /** 百分位数 */
  percentiles?: Record<number, number>;
}

/**
 * 指标收集器
 */
@Injectable()
export class MetricsCollectorService {
  private metrics: MetricValue[] = [];
  private collectors = new Map<string, () => Promise<MetricValue[]>>();
  private config = {
    maxMetrics: 10000,
    aggregationInterval: 60000, // 1分钟
    retentionPeriod: 24 * 60 * 60 * 1000 // 24小时
  };

  constructor(
    private readonly databaseAdapter: IDatabaseAdapter,
    private readonly cacheService?: ICacheService,
    private readonly loggingService?: ILoggingService
  ) {
    this.registerDefaultCollectors();
  }

  /**
   * 注册指标收集器
   */
  registerCollector(name: string, collector: () => Promise<MetricValue[]>): void {
    this.collectors.set(name, collector);
  }

  /**
   * 注销指标收集器
   */
  deregisterCollector(name: string): void {
    this.collectors.delete(name);
  }

  /**
   * 收集指标
   */
  async collectMetrics(): Promise<MetricValue[]> {
    try {
      const allMetrics: MetricValue[] = [];
      
      // 执行所有收集器
      for (const [name, collector] of this.collectors.entries()) {
        try {
          const metrics = await collector();
          allMetrics.push(...metrics);
        } catch (error) {
          console.error(`收集器 ${name} 失败:`, error);
        }
      }

      // 存储指标
      this.metrics.push(...allMetrics);
      
      // 清理过期指标
      this.cleanupExpiredMetrics();
      
      // 限制指标数量
      this.limitMetricsCount();

      return allMetrics;
    } catch (error) {
      throw new Error(`收集指标失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取指标
   */
  getMetrics(
    name?: string,
    startTime?: Date,
    endTime?: Date
  ): MetricValue[] {
    let filteredMetrics = [...this.metrics];
    
    if (name) {
      filteredMetrics = filteredMetrics.filter(metric => metric.name === name);
    }
    
    if (startTime) {
      filteredMetrics = filteredMetrics.filter(metric => metric.timestamp >= startTime);
    }
    
    if (endTime) {
      filteredMetrics = filteredMetrics.filter(metric => metric.timestamp <= endTime);
    }
    
    return filteredMetrics;
  }

  /**
   * 获取指标聚合
   */
  getMetricAggregation(
    name: string,
    startTime?: Date,
    endTime?: Date
  ): MetricAggregation | null {
    try {
      const metrics = this.getMetrics(name, startTime, endTime);
      
      if (metrics.length === 0) {
        return null;
      }

      const values = metrics.map(m => m.value);
      const sum = values.reduce((acc, val) => acc + val, 0);
      const average = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);

      // 计算百分位数
      const sortedValues = values.sort((a, b) => a - b);
      const percentiles: Record<number, number> = {};
      const percentilesToCalculate = [50, 90, 95, 99];
      
      for (const percentile of percentilesToCalculate) {
        const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
        percentiles[percentile] = sortedValues[index];
      }

      return {
        name,
        count: metrics.length,
        sum,
        average,
        min,
        max,
        percentiles
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * 获取所有指标聚合
   */
  getAllMetricAggregations(
    startTime?: Date,
    endTime?: Date
  ): Record<string, MetricAggregation> {
    const aggregations: Record<string, MetricAggregation> = {};
    const metricNames = new Set(this.metrics.map(m => m.name));
    
    for (const name of metricNames) {
      const aggregation = this.getMetricAggregation(name, startTime, endTime);
      if (aggregation) {
        aggregations[name] = aggregation;
      }
    }
    
    return aggregations;
  }

  /**
   * 导出指标
   */
  exportMetrics(
    format: 'json' | 'prometheus',
    startTime?: Date,
    endTime?: Date
  ): string {
    const metrics = this.getMetrics(undefined, startTime, endTime);
    
    if (format === 'json') {
      return JSON.stringify(metrics, null, 2);
    } else if (format === 'prometheus') {
      return this.convertToPrometheusFormat(metrics);
    }
    
    throw new Error(`不支持的导出格式: ${format}`);
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
   * 获取指标统计
   */
  getMetricsStats(): Record<string, any> {
    const totalMetrics = this.metrics.length;
    const metricNames = new Set(this.metrics.map(m => m.name));
    const collectors = Array.from(this.collectors.keys());
    
    return {
      totalMetrics,
      uniqueMetricNames: metricNames.size,
      registeredCollectors: collectors.length,
      config: this.config
    };
  }

  /**
   * 注册默认收集器
   */
  private registerDefaultCollectors(): void {
    // 数据库指标收集器
    this.registerCollector('database', async () => {
      try {
        const connectionInfo = await this.databaseAdapter.getConnectionInfo();
        return [
          {
            name: 'database_connections',
            type: 'gauge' as MetricType,
            value: connectionInfo.connections || 0,
            timestamp: new Date(),
            description: '数据库连接数'
          },
          {
            name: 'database_health',
            type: 'gauge' as MetricType,
            value: connectionInfo.healthy ? 1 : 0,
            timestamp: new Date(),
            description: '数据库健康状态'
          }
        ];
      } catch (error) {
        return [];
      }
    });

    // 缓存指标收集器
    if (this.cacheService) {
      this.registerCollector('cache', async () => {
        try {
          const stats = this.cacheService.getStats();
          return [
            {
              name: 'cache_hit_rate',
              type: 'gauge' as MetricType,
              value: stats.hitRate || 0,
              timestamp: new Date(),
              description: '缓存命中率'
            },
            {
              name: 'cache_miss_rate',
              type: 'gauge' as MetricType,
              value: stats.missRate || 0,
              timestamp: new Date(),
              description: '缓存未命中率'
            },
            {
              name: 'cache_total_entries',
              type: 'gauge' as MetricType,
              value: stats.totalEntries || 0,
              timestamp: new Date(),
              description: '缓存总条目数'
            }
          ];
        } catch (error) {
          return [];
        }
      });
    }

    // 内存指标收集器
    this.registerCollector('memory', async () => {
      try {
        const memUsage = process.memoryUsage();
        const totalMem = require('os').totalmem();
        
        return [
          {
            name: 'memory_heap_used',
            type: 'gauge' as MetricType,
            value: memUsage.heapUsed,
            timestamp: new Date(),
            description: '堆内存使用量'
          },
          {
            name: 'memory_heap_total',
            type: 'gauge' as MetricType,
            value: memUsage.heapTotal,
            timestamp: new Date(),
            description: '堆内存总量'
          },
          {
            name: 'memory_external',
            type: 'gauge' as MetricType,
            value: memUsage.external,
            timestamp: new Date(),
            description: '外部内存使用量'
          },
          {
            name: 'memory_usage_ratio',
            type: 'gauge' as MetricType,
            value: memUsage.heapUsed / totalMem,
            timestamp: new Date(),
            description: '内存使用率'
          }
        ];
      } catch (error) {
        return [];
      }
    });

    // 进程指标收集器
    this.registerCollector('process', async () => {
      try {
        const uptime = process.uptime();
        const cpuUsage = process.cpuUsage();
        
        return [
          {
            name: 'process_uptime',
            type: 'gauge' as MetricType,
            value: uptime,
            timestamp: new Date(),
            description: '进程运行时间'
          },
          {
            name: 'process_cpu_user',
            type: 'gauge' as MetricType,
            value: cpuUsage.user,
            timestamp: new Date(),
            description: '用户CPU时间'
          },
          {
            name: 'process_cpu_system',
            type: 'gauge' as MetricType,
            value: cpuUsage.system,
            timestamp: new Date(),
            description: '系统CPU时间'
          }
        ];
      } catch (error) {
        return [];
      }
    });
  }

  /**
   * 清理过期指标
   */
  private cleanupExpiredMetrics(): void {
    const cutoffTime = new Date(Date.now() - this.config.retentionPeriod);
    this.metrics = this.metrics.filter(metric => metric.timestamp > cutoffTime);
  }

  /**
   * 限制指标数量
   */
  private limitMetricsCount(): void {
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics);
    }
  }

  /**
   * 转换为Prometheus格式
   */
  private convertToPrometheusFormat(metrics: MetricValue[]): string {
    const lines: string[] = [];
    
    for (const metric of metrics) {
      const labels = metric.labels ? 
        metric.labels.map(l => `${l.name}="${l.value}"`).join(',') : '';
      
      const labelStr = labels ? `{${labels}}` : '';
      const timestamp = metric.timestamp.getTime();
      
      lines.push(`# HELP ${metric.name} ${metric.description || ''}`);
      lines.push(`# TYPE ${metric.name} ${metric.type}`);
      lines.push(`${metric.name}${labelStr} ${metric.value} ${timestamp}`);
    }
    
    return lines.join('\n');
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
