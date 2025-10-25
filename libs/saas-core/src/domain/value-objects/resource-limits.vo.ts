/**
 * 资源限制值对象
 *
 * @description 表示租户的资源限制配置，包括各种资源的限制值、限制类型等信息
 * @since 1.0.0
 */

import { BaseValueObject } from "./base-value-object.js";
import { TenantId } from "@hl8/domain-kernel";
import { ResourceType } from "./resource-usage.vo.js";

/**
 * 资源限制类型枚举
 */
export enum ResourceLimitType {
  HARD_LIMIT = "HARD_LIMIT",
  SOFT_LIMIT = "SOFT_LIMIT",
  WARNING_LIMIT = "WARNING_LIMIT",
  EMERGENCY_LIMIT = "EMERGENCY_LIMIT",
}

/**
 * 资源限制接口
 */
export interface IResourceLimits {
  readonly tenantId: TenantId;
  readonly resourceType: ResourceType;
  readonly limits: Record<ResourceLimitType, number>;
  readonly isEnabled: boolean;
  readonly autoExpansion: boolean;
  readonly expansionThreshold: number;
  readonly emergencyThreshold: number;
  readonly lastUpdated: Date;
  readonly metadata: Record<string, unknown>;
}

/**
 * 资源限制值对象
 *
 * 资源限制值对象表示租户的资源限制配置，包括各种资源的限制值、限制类型等信息。
 * 支持多种限制类型、自动扩容、紧急阈值等功能。
 *
 * @example
 * ```typescript
 * const limits = new ResourceLimits({
 *   tenantId: new TenantId("tenant-123"),
 *   resourceType: ResourceType.USERS,
 *   limits: {
 *     HARD_LIMIT: 1000,
 *     SOFT_LIMIT: 800,
 *     WARNING_LIMIT: 600,
 *     EMERGENCY_LIMIT: 900,
 *   },
 *   isEnabled: true,
 *   autoExpansion: true,
 *   expansionThreshold: 80,
 *   emergencyThreshold: 95,
 *   lastUpdated: new Date(),
 *   metadata: { source: "configuration", category: "user_management" }
 * });
 * ```
 */
export class ResourceLimits extends BaseValueObject<IResourceLimits> {
  constructor(limits: IResourceLimits) {
    super(limits);
    this.validateLimits(limits);
  }

  /**
   * 验证资源限制
   *
   * @param limits - 资源限制
   * @throws {Error} 当限制无效时抛出错误
   */
  private validateLimits(limits: IResourceLimits): void {
    if (!limits.tenantId) {
      throw new Error("租户ID不能为空");
    }
    if (!limits.resourceType) {
      throw new Error("资源类型不能为空");
    }
    if (!limits.limits) {
      throw new Error("限制配置不能为空");
    }
    if (!limits.lastUpdated) {
      throw new Error("最后更新时间不能为空");
    }

    // 验证限制值的合理性
    const { limits: limitValues } = limits;

    if (limitValues.HARD_LIMIT <= 0) {
      throw new Error("硬限制必须大于0");
    }

    if (limitValues.SOFT_LIMIT <= 0) {
      throw new Error("软限制必须大于0");
    }

    if (limitValues.WARNING_LIMIT <= 0) {
      throw new Error("警告限制必须大于0");
    }

    if (limitValues.EMERGENCY_LIMIT <= 0) {
      throw new Error("紧急限制必须大于0");
    }

    // 验证限制值的层次关系
    if (limitValues.SOFT_LIMIT > limitValues.HARD_LIMIT) {
      throw new Error("软限制不能大于硬限制");
    }

    if (limitValues.WARNING_LIMIT > limitValues.SOFT_LIMIT) {
      throw new Error("警告限制不能大于软限制");
    }

    if (limitValues.EMERGENCY_LIMIT > limitValues.HARD_LIMIT) {
      throw new Error("紧急限制不能大于硬限制");
    }

    // 验证阈值
    if (limits.expansionThreshold < 0 || limits.expansionThreshold > 100) {
      throw new Error("扩容阈值必须在0-100之间");
    }

    if (limits.emergencyThreshold < 0 || limits.emergencyThreshold > 100) {
      throw new Error("紧急阈值必须在0-100之间");
    }

    if (limits.expansionThreshold >= limits.emergencyThreshold) {
      throw new Error("扩容阈值必须小于紧急阈值");
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
   * 获取限制配置
   *
   * @returns 限制配置
   */
  get limits(): Record<ResourceLimitType, number> {
    return this.value.limits;
  }

  /**
   * 获取是否启用
   *
   * @returns 是否启用
   */
  get isEnabled(): boolean {
    return this.value.isEnabled;
  }

  /**
   * 获取是否自动扩容
   *
   * @returns 是否自动扩容
   */
  get autoExpansion(): boolean {
    return this.value.autoExpansion;
  }

  /**
   * 获取扩容阈值
   *
   * @returns 扩容阈值
   */
  get expansionThreshold(): number {
    return this.value.expansionThreshold;
  }

  /**
   * 获取紧急阈值
   *
   * @returns 紧急阈值
   */
  get emergencyThreshold(): number {
    return this.value.emergencyThreshold;
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
   * 获取硬限制
   *
   * @returns 硬限制
   */
  getHardLimit(): number {
    return this.value.limits.HARD_LIMIT;
  }

  /**
   * 获取软限制
   *
   * @returns 软限制
   */
  getSoftLimit(): number {
    return this.value.limits.SOFT_LIMIT;
  }

  /**
   * 获取警告限制
   *
   * @returns 警告限制
   */
  getWarningLimit(): number {
    return this.value.limits.WARNING_LIMIT;
  }

  /**
   * 获取紧急限制
   *
   * @returns 紧急限制
   */
  getEmergencyLimit(): number {
    return this.value.limits.EMERGENCY_LIMIT;
  }

  /**
   * 检查使用量是否超过硬限制
   *
   * @param usage - 使用量
   * @returns 是否超过硬限制
   */
  isOverHardLimit(usage: number): boolean {
    return usage > this.value.limits.HARD_LIMIT;
  }

  /**
   * 检查使用量是否超过软限制
   *
   * @param usage - 使用量
   * @returns 是否超过软限制
   */
  isOverSoftLimit(usage: number): boolean {
    return usage > this.value.limits.SOFT_LIMIT;
  }

  /**
   * 检查使用量是否超过警告限制
   *
   * @param usage - 使用量
   * @returns 是否超过警告限制
   */
  isOverWarningLimit(usage: number): boolean {
    return usage > this.value.limits.WARNING_LIMIT;
  }

  /**
   * 检查使用量是否超过紧急限制
   *
   * @param usage - 使用量
   * @returns 是否超过紧急限制
   */
  isOverEmergencyLimit(usage: number): boolean {
    return usage > this.value.limits.EMERGENCY_LIMIT;
  }

  /**
   * 获取使用量对应的限制级别
   *
   * @param usage - 使用量
   * @returns 限制级别
   */
  getLimitLevel(usage: number): {
    readonly level:
      | "NORMAL"
      | "WARNING"
      | "SOFT_LIMIT"
      | "EMERGENCY"
      | "HARD_LIMIT";
    readonly percentage: number;
    readonly remainingCapacity: number;
  } {
    const hardLimit = this.value.limits.HARD_LIMIT;
    const softLimit = this.value.limits.SOFT_LIMIT;
    const warningLimit = this.value.limits.WARNING_LIMIT;
    const emergencyLimit = this.value.limits.EMERGENCY_LIMIT;

    const percentage = hardLimit > 0 ? (usage / hardLimit) * 100 : 0;
    const remainingCapacity = Math.max(0, hardLimit - usage);

    let level: "NORMAL" | "WARNING" | "SOFT_LIMIT" | "EMERGENCY" | "HARD_LIMIT";
    if (usage > hardLimit) {
      level = "HARD_LIMIT";
    } else if (usage > emergencyLimit) {
      level = "EMERGENCY";
    } else if (usage > softLimit) {
      level = "SOFT_LIMIT";
    } else if (usage > warningLimit) {
      level = "WARNING";
    } else {
      level = "NORMAL";
    }

    return {
      level,
      percentage,
      remainingCapacity,
    };
  }

  /**
   * 检查是否需要扩容
   *
   * @param usage - 使用量
   * @returns 是否需要扩容
   */
  needsExpansion(usage: number): boolean {
    if (!this.value.autoExpansion) {
      return false;
    }

    const percentage =
      this.value.limits.HARD_LIMIT > 0
        ? (usage / this.value.limits.HARD_LIMIT) * 100
        : 0;

    return percentage >= this.value.expansionThreshold;
  }

  /**
   * 检查是否需要紧急扩容
   *
   * @param usage - 使用量
   * @returns 是否需要紧急扩容
   */
  needsEmergencyExpansion(usage: number): boolean {
    if (!this.value.autoExpansion) {
      return false;
    }

    const percentage =
      this.value.limits.HARD_LIMIT > 0
        ? (usage / this.value.limits.HARD_LIMIT) * 100
        : 0;

    return percentage >= this.value.emergencyThreshold;
  }

  /**
   * 获取扩容建议
   *
   * @param usage - 使用量
   * @returns 扩容建议
   */
  getExpansionRecommendation(usage: number): {
    readonly recommendedLimit: number;
    readonly expansionFactor: number;
    readonly reason: string;
  } {
    const currentLimit = this.value.limits.HARD_LIMIT;
    const percentage = currentLimit > 0 ? (usage / currentLimit) * 100 : 0;

    let expansionFactor: number;
    let reason: string;

    if (percentage >= this.value.emergencyThreshold) {
      expansionFactor = 2.0;
      reason = "紧急扩容：使用量接近紧急阈值";
    } else if (percentage >= this.value.expansionThreshold) {
      expansionFactor = 1.5;
      reason = "常规扩容：使用量超过扩容阈值";
    } else {
      expansionFactor = 1.0;
      reason = "无需扩容：使用量在正常范围内";
    }

    const recommendedLimit = Math.ceil(currentLimit * expansionFactor);

    return {
      recommendedLimit,
      expansionFactor,
      reason,
    };
  }

  /**
   * 创建新的限制配置
   *
   * @param limits - 新限制配置
   * @param lastUpdated - 更新时间
   * @returns 新的资源限制
   */
  withLimits(
    limits: Record<ResourceLimitType, number>,
    lastUpdated: Date,
  ): ResourceLimits {
    return new ResourceLimits({
      ...this.value,
      limits,
      lastUpdated,
    });
  }

  /**
   * 创建新的启用状态
   *
   * @param isEnabled - 是否启用
   * @param lastUpdated - 更新时间
   * @returns 新的资源限制
   */
  withEnabled(isEnabled: boolean, lastUpdated: Date): ResourceLimits {
    return new ResourceLimits({
      ...this.value,
      isEnabled,
      lastUpdated,
    });
  }

  /**
   * 创建新的自动扩容配置
   *
   * @param autoExpansion - 是否自动扩容
   * @param expansionThreshold - 扩容阈值
   * @param emergencyThreshold - 紧急阈值
   * @param lastUpdated - 更新时间
   * @returns 新的资源限制
   */
  withAutoExpansion(
    autoExpansion: boolean,
    expansionThreshold: number,
    emergencyThreshold: number,
    lastUpdated: Date,
  ): ResourceLimits {
    return new ResourceLimits({
      ...this.value,
      autoExpansion,
      expansionThreshold,
      emergencyThreshold,
      lastUpdated,
    });
  }

  /**
   * 创建新的元数据
   *
   * @param metadata - 元数据
   * @returns 新的资源限制
   */
  withMetadata(metadata: Record<string, unknown>): ResourceLimits {
    return new ResourceLimits({
      ...this.value,
      metadata: { ...this.value.metadata, ...metadata },
    });
  }

  /**
   * 获取资源限制的字符串表示
   *
   * @returns 字符串表示
   */
  toString(): string {
    return `ResourceLimits(tenantId: ${this.tenantId.value}, resourceType: ${this.resourceType}, hardLimit: ${this.getHardLimit()}, softLimit: ${this.getSoftLimit()})`;
  }

  /**
   * 创建资源限制
   *
   * @param tenantId - 租户ID
   * @param resourceType - 资源类型
   * @param limits - 限制配置
   * @param isEnabled - 是否启用
   * @param autoExpansion - 是否自动扩容
   * @param expansionThreshold - 扩容阈值
   * @param emergencyThreshold - 紧急阈值
   * @param metadata - 元数据
   * @returns 资源限制
   */
  static create(
    tenantId: TenantId,
    resourceType: ResourceType,
    limits: Record<ResourceLimitType, number>,
    isEnabled: boolean = true,
    autoExpansion: boolean = false,
    expansionThreshold: number = 80,
    emergencyThreshold: number = 95,
    metadata: Record<string, unknown> = {},
  ): ResourceLimits {
    return new ResourceLimits({
      tenantId,
      resourceType,
      limits,
      isEnabled,
      autoExpansion,
      expansionThreshold,
      emergencyThreshold,
      lastUpdated: new Date(),
      metadata,
    });
  }

  /**
   * 创建用户资源限制
   *
   * @param tenantId - 租户ID
   * @param hardLimit - 硬限制
   * @param softLimit - 软限制
   * @param warningLimit - 警告限制
   * @param emergencyLimit - 紧急限制
   * @param metadata - 元数据
   * @returns 用户资源限制
   */
  static createUserLimits(
    tenantId: TenantId,
    hardLimit: number,
    softLimit: number,
    warningLimit: number,
    emergencyLimit: number,
    metadata: Record<string, unknown> = {},
  ): ResourceLimits {
    return ResourceLimits.create(
      tenantId,
      ResourceType.USERS,
      {
        HARD_LIMIT: hardLimit,
        SOFT_LIMIT: softLimit,
        WARNING_LIMIT: warningLimit,
        EMERGENCY_LIMIT: emergencyLimit,
      },
      true,
      false,
      80,
      95,
      { ...metadata, category: "user_management" },
    );
  }

  /**
   * 创建存储资源限制
   *
   * @param tenantId - 租户ID
   * @param hardLimit - 硬限制（字节）
   * @param softLimit - 软限制（字节）
   * @param warningLimit - 警告限制（字节）
   * @param emergencyLimit - 紧急限制（字节）
   * @param metadata - 元数据
   * @returns 存储资源限制
   */
  static createStorageLimits(
    tenantId: TenantId,
    hardLimit: number,
    softLimit: number,
    warningLimit: number,
    emergencyLimit: number,
    metadata: Record<string, unknown> = {},
  ): ResourceLimits {
    return ResourceLimits.create(
      tenantId,
      ResourceType.STORAGE,
      {
        HARD_LIMIT: hardLimit,
        SOFT_LIMIT: softLimit,
        WARNING_LIMIT: warningLimit,
        EMERGENCY_LIMIT: emergencyLimit,
      },
      true,
      true,
      80,
      95,
      { ...metadata, category: "storage_management" },
    );
  }
}
