import {
  BaseEntity,
  AuditInfo,
  IPartialAuditInfo,
  TenantId,
} from "@hl8/domain-kernel";
import { PlatformId } from "../value-objects/platform-id.vo.js";

/**
 * 平台配置接口
 *
 * @description 平台配置信息
 * @since 1.0.0
 */
export interface PlatformConfiguration {
  maxTenants: number;
  defaultTenantLimits: {
    maxUsers: number;
    maxOrganizations: number;
    maxDepartments: number;
  };
  features: {
    multiTenancy: boolean;
    eventSourcing: boolean;
    auditLogging: boolean;
  };
  settings: Record<string, unknown>;
}

/**
 * 平台实体
 *
 * @description 表示SAAS平台提供者，包含全局配置和管理能力
 * @since 1.0.0
 */
export class Platform extends BaseEntity<PlatformId> {
  private _name: string;
  private _description: string;
  private _platformVersion: string;
  private _configuration: PlatformConfiguration;

  /**
   * 创建平台实体
   *
   * @param id - 平台ID
   * @param name - 平台名称
   * @param description - 平台描述
   * @param version - 平台版本
   * @param configuration - 平台配置
   * @param auditInfo - 审计信息
   */
  constructor(
    id: PlatformId,
    name: string,
    description: string,
    version: string,
    configuration: PlatformConfiguration,
    auditInfo?: IPartialAuditInfo,
  ) {
    const platformTenantId = TenantId.create(
      "00000000-0000-0000-0000-000000000000",
    );
    super(
      id,
      platformTenantId,
      undefined, // organizationId
      undefined, // departmentId
      undefined, // userId
      false, // isShared
      undefined, // sharingLevel
      auditInfo,
    );
    this._name = name;
    this._description = description;
    this._platformVersion = version;
    this._configuration = configuration;
  }

  /**
   * 获取平台名称
   *
   * @returns 平台名称
   */
  get name(): string {
    return this._name;
  }

  /**
   * 获取平台描述
   *
   * @returns 平台描述
   */
  get description(): string {
    return this._description;
  }

  /**
   * 获取平台版本
   *
   * @returns 平台版本
   */
  get platformVersion(): string {
    return this._platformVersion;
  }

  /**
   * 获取平台配置
   *
   * @returns 平台配置
   */
  get configuration(): PlatformConfiguration {
    return { ...this._configuration };
  }

  /**
   * 更新平台名称
   *
   * @param name - 新的平台名称
   */
  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error("平台名称不能为空");
    }

    if (name.length > 100) {
      throw new Error("平台名称长度不能超过100个字符");
    }

    this._name = name;
    this.updateTimestamp();
  }

  /**
   * 更新平台描述
   *
   * @param description - 新的平台描述
   */
  updateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new Error("平台描述不能为空");
    }

    if (description.length > 500) {
      throw new Error("平台描述长度不能超过500个字符");
    }

    this._description = description;
    this.updateTimestamp();
  }

  /**
   * 更新平台版本
   *
   * @param version - 新的平台版本
   */
  updateVersion(version: string): void {
    if (!version || version.trim().length === 0) {
      throw new Error("平台版本不能为空");
    }

    // 验证语义版本格式
    const versionRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
    if (!versionRegex.test(version)) {
      throw new Error("平台版本必须遵循语义版本控制格式");
    }

    this._platformVersion = version;
    this.updateTimestamp();
  }

  /**
   * 更新平台配置
   *
   * @param configuration - 新的平台配置
   */
  updateConfiguration(configuration: PlatformConfiguration): void {
    if (!configuration) {
      throw new Error("平台配置不能为空");
    }

    // 验证配置的完整性
    if (configuration.maxTenants <= 0) {
      throw new Error("最大租户数量必须大于0");
    }

    if (configuration.defaultTenantLimits.maxUsers <= 0) {
      throw new Error("默认最大用户数量必须大于0");
    }

    if (configuration.defaultTenantLimits.maxOrganizations <= 0) {
      throw new Error("默认最大组织数量必须大于0");
    }

    if (configuration.defaultTenantLimits.maxDepartments <= 0) {
      throw new Error("默认最大部门数量必须大于0");
    }

    this._configuration = { ...configuration };
    this.updateTimestamp();
  }

  /**
   * 更新平台配置设置
   *
   * @param settings - 新的设置
   */
  updateSettings(settings: Record<string, unknown>): void {
    if (!settings) {
      throw new Error("设置不能为空");
    }

    this._configuration.settings = { ...settings };
    this.updateTimestamp();
  }

  /**
   * 检查是否支持多租户
   *
   * @returns 是否支持多租户
   */
  supportsMultiTenancy(): boolean {
    return this._configuration.features.multiTenancy;
  }

  /**
   * 检查是否支持事件溯源
   *
   * @returns 是否支持事件溯源
   */
  supportsEventSourcing(): boolean {
    return this._configuration.features.eventSourcing;
  }

  /**
   * 检查是否支持审计日志
   *
   * @returns 是否支持审计日志
   */
  supportsAuditLogging(): boolean {
    return this._configuration.features.auditLogging;
  }

  /**
   * 获取默认租户限制
   *
   * @returns 默认租户限制
   */
  getDefaultTenantLimits(): {
    maxUsers: number;
    maxOrganizations: number;
    maxDepartments: number;
  } {
    return { ...this._configuration.defaultTenantLimits };
  }

  /**
   * 获取最大租户数量
   *
   * @returns 最大租户数量
   */
  getMaxTenants(): number {
    return this._configuration.maxTenants;
  }
}
