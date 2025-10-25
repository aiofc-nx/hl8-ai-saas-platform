/**
 * 角色实体
 *
 * @description 表示系统角色，用于权限管理和访问控制
 * @since 1.0.0
 */

import {
  BaseEntity,
  EntityId,
  TenantId,
  OrganizationId,
  DepartmentId,
  UserId,
  IPartialAuditInfo,
} from "@hl8/domain-kernel";
import { RoleLevel } from "../value-objects/index.js";

/**
 * 角色状态枚举
 */
export enum RoleStatusEnum {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DEPRECATED = "DEPRECATED",
}

/**
 * 角色类型枚举
 */
export enum RoleTypeEnum {
  SYSTEM = "SYSTEM",
  CUSTOM = "CUSTOM",
  TEMPLATE = "TEMPLATE",
}

/**
 * 角色实体
 *
 * 角色是权限管理的基本单位，定义了用户可以执行的操作。
 * 角色包含名称、描述、级别、权限等信息，支持多级角色继承。
 *
 * @example
 * ```typescript
 * const role = new Role(
 *   new EntityId(),
 *   TenantId.create(),
 *   "Admin",
 *   "Administrator role with full access",
 *   new RoleLevel(RoleLevelEnum.ORGANIZATION),
 *   RoleTypeEnum.SYSTEM
 * );
 * ```
 */
export class Role extends BaseEntity<EntityId> {
  private _name: string;
  private _description: string;
  private _level: RoleLevel;
  private _type: RoleTypeEnum;
  private _status: RoleStatusEnum;
  private _permissions: string[];
  private _inheritedRoles: string[];
  private _isDefault: boolean;
  private _isSystem: boolean;
  private _settings: Record<string, unknown>;
  private _metadata: Record<string, unknown>;

  constructor(
    id: EntityId,
    tenantId: TenantId,
    name: string,
    description: string,
    level: RoleLevel,
    type: RoleTypeEnum,
    status: RoleStatusEnum = RoleStatusEnum.ACTIVE,
    permissions: string[] = [],
    inheritedRoles: string[] = [],
    isDefault: boolean = false,
    isSystem: boolean = false,
    settings: Record<string, unknown> = {},
    metadata: Record<string, unknown> = {},
    organizationId?: OrganizationId,
    departmentId?: DepartmentId,
    isShared: boolean = false,
    sharingLevel?: SharingLevel,
    auditInfo?: IPartialAuditInfo,
  ) {
    super(
      id,
      tenantId,
      organizationId,
      departmentId,
      undefined,
      isShared,
      sharingLevel,
      auditInfo,
    );

    this.validateName(name);
    this.validateDescription(description);

    this._name = name;
    this._description = description;
    this._level = level;
    this._type = type;
    this._status = status;
    this._permissions = [...permissions];
    this._inheritedRoles = [...inheritedRoles];
    this._isDefault = isDefault;
    this._isSystem = isSystem;
    this._settings = settings;
    this._metadata = metadata;
  }

  /**
   * 验证角色名称
   *
   * @param name - 角色名称
   * @throws {Error} 当名称无效时抛出错误
   */
  private validateName(name: string): void {
    if (!name || typeof name !== "string") {
      throw new Error("角色名称不能为空");
    }
    if (name.trim().length === 0) {
      throw new Error("角色名称不能只包含空白字符");
    }
    if (name.length > 100) {
      throw new Error("角色名称长度不能超过100个字符");
    }
  }

  /**
   * 验证角色描述
   *
   * @param description - 角色描述
   * @throws {Error} 当描述无效时抛出错误
   */
  private validateDescription(description: string): void {
    if (!description || typeof description !== "string") {
      throw new Error("角色描述不能为空");
    }
    if (description.trim().length === 0) {
      throw new Error("角色描述不能只包含空白字符");
    }
    if (description.length > 500) {
      throw new Error("角色描述长度不能超过500个字符");
    }
  }

  /**
   * 获取角色名称
   *
   * @returns 角色名称
   */
  get name(): string {
    return this._name;
  }

  /**
   * 获取角色描述
   *
   * @returns 角色描述
   */
  get description(): string {
    return this._description;
  }

  /**
   * 获取角色级别
   *
   * @returns 角色级别
   */
  get level(): RoleLevel {
    return this._level;
  }

  /**
   * 获取角色类型
   *
   * @returns 角色类型
   */
  get type(): RoleTypeEnum {
    return this._type;
  }

  /**
   * 获取角色状态
   *
   * @returns 角色状态
   */
  get status(): RoleStatusEnum {
    return this._status;
  }

  /**
   * 获取权限列表
   *
   * @returns 权限列表
   */
  get permissions(): readonly string[] {
    return [...this._permissions];
  }

  /**
   * 获取继承的角色列表
   *
   * @returns 继承的角色列表
   */
  get inheritedRoles(): readonly string[] {
    return [...this._inheritedRoles];
  }

  /**
   * 获取是否为默认角色
   *
   * @returns 是否为默认角色
   */
  get isDefault(): boolean {
    return this._isDefault;
  }

  /**
   * 获取是否为系统角色
   *
   * @returns 是否为系统角色
   */
  get isSystem(): boolean {
    return this._isSystem;
  }

  /**
   * 获取角色设置
   *
   * @returns 角色设置
   */
  get settings(): Record<string, any> {
    return { ...this._settings };
  }

  /**
   * 获取角色元数据
   *
   * @returns 角色元数据
   */
  get metadata(): Record<string, any> {
    return { ...this._metadata };
  }

  /**
   * 更新角色名称
   *
   * @param name - 新的角色名称
   */
  updateName(name: string): void {
    this.validateName(name);
    this._name = name;
    this.updateTimestamp();
  }

  /**
   * 更新角色描述
   *
   * @param description - 新的角色描述
   */
  updateDescription(description: string): void {
    this.validateDescription(description);
    this._description = description;
    this.updateTimestamp();
  }

  /**
   * 更新角色级别
   *
   * @param level - 新的角色级别
   */
  updateLevel(level: RoleLevel): void {
    this._level = level;
    this.updateTimestamp();
  }

  /**
   * 更新角色状态
   *
   * @param status - 新的角色状态
   */
  updateStatus(status: RoleStatusEnum): void {
    this._status = status;
    this.updateTimestamp();
  }

  /**
   * 添加权限
   *
   * @param permission - 权限名称
   */
  addPermission(permission: string): void {
    if (!this._permissions.includes(permission)) {
      this._permissions.push(permission);
      this.updateTimestamp();
    }
  }

  /**
   * 移除权限
   *
   * @param permission - 权限名称
   */
  removePermission(permission: string): void {
    const index = this._permissions.indexOf(permission);
    if (index > -1) {
      this._permissions.splice(index, 1);
      this.updateTimestamp();
    }
  }

  /**
   * 批量添加权限
   *
   * @param permissions - 权限列表
   */
  addPermissions(permissions: string[]): void {
    permissions.forEach((permission) => {
      if (!this._permissions.includes(permission)) {
        this._permissions.push(permission);
      }
    });
    this.updateTimestamp();
  }

  /**
   * 批量移除权限
   *
   * @param permissions - 权限列表
   */
  removePermissions(permissions: string[]): void {
    permissions.forEach((permission) => {
      const index = this._permissions.indexOf(permission);
      if (index > -1) {
        this._permissions.splice(index, 1);
      }
    });
    this.updateTimestamp();
  }

  /**
   * 设置权限列表
   *
   * @param permissions - 权限列表
   */
  setPermissions(permissions: string[]): void {
    this._permissions = [...permissions];
    this.updateTimestamp();
  }

  /**
   * 添加继承的角色
   *
   * @param roleId - 角色ID
   */
  addInheritedRole(roleId: string): void {
    if (!this._inheritedRoles.includes(roleId)) {
      this._inheritedRoles.push(roleId);
      this.updateTimestamp();
    }
  }

  /**
   * 移除继承的角色
   *
   * @param roleId - 角色ID
   */
  removeInheritedRole(roleId: string): void {
    const index = this._inheritedRoles.indexOf(roleId);
    if (index > -1) {
      this._inheritedRoles.splice(index, 1);
      this.updateTimestamp();
    }
  }

  /**
   * 设置继承的角色列表
   *
   * @param roleIds - 角色ID列表
   */
  setInheritedRoles(roleIds: string[]): void {
    this._inheritedRoles = [...roleIds];
    this.updateTimestamp();
  }

  /**
   * 设置是否为默认角色
   *
   * @param isDefault - 是否为默认角色
   */
  setDefault(isDefault: boolean): void {
    this._isDefault = isDefault;
    this.updateTimestamp();
  }

  /**
   * 更新角色设置
   *
   * @param settings - 新的设置
   */
  updateSettings(settings: Record<string, any>): void {
    this._settings = { ...this._settings, ...settings };
    this.updateTimestamp();
  }

  /**
   * 更新角色元数据
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
   * 检查是否有特定权限
   *
   * @param permission - 权限名称
   * @returns 是否有该权限
   */
  hasPermission(permission: string): boolean {
    return this._permissions.includes(permission);
  }

  /**
   * 检查是否继承特定角色
   *
   * @param roleId - 角色ID
   * @returns 是否继承该角色
   */
  inheritsRole(roleId: string): boolean {
    return this._inheritedRoles.includes(roleId);
  }

  /**
   * 检查角色是否活跃
   *
   * @returns 是否活跃
   */
  isActive(): boolean {
    return this._status === RoleStatusEnum.ACTIVE;
  }

  /**
   * 检查是否为系统角色
   *
   * @returns 是否为系统角色
   */
  isSystemRole(): boolean {
    return this._isSystem;
  }

  /**
   * 检查是否为自定义角色
   *
   * @returns 是否为自定义角色
   */
  isCustomRole(): boolean {
    return this._type === RoleTypeEnum.CUSTOM;
  }

  /**
   * 检查是否为模板角色
   *
   * @returns 是否为模板角色
   */
  isTemplateRole(): boolean {
    return this._type === RoleTypeEnum.TEMPLATE;
  }

  /**
   * 检查是否可以管理指定级别的角色
   *
   * @param otherLevel - 其他角色级别
   * @returns 是否可以管理
   */
  canManage(otherLevel: RoleLevel): boolean {
    return this._level.canManage(otherLevel);
  }

  /**
   * 检查是否可以继承指定级别的权限
   *
   * @param otherLevel - 其他角色级别
   * @returns 是否可以继承
   */
  canInheritFrom(otherLevel: RoleLevel): boolean {
    return this._level.canInheritFrom(otherLevel);
  }

  /**
   * 获取角色的字符串表示
   *
   * @returns 角色字符串表示
   */
  toString(): string {
    return `Role(${this._name}, ${this._level.toString()}, ${this._type}, ${this._status})`;
  }

  /**
   * 检查是否为有效的角色状态
   *
   * @param status - 要检查的状态
   * @returns 是否为有效状态
   */
  static isValidStatus(status: string): boolean {
    return Object.values(RoleStatusEnum).includes(status as RoleStatusEnum);
  }

  /**
   * 检查是否为有效的角色类型
   *
   * @param type - 要检查的类型
   * @returns 是否为有效类型
   */
  static isValidType(type: string): boolean {
    return Object.values(RoleTypeEnum).includes(type as RoleTypeEnum);
  }

  /**
   * 获取所有可用的角色状态
   *
   * @returns 所有角色状态列表
   */
  static getAllStatuses(): RoleStatusEnum[] {
    return Object.values(RoleStatusEnum);
  }

  /**
   * 获取所有可用的角色类型
   *
   * @returns 所有角色类型列表
   */
  static getAllTypes(): RoleTypeEnum[] {
    return Object.values(RoleTypeEnum);
  }
}
