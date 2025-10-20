/**
 * 租户相关枚举定义
 *
 * @description 定义租户相关的枚举类型和工具类
 * @since 1.0.0
 */

/**
 * 租户类型枚举
 */
export enum TenantType {
  /** 企业租户 */
  ENTERPRISE = "ENTERPRISE",
  /** 社群租户 */
  COMMUNITY = "COMMUNITY",
  /** 团队租户 */
  TEAM = "TEAM",
  /** 个人租户 */
  PERSONAL = "PERSONAL",
}

/**
 * 租户类型工具类
 */
export class TenantTypeUtils {
  /**
   * 获取所有租户类型
   */
  static getAllTypes(): TenantType[] {
    return Object.values(TenantType);
  }

  /**
   * 获取租户类型显示名称
   */
  static getDisplayName(type: TenantType): string {
    const displayNames = {
      [TenantType.ENTERPRISE]: "企业租户",
      [TenantType.COMMUNITY]: "社群租户",
      [TenantType.TEAM]: "团队租户",
      [TenantType.PERSONAL]: "个人租户",
    };
    return displayNames[type] || "未知类型";
  }

  /**
   * 获取租户类型描述
   */
  static getDescription(type: TenantType): string {
    const descriptions = {
      [TenantType.ENTERPRISE]: "企业级租户，支持多用户、多组织管理",
      [TenantType.COMMUNITY]: "社群租户，支持社区协作和共享",
      [TenantType.TEAM]: "团队租户，适合小团队协作",
      [TenantType.PERSONAL]: "个人租户，个人使用",
    };
    return descriptions[type] || "未知类型";
  }

  /**
   * 检查是否为企业租户
   */
  static isEnterprise(type: TenantType): boolean {
    return type === TenantType.ENTERPRISE;
  }

  /**
   * 检查是否为社群租户
   */
  static isCommunity(type: TenantType): boolean {
    return type === TenantType.COMMUNITY;
  }

  /**
   * 检查是否为团队租户
   */
  static isTeam(type: TenantType): boolean {
    return type === TenantType.TEAM;
  }

  /**
   * 检查是否为个人租户
   */
  static isPersonal(type: TenantType): boolean {
    return type === TenantType.PERSONAL;
  }

  /**
   * 检查是否为组织类型租户
   */
  static isOrganizationType(type: TenantType): boolean {
    return type === TenantType.ENTERPRISE || type === TenantType.COMMUNITY;
  }

  /**
   * 检查是否为个人类型租户
   */
  static isPersonalType(type: TenantType): boolean {
    return type === TenantType.TEAM || type === TenantType.PERSONAL;
  }

  /**
   * 获取租户类型层级
   */
  static getLevel(type: TenantType): number {
    const levels = {
      [TenantType.ENTERPRISE]: 4,
      [TenantType.COMMUNITY]: 3,
      [TenantType.TEAM]: 2,
      [TenantType.PERSONAL]: 1,
    };
    return levels[type] || 0;
  }

  /**
   * 检查租户类型是否支持多用户
   */
  static supportsMultiUser(type: TenantType): boolean {
    return type === TenantType.ENTERPRISE || type === TenantType.COMMUNITY;
  }

  /**
   * 检查租户类型是否支持组织管理
   */
  static supportsOrganizationManagement(type: TenantType): boolean {
    return type === TenantType.ENTERPRISE;
  }

  /**
   * 获取租户类型推荐配置
   */
  static getRecommendedConfig(type: TenantType): Record<string, any> {
    const configs = {
      [TenantType.ENTERPRISE]: {
        maxUsers: 1000,
        maxOrganizations: 100,
        maxDepartments: 500,
        features: [
          "multi-tenant",
          "organization-management",
          "advanced-permissions",
        ],
      },
      [TenantType.COMMUNITY]: {
        maxUsers: 100,
        maxOrganizations: 10,
        maxDepartments: 50,
        features: ["multi-tenant", "basic-permissions"],
      },
      [TenantType.TEAM]: {
        maxUsers: 20,
        maxOrganizations: 1,
        maxDepartments: 10,
        features: ["basic-permissions"],
      },
      [TenantType.PERSONAL]: {
        maxUsers: 1,
        maxOrganizations: 0,
        maxDepartments: 0,
        features: ["basic-permissions"],
      },
    };
    return configs[type] || {};
  }
}
