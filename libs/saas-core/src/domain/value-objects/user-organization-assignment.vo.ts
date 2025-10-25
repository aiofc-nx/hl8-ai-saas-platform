/**
 * 用户组织分配值对象
 *
 * @description 表示用户与组织的分配关系，包括分配类型、权限级别、分配时间等信息
 * @since 1.0.0
 */

import { BaseValueObject } from "./base-value-object.js";
import { UserId } from "./user-id.vo.js";
import { OrganizationId } from "./organization-id.vo.js";

/**
 * 用户组织分配类型枚举
 */
export enum UserOrganizationAssignmentType {
  MEMBER = "MEMBER",
  ADMIN = "ADMIN",
  OWNER = "OWNER",
  GUEST = "GUEST",
}

/**
 * 用户组织分配状态枚举
 */
export enum UserOrganizationAssignmentStatus {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  SUSPENDED = "SUSPENDED",
  EXPIRED = "EXPIRED",
  REVOKED = "REVOKED",
}

/**
 * 用户组织分配接口
 */
export interface IUserOrganizationAssignment {
  readonly userId: UserId;
  readonly organizationId: OrganizationId;
  readonly assignmentType: UserOrganizationAssignmentType;
  readonly status: UserOrganizationAssignmentStatus;
  readonly assignedAt: Date;
  readonly assignedBy: UserId;
  readonly expiresAt?: Date;
  readonly permissions: readonly string[];
  readonly metadata: Record<string, unknown>;
}

/**
 * 用户组织分配值对象
 *
 * 用户组织分配值对象表示用户与组织之间的分配关系，包括分配类型、权限级别、分配时间等信息。
 * 支持多种分配类型、状态管理、权限控制等功能。
 *
 * @example
 * ```typescript
 * const assignment = new UserOrganizationAssignment({
 *   userId: new UserId("user-123"),
 *   organizationId: new OrganizationId("org-456"),
 *   assignmentType: UserOrganizationAssignmentType.ADMIN,
 *   status: UserOrganizationAssignmentStatus.ACTIVE,
 *   assignedAt: new Date(),
 *   assignedBy: new UserId("admin-789"),
 *   permissions: ["read", "write", "admin"],
 *   metadata: { source: "manual", reason: "promotion" }
 * });
 * ```
 */
export class UserOrganizationAssignment extends BaseValueObject<IUserOrganizationAssignment> {
  constructor(assignment: IUserOrganizationAssignment) {
    super(assignment);
    this.validateAssignment(assignment);
  }

  /**
   * 验证用户组织分配
   *
   * @param assignment - 用户组织分配
   * @throws {Error} 当分配无效时抛出错误
   */
  private validateAssignment(assignment: IUserOrganizationAssignment): void {
    if (!assignment.userId) {
      throw new Error("用户ID不能为空");
    }
    if (!assignment.organizationId) {
      throw new Error("组织ID不能为空");
    }
    if (!assignment.assignedAt) {
      throw new Error("分配时间不能为空");
    }
    if (!assignment.assignedBy) {
      throw new Error("分配者不能为空");
    }
    if (assignment.expiresAt && assignment.expiresAt <= assignment.assignedAt) {
      throw new Error("过期时间必须晚于分配时间");
    }
    if (assignment.permissions.length === 0) {
      throw new Error("权限列表不能为空");
    }
  }

  /**
   * 获取用户ID
   *
   * @returns 用户ID
   */
  get userId(): UserId {
    return this.value.userId;
  }

  /**
   * 获取组织ID
   *
   * @returns 组织ID
   */
  get organizationId(): OrganizationId {
    return this.value.organizationId;
  }

  /**
   * 获取分配类型
   *
   * @returns 分配类型
   */
  get assignmentType(): UserOrganizationAssignmentType {
    return this.value.assignmentType;
  }

  /**
   * 获取分配状态
   *
   * @returns 分配状态
   */
  get status(): UserOrganizationAssignmentStatus {
    return this.value.status;
  }

  /**
   * 获取分配时间
   *
   * @returns 分配时间
   */
  get assignedAt(): Date {
    return this.value.assignedAt;
  }

  /**
   * 获取分配者
   *
   * @returns 分配者
   */
  get assignedBy(): UserId {
    return this.value.assignedBy;
  }

  /**
   * 获取过期时间
   *
   * @returns 过期时间或undefined
   */
  get expiresAt(): Date | undefined {
    return this.value.expiresAt;
  }

  /**
   * 获取权限列表
   *
   * @returns 权限列表
   */
  get permissions(): readonly string[] {
    return this.value.permissions;
  }

  /**
   * 获取元数据
   *
   * @returns 元数据
   */
  get metadata(): Record<string, unknown> {
    return this.value.metadata;
  }

  /**
   * 检查分配是否有效
   *
   * @returns 是否有效
   */
  isValid(): boolean {
    return this.status === UserOrganizationAssignmentStatus.ACTIVE;
  }

  /**
   * 检查分配是否已过期
   *
   * @returns 是否已过期
   */
  isExpired(): boolean {
    if (!this.expiresAt) {
      return false;
    }
    return new Date() > this.expiresAt;
  }

  /**
   * 检查分配是否即将过期
   *
   * @param warningDays - 警告天数
   * @returns 是否即将过期
   */
  isExpiringSoon(warningDays: number = 7): boolean {
    if (!this.expiresAt) {
      return false;
    }
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + warningDays);
    return this.expiresAt <= warningDate;
  }

  /**
   * 检查用户是否有指定权限
   *
   * @param permission - 权限
   * @returns 是否有权限
   */
  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  /**
   * 检查用户是否有任一权限
   *
   * @param permissions - 权限列表
   * @returns 是否有任一权限
   */
  hasAnyPermission(permissions: readonly string[]): boolean {
    return permissions.some((permission) => this.hasPermission(permission));
  }

  /**
   * 检查用户是否有所有权限
   *
   * @param permissions - 权限列表
   * @returns 是否有所有权限
   */
  hasAllPermissions(permissions: readonly string[]): boolean {
    return permissions.every((permission) => this.hasPermission(permission));
  }

  /**
   * 检查是否为管理员
   *
   * @returns 是否为管理员
   */
  isAdmin(): boolean {
    return (
      this.assignmentType === UserOrganizationAssignmentType.ADMIN ||
      this.assignmentType === UserOrganizationAssignmentType.OWNER
    );
  }

  /**
   * 检查是否为所有者
   *
   * @returns 是否为所有者
   */
  isOwner(): boolean {
    return this.assignmentType === UserOrganizationAssignmentType.OWNER;
  }

  /**
   * 检查是否为普通成员
   *
   * @returns 是否为普通成员
   */
  isMember(): boolean {
    return this.assignmentType === UserOrganizationAssignmentType.MEMBER;
  }

  /**
   * 检查是否为访客
   *
   * @returns 是否为访客
   */
  isGuest(): boolean {
    return this.assignmentType === UserOrganizationAssignmentType.GUEST;
  }

  /**
   * 获取分配持续时间（天数）
   *
   * @returns 分配持续时间
   */
  getAssignmentDuration(): number {
    const now = new Date();
    const endDate = this.expiresAt || now;
    const diffTime = endDate.getTime() - this.assignedAt.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * 获取剩余有效时间（天数）
   *
   * @returns 剩余有效时间
   */
  getRemainingDuration(): number {
    if (!this.expiresAt) {
      return -1; // 永不过期
    }
    const now = new Date();
    if (now > this.expiresAt) {
      return 0; // 已过期
    }
    const diffTime = this.expiresAt.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * 创建新的分配状态
   *
   * @param status - 新状态
   * @returns 新的用户组织分配
   */
  withStatus(
    status: UserOrganizationAssignmentStatus,
  ): UserOrganizationAssignment {
    return new UserOrganizationAssignment({
      ...this.value,
      status,
    });
  }

  /**
   * 创建新的分配类型
   *
   * @param assignmentType - 新分配类型
   * @returns 新的用户组织分配
   */
  withAssignmentType(
    assignmentType: UserOrganizationAssignmentType,
  ): UserOrganizationAssignment {
    return new UserOrganizationAssignment({
      ...this.value,
      assignmentType,
    });
  }

  /**
   * 创建新的过期时间
   *
   * @param expiresAt - 新过期时间
   * @returns 新的用户组织分配
   */
  withExpiresAt(expiresAt: Date): UserOrganizationAssignment {
    return new UserOrganizationAssignment({
      ...this.value,
      expiresAt,
    });
  }

  /**
   * 创建新的权限列表
   *
   * @param permissions - 新权限列表
   * @returns 新的用户组织分配
   */
  withPermissions(permissions: readonly string[]): UserOrganizationAssignment {
    return new UserOrganizationAssignment({
      ...this.value,
      permissions,
    });
  }

  /**
   * 创建新的元数据
   *
   * @param metadata - 新元数据
   * @returns 新的用户组织分配
   */
  withMetadata(metadata: Record<string, unknown>): UserOrganizationAssignment {
    return new UserOrganizationAssignment({
      ...this.value,
      metadata: { ...this.value.metadata, ...metadata },
    });
  }

  /**
   * 获取用户组织分配的字符串表示
   *
   * @returns 字符串表示
   */
  toString(): string {
    return `UserOrganizationAssignment(userId: ${this.userId.value}, organizationId: ${this.organizationId.value}, type: ${this.assignmentType}, status: ${this.status})`;
  }

  /**
   * 创建默认的用户组织分配
   *
   * @param userId - 用户ID
   * @param organizationId - 组织ID
   * @param assignedBy - 分配者
   * @returns 默认的用户组织分配
   */
  static createDefault(
    userId: UserId,
    organizationId: OrganizationId,
    assignedBy: UserId,
  ): UserOrganizationAssignment {
    return new UserOrganizationAssignment({
      userId,
      organizationId,
      assignmentType: UserOrganizationAssignmentType.MEMBER,
      status: UserOrganizationAssignmentStatus.ACTIVE,
      assignedAt: new Date(),
      assignedBy,
      permissions: ["read"],
      metadata: {},
    });
  }

  /**
   * 创建管理员分配
   *
   * @param userId - 用户ID
   * @param organizationId - 组织ID
   * @param assignedBy - 分配者
   * @returns 管理员分配
   */
  static createAdmin(
    userId: UserId,
    organizationId: OrganizationId,
    assignedBy: UserId,
  ): UserOrganizationAssignment {
    return new UserOrganizationAssignment({
      userId,
      organizationId,
      assignmentType: UserOrganizationAssignmentType.ADMIN,
      status: UserOrganizationAssignmentStatus.ACTIVE,
      assignedAt: new Date(),
      assignedBy,
      permissions: ["read", "write", "admin"],
      metadata: { source: "manual", role: "admin" },
    });
  }

  /**
   * 创建所有者分配
   *
   * @param userId - 用户ID
   * @param organizationId - 组织ID
   * @returns 所有者分配
   */
  static createOwner(
    userId: UserId,
    organizationId: OrganizationId,
  ): UserOrganizationAssignment {
    return new UserOrganizationAssignment({
      userId,
      organizationId,
      assignmentType: UserOrganizationAssignmentType.OWNER,
      status: UserOrganizationAssignmentStatus.ACTIVE,
      assignedAt: new Date(),
      assignedBy: userId, // 所有者自己创建
      permissions: ["read", "write", "admin", "owner"],
      metadata: { source: "creation", role: "owner" },
    });
  }
}
