/**
 * 资源限制超出事件
 *
 * @description 表示资源使用量超出限制的事件
 * @since 1.0.0
 */

import { DomainEvent } from "@hl8/domain-kernel";
import { TenantId } from "../value-objects/tenant-id.vo.js";
import { ResourceType } from "../value-objects/resource-usage.vo.js";
import { ResourceLimitType } from "../value-objects/resource-limits.vo.js";

/**
 * 资源限制超出事件接口
 */
export interface IResourceLimitExceededEvent {
  readonly tenantId: TenantId;
  readonly resourceType: ResourceType;
  readonly currentUsage: number;
  readonly limitType: ResourceLimitType;
  readonly limitValue: number;
  readonly exceededBy: number;
  readonly exceededAt: Date;
  readonly severity: "WARNING" | "ERROR" | "CRITICAL";
  readonly autoExpansionEnabled: boolean;
  readonly expansionRecommendation?: {
    readonly recommendedLimit: number;
    readonly expansionFactor: number;
    readonly reason: string;
  };
  readonly metadata: Record<string, unknown>;
}

/**
 * 资源限制超出事件
 *
 * 资源限制超出事件表示资源使用量超出限制的事件。
 * 当资源使用量超出设定的限制时，系统会发布此事件以通知相关组件。
 *
 * @example
 * ```typescript
 * const event = new ResourceLimitExceededEvent({
 *   tenantId: new TenantId("tenant-123"),
 *   resourceType: ResourceType.USERS,
 *   currentUsage: 1100,
 *   limitType: ResourceLimitType.HARD_LIMIT,
 *   limitValue: 1000,
 *   exceededBy: 100,
 *   exceededAt: new Date(),
 *   severity: "CRITICAL",
 *   autoExpansionEnabled: true,
 *   metadata: { source: "automatic", category: "resource_monitoring" }
 * });
 * ```
 */
export class ResourceLimitExceededEvent extends DomainEvent {
  constructor(eventData: IResourceLimitExceededEvent) {
    super("ResourceLimitExceededEvent", eventData.tenantId.value);

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
   * 获取限制类型
   *
   * @returns 限制类型
   */
  get limitType(): ResourceLimitType {
    return this.eventData.limitType;
  }

  /**
   * 获取限制值
   *
   * @returns 限制值
   */
  get limitValue(): number {
    return this.eventData.limitValue;
  }

  /**
   * 获取超出量
   *
   * @returns 超出量
   */
  get exceededBy(): number {
    return this.eventData.exceededBy;
  }

  /**
   * 获取超出时间
   *
   * @returns 超出时间
   */
  get exceededAt(): Date {
    return this.eventData.exceededAt;
  }

  /**
   * 获取严重程度
   *
   * @returns 严重程度
   */
  get severity(): "WARNING" | "ERROR" | "CRITICAL" {
    return this.eventData.severity;
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
   * 检查是否为硬限制超出
   *
   * @returns 是否为硬限制超出
   */
  isHardLimitExceeded(): boolean {
    return this.eventData.limitType === ResourceLimitType.HARD_LIMIT;
  }

  /**
   * 检查是否为软限制超出
   *
   * @returns 是否为软限制超出
   */
  isSoftLimitExceeded(): boolean {
    return this.eventData.limitType === ResourceLimitType.SOFT_LIMIT;
  }

  /**
   * 检查是否为警告限制超出
   *
   * @returns 是否为警告限制超出
   */
  isWarningLimitExceeded(): boolean {
    return this.eventData.limitType === ResourceLimitType.WARNING_LIMIT;
  }

  /**
   * 检查是否为紧急限制超出
   *
   * @returns 是否为紧急限制超出
   */
  isEmergencyLimitExceeded(): boolean {
    return this.eventData.limitType === ResourceLimitType.EMERGENCY_LIMIT;
  }

  /**
   * 检查是否为严重事件
   *
   * @returns 是否为严重事件
   */
  isCritical(): boolean {
    return this.eventData.severity === "CRITICAL";
  }

  /**
   * 检查是否为错误事件
   *
   * @returns 是否为错误事件
   */
  isError(): boolean {
    return this.eventData.severity === "ERROR";
  }

  /**
   * 检查是否为警告事件
   *
   * @returns 是否为警告事件
   */
  isWarning(): boolean {
    return this.eventData.severity === "WARNING";
  }

  /**
   * 获取超出百分比
   *
   * @returns 超出百分比
   */
  getExceededPercentage(): number {
    if (this.eventData.limitValue === 0) {
      return 0;
    }
    return (this.eventData.exceededBy / this.eventData.limitValue) * 100;
  }

  /**
   * 获取当前使用百分比
   *
   * @returns 当前使用百分比
   */
  getCurrentUsagePercentage(): number {
    if (this.eventData.limitValue === 0) {
      return 0;
    }
    return (this.eventData.currentUsage / this.eventData.limitValue) * 100;
  }

  /**
   * 获取事件摘要
   *
   * @returns 事件摘要
   */
  getSummary(): string {
    const severityText = this.isCritical()
      ? "严重"
      : this.isError()
        ? "错误"
        : "警告";
    const limitTypeText = this.isHardLimitExceeded()
      ? "硬限制"
      : this.isSoftLimitExceeded()
        ? "软限制"
        : this.isWarningLimitExceeded()
          ? "警告限制"
          : "紧急限制";

    return `租户 ${this.tenantId.value} 的 ${this.resourceType} 资源超出 ${limitTypeText}，当前使用: ${this.currentUsage}，限制: ${this.limitValue}，超出: ${this.exceededBy}，严重程度: ${severityText}`;
  }

  /**
   * 获取事件详细信息
   *
   * @returns 事件详细信息
   */
  getDetails(): Record<string, unknown> {
    return {
      eventType: "ResourceLimitExceededEvent",
      tenantId: this.tenantId.value,
      resourceType: this.resourceType,
      currentUsage: this.currentUsage,
      limitType: this.limitType,
      limitValue: this.limitValue,
      exceededBy: this.exceededBy,
      exceededAt: this.exceededAt.toISOString(),
      severity: this.severity,
      autoExpansionEnabled: this.autoExpansionEnabled,
      expansionRecommendation: this.expansionRecommendation,
      isHardLimitExceeded: this.isHardLimitExceeded(),
      isSoftLimitExceeded: this.isSoftLimitExceeded(),
      isWarningLimitExceeded: this.isWarningLimitExceeded(),
      isEmergencyLimitExceeded: this.isEmergencyLimitExceeded(),
      isCritical: this.isCritical(),
      isError: this.isError(),
      isWarning: this.isWarning(),
      exceededPercentage: this.getExceededPercentage(),
      currentUsagePercentage: this.getCurrentUsagePercentage(),
      metadata: this.metadata,
    };
  }

  /**
   * 创建资源限制超出事件
   *
   * @param tenantId - 租户ID
   * @param resourceType - 资源类型
   * @param currentUsage - 当前使用量
   * @param limitType - 限制类型
   * @param limitValue - 限制值
   * @param exceededBy - 超出量
   * @param severity - 严重程度
   * @param autoExpansionEnabled - 是否启用自动扩容
   * @param expansionRecommendation - 扩容建议
   * @param metadata - 元数据
   * @returns 资源限制超出事件
   */
  static create(
    tenantId: TenantId,
    resourceType: ResourceType,
    currentUsage: number,
    limitType: ResourceLimitType,
    limitValue: number,
    exceededBy: number,
    severity: "WARNING" | "ERROR" | "CRITICAL",
    autoExpansionEnabled: boolean = false,
    expansionRecommendation?: {
      readonly recommendedLimit: number;
      readonly expansionFactor: number;
      readonly reason: string;
    },
    metadata: Record<string, unknown> = {},
  ): ResourceLimitExceededEvent {
    return new ResourceLimitExceededEvent({
      tenantId,
      resourceType,
      currentUsage,
      limitType,
      limitValue,
      exceededBy,
      exceededAt: new Date(),
      severity,
      autoExpansionEnabled,
      expansionRecommendation,
      metadata,
    });
  }

  /**
   * 创建硬限制超出事件
   *
   * @param tenantId - 租户ID
   * @param resourceType - 资源类型
   * @param currentUsage - 当前使用量
   * @param limitValue - 限制值
   * @param exceededBy - 超出量
   * @param autoExpansionEnabled - 是否启用自动扩容
   * @param expansionRecommendation - 扩容建议
   * @param metadata - 元数据
   * @returns 硬限制超出事件
   */
  static createHardLimitExceeded(
    tenantId: TenantId,
    resourceType: ResourceType,
    currentUsage: number,
    limitValue: number,
    exceededBy: number,
    autoExpansionEnabled: boolean = false,
    expansionRecommendation?: {
      readonly recommendedLimit: number;
      readonly expansionFactor: number;
      readonly reason: string;
    },
    metadata: Record<string, unknown> = {},
  ): ResourceLimitExceededEvent {
    return ResourceLimitExceededEvent.create(
      tenantId,
      resourceType,
      currentUsage,
      ResourceLimitType.HARD_LIMIT,
      limitValue,
      exceededBy,
      "CRITICAL",
      autoExpansionEnabled,
      expansionRecommendation,
      metadata,
    );
  }

  /**
   * 创建软限制超出事件
   *
   * @param tenantId - 租户ID
   * @param resourceType - 资源类型
   * @param currentUsage - 当前使用量
   * @param limitValue - 限制值
   * @param exceededBy - 超出量
   * @param autoExpansionEnabled - 是否启用自动扩容
   * @param expansionRecommendation - 扩容建议
   * @param metadata - 元数据
   * @returns 软限制超出事件
   */
  static createSoftLimitExceeded(
    tenantId: TenantId,
    resourceType: ResourceType,
    currentUsage: number,
    limitValue: number,
    exceededBy: number,
    autoExpansionEnabled: boolean = false,
    expansionRecommendation?: {
      readonly recommendedLimit: number;
      readonly expansionFactor: number;
      readonly reason: string;
    },
    metadata: Record<string, unknown> = {},
  ): ResourceLimitExceededEvent {
    return ResourceLimitExceededEvent.create(
      tenantId,
      resourceType,
      currentUsage,
      ResourceLimitType.SOFT_LIMIT,
      limitValue,
      exceededBy,
      "ERROR",
      autoExpansionEnabled,
      expansionRecommendation,
      metadata,
    );
  }

  /**
   * 创建警告限制超出事件
   *
   * @param tenantId - 租户ID
   * @param resourceType - 资源类型
   * @param currentUsage - 当前使用量
   * @param limitValue - 限制值
   * @param exceededBy - 超出量
   * @param autoExpansionEnabled - 是否启用自动扩容
   * @param expansionRecommendation - 扩容建议
   * @param metadata - 元数据
   * @returns 警告限制超出事件
   */
  static createWarningLimitExceeded(
    tenantId: TenantId,
    resourceType: ResourceType,
    currentUsage: number,
    limitValue: number,
    exceededBy: number,
    autoExpansionEnabled: boolean = false,
    expansionRecommendation?: {
      readonly recommendedLimit: number;
      readonly expansionFactor: number;
      readonly reason: string;
    },
    metadata: Record<string, unknown> = {},
  ): ResourceLimitExceededEvent {
    return ResourceLimitExceededEvent.create(
      tenantId,
      resourceType,
      currentUsage,
      ResourceLimitType.WARNING_LIMIT,
      limitValue,
      exceededBy,
      "WARNING",
      autoExpansionEnabled,
      expansionRecommendation,
      metadata,
    );
  }
}
