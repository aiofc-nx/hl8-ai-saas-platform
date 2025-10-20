/**
 * 用户相关枚举定义
 *
 * @description 定义用户相关的枚举类型和工具类
 * @since 1.0.0
 */

/**
 * 用户状态枚举
 */
export enum UserStatus {
  /** 激活状态 */
  ACTIVE = "ACTIVE",
  /** 未激活状态 */
  INACTIVE = "INACTIVE",
  /** 锁定状态 */
  LOCKED = "LOCKED",
  /** 禁用状态 */
  DISABLED = "DISABLED",
  /** 待审核状态 */
  PENDING = "PENDING",
}

/**
 * 用户状态工具类
 */
export class UserStatusUtils {
  /**
   * 获取所有用户状态
   */
  static getAllStatuses(): UserStatus[] {
    return Object.values(UserStatus);
  }

  /**
   * 获取用户状态显示名称
   */
  static getDisplayName(status: UserStatus): string {
    const displayNames = {
      [UserStatus.ACTIVE]: "激活",
      [UserStatus.INACTIVE]: "未激活",
      [UserStatus.LOCKED]: "锁定",
      [UserStatus.DISABLED]: "禁用",
      [UserStatus.PENDING]: "待审核",
    };
    return displayNames[status] || "未知状态";
  }

  /**
   * 获取用户状态描述
   */
  static getDescription(status: UserStatus): string {
    const descriptions = {
      [UserStatus.ACTIVE]: "用户已激活，可以正常使用系统",
      [UserStatus.INACTIVE]: "用户未激活，需要激活后才能使用",
      [UserStatus.LOCKED]: "用户被锁定，暂时无法使用系统",
      [UserStatus.DISABLED]: "用户被禁用，无法使用系统",
      [UserStatus.PENDING]: "用户待审核，等待管理员审核",
    };
    return descriptions[status] || "未知状态";
  }

  /**
   * 检查是否为激活状态
   */
  static isActive(status: UserStatus): boolean {
    return status === UserStatus.ACTIVE;
  }

  /**
   * 检查是否为可用状态
   */
  static isAvailable(status: UserStatus): boolean {
    return status === UserStatus.ACTIVE;
  }

  /**
   * 检查是否为不可用状态
   */
  static isUnavailable(status: UserStatus): boolean {
    return (
      status === UserStatus.INACTIVE ||
      status === UserStatus.LOCKED ||
      status === UserStatus.DISABLED
    );
  }

  /**
   * 检查是否需要审核
   */
  static requiresApproval(status: UserStatus): boolean {
    return status === UserStatus.PENDING;
  }

  /**
   * 获取状态优先级
   */
  static getPriority(status: UserStatus): number {
    const priorities = {
      [UserStatus.ACTIVE]: 5,
      [UserStatus.PENDING]: 4,
      [UserStatus.INACTIVE]: 3,
      [UserStatus.LOCKED]: 2,
      [UserStatus.DISABLED]: 1,
    };
    return priorities[status] || 0;
  }
}

/**
 * 用户角色枚举
 */
export enum UserRole {
  /** 超级管理员 */
  SUPER_ADMIN = "SUPER_ADMIN",
  /** 系统管理员 */
  SYSTEM_ADMIN = "SYSTEM_ADMIN",
  /** 租户管理员 */
  TENANT_ADMIN = "TENANT_ADMIN",
  /** 组织管理员 */
  ORGANIZATION_ADMIN = "ORGANIZATION_ADMIN",
  /** 部门管理员 */
  DEPARTMENT_ADMIN = "DEPARTMENT_ADMIN",
  /** 普通用户 */
  USER = "USER",
  /** 访客 */
  GUEST = "GUEST",
}

/**
 * 用户角色工具类
 */
export class UserRoleUtils {
  /**
   * 获取所有用户角色
   */
  static getAllRoles(): UserRole[] {
    return Object.values(UserRole);
  }

  /**
   * 获取用户角色显示名称
   */
  static getDisplayName(role: UserRole): string {
    const displayNames = {
      [UserRole.SUPER_ADMIN]: "超级管理员",
      [UserRole.SYSTEM_ADMIN]: "系统管理员",
      [UserRole.TENANT_ADMIN]: "租户管理员",
      [UserRole.ORGANIZATION_ADMIN]: "组织管理员",
      [UserRole.DEPARTMENT_ADMIN]: "部门管理员",
      [UserRole.USER]: "普通用户",
      [UserRole.GUEST]: "访客",
    };
    return displayNames[role] || "未知角色";
  }

  /**
   * 获取用户角色描述
   */
  static getDescription(role: UserRole): string {
    const descriptions = {
      [UserRole.SUPER_ADMIN]: "拥有系统最高权限，可以管理所有租户和用户",
      [UserRole.SYSTEM_ADMIN]: "拥有系统管理权限，可以管理系统配置",
      [UserRole.TENANT_ADMIN]: "拥有租户管理权限，可以管理租户内的所有资源",
      [UserRole.ORGANIZATION_ADMIN]: "拥有组织管理权限，可以管理组织内的资源",
      [UserRole.DEPARTMENT_ADMIN]: "拥有部门管理权限，可以管理部门内的资源",
      [UserRole.USER]: "普通用户，拥有基本的系统使用权限",
      [UserRole.GUEST]: "访客用户，拥有有限的系统访问权限",
    };
    return descriptions[role] || "未知角色";
  }

  /**
   * 获取角色层级
   */
  static getLevel(role: UserRole): number {
    const levels = {
      [UserRole.SUPER_ADMIN]: 7,
      [UserRole.SYSTEM_ADMIN]: 6,
      [UserRole.TENANT_ADMIN]: 5,
      [UserRole.ORGANIZATION_ADMIN]: 4,
      [UserRole.DEPARTMENT_ADMIN]: 3,
      [UserRole.USER]: 2,
      [UserRole.GUEST]: 1,
    };
    return levels[role] || 0;
  }

  /**
   * 检查是否为管理员角色
   */
  static isAdmin(role: UserRole): boolean {
    return (
      role === UserRole.SUPER_ADMIN ||
      role === UserRole.SYSTEM_ADMIN ||
      role === UserRole.TENANT_ADMIN ||
      role === UserRole.ORGANIZATION_ADMIN ||
      role === UserRole.DEPARTMENT_ADMIN
    );
  }

  /**
   * 检查是否为系统管理员
   */
  static isSystemAdmin(role: UserRole): boolean {
    return role === UserRole.SUPER_ADMIN || role === UserRole.SYSTEM_ADMIN;
  }

  /**
   * 检查是否为租户管理员
   */
  static isTenantAdmin(role: UserRole): boolean {
    return (
      role === UserRole.SUPER_ADMIN ||
      role === UserRole.SYSTEM_ADMIN ||
      role === UserRole.TENANT_ADMIN
    );
  }

  /**
   * 检查是否为组织管理员
   */
  static isOrganizationAdmin(role: UserRole): boolean {
    return this.isTenantAdmin(role) || role === UserRole.ORGANIZATION_ADMIN;
  }

  /**
   * 检查是否为部门管理员
   */
  static isDepartmentAdmin(role: UserRole): boolean {
    return this.isOrganizationAdmin(role) || role === UserRole.DEPARTMENT_ADMIN;
  }

  /**
   * 检查是否可以管理用户
   */
  static canManageUsers(role: UserRole): boolean {
    return this.isAdmin(role);
  }

  /**
   * 检查是否可以管理组织
   */
  static canManageOrganization(role: UserRole): boolean {
    return this.isTenantAdmin(role) || role === UserRole.ORGANIZATION_ADMIN;
  }

  /**
   * 检查是否可以管理部门
   */
  static canManageDepartment(role: UserRole): boolean {
    return (
      this.canManageOrganization(role) || role === UserRole.DEPARTMENT_ADMIN
    );
  }

  /**
   * 检查是否可以管理权限
   */
  static canManagePermissions(role: UserRole): boolean {
    return this.isSystemAdmin(role) || role === UserRole.TENANT_ADMIN;
  }

  /**
   * 比较角色权限级别
   */
  static compareRoles(role1: UserRole, role2: UserRole): number {
    const level1 = this.getLevel(role1);
    const level2 = this.getLevel(role2);
    return level1 - level2;
  }

  /**
   * 检查角色是否具有更高权限
   */
  static hasHigherPermission(role1: UserRole, role2: UserRole): boolean {
    return this.compareRoles(role1, role2) > 0;
  }

  /**
   * 检查角色是否具有相同或更高权限
   */
  static hasSameOrHigherPermission(role1: UserRole, role2: UserRole): boolean {
    return this.compareRoles(role1, role2) >= 0;
  }
}
