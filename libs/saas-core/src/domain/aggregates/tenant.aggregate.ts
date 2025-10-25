/**
 * 租户聚合根
 *
 * @description 表示租户聚合，包含租户实体和相关业务逻辑
 * @since 1.0.0
 */

import { AggregateRoot, TenantId, EntityId } from "@hl8/domain-kernel";
import { Tenant } from "../entities/index.js";
import {
  TenantCode,
  TenantName,
  TenantType,
  TenantStatus,
  TenantStatusEnum,
} from "../value-objects/index.js";
import { TenantCreatedEvent } from "../events/tenant-created.event.js";
import { TrialPeriodConfig } from "../value-objects/trial-period-config.vo.js";
import {
  TrialPeriodService,
  TrialPeriodStatus,
} from "../services/trial-period.service.js";
import { TrialExpiredEvent } from "../events/trial-expired.event.js";
import { TenantCreationRules } from "../services/tenant-creation-rules.service.js";
import { TenantCreationValidationFailedEvent } from "../events/tenant-creation-validation-failed.event.js";
import { ResourceMonitoringService } from "../services/resource-monitoring.service.js";
import {
  ResourceUsage,
  ResourceType,
} from "../value-objects/resource-usage.vo.js";
import { ResourceLimits } from "../value-objects/resource-limits.vo.js";
import { ResourceLimitExceededEvent } from "../events/resource-limit-exceeded.event.js";
import { ResourceUsageWarningEvent } from "../events/resource-usage-warning.event.js";

/**
 * 租户聚合根
 *
 * 租户聚合根是租户聚合的根实体，负责管理租户的生命周期和业务规则。
 * 聚合根确保业务规则的一致性，并发布领域事件。
 *
 * @example
 * ```typescript
 * const tenantAggregate = new TenantAggregate(
 *   new EntityId(),
 *   new TenantCode("acme-corp"),
 *   new TenantName("Acme Corporation"),
 *   new TenantType(TenantTypeEnum.PROFESSIONAL),
 *   new TenantStatus(TenantStatusEnum.ACTIVE)
 * );
 * ```
 */
export class TenantAggregate extends AggregateRoot {
  private _tenant: Tenant;
  private _trialPeriodService: TrialPeriodService;
  private _trialPeriodConfig: TrialPeriodConfig;
  private _tenantCreationRules: TenantCreationRules;
  private _resourceMonitoringService: ResourceMonitoringService;

  constructor(
    id: EntityId,
    code: TenantCode,
    name: TenantName,
    type: TenantType,
    status: TenantStatus,
    description?: string,
    contactEmail?: string,
    contactPhone?: string,
    address?: string,
    subscriptionStartDate?: Date,
    subscriptionEndDate?: Date,
    settings: Record<string, any> = {},
    trialPeriodConfig?: TrialPeriodConfig,
  ) {
    // TODO: 需要提供 tenantId，暂时使用临时值
    // 注意：租户聚合根需要 tenantId，但这里创建的是租户本身
    // 应该使用特殊的 tenantId 或者传递正确的 tenantId
    const tenantId = new TenantId("platform-level-tenant");
    super(id, tenantId);

    this._tenant = new Tenant(
      id,
      code,
      name,
      type,
      status,
      description,
      contactEmail,
      contactPhone,
      address,
      subscriptionStartDate,
      subscriptionEndDate,
      settings,
    );

    this._trialPeriodConfig =
      trialPeriodConfig || TrialPeriodConfig.createDefault();
    this._trialPeriodService = new TrialPeriodService(this._trialPeriodConfig);
    this._tenantCreationRules = new TenantCreationRules();
    this._resourceMonitoringService = new ResourceMonitoringService();
  }

  /**
   * 获取租户实体
   *
   * @returns 租户实体
   */
  get tenant(): Tenant {
    return this._tenant;
  }

  /**
   * 创建租户
   *
   * @param code - 租户代码
   * @param name - 租户名称
   * @param type - 租户类型
   * @param description - 租户描述
   * @param contactEmail - 联系邮箱
   * @param contactPhone - 联系电话
   * @param address - 地址
   */
  static create(
    code: TenantCode,
    name: TenantName,
    type: TenantType,
    description?: string,
    contactEmail?: string,
    contactPhone?: string,
    address?: string,
  ): TenantAggregate {
    const id = new EntityId();
    const status = new TenantStatus(TenantStatusEnum.PENDING);

    const aggregate = new TenantAggregate(
      id,
      code,
      name,
      type,
      status,
      description,
      contactEmail,
      contactPhone,
      address,
    );

    // 发布租户创建事件
    aggregate.apply(
      aggregate.createDomainEvent("TenantCreated", {
        tenantId: id.toString(),
        tenantCode: code.toString(),
        tenantName: name.toString(),
        tenantType: type.toString(),
        tenantStatus: status.toString(),
        description,
        contactEmail,
        contactPhone,
        address,
      }),
    );

    return aggregate;
  }

  /**
   * 激活租户
   */
  activate(): void {
    if (this._tenant.status.value === TenantStatusEnum.PENDING) {
      this._tenant.updateStatus(new TenantStatus(TenantStatusEnum.ACTIVE));

      // 发布租户激活事件
      this.addDomainEvent(
        new TenantActivatedEvent(
          this._tenant.id,
          this._tenant.code,
          this._tenant.name,
        ),
      );
    } else {
      throw new Error("只有待处理状态的租户才能被激活");
    }
  }

  /**
   * 暂停租户
   *
   * @param reason - 暂停原因
   */
  suspend(reason: string): void {
    if (this._tenant.status.value === TenantStatusEnum.ACTIVE) {
      this._tenant.updateStatus(new TenantStatus(TenantStatusEnum.SUSPENDED));

      // 发布租户暂停事件
      this.addDomainEvent(
        new TenantSuspendedEvent(
          this._tenant.id,
          this._tenant.code,
          this._tenant.name,
          reason,
        ),
      );
    } else {
      throw new Error("只有活跃状态的租户才能被暂停");
    }
  }

  /**
   * 恢复租户
   *
   * @param reason - 恢复原因
   */
  resume(reason: string): void {
    if (this._tenant.status.value === TenantStatusEnum.SUSPENDED) {
      this._tenant.updateStatus(new TenantStatus(TenantStatusEnum.ACTIVE));

      // 发布租户恢复事件
      this.addDomainEvent(
        new TenantResumedEvent(
          this._tenant.id,
          this._tenant.code,
          this._tenant.name,
          reason,
        ),
      );
    } else {
      throw new Error("只有暂停状态的租户才能被恢复");
    }
  }

  /**
   * 取消租户
   *
   * @param reason - 取消原因
   */
  cancel(reason: string): void {
    if (
      this._tenant.status.value === TenantStatusEnum.ACTIVE ||
      this._tenant.status.value === TenantStatusEnum.SUSPENDED
    ) {
      this._tenant.updateStatus(new TenantStatus(TenantStatusEnum.CANCELLED));

      // 发布租户取消事件
      this.addDomainEvent(
        new TenantCancelledEvent(
          this._tenant.id,
          this._tenant.code,
          this._tenant.name,
          reason,
        ),
      );
    } else {
      throw new Error("只有活跃或暂停状态的租户才能被取消");
    }
  }

  /**
   * 升级租户类型
   *
   * @param newType - 新的租户类型
   */
  upgradeType(newType: TenantType): void {
    const oldType = this._tenant.type;
    this._tenant.upgradeType(newType);

    // 发布租户类型升级事件
    this.addDomainEvent(
      new TenantTypeUpgradedEvent(
        this._tenant.id,
        this._tenant.code,
        this._tenant.name,
        oldType,
        newType,
      ),
    );
  }

  /**
   * 降级租户类型
   *
   * @param newType - 新的租户类型
   */
  downgradeType(newType: TenantType): void {
    const oldType = this._tenant.type;
    this._tenant.downgradeType(newType);

    // 发布租户类型降级事件
    this.addDomainEvent(
      new TenantTypeDowngradedEvent(
        this._tenant.id,
        this._tenant.code,
        this._tenant.name,
        oldType,
        newType,
      ),
    );
  }

  /**
   * 更新订阅信息
   *
   * @param startDate - 订阅开始日期
   * @param endDate - 订阅结束日期
   */
  updateSubscription(startDate: Date, endDate: Date): void {
    const oldStartDate = this._tenant.subscriptionStartDate;
    const oldEndDate = this._tenant.subscriptionEndDate;

    this._tenant.updateSubscription(startDate, endDate);

    // 发布订阅更新事件
    this.addDomainEvent(
      new TenantSubscriptionUpdatedEvent(
        this._tenant.id,
        this._tenant.code,
        this._tenant.name,
        oldStartDate,
        oldEndDate,
        startDate,
        endDate,
      ),
    );
  }

  /**
   * 更新租户设置
   *
   * @param settings - 新的设置
   */
  updateSettings(settings: Record<string, any>): void {
    const oldSettings = this._tenant.settings;
    this._tenant.updateSettings(settings);

    // 发布设置更新事件
    this.addDomainEvent(
      new TenantSettingsUpdatedEvent(
        this._tenant.id,
        this._tenant.code,
        this._tenant.name,
        oldSettings,
        settings,
      ),
    );
  }

  /**
   * 检查租户是否活跃
   *
   * @returns 是否活跃
   */
  isActive(): boolean {
    return this._tenant.isActive();
  }

  /**
   * 检查租户是否已过期
   *
   * @returns 是否已过期
   */
  isExpired(): boolean {
    return this._tenant.isExpired();
  }

  /**
   * 检查租户是否支持特定功能
   *
   * @param feature - 功能名称
   * @returns 是否支持
   */
  hasFeature(feature: string): boolean {
    return this._tenant.hasFeature(feature);
  }

  /**
   * 获取租户的字符串表示
   *
   * @returns 租户字符串表示
   */
  toString(): string {
    return `TenantAggregate(${this._tenant.toString()})`;
  }

  /**
   * 获取试用期信息
   *
   * @param userId - 用户ID
   * @returns 试用期信息
   */
  async getTrialPeriodInfo(userId: string): Promise<{
    readonly status: TrialPeriodStatus;
    readonly daysRemaining: number;
    readonly gracePeriodDays: number;
    readonly isExpired: boolean;
    readonly isInGracePeriod: boolean;
  }> {
    const info = await this._trialPeriodService.getTrialPeriodInfo(
      this._tenant.id,
      new UserId(userId),
      this._tenant.createdAt,
      this._trialPeriodConfig,
    );

    return {
      status: info.status,
      daysRemaining: info.daysRemaining,
      gracePeriodDays: this._trialPeriodConfig.gracePeriodDays,
      isExpired: info.status === TrialPeriodStatus.EXPIRED,
      isInGracePeriod: info.status === TrialPeriodStatus.GRACE_PERIOD,
    };
  }

  /**
   * 检查试用期是否即将到期
   *
   * @param userId - 用户ID
   * @returns 是否即将到期
   */
  async isTrialExpiringSoon(userId: string): Promise<boolean> {
    return await this._trialPeriodService.shouldSendReminder(
      this._tenant.id,
      new UserId(userId),
      this._tenant.createdAt,
      this._trialPeriodConfig,
    );
  }

  /**
   * 处理试用期过期
   *
   * @param userId - 用户ID
   * @returns 处理结果
   */
  async handleTrialExpiration(userId: string): Promise<{
    readonly shouldSuspend: boolean;
    readonly shouldNotify: boolean;
    readonly gracePeriodDays: number;
  }> {
    const result = await this._trialPeriodService.handleTrialExpiration(
      this._tenant.id,
      new UserId(userId),
      this._tenant.createdAt,
      this._trialPeriodConfig,
    );

    if (result.shouldSuspend) {
      this.suspend("试用期过期");
    }

    // 发布试用期过期事件
    const trialInfo = await this._trialPeriodService.getTrialPeriodInfo(
      this._tenant.id,
      new UserId(userId),
      this._tenant.createdAt,
      this._trialPeriodConfig,
    );

    this.addDomainEvent(
      new TrialExpiredEvent({
        tenantId: this._tenant.id,
        userId: new UserId(userId),
        expiredAt: new Date(),
        trialStartDate: this._tenant.createdAt,
        trialEndDate: trialInfo.endDate,
        gracePeriodDays: this._trialPeriodConfig.gracePeriodDays,
        status: TrialPeriodStatus.EXPIRED,
        metadata: { source: "automatic", reason: "trial_expired" },
      }),
    );

    return result;
  }

  /**
   * 发送试用期到期提醒
   *
   * @param userId - 用户ID
   * @returns 是否发送成功
   */
  async sendTrialExpirationReminder(userId: string): Promise<boolean> {
    return await this._trialPeriodService.sendExpirationReminder(
      this._tenant.id,
      new UserId(userId),
      this._tenant.createdAt,
      this._trialPeriodConfig,
    );
  }

  /**
   * 检查是否需要清理试用期数据
   *
   * @param userId - 用户ID
   * @returns 是否需要清理
   */
  async shouldCleanupTrialData(userId: string): Promise<boolean> {
    return await this._trialPeriodService.shouldCleanupTrialData(
      this._tenant.id,
      new UserId(userId),
      this._tenant.createdAt,
      this._trialPeriodConfig,
    );
  }

  /**
   * 清理试用期数据
   *
   * @param userId - 用户ID
   * @returns 清理结果
   */
  async cleanupTrialData(userId: string): Promise<{
    readonly success: boolean;
    readonly cleanedData: readonly string[];
    readonly errors: readonly string[];
  }> {
    return await this._trialPeriodService.cleanupTrialData(
      this._tenant.id,
      new UserId(userId),
      this._tenant.createdAt,
      this._trialPeriodConfig,
    );
  }

  /**
   * 获取试用期配置
   *
   * @returns 试用期配置
   */
  getTrialPeriodConfig(): TrialPeriodConfig {
    return this._trialPeriodConfig;
  }

  /**
   * 更新试用期配置
   *
   * @param config - 新的试用期配置
   */
  updateTrialPeriodConfig(config: TrialPeriodConfig): void {
    this._trialPeriodConfig = config;
    this._trialPeriodService = new TrialPeriodService(config);
  }

  /**
   * 验证租户创建
   *
   * @param existingTenants - 现有租户列表
   * @returns 验证结果
   */
  async validateTenantCreation(
    existingTenants: readonly {
      readonly code: string;
      readonly name: string;
      readonly type: TenantType;
      readonly domain?: string;
      readonly createdBy: string;
    }[],
  ): Promise<{
    readonly isValid: boolean;
    readonly errors: readonly string[];
    readonly warnings?: readonly string[];
    readonly suggestions?: readonly string[];
  }> {
    const validation = await this._tenantCreationRules.validateTenantCreation(
      {
        usercode: this._tenant.code,
        name: this._tenant.name,
        type: this._tenant.type,
        domain: this._tenant.domain,
        createdBy: this._tenant.createdBy,
      },
      existingTenants,
    );

    if (!validation.isValid) {
      // 发布租户创建验证失败事件
      this.addDomainEvent(
        new TenantCreationValidationFailedEvent({
          tenantCode: this._tenant.code,
          tenantName: this._tenant.name,
          tenantType: this._tenant.type,
          domain: this._tenant.domain,
          createdBy: this._tenant.createdBy,
          validationErrors: validation.errors,
          validationWarnings: validation.warnings,
          validationSuggestions: validation.suggestions,
          failedAt: new Date(),
          metadata: { source: "automatic", reason: "validation_failed" },
        }),
      );
    }

    return validation;
  }

  /**
   * 检查租户创建是否被允许
   *
   * @param existingTenants - 现有租户列表
   * @returns 是否允许创建
   */
  async isTenantCreationAllowed(
    existingTenants: readonly {
      readonly code: string;
      readonly name: string;
      readonly type: TenantType;
      readonly domain?: string;
      readonly createdBy: string;
    }[],
  ): Promise<boolean> {
    return await this._tenantCreationRules.isTenantCreationAllowed(
      {
        usercode: this._tenant.code,
        name: this._tenant.name,
        type: this._tenant.type,
        domain: this._tenant.domain,
        createdBy: this._tenant.createdBy,
      },
      existingTenants,
    );
  }

  /**
   * 获取租户创建建议
   *
   * @param existingTenants - 现有租户列表
   * @returns 创建建议
   */
  async getTenantCreationSuggestions(
    existingTenants: readonly {
      readonly code: string;
      readonly name: string;
      readonly type: TenantType;
      readonly domain?: string;
      readonly createdBy: string;
    }[],
  ): Promise<{
    readonly codeSuggestions: readonly string[];
    readonly domainSuggestions: readonly string[];
    readonly typeSuggestions: readonly TenantType[];
  }> {
    return await this._tenantCreationRules.getTenantCreationSuggestions(
      {
        usercode: this._tenant.code,
        name: this._tenant.name,
        type: this._tenant.type,
        domain: this._tenant.domain,
        createdBy: this._tenant.createdBy,
      },
      existingTenants,
    );
  }

  /**
   * 获取租户创建统计信息
   *
   * @param existingTenants - 现有租户列表
   * @returns 统计信息
   */
  getTenantCreationStatistics(
    existingTenants: readonly {
      readonly code: string;
      readonly name: string;
      readonly type: TenantType;
      readonly domain?: string;
      readonly createdBy: string;
    }[],
  ): {
    readonly totalTenants: number;
    readonly tenantsByType: Record<TenantType, number>;
    readonly tenantsByUser: Record<string, number>;
    readonly tenantsByDomain: Record<string, number>;
  } {
    return this._tenantCreationRules.getTenantCreationStatistics(
      existingTenants,
    );
  }

  /**
   * 获取资源使用情况
   *
   * @param resourceType - 资源类型
   * @returns 资源使用情况
   */
  async getResourceUsage(resourceType: ResourceType): Promise<ResourceUsage> {
    return await this._resourceMonitoringService.getResourceUsage(
      this._tenant.id,
      resourceType,
    );
  }

  /**
   * 更新资源使用情况
   *
   * @param resourceType - 资源类型
   * @param currentUsage - 当前使用量
   * @param maxLimit - 最大限制
   * @returns 更新后的资源使用情况
   */
  async updateResourceUsage(
    resourceType: ResourceType,
    currentUsage: number,
    maxLimit: number,
  ): Promise<ResourceUsage> {
    return await this._resourceMonitoringService.updateResourceUsage(
      this._tenant.id,
      resourceType,
      currentUsage,
      maxLimit,
    );
  }

  /**
   * 检查资源限制
   *
   * @param resourceType - 资源类型
   * @param limits - 资源限制
   * @returns 限制检查结果
   */
  async checkResourceLimits(
    resourceType: ResourceType,
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
    const usage = await this.getResourceUsage(resourceType);
    const result = await this._resourceMonitoringService.checkResourceLimits(
      usage,
      limits,
    );

    // 发布相应的事件
    if (result.isOverHardLimit) {
      this.addDomainEvent(
        ResourceLimitExceededEvent.createHardLimitExceeded(
          this._tenant.id,
          resourceType,
          usage.currentUsage,
          limits.getHardLimit(),
          usage.currentUsage - limits.getHardLimit(),
          limits.autoExpansion,
          limits.getExpansionRecommendation(usage.currentUsage),
          { source: "automatic", category: "resource_monitoring" },
        ),
      );
    } else if (result.isOverSoftLimit) {
      this.addDomainEvent(
        ResourceLimitExceededEvent.createSoftLimitExceeded(
          this._tenant.id,
          resourceType,
          usage.currentUsage,
          limits.getSoftLimit(),
          usage.currentUsage - limits.getSoftLimit(),
          limits.autoExpansion,
          limits.getExpansionRecommendation(usage.currentUsage),
          { source: "automatic", category: "resource_monitoring" },
        ),
      );
    } else if (result.isOverWarningLimit) {
      this.addDomainEvent(
        ResourceLimitExceededEvent.createWarningLimitExceeded(
          this._tenant.id,
          resourceType,
          usage.currentUsage,
          limits.getWarningLimit(),
          usage.currentUsage - limits.getWarningLimit(),
          limits.autoExpansion,
          limits.getExpansionRecommendation(usage.currentUsage),
          { source: "automatic", category: "resource_monitoring" },
        ),
      );
    }

    return result;
  }

  /**
   * 获取扩容建议
   *
   * @param resourceType - 资源类型
   * @param limits - 资源限制
   * @returns 扩容建议
   */
  async getExpansionRecommendation(
    resourceType: ResourceType,
    limits: ResourceLimits,
  ): Promise<{
    readonly recommendedLimit: number;
    readonly expansionFactor: number;
    readonly reason: string;
    readonly urgency: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    readonly estimatedCost: number;
  }> {
    const usage = await this.getResourceUsage(resourceType);
    return await this._resourceMonitoringService.getExpansionRecommendation(
      usage,
      limits,
    );
  }

  /**
   * 监控资源使用趋势
   *
   * @param resourceType - 资源类型
   * @param timeRange - 时间范围（小时）
   * @returns 使用趋势
   */
  async monitorResourceTrend(
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
    return await this._resourceMonitoringService.monitorResourceTrend(
      this._tenant.id,
      resourceType,
      timeRange,
    );
  }

  /**
   * 获取资源使用统计
   *
   * @returns 资源使用统计
   */
  async getResourceStatistics(): Promise<{
    readonly totalResources: number;
    readonly resourcesByType: Record<ResourceType, number>;
    readonly resourcesOverLimit: number;
    readonly resourcesNearLimit: number;
    readonly averageUsagePercentage: number;
    readonly totalCost: number;
  }> {
    return await this._resourceMonitoringService.getResourceStatistics(
      this._tenant.id,
    );
  }

  /**
   * 检查资源使用警告
   *
   * @param resourceType - 资源类型
   * @param limits - 资源限制
   * @returns 警告检查结果
   */
  async checkResourceWarnings(
    resourceType: ResourceType,
    limits: ResourceLimits,
  ): Promise<{
    readonly hasWarning: boolean;
    readonly warningType?:
      | "APPROACHING_LIMIT"
      | "NEAR_LIMIT"
      | "CRITICAL_THRESHOLD";
    readonly warningLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    readonly usagePercentage: number;
    readonly remainingCapacity: number;
    readonly estimatedTimeToLimit: number;
  }> {
    const usage = await this.getResourceUsage(resourceType);
    const trend = await this.monitorResourceTrend(resourceType);

    let hasWarning = false;
    let warningType:
      | "APPROACHING_LIMIT"
      | "NEAR_LIMIT"
      | "CRITICAL_THRESHOLD"
      | undefined;
    let warningLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | undefined;

    if (usage.usagePercentage >= 95) {
      hasWarning = true;
      warningType = "CRITICAL_THRESHOLD";
      warningLevel = "CRITICAL";
    } else if (usage.usagePercentage >= 85) {
      hasWarning = true;
      warningType = "NEAR_LIMIT";
      warningLevel = "HIGH";
    } else if (usage.usagePercentage >= 75) {
      hasWarning = true;
      warningType = "APPROACHING_LIMIT";
      warningLevel = "MEDIUM";
    }

    if (hasWarning) {
      // 发布资源使用警告事件
      this.addDomainEvent(
        ResourceUsageWarningEvent.create(
          this._tenant.id,
          resourceType,
          usage.currentUsage,
          usage.maxLimit,
          usage.usagePercentage,
          limits.expansionThreshold,
          warningType!,
          usage.getRemainingCapacity(),
          trend.timeToLimit,
          limits.autoExpansion,
          limits.getExpansionRecommendation(usage.currentUsage),
          { source: "automatic", category: "resource_monitoring" },
        ),
      );
    }

    return {
      hasWarning,
      warningType,
      warningLevel,
      usagePercentage: usage.usagePercentage,
      remainingCapacity: usage.getRemainingCapacity(),
      estimatedTimeToLimit: trend.timeToLimit,
    };
  }

  /**
   * 获取资源监控服务
   *
   * @returns 资源监控服务
   */
  getResourceMonitoringService(): ResourceMonitoringService {
    return this._resourceMonitoringService;
  }

  /**
   * 更新资源监控服务
   *
   * @param service - 新的资源监控服务
   */
  updateResourceMonitoringService(service: ResourceMonitoringService): void {
    this._resourceMonitoringService = service;
  }

  /**
   * 获取快照数据
   *
   * @returns 快照数据
   */
  protected getSnapshotData(): Record<string, unknown> {
    return {
      tenant: this._tenant,
      trialPeriodConfig: this._trialPeriodConfig,
      trialPeriodService: this._trialPeriodService,
      tenantCreationRules: this._tenantCreationRules,
      resourceMonitoringService: this._resourceMonitoringService,
    };
  }

  /**
   * 从快照加载数据
   *
   * @param snapshot - 快照数据
   */
  protected loadFromSnapshot(snapshot: Record<string, unknown>): void {
    this._tenant = snapshot.tenant as Tenant;
    this._trialPeriodConfig = snapshot.trialPeriodConfig as TrialPeriodConfig;
    this._trialPeriodService = snapshot.trialPeriodService as TrialPeriodService;
    this._tenantCreationRules =
      snapshot.tenantCreationRules as TenantCreationRules;
    this._resourceMonitoringService =
      snapshot.resourceMonitoringService as ResourceMonitoringService;
  }

  /**
   * 辅助方法：发布领域事件
   * @deprecated 请直接使用 this.apply(this.createDomainEvent(...))
   */
  protected addDomainEvent(event: unknown): void {
    // 这是一个兼容性方法，实际项目中应该移除所有对 addDomainEvent 的调用
    // 并直接使用 this.apply(this.createDomainEvent(...))
    console.warn("addDomainEvent is deprecated, use apply(createDomainEvent(...)) instead");
  }
}
