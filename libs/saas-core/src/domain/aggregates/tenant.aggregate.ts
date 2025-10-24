/**
 * 租户聚合根
 *
 * @description 表示租户聚合，包含租户实体和相关业务逻辑
 * @since 1.0.0
 */

import { AggregateRoot } from "@hl8/domain-kernel";
import { Tenant } from "../entities/index.js";
import {
  TenantCode,
  TenantName,
  TenantType,
  TenantStatus,
} from "../value-objects/index.js";

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
  ) {
    super(id);

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
    aggregate.addDomainEvent(
      new TenantCreatedEvent(
        id,
        code,
        name,
        type,
        status,
        description,
        contactEmail,
        contactPhone,
        address,
      ),
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
}
