/**
 * 用户实体
 *
 * @description 表示系统用户，包含用户基本信息和权限管理
 * @since 1.0.0
 */

import {
  BaseEntity,
  AuditInfo,
  EntityId,
  IPartialAuditInfo,
  SharingLevel,
  TenantId,
  OrganizationId,
  DepartmentId,
  UserId,
} from "@hl8/domain-kernel";

/**
 * 用户状态枚举
 */
export enum UserStatusEnum {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
  LOCKED = "LOCKED",
}

/**
 * 用户类型枚举
 */
export enum UserTypeEnum {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  USER = "USER",
  GUEST = "GUEST",
  SYSTEM = "SYSTEM",
}

/**
 * 用户实体
 *
 * 用户是系统的基本使用单位，包含用户基本信息、状态和权限。
 * 用户支持多租户架构，可以属于不同的组织和部门。
 *
 * @example
 * ```typescript
 * const user = new User(
 *   new EntityId(),
 *   TenantId.create(),
 *   "john.doe@example.com",
 *   "John Doe",
 *   UserTypeEnum.USER,
 *   UserStatusEnum.ACTIVE
 * );
 * ```
 */
export class User extends BaseEntity<UserId> {
  private _email: string;
  private _username: string;
  private _displayName: string;
  private _type: UserTypeEnum;
  private _status: UserStatusEnum;
  private _firstName?: string;
  private _lastName?: string;
  private _phone?: string;
  private _avatar?: string;
  private _timezone?: string;
  private _language?: string;
  private _lastLoginAt?: Date;
  private _passwordHash?: string;
  private _emailVerified: boolean;
  private _phoneVerified: boolean;
  private _twoFactorEnabled: boolean;
  private _roles: string[];
  private _permissions: string[];
  private _settings: Record<string, any>;
  private _metadata: Record<string, any>;

  constructor(
    id: UserId,
    tenantId: TenantId,
    email: string,
    username: string,
    displayName: string,
    type: UserTypeEnum,
    status: UserStatusEnum,
    firstName?: string,
    lastName?: string,
    phone?: string,
    avatar?: string,
    timezone?: string,
    language?: string,
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

    this.validateEmail(email);
    this.validateUsername(username);
    this.validateDisplayName(displayName);

    this._email = email;
    this._username = username;
    this._displayName = displayName;
    this._type = type;
    this._status = status;
    this._firstName = firstName;
    this._lastName = lastName;
    this._phone = phone;
    this._avatar = avatar;
    this._timezone = timezone;
    this._language = language;
    this._emailVerified = false;
    this._phoneVerified = false;
    this._twoFactorEnabled = false;
    this._roles = [];
    this._permissions = [];
    this._settings = {};
    this._metadata = {};
  }

  /**
   * 验证邮箱格式
   *
   * @param email - 邮箱地址
   * @throws {Error} 当邮箱格式无效时抛出错误
   */
  private validateEmail(email: string): void {
    if (!email || typeof email !== "string") {
      throw new Error("邮箱地址不能为空");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("邮箱地址格式无效");
    }
  }

  /**
   * 验证用户名格式
   *
   * @param username - 用户名
   * @throws {Error} 当用户名格式无效时抛出错误
   */
  private validateUsername(username: string): void {
    if (!username || typeof username !== "string") {
      throw new Error("用户名不能为空");
    }
    if (username.length < 3 || username.length > 50) {
      throw new Error("用户名长度必须在3-50个字符之间");
    }
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      throw new Error("用户名只能包含字母、数字、下划线和连字符");
    }
  }

  /**
   * 验证显示名称格式
   *
   * @param displayName - 显示名称
   * @throws {Error} 当显示名称格式无效时抛出错误
   */
  private validateDisplayName(displayName: string): void {
    if (!displayName || typeof displayName !== "string") {
      throw new Error("显示名称不能为空");
    }
    if (displayName.trim().length === 0) {
      throw new Error("显示名称不能只包含空白字符");
    }
    if (displayName.length > 100) {
      throw new Error("显示名称长度不能超过100个字符");
    }
  }

  /**
   * 获取邮箱地址
   *
   * @returns 邮箱地址
   */
  get email(): string {
    return this._email;
  }

  /**
   * 获取用户名
   *
   * @returns 用户名
   */
  get username(): string {
    return this._username;
  }

  /**
   * 获取显示名称
   *
   * @returns 显示名称
   */
  get displayName(): string {
    return this._displayName;
  }

  /**
   * 获取用户类型
   *
   * @returns 用户类型
   */
  get type(): UserTypeEnum {
    return this._type;
  }

  /**
   * 获取用户状态
   *
   * @returns 用户状态
   */
  get status(): UserStatusEnum {
    return this._status;
  }

  /**
   * 获取名字
   *
   * @returns 名字
   */
  get firstName(): string | undefined {
    return this._firstName;
  }

  /**
   * 获取姓氏
   *
   * @returns 姓氏
   */
  get lastName(): string | undefined {
    return this._lastName;
  }

  /**
   * 获取电话号码
   *
   * @returns 电话号码
   */
  get phone(): string | undefined {
    return this._phone;
  }

  /**
   * 获取头像URL
   *
   * @returns 头像URL
   */
  get avatar(): string | undefined {
    return this._avatar;
  }

  /**
   * 获取时区
   *
   * @returns 时区
   */
  get timezone(): string | undefined {
    return this._timezone;
  }

  /**
   * 获取语言
   *
   * @returns 语言
   */
  get language(): string | undefined {
    return this._language;
  }

  /**
   * 获取最后登录时间
   *
   * @returns 最后登录时间
   */
  get lastLoginAt(): Date | undefined {
    return this._lastLoginAt;
  }

  /**
   * 获取邮箱是否已验证
   *
   * @returns 邮箱是否已验证
   */
  get emailVerified(): boolean {
    return this._emailVerified;
  }

  /**
   * 获取手机是否已验证
   *
   * @returns 手机是否已验证
   */
  get phoneVerified(): boolean {
    return this._phoneVerified;
  }

  /**
   * 获取是否启用双因子认证
   *
   * @returns 是否启用双因子认证
   */
  get twoFactorEnabled(): boolean {
    return this._twoFactorEnabled;
  }

  /**
   * 获取用户角色列表
   *
   * @returns 用户角色列表
   */
  get roles(): readonly string[] {
    return [...this._roles];
  }

  /**
   * 获取用户权限列表
   *
   * @returns 用户权限列表
   */
  get permissions(): readonly string[] {
    return [...this._permissions];
  }

  /**
   * 获取用户设置
   *
   * @returns 用户设置
   */
  get settings(): Record<string, any> {
    return { ...this._settings };
  }

  /**
   * 获取用户元数据
   *
   * @returns 用户元数据
   */
  get metadata(): Record<string, any> {
    return { ...this._metadata };
  }

  /**
   * 更新邮箱地址
   *
   * @param email - 新的邮箱地址
   */
  updateEmail(email: string): void {
    this.validateEmail(email);
    this._email = email;
    this._emailVerified = false;
    this.updateTimestamp();
  }

  /**
   * 更新用户名
   *
   * @param username - 新的用户名
   */
  updateUsername(username: string): void {
    this.validateUsername(username);
    this._username = username;
    this.updateTimestamp();
  }

  /**
   * 更新显示名称
   *
   * @param displayName - 新的显示名称
   */
  updateDisplayName(displayName: string): void {
    this.validateDisplayName(displayName);
    this._displayName = displayName;
    this.updateTimestamp();
  }

  /**
   * 更新个人信息
   *
   * @param firstName - 名字
   * @param lastName - 姓氏
   * @param phone - 电话号码
   */
  updatePersonalInfo(
    firstName?: string,
    lastName?: string,
    phone?: string,
  ): void {
    this._firstName = firstName;
    this._lastName = lastName;
    this._phone = phone;
    this.updateTimestamp();
  }

  /**
   * 更新头像
   *
   * @param avatar - 头像URL
   */
  updateAvatar(avatar: string): void {
    this._avatar = avatar;
    this.updateTimestamp();
  }

  /**
   * 更新偏好设置
   *
   * @param timezone - 时区
   * @param language - 语言
   */
  updatePreferences(timezone?: string, language?: string): void {
    this._timezone = timezone;
    this._language = language;
    this.updateTimestamp();
  }

  /**
   * 更新用户状态
   *
   * @param status - 新的用户状态
   */
  updateStatus(status: UserStatusEnum): void {
    this._status = status;
    this.updateTimestamp();
  }

  /**
   * 设置密码哈希
   *
   * @param passwordHash - 密码哈希
   */
  setPasswordHash(passwordHash: string): void {
    this._passwordHash = passwordHash;
    this.updateTimestamp();
  }

  /**
   * 验证邮箱
   */
  verifyEmail(): void {
    this._emailVerified = true;
    this.updateTimestamp();
  }

  /**
   * 验证手机
   */
  verifyPhone(): void {
    this._phoneVerified = true;
    this.updateTimestamp();
  }

  /**
   * 启用双因子认证
   */
  enableTwoFactor(): void {
    this._twoFactorEnabled = true;
    this.updateTimestamp();
  }

  /**
   * 禁用双因子认证
   */
  disableTwoFactor(): void {
    this._twoFactorEnabled = false;
    this.updateTimestamp();
  }

  /**
   * 更新最后登录时间
   */
  updateLastLogin(): void {
    this._lastLoginAt = new Date();
    this.updateTimestamp();
  }

  /**
   * 添加角色
   *
   * @param role - 角色名称
   */
  addRole(role: string): void {
    if (!this._roles.includes(role)) {
      this._roles.push(role);
      this.updateTimestamp();
    }
  }

  /**
   * 移除角色
   *
   * @param role - 角色名称
   */
  removeRole(role: string): void {
    const index = this._roles.indexOf(role);
    if (index > -1) {
      this._roles.splice(index, 1);
      this.updateTimestamp();
    }
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
   * 检查是否有特定角色
   *
   * @param role - 角色名称
   * @returns 是否有该角色
   */
  hasRole(role: string): boolean {
    return this._roles.includes(role);
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
   * 检查用户是否活跃
   *
   * @returns 是否活跃
   */
  isActive(): boolean {
    return this._status === UserStatusEnum.ACTIVE;
  }

  /**
   * 检查是否为管理员
   *
   * @returns 是否为管理员
   */
  isAdmin(): boolean {
    return this._type === UserTypeEnum.ADMIN;
  }

  /**
   * 检查是否为系统用户
   *
   * @returns 是否为系统用户
   */
  isSystem(): boolean {
    return this._type === UserTypeEnum.SYSTEM;
  }

  /**
   * 获取用户的字符串表示
   *
   * @returns 用户字符串表示
   */
  toString(): string {
    return `User(${this._username}, ${this._email}, ${this._type}, ${this._status})`;
  }

  /**
   * 检查是否为有效的用户状态
   *
   * @param status - 要检查的状态
   * @returns 是否为有效状态
   */
  static isValidStatus(status: string): boolean {
    return Object.values(UserStatusEnum).includes(status as UserStatusEnum);
  }

  /**
   * 检查是否为有效的用户类型
   *
   * @param type - 要检查的类型
   * @returns 是否为有效类型
   */
  static isValidType(type: string): boolean {
    return Object.values(UserTypeEnum).includes(type as UserTypeEnum);
  }

  /**
   * 获取所有可用的用户状态
   *
   * @returns 所有用户状态列表
   */
  static getAllStatuses(): UserStatusEnum[] {
    return Object.values(UserStatusEnum);
  }

  /**
   * 获取所有可用的用户类型
   *
   * @returns 所有用户类型列表
   */
  static getAllTypes(): UserTypeEnum[] {
    return Object.values(UserTypeEnum);
  }
}
