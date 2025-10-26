import {
  BaseEntity,
  TenantId,
  OrganizationId,
  DepartmentId,
  UserId,
} from "@hl8/domain-kernel";
import { UserSource } from "../value-objects/user-source.vo.js";
import { UserType } from "../value-objects/user-type.vo.js";
import { UserRole } from "../value-objects/user-role.vo.js";
import {
  UserStatus,
  UserStatusTransition,
} from "../value-objects/user-status.vo.js";

/**
 * 用户内部实体
 * @description 执行用户相关的业务操作和维护自身状态
 *
 * @remarks
 * 实体与聚合根分离：
 * - 内部实体（UserEntity）：执行业务逻辑操作，维护自身状态
 * - 聚合根（User）：协调内部实体，发布领域事件，管理聚合边界
 *
 * @example
 * ```typescript
 * const userEntity = new UserEntity(
 *   UserId.generate(),
 *   TenantId.create('tenant-123'),
 *   'user@example.com',
 *   'username',
 *   UserSource.PLATFORM,
 *   UserType.ENTERPRISE,
 *   UserRole.USER
 * );
 *
 * userEntity.updateStatus(UserStatus.ACTIVE);
 * userEntity.joinOrganization(OrganizationId.create('org-123'), DepartmentId.create('dept-456'));
 * ```
 */
export class UserEntity extends BaseEntity<UserId> {
  // 基础属性
  private _email: string;
  private _username: string;
  private _source: UserSource;
  private _type: UserType;
  private _role: UserRole;
  private _status: UserStatus;

  // 关联数据 - 多组织多部门支持
  private _organizations: Set<OrganizationId>;
  private _departments: Map<OrganizationId, DepartmentId>; // 每个组织只能属于一个部门

  /**
   * 创建用户内部实体
   * @description 构造函数，初始化用户实体
   *
   * @param id - 用户ID
   * @param tenantId - 租户ID
   * @param email - 邮箱
   * @param username - 用户名
   * @param source - 用户来源
   * @param type - 用户类型
   * @param role - 用户角色
   * @param status - 用户状态（默认为PENDING）
   */
  constructor(
    id: UserId,
    tenantId: TenantId,
    email: string,
    username: string,
    source: UserSource,
    type: UserType,
    role: UserRole,
    status: UserStatus = UserStatus.PENDING,
  ) {
    super(id, tenantId);

    this._email = email;
    this._username = username;
    this._source = source;
    this._type = type;
    this._role = role;
    this._status = status;

    this._organizations = new Set();
    this._departments = new Map();
  }

  /**
   * 获取邮箱
   * @returns 邮箱
   */
  public getEmail(): string {
    return this._email;
  }

  /**
   * 获取用户名
   * @returns 用户名
   */
  public getUsername(): string {
    return this._username;
  }

  /**
   * 获取用户来源
   * @returns 用户来源
   */
  public getSource(): UserSource {
    return this._source;
  }

  /**
   * 获取用户类型
   * @returns 用户类型
   */
  public getType(): UserType {
    return this._type;
  }

  /**
   * 获取用户角色
   * @returns 用户角色
   */
  public getRole(): UserRole {
    return this._role;
  }

  /**
   * 获取用户状态
   * @returns 用户状态
   */
  public getStatus(): UserStatus {
    return this._status;
  }

  /**
   * 更新用户状态
   * @param newStatus - 新状态
   * @throws {Error} 当状态转换无效时
   *
   * @example
   * ```typescript
   * userEntity.updateStatus(UserStatus.ACTIVE);
   * ```
   */
  public updateStatus(newStatus: UserStatus): void {
    if (!UserStatusTransition.canTransition(this._status, newStatus)) {
      throw new Error(`不能从 ${this._status} 转换到 ${newStatus}`);
    }

    this._status = newStatus;
  }

  /**
   * 加入组织
   * @param organizationId - 组织ID
   * @param departmentId - 部门ID
   * @throws {Error} 如果已经在该组织的其他部门
   *
   * @example
   * ```typescript
   * userEntity.joinOrganization(OrganizationId.create('org-123'), DepartmentId.create('dept-456'));
   * ```
   */
  public joinOrganization(
    organizationId: OrganizationId,
    departmentId: DepartmentId,
  ): void {
    // 检查是否已在该组织
    if (this._organizations.has(organizationId)) {
      throw new Error(
        `用户已经属于组织 ${organizationId.toString()}，不能重复加入`,
      );
    }

    // 加入组织和部门
    this._organizations.add(organizationId);
    this._departments.set(organizationId, departmentId);
  }

  /**
   * 离开组织
   * @param organizationId - 组织ID
   * @throws {Error} 如果用户不属于该组织
   *
   * @example
   * ```typescript
   * userEntity.leaveOrganization(OrganizationId.create('org-123'));
   * ```
   */
  public leaveOrganization(organizationId: OrganizationId): void {
    if (!this._organizations.has(organizationId)) {
      throw new Error(`用户不属于组织 ${organizationId.toString()}`);
    }

    // 移除组织和部门映射
    this._organizations.delete(organizationId);
    this._departments.delete(organizationId);
  }

  /**
   * 更换部门
   * @param organizationId - 组织ID
   * @param newDepartmentId - 新部门ID
   * @throws {Error} 如果用户不属于该组织
   *
   * @example
   * ```typescript
   * userEntity.changeDepartment(OrganizationId.create('org-123'), DepartmentId.create('new-dept-789'));
   * ```
   */
  public changeDepartment(
    organizationId: OrganizationId,
    newDepartmentId: DepartmentId,
  ): void {
    if (!this._organizations.has(organizationId)) {
      throw new Error(`用户不属于组织 ${organizationId.toString()}`);
    }

    // 更新部门
    this._departments.set(organizationId, newDepartmentId);
  }

  /**
   * 检查是否属于指定组织
   * @param organizationId - 组织ID
   * @returns 是否属于该组织
   */
  public belongsToOrganization(organizationId: OrganizationId): boolean {
    return this._organizations.has(organizationId);
  }

  /**
   * 获取用户在该组织的部门
   * @param organizationId - 组织ID
   * @returns 部门ID，如果用户不属于该组织则返回undefined
   */
  public getDepartmentInOrganization(
    organizationId: OrganizationId,
  ): DepartmentId | undefined {
    return this._departments.get(organizationId);
  }

  /**
   * 获取所有组织ID
   * @returns 组织ID集合
   */
  public getOrganizationIds(): ReadonlySet<OrganizationId> {
    return this._organizations;
  }

  /**
   * 获取所有部门映射
   * @returns 组织到部门的映射
   */
  public getDepartmentMapping(): ReadonlyMap<OrganizationId, DepartmentId> {
    return this._departments;
  }

  /**
   * 检查用户是否激活
   * @returns 是否激活
   */
  public isActive(): boolean {
    return this._status === UserStatus.ACTIVE;
  }

  /**
   * 检查用户是否待激活
   * @returns 是否待激活
   */
  public isPending(): boolean {
    return this._status === UserStatus.PENDING;
  }

  /**
   * 检查用户是否被禁用
   * @returns 是否被禁用
   */
  public isDisabled(): boolean {
    return this._status === UserStatus.DISABLED;
  }

  /**
   * 检查用户是否被锁定
   * @returns 是否被锁定
   */
  public isLocked(): boolean {
    return this._status === UserStatus.LOCKED;
  }

  /**
   * 检查用户是否已过期
   * @returns 是否已过期
   */
  public isExpired(): boolean {
    return this._status === UserStatus.EXPIRED;
  }

  /**
   * 检查是否可以操作
   * @returns 是否可操作
   */
  public canOperate(): boolean {
    return (
      this.isActive() &&
      !this.isDisabled() &&
      !this.isLocked() &&
      !this.isExpired()
    );
  }

  /**
   * 获取组织数量
   * @returns 组织数量
   */
  public getOrganizationCount(): number {
    return this._organizations.size;
  }
}
