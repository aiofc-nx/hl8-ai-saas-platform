/**
 * 租户类型枚举
 * @description 定义系统中的5种租户类型及其资源限制
 *
 * @example
 * ```typescript
 * const limits = getResourceLimits(TenantType.BASIC);
 * console.log(limits.maxUsers); // 50
 * ```
 */
export enum TenantType {
  /**
   * 免费租户
   * @description 个人用户、小型团队、试用客户
   * 资源限制：5用户、100MB存储、1组织
   */
  FREE = "FREE",

  /**
   * 基础租户
   * @description 小型企业、初创公司
   * 资源限制：50用户、1GB存储、2组织
   */
  BASIC = "BASIC",

  /**
   * 专业租户
   * @description 中型企业、专业团队
   * 资源限制：500用户、10GB存储、10组织
   */
  PROFESSIONAL = "PROFESSIONAL",

  /**
   * 企业租户
   * @description 大型企业、集团公司
   * 资源限制：10,000用户、100GB存储、100组织
   */
  ENTERPRISE = "ENTERPRISE",

  /**
   * 定制租户
   * @description 特殊需求客户、政府机构
   * 资源限制：无限制用户、无限制存储、无限制组织
   */
  CUSTOM = "CUSTOM",
}

/**
 * 租户资源限制配置
 */
export interface TenantResourceLimits {
  maxUsers: number;
  maxStorage: string;
  maxOrganizations: number;
  maxDepartments: number;
  maxDepartmentLevels: number;
}

/**
 * 获取租户类型的资源限制
 * @description 根据租户类型返回相应的资源限制配置，默认支持8层部门架构
 * @param type - 租户类型
 * @returns 资源限制配置对象
 */
export function getResourceLimits(type: TenantType): TenantResourceLimits {
  switch (type) {
    case TenantType.FREE:
      return {
        maxUsers: 5,
        maxStorage: "100MB",
        maxOrganizations: 1,
        maxDepartments: 50,
        maxDepartmentLevels: 8,
      };
    case TenantType.BASIC:
      return {
        maxUsers: 50,
        maxStorage: "1GB",
        maxOrganizations: 2,
        maxDepartments: 200,
        maxDepartmentLevels: 8,
      };
    case TenantType.PROFESSIONAL:
      return {
        maxUsers: 500,
        maxStorage: "10GB",
        maxOrganizations: 10,
        maxDepartments: 2000,
        maxDepartmentLevels: 8,
      };
    case TenantType.ENTERPRISE:
      return {
        maxUsers: 10000,
        maxStorage: "100GB",
        maxOrganizations: 100,
        maxDepartments: 50000,
        maxDepartmentLevels: 8,
      };
    case TenantType.CUSTOM:
      return {
        maxUsers: Infinity,
        maxStorage: "Unlimited",
        maxOrganizations: Infinity,
        maxDepartments: Infinity,
        maxDepartmentLevels: 8, // 可配置
      };
    default:
      throw new Error(`未知的租户类型: ${type}`);
  }
}
