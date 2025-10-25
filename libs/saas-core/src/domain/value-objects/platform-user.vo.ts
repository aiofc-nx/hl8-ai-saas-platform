/**
 * 平台用户值对象
 *
 * @description 表示平台用户，用于管理平台级别的用户身份
 * @since 1.0.0
 */

import { BaseValueObject } from "@hl8/domain-kernel";
import { UserId } from "./user-id.vo.js";
import { TenantId } from "@hl8/domain-kernel";

/**
 * 平台用户类型枚举
 */
export enum PlatformUserType {
  SUPER_ADMIN = "SUPER_ADMIN",
  PLATFORM_ADMIN = "PLATFORM_ADMIN",
  PLATFORM_OPERATOR = "PLATFORM_OPERATOR",
  PLATFORM_VIEWER = "PLATFORM_VIEWER",
  CUSTOM = "CUSTOM",
}

/**
 * 平台用户状态枚举
 */
export enum PlatformUserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  EXPIRED = "EXPIRED",
}

/**
 * 平台用户属性接口
 */
interface PlatformUserProps {
  readonly userId: UserId;
  readonly username: string;
  readonly email: string;
  readonly type: PlatformUserType;
  readonly status: PlatformUserStatus;
  readonly permissions: readonly string[];
  readonly roles: readonly string[];
  readonly assignedTenants: readonly TenantId[];
  readonly lastLoginAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly metadata?: Record<string, unknown>;
}

/**
 * 平台用户值对象
 *
 * 平台用户值对象表示平台用户，用于管理平台级别的用户身份。
 * 支持多种平台用户类型，包括超级管理员、平台管理员、平台操作员等。
 *
 * @example
 * ```typescript
 * const platformUser = PlatformUser.create(
 *   new UserId("user-123"),
 *   "admin",
 *   "admin@platform.com",
 *   PlatformUserType.SUPER_ADMIN,
 *   ["platform:admin", "tenant:create", "tenant:delete"],
 *   ["super_admin"],
 *   [new TenantId("tenant-1"), new TenantId("tenant-2")]
 * );
 * ```
 */
export class PlatformUser extends BaseValueObject {
  private constructor(private readonly props: PlatformUserProps) {
    super();
  }

  /**
   * 创建平台用户
   *
   * @param userId - 用户ID
   * @param username - 用户名
   * @param email - 邮箱
   * @param type - 用户类型
   * @param permissions - 权限列表
   * @param roles - 角色列表
   * @param assignedTenants - 分配的租户列表
   * @param metadata - 元数据
   * @returns 平台用户
   */
  public static create(
    userId: UserId,
    username: string,
    email: string,
    type: PlatformUserType,
    permissions: readonly string[],
    roles: readonly string[],
    assignedTenants: readonly TenantId[] = [],
    metadata?: Record<string, unknown>,
  ): PlatformUser {
    if (!username || !email || !type || !permissions || !roles) {
      throw new Error(
        "Username, email, type, permissions, and roles are required.",
      );
    }

    if (permissions.length === 0) {
      throw new Error("At least one permission is required.");
    }

    if (roles.length === 0) {
      throw new Error("At least one role is required.");
    }

    return new PlatformUser({
      userId,
      username: username.trim(),
      email: email.trim(),
      type,
      status: PlatformUserStatus.ACTIVE,
      permissions: [...permissions],
      roles: [...roles],
      assignedTenants: [...assignedTenants],
      metadata: metadata ? { ...metadata } : {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * 从现有用户创建新版本
   *
   * @param user - 现有用户
   * @param updates - 更新内容
   * @returns 新版本的平台用户
   */
  public static createFromUser(
    user: PlatformUser,
    updates: {
      readonly username?: string;
      readonly email?: string;
      readonly type?: PlatformUserType;
      readonly status?: PlatformUserStatus;
      readonly permissions?: readonly string[];
      readonly roles?: readonly string[];
      readonly assignedTenants?: readonly TenantId[];
      readonly metadata?: Record<string, unknown>;
    },
  ): PlatformUser {
    return new PlatformUser({
      userId: user.userId,
      username: updates.username ?? user.username,
      email: updates.email ?? user.email,
      type: updates.type ?? user.type,
      status: updates.status ?? user.status,
      permissions: updates.permissions ?? user.permissions,
      roles: updates.roles ?? user.roles,
      assignedTenants: updates.assignedTenants ?? user.assignedTenants,
      metadata: updates.metadata ?? user.metadata,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: new Date(),
    });
  }

  /**
   * 获取用户ID
   *
   * @returns 用户ID
   */
  get userId(): UserId {
    return this.props.userId;
  }

  /**
   * 获取用户名
   *
   * @returns 用户名
   */
  get username(): string {
    return this.props.username;
  }

  /**
   * 获取邮箱
   *
   * @returns 邮箱
   */
  get email(): string {
    return this.props.email;
  }

  /**
   * 获取用户类型
   *
   * @returns 用户类型
   */
  get type(): PlatformUserType {
    return this.props.type;
  }

  /**
   * 获取用户状态
   *
   * @returns 用户状态
   */
  get status(): PlatformUserStatus {
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
   * 获取角色列表
   *
   * @returns 角色列表
   */
  get roles(): readonly string[] {
    return this.props.roles;
  }

  /**
   * 获取分配的租户列表
   *
   * @returns 分配的租户列表
   */
  get assignedTenants(): readonly TenantId[] {
    return this.props.assignedTenants;
  }

  /**
   * 获取最后登录时间
   *
   * @returns 最后登录时间
   */
  get lastLoginAt(): Date | undefined {
    return this.props.lastLoginAt;
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
   * 获取元数据
   *
   * @returns 元数据
   */
  get metadata(): Record<string, unknown> {
    return this.props.metadata || {};
  }

  /**
   * 激活用户
   *
   * @returns 激活后的用户
   */
  public activate(): PlatformUser {
    if (
      this.status !== PlatformUserStatus.INACTIVE &&
      this.status !== PlatformUserStatus.PENDING_APPROVAL
    ) {
      throw new Error(
        "Only inactive or pending approval users can be activated.",
      );
    }

    return new PlatformUser({
      ...this.props,
      status: PlatformUserStatus.ACTIVE,
      updatedAt: new Date(),
    });
  }

  /**
   * 停用用户
   *
   * @returns 停用后的用户
   */
  public deactivate(): PlatformUser {
    if (this.status !== PlatformUserStatus.ACTIVE) {
      throw new Error("Only active users can be deactivated.");
    }

    return new PlatformUser({
      ...this.props,
      status: PlatformUserStatus.INACTIVE,
      updatedAt: new Date(),
    });
  }

  /**
   * 暂停用户
   *
   * @returns 暂停后的用户
   */
  public suspend(): PlatformUser {
    if (this.status !== PlatformUserStatus.ACTIVE) {
      throw new Error("Only active users can be suspended.");
    }

    return new PlatformUser({
      ...this.props,
      status: PlatformUserStatus.SUSPENDED,
      updatedAt: new Date(),
    });
  }

  /**
   * 更新最后登录时间
   *
   * @returns 更新后的用户
   */
  public updateLastLogin(): PlatformUser {
    return new PlatformUser({
      ...this.props,
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * 添加权限
   *
   * @param permission - 权限
   * @returns 添加权限后的用户
   */
  public addPermission(permission: string): PlatformUser {
    if (!permission || permission.trim() === "") {
      throw new Error("Permission must be a non-empty string.");
    }

    if (this.permissions.includes(permission)) {
      throw new Error("Permission already exists.");
    }

    return new PlatformUser({
      ...this.props,
      permissions: [...this.permissions, permission],
      updatedAt: new Date(),
    });
  }

  /**
   * 移除权限
   *
   * @param permission - 权限
   * @returns 移除权限后的用户
   */
  public removePermission(permission: string): PlatformUser {
    if (!this.permissions.includes(permission)) {
      throw new Error("Permission does not exist.");
    }

    return new PlatformUser({
      ...this.props,
      permissions: this.permissions.filter((p) => p !== permission),
      updatedAt: new Date(),
    });
  }

  /**
   * 添加角色
   *
   * @param role - 角色
   * @returns 添加角色后的用户
   */
  public addRole(role: string): PlatformUser {
    if (!role || role.trim() === "") {
      throw new Error("Role must be a non-empty string.");
    }

    if (this.roles.includes(role)) {
      throw new Error("Role already exists.");
    }

    return new PlatformUser({
      ...this.props,
      roles: [...this.roles, role],
      updatedAt: new Date(),
    });
  }

  /**
   * 移除角色
   *
   * @param role - 角色
   * @returns 移除角色后的用户
   */
  public removeRole(role: string): PlatformUser {
    if (!this.roles.includes(role)) {
      throw new Error("Role does not exist.");
    }

    return new PlatformUser({
      ...this.props,
      roles: this.roles.filter((r) => r !== role),
      updatedAt: new Date(),
    });
  }

  /**
   * 分配租户
   *
   * @param tenantId - 租户ID
   * @returns 分配租户后的用户
   */
  public assignTenant(tenantId: TenantId): PlatformUser {
    if (this.assignedTenants.some((t) => t.equals(tenantId))) {
      throw new Error("Tenant already assigned.");
    }

    return new PlatformUser({
      ...this.props,
      assignedTenants: [...this.assignedTenants, tenantId],
      updatedAt: new Date(),
    });
  }

  /**
   * 取消分配租户
   *
   * @param tenantId - 租户ID
   * @returns 取消分配租户后的用户
   */
  public unassignTenant(tenantId: TenantId): PlatformUser {
    if (!this.assignedTenants.some((t) => t.equals(tenantId))) {
      throw new Error("Tenant not assigned.");
    }

    return new PlatformUser({
      ...this.props,
      assignedTenants: this.assignedTenants.filter((t) => !t.equals(tenantId)),
      updatedAt: new Date(),
    });
  }

  /**
   * 检查是否为超级管理员
   *
   * @returns 是否为超级管理员
   */
  public isSuperAdmin(): boolean {
    return this.type === PlatformUserType.SUPER_ADMIN;
  }

  /**
   * 检查是否为平台管理员
   *
   * @returns 是否为平台管理员
   */
  public isPlatformAdmin(): boolean {
    return this.type === PlatformUserType.PLATFORM_ADMIN;
  }

  /**
   * 检查是否为活跃状态
   *
   * @returns 是否为活跃状态
   */
  public isActive(): boolean {
    return this.status === PlatformUserStatus.ACTIVE;
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
   * 检查是否包含角色
   *
   * @param role - 角色
   * @returns 是否包含角色
   */
  public hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  /**
   * 检查是否分配了租户
   *
   * @param tenantId - 租户ID
   * @returns 是否分配了租户
   */
  public hasAssignedTenant(tenantId: TenantId): boolean {
    return this.assignedTenants.some((t) => t.equals(tenantId));
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
   * 获取角色数量
   *
   * @returns 角色数量
   */
  public getRoleCount(): number {
    return this.roles.length;
  }

  /**
   * 获取分配的租户数量
   *
   * @returns 分配的租户数量
   */
  public getAssignedTenantCount(): number {
    return this.assignedTenants.length;
  }

  /**
   * 获取用户摘要
   *
   * @returns 用户摘要
   */
  public getSummary(): string {
    return `${this.username} (${this.type}) - ${this.getPermissionCount()} permissions, ${this.getRoleCount()} roles, ${this.getAssignedTenantCount()} tenants, Status: ${this.status}`;
  }

  /**
   * 获取用户详细信息
   *
   * @returns 用户详细信息
   */
  public getDetails(): Record<string, unknown> {
    return {
      userId: this.userId.value,
      username: this.username,
      email: this.email,
      type: this.type,
      status: this.status,
      permissions: this.permissions,
      roles: this.roles,
      assignedTenants: this.assignedTenants.map((t) => t.value),
      lastLoginAt: this.lastLoginAt?.toISOString(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      isSuperAdmin: this.isSuperAdmin(),
      isPlatformAdmin: this.isPlatformAdmin(),
      isActive: this.isActive(),
      permissionCount: this.getPermissionCount(),
      roleCount: this.getRoleCount(),
      assignedTenantCount: this.getAssignedTenantCount(),
      metadata: this.metadata,
    };
  }

  /**
   * 验证值对象的有效性
   */
  protected validate(): void {
    if (
      !this.props.userId ||
      !this.props.username ||
      !this.props.email ||
      !this.props.type
    ) {
      throw new Error(
        "Platform user validation failed: missing required properties",
      );
    }
    if (this.props.permissions.length === 0) {
      throw new Error(
        "Platform user validation failed: permissions cannot be empty",
      );
    }
    if (this.props.roles.length === 0) {
      throw new Error("Platform user validation failed: roles cannot be empty");
    }
  }

  /**
   * 比较值对象的属性是否相等
   */
  protected arePropertiesEqual(other: PlatformUser): boolean {
    return (
      this.props.userId.equals(other.props.userId) &&
      this.props.username === other.props.username &&
      this.props.email === other.props.email
    );
  }
}
