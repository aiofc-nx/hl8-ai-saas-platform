/**
 * 用户实体
 * @description 用户业务逻辑的载体，执行具体的业务操作
 *
 * ## 实体职责
 * - 执行具体业务操作
 * - 维护自身状态
 * - 实现业务逻辑
 * - 验证业务规则
 * - 遵循聚合根指令
 *
 * @since 1.0.0
 */

import { BaseEntity } from "../entities/base-entity.js";
import { UserId } from "../value-objects/ids/user-id.vo.js";
import { TenantId } from "../value-objects/ids/tenant-id.vo.js";
import { Email } from "./email.vo.js";
import { Username } from "./username.vo.js";
import { UserStatus, UserStatusTransition } from "./user-status.enum.js";
import { DomainValidationException } from "/home/arligle/hl8/hl8-ai-saas-platform/libs/exceptions/dist/core/domain/index.js";

/**
 * 用户实体
 * @description 内部实体，被聚合根管理
 */
export class User extends BaseEntity<UserId> {
  private _email: Email;
  private _username: Username;
  private _status: UserStatus;
  private _activatedAt?: Date;
  private _lastLoginAt?: Date;

  /**
   * 私有构造函数 - 强制使用静态工厂方法
   * @param id - 用户ID
   * @param email - 邮箱
   * @param username - 用户名
   * @param status - 用户状态
   * @param createdAt - 创建时间
   * @param updatedAt - 更新时间
   * @param version - 版本号
   */
  private constructor(
    id: UserId,
    tenantId: TenantId,
    email: Email,
    username: Username,
    status: UserStatus,
    createdAt?: Date,
    updatedAt?: Date,
    _version: number = 0,
  ) {
    super(id, tenantId, undefined, undefined, undefined, false, undefined, {
      createdBy: "system",
      updatedBy: "system",
    });
    this._email = email;
    this._username = username;
    this._status = status;
  }

  /**
   * 获取邮箱
   * @returns 邮箱值对象
   */
  getEmail(): Email {
    return this._email;
  }

  /**
   * 获取用户名
   * @returns 用户名值对象
   */
  getUsername(): Username {
    return this._username;
  }

  /**
   * 获取用户状态
   * @returns 用户状态
   */
  getStatus(): UserStatus {
    return this._status;
  }

  /**
   * 获取激活时间
   * @returns 激活时间
   */
  getActivatedAt(): Date | undefined {
    return this._activatedAt;
  }

  /**
   * 获取最后登录时间
   * @returns 最后登录时间
   */
  getLastLoginAt(): Date | undefined {
    return this._lastLoginAt;
  }

  /**
   * 激活用户
   * @description 将用户状态从待激活转换为已激活
   *
   * @throws {DomainValidationException} 当用户状态不允许激活时
   *
   * @example
   * ```typescript
   * user.activate(); // 激活用户
   * ```
   */
  activate(): void {
    // 验证业务规则
    if (this._status !== UserStatus.PENDING) {
      throw new DomainValidationException(
        "userStatus",
        "只有待激活状态的用户才能激活",
        {
          currentStatus: this._status,
          userId: this.id.getValue(),
        },
      );
    }

    // 执行业务逻辑
    this._status = UserStatus.ACTIVE;
    this._activatedAt = new Date();
    this.updateTimestamp();
  }

  /**
   * 禁用用户
   * @description 将用户状态设置为已禁用
   *
   * @throws {DomainValidationException} 当用户状态不允许禁用时
   */
  disable(): void {
    // 验证业务规则
    if (this._status === UserStatus.DELETED) {
      throw new DomainValidationException(
        "userStatus",
        "已删除的用户不能禁用",
        {
          currentStatus: this._status,
          userId: this.id.getValue(),
        },
      );
    }

    // 执行业务逻辑
    this._status = UserStatus.DISABLED;
    this.updateTimestamp();
  }

  /**
   * 启用用户
   * @description 将用户状态从已禁用转换为已激活
   *
   * @throws {DomainValidationException} 当用户状态不允许启用时
   */
  enable(): void {
    // 验证业务规则
    if (this._status !== UserStatus.DISABLED) {
      throw new DomainValidationException(
        "userStatus",
        "只有已禁用状态的用户才能启用",
        {
          currentStatus: this._status,
          userId: this.id.getValue(),
        },
      );
    }

    // 执行业务逻辑
    this._status = UserStatus.ACTIVE;
    this.updateTimestamp();
  }

  /**
   * 删除用户
   * @description 将用户状态设置为已删除
   *
   * @throws {DomainValidationException} 当用户状态不允许删除时
   */
  delete(): void {
    // 验证业务规则
    if (this._status === UserStatus.DELETED) {
      throw new DomainValidationException("userStatus", "用户已经被删除", {
        currentStatus: this._status,
        userId: this.id.getValue(),
      });
    }

    // 执行业务逻辑
    this._status = UserStatus.DELETED;
    this.markAsDeleted(); // 调用 BaseEntity 的 markAsDeleted 方法
  }

  /**
   * 更新邮箱
   * @description 更新用户的邮箱地址
   *
   * @param newEmail - 新邮箱
   * @throws {DomainValidationException} 当用户状态不允许更新时
   */
  updateEmail(newEmail: Email): void {
    // 验证业务规则
    if (this._status === UserStatus.DELETED) {
      throw new DomainValidationException(
        "userStatus",
        "已删除的用户不能更新邮箱",
        {
          currentStatus: this._status,
          userId: this.id.getValue(),
        },
      );
    }

    // 执行业务逻辑
    this._email = newEmail;
    this.updateTimestamp();
  }

  /**
   * 更新用户名
   * @description 更新用户的用户名
   *
   * @param newUsername - 新用户名
   * @throws {DomainValidationException} 当用户状态不允许更新时
   */
  updateUsername(newUsername: Username): void {
    // 验证业务规则
    if (this._status === UserStatus.DELETED) {
      throw new DomainValidationException(
        "userStatus",
        "已删除的用户不能更新用户名",
        {
          currentStatus: this._status,
          userId: this.id.getValue(),
        },
      );
    }

    // 执行业务逻辑
    this._username = newUsername;
    this.updateTimestamp();
  }

  /**
   * 记录登录
   * @description 记录用户最后登录时间
   */
  recordLogin(): void {
    this._lastLoginAt = new Date();
    this.updateTimestamp();
  }

  /**
   * 检查用户是否活跃
   * @returns 是否活跃
   */
  isActive(): boolean {
    return this._status === UserStatus.ACTIVE;
  }

  /**
   * 检查用户是否已激活
   * @returns 是否已激活
   */
  isActivated(): boolean {
    return (
      this._status === UserStatus.ACTIVE && this._activatedAt !== undefined
    );
  }

  /**
   * 检查用户是否已删除
   * @returns 是否已删除
   */
  isUserDeleted(): boolean {
    return this._status === UserStatus.DELETED;
  }

  /**
   * 验证状态转换
   * @description 验证状态转换是否允许
   *
   * @param newStatus - 新状态
   * @returns 是否允许转换
   */
  canTransitionTo(newStatus: UserStatus): boolean {
    return UserStatusTransition.isTransitionAllowed(this._status, newStatus);
  }

  /**
   * 获取允许的状态转换
   * @returns 允许的状态列表
   */
  getAllowedTransitions(): UserStatus[] {
    return UserStatusTransition.getAllowedTransitions(this._status);
  }

  /**
   * 静态工厂方法 - 创建新用户
   * @param email - 邮箱
   * @param username - 用户名
   * @returns 用户实体
   *
   * @example
   * ```typescript
   * const user = User.create(
   *   Email.create("test@example.com"),
   *   Username.create("testuser")
   * );
   * ```
   */
  static create(tenantId: TenantId, email: Email, username: Username): User {
    return new User(
      UserId.create(crypto.randomUUID()),
      tenantId,
      email,
      username,
      UserStatus.PENDING,
    );
  }

  /**
   * 静态工厂方法 - 从现有数据重建用户
   * @param id - 用户ID
   * @param email - 邮箱
   * @param username - 用户名
   * @param status - 用户状态
   * @param createdAt - 创建时间
   * @param updatedAt - 更新时间
   * @param version - 版本号
   * @returns 用户实体
   */
  static fromExisting(
    id: UserId,
    tenantId: TenantId,
    email: Email,
    username: Username,
    status: UserStatus,
    createdAt?: Date,
    updatedAt?: Date,
    _version: number = 0,
  ): User {
    return new User(
      id,
      tenantId,
      email,
      username,
      status,
      createdAt,
      updatedAt,
      _version,
    );
  }
}
