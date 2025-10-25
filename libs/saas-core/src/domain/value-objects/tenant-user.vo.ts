/**
 * 租户用户值对象
 *
 * @description 表示租户用户，用于管理租户级别的用户身份
 * @since 1.0.0
 */

import { BaseValueObject } from "@hl8/domain-kernel";
import { UserId } from "./user-id.vo.js";
import { TenantId } from "@hl8/domain-kernel";
import { OrganizationId } from "./organization-id.vo.js";
import { DepartmentId } from "./department-id.vo.js";

/**
 * 租户用户类型枚举
 */
export enum TenantUserType {
  TENANT_ADMIN = "TENANT_ADMIN",
  ORGANIZATION_ADMIN = "ORGANIZATION_ADMIN",
  DEPARTMENT_ADMIN = "DEPARTMENT_ADMIN",
  REGULAR_USER = "REGULAR_USER",
  GUEST_USER = "GUEST_USER",
  CUSTOM = "CUSTOM",
}

/**
 * 租户用户状态枚举
 */
export enum TenantUserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  EXPIRED = "EXPIRED",
}

/**
 * 租户用户属性接口
 */
interface TenantUserProps {
  readonly userId: UserId;
  readonly tenantId: TenantId;
  readonly username: string;
  readonly email: string;
  readonly type: TenantUserType;
  readonly status: TenantUserStatus;
  readonly permissions: readonly string[];
  readonly roles: readonly string[];
  readonly assignedOrganizations: readonly OrganizationId[];
  readonly assignedDepartments: readonly DepartmentId[];
  readonly lastLoginAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly metadata?: Record<string, unknown>;
}

/**
 * 租户用户值对象
 *
 * 租户用户值对象表示租户用户，用于管理租户级别的用户身份。
 * 支持多种租户用户类型，包括租户管理员、组织管理员、部门管理员等。
 *
 * @example
 * ```typescript
 * const tenantUser = TenantUser.create(
 *   UserId.create("user-123"),
 *   TenantId.create("tenant-456"),
 *   "john.doe",
 *   "john.doe@company.com",
 *   TenantUserType.REGULAR_USER,
 *   ["user:read", "user:update"],
 *   ["user"],
 *   [OrganizationId.create("org-1")],
 *   [DepartmentId.create("dept-1")]
 * );
 * ```
 */
export class TenantUser extends BaseValueObject {
  private constructor(private readonly props: TenantUserProps) {
    super();
  }

  /**
   * 创建租户用户
   *
   * @param userId - 用户ID
   * @param tenantId - 租户ID
   * @param username - 用户名
   * @param email - 邮箱
   * @param type - 用户类型
   * @param permissions - 权限列表
   * @param roles - 角色列表
   * @param assignedOrganizations - 分配的组织列表
   * @param assignedDepartments - 分配的部门列表
   * @param metadata - 元数据
   * @returns 租户用户
   */
  public static create(
    userId: UserId,
    tenantId: TenantId,
    username: string,
    email: string,
    type: TenantUserType,
    permissions: readonly string[],
    roles: readonly string[],
    assignedOrganizations: readonly OrganizationId[] = [],
    assignedDepartments: readonly DepartmentId[] = [],
    metadata?: Record<string, unknown>,
  ): TenantUser {
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

    return new TenantUser({
      userId,
      tenantId,
      username: username.trim(),
      email: email.trim(),
      type,
      status: TenantUserStatus.ACTIVE,
      permissions: [...permissions],
      roles: [...roles],
      assignedOrganizations: [...assignedOrganizations],
      assignedDepartments: [...assignedDepartments],
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
   * @returns 新版本的租户用户
   */
  public static createFromUser(
    user: TenantUser,
    updates: {
      readonly username?: string;
      readonly email?: string;
      readonly type?: TenantUserType;
      readonly status?: TenantUserStatus;
      readonly permissions?: readonly string[];
      readonly roles?: readonly string[];
      readonly assignedOrganizations?: readonly OrganizationId[];
      readonly assignedDepartments?: readonly DepartmentId[];
      readonly metadata?: Record<string, unknown>;
    },
  ): TenantUser {
    return new TenantUser({
      userId: user.userId,
      tenantId: user.tenantId,
      username: updates.username ?? user.username,
      email: updates.email ?? user.email,
      type: updates.type ?? user.type,
      status: updates.status ?? user.status,
      permissions: updates.permissions ?? user.permissions,
      roles: updates.roles ?? user.roles,
      assignedOrganizations:
        updates.assignedOrganizations ?? user.assignedOrganizations,
      assignedDepartments:
        updates.assignedDepartments ?? user.assignedDepartments,
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
   * 获取租户ID
   *
   * @returns 租户ID
   */
  get tenantId(): TenantId {
    return this.props.tenantId;
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
  get type(): TenantUserType {
    return this.props.type;
  }

  /**
   * 获取用户状态
   *
   * @returns 用户状态
   */
  get status(): TenantUserStatus {
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
   * 获取分配的组织列表
   *
   * @returns 分配的组织列表
   */
  get assignedOrganizations(): readonly OrganizationId[] {
    return this.props.assignedOrganizations;
  }

  /**
   * 获取分配的部门列表
   *
   * @returns 分配的部门列表
   */
  get assignedDepartments(): readonly DepartmentId[] {
    return this.props.assignedDepartments;
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
  public activate(): TenantUser {
    if (
      this.status !== TenantUserStatus.INACTIVE &&
      this.status !== TenantUserStatus.PENDING_APPROVAL
    ) {
      throw new Error(
        "Only inactive or pending approval users can be activated.",
      );
    }

    return new TenantUser({
      ...this.props,
      status: TenantUserStatus.ACTIVE,
      updatedAt: new Date(),
    });
  }

  /**
   * 停用用户
   *
   * @returns 停用后的用户
   */
  public deactivate(): TenantUser {
    if (this.status !== TenantUserStatus.ACTIVE) {
      throw new Error("Only active users can be deactivated.");
    }

    return new TenantUser({
      ...this.props,
      status: TenantUserStatus.INACTIVE,
      updatedAt: new Date(),
    });
  }

  /**
   * 暂停用户
   *
   * @returns 暂停后的用户
   */
  public suspend(): TenantUser {
    if (this.status !== TenantUserStatus.ACTIVE) {
      throw new Error("Only active users can be suspended.");
    }

    return new TenantUser({
      ...this.props,
      status: TenantUserStatus.SUSPENDED,
      updatedAt: new Date(),
    });
  }

  /**
   * 更新最后登录时间
   *
   * @returns 更新后的用户
   */
  public updateLastLogin(): TenantUser {
    return new TenantUser({
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
  public addPermission(permission: string): TenantUser {
    if (!permission || permission.trim() === "") {
      throw new Error("Permission must be a non-empty string.");
    }

    if (this.permissions.includes(permission)) {
      throw new Error("Permission already exists.");
    }

    return new TenantUser({
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
  public removePermission(permission: string): TenantUser {
    if (!this.permissions.includes(permission)) {
      throw new Error("Permission does not exist.");
    }

    return new TenantUser({
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
  public addRole(role: string): TenantUser {
    if (!role || role.trim() === "") {
      throw new Error("Role must be a non-empty string.");
    }

    if (this.roles.includes(role)) {
      throw new Error("Role already exists.");
    }

    return new TenantUser({
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
  public removeRole(role: string): TenantUser {
    if (!this.roles.includes(role)) {
      throw new Error("Role does not exist.");
    }

    return new TenantUser({
      ...this.props,
      roles: this.roles.filter((r) => r !== role),
      updatedAt: new Date(),
    });
  }

  /**
   * 分配组织
   *
   * @param organizationId - 组织ID
   * @returns 分配组织后的用户
   */
  public assignOrganization(organizationId: OrganizationId): TenantUser {
    if (this.assignedOrganizations.some((o) => o.equals(organizationId))) {
      throw new Error("Organization already assigned.");
    }

    return new TenantUser({
      ...this.props,
      assignedOrganizations: [...this.assignedOrganizations, organizationId],
      updatedAt: new Date(),
    });
  }

  /**
   * 取消分配组织
   *
   * @param organizationId - 组织ID
   * @returns 取消分配组织后的用户
   */
  public unassignOrganization(organizationId: OrganizationId): TenantUser {
    if (!this.assignedOrganizations.some((o) => o.equals(organizationId))) {
      throw new Error("Organization not assigned.");
    }

    return new TenantUser({
      ...this.props,
      assignedOrganizations: this.assignedOrganizations.filter(
        (o) => !o.equals(organizationId),
      ),
      updatedAt: new Date(),
    });
  }

  /**
   * 分配部门
   *
   * @param departmentId - 部门ID
   * @returns 分配部门后的用户
   */
  public assignDepartment(departmentId: DepartmentId): TenantUser {
    if (this.assignedDepartments.some((d) => d.equals(departmentId))) {
      throw new Error("Department already assigned.");
    }

    return new TenantUser({
      ...this.props,
      assignedDepartments: [...this.assignedDepartments, departmentId],
      updatedAt: new Date(),
    });
  }

  /**
   * 取消分配部门
   *
   * @param departmentId - 部门ID
   * @returns 取消分配部门后的用户
   */
  public unassignDepartment(departmentId: DepartmentId): TenantUser {
    if (!this.assignedDepartments.some((d) => d.equals(departmentId))) {
      throw new Error("Department not assigned.");
    }

    return new TenantUser({
      ...this.props,
      assignedDepartments: this.assignedDepartments.filter(
        (d) => !d.equals(departmentId),
      ),
      updatedAt: new Date(),
    });
  }

  /**
   * 检查是否为租户管理员
   *
   * @returns 是否为租户管理员
   */
  public isTenantAdmin(): boolean {
    return this.type === TenantUserType.TENANT_ADMIN;
  }

  /**
   * 检查是否为组织管理员
   *
   * @returns 是否为组织管理员
   */
  public isOrganizationAdmin(): boolean {
    return this.type === TenantUserType.ORGANIZATION_ADMIN;
  }

  /**
   * 检查是否为部门管理员
   *
   * @returns 是否为部门管理员
   */
  public isDepartmentAdmin(): boolean {
    return this.type === TenantUserType.DEPARTMENT_ADMIN;
  }

  /**
   * 检查是否为活跃状态
   *
   * @returns 是否为活跃状态
   */
  public isActive(): boolean {
    return this.status === TenantUserStatus.ACTIVE;
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
   * 检查是否分配了组织
   *
   * @param organizationId - 组织ID
   * @returns 是否分配了组织
   */
  public hasAssignedOrganization(organizationId: OrganizationId): boolean {
    return this.assignedOrganizations.some((o) => o.equals(organizationId));
  }

  /**
   * 检查是否分配了部门
   *
   * @param departmentId - 部门ID
   * @returns 是否分配了部门
   */
  public hasAssignedDepartment(departmentId: DepartmentId): boolean {
    return this.assignedDepartments.some((d) => d.equals(departmentId));
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
   * 获取分配的组织数量
   *
   * @returns 分配的组织数量
   */
  public getAssignedOrganizationCount(): number {
    return this.assignedOrganizations.length;
  }

  /**
   * 获取分配的部门数量
   *
   * @returns 分配的部门数量
   */
  public getAssignedDepartmentCount(): number {
    return this.assignedDepartments.length;
  }

  /**
   * 获取用户摘要
   *
   * @returns 用户摘要
   */
  public getSummary(): string {
    return `${this.username} (${this.type}) - ${this.getPermissionCount()} permissions, ${this.getRoleCount()} roles, ${this.getAssignedOrganizationCount()} orgs, ${this.getAssignedDepartmentCount()} depts, Status: ${this.status}`;
  }

  /**
   * 获取用户详细信息
   *
   * @returns 用户详细信息
   */
  public getDetails(): Record<string, unknown> {
    return {
      userId: this.userId.value,
      tenantId: this.tenantId.value,
      username: this.username,
      email: this.email,
      type: this.type,
      status: this.status,
      permissions: this.permissions,
      roles: this.roles,
      assignedOrganizations: this.assignedOrganizations.map((o) => o.value),
      assignedDepartments: this.assignedDepartments.map((d) => d.value),
      lastLoginAt: this.lastLoginAt?.toISOString(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      isTenantAdmin: this.isTenantAdmin(),
      isOrganizationAdmin: this.isOrganizationAdmin(),
      isDepartmentAdmin: this.isDepartmentAdmin(),
      isActive: this.isActive(),
      permissionCount: this.getPermissionCount(),
      roleCount: this.getRoleCount(),
      assignedOrganizationCount: this.getAssignedOrganizationCount(),
      assignedDepartmentCount: this.getAssignedDepartmentCount(),
      metadata: this.metadata,
    };
  }

  /**
   * 验证值对象的有效性
   */
  protected validate(): void {
    if (
      !this.props.userId ||
      !this.props.tenantId ||
      !this.props.username ||
      !this.props.email ||
      !this.props.type
    ) {
      throw new Error(
        "Tenant user validation failed: missing required properties",
      );
    }
    if (this.props.permissions.length === 0) {
      throw new Error(
        "Tenant user validation failed: permissions cannot be empty",
      );
    }
    if (this.props.roles.length === 0) {
      throw new Error("Tenant user validation failed: roles cannot be empty");
    }
  }

  /**
   * 比较值对象的属性是否相等
   */
  protected arePropertiesEqual(other: TenantUser): boolean {
    return (
      this.props.userId.equals(other.props.userId) &&
      this.props.tenantId.equals(other.props.tenantId) &&
      this.props.username === other.props.username &&
      this.props.email === other.props.email
    );
  }
}
