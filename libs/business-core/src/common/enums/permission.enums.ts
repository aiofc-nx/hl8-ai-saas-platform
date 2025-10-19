/**
 * 权限相关枚举定义
 *
 * @description 定义权限相关的枚举类型和工具类
 * @since 1.0.0
 */

/**
 * 权限类型枚举
 */
export enum PermissionType {
  /** 系统权限 */
  SYSTEM = "SYSTEM",
  /** 租户权限 */
  TENANT = "TENANT",
  /** 组织权限 */
  ORGANIZATION = "ORGANIZATION",
  /** 部门权限 */
  DEPARTMENT = "DEPARTMENT",
  /** 用户权限 */
  USER = "USER",
  /** 角色权限 */
  ROLE = "ROLE",
  /** 权限管理 */
  PERMISSION = "PERMISSION",
}

/**
 * 权限类型工具类
 */
export class PermissionTypeUtils {
  /**
   * 获取所有权限类型
   */
  static getAllTypes(): PermissionType[] {
    return Object.values(PermissionType);
  }

  /**
   * 获取权限类型显示名称
   */
  static getDisplayName(type: PermissionType): string {
    const displayNames = {
      [PermissionType.SYSTEM]: "系统权限",
      [PermissionType.TENANT]: "租户权限",
      [PermissionType.ORGANIZATION]: "组织权限",
      [PermissionType.DEPARTMENT]: "部门权限",
      [PermissionType.USER]: "用户权限",
      [PermissionType.ROLE]: "角色权限",
      [PermissionType.PERMISSION]: "权限管理",
    };
    return displayNames[type] || "未知类型";
  }

  /**
   * 获取权限类型描述
   */
  static getDescription(type: PermissionType): string {
    const descriptions = {
      [PermissionType.SYSTEM]: "系统级别的权限，影响整个系统",
      [PermissionType.TENANT]: "租户级别的权限，影响整个租户",
      [PermissionType.ORGANIZATION]: "组织级别的权限，影响整个组织",
      [PermissionType.DEPARTMENT]: "部门级别的权限，影响整个部门",
      [PermissionType.USER]: "用户级别的权限，影响特定用户",
      [PermissionType.ROLE]: "角色级别的权限，影响角色定义",
      [PermissionType.PERMISSION]: "权限管理权限，影响权限系统本身",
    };
    return descriptions[type] || "未知类型";
  }

  /**
   * 获取权限类型层级
   */
  static getLevel(type: PermissionType): number {
    const levels = {
      [PermissionType.SYSTEM]: 7,
      [PermissionType.TENANT]: 6,
      [PermissionType.ORGANIZATION]: 5,
      [PermissionType.DEPARTMENT]: 4,
      [PermissionType.USER]: 3,
      [PermissionType.ROLE]: 2,
      [PermissionType.PERMISSION]: 1,
    };
    return levels[type] || 0;
  }

  /**
   * 检查是否为系统权限
   */
  static isSystem(type: PermissionType): boolean {
    return type === PermissionType.SYSTEM;
  }

  /**
   * 检查是否为租户权限
   */
  static isTenant(type: PermissionType): boolean {
    return type === PermissionType.TENANT;
  }

  /**
   * 检查是否为组织权限
   */
  static isOrganization(type: PermissionType): boolean {
    return type === PermissionType.ORGANIZATION;
  }

  /**
   * 检查是否为部门权限
   */
  static isDepartment(type: PermissionType): boolean {
    return type === PermissionType.DEPARTMENT;
  }

  /**
   * 检查是否为用户权限
   */
  static isUser(type: PermissionType): boolean {
    return type === PermissionType.USER;
  }

  /**
   * 检查是否为角色权限
   */
  static isRole(type: PermissionType): boolean {
    return type === PermissionType.ROLE;
  }

  /**
   * 检查是否为权限管理权限
   */
  static isPermission(type: PermissionType): boolean {
    return type === PermissionType.PERMISSION;
  }

  /**
   * 检查权限类型是否具有更高层级
   */
  static hasHigherLevel(type1: PermissionType, type2: PermissionType): boolean {
    return this.getLevel(type1) > this.getLevel(type2);
  }

  /**
   * 检查权限类型是否具有相同或更高层级
   */
  static hasSameOrHigherLevel(
    type1: PermissionType,
    type2: PermissionType,
  ): boolean {
    return this.getLevel(type1) >= this.getLevel(type2);
  }

  /**
   * 获取权限类型推荐配置
   */
  static getRecommendedConfig(type: PermissionType): Record<string, any> {
    const configs = {
      [PermissionType.SYSTEM]: {
        scope: "system",
        inheritance: false,
        delegation: false,
        audit: true,
        features: ["system-management", "global-settings", "security"],
      },
      [PermissionType.TENANT]: {
        scope: "tenant",
        inheritance: true,
        delegation: true,
        audit: true,
        features: ["tenant-management", "multi-tenant", "isolation"],
      },
      [PermissionType.ORGANIZATION]: {
        scope: "organization",
        inheritance: true,
        delegation: true,
        audit: true,
        features: ["organization-management", "hierarchy", "collaboration"],
      },
      [PermissionType.DEPARTMENT]: {
        scope: "department",
        inheritance: true,
        delegation: true,
        audit: true,
        features: ["department-management", "team-collaboration", "workflow"],
      },
      [PermissionType.USER]: {
        scope: "user",
        inheritance: false,
        delegation: false,
        audit: true,
        features: ["user-management", "personal-settings", "profile"],
      },
      [PermissionType.ROLE]: {
        scope: "role",
        inheritance: false,
        delegation: false,
        audit: true,
        features: [
          "role-management",
          "permission-assignment",
          "access-control",
        ],
      },
      [PermissionType.PERMISSION]: {
        scope: "permission",
        inheritance: false,
        delegation: false,
        audit: true,
        features: ["permission-management", "access-control", "security"],
      },
    };
    return configs[type] || {};
  }
}
