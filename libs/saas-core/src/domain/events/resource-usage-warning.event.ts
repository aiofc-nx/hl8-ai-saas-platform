/**
 * 资源使用警告事件
 *
 * @description 表示资源使用量接近限制的警告事件
 * @since 1.0.0
 */

import { DomainEvent } from "@hl8/domain-kernel";
import { TenantId } from "../value-objects/tenant-id.vo.js";
import { ResourceType } from "../value-objects/resource-usage.vo.js";
import { ResourceLimitType } from "../value-objects/resource-limits.vo.js";

/**
 * 资源使用警告事件接口
 */
export interface IResourceUsageWarningEvent {
  readonly tenantId: TenantId;
  readonly resourceType: ResourceType;
  readonly currentUsage: number;
  readonly maxLimit: number;
  readonly usagePercentage: number;
  readonly warningThreshold: number;
  readonly warningType:
    | "APPROACHING_LIMIT"
    | "NEAR_LIMIT"
    | "CRITICAL_THRESHOLD";
  readonly remainingCapacity: number;
  readonly estimatedTimeToLimit: number;
  readonly warningAt: Date;
  readonly autoExpansionEnabled: boolean;
  readonly expansionRecommendation?: {
    readonly recommendedLimit: number;
    readonly expansionFactor: number;
    readonly reason: string;
    readonly urgency: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  };
  readonly metadata: Record<string, unknown>;
}

/**
 * 资源使用警告事件
 *
 * 资源使用警告事件表示资源使用量接近限制的警告事件。
 * 当资源使用量接近设定的警告阈值时，系统会发布此事件以通知相关组件。
 *
 * @example
 * ```typescript
 * const event = new ResourceUsageWarningEvent({
 *   tenantId: new TenantId("tenant-123"),
 *   resourceType: ResourceType.USERS,
 *   currentUsage: 800,
 *   maxLimit: 1000,
 *   usagePercentage: 80,
 *   warningThreshold: 75,
 *   warningType: "NEAR_LIMIT",
 *   remainingCapacity: 200,
 *   estimatedTimeToLimit: 48,
 *   warningAt: new Date(),
 *   autoExpansionEnabled: true,
 *   metadata: { source: "automatic", category: "resource_monitoring" }
 * });
 * ```
 */
export class ResourceUsageWarningEvent extends DomainEvent {
  constructor(eventData: IResourceUsageWarningEvent) {
    super("ResourceUsageWarningEvent", eventData.tenantId.value);

    this.eventData = eventData;
  }

  /**
   * 获取租户ID
   *
   * @returns 租户ID
   */
  get tenantId(): TenantId {
    return this.eventData.tenantId;
  }

  /**
   * 获取资源类型
   *
   * @returns 资源类型
   */
  get resourceType(): ResourceType {
    return this.eventData.resourceType;
  }

  /**
   * 获取当前使用量
   *
   * @returns 当前使用量
   */
  get currentUsage(): number {
    return this.eventData.currentUsage;
  }

  /**
   * 获取最大限制
   *
   * @returns 最大限制
   */
  get maxLimit(): number {
    return this.eventData.maxLimit;
  }

  /**
   * 获取使用百分比
   *
   * @returns 使用百分比
   */
  get usagePercentage(): number {
    return this.eventData.usagePercentage;
  }

  /**
   * 获取警告阈值
   *
   * @returns 警告阈值
   */
  get warningThreshold(): number {
    return this.eventData.warningThreshold;
  }

  /**
   * 获取警告类型
   *
   * @returns 警告类型
   */
  get warningType(): "APPROACHING_LIMIT" | "NEAR_LIMIT" | "CRITICAL_THRESHOLD" {
    return this.eventData.warningType;
  }

  /**
   * 获取剩余容量
   *
   * @returns 剩余容量
   */
  get remainingCapacity(): number {
    return this.eventData.remainingCapacity;
  }

  /**
   * 获取预计到达限制时间
   *
   * @returns 预计到达限制时间（小时）
   */
  get estimatedTimeToLimit(): number {
    return this.eventData.estimatedTimeToLimit;
  }

  /**
   * 获取警告时间
   *
   * @returns 警告时间
   */
  get warningAt(): Date {
    return this.eventData.warningAt;
  }

  /**
   * 获取是否启用自动扩容
   *
   * @returns 是否启用自动扩容
   */
  get autoExpansionEnabled(): boolean {
    return this.eventData.autoExpansionEnabled;
  }

  /**
   * 获取扩容建议
   *
   * @returns 扩容建议或undefined
   */
  get expansionRecommendation():
    | {
        readonly recommendedLimit: number;
        readonly expansionFactor: number;
        readonly reason: string;
        readonly urgency: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
      }
    | undefined {
    return this.eventData.expansionRecommendation;
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
   * 检查是否为接近限制警告
   *
   * @returns 是否为接近限制警告
   */
  isApproachingLimit(): boolean {
    return this.eventData.warningType === "APPROACHING_LIMIT";
  }

  /**
   * 检查是否为接近限制警告
   *
   * @returns 是否为接近限制警告
   */
  isNearLimit(): boolean {
    return this.eventData.warningType === "NEAR_LIMIT";
  }

  /**
   * 检查是否为临界阈值警告
   *
   * @returns 是否为临界阈值警告
   */
  isCriticalThreshold(): boolean {
    return this.eventData.warningType === "CRITICAL_THRESHOLD";
  }

  /**
   * 检查是否为高优先级警告
   *
   * @returns 是否为高优先级警告
   */
  isHighPriority(): boolean {
    return this.eventData.usagePercentage >= 90;
  }

  /**
   * 检查是否为紧急警告
   *
   * @returns 是否为紧急警告
   */
  isUrgent(): boolean {
    return this.eventData.usagePercentage >= 95;
  }

  /**
   * 检查是否需要立即扩容
   *
   * @returns 是否需要立即扩容
   */
  needsImmediateExpansion(): boolean {
    return this.eventData.estimatedTimeToLimit <= 24; // 24小时内到达限制
  }

  /**
   * 检查是否需要扩容
   *
   * @returns 是否需要扩容
   */
  needsExpansion(): boolean {
    return this.eventData.estimatedTimeToLimit <= 72; // 72小时内到达限制
  }

  /**
   * 获取警告级别
   *
   * @returns 警告级别
   */
  getWarningLevel(): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    if (this.isUrgent()) {
      return "CRITICAL";
    } else if (this.isHighPriority()) {
      return "HIGH";
    } else if (this.eventData.usagePercentage >= 80) {
      return "MEDIUM";
    } else {
      return "LOW";
    }
  }

  /**
   * 获取事件摘要
   *
   * @returns 事件摘要
   */
  getSummary(): string {
    const warningLevel = this.getWarningLevel();
    const warningTypeText = this.isCriticalThreshold()
      ? "临界阈值"
      : this.isNearLimit()
        ? "接近限制"
        : "接近限制";

    return `租户 ${this.tenantId.value} 的 ${this.resourceType} 资源使用警告，当前使用: ${this.currentUsage}/${this.maxLimit} (${this.usagePercentage.toFixed(1)}%)，警告类型: ${warningTypeText}，警告级别: ${warningLevel}，预计到达限制时间: ${this.estimatedTimeToLimit}小时`;
  }

  /**
   * 获取事件详细信息
   *
   * @returns 事件详细信息
   */
  getDetails(): Record<string, unknown> {
    return {
      eventType: "ResourceUsageWarningEvent",
      tenantId: this.tenantId.value,
      resourceType: this.resourceType,
      currentUsage: this.currentUsage,
      maxLimit: this.maxLimit,
      usagePercentage: this.usagePercentage,
      warningThreshold: this.warningThreshold,
      warningType: this.warningType,
      remainingCapacity: this.remainingCapacity,
      estimatedTimeToLimit: this.estimatedTimeToLimit,
      warningAt: this.warningAt.toISOString(),
      autoExpansionEnabled: this.autoExpansionEnabled,
      expansionRecommendation: this.expansionRecommendation,
      isApproachingLimit: this.isApproachingLimit(),
      isNearLimit: this.isNearLimit(),
      isCriticalThreshold: this.isCriticalThreshold(),
      isHighPriority: this.isHighPriority(),
      isUrgent: this.isUrgent(),
      needsImmediateExpansion: this.needsImmediateExpansion(),
      needsExpansion: this.needsExpansion(),
      warningLevel: this.getWarningLevel(),
      metadata: this.metadata,
    };
  }

  /**
   * 创建资源使用警告事件
   *
   * @param tenantId - 租户ID
   * @param resourceType - 资源类型
   * @param currentUsage - 当前使用量
   * @param maxLimit - 最大限制
   * @param usagePercentage - 使用百分比
   * @param warningThreshold - 警告阈值
   * @param warningType - 警告类型
   * @param remainingCapacity - 剩余容量
   * @param estimatedTimeToLimit - 预计到达限制时间
   * @param autoExpansionEnabled - 是否启用自动扩容
   * @param expansionRecommendation - 扩容建议
   * @param metadata - 元数据
   * @returns 资源使用警告事件
   */
  static create(
    tenantId: TenantId,
    resourceType: ResourceType,
    currentUsage: number,
    maxLimit: number,
    usagePercentage: number,
    warningThreshold: number,
    warningType: "APPROACHING_LIMIT" | "NEAR_LIMIT" | "CRITICAL_THRESHOLD",
    remainingCapacity: number,
    estimatedTimeToLimit: number,
    autoExpansionEnabled: boolean = false,
    expansionRecommendation?: {
      readonly recommendedLimit: number;
      readonly expansionFactor: number;
      readonly reason: string;
      readonly urgency: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    },
    metadata: Record<string, unknown> = {},
  ): ResourceUsageWarningEvent {
    return new ResourceUsageWarningEvent({
      tenantId,
      resourceType,
      currentUsage,
      maxLimit,
      usagePercentage,
      warningThreshold,
      warningType,
      remainingCapacity,
      estimatedTimeToLimit,
      warningAt: new Date(),
      autoExpansionEnabled,
      expansionRecommendation,
      metadata,
    });
  }

  /**
   * 创建接近限制警告事件
   *
   * @param tenantId - 租户ID
   * @param resourceType - 资源类型
   * @param currentUsage - 当前使用量
   * @param maxLimit - 最大限制
   * @param usagePercentage - 使用百分比
   * @param remainingCapacity - 剩余容量
   * @param estimatedTimeToLimit - 预计到达限制时间
   * @param autoExpansionEnabled - 是否启用自动扩容
   * @param expansionRecommendation - 扩容建议
   * @param metadata - 元数据
   * @returns 接近限制警告事件
   */
  static createApproachingLimit(
    tenantId: TenantId,
    resourceType: ResourceType,
    currentUsage: number,
    maxLimit: number,
    usagePercentage: number,
    remainingCapacity: number,
    estimatedTimeToLimit: number,
    autoExpansionEnabled: boolean = false,
    expansionRecommendation?: {
      readonly recommendedLimit: number;
      readonly expansionFactor: number;
      readonly reason: string;
      readonly urgency: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    },
    metadata: Record<string, unknown> = {},
  ): ResourceUsageWarningEvent {
    return ResourceUsageWarningEvent.create(
      tenantId,
      resourceType,
      currentUsage,
      maxLimit,
      usagePercentage,
      75, // 默认接近限制阈值为75%
      "APPROACHING_LIMIT",
      remainingCapacity,
      estimatedTimeToLimit,
      autoExpansionEnabled,
      expansionRecommendation,
      metadata,
    );
  }

  /**
   * 创建接近限制警告事件
   *
   * @param tenantId - 租户ID
   * @param resourceType - 资源类型
   * @param currentUsage - 当前使用量
   * @param maxLimit - 最大限制
   * @param usagePercentage - 使用百分比
   * @param remainingCapacity - 剩余容量
   * @param estimatedTimeToLimit - 预计到达限制时间
   * @param autoExpansionEnabled - 是否启用自动扩容
   * @param expansionRecommendation - 扩容建议
   * @param metadata - 元数据
   * @returns 接近限制警告事件
   */
  static createNearLimit(
    tenantId: TenantId,
    resourceType: ResourceType,
    currentUsage: number,
    maxLimit: number,
    usagePercentage: number,
    remainingCapacity: number,
    estimatedTimeToLimit: number,
    autoExpansionEnabled: boolean = false,
    expansionRecommendation?: {
      readonly recommendedLimit: number;
      readonly expansionFactor: number;
      readonly reason: string;
      readonly urgency: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    },
    metadata: Record<string, unknown> = {},
  ): ResourceUsageWarningEvent {
    return ResourceUsageWarningEvent.create(
      tenantId,
      resourceType,
      currentUsage,
      maxLimit,
      usagePercentage,
      85, // 默认接近限制阈值为85%
      "NEAR_LIMIT",
      remainingCapacity,
      estimatedTimeToLimit,
      autoExpansionEnabled,
      expansionRecommendation,
      metadata,
    );
  }

  /**
   * 创建临界阈值警告事件
   *
   * @param tenantId - 租户ID
   * @param resourceType - 资源类型
   * @param currentUsage - 当前使用量
   * @param maxLimit - 最大限制
   * @param usagePercentage - 使用百分比
   * @param remainingCapacity - 剩余容量
   * @param estimatedTimeToLimit - 预计到达限制时间
   * @param autoExpansionEnabled - 是否启用自动扩容
   * @param expansionRecommendation - 扩容建议
   * @param metadata - 元数据
   * @returns 临界阈值警告事件
   */
  static createCriticalThreshold(
    tenantId: TenantId,
    resourceType: ResourceType,
    currentUsage: number,
    maxLimit: number,
    usagePercentage: number,
    remainingCapacity: number,
    estimatedTimeToLimit: number,
    autoExpansionEnabled: boolean = false,
    expansionRecommendation?: {
      readonly recommendedLimit: number;
      readonly expansionFactor: number;
      readonly reason: string;
      readonly urgency: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    },
    metadata: Record<string, unknown> = {},
  ): ResourceUsageWarningEvent {
    return ResourceUsageWarningEvent.create(
      tenantId,
      resourceType,
      currentUsage,
      maxLimit,
      usagePercentage,
      95, // 默认临界阈值为95%
      "CRITICAL_THRESHOLD",
      remainingCapacity,
      estimatedTimeToLimit,
      autoExpansionEnabled,
      expansionRecommendation,
      metadata,
    );
  }
}
