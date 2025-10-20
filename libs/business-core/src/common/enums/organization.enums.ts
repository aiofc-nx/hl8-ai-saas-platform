/**
 * 组织相关枚举定义
 *
 * @description 定义组织相关的枚举类型和工具类
 * @since 1.0.0
 */

/**
 * 组织类型枚举
 */
export enum OrganizationType {
  /** 企业组织 */
  ENTERPRISE = "ENTERPRISE",
  /** 非营利组织 */
  NON_PROFIT = "NON_PROFIT",
  /** 政府组织 */
  GOVERNMENT = "GOVERNMENT",
  /** 教育组织 */
  EDUCATION = "EDUCATION",
  /** 其他组织 */
  OTHER = "OTHER",
}

/**
 * 组织类型工具类
 */
export class OrganizationTypeUtils {
  /**
   * 获取所有组织类型
   */
  static getAllTypes(): OrganizationType[] {
    return Object.values(OrganizationType);
  }

  /**
   * 获取组织类型显示名称
   */
  static getDisplayName(type: OrganizationType): string {
    const displayNames = {
      [OrganizationType.ENTERPRISE]: "企业组织",
      [OrganizationType.NON_PROFIT]: "非营利组织",
      [OrganizationType.GOVERNMENT]: "政府组织",
      [OrganizationType.EDUCATION]: "教育组织",
      [OrganizationType.OTHER]: "其他组织",
    };
    return displayNames[type] || "未知类型";
  }

  /**
   * 获取组织类型描述
   */
  static getDescription(type: OrganizationType): string {
    const descriptions = {
      [OrganizationType.ENTERPRISE]: "商业企业组织，以盈利为目的",
      [OrganizationType.NON_PROFIT]: "非营利组织，以公益为目的",
      [OrganizationType.GOVERNMENT]: "政府组织，提供公共服务",
      [OrganizationType.EDUCATION]: "教育组织，提供教育服务",
      [OrganizationType.OTHER]: "其他类型的组织",
    };
    return descriptions[type] || "未知类型";
  }

  /**
   * 检查是否为企业组织
   */
  static isEnterprise(type: OrganizationType): boolean {
    return type === OrganizationType.ENTERPRISE;
  }

  /**
   * 检查是否为非营利组织
   */
  static isNonProfit(type: OrganizationType): boolean {
    return type === OrganizationType.NON_PROFIT;
  }

  /**
   * 检查是否为政府组织
   */
  static isGovernment(type: OrganizationType): boolean {
    return type === OrganizationType.GOVERNMENT;
  }

  /**
   * 检查是否为教育组织
   */
  static isEducation(type: OrganizationType): boolean {
    return type === OrganizationType.EDUCATION;
  }

  /**
   * 检查是否为公共组织
   */
  static isPublicOrganization(type: OrganizationType): boolean {
    return (
      type === OrganizationType.GOVERNMENT ||
      type === OrganizationType.EDUCATION ||
      type === OrganizationType.NON_PROFIT
    );
  }

  /**
   * 检查是否为商业组织
   */
  static isCommercialOrganization(type: OrganizationType): boolean {
    return type === OrganizationType.ENTERPRISE;
  }

  /**
   * 获取组织类型层级
   */
  static getLevel(type: OrganizationType): number {
    const levels = {
      [OrganizationType.GOVERNMENT]: 5,
      [OrganizationType.EDUCATION]: 4,
      [OrganizationType.ENTERPRISE]: 3,
      [OrganizationType.NON_PROFIT]: 2,
      [OrganizationType.OTHER]: 1,
    };
    return levels[type] || 0;
  }

  /**
   * 获取组织类型推荐配置
   */
  static getRecommendedConfig(type: OrganizationType): Record<string, any> {
    const configs = {
      [OrganizationType.ENTERPRISE]: {
        maxDepartments: 100,
        maxUsers: 1000,
        features: ["advanced-permissions", "audit-log", "compliance"],
        compliance: ["SOX", "GDPR", "HIPAA"],
      },
      [OrganizationType.GOVERNMENT]: {
        maxDepartments: 200,
        maxUsers: 5000,
        features: [
          "advanced-permissions",
          "audit-log",
          "compliance",
          "security",
        ],
        compliance: ["FISMA", "FedRAMP", "NIST"],
      },
      [OrganizationType.EDUCATION]: {
        maxDepartments: 50,
        maxUsers: 2000,
        features: ["basic-permissions", "audit-log", "collaboration"],
        compliance: ["FERPA", "COPPA"],
      },
      [OrganizationType.NON_PROFIT]: {
        maxDepartments: 20,
        maxUsers: 500,
        features: ["basic-permissions", "collaboration"],
        compliance: ["IRS"],
      },
      [OrganizationType.OTHER]: {
        maxDepartments: 10,
        maxUsers: 100,
        features: ["basic-permissions"],
        compliance: [],
      },
    };
    return configs[type] || {};
  }
}

/**
 * 部门类型枚举
 */
export enum DepartmentType {
  /** 管理部门 */
  MANAGEMENT = "MANAGEMENT",
  /** 技术部门 */
  TECHNOLOGY = "TECHNOLOGY",
  /** 销售部门 */
  SALES = "SALES",
  /** 市场部门 */
  MARKETING = "MARKETING",
  /** 人力资源部门 */
  HUMAN_RESOURCES = "HUMAN_RESOURCES",
  /** 财务部门 */
  FINANCE = "FINANCE",
  /** 运营部门 */
  OPERATIONS = "OPERATIONS",
  /** 其他部门 */
  OTHER = "OTHER",
}

/**
 * 部门类型工具类
 */
export class DepartmentTypeUtils {
  /**
   * 获取所有部门类型
   */
  static getAllTypes(): DepartmentType[] {
    return Object.values(DepartmentType);
  }

  /**
   * 获取部门类型显示名称
   */
  static getDisplayName(type: DepartmentType): string {
    const displayNames = {
      [DepartmentType.MANAGEMENT]: "管理部门",
      [DepartmentType.TECHNOLOGY]: "技术部门",
      [DepartmentType.SALES]: "销售部门",
      [DepartmentType.MARKETING]: "市场部门",
      [DepartmentType.HUMAN_RESOURCES]: "人力资源部门",
      [DepartmentType.FINANCE]: "财务部门",
      [DepartmentType.OPERATIONS]: "运营部门",
      [DepartmentType.OTHER]: "其他部门",
    };
    return displayNames[type] || "未知类型";
  }

  /**
   * 获取部门类型描述
   */
  static getDescription(type: DepartmentType): string {
    const descriptions = {
      [DepartmentType.MANAGEMENT]: "负责组织管理和决策的部门",
      [DepartmentType.TECHNOLOGY]: "负责技术开发和维护的部门",
      [DepartmentType.SALES]: "负责销售和客户关系的部门",
      [DepartmentType.MARKETING]: "负责市场推广和品牌建设的部门",
      [DepartmentType.HUMAN_RESOURCES]: "负责人力资源管理和员工服务的部门",
      [DepartmentType.FINANCE]: "负责财务管理和会计的部门",
      [DepartmentType.OPERATIONS]: "负责日常运营和执行的部门",
      [DepartmentType.OTHER]: "其他类型的部门",
    };
    return descriptions[type] || "未知类型";
  }

  /**
   * 检查是否为管理部门
   */
  static isManagement(type: DepartmentType): boolean {
    return type === DepartmentType.MANAGEMENT;
  }

  /**
   * 检查是否为技术部门
   */
  static isTechnology(type: DepartmentType): boolean {
    return type === DepartmentType.TECHNOLOGY;
  }

  /**
   * 检查是否为业务部门
   */
  static isBusiness(type: DepartmentType): boolean {
    return type === DepartmentType.SALES || type === DepartmentType.MARKETING;
  }

  /**
   * 检查是否为支持部门
   */
  static isSupport(type: DepartmentType): boolean {
    return (
      type === DepartmentType.HUMAN_RESOURCES ||
      type === DepartmentType.FINANCE ||
      type === DepartmentType.OPERATIONS
    );
  }

  /**
   * 获取部门类型层级
   */
  static getLevel(type: DepartmentType): number {
    const levels = {
      [DepartmentType.MANAGEMENT]: 8,
      [DepartmentType.TECHNOLOGY]: 7,
      [DepartmentType.FINANCE]: 6,
      [DepartmentType.HUMAN_RESOURCES]: 5,
      [DepartmentType.OPERATIONS]: 4,
      [DepartmentType.SALES]: 3,
      [DepartmentType.MARKETING]: 2,
      [DepartmentType.OTHER]: 1,
    };
    return levels[type] || 0;
  }

  /**
   * 获取部门类型推荐配置
   */
  static getRecommendedConfig(type: DepartmentType): Record<string, any> {
    const configs = {
      [DepartmentType.MANAGEMENT]: {
        maxUsers: 50,
        permissions: ["admin", "manage", "view"],
        features: ["audit-log", "advanced-permissions"],
      },
      [DepartmentType.TECHNOLOGY]: {
        maxUsers: 200,
        permissions: ["admin", "manage", "view", "develop"],
        features: ["development-tools", "version-control", "testing"],
      },
      [DepartmentType.SALES]: {
        maxUsers: 100,
        permissions: ["manage", "view", "create"],
        features: ["crm", "lead-management", "reporting"],
      },
      [DepartmentType.MARKETING]: {
        maxUsers: 50,
        permissions: ["manage", "view", "create"],
        features: ["campaign-management", "analytics", "content-management"],
      },
      [DepartmentType.HUMAN_RESOURCES]: {
        maxUsers: 30,
        permissions: ["admin", "manage", "view"],
        features: ["employee-management", "payroll", "benefits"],
      },
      [DepartmentType.FINANCE]: {
        maxUsers: 20,
        permissions: ["admin", "manage", "view"],
        features: ["accounting", "budgeting", "reporting", "audit"],
      },
      [DepartmentType.OPERATIONS]: {
        maxUsers: 100,
        permissions: ["manage", "view", "execute"],
        features: ["workflow", "automation", "monitoring"],
      },
      [DepartmentType.OTHER]: {
        maxUsers: 50,
        permissions: ["view", "create"],
        features: ["basic-tools"],
      },
    };
    return configs[type] || {};
  }
}
