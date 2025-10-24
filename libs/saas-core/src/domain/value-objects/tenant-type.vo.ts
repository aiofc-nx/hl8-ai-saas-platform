/**
 * 租户类型值对象
 *
 * @description 表示租户的类型，支持多种租户类型和相应的资源配置
 * @since 1.0.0
 */

import { BaseValueObject } from "./base-value-object.js";

/**
 * 租户类型枚举
 */
export enum TenantTypeEnum {
  FREE = "FREE",
  BASIC = "BASIC",
  PROFESSIONAL = "PROFESSIONAL",
  ENTERPRISE = "ENTERPRISE",
  CUSTOM = "CUSTOM",
}

/**
 * 租户类型配置接口
 */
export interface TenantTypeConfig {
  readonly maxUsers: number;
  readonly maxOrganizations: number;
  readonly maxDepartments: number;
  readonly maxStorageGB: number;
  readonly features: readonly string[];
  readonly pricePerMonth: number;
  readonly supportLevel: string;
}

/**
 * 租户类型值对象
 *
 * 租户类型定义了租户的订阅计划和相应的资源配置。
 * 支持5种租户类型：FREE、BASIC、PROFESSIONAL、ENTERPRISE、CUSTOM，
 * 每种类型都有不同的资源配置和功能特性。
 *
 * @example
 * ```typescript
 * const tenantType = new TenantType(TenantTypeEnum.PROFESSIONAL);
 * console.log(tenantType.maxUsers); // 1000
 * console.log(tenantType.features); // ['advanced-analytics', 'api-access', ...]
 * ```
 */
export class TenantType extends BaseValueObject<TenantTypeEnum> {
  private static readonly TYPE_CONFIGS: Record<
    TenantTypeEnum,
    TenantTypeConfig
  > = {
    [TenantTypeEnum.FREE]: {
      maxUsers: 5,
      maxOrganizations: 1,
      maxDepartments: 3,
      maxStorageGB: 1,
      features: ["basic-dashboard", "email-support"],
      pricePerMonth: 0,
      supportLevel: "community",
    },
    [TenantTypeEnum.BASIC]: {
      maxUsers: 50,
      maxOrganizations: 3,
      maxDepartments: 10,
      maxStorageGB: 10,
      features: ["basic-dashboard", "email-support", "basic-analytics"],
      pricePerMonth: 29,
      supportLevel: "email",
    },
    [TenantTypeEnum.PROFESSIONAL]: {
      maxUsers: 1000,
      maxOrganizations: 10,
      maxDepartments: 50,
      maxStorageGB: 100,
      features: [
        "advanced-dashboard",
        "email-support",
        "advanced-analytics",
        "api-access",
        "custom-integrations",
      ],
      pricePerMonth: 99,
      supportLevel: "priority-email",
    },
    [TenantTypeEnum.ENTERPRISE]: {
      maxUsers: 10000,
      maxOrganizations: 100,
      maxDepartments: 500,
      maxStorageGB: 1000,
      features: [
        "enterprise-dashboard",
        "phone-support",
        "enterprise-analytics",
        "api-access",
        "custom-integrations",
        "sso",
        "audit-logs",
      ],
      pricePerMonth: 299,
      supportLevel: "dedicated",
    },
    [TenantTypeEnum.CUSTOM]: {
      maxUsers: -1, // 无限制
      maxOrganizations: -1, // 无限制
      maxDepartments: -1, // 无限制
      maxStorageGB: -1, // 无限制
      features: ["custom-features"],
      pricePerMonth: 0, // 自定义定价
      supportLevel: "custom",
    },
  };

  constructor(value: TenantTypeEnum) {
    super(value);
    this.validateValue(value);
  }

  /**
   * 验证租户类型
   *
   * @param value - 租户类型值
   * @throws {Error} 当类型无效时抛出错误
   */
  private validateValue(value: TenantTypeEnum): void {
    if (!Object.values(TenantTypeEnum).includes(value)) {
      throw new Error(`无效的租户类型: ${value}`);
    }
  }

  /**
   * 获取租户类型配置
   *
   * @returns 租户类型配置
   */
  get config(): TenantTypeConfig {
    return TenantType.TYPE_CONFIGS[this.value];
  }

  /**
   * 获取最大用户数
   *
   * @returns 最大用户数
   */
  get maxUsers(): number {
    return this.config.maxUsers;
  }

  /**
   * 获取最大组织数
   *
   * @returns 最大组织数
   */
  get maxOrganizations(): number {
    return this.config.maxOrganizations;
  }

  /**
   * 获取最大部门数
   *
   * @returns 最大部门数
   */
  get maxDepartments(): number {
    return this.config.maxDepartments;
  }

  /**
   * 获取最大存储容量（GB）
   *
   * @returns 最大存储容量
   */
  get maxStorageGB(): number {
    return this.config.maxStorageGB;
  }

  /**
   * 获取功能特性列表
   *
   * @returns 功能特性列表
   */
  get features(): readonly string[] {
    return this.config.features;
  }

  /**
   * 获取月价格
   *
   * @returns 月价格
   */
  get pricePerMonth(): number {
    return this.config.pricePerMonth;
  }

  /**
   * 获取支持级别
   *
   * @returns 支持级别
   */
  get supportLevel(): string {
    return this.config.supportLevel;
  }

  /**
   * 检查是否支持特定功能
   *
   * @param feature - 功能名称
   * @returns 是否支持该功能
   */
  hasFeature(feature: string): boolean {
    return this.features.includes(feature);
  }

  /**
   * 检查是否有资源限制
   *
   * @param resource - 资源类型
   * @returns 是否有限制
   */
  hasLimit(
    resource: "users" | "organizations" | "departments" | "storage",
  ): boolean {
    const limits = {
      users: this.maxUsers,
      organizations: this.maxOrganizations,
      departments: this.maxDepartments,
      storage: this.maxStorageGB,
    };
    return limits[resource] !== -1;
  }

  /**
   * 获取租户类型的字符串表示
   *
   * @returns 租户类型字符串
   */
  toString(): string {
    return this.value;
  }

  /**
   * 检查是否为有效的租户类型
   *
   * @param value - 要检查的值
   * @returns 是否为有效类型
   */
  static isValid(value: string): boolean {
    return Object.values(TenantTypeEnum).includes(value as TenantTypeEnum);
  }

  /**
   * 获取所有可用的租户类型
   *
   * @returns 所有租户类型列表
   */
  static getAllTypes(): TenantTypeEnum[] {
    return Object.values(TenantTypeEnum);
  }
}
