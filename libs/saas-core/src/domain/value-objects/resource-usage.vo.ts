/**
 * 资源使用情况值对象
 *
 * @description 表示租户的资源使用情况，包括各种资源的使用量、使用率等信息
 * @since 1.0.0
 */

import { BaseValueObject } from "./base-value-object.js";
import { TenantId } from "@hl8/domain-kernel";

/**
 * 资源类型枚举
 */
export enum ResourceType {
  USERS = "USERS",
  ORGANIZATIONS = "ORGANIZATIONS",
  DEPARTMENTS = "DEPARTMENTS",
  STORAGE = "STORAGE",
  API_CALLS = "API_CALLS",
  BANDWIDTH = "BANDWIDTH",
  COMPUTE = "COMPUTE",
  DATABASE = "DATABASE",
  CUSTOM = "CUSTOM",
}

/**
 * 资源使用情况接口
 */
export interface IResourceUsage {
  readonly tenantId: TenantId;
  readonly resourceType: ResourceType;
  readonly currentUsage: number;
  readonly maxLimit: number;
  readonly usagePercentage: number;
  readonly lastUpdated: Date;
  readonly metadata: Record<string, unknown>;
}

/**
 * 资源使用情况值对象
 *
 * 资源使用情况值对象表示租户的资源使用情况，包括各种资源的使用量、使用率等信息。
 * 支持多种资源类型、使用量监控、使用率计算等功能。
 *
 * @example
 * ```typescript
 * const usage = new ResourceUsage({
 *   tenantId: new TenantId("tenant-123"),
 *   resourceType: ResourceType.USERS,
 *   currentUsage: 150,
 *   maxLimit: 200,
 *   usagePercentage: 75,
 *   lastUpdated: new Date(),
 *   metadata: { source: "automatic", category: "user_management" }
 * });
 * ```
 */
export class ResourceUsage extends BaseValueObject<IResourceUsage> {
  constructor(usage: IResourceUsage) {
    super(usage);
    this.validateUsage(usage);
  }

  /**
   * 验证资源使用情况
   *
   * @param usage - 资源使用情况
   * @throws {Error} 当使用情况无效时抛出错误
   */
  private validateUsage(usage: IResourceUsage): void {
    if (!usage.tenantId) {
      throw new Error("租户ID不能为空");
    }
    if (!usage.resourceType) {
      throw new Error("资源类型不能为空");
    }
    if (usage.currentUsage < 0) {
      throw new Error("当前使用量不能为负数");
    }
    if (usage.maxLimit < 0) {
      throw new Error("最大限制不能为负数");
    }
    if (usage.usagePercentage < 0 || usage.usagePercentage > 100) {
      throw new Error("使用率必须在0-100之间");
    }
    if (!usage.lastUpdated) {
      throw new Error("最后更新时间不能为空");
    }

    // 验证使用率计算的准确性
    const calculatedPercentage =
      usage.maxLimit > 0 ? (usage.currentUsage / usage.maxLimit) * 100 : 0;
    const percentageDiff = Math.abs(
      usage.usagePercentage - calculatedPercentage,
    );
    if (percentageDiff > 0.1) {
      // 允许0.1%的误差
      throw new Error("使用率计算不准确");
    }
  }

  /**
   * 获取租户ID
   *
   * @returns 租户ID
   */
  get tenantId(): TenantId {
    return this.value.tenantId;
  }

  /**
   * 获取资源类型
   *
   * @returns 资源类型
   */
  get resourceType(): ResourceType {
    return this.value.resourceType;
  }

  /**
   * 获取当前使用量
   *
   * @returns 当前使用量
   */
  get currentUsage(): number {
    return this.value.currentUsage;
  }

  /**
   * 获取最大限制
   *
   * @returns 最大限制
   */
  get maxLimit(): number {
    return this.value.maxLimit;
  }

  /**
   * 获取使用率
   *
   * @returns 使用率
   */
  get usagePercentage(): number {
    return this.value.usagePercentage;
  }

  /**
   * 获取最后更新时间
   *
   * @returns 最后更新时间
   */
  get lastUpdated(): Date {
    return this.value.lastUpdated;
  }

  /**
   * 获取元数据
   *
   * @returns 元数据
   */
  get metadata(): Record<string, unknown> {
    return this.value.metadata;
  }

  /**
   * 检查是否超过限制
   *
   * @returns 是否超过限制
   */
  isOverLimit(): boolean {
    return this.value.currentUsage > this.value.maxLimit;
  }

  /**
   * 检查是否接近限制
   *
   * @param threshold - 阈值（百分比）
   * @returns 是否接近限制
   */
  isNearLimit(threshold: number = 80): boolean {
    return this.value.usagePercentage >= threshold && !this.isOverLimit();
  }

  /**
   * 检查是否接近警告阈值
   *
   * @param warningThreshold - 警告阈值（百分比）
   * @returns 是否接近警告阈值
   */
  isNearWarningThreshold(warningThreshold: number = 70): boolean {
    return (
      this.value.usagePercentage >= warningThreshold &&
      this.value.usagePercentage < 80
    );
  }

  /**
   * 获取剩余容量
   *
   * @returns 剩余容量
   */
  getRemainingCapacity(): number {
    return Math.max(0, this.value.maxLimit - this.value.currentUsage);
  }

  /**
   * 获取剩余容量百分比
   *
   * @returns 剩余容量百分比
   */
  getRemainingCapacityPercentage(): number {
    if (this.value.maxLimit === 0) {
      return 0;
    }
    return Math.max(0, 100 - this.value.usagePercentage);
  }

  /**
   * 获取使用量增长趋势
   *
   * @param previousUsage - 之前的使用量
   * @returns 使用量增长趋势
   */
  getUsageGrowthTrend(previousUsage: number): {
    readonly growth: number;
    readonly growthPercentage: number;
    readonly trend: "INCREASING" | "DECREASING" | "STABLE";
  } {
    const growth = this.value.currentUsage - previousUsage;
    const growthPercentage =
      previousUsage > 0 ? (growth / previousUsage) * 100 : 0;

    let trend: "INCREASING" | "DECREASING" | "STABLE";
    if (growth > 0) {
      trend = "INCREASING";
    } else if (growth < 0) {
      trend = "DECREASING";
    } else {
      trend = "STABLE";
    }

    return {
      growth,
      growthPercentage,
      trend,
    };
  }

  /**
   * 检查是否需要扩容
   *
   * @param expansionThreshold - 扩容阈值（百分比）
   * @returns 是否需要扩容
   */
  needsExpansion(expansionThreshold: number = 90): boolean {
    return this.value.usagePercentage >= expansionThreshold;
  }

  /**
   * 检查是否需要紧急扩容
   *
   * @param emergencyThreshold - 紧急扩容阈值（百分比）
   * @returns 是否需要紧急扩容
   */
  needsEmergencyExpansion(emergencyThreshold: number = 95): boolean {
    return this.value.usagePercentage >= emergencyThreshold;
  }

  /**
   * 获取资源使用效率
   *
   * @returns 资源使用效率
   */
  getResourceEfficiency(): {
    readonly efficiency: number;
    readonly efficiencyLevel: "LOW" | "MEDIUM" | "HIGH" | "OPTIMAL";
  } {
    const efficiency = this.value.usagePercentage;

    let efficiencyLevel: "LOW" | "MEDIUM" | "HIGH" | "OPTIMAL";
    if (efficiency < 30) {
      efficiencyLevel = "LOW";
    } else if (efficiency < 60) {
      efficiencyLevel = "MEDIUM";
    } else if (efficiency < 80) {
      efficiencyLevel = "HIGH";
    } else {
      efficiencyLevel = "OPTIMAL";
    }

    return {
      efficiency,
      efficiencyLevel,
    };
  }

  /**
   * 创建新的使用量
   *
   * @param currentUsage - 新使用量
   * @param lastUpdated - 更新时间
   * @returns 新的资源使用情况
   */
  withCurrentUsage(currentUsage: number, lastUpdated: Date): ResourceUsage {
    const usagePercentage =
      this.value.maxLimit > 0 ? (currentUsage / this.value.maxLimit) * 100 : 0;

    return new ResourceUsage({
      ...this.value,
      currentUsage,
      usagePercentage,
      lastUpdated,
    });
  }

  /**
   * 创建新的最大限制
   *
   * @param maxLimit - 新最大限制
   * @param lastUpdated - 更新时间
   * @returns 新的资源使用情况
   */
  withMaxLimit(maxLimit: number, lastUpdated: Date): ResourceUsage {
    const usagePercentage =
      maxLimit > 0 ? (this.value.currentUsage / maxLimit) * 100 : 0;

    return new ResourceUsage({
      ...this.value,
      maxLimit,
      usagePercentage,
      lastUpdated,
    });
  }

  /**
   * 创建新的元数据
   *
   * @param metadata - 元数据
   * @returns 新的资源使用情况
   */
  withMetadata(metadata: Record<string, unknown>): ResourceUsage {
    return new ResourceUsage({
      ...this.value,
      metadata: { ...this.value.metadata, ...metadata },
    });
  }

  /**
   * 获取资源使用情况的字符串表示
   *
   * @returns 字符串表示
   */
  toString(): string {
    return `ResourceUsage(tenantId: ${this.tenantId.value}, resourceType: ${this.resourceType}, currentUsage: ${this.currentUsage}, maxLimit: ${this.maxLimit}, usagePercentage: ${this.usagePercentage}%)`;
  }

  /**
   * 创建资源使用情况
   *
   * @param tenantId - 租户ID
   * @param resourceType - 资源类型
   * @param currentUsage - 当前使用量
   * @param maxLimit - 最大限制
   * @param metadata - 元数据
   * @returns 资源使用情况
   */
  static create(
    tenantId: TenantId,
    resourceType: ResourceType,
    currentUsage: number,
    maxLimit: number,
    metadata: Record<string, unknown> = {},
  ): ResourceUsage {
    const usagePercentage = maxLimit > 0 ? (currentUsage / maxLimit) * 100 : 0;

    return new ResourceUsage({
      tenantId,
      resourceType,
      currentUsage,
      maxLimit,
      usagePercentage,
      lastUpdated: new Date(),
      metadata,
    });
  }

  /**
   * 创建用户资源使用情况
   *
   * @param tenantId - 租户ID
   * @param currentUsage - 当前用户数
   * @param maxLimit - 最大用户数
   * @param metadata - 元数据
   * @returns 用户资源使用情况
   */
  static createUserUsage(
    tenantId: TenantId,
    currentUsage: number,
    maxLimit: number,
    metadata: Record<string, unknown> = {},
  ): ResourceUsage {
    return ResourceUsage.create(
      tenantId,
      ResourceType.USERS,
      currentUsage,
      maxLimit,
      { ...metadata, category: "user_management" },
    );
  }

  /**
   * 创建存储资源使用情况
   *
   * @param tenantId - 租户ID
   * @param currentUsage - 当前存储使用量（字节）
   * @param maxLimit - 最大存储限制（字节）
   * @param metadata - 元数据
   * @returns 存储资源使用情况
   */
  static createStorageUsage(
    tenantId: TenantId,
    currentUsage: number,
    maxLimit: number,
    metadata: Record<string, unknown> = {},
  ): ResourceUsage {
    return ResourceUsage.create(
      tenantId,
      ResourceType.STORAGE,
      currentUsage,
      maxLimit,
      { ...metadata, category: "storage_management" },
    );
  }

  /**
   * 创建API调用资源使用情况
   *
   * @param tenantId - 租户ID
   * @param currentUsage - 当前API调用次数
   * @param maxLimit - 最大API调用次数
   * @param metadata - 元数据
   * @returns API调用资源使用情况
   */
  static createApiUsage(
    tenantId: TenantId,
    currentUsage: number,
    maxLimit: number,
    metadata: Record<string, unknown> = {},
  ): ResourceUsage {
    return ResourceUsage.create(
      tenantId,
      ResourceType.API_CALLS,
      currentUsage,
      maxLimit,
      { ...metadata, category: "api_management" },
    );
  }
}
