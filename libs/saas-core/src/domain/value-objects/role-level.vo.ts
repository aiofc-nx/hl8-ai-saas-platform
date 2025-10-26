/**
 * 角色级别值对象
 *
 * @description 表示角色的级别，用于定义角色的权限范围和继承关系
 * @since 1.0.0
 */

import { BaseValueObject } from "./base-value-object.js";

/**
 * 角色级别枚举
 */
export enum RoleLevelEnum {
  PLATFORM = "PLATFORM",
  TENANT = "TENANT",
  ORGANIZATION = "ORGANIZATION",
  DEPARTMENT = "DEPARTMENT",
  USER = "USER",
}

/**
 * 角色级别配置接口
 */
export interface RoleLevelConfig {
  readonly level: number;
  readonly name: string;
  readonly description: string;
  readonly canManageLowerLevels: boolean;
  readonly canInheritFromHigherLevels: boolean;
  readonly scope: string;
}

/**
 * 角色级别值对象
 *
 * 角色级别定义了角色在组织架构中的层级位置和权限范围。
 * 支持5个级别：PLATFORM、TENANT、ORGANIZATION、DEPARTMENT、USER，
 * 高级别角色可以管理低级别角色，低级别角色可以继承高级别角色的权限。
 *
 * @example
 * ```typescript
 * const roleLevel = new RoleLevel(RoleLevelEnum.ORGANIZATION);
 * console.log(roleLevel.level); // 3
 * console.log(roleLevel.canManageLowerLevels); // true
 * ```
 */
export class RoleLevel extends BaseValueObject<RoleLevelEnum> {
  private static readonly LEVEL_CONFIGS: Record<
    RoleLevelEnum,
    RoleLevelConfig
  > = {
    [RoleLevelEnum.PLATFORM]: {
      level: 1,
      name: "平台级",
      description: "平台管理员，拥有最高权限",
      canManageLowerLevels: true,
      canInheritFromHigherLevels: false,
      scope: "platform",
    },
    [RoleLevelEnum.TENANT]: {
      level: 2,
      name: "租户级",
      description: "租户管理员，管理租户内所有资源",
      canManageLowerLevels: true,
      canInheritFromHigherLevels: true,
      scope: "tenant",
    },
    [RoleLevelEnum.ORGANIZATION]: {
      level: 3,
      name: "组织级",
      description: "组织管理员，管理组织内所有资源",
      canManageLowerLevels: true,
      canInheritFromHigherLevels: true,
      scope: "organization",
    },
    [RoleLevelEnum.DEPARTMENT]: {
      level: 4,
      name: "部门级",
      description: "部门管理员，管理部门内所有资源",
      canManageLowerLevels: true,
      canInheritFromHigherLevels: true,
      scope: "department",
    },
    [RoleLevelEnum.USER]: {
      level: 5,
      name: "用户级",
      description: "普通用户，只能管理自己的资源",
      canManageLowerLevels: false,
      canInheritFromHigherLevels: true,
      scope: "user",
    },
  };

  constructor(value: RoleLevelEnum) {
    super(value);
    this.validateValue(value);
  }

  /**
   * 验证角色级别
   *
   * @param value - 角色级别值
   * @throws {Error} 当级别无效时抛出错误
   */
  private validateValue(value: RoleLevelEnum): void {
    if (!Object.values(RoleLevelEnum).includes(value)) {
      throw new Error(`无效的角色级别: ${value}`);
    }
  }

  /**
   * 获取角色级别配置
   *
   * @returns 角色级别配置
   */
  get config(): RoleLevelConfig {
    return RoleLevel.LEVEL_CONFIGS[this.value];
  }

  /**
   * 获取级别数字
   *
   * @returns 级别数字
   */
  get level(): number {
    return this.config.level;
  }

  /**
   * 获取级别名称
   *
   * @returns 级别名称
   */
  get name(): string {
    return this.config.name;
  }

  /**
   * 获取级别描述
   *
   * @returns 级别描述
   */
  get description(): string {
    return this.config.description;
  }

  /**
   * 获取权限范围
   *
   * @returns 权限范围
   */
  get scope(): string {
    return this.config.scope;
  }

  /**
   * 检查是否可以管理低级别角色
   *
   * @returns 是否可以管理低级别角色
   */
  get canManageLowerLevels(): boolean {
    return this.config.canManageLowerLevels;
  }

  /**
   * 检查是否可以继承高级别角色的权限
   *
   * @returns 是否可以继承高级别角色的权限
   */
  get canInheritFromHigherLevels(): boolean {
    return this.config.canInheritFromHigherLevels;
  }

  /**
   * 检查是否比指定级别高
   *
   * @param otherLevel - 其他级别
   * @returns 是否比指定级别高
   */
  isHigherThan(otherLevel: RoleLevel): boolean {
    return this.level < otherLevel.level;
  }

  /**
   * 检查是否比指定级别低
   *
   * @param otherLevel - 其他级别
   * @returns 是否比指定级别低
   */
  isLowerThan(otherLevel: RoleLevel): boolean {
    return this.level > otherLevel.level;
  }

  /**
   * 检查是否等于指定级别
   *
   * @param other - 其他值对象
   * @returns 是否等于指定级别
   */
  equals(other?: BaseValueObject<unknown>): boolean {
    if (!other || !(other instanceof RoleLevel)) {
      return false;
    }
    return this.level === other.level;
  }

  /**
   * 检查是否可以管理指定级别的角色
   *
   * @param otherLevel - 其他级别
   * @returns 是否可以管理
   */
  canManage(otherLevel: RoleLevel): boolean {
    return this.canManageLowerLevels && this.isHigherThan(otherLevel);
  }

  /**
   * 检查是否可以继承指定级别的权限
   *
   * @param otherLevel - 其他级别
   * @returns 是否可以继承
   */
  canInheritFrom(otherLevel: RoleLevel): boolean {
    return this.canInheritFromHigherLevels && otherLevel.isHigherThan(this);
  }

  /**
   * 获取所有可以管理的级别
   *
   * @returns 可以管理的级别列表
   */
  getManageableLevels(): RoleLevelEnum[] {
    if (!this.canManageLowerLevels) {
      return [];
    }

    return Object.values(RoleLevelEnum).filter(
      (level) => RoleLevel.LEVEL_CONFIGS[level].level > this.level,
    );
  }

  /**
   * 获取所有可以继承权限的级别
   *
   * @returns 可以继承权限的级别列表
   */
  getInheritableLevels(): RoleLevelEnum[] {
    if (!this.canInheritFromHigherLevels) {
      return [];
    }

    return Object.values(RoleLevelEnum).filter(
      (level) => RoleLevel.LEVEL_CONFIGS[level].level < this.level,
    );
  }

  /**
   * 获取角色级别的字符串表示
   *
   * @returns 角色级别字符串
   */
  toString(): string {
    return this.value;
  }

  /**
   * 检查是否为有效的角色级别
   *
   * @param value - 要检查的值
   * @returns 是否为有效级别
   */
  static isValid(value: string): boolean {
    return Object.values(RoleLevelEnum).includes(value as RoleLevelEnum);
  }

  /**
   * 获取所有可用的角色级别
   *
   * @returns 所有角色级别列表
   */
  static getAllLevels(): RoleLevelEnum[] {
    return Object.values(RoleLevelEnum);
  }

  /**
   * 根据级别数字获取角色级别
   *
   * @param level - 级别数字
   * @returns 角色级别或null
   */
  static fromLevel(level: number): RoleLevelEnum | null {
    const levelConfig = Object.entries(RoleLevel.LEVEL_CONFIGS).find(
      ([, config]) => config.level === level,
    );
    return levelConfig ? (levelConfig[0] as RoleLevelEnum) : null;
  }

  /**
   * 获取级别配置
   *
   * @returns 级别配置映射
   */
  static getLevelConfigs(): Record<RoleLevelEnum, RoleLevelConfig> {
    return RoleLevel.LEVEL_CONFIGS;
  }
}
