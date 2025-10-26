import {
  AggregateRoot,
  UserId,
  TenantId,
  OrganizationId,
  DepartmentId,
} from "@hl8/domain-kernel";
import { UserEntity } from "../entities/user-entity.js";
import { UserSource } from "../value-objects/user-source.vo.js";
import { UserType } from "../value-objects/user-type.vo.js";
import { UserRole } from "../value-objects/user-role.vo.js";
import { UserStatus } from "../value-objects/user-status.vo.js";
import { createUserCreatedEvent } from "../events/user-created.event.js";
import { createUserStatusChangedEvent } from "../events/user-status-changed.event.js";
import { createUserJoinedOrganizationEvent } from "../events/user-joined-organization.event.js";
import { createUserLeftOrganizationEvent } from "../events/user-left-organization.event.js";

/**
 * 用户聚合根
 * @description 协调用户内部实体，发布领域事件，管理聚合边界
 *
 * @remarks
 * 实体与聚合根分离：
 * - 聚合根（User）：协调内部实体，发布领域事件，管理聚合边界
 * - 内部实体（UserEntity）：执行业务逻辑操作，维护自身状态
 *
 * @example
 * ```typescript
 * const user = User.create(
 *   TenantId.create('tenant-123'),
 *   'user@example.com',
 *   'username',
 *   UserSource.PLATFORM,
 *   UserType.ENTERPRISE,
 *   UserRole.USER
 * );
 *
 * user.changeStatus(UserStatus.ACTIVE);
 * user.joinOrganization(OrganizationId.create('org-123'), DepartmentId.create('dept-456'));
 * ```
 */
export class User extends AggregateRoot<UserId> {
  private _user: UserEntity;

  /**
   * 构造函数
   * @description 创建用户聚合根实例
   * @param user - 用户内部实体
   */
  private constructor(user: UserEntity) {
    super(user.id, user.tenantId, undefined, undefined, 0);
    this._user = user;
  }

  /**
   * 创建用户
   * @description 创建新用户并发布用户创建事件
   *
   * @param tenantId - 租户ID
   * @param email - 邮箱
   * @param username - 用户名
   * @param source - 用户来源
   * @param type - 用户类型
   * @param role - 用户角色
   * @param status - 用户状态（默认为PENDING）
   * @returns 用户聚合根
   *
   * @example
   * ```typescript
   * const user = User.create(
   *   TenantId.create('tenant-123'),
   *   'user@example.com',
   *   'username',
   *   UserSource.PLATFORM,
   *   UserType.ENTERPRISE,
   *   UserRole.USER
   * );
   * ```
   */
  public static create(
    tenantId: TenantId,
    email: string,
    username: string,
    source: UserSource,
    type: UserType,
    role: UserRole,
    status: UserStatus = UserStatus.PENDING,
  ): User {
    const id = UserId.generate();
    const userEntity = new UserEntity(
      id,
      tenantId,
      email,
      username,
      source,
      type,
      role,
      status,
    );

    const user = new User(userEntity);

    // 发布用户创建事件
    const createEvent = createUserCreatedEvent(
      id,
      tenantId,
      email,
      username,
      source,
      type,
      role,
      status,
    );
    user.apply(createEvent);

    return user;
  }

  /**
   * 从快照恢复
   * @description 从快照恢复用户聚合根
   */
  public static fromSnapshot(snapshot: {
    id: string;
    tenantId: string;
    email: string;
    username: string;
    source: UserSource;
    type: UserType;
    role: UserRole;
    status: UserStatus;
  }): User {
    const id = UserId.create(snapshot.id);
    const tenantId = TenantId.create(snapshot.tenantId);
    const userEntity = new UserEntity(
      id,
      tenantId,
      snapshot.email,
      snapshot.username,
      snapshot.source,
      snapshot.type,
      snapshot.role,
      snapshot.status,
    );

    return new User(userEntity);
  }

  /**
   * 变更用户状态
   * @description 验证并更新用户状态，发布状态变更事件
   *
   * @param newStatus - 新状态
   * @throws {Error} 如果状态转换不合法
   *
   * @example
   * ```typescript
   * user.changeStatus(UserStatus.ACTIVE);
   * ```
   */
  public changeStatus(newStatus: UserStatus): void {
    const oldStatus = this._user.getStatus();
    this._user.updateStatus(newStatus);

    // 发布状态变更事件
    const statusChangeEvent = createUserStatusChangedEvent(
      this.id,
      oldStatus,
      newStatus,
      this.version + 1,
    );
    this.apply(statusChangeEvent);
  }

  /**
   * 加入组织
   * @description 验证并加入组织，发布加入组织事件
   *
   * @param organizationId - 组织ID
   * @param departmentId - 部门ID
   * @throws {Error} 如果用户已经在该组织
   *
   * @example
   * ```typescript
   * user.joinOrganization(OrganizationId.create('org-123'), DepartmentId.create('dept-456'));
   * ```
   */
  public joinOrganization(
    organizationId: OrganizationId,
    departmentId: DepartmentId,
  ): void {
    this._user.joinOrganization(organizationId, departmentId);

    // 发布加入组织事件
    const joinEvent = createUserJoinedOrganizationEvent(
      this.id,
      organizationId,
      departmentId,
      this.version + 1,
    );
    this.apply(joinEvent);
  }

  /**
   * 离开组织
   * @description 验证并离开组织，发布离开组织事件
   *
   * @param organizationId - 组织ID
   * @throws {Error} 如果用户不属于该组织
   *
   * @example
   * ```typescript
   * user.leaveOrganization(OrganizationId.create('org-123'));
   * ```
   */
  public leaveOrganization(organizationId: OrganizationId): void {
    const departmentId = this._user.getDepartmentInOrganization(organizationId);
    if (!departmentId) {
      throw new Error(`用户不属于组织 ${organizationId.toString()}`);
    }

    this._user.leaveOrganization(organizationId);

    // 发布离开组织事件
    const leaveEvent = createUserLeftOrganizationEvent(
      this.id,
      organizationId,
      departmentId,
      this.version + 1,
    );
    this.apply(leaveEvent);
  }

  /**
   * 获取邮箱
   * @returns 邮箱
   */
  public getEmail(): string {
    return this._user.getEmail();
  }

  /**
   * 获取用户名
   * @returns 用户名
   */
  public getUsername(): string {
    return this._user.getUsername();
  }

  /**
   * 获取用户来源
   * @returns 用户来源
   */
  public getSource(): UserSource {
    return this._user.getSource();
  }

  /**
   * 获取用户类型
   * @returns 用户类型
   */
  public getType(): UserType {
    return this._user.getType();
  }

  /**
   * 获取用户角色
   * @returns 用户角色
   */
  public getRole(): UserRole {
    return this._user.getRole();
  }

  /**
   * 获取用户状态
   * @returns 用户状态
   */
  public getStatus(): UserStatus {
    return this._user.getStatus();
  }

  /**
   * 检查用户是否激活
   * @returns 是否激活
   */
  public isActive(): boolean {
    return this._user.isActive();
  }

  /**
   * 检查用户是否可操作
   * @returns 是否可操作
   */
  public canOperate(): boolean {
    return this._user.canOperate();
  }

  /**
   * 检查是否属于指定组织
   * @param organizationId - 组织ID
   * @returns 是否属于该组织
   */
  public belongsToOrganization(organizationId: OrganizationId): boolean {
    return this._user.belongsToOrganization(organizationId);
  }

  /**
   * 获取快照数据
   * @description 用于事件溯源，返回聚合根的当前状态快照
   * @returns 快照数据
   */
  public getSnapshotData(): {
    id: string;
    tenantId: string;
    email: string;
    username: string;
    source: UserSource;
    type: UserType;
    role: UserRole;
    status: UserStatus;
  } {
    return {
      id: this.id.toString(),
      tenantId: this.tenantId.toString(),
      email: this._user.getEmail(),
      username: this._user.getUsername(),
      source: this._user.getSource(),
      type: this._user.getType(),
      role: this._user.getRole(),
      status: this._user.getStatus(),
    };
  }

  /**
   * 从快照加载
   * @description 从快照加载聚合根状态
   * @param snapshot - 快照数据
   */
  public loadFromSnapshot(snapshot: {
    id: string;
    tenantId: string;
    email: string;
    username: string;
    source: UserSource;
    type: UserType;
    role: UserRole;
    status: UserStatus;
  }): void {
    // 重建内部实体
    const id = UserId.create(snapshot.id);
    const tenantId = TenantId.create(snapshot.tenantId);
    this._user = new UserEntity(
      id,
      tenantId,
      snapshot.email,
      snapshot.username,
      snapshot.source,
      snapshot.type,
      snapshot.role,
      snapshot.status,
    );
  }
}
