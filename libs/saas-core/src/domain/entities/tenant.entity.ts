/**
 * 租户实体
 *
 * @description 表示多租户架构中的租户，包含租户的基本信息和状态管理
 * @since 1.0.0
 */

import {
  BaseEntity,
  EntityId,
  TenantId,
  OrganizationId,
  DepartmentId,
  UserId,
  SharingLevel,
} from "@hl8/domain-kernel";
import {
  TenantCode,
  TenantName,
  TenantType,
  TenantTypeEnum,
  TenantStatus,
  TenantStatusEnum,
} from "../value-objects/index.js";

/**
 * 租户实体
 *
 * 租户是多租户架构中的核心实体，代表一个独立的客户组织。
 * 租户包含基本信息、类型、状态等属性，并支持生命周期管理。
 *
 * @example
 * ```typescript
 * const tenant = new Tenant(
 *   new EntityId(),
 *   new TenantCode("acme-corp"),
 *   new TenantName("Acme Corporation"),
 *   new TenantType(TenantTypeEnum.PROFESSIONAL),
 *   new TenantStatus(TenantStatusEnum.ACTIVE)
 * );
 * ```
 */
export class Tenant extends BaseEntity<TenantId> {
  private _code: TenantCode;
  private _name: TenantName;
  private _type: TenantType;
  private _status: TenantStatus;
  private _description?: string;
  private _contactEmail?: string;
  private _contactPhone?: string;
  private _address?: string;
  private _subscriptionStartDate?: Date;
  private _subscriptionEndDate?: Date;
  private _settings: Record<string, unknown>;

  constructor(
    id: TenantId,
    tenantId: TenantId,
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
    settings: Record<string, unknown> = {},
    organizationId?: OrganizationId,
    departmentId?: DepartmentId,
    isShared: boolean = false,
    sharingLevel?: SharingLevel,
    auditInfo?: unknown,
  ) {
    super(
      id,
      tenantId,
      organizationId,
      departmentId,
      undefined,
      isShared,
      sharingLevel,
      auditInfo,
    );

    this._code = code;
    this._name = name;
    this._type = type;
    this._status = status;
    this._description = description;
    this._contactEmail = contactEmail;
    this._contactPhone = contactPhone;
    this._address = address;
    this._subscriptionStartDate = subscriptionStartDate;
    this._subscriptionEndDate = subscriptionEndDate;
    this._settings = settings;
  }

  /**
   * 获取租户代码
   *
   * @returns 租户代码
   */
  get code(): TenantCode {
    return this._code;
  }

  /**
   * 获取租户名称
   *
   * @returns 租户名称
   */
  get name(): TenantName {
    return this._name;
  }

  /**
   * 获取租户类型
   *
   * @returns 租户类型
   */
  get type(): TenantType {
    return this._type;
  }

  /**
   * 获取租户状态
   *
   * @returns 租户状态
   */
  get status(): TenantStatus {
    return this._status;
  }

  /**
   * 获取租户描述
   *
   * @returns 租户描述
   */
  get description(): string | undefined {
    return this._description;
  }

  /**
   * 获取联系邮箱
   *
   * @returns 联系邮箱
   */
  get contactEmail(): string | undefined {
    return this._contactEmail;
  }

  /**
   * 获取联系电话
   *
   * @returns 联系电话
   */
  get contactPhone(): string | undefined {
    return this._contactPhone;
  }

  /**
   * 获取地址
   *
   * @returns 地址
   */
  get address(): string | undefined {
    return this._address;
  }

  /**
   * 获取订阅开始日期
   *
   * @returns 订阅开始日期
   */
  get subscriptionStartDate(): Date | undefined {
    return this._subscriptionStartDate;
  }

  /**
   * 获取订阅结束日期
   *
   * @returns 订阅结束日期
   */
  get subscriptionEndDate(): Date | undefined {
    return this._subscriptionEndDate;
  }

  /**
   * 获取租户设置
   *
   * @returns 租户设置
   */
  get settings(): Record<string, unknown> {
    return { ...this._settings };
  }

  /**
   * 更新租户名称
   *
   * @param name - 新的租户名称
   */
  updateName(name: TenantName): void {
    this._name = name;
    this.updateTimestamp();
  }

  /**
   * 更新租户描述
   *
   * @param description - 新的租户描述
   */
  updateDescription(description: string): void {
    this._description = description;
    this.updateTimestamp();
  }

  /**
   * 更新联系信息
   *
   * @param email - 联系邮箱
   * @param phone - 联系电话
   * @param address - 地址
   */
  updateContactInfo(email?: string, phone?: string, address?: string): void {
    this._contactEmail = email;
    this._contactPhone = phone;
    this._address = address;
    this.updateTimestamp();
  }

  /**
   * 升级租户类型
   *
   * @param newType - 新的租户类型
   */
  upgradeType(newType: TenantType): void {
    if (
      newType.value === TenantTypeEnum.CUSTOM ||
      this._type.value === TenantTypeEnum.CUSTOM
    ) {
      throw new Error("自定义租户类型不支持升级操作");
    }
    const typeLevels = {
      [TenantTypeEnum.FREE]: 1,
      [TenantTypeEnum.BASIC]: 2,
      [TenantTypeEnum.PROFESSIONAL]: 3,
      [TenantTypeEnum.ENTERPRISE]: 4,
      [TenantTypeEnum.CUSTOM]: 5,
    };
    if (typeLevels[newType.value] <= typeLevels[this._type.value]) {
      throw new Error("只能升级到更高级别的租户类型");
    }
    this._type = newType;
    this.updateTimestamp();
  }

  /**
   * 降级租户类型
   *
   * @param newType - 新的租户类型
   */
  downgradeType(newType: TenantType): void {
    if (
      newType.value === TenantTypeEnum.CUSTOM ||
      this._type.value === TenantTypeEnum.CUSTOM
    ) {
      throw new Error("自定义租户类型不支持降级操作");
    }
    const typeLevels = {
      [TenantTypeEnum.FREE]: 1,
      [TenantTypeEnum.BASIC]: 2,
      [TenantTypeEnum.PROFESSIONAL]: 3,
      [TenantTypeEnum.ENTERPRISE]: 4,
      [TenantTypeEnum.CUSTOM]: 5,
    };
    if (typeLevels[newType.value] >= typeLevels[this._type.value]) {
      throw new Error("只能降级到更低级别的租户类型");
    }
    this._type = newType;
    this.updateTimestamp();
  }

  /**
   * 更新租户状态
   *
   * @param newStatus - 新的租户状态
   */
  updateStatus(newStatus: TenantStatus): void {
    if (!this._status.canTransitionTo(newStatus.value)) {
      throw new Error(
        `无法从 ${this._status.toString()} 转换到 ${newStatus.toString()}`,
      );
    }
    this._status = newStatus;
    this.updateTimestamp();
  }

  /**
   * 更新订阅信息
   *
   * @param startDate - 订阅开始日期
   * @param endDate - 订阅结束日期
   */
  updateSubscription(startDate: Date, endDate: Date): void {
    if (startDate >= endDate) {
      throw new Error("订阅开始日期必须早于结束日期");
    }
    this._subscriptionStartDate = startDate;
    this._subscriptionEndDate = endDate;
    this.updateTimestamp();
  }

  /**
   * 更新租户设置
   *
   * @param settings - 新的设置
   */
  updateSettings(settings: Record<string, unknown>): void {
    this._settings = { ...this._settings, ...settings };
    this.updateTimestamp();
  }

  /**
   * 获取特定设置值
   *
   * @param key - 设置键
   * @returns 设置值
   */
  getSetting(key: string): unknown {
    return this._settings[key];
  }

  /**
   * 设置特定设置值
   *
   * @param key - 设置键
   * @param value - 设置值
   */
  setSetting(key: string, value: unknown): void {
    this._settings[key] = value;
    this.updateTimestamp();
  }

  /**
   * 检查租户是否活跃
   *
   * @returns 是否活跃
   */
  isActive(): boolean {
    return this._status.isActive();
  }

  /**
   * 检查租户是否已过期
   *
   * @returns 是否已过期
   */
  isExpired(): boolean {
    if (!this._subscriptionEndDate) {
      return false;
    }
    return new Date() > this._subscriptionEndDate;
  }

  /**
   * 检查租户是否支持特定功能
   *
   * @param feature - 功能名称
   * @returns 是否支持
   */
  hasFeature(feature: string): boolean {
    return this._type.hasFeature(feature);
  }

  /**
   * 检查租户是否有资源限制
   *
   * @param resource - 资源类型
   * @returns 是否有限制
   */
  hasResourceLimit(
    resource: "users" | "organizations" | "departments" | "storage",
  ): boolean {
    return this._type.hasLimit(resource);
  }

  /**
   * 获取租户的最大资源限制
   *
   * @param resource - 资源类型
   * @returns 最大资源限制
   */
  getResourceLimit(
    resource: "users" | "organizations" | "departments" | "storage",
  ): number {
    const limits = {
      users: this._type.maxUsers,
      organizations: this._type.maxOrganizations,
      departments: this._type.maxDepartments,
      storage: this._type.maxStorageGB,
    };
    return limits[resource];
  }

  /**
   * 获取租户的字符串表示
   *
   * @returns 租户产品串表示
   */
  toString(): string {
    return `Tenant(${this._code.toString()}, ${this._name.toString()}, ${this._type.toString()}, ${this._status.toString()})`;
  }
}
