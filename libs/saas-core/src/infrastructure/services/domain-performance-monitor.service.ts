/**
 * 领域性能监控器
 *
 * @description 处理领域层性能监控，包括性能指标收集、性能分析、性能报告等
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { DomainService } from "@hl8/domain-kernel";

/**
 * 性能指标类型枚举
 */
export enum PerformanceMetricType {
  EXECUTION_TIME = "EXECUTION_TIME",
  MEMORY_USAGE = "MEMORY_USAGE",
  CPU_USAGE = "CPU_USAGE",
  THROUGHPUT = "THROUGHPUT",
  LATENCY = "LATENCY",
  ERROR_RATE = "ERROR_RATE",
  AVAILABILITY = "AVAILABILITY",
}

/**
 * 性能级别枚举
 */
export enum PerformanceLevel {
  EXCELLENT = "EXCELLENT",
  GOOD = "GOOD",
  FAIR = "FAIR",
  POOR = "POOR",
  CRITICAL = "CRITICAL",
}

/**
 * 性能指标接口
 */
export interface PerformanceMetric {
  readonly id: string;
  readonly type: PerformanceMetricType;
  readonly value: number;
  readonly unit: string;
  readonly timestamp: Date;
  readonly context: Record<string, unknown>;
  readonly metadata?: Record<string, unknown>;
}

/**
 * 性能阈值接口
 */
export interface PerformanceThreshold {
  readonly type: PerformanceMetricType;
  readonly warning: number;
  readonly critical: number;
  readonly unit: string;
}

/**
 * 性能报告接口
 */
export interface PerformanceReport {
  readonly period: {
    readonly start: Date;
    readonly end: Date;
  };
  readonly summary: {
    readonly totalMetrics: number;
    readonly averagePerformance: PerformanceLevel;
    readonly criticalIssues: number;
    readonly warnings: number;
  };
  readonly metrics: Record<
    PerformanceMetricType,
    {
      readonly current: number;
      readonly average: number;
      readonly min: number;
      readonly max: number;
      readonly trend: "IMPROVING" | "STABLE" | "DEGRADING";
    }
  >;
  readonly recommendations: readonly string[];
}

/**
 * 领域性能监控器
 *
 * 领域性能监控器负责处理领域层性能监控，包括性能指标收集、性能分析、性能报告等。
 * 支持多种性能指标类型，提供实时性能监控和性能分析功能。
 *
 * @example
 * ```typescript
 * const monitor = new DomainPerformanceMonitor();
 * await monitor.recordMetric(PerformanceMetricType.EXECUTION_TIME, 150, "ms");
 * const report = await monitor.generateReport();
 * ```
 */
@Injectable()
export class DomainPerformanceMonitor extends DomainService {
  private readonly metrics: Map<string, PerformanceMetric> = new Map();
  private readonly thresholds: Map<
    PerformanceMetricType,
    PerformanceThreshold
  > = new Map();
  private readonly performanceHistory: PerformanceMetric[] = [];

  constructor() {
    super();
    this.setContext("DomainPerformanceMonitor");
    this.initializeDefaultThresholds();
  }

  /**
   * 记录性能指标
   *
   * @param type - 性能指标类型
   * @param value - 指标值
   * @param unit - 单位
   * @param context - 上下文
   * @param metadata - 元数据
   * @returns 记录的指标ID
   */
  async recordMetric(
    type: PerformanceMetricType,
    value: number,
    unit: string,
    context: Record<string, unknown> = {},
    metadata?: Record<string, unknown>,
  ): Promise<string> {
    this.logger.log(
      `Recording performance metric: ${type} = ${value} ${unit}`,
      this.context,
    );

    const metric: PerformanceMetric = {
      id: this.generateMetricId(),
      type,
      value,
      unit,
      timestamp: new Date(),
      context,
      metadata,
    };

    this.metrics.set(metric.id, metric);
    this.performanceHistory.push(metric);

    // 检查阈值
    await this.checkThresholds(metric);

    this.logger.log(`Performance metric recorded: ${metric.id}`, this.context);

    return metric.id;
  }

  /**
   * 获取性能指标
   *
   * @param metricId - 指标ID
   * @returns 性能指标或undefined
   */
  async getMetric(metricId: string): Promise<PerformanceMetric | undefined> {
    this.logger.log(`Getting performance metric: ${metricId}`, this.context);

    const metric = this.metrics.get(metricId);

    this.logger.log(
      `Performance metric ${metricId} ${metric ? "found" : "not found"}`,
      this.context,
    );

    return metric;
  }

  /**
   * 查询性能指标
   *
   * @param type - 指标类型（可选）
   * @param startTime - 开始时间（可选）
   * @param endTime - 结束时间（可选）
   * @param limit - 限制数量（可选）
   * @returns 性能指标列表
   */
  async queryMetrics(
    type?: PerformanceMetricType,
    startTime?: Date,
    endTime?: Date,
    limit?: number,
  ): Promise<readonly PerformanceMetric[]> {
    this.logger.log(
      `Querying performance metrics: type=${type}, start=${startTime}, end=${endTime}, limit=${limit}`,
      this.context,
    );

    let filteredMetrics = Array.from(this.metrics.values());

    if (type) {
      filteredMetrics = filteredMetrics.filter(
        (metric) => metric.type === type,
      );
    }

    if (startTime) {
      filteredMetrics = filteredMetrics.filter(
        (metric) => metric.timestamp >= startTime,
      );
    }

    if (endTime) {
      filteredMetrics = filteredMetrics.filter(
        (metric) => metric.timestamp <= endTime,
      );
    }

    if (limit) {
      filteredMetrics = filteredMetrics.slice(0, limit);
    }

    // 按时间戳排序
    filteredMetrics.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );

    this.logger.log(
      `Found ${filteredMetrics.length} performance metrics matching criteria`,
      this.context,
    );

    return filteredMetrics;
  }

  /**
   * 获取性能统计信息
   *
   * @param type - 指标类型（可选）
   * @param period - 时间周期（小时）
   * @returns 性能统计信息
   */
  async getPerformanceStatistics(
    type?: PerformanceMetricType,
    period: number = 24,
  ): Promise<{
    readonly totalMetrics: number;
    readonly averageValue: number;
    readonly minValue: number;
    readonly maxValue: number;
    readonly standardDeviation: number;
    readonly percentile95: number;
    readonly percentile99: number;
    readonly trend: "IMPROVING" | "STABLE" | "DEGRADING";
  }> {
    this.logger.log(
      `Getting performance statistics: type=${type}, period=${period}h`,
      this.context,
    );

    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - period * 60 * 60 * 1000);

    const metrics = await this.queryMetrics(type, startTime, endTime);
    const values = metrics.map((metric) => metric.value);

    if (values.length === 0) {
      return {
        totalMetrics: 0,
        averageValue: 0,
        minValue: 0,
        maxValue: 0,
        standardDeviation: 0,
        percentile95: 0,
        percentile99: 0,
        trend: "STABLE",
      };
    }

    const totalMetrics = values.length;
    const averageValue =
      values.reduce((sum, value) => sum + value, 0) / totalMetrics;
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const standardDeviation = this.calculateStandardDeviation(
      values,
      averageValue,
    );
    const percentile95 = this.calculatePercentile(values, 95);
    const percentile99 = this.calculatePercentile(values, 99);
    const trend = this.calculateTrend(values);

    const result = {
      totalMetrics,
      averageValue,
      minValue,
      maxValue,
      standardDeviation,
      percentile95,
      percentile99,
      trend,
    };

    this.logger.log(
      `Performance statistics generated: ${totalMetrics} metrics, average: ${averageValue.toFixed(2)}`,
      this.context,
    );

    return result;
  }

  /**
   * 生成性能报告
   *
   * @param period - 报告周期（小时）
   * @returns 性能报告
   */
  async generatePerformanceReport(
    period: number = 24,
  ): Promise<PerformanceReport> {
    this.logger.log(
      `Generating performance report for period: ${period}h`,
      this.context,
    );

    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - period * 60 * 60 * 1000);

    const metrics = await this.queryMetrics(undefined, startTime, endTime);
    const totalMetrics = metrics.length;

    // 计算平均性能级别
    const performanceLevels = await this.calculatePerformanceLevels(metrics);
    const averagePerformance =
      this.calculateAveragePerformanceLevel(performanceLevels);

    // 计算关键问题和警告
    const criticalIssues = performanceLevels.filter(
      (level) => level === PerformanceLevel.CRITICAL,
    ).length;
    const warnings = performanceLevels.filter(
      (level) => level === PerformanceLevel.POOR,
    ).length;

    // 计算各指标类型的统计信息
    const metricsByType: Record<PerformanceMetricType, PerformanceMetric[]> =
      {} as Record<PerformanceMetricType, PerformanceMetric[]>;
    for (const metric of metrics) {
      if (!metricsByType[metric.type]) {
        metricsByType[metric.type] = [];
      }
      metricsByType[metric.type].push(metric);
    }

    const metricsStats: Record<
      PerformanceMetricType,
      {
        readonly current: number;
        readonly average: number;
        readonly min: number;
        readonly max: number;
        readonly trend: "IMPROVING" | "STABLE" | "DEGRADING";
      }
    > = {} as Record<PerformanceMetricType, any>;

    for (const [type, typeMetrics] of Object.entries(metricsByType)) {
      const values = typeMetrics.map((m) => m.value);
      const current = values[values.length - 1] || 0;
      const average = values.reduce((sum, v) => sum + v, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const trend = this.calculateTrend(values);

      metricsStats[type as PerformanceMetricType] = {
        current,
        average,
        min,
        max,
        trend,
      };
    }

    // 生成建议
    const recommendations = await this.generateRecommendations(
      metrics,
      performanceLevels,
    );

    const report: PerformanceReport = {
      period: { start: startTime, end: endTime },
      summary: {
        totalMetrics,
        averagePerformance,
        criticalIssues,
        warnings,
      },
      metrics: metricsStats,
      recommendations,
    };

    this.logger.log(
      `Performance report generated: ${totalMetrics} metrics, ${criticalIssues} critical issues, ${warnings} warnings`,
      this.context,
    );

    return report;
  }

  /**
   * 设置性能阈值
   *
   * @param type - 指标类型
   * @param warning - 警告阈值
   * @param critical - 关键阈值
   * @param unit - 单位
   * @returns 是否设置成功
   */
  async setThreshold(
    type: PerformanceMetricType,
    warning: number,
    critical: number,
    unit: string,
  ): Promise<boolean> {
    this.logger.log(
      `Setting performance threshold: ${type} warning=${warning}, critical=${critical} ${unit}`,
      this.context,
    );

    const threshold: PerformanceThreshold = {
      type,
      warning,
      critical,
      unit,
    };

    this.thresholds.set(type, threshold);

    this.logger.log(`Performance threshold set for ${type}`, this.context);

    return true;
  }

  /**
   * 获取性能阈值
   *
   * @param type - 指标类型
   * @returns 性能阈值或undefined
   */
  async getThreshold(
    type: PerformanceMetricType,
  ): Promise<PerformanceThreshold | undefined> {
    this.logger.log(`Getting performance threshold for ${type}`, this.context);

    const threshold = this.thresholds.get(type);

    this.logger.log(
      `Performance threshold for ${type} ${threshold ? "found" : "not found"}`,
      this.context,
    );

    return threshold;
  }

  /**
   * 获取性能趋势
   *
   * @param type - 指标类型
   * @param period - 时间周期（小时）
   * @returns 性能趋势
   */
  async getPerformanceTrend(
    type: PerformanceMetricType,
    period: number = 24,
  ): Promise<{
    readonly trend: "IMPROVING" | "STABLE" | "DEGRADING";
    readonly changeRate: number;
    readonly prediction: number;
  }> {
    this.logger.log(
      `Getting performance trend for ${type} over ${period}h`,
      this.context,
    );

    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - period * 60 * 60 * 1000);

    const metrics = await this.queryMetrics(type, startTime, endTime);
    const values = metrics.map((metric) => metric.value);

    if (values.length < 2) {
      return {
        trend: "STABLE",
        changeRate: 0,
        prediction: values[0] || 0,
      };
    }

    const trend = this.calculateTrend(values);
    const changeRate = this.calculateChangeRate(values);
    const prediction = this.predictNextValue(values);

    this.logger.log(
      `Performance trend for ${type}: ${trend}, change rate: ${changeRate.toFixed(2)}%`,
      this.context,
    );

    return {
      trend,
      changeRate,
      prediction,
    };
  }

  /**
   * 初始化默认阈值
   */
  private initializeDefaultThresholds(): void {
    this.thresholds.set(PerformanceMetricType.EXECUTION_TIME, {
      type: PerformanceMetricType.EXECUTION_TIME,
      warning: 1000,
      critical: 5000,
      unit: "ms",
    });

    this.thresholds.set(PerformanceMetricType.MEMORY_USAGE, {
      type: PerformanceMetricType.MEMORY_USAGE,
      warning: 80,
      critical: 95,
      unit: "%",
    });

    this.thresholds.set(PerformanceMetricType.CPU_USAGE, {
      type: PerformanceMetricType.CPU_USAGE,
      warning: 70,
      critical: 90,
      unit: "%",
    });

    this.thresholds.set(PerformanceMetricType.ERROR_RATE, {
      type: PerformanceMetricType.ERROR_RATE,
      warning: 5,
      critical: 10,
      unit: "%",
    });
  }

  /**
   * 检查阈值
   *
   * @param metric - 性能指标
   */
  private async checkThresholds(metric: PerformanceMetric): Promise<void> {
    const threshold = this.thresholds.get(metric.type);
    if (!threshold) {
      return;
    }

    if (metric.value >= threshold.critical) {
      this.logger.warn(
        `Critical performance threshold exceeded: ${metric.type} = ${metric.value} ${metric.unit} (threshold: ${threshold.critical} ${threshold.unit})`,
        this.context,
      );
    } else if (metric.value >= threshold.warning) {
      this.logger.warn(
        `Performance threshold warning: ${metric.type} = ${metric.value} ${metric.unit} (threshold: ${threshold.warning} ${threshold.unit})`,
        this.context,
      );
    }
  }

  /**
   * 计算性能级别
   *
   * @param metrics - 性能指标列表
   * @returns 性能级别列表
   */
  private async calculatePerformanceLevels(
    metrics: PerformanceMetric[],
  ): Promise<PerformanceLevel[]> {
    const levels: PerformanceLevel[] = [];

    for (const metric of metrics) {
      const threshold = this.thresholds.get(metric.type);
      if (!threshold) {
        levels.push(PerformanceLevel.GOOD);
        continue;
      }

      if (metric.value >= threshold.critical) {
        levels.push(PerformanceLevel.CRITICAL);
      } else if (metric.value >= threshold.warning) {
        levels.push(PerformanceLevel.POOR);
      } else if (metric.value >= threshold.warning * 0.8) {
        levels.push(PerformanceLevel.FAIR);
      } else if (metric.value >= threshold.warning * 0.5) {
        levels.push(PerformanceLevel.GOOD);
      } else {
        levels.push(PerformanceLevel.EXCELLENT);
      }
    }

    return levels;
  }

  /**
   * 计算平均性能级别
   *
   * @param levels - 性能级别列表
   * @returns 平均性能级别
   */
  private calculateAveragePerformanceLevel(
    levels: PerformanceLevel[],
  ): PerformanceLevel {
    if (levels.length === 0) {
      return PerformanceLevel.GOOD;
    }

    const levelScores = levels.map((level) => {
      switch (level) {
        case PerformanceLevel.EXCELLENT:
          return 5;
        case PerformanceLevel.GOOD:
          return 4;
        case PerformanceLevel.FAIR:
          return 3;
        case PerformanceLevel.POOR:
          return 2;
        case PerformanceLevel.CRITICAL:
          return 1;
        default:
          return 3;
      }
    });

    const averageScore =
      levelScores.reduce((sum, score) => sum + score, 0) / levelScores.length;

    if (averageScore >= 4.5) {
      return PerformanceLevel.EXCELLENT;
    } else if (averageScore >= 3.5) {
      return PerformanceLevel.GOOD;
    } else if (averageScore >= 2.5) {
      return PerformanceLevel.FAIR;
    } else if (averageScore >= 1.5) {
      return PerformanceLevel.POOR;
    } else {
      return PerformanceLevel.CRITICAL;
    }
  }

  /**
   * 生成建议
   *
   * @param metrics - 性能指标列表
   * @param levels - 性能级别列表
   * @returns 建议列表
   */
  private async generateRecommendations(
    metrics: PerformanceMetric[],
    levels: PerformanceLevel[],
  ): Promise<readonly string[]> {
    const recommendations: string[] = [];

    const criticalCount = levels.filter(
      (level) => level === PerformanceLevel.CRITICAL,
    ).length;
    const poorCount = levels.filter(
      (level) => level === PerformanceLevel.POOR,
    ).length;

    if (criticalCount > 0) {
      recommendations.push(
        "Immediate attention required: Critical performance issues detected",
      );
    }

    if (poorCount > 0) {
      recommendations.push(
        "Performance optimization recommended: Poor performance detected",
      );
    }

    // 分析具体指标类型
    const metricsByType: Record<PerformanceMetricType, PerformanceMetric[]> =
      {} as Record<PerformanceMetricType, PerformanceMetric[]>;
    for (const metric of metrics) {
      if (!metricsByType[metric.type]) {
        metricsByType[metric.type] = [];
      }
      metricsByType[metric.type].push(metric);
    }

    for (const [type, typeMetrics] of Object.entries(metricsByType)) {
      const averageValue =
        typeMetrics.reduce((sum, m) => sum + m.value, 0) / typeMetrics.length;
      const threshold = this.thresholds.get(type as PerformanceMetricType);

      if (threshold && averageValue >= threshold.warning) {
        recommendations.push(
          `Consider optimizing ${type}: current average ${averageValue.toFixed(2)} exceeds warning threshold ${threshold.warning}`,
        );
      }
    }

    return recommendations;
  }

  /**
   * 计算标准差
   *
   * @param values - 数值列表
   * @param mean - 平均值
   * @returns 标准差
   */
  private calculateStandardDeviation(values: number[], mean: number): number {
    const variance =
      values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
      values.length;
    return Math.sqrt(variance);
  }

  /**
   * 计算百分位数
   *
   * @param values - 数值列表
   * @param percentile - 百分位数
   * @returns 百分位数值
   */
  private calculatePercentile(values: number[], percentile: number): number {
    const sortedValues = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, index)];
  }

  /**
   * 计算趋势
   *
   * @param values - 数值列表
   * @returns 趋势
   */
  private calculateTrend(
    values: number[],
  ): "IMPROVING" | "STABLE" | "DEGRADING" {
    if (values.length < 2) {
      return "STABLE";
    }

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAverage =
      firstHalf.reduce((sum, value) => sum + value, 0) / firstHalf.length;
    const secondAverage =
      secondHalf.reduce((sum, value) => sum + value, 0) / secondHalf.length;

    const changePercent = ((secondAverage - firstAverage) / firstAverage) * 100;

    if (changePercent > 10) {
      return "DEGRADING";
    } else if (changePercent < -10) {
      return "IMPROVING";
    } else {
      return "STABLE";
    }
  }

  /**
   * 计算变化率
   *
   * @param values - 数值列表
   * @returns 变化率
   */
  private calculateChangeRate(values: number[]): number {
    if (values.length < 2) {
      return 0;
    }

    const first = values[0];
    const last = values[values.length - 1];
    return ((last - first) / first) * 100;
  }

  /**
   * 预测下一个值
   *
   * @param values - 数值列表
   * @returns 预测值
   */
  private predictNextValue(values: number[]): number {
    if (values.length < 2) {
      return values[0] || 0;
    }

    // 简单的线性预测
    const last = values[values.length - 1];
    const secondLast = values[values.length - 2];
    const trend = last - secondLast;
    return last + trend;
  }

  /**
   * 生成指标ID
   *
   * @returns 指标ID
   */
  private generateMetricId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
