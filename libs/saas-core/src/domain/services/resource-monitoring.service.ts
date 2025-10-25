/**
 * 资源监控服务
 *
 * @description 处理资源使用情况的监控和管理，包括资源使用量跟踪、限制检查、扩容建议等
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { DomainService } from "@hl8/domain-kernel";
import { TenantId } from "../value-objects/tenant-id.vo.js";
import {
  ResourceUsage,
  ResourceType,
} from "../value-objects/resource-usage.vo.js";
import {
  ResourceLimits,
  ResourceLimitType,
} from "../value-objects/resource-limits.vo.js";

/**
 * 资源监控服务
 *
 * 资源监控服务负责处理资源使用情况的监控和管理，包括资源使用量跟踪、限制检查、扩容建议等。
 * 支持多种资源类型、多层次限制、自动扩容等功能。
 *
 * @example
 * ```typescript
 * const monitoringService = new ResourceMonitoringService();
 * const usage = await monitoringService.getResourceUsage(tenantId, ResourceType.USERS);
 * const isOverLimit = await monitoringService.checkResourceLimits(usage, limits);
 * ```
 */
@Injectable()
export class ResourceMonitoringService extends DomainService {
  constructor() {
    super();
    this.setContext("ResourceMonitoringService");
  }

  /**
   * 获取资源使用情况
   *
   * @param tenantId - 租户ID
   * @param resourceType - 资源类型
   * @returns 资源使用情况
   */
  async getResourceUsage(
    tenantId: TenantId,
    resourceType: ResourceType,
  ): Promise<ResourceUsage> {
    this.logger.log(
      `Getting resource usage for tenant ${tenantId.value} and resource type ${resourceType}`,
      this.context,
    );

    // 这里应该从实际的数据源获取资源使用情况
    // 目前返回模拟数据
    const mockUsage = this.generateMockUsage(tenantId, resourceType);

    this.logger.log(
      `Resource usage retrieved for tenant ${tenantId.value}: ${mockUsage.currentUsage}/${mockUsage.maxLimit}`,
      this.context,
    );

    return mockUsage;
  }

  /**
   * 更新资源使用情况
   *
   * @param tenantId - 租户ID
   * @param resourceType - 资源类型
   * @param currentUsage - 当前使用量
   * @param maxLimit - 最大限制
   * @returns 更新后的资源使用情况
   */
  async updateResourceUsage(
    tenantId: TenantId,
    resourceType: ResourceType,
    currentUsage: number,
    maxLimit: number,
  ): Promise<ResourceUsage> {
    this.logger.log(
      `Updating resource usage for tenant ${tenantId.value} and resource type ${resourceType}: ${currentUsage}/${maxLimit}`,
      this.context,
    );

    const updatedUsage = ResourceUsage.create(
      tenantId,
      resourceType,
      currentUsage,
      maxLimit,
      { source: "manual_update", timestamp: new Date().toISOString() },
    );

    this.logger.log(
      `Resource usage updated for tenant ${tenantId.value}`,
      this.context,
    );

    return updatedUsage;
  }

  /**
   * 检查资源限制
   *
   * @param usage - 资源使用情况
   * @param limits - 资源限制
   * @returns 限制检查结果
   */
  async checkResourceLimits(
    usage: ResourceUsage,
    limits: ResourceLimits,
  ): Promise<{
    readonly isOverHardLimit: boolean;
    readonly isOverSoftLimit: boolean;
    readonly isOverWarningLimit: boolean;
    readonly isOverEmergencyLimit: boolean;
    readonly limitLevel:
      | "NORMAL"
      | "WARNING"
      | "SOFT_LIMIT"
      | "EMERGENCY"
      | "HARD_LIMIT";
    readonly percentage: number;
    readonly remainingCapacity: number;
    readonly needsExpansion: boolean;
    readonly needsEmergencyExpansion: boolean;
  }> {
    this.logger.log(
      `Checking resource limits for tenant ${usage.tenantId.value} and resource type ${usage.resourceType}`,
      this.context,
    );

    const isOverHardLimit = limits.isOverHardLimit(usage.currentUsage);
    const isOverSoftLimit = limits.isOverSoftLimit(usage.currentUsage);
    const isOverWarningLimit = limits.isOverWarningLimit(usage.currentUsage);
    const isOverEmergencyLimit = limits.isOverEmergencyLimit(
      usage.currentUsage,
    );

    const limitLevel = limits.getLimitLevel(usage.currentUsage);
    const needsExpansion = limits.needsExpansion(usage.currentUsage);
    const needsEmergencyExpansion = limits.needsEmergencyExpansion(
      usage.currentUsage,
    );

    const result = {
      isOverHardLimit,
      isOverSoftLimit,
      isOverWarningLimit,
      isOverEmergencyLimit,
      limitLevel: limitLevel.level,
      percentage: limitLevel.percentage,
      remainingCapacity: limitLevel.remainingCapacity,
      needsExpansion,
      needsEmergencyExpansion,
    };

    this.logger.log(
      `Resource limits check completed for tenant ${usage.tenantId.value}: ${result.limitLevel}`,
      this.context,
    );

    return result;
  }

  /**
   * 获取扩容建议
   *
   * @param usage - 资源使用情况
   * @param limits - 资源限制
   * @returns 扩容建议
   */
  async getExpansionRecommendation(
    usage: ResourceUsage,
    limits: ResourceLimits,
  ): Promise<{
    readonly recommendedLimit: number;
    readonly expansionFactor: number;
    readonly reason: string;
    readonly urgency: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    readonly estimatedCost: number;
  }> {
    this.logger.log(
      `Getting expansion recommendation for tenant ${usage.tenantId.value} and resource type ${usage.resourceType}`,
      this.context,
    );

    const recommendation = limits.getExpansionRecommendation(
      usage.currentUsage,
    );

    let urgency: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    if (usage.usagePercentage >= 95) {
      urgency = "URGENT";
    } else if (usage.usagePercentage >= 85) {
      urgency = "HIGH";
    } else if (usage.usagePercentage >= 75) {
      urgency = "MEDIUM";
    } else {
      urgency = "LOW";
    }

    // 简化的成本估算
    const estimatedCost = this.calculateExpansionCost(
      usage.resourceType,
      recommendation.recommendedLimit,
      usage.maxLimit,
    );

    const result = {
      ...recommendation,
      urgency,
      estimatedCost,
    };

    this.logger.log(
      `Expansion recommendation generated for tenant ${usage.tenantId.value}: ${result.recommendedLimit} (${result.urgency})`,
      this.context,
    );

    return result;
  }

  /**
   * 监控资源使用趋势
   *
   * @param tenantId - 租户ID
   * @param resourceType - 资源类型
   * @param timeRange - 时间范围（小时）
   * @returns 使用趋势
   */
  async monitorResourceTrend(
    tenantId: TenantId,
    resourceType: ResourceType,
    timeRange: number = 24,
  ): Promise<{
    readonly currentUsage: number;
    readonly previousUsage: number;
    readonly growth: number;
    readonly growthPercentage: number;
    readonly trend: "INCREASING" | "DECREASING" | "STABLE";
    readonly projectedUsage: number;
    readonly timeToLimit: number;
  }> {
    this.logger.log(
      `Monitoring resource trend for tenant ${tenantId.value} and resource type ${resourceType} over ${timeRange} hours`,
      this.context,
    );

    // 获取当前使用情况
    const currentUsage = await this.getResourceUsage(tenantId, resourceType);

    // 模拟历史数据
    const previousUsage = Math.max(
      0,
      currentUsage.currentUsage - Math.floor(Math.random() * 10),
    );

    const growth = currentUsage.currentUsage - previousUsage;
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

    // 计算预测使用量
    const projectedUsage = this.calculateProjectedUsage(
      currentUsage.currentUsage,
      growthPercentage,
      timeRange,
    );

    // 计算到达限制的时间
    const timeToLimit = this.calculateTimeToLimit(
      currentUsage.currentUsage,
      currentUsage.maxLimit,
      growthPercentage,
    );

    const result = {
      currentUsage: currentUsage.currentUsage,
      previousUsage,
      growth,
      growthPercentage,
      trend,
      projectedUsage,
      timeToLimit,
    };

    this.logger.log(
      `Resource trend analysis completed for tenant ${tenantId.value}: ${trend} (${growthPercentage.toFixed(2)}%)`,
      this.context,
    );

    return result;
  }

  /**
   * 获取资源使用统计
   *
   * @param tenantId - 租户ID
   * @returns 资源使用统计
   */
  async getResourceStatistics(tenantId: TenantId): Promise<{
    readonly totalResources: number;
    readonly resourcesByType: Record<ResourceType, number>;
    readonly resourcesOverLimit: number;
    readonly resourcesNearLimit: number;
    readonly averageUsagePercentage: number;
    readonly totalCost: number;
  }> {
    this.logger.log(
      `Getting resource statistics for tenant ${tenantId.value}`,
      this.context,
    );

    const resourceTypes = Object.values(ResourceType);
    const resourcesByType: Record<ResourceType, number> = {} as Record<
      ResourceType,
      number
    >;
    let resourcesOverLimit = 0;
    let resourcesNearLimit = 0;
    let totalUsagePercentage = 0;
    let totalCost = 0;

    for (const resourceType of resourceTypes) {
      const usage = await this.getResourceUsage(tenantId, resourceType);
      resourcesByType[resourceType] = usage.currentUsage;

      if (usage.isOverLimit()) {
        resourcesOverLimit++;
      }

      if (usage.isNearLimit()) {
        resourcesNearLimit++;
      }

      totalUsagePercentage += usage.usagePercentage;
      totalCost += this.calculateResourceCost(resourceType, usage.currentUsage);
    }

    const result = {
      totalResources: resourceTypes.length,
      resourcesByType,
      resourcesOverLimit,
      resourcesNearLimit,
      averageUsagePercentage: totalUsagePercentage / resourceTypes.length,
      totalCost,
    };

    this.logger.log(
      `Resource statistics generated for tenant ${tenantId.value}: ${result.resourcesOverLimit} over limit, ${result.resourcesNearLimit} near limit`,
      this.context,
    );

    return result;
  }

  /**
   * 生成模拟资源使用情况
   *
   * @param tenantId - 租户ID
   * @param resourceType - 资源类型
   * @returns 模拟资源使用情况
   */
  private generateMockUsage(
    tenantId: TenantId,
    resourceType: ResourceType,
  ): ResourceUsage {
    const baseUsage = this.getBaseUsageForResourceType(resourceType);
    const currentUsage = Math.floor(Math.random() * baseUsage.maxLimit);

    return ResourceUsage.create(
      tenantId,
      resourceType,
      currentUsage,
      baseUsage.maxLimit,
      { source: "mock_data", generated_at: new Date().toISOString() },
    );
  }

  /**
   * 获取资源类型的基础使用情况
   *
   * @param resourceType - 资源类型
   * @returns 基础使用情况
   */
  private getBaseUsageForResourceType(resourceType: ResourceType): {
    maxLimit: number;
  } {
    switch (resourceType) {
      case ResourceType.USERS:
        return { maxLimit: 1000 };
      case ResourceType.ORGANIZATIONS:
        return { maxLimit: 100 };
      case ResourceType.DEPARTMENTS:
        return { maxLimit: 500 };
      case ResourceType.STORAGE:
        return { maxLimit: 1000000000 }; // 1GB in bytes
      case ResourceType.API_CALLS:
        return { maxLimit: 100000 };
      case ResourceType.BANDWIDTH:
        return { maxLimit: 10000000000 }; // 10GB in bytes
      case ResourceType.COMPUTE:
        return { maxLimit: 1000 };
      case ResourceType.DATABASE:
        return { maxLimit: 100 };
      case ResourceType.CUSTOM:
        return { maxLimit: 1000 };
      default:
        return { maxLimit: 100 };
    }
  }

  /**
   * 计算扩容成本
   *
   * @param resourceType - 资源类型
   * @param recommendedLimit - 建议限制
   * @param currentLimit - 当前限制
   * @returns 扩容成本
   */
  private calculateExpansionCost(
    resourceType: ResourceType,
    recommendedLimit: number,
    currentLimit: number,
  ): number {
    const expansionFactor = recommendedLimit / currentLimit;
    const baseCost = this.getBaseCostForResourceType(resourceType);

    return baseCost * expansionFactor;
  }

  /**
   * 获取资源类型的基础成本
   *
   * @param resourceType - 资源类型
   * @returns 基础成本
   */
  private getBaseCostForResourceType(resourceType: ResourceType): number {
    switch (resourceType) {
      case ResourceType.USERS:
        return 10; // $10 per user
      case ResourceType.ORGANIZATIONS:
        return 100; // $100 per organization
      case ResourceType.DEPARTMENTS:
        return 50; // $50 per department
      case ResourceType.STORAGE:
        return 0.1; // $0.1 per GB
      case ResourceType.API_CALLS:
        return 0.001; // $0.001 per call
      case ResourceType.BANDWIDTH:
        return 0.05; // $0.05 per GB
      case ResourceType.COMPUTE:
        return 0.5; // $0.5 per unit
      case ResourceType.DATABASE:
        return 200; // $200 per database
      case ResourceType.CUSTOM:
        return 1; // $1 per unit
      default:
        return 1;
    }
  }

  /**
   * 计算资源成本
   *
   * @param resourceType - 资源类型
   * @param usage - 使用量
   * @returns 资源成本
   */
  private calculateResourceCost(
    resourceType: ResourceType,
    usage: number,
  ): number {
    const baseCost = this.getBaseCostForResourceType(resourceType);
    return baseCost * usage;
  }

  /**
   * 计算预测使用量
   *
   * @param currentUsage - 当前使用量
   * @param growthPercentage - 增长率
   * @param timeRange - 时间范围
   * @returns 预测使用量
   */
  private calculateProjectedUsage(
    currentUsage: number,
    growthPercentage: number,
    timeRange: number,
  ): number {
    const growthFactor = 1 + growthPercentage / 100;
    const timeFactor = timeRange / 24; // 转换为天数

    return Math.floor(currentUsage * Math.pow(growthFactor, timeFactor));
  }

  /**
   * 计算到达限制的时间
   *
   * @param currentUsage - 当前使用量
   * @param maxLimit - 最大限制
   * @param growthPercentage - 增长率
   * @returns 到达限制的时间（小时）
   */
  private calculateTimeToLimit(
    currentUsage: number,
    maxLimit: number,
    growthPercentage: number,
  ): number {
    if (growthPercentage <= 0) {
      return -1; // 不会到达限制
    }

    const remainingCapacity = maxLimit - currentUsage;
    if (remainingCapacity <= 0) {
      return 0; // 已经超过限制
    }

    const growthFactor = 1 + growthPercentage / 100;
    const hoursToLimit =
      (Math.log(remainingCapacity / currentUsage + 1) /
        Math.log(growthFactor)) *
      24;

    return Math.max(0, hoursToLimit);
  }
}
