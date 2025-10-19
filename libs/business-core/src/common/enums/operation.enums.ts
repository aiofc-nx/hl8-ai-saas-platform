/**
 * 操作相关枚举定义
 *
 * @description 定义操作相关的枚举类型和工具类
 * @since 1.0.0
 */

/**
 * 操作类型枚举
 */
export enum OperationType {
  /** 创建操作 */
  CREATE = "CREATE",
  /** 读取操作 */
  READ = "READ",
  /** 更新操作 */
  UPDATE = "UPDATE",
  /** 删除操作 */
  DELETE = "DELETE",
  /** 管理操作 */
  MANAGE = "MANAGE",
  /** 查看操作 */
  VIEW = "VIEW",
}

/**
 * 操作类型工具类
 */
export class OperationTypeUtils {
  /**
   * 获取所有操作类型
   */
  static getAllTypes(): OperationType[] {
    return Object.values(OperationType);
  }

  /**
   * 获取操作类型显示名称
   */
  static getDisplayName(type: OperationType): string {
    const displayNames = {
      [OperationType.CREATE]: "创建",
      [OperationType.READ]: "读取",
      [OperationType.UPDATE]: "更新",
      [OperationType.DELETE]: "删除",
      [OperationType.MANAGE]: "管理",
      [OperationType.VIEW]: "查看",
    };
    return displayNames[type] || "未知操作";
  }

  /**
   * 获取操作类型描述
   */
  static getDescription(type: OperationType): string {
    const descriptions = {
      [OperationType.CREATE]: "创建新的资源或实体",
      [OperationType.READ]: "读取资源或实体的信息",
      [OperationType.UPDATE]: "更新现有资源或实体的信息",
      [OperationType.DELETE]: "删除资源或实体",
      [OperationType.MANAGE]: "管理资源或实体的配置和设置",
      [OperationType.VIEW]: "查看资源或实体的信息",
    };
    return descriptions[type] || "未知操作";
  }

  /**
   * 获取操作类型层级
   */
  static getLevel(type: OperationType): number {
    const levels = {
      [OperationType.MANAGE]: 6,
      [OperationType.CREATE]: 5,
      [OperationType.UPDATE]: 4,
      [OperationType.DELETE]: 3,
      [OperationType.READ]: 2,
      [OperationType.VIEW]: 1,
    };
    return levels[type] || 0;
  }

  /**
   * 检查是否为创建操作
   */
  static isCreate(type: OperationType): boolean {
    return type === OperationType.CREATE;
  }

  /**
   * 检查是否为读取操作
   */
  static isRead(type: OperationType): boolean {
    return type === OperationType.READ;
  }

  /**
   * 检查是否为更新操作
   */
  static isUpdate(type: OperationType): boolean {
    return type === OperationType.UPDATE;
  }

  /**
   * 检查是否为删除操作
   */
  static isDelete(type: OperationType): boolean {
    return type === OperationType.DELETE;
  }

  /**
   * 检查是否为管理操作
   */
  static isManage(type: OperationType): boolean {
    return type === OperationType.MANAGE;
  }

  /**
   * 检查是否为查看操作
   */
  static isView(type: OperationType): boolean {
    return type === OperationType.VIEW;
  }

  /**
   * 检查是否为写操作
   */
  static isWriteOperation(type: OperationType): boolean {
    return (
      type === OperationType.CREATE ||
      type === OperationType.UPDATE ||
      type === OperationType.DELETE ||
      type === OperationType.MANAGE
    );
  }

  /**
   * 检查是否为读操作
   */
  static isReadOperation(type: OperationType): boolean {
    return type === OperationType.READ || type === OperationType.VIEW;
  }

  /**
   * 检查是否为危险操作
   */
  static isDangerousOperation(type: OperationType): boolean {
    return type === OperationType.DELETE || type === OperationType.MANAGE;
  }

  /**
   * 检查是否为安全操作
   */
  static isSafeOperation(type: OperationType): boolean {
    return type === OperationType.READ || type === OperationType.VIEW;
  }

  /**
   * 检查操作类型是否具有更高权限
   */
  static hasHigherPermission(
    type1: OperationType,
    type2: OperationType,
  ): boolean {
    return this.getLevel(type1) > this.getLevel(type2);
  }

  /**
   * 检查操作类型是否具有相同或更高权限
   */
  static hasSameOrHigherPermission(
    type1: OperationType,
    type2: OperationType,
  ): boolean {
    return this.getLevel(type1) >= this.getLevel(type2);
  }

  /**
   * 获取操作类型推荐配置
   */
  static getRecommendedConfig(type: OperationType): Record<string, any> {
    const configs: Record<OperationType, Record<string, any>> = {
      [OperationType.CREATE]: {
        requiresAuth: true,
        requiresPermission: true,
        audit: true,
        rateLimit: "medium",
        features: ["validation", "authorization", "audit-log"],
      },
      [OperationType.READ]: {
        requiresAuth: true,
        requiresPermission: true,
        audit: false,
        rateLimit: "high",
        features: ["caching", "filtering", "pagination"],
      },
      [OperationType.UPDATE]: {
        requiresAuth: true,
        requiresPermission: true,
        audit: true,
        rateLimit: "medium",
        features: ["validation", "authorization", "audit-log", "versioning"],
      },
      [OperationType.DELETE]: {
        requiresAuth: true,
        requiresPermission: true,
        audit: true,
        rateLimit: "low",
        features: [
          "soft-delete",
          "cascade-delete",
          "audit-log",
          "confirmation",
        ],
      },
      [OperationType.MANAGE]: {
        requiresAuth: true,
        requiresPermission: true,
        audit: true,
        rateLimit: "low",
        features: ["admin-only", "audit-log", "security", "monitoring"],
      },
      [OperationType.VIEW]: {
        requiresAuth: true,
        requiresPermission: false,
        audit: false,
        rateLimit: "high",
        features: ["caching", "filtering", "public-access"],
      },
    };
    return configs[type] || {};
  }

  /**
   * 获取操作类型的安全级别
   */
  static getSecurityLevel(
    type: OperationType,
  ): "low" | "medium" | "high" | "critical" {
    const securityLevels: Record<
      OperationType,
      "low" | "medium" | "high" | "critical"
    > = {
      [OperationType.VIEW]: "low",
      [OperationType.READ]: "low",
      [OperationType.CREATE]: "medium",
      [OperationType.UPDATE]: "medium",
      [OperationType.DELETE]: "high",
      [OperationType.MANAGE]: "critical",
    };
    return securityLevels[type] || "low";
  }

  /**
   * 获取操作类型的影响范围
   */
  static getImpactScope(
    type: OperationType,
  ): "local" | "department" | "organization" | "tenant" | "system" {
    const impactScopes: Record<
      OperationType,
      "local" | "department" | "organization" | "tenant" | "system"
    > = {
      [OperationType.VIEW]: "local",
      [OperationType.READ]: "local",
      [OperationType.CREATE]: "department",
      [OperationType.UPDATE]: "department",
      [OperationType.DELETE]: "organization",
      [OperationType.MANAGE]: "system",
    };
    return impactScopes[type] || "local";
  }
}
