/**
 * 领域性能事件
 *
 * @description 表示领域层性能事件，包括性能指标、性能警告、性能报告等
 * @since 1.0.0
 */

import { DomainEvent } from "@hl8/domain-kernel";
import { TenantId } from "@hl8/domain-kernel";
import { OrganizationId } from "@hl8/domain-kernel";
import { DepartmentId } from "@hl8/domain-kernel";
import { UserId } from "@hl8/domain-kernel";

/**
 * 性能事件类型枚举
 */
export enum PerformanceEventType {
  METRIC_RECORDED = "METRIC_RECORDED",
  THRESHOLD_EXCEEDED = "THRESHOLD_EXCEEDED",
  PERFORMANCE_DEGRADED = "PERFORMANCE_DEGRADED",
  PERFORMANCE_IMPROVED = "PERFORMANCE_IMPROVED",
  CRITICAL_ISSUE = "CRITICAL_ISSUE",
  PERFORMANCE_REPORT = "PERFORMANCE_REPORT",
  OPTIMIZATION_SUGGESTION = "OPTIMIZATION_SUGGESTION",
}

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
 * 领域性能事件接口
 */
export interface IDomainPerformanceEvent {
  readonly eventType: PerformanceEventType;
  readonly metricType: PerformanceMetricType;
  readonly value: number;
  readonly unit: string;
  readonly level: PerformanceLevel;
  readonly threshold?: {
    readonly warning: number;
    readonly critical: number;
  };
  readonly context: {
    readonly tenantId?: TenantId;
    readonly organizationId?: OrganizationId;
    readonly departmentId?: DepartmentId;
    readonly userId?: UserId;
    readonly operation?: string;
    readonly component?: string;
  };
  readonly timestamp: Date;
  readonly description: string;
  readonly recommendations?: readonly string[];
  readonly metadata: Record<string, unknown>;
}

/**
 * 领域性能事件
 *
 * 领域性能事件表示领域层性能事件，包括性能指标、性能警告、性能报告等。
 * 当系统性能发生变化时，系统会发布此事件以通知相关组件。
 *
 * @example
 * ```typescript
 * const event = new DomainPerformanceEvent({
 *   eventType: PerformanceEventType.THRESHOLD_EXCEEDED,
 *   metricType: PerformanceMetricType.EXECUTION_TIME,
 *   value: 5000,
 *   unit: "ms",
 *   level: PerformanceLevel.CRITICAL,
 *   threshold: { warning: 1000, critical: 5000 },
 *   context: { tenantId: new TenantId("tenant-123"), operation: "user-creation" },
 *   timestamp: new Date(),
 *   description: "Execution time exceeded critical threshold",
 *   metadata: { source: "automatic", category: "performance_monitoring" }
 * });
 * ```
 */
export class DomainPerformanceEvent extends DomainEvent {
  constructor(eventData: IDomainPerformanceEvent) {
    super(
      "DomainPerformanceEvent",
      eventData.context.tenantId?.value || "system",
    );

    this.eventData = eventData;
  }

  /**
   * 获取事件类型
   *
   * @returns 事件类型
   */
  get eventType(): PerformanceEventType {
    return this.eventData.eventType;
  }

  /**
   * 获取指标类型
   *
   * @returns 指标类型
   */
  get metricType(): PerformanceMetricType {
    return this.eventData.metricType;
  }

  /**
   * 获取指标值
   *
   * @returns 指标值
   */
  get value(): number {
    return this.eventData.value;
  }

  /**
   * 获取单位
   *
   * @returns 单位
   */
  get unit(): string {
    return this.eventData.unit;
  }

  /**
   * 获取性能级别
   *
   * @returns 性能级别
   */
  get level(): PerformanceLevel {
    return this.eventData.level;
  }

  /**
   * 获取阈值
   *
   * @returns 阈值或undefined
   */
  get threshold():
    | {
        readonly warning: number;
        readonly critical: number;
      }
    | undefined {
    return this.eventData.threshold;
  }

  /**
   * 获取上下文
   *
   * @returns 上下文
   */
  get context(): {
    readonly tenantId?: TenantId;
    readonly organizationId?: OrganizationId;
    readonly departmentId?: DepartmentId;
    readonly userId?: UserId;
    readonly operation?: string;
    readonly component?: string;
  } {
    return this.eventData.context;
  }

  /**
   * 获取时间戳
   *
   * @returns 时间戳
   */
  get timestamp(): Date {
    return this.eventData.timestamp;
  }

  /**
   * 获取描述
   *
   * @returns 描述
   */
  get description(): string {
    return this.eventData.description;
  }

  /**
   * 获取建议
   *
   * @returns 建议或undefined
   */
  get recommendations(): readonly string[] | undefined {
    return this.eventData.recommendations;
  }

  /**
   * 获取元数据
   *
   * @returns 元数据
   */
  get metadata(): Record<string, unknown> {
    return this.eventData.metadata;
  }

  /**
   * 检查是否为指标记录事件
   *
   * @returns 是否为指标记录事件
   */
  isMetricRecorded(): boolean {
    return this.eventType === PerformanceEventType.METRIC_RECORDED;
  }

  /**
   * 检查是否为阈值超出事件
   *
   * @returns 是否为阈值超出事件
   */
  isThresholdExceeded(): boolean {
    return this.eventType === PerformanceEventType.THRESHOLD_EXCEEDED;
  }

  /**
   * 检查是否为性能下降事件
   *
   * @returns 是否为性能下降事件
   */
  isPerformanceDegraded(): boolean {
    return this.eventType === PerformanceEventType.PERFORMANCE_DEGRADED;
  }

  /**
   * 检查是否为性能改善事件
   *
   * @returns 是否为性能改善事件
   */
  isPerformanceImproved(): boolean {
    return this.eventType === PerformanceEventType.PERFORMANCE_IMPROVED;
  }

  /**
   * 检查是否为关键问题事件
   *
   * @returns 是否为关键问题事件
   */
  isCriticalIssue(): boolean {
    return this.eventType === PerformanceEventType.CRITICAL_ISSUE;
  }

  /**
   * 检查是否为性能报告事件
   *
   * @returns 是否为性能报告事件
   */
  isPerformanceReport(): boolean {
    return this.eventType === PerformanceEventType.PERFORMANCE_REPORT;
  }

  /**
   * 检查是否为优化建议事件
   *
   * @returns 是否为优化建议事件
   */
  isOptimizationSuggestion(): boolean {
    return this.eventType === PerformanceEventType.OPTIMIZATION_SUGGESTION;
  }

  /**
   * 检查是否为关键级别
   *
   * @returns 是否为关键级别
   */
  isCriticalLevel(): boolean {
    return this.level === PerformanceLevel.CRITICAL;
  }

  /**
   * 检查是否为优秀级别
   *
   * @returns 是否为优秀级别
   */
  isExcellentLevel(): boolean {
    return this.level === PerformanceLevel.EXCELLENT;
  }

  /**
   * 检查是否超出警告阈值
   *
   * @returns 是否超出警告阈值
   */
  exceedsWarningThreshold(): boolean {
    return this.threshold ? this.value >= this.threshold.warning : false;
  }

  /**
   * 检查是否超出关键阈值
   *
   * @returns 是否超出关键阈值
   */
  exceedsCriticalThreshold(): boolean {
    return this.threshold ? this.value >= this.threshold.critical : false;
  }

  /**
   * 获取超出阈值的百分比
   *
   * @returns 超出阈值的百分比
   */
  getThresholdExceededPercentage(): number {
    if (!this.threshold) {
      return 0;
    }

    const threshold = this.exceedsCriticalThreshold()
      ? this.threshold.critical
      : this.threshold.warning;
    return ((this.value - threshold) / threshold) * 100;
  }

  /**
   * 获取事件摘要
   *
   * @returns 事件摘要
   */
  getSummary(): string {
    const contextInfo = this.context.tenantId
      ? `租户 ${this.context.tenantId.value}`
      : "系统";
    const operationInfo = this.context.operation
      ? `操作 ${this.context.operation}`
      : "";
    const componentInfo = this.context.component
      ? `组件 ${this.context.component}`
      : "";

    return `${contextInfo} ${operationInfo} ${componentInfo} - ${this.metricType}: ${this.value} ${this.unit} (${this.level})`;
  }

  /**
   * 获取事件详细信息
   *
   * @returns 事件详细信息
   */
  getDetails(): Record<string, unknown> {
    return {
      eventType: "DomainPerformanceEvent",
      performanceEventType: this.eventType,
      metricType: this.metricType,
      value: this.value,
      unit: this.unit,
      level: this.level,
      threshold: this.threshold,
      context: {
        tenantId: this.context.tenantId?.value,
        organizationId: this.context.organizationId?.value,
        departmentId: this.context.departmentId?.value,
        userId: this.context.userId?.value,
        operation: this.context.operation,
        component: this.context.component,
      },
      timestamp: this.timestamp.toISOString(),
      description: this.description,
      recommendations: this.recommendations,
      isMetricRecorded: this.isMetricRecorded(),
      isThresholdExceeded: this.isThresholdExceeded(),
      isPerformanceDegraded: this.isPerformanceDegraded(),
      isPerformanceImproved: this.isPerformanceImproved(),
      isCriticalIssue: this.isCriticalIssue(),
      isPerformanceReport: this.isPerformanceReport(),
      isOptimizationSuggestion: this.isOptimizationSuggestion(),
      isCriticalLevel: this.isCriticalLevel(),
      isExcellentLevel: this.isExcellentLevel(),
      exceedsWarningThreshold: this.exceedsWarningThreshold(),
      exceedsCriticalThreshold: this.exceedsCriticalThreshold(),
      thresholdExceededPercentage: this.getThresholdExceededPercentage(),
      metadata: this.metadata,
    };
  }

  /**
   * 创建领域性能事件
   *
   * @param eventType - 事件类型
   * @param metricType - 指标类型
   * @param value - 指标值
   * @param unit - 单位
   * @param level - 性能级别
   * @param context - 上下文
   * @param description - 描述
   * @param threshold - 阈值
   * @param recommendations - 建议
   * @param metadata - 元数据
   * @returns 领域性能事件
   */
  static create(
    eventType: PerformanceEventType,
    metricType: PerformanceMetricType,
    value: number,
    unit: string,
    level: PerformanceLevel,
    context: {
      readonly tenantId?: TenantId;
      readonly organizationId?: OrganizationId;
      readonly departmentId?: DepartmentId;
      readonly userId?: UserId;
      readonly operation?: string;
      readonly component?: string;
    },
    description: string,
    threshold?: {
      readonly warning: number;
      readonly critical: number;
    },
    recommendations?: readonly string[],
    metadata: Record<string, unknown> = {},
  ): DomainPerformanceEvent {
    return new DomainPerformanceEvent({
      eventType,
      metricType,
      value,
      unit,
      level,
      threshold,
      context,
      timestamp: new Date(),
      description,
      recommendations,
      metadata,
    });
  }

  /**
   * 创建指标记录事件
   *
   * @param metricType - 指标类型
   * @param value - 指标值
   * @param unit - 单位
   * @param level - 性能级别
   * @param context - 上下文
   * @param description - 描述
   * @param metadata - 元数据
   * @returns 指标记录事件
   */
  static createMetricRecorded(
    metricType: PerformanceMetricType,
    value: number,
    unit: string,
    level: PerformanceLevel,
    context: {
      readonly tenantId?: TenantId;
      readonly organizationId?: OrganizationId;
      readonly departmentId?: DepartmentId;
      readonly userId?: UserId;
      readonly operation?: string;
      readonly component?: string;
    },
    description: string,
    metadata: Record<string, unknown> = {},
  ): DomainPerformanceEvent {
    return DomainPerformanceEvent.create(
      PerformanceEventType.METRIC_RECORDED,
      metricType,
      value,
      unit,
      level,
      context,
      description,
      undefined,
      undefined,
      metadata,
    );
  }

  /**
   * 创建阈值超出事件
   *
   * @param metricType - 指标类型
   * @param value - 指标值
   * @param unit - 单位
   * @param level - 性能级别
   * @param threshold - 阈值
   * @param context - 上下文
   * @param description - 描述
   * @param recommendations - 建议
   * @param metadata - 元数据
   * @returns 阈值超出事件
   */
  static createThresholdExceeded(
    metricType: PerformanceMetricType,
    value: number,
    unit: string,
    level: PerformanceLevel,
    threshold: {
      readonly warning: number;
      readonly critical: number;
    },
    context: {
      readonly tenantId?: TenantId;
      readonly organizationId?: OrganizationId;
      readonly departmentId?: DepartmentId;
      readonly userId?: UserId;
      readonly operation?: string;
      readonly component?: string;
    },
    description: string,
    recommendations?: readonly string[],
    metadata: Record<string, unknown> = {},
  ): DomainPerformanceEvent {
    return DomainPerformanceEvent.create(
      PerformanceEventType.THRESHOLD_EXCEEDED,
      metricType,
      value,
      unit,
      level,
      context,
      description,
      threshold,
      recommendations,
      metadata,
    );
  }

  /**
   * 创建关键问题事件
   *
   * @param metricType - 指标类型
   * @param value - 指标值
   * @param unit - 单位
   * @param context - 上下文
   * @param description - 描述
   * @param recommendations - 建议
   * @param metadata - 元数据
   * @returns 关键问题事件
   */
  static createCriticalIssue(
    metricType: PerformanceMetricType,
    value: number,
    unit: string,
    context: {
      readonly tenantId?: TenantId;
      readonly organizationId?: OrganizationId;
      readonly departmentId?: DepartmentId;
      readonly userId?: UserId;
      readonly operation?: string;
      readonly component?: string;
    },
    description: string,
    recommendations?: readonly string[],
    metadata: Record<string, unknown> = {},
  ): DomainPerformanceEvent {
    return DomainPerformanceEvent.create(
      PerformanceEventType.CRITICAL_ISSUE,
      metricType,
      value,
      unit,
      PerformanceLevel.CRITICAL,
      context,
      description,
      undefined,
      recommendations,
      metadata,
    );
  }
}
