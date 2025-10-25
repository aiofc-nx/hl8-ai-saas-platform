/**
 * 部门层级配置值对象
 *
 * @description 表示部门层级配置，用于定义和管理部门层次结构
 * @since 1.0.0
 */

import { BaseValueObject } from "@hl8/domain-kernel";

/**
 * 部门层级类型枚举
 */
export enum DepartmentLevelType {
  ROOT = "ROOT",
  BRANCH = "BRANCH",
  LEAF = "LEAF",
  CUSTOM = "CUSTOM",
}

/**
 * 部门层级配置属性接口
 */
interface DepartmentLevelConfigProps {
  readonly level: number;
  readonly type: DepartmentLevelType;
  readonly maxChildren: number;
  readonly maxDepth: number;
  readonly allowedParentTypes: readonly DepartmentLevelType[];
  readonly allowedChildTypes: readonly DepartmentLevelType[];
  readonly permissions: readonly string[];
  readonly constraints: readonly string[];
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * 部门层级配置值对象
 *
 * 部门层级配置值对象表示部门层级配置，用于定义和管理部门层次结构。
 * 支持多级部门层次结构，包括根部门、分支部门、叶子部门等类型。
 *
 * @example
 * ```typescript
 * const config = DepartmentLevelConfig.create(
 *   1,
 *   DepartmentLevelType.ROOT,
 *   10,
 *   7,
 *   [DepartmentLevelType.ROOT],
 *   [DepartmentLevelType.BRANCH, DepartmentLevelType.LEAF],
 *   ["department:create", "department:read", "department:update"],
 *   ["max_users:100", "max_organizations:5"]
 * );
 * ```
 */
export class DepartmentLevelConfig extends BaseValueObject {
  private constructor(private readonly props: DepartmentLevelConfigProps) {
    super();
  }

  /**
   * 创建部门层级配置
   *
   * @param level - 层级
   * @param type - 类型
   * @param maxChildren - 最大子部门数
   * @param maxDepth - 最大深度
   * @param allowedParentTypes - 允许的父级类型
   * @param allowedChildTypes - 允许的子级类型
   * @param permissions - 权限列表
   * @param constraints - 约束列表
   * @param metadata - 元数据
   * @returns 部门层级配置
   */
  public static create(
    level: number,
    type: DepartmentLevelType,
    maxChildren: number,
    maxDepth: number,
    allowedParentTypes: readonly DepartmentLevelType[],
    allowedChildTypes: readonly DepartmentLevelType[],
    permissions: readonly string[],
    constraints: readonly string[],
    metadata?: Record<string, unknown>,
  ): DepartmentLevelConfig {
    if (level < 1 || level > 7) {
      throw new Error("Level must be between 1 and 7.");
    }

    if (maxChildren < 0) {
      throw new Error("Max children cannot be negative.");
    }

    if (maxDepth < 1 || maxDepth > 7) {
      throw new Error("Max depth must be between 1 and 7.");
    }

    if (allowedParentTypes.length === 0) {
      throw new Error("At least one allowed parent type is required.");
    }

    if (allowedChildTypes.length === 0) {
      throw new Error("At least one allowed child type is required.");
    }

    if (permissions.length === 0) {
      throw new Error("At least one permission is required.");
    }

    return new DepartmentLevelConfig({
      level,
      type,
      maxChildren,
      maxDepth,
      allowedParentTypes: [...allowedParentTypes],
      allowedChildTypes: [...allowedChildTypes],
      permissions: [...permissions],
      constraints: [...constraints],
      metadata: metadata ? { ...metadata } : {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * 从现有配置创建新版本
   *
   * @param config - 现有配置
   * @param updates - 更新内容
   * @returns 新版本的部门层级配置
   */
  public static createFromConfig(
    config: DepartmentLevelConfig,
    updates: {
      readonly maxChildren?: number;
      readonly maxDepth?: number;
      readonly allowedParentTypes?: readonly DepartmentLevelType[];
      readonly allowedChildTypes?: readonly DepartmentLevelType[];
      readonly permissions?: readonly string[];
      readonly constraints?: readonly string[];
      readonly metadata?: Record<string, unknown>;
    },
  ): DepartmentLevelConfig {
    return new DepartmentLevelConfig({
      level: config.level,
      type: config.type,
      maxChildren: updates.maxChildren ?? config.maxChildren,
      maxDepth: updates.maxDepth ?? config.maxDepth,
      allowedParentTypes:
        updates.allowedParentTypes ?? config.allowedParentTypes,
      allowedChildTypes: updates.allowedChildTypes ?? config.allowedChildTypes,
      permissions: updates.permissions ?? config.permissions,
      constraints: updates.constraints ?? config.constraints,
      metadata: updates.metadata ?? config.metadata,
      createdAt: config.createdAt,
      updatedAt: new Date(),
    });
  }

  /**
   * 获取层级
   *
   * @returns 层级
   */
  get level(): number {
    return this.props.level;
  }

  /**
   * 获取类型
   *
   * @returns 类型
   */
  get type(): DepartmentLevelType {
    return this.props.type;
  }

  /**
   * 获取最大子部门数
   *
   * @returns 最大子部门数
   */
  get maxChildren(): number {
    return this.props.maxChildren;
  }

  /**
   * 获取最大深度
   *
   * @returns 最大深度
   */
  get maxDepth(): number {
    return this.props.maxDepth;
  }

  /**
   * 获取允许的父级类型
   *
   * @returns 允许的父级类型
   */
  get allowedParentTypes(): readonly DepartmentLevelType[] {
    return this.props.allowedParentTypes;
  }

  /**
   * 获取允许的子级类型
   *
   * @returns 允许的子级类型
   */
  get allowedChildTypes(): readonly DepartmentLevelType[] {
    return this.props.allowedChildTypes;
  }

  /**
   * 获取权限列表
   *
   * @returns 权限列表
   */
  get permissions(): readonly string[] {
    return this.props.permissions;
  }

  /**
   * 获取约束列表
   *
   * @returns 约束列表
   */
  get constraints(): readonly string[] {
    return this.props.constraints;
  }

  /**
   * 获取元数据
   *
   * @returns 元数据
   */
  get metadata(): Record<string, unknown> {
    return this.props.metadata || {};
  }

  /**
   * 获取创建时间
   *
   * @returns 创建时间
   */
  get createdAt(): Date {
    return this.props.createdAt;
  }

  /**
   * 获取更新时间
   *
   * @returns 更新时间
   */
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * 检查是否为根部门
   *
   * @returns 是否为根部门
   */
  isRoot(): boolean {
    return this.type === DepartmentLevelType.ROOT;
  }

  /**
   * 检查是否为分支部门
   *
   * @returns 是否为分支部门
   */
  isBranch(): boolean {
    return this.type === DepartmentLevelType.BRANCH;
  }

  /**
   * 检查是否为叶子部门
   *
   * @returns 是否为叶子部门
   */
  isLeaf(): boolean {
    return this.type === DepartmentLevelType.LEAF;
  }

  /**
   * 检查是否为自定义部门
   *
   * @returns 是否为自定义部门
   */
  isCustom(): boolean {
    return this.type === DepartmentLevelType.CUSTOM;
  }

  /**
   * 检查是否允许父级类型
   *
   * @param parentType - 父级类型
   * @returns 是否允许父级类型
   */
  allowsParentType(parentType: DepartmentLevelType): boolean {
    return this.allowedParentTypes.includes(parentType);
  }

  /**
   * 检查是否允许子级类型
   *
   * @param childType - 子级类型
   * @returns 是否允许子级类型
   */
  allowsChildType(childType: DepartmentLevelType): boolean {
    return this.allowedChildTypes.includes(childType);
  }

  /**
   * 检查是否包含权限
   *
   * @param permission - 权限
   * @returns 是否包含权限
   */
  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  /**
   * 检查是否包含约束
   *
   * @param constraint - 约束
   * @returns 是否包含约束
   */
  hasConstraint(constraint: string): boolean {
    return this.constraints.includes(constraint);
  }

  /**
   * 检查是否超过最大子部门数
   *
   * @param currentChildren - 当前子部门数
   * @returns 是否超过最大子部门数
   */
  exceedsMaxChildren(currentChildren: number): boolean {
    return currentChildren > this.maxChildren;
  }

  /**
   * 检查是否超过最大深度
   *
   * @param currentDepth - 当前深度
   * @returns 是否超过最大深度
   */
  exceedsMaxDepth(currentDepth: number): boolean {
    return currentDepth > this.maxDepth;
  }

  /**
   * 获取剩余子部门数
   *
   * @param currentChildren - 当前子部门数
   * @returns 剩余子部门数
   */
  getRemainingChildren(currentChildren: number): number {
    return Math.max(0, this.maxChildren - currentChildren);
  }

  /**
   * 获取剩余深度
   *
   * @param currentDepth - 当前深度
   * @returns 剩余深度
   */
  getRemainingDepth(currentDepth: number): number {
    return Math.max(0, this.maxDepth - currentDepth);
  }

  /**
   * 获取权限数量
   *
   * @returns 权限数量
   */
  getPermissionCount(): number {
    return this.permissions.length;
  }

  /**
   * 获取约束数量
   *
   * @returns 约束数量
   */
  getConstraintCount(): number {
    return this.constraints.length;
  }

  /**
   * 获取配置摘要
   *
   * @returns 配置摘要
   */
  getSummary(): string {
    return `Level ${this.level} (${this.type}) - Max Children: ${this.maxChildren}, Max Depth: ${this.maxDepth}, Permissions: ${this.getPermissionCount()}, Constraints: ${this.getConstraintCount()}`;
  }

  /**
   * 获取配置详细信息
   *
   * @returns 配置详细信息
   */
  getDetails(): Record<string, unknown> {
    return {
      level: this.level,
      type: this.type,
      maxChildren: this.maxChildren,
      maxDepth: this.maxDepth,
      allowedParentTypes: this.allowedParentTypes,
      allowedChildTypes: this.allowedChildTypes,
      permissions: this.permissions,
      constraints: this.constraints,
      metadata: this.metadata,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      isRoot: this.isRoot(),
      isBranch: this.isBranch(),
      isLeaf: this.isLeaf(),
      isCustom: this.isCustom(),
      permissionCount: this.getPermissionCount(),
      constraintCount: this.getConstraintCount(),
    };
  }

  /**
   * 验证值对象的有效性
   */
  protected validate(): void {
    if (this.props.level < 1 || this.props.level > 7) {
      throw new Error("Level must be between 1 and 7");
    }
    if (this.props.maxChildren < 0) {
      throw new Error("Max children cannot be negative");
    }
    if (this.props.maxDepth < 1 || this.props.maxDepth > 7) {
      throw new Error("Max depth must be between 1 and 7");
    }
    if (this.props.allowedParentTypes.length === 0) {
      throw new Error("At least one allowed parent type is required");
    }
    if (this.props.allowedChildTypes.length === 0) {
      throw new Error("At least one allowed child type is required");
    }
    if (this.props.permissions.length === 0) {
      throw new Error("At least one permission is required");
    }
  }

  /**
   * 比较值对象的属性是否相等
   */
  protected arePropertiesEqual(other: DepartmentLevelConfig): boolean {
    return (
      this.props.level === other.props.level &&
      this.props.type === other.props.type
    );
  }
}
