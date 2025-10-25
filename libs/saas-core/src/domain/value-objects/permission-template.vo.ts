/**
 * 权限模板值对象
 *
 * @description 表示权限模板，用于定义和管理权限集合
 * @since 1.0.0
 */

import { BaseValueObject } from "@hl8/domain-kernel";

/**
 * 权限模板类型枚举
 */
export enum PermissionTemplateType {
  ROLE_BASED = "ROLE_BASED",
  RESOURCE_BASED = "RESOURCE_BASED",
  FUNCTION_BASED = "FUNCTION_BASED",
  HIERARCHY_BASED = "HIERARCHY_BASED",
  CUSTOM = "CUSTOM",
}

/**
 * 权限模板状态枚举
 */
export enum PermissionTemplateStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  DEPRECATED = "DEPRECATED",
  ARCHIVED = "ARCHIVED",
}

/**
 * 权限模板属性接口
 */
interface PermissionTemplateProps {
  readonly name: string;
  readonly description: string;
  readonly type: PermissionTemplateType;
  readonly status: PermissionTemplateStatus;
  readonly permissions: readonly string[];
  readonly conditions?: readonly string[];
  readonly metadata?: Record<string, unknown>;
  readonly version: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * 权限模板值对象
 *
 * 权限模板值对象表示权限模板，用于定义和管理权限集合。
 * 支持多种权限模板类型，包括基于角色、资源、功能和层次结构的权限模板。
 *
 * @example
 * ```typescript
 * const template = PermissionTemplate.create(
 *   "Admin Template",
 *   "Administrator permissions template",
 *   PermissionTemplateType.ROLE_BASED,
 *   ["user:create", "user:read", "user:update", "user:delete"],
 *   ["tenant:admin"],
 *   { category: "administration" }
 * );
 * ```
 */
export class PermissionTemplate extends BaseValueObject {
  private constructor(private readonly props: PermissionTemplateProps) {
    super();
  }

  /**
   * 创建权限模板
   *
   * @param name - 模板名称
   * @param description - 模板描述
   * @param type - 模板类型
   * @param permissions - 权限列表
   * @param conditions - 条件列表
   * @param metadata - 元数据
   * @returns 权限模板
   */
  public static create(
    name: string,
    description: string,
    type: PermissionTemplateType,
    permissions: readonly string[],
    conditions?: readonly string[],
    metadata?: Record<string, unknown>,
  ): PermissionTemplate {
    if (
      !name ||
      !description ||
      !type ||
      !permissions ||
      permissions.length === 0
    ) {
      throw new Error("Name, description, type, and permissions are required.");
    }

    if (permissions.some((p) => !p || p.trim() === "")) {
      throw new Error("All permissions must be non-empty strings.");
    }

    return new PermissionTemplate({
      name: name.trim(),
      description: description.trim(),
      type,
      status: PermissionTemplateStatus.DRAFT,
      permissions: [...permissions],
      conditions: conditions ? [...conditions] : [],
      metadata: metadata ? { ...metadata } : {},
      version: "1.0.0",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * 从现有模板创建新版本
   *
   * @param template - 现有模板
   * @param updates - 更新内容
   * @returns 新版本的权限模板
   */
  public static createFromTemplate(
    template: PermissionTemplate,
    updates: {
      readonly name?: string;
      readonly description?: string;
      readonly permissions?: readonly string[];
      readonly conditions?: readonly string[];
      readonly metadata?: Record<string, unknown>;
    },
  ): PermissionTemplate {
    const newVersion = this.incrementVersion(template.version);
    return new PermissionTemplate({
      name: updates.name ?? template.name,
      description: updates.description ?? template.description,
      type: template.type,
      status: PermissionTemplateStatus.DRAFT,
      permissions: updates.permissions ?? template.permissions,
      conditions: updates.conditions ?? template.conditions,
      metadata: updates.metadata ?? template.metadata,
      version: newVersion,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * 获取模板名称
   *
   * @returns 模板名称
   */
  get name(): string {
    return this.props.name;
  }

  /**
   * 获取模板描述
   *
   * @returns 模板描述
   */
  get description(): string {
    return this.props.description;
  }

  /**
   * 获取模板类型
   *
   * @returns 模板类型
   */
  get type(): PermissionTemplateType {
    return this.props.type;
  }

  /**
   * 获取模板状态
   *
   * @returns 模板状态
   */
  get status(): PermissionTemplateStatus {
    return this.props.status;
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
   * 获取条件列表
   *
   * @returns 条件列表
   */
  get conditions(): readonly string[] {
    return this.props.conditions || [];
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
   * 获取版本
   *
   * @returns 版本
   */
  get version(): string {
    return this.props.version;
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
   * 激活模板
   *
   * @returns 激活后的模板
   */
  public activate(): PermissionTemplate {
    if (this.status !== PermissionTemplateStatus.DRAFT) {
      throw new Error("Only draft templates can be activated.");
    }

    return new PermissionTemplate({
      ...this.props,
      status: PermissionTemplateStatus.ACTIVE,
      updatedAt: new Date(),
    });
  }

  /**
   * 弃用模板
   *
   * @returns 弃用后的模板
   */
  public deprecate(): PermissionTemplate {
    if (this.status !== PermissionTemplateStatus.ACTIVE) {
      throw new Error("Only active templates can be deprecated.");
    }

    return new PermissionTemplate({
      ...this.props,
      status: PermissionTemplateStatus.DEPRECATED,
      updatedAt: new Date(),
    });
  }

  /**
   * 归档模板
   *
   * @returns 归档后的模板
   */
  public archive(): PermissionTemplate {
    if (this.status === PermissionTemplateStatus.ARCHIVED) {
      throw new Error("Template is already archived.");
    }

    return new PermissionTemplate({
      ...this.props,
      status: PermissionTemplateStatus.ARCHIVED,
      updatedAt: new Date(),
    });
  }

  /**
   * 添加权限
   *
   * @param permission - 权限
   * @returns 添加权限后的模板
   */
  public addPermission(permission: string): PermissionTemplate {
    if (!permission || permission.trim() === "") {
      throw new Error("Permission must be a non-empty string.");
    }

    if (this.permissions.includes(permission)) {
      throw new Error("Permission already exists in template.");
    }

    return new PermissionTemplate({
      ...this.props,
      permissions: [...this.permissions, permission],
      updatedAt: new Date(),
    });
  }

  /**
   * 移除权限
   *
   * @param permission - 权限
   * @returns 移除权限后的模板
   */
  public removePermission(permission: string): PermissionTemplate {
    if (!this.permissions.includes(permission)) {
      throw new Error("Permission does not exist in template.");
    }

    return new PermissionTemplate({
      ...this.props,
      permissions: this.permissions.filter((p) => p !== permission),
      updatedAt: new Date(),
    });
  }

  /**
   * 添加条件
   *
   * @param condition - 条件
   * @returns 添加条件后的模板
   */
  public addCondition(condition: string): PermissionTemplate {
    if (!condition || condition.trim() === "") {
      throw new Error("Condition must be a non-empty string.");
    }

    if (this.conditions.includes(condition)) {
      throw new Error("Condition already exists in template.");
    }

    return new PermissionTemplate({
      ...this.props,
      conditions: [...this.conditions, condition],
      updatedAt: new Date(),
    });
  }

  /**
   * 移除条件
   *
   * @param condition - 条件
   * @returns 移除条件后的模板
   */
  public removeCondition(condition: string): PermissionTemplate {
    if (!this.conditions.includes(condition)) {
      throw new Error("Condition does not exist in template.");
    }

    return new PermissionTemplate({
      ...this.props,
      conditions: this.conditions.filter((c) => c !== condition),
      updatedAt: new Date(),
    });
  }

  /**
   * 更新元数据
   *
   * @param metadata - 元数据
   * @returns 更新元数据后的模板
   */
  public updateMetadata(metadata: Record<string, unknown>): PermissionTemplate {
    return new PermissionTemplate({
      ...this.props,
      metadata: { ...this.metadata, ...metadata },
      updatedAt: new Date(),
    });
  }

  /**
   * 检查是否包含权限
   *
   * @param permission - 权限
   * @returns 是否包含权限
   */
  public hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  /**
   * 检查是否包含条件
   *
   * @param condition - 条件
   * @returns 是否包含条件
   */
  public hasCondition(condition: string): boolean {
    return this.conditions.includes(condition);
  }

  /**
   * 检查是否为活跃状态
   *
   * @returns 是否为活跃状态
   */
  public isActive(): boolean {
    return this.status === PermissionTemplateStatus.ACTIVE;
  }

  /**
   * 检查是否为草稿状态
   *
   * @returns 是否为草稿状态
   */
  public isDraft(): boolean {
    return this.status === PermissionTemplateStatus.DRAFT;
  }

  /**
   * 检查是否已弃用
   *
   * @returns 是否已弃用
   */
  public isDeprecated(): boolean {
    return this.status === PermissionTemplateStatus.DEPRECATED;
  }

  /**
   * 检查是否已归档
   *
   * @returns 是否已归档
   */
  public isArchived(): boolean {
    return this.status === PermissionTemplateStatus.ARCHIVED;
  }

  /**
   * 获取权限数量
   *
   * @returns 权限数量
   */
  public getPermissionCount(): number {
    return this.permissions.length;
  }

  /**
   * 获取条件数量
   *
   * @returns 条件数量
   */
  public getConditionCount(): number {
    return this.conditions.length;
  }

  /**
   * 获取模板摘要
   *
   * @returns 模板摘要
   */
  public getSummary(): string {
    return `${this.name} (${this.type}) - ${this.getPermissionCount()} permissions, ${this.getConditionCount()} conditions, Status: ${this.status}`;
  }

  /**
   * 获取模板详细信息
   *
   * @returns 模板详细信息
   */
  public getDetails(): Record<string, unknown> {
    return {
      name: this.name,
      description: this.description,
      type: this.type,
      status: this.status,
      permissions: this.permissions,
      conditions: this.conditions,
      metadata: this.metadata,
      version: this.version,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      permissionCount: this.getPermissionCount(),
      conditionCount: this.getConditionCount(),
      isActive: this.isActive(),
      isDraft: this.isDraft(),
      isDeprecated: this.isDeprecated(),
      isArchived: this.isArchived(),
    };
  }

  /**
   * 验证值对象的有效性
   */
  protected validate(): void {
    if (
      !this.props.name ||
      !this.props.description ||
      !this.props.type ||
      !this.props.permissions
    ) {
      throw new Error(
        "Permission template validation failed: missing required properties",
      );
    }
    if (this.props.permissions.length === 0) {
      throw new Error(
        "Permission template validation failed: permissions cannot be empty",
      );
    }
  }

  /**
   * 比较值对象的属性是否相等
   */
  protected arePropertiesEqual(other: PermissionTemplate): boolean {
    return (
      this.props.name === other.props.name &&
      this.props.type === other.props.type &&
      this.props.version === other.props.version
    );
  }

  /**
   * 递增版本号
   *
   * @param version - 当前版本
   * @returns 新版本
   */
  private static incrementVersion(version: string): string {
    const parts = version.split(".");
    if (parts.length !== 3) {
      return "1.0.0";
    }

    const major = parseInt(parts[0], 10);
    const minor = parseInt(parts[1], 10);
    const patch = parseInt(parts[2], 10);

    if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
      return "1.0.0";
    }

    return `${major}.${minor}.${patch + 1}`;
  }
}
