/**
 * 组织实体
 *
 * @description 表示租户内的组织，支持多级组织架构和权限管理
 * @since 1.0.0
 */

import {
  BaseEntity,
  TenantId,
  OrganizationId,
  IPartialAuditInfo,
} from "@hl8/domain-kernel";

/**
 * 组织状态枚举
 */
export enum OrganizationStatusEnum {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

/**
 * 组织类型枚举
 */
export enum OrganizationTypeEnum {
  COMPANY = "COMPANY",
  DEPARTMENT = "DEPARTMENT",
  TEAM = "TEAM",
  PROJECT = "PROJECT",
}

/**
 * 组织实体
 *
 * 组织是租户内的基本组织单位，支持多级组织架构。
 * 组织包含基本信息、类型、状态等属性，并支持层级关系管理。
 *
 * @example
 * ```typescript
 * const organization = new Organization(
 *   new EntityId(),
 *   TenantId.create(),
 *   "Acme Engineering",
 *   OrganizationTypeEnum.DEPARTMENT,
 *   OrganizationStatusEnum.ACTIVE
 * );
 * ```
 */
export class Organization extends BaseEntity<OrganizationId> {
  private _name: string;
  private _type: OrganizationTypeEnum;
  private _status: OrganizationStatusEnum;
  private _description?: string;
  private _parentId?: OrganizationId;
  private _level: number;
  private _path: string;
  private _settings: Record<string, unknown>;
  private _metadata: Record<string, unknown>;

  constructor(
    id: OrganizationId,
    tenantId: TenantId,
    name: string,
    type: OrganizationTypeEnum,
    status: OrganizationStatusEnum,
    description?: string,
    parentId?: OrganizationId,
    level: number = 1,
    path: string = "",
    settings: Record<string, unknown> = {},
    metadata: Record<string, unknown> = {},
    isShared: boolean = false,
    sharingLevel?: SharingLevel,
    auditInfo?: IPartialAuditInfo,
  ) {
    super(
      id,
      tenantId,
      undefined,
      undefined,
      undefined,
      isShared,
      sharingLevel,
      auditInfo,
    );

    this.validateName(name);
    this.validateLevel(level);

    this._name = name;
    this._type = type;
    this._status = status;
    this._description = description;
    this._parentId = parentId;
    this._level = level;
    this._path = path || this.generatePath();
    this._settings = settings;
    this._metadata = metadata;
  }

  /**
   * 验证组织名称
   *
   * @param name - 组织名称
   * @throws {Error} 当名称无效时抛出错误
   */
  private validateName(name: string): void {
    if (!name || typeof name !== "string") {
      throw new Error("组织名称不能为空");
    }
    if (name.trim().length === 0) {
      throw new Error("组织名称不能只包含空白字符");
    }
    if (name.length > 100) {
      throw new Error("组织名称长度不能超过100个字符");
    }
  }

  /**
   * 验证组织级别
   *
   * @param level - 组织级别
   * @throws {Error} 当级别无效时抛出错误
   */
  private validateLevel(level: number): void {
    if (level < 1 || level > 7) {
      throw new Error("组织级别必须在1-7之间");
    }
  }

  /**
   * 生成组织路径
   *
   * @returns 组织路径
   */
  private generatePath(): string {
    if (this._parentId) {
      return `${this._parentId.toString()}/${this.id.toString()}`;
    }
    return this.id.toString();
  }

  /**
   * 获取组织名称
   *
   * @returns 组织名称
   */
  get name(): string {
    return this._name;
  }

  /**
   * 获取组织类型
   *
   * @returns 组织类型
   */
  get type(): OrganizationTypeEnum {
    return this._type;
  }

  /**
   * 获取组织状态
   *
   * @returns 组织状态
   */
  get status(): OrganizationStatusEnum {
    return this._status;
  }

  /**
   * 获取组织描述
   *
   * @returns 组织描述
   */
  get description(): string | undefined {
    return this._description;
  }

  /**
   * 获取父组织ID
   *
   * @returns 父组织ID
   */
  get parentId(): OrganizationId | undefined {
    return this._parentId;
  }

  /**
   * 获取组织级别
   *
   * @returns 组织级别
   */
  get level(): number {
    return this._level;
  }

  /**
   * 获取组织路径
   *
   * @returns 组织路径
   */
  get path(): string {
    return this._path;
  }

  /**
   * 获取组织设置
   *
   * @returns 组织设置
   */
  get settings(): Record<string, any> {
    return { ...this._settings };
  }

  /**
   * 获取组织元数据
   *
   * @returns 组织元数据
   */
  get metadata(): Record<string, any> {
    return { ...this._metadata };
  }

  /**
   * 更新组织名称
   *
   * @param name - 新的组织名称
   */
  updateName(name: string): void {
    this.validateName(name);
    this._name = name;
    this.updateTimestamp();
  }

  /**
   * 更新组织描述
   *
   * @param description - 新的组织描述
   */
  updateDescription(description: string): void {
    this._description = description;
    this.updateTimestamp();
  }

  /**
   * 更新组织状态
   *
   * @param status - 新的组织状态
   */
  updateStatus(status: OrganizationStatusEnum): void {
    this._status = status;
    this.updateTimestamp();
  }

  /**
   * 设置父组织
   *
   * @param parentId - 父组织ID
   */
  setParent(parentId: OrganizationId): void {
    if (this._level >= 7) {
      throw new Error("组织层级不能超过7级");
    }
    this._parentId = parentId;
    this._level = this._level + 1;
    this._path = this.generatePath();
    this.updateTimestamp();
  }

  /**
   * 移除父组织
   */
  removeParent(): void {
    this._parentId = undefined;
    this._level = 1;
    this._path = this.generatePath();
    this.updateTimestamp();
  }

  /**
   * 更新组织设置
   *
   * @param settings - 新的设置
   */
  updateSettings(settings: Record<string, any>): void {
    this._settings = { ...this._settings, ...settings };
    this.updateTimestamp();
  }

  /**
   * 更新组织元数据
   *
   * @param metadata - 新的元数据
   */
  updateMetadata(metadata: Record<string, any>): void {
    this._metadata = { ...this._metadata, ...metadata };
    this.updateTimestamp();
  }

  /**
   * 获取特定设置值
   *
   * @param key - 设置键
   * @returns 设置值
   */
  getSetting(key: string): unknown {
    return this._settings[key];
  }

  /**
   * 设置特定设置值
   *
   * @param key - 设置键
   * @param value - 设置值
   */
  setSetting(key: string, value: unknown): void {
    this._settings[key] = value;
    this.updateTimestamp();
  }

  /**
   * 获取特定元数据值
   *
   * @param key - 元数据键
   * @returns 元数据值
   */
  getMetadata(key: string): unknown {
    return this._metadata[key];
  }

  /**
   * 设置特定元数据值
   *
   * @param key - 元数据键
   * @param value - 元数据值
   */
  setMetadata(key: string, value: unknown): void {
    this._metadata[key] = value;
    this.updateTimestamp();
  }

  /**
   * 检查组织是否活跃
   *
   * @returns 是否活跃
   */
  isActive(): boolean {
    return this._status === OrganizationStatusEnum.ACTIVE;
  }

  /**
   * 检查是否为根组织
   *
   * @returns 是否为根组织
   */
  isRoot(): boolean {
    return this._parentId === undefined;
  }

  /**
   * 检查是否为叶子组织
   *
   * @returns 是否为叶子组织
   */
  isLeaf(): boolean {
    // 这里需要根据子组织数量判断，暂时返回false
    return false;
  }

  /**
   * 检查是否为最大层级
   *
   * @returns 是否为最大层级
   */
  isMaxLevel(): boolean {
    return this._level >= 7;
  }

  /**
   * 获取组织路径数组
   *
   * @returns 组织路径数组
   */
  getPathArray(): string[] {
    return this._path.split("/");
  }

  /**
   * 获取组织的字符串表示
   *
   * @returns 组织字符串表示
   */
  toString(): string {
    return `Organization(${this._name}, ${this._type}, ${this._status}, Level: ${this._level})`;
  }

  /**
   * 检查是否为有效的组织状态
   *
   * @param status - 要检查的状态
   * @returns 是否为有效状态
   */
  static isValidStatus(status: string): boolean {
    return Object.values(OrganizationStatusEnum).includes(
      status as OrganizationStatusEnum,
    );
  }

  /**
   * 检查是否为有效的组织类型
   *
   * @param type - 要检查的类型
   * @returns 是否为有效类型
   */
  static isValidType(type: string): boolean {
    return Object.values(OrganizationTypeEnum).includes(
      type as OrganizationTypeEnum,
    );
  }

  /**
   * 获取所有可用的组织状态
   *
   * @returns 所有组织状态列表
   */
  static getAllStatuses(): OrganizationStatusEnum[] {
    return Object.values(OrganizationStatusEnum);
  }

  /**
   * 获取所有可用的组织类型
   *
   * @returns 所有组织类型列表
   */
  static getAllTypes(): OrganizationTypeEnum[] {
    return Object.values(OrganizationTypeEnum);
  }
}
