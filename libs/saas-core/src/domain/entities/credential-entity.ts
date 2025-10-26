import {
  BaseEntity,
  TenantId,
  GenericEntityId,
  UserId,
} from "@hl8/domain-kernel";
import { CredentialType } from "../value-objects/credential-type.vo.js";

/**
 * 凭证内部实体
 * @description 执行凭证相关的业务操作和维护自身状态
 *
 * @remarks
 * 实体与聚合根分离：
 * - 内部实体（CredentialEntity）：执行业务逻辑操作，维护自身状态
 * - 聚合根（Credential）：协调内部实体，发布领域事件，管理聚合边界
 *
 * @example
 * ```typescript
 * const credentialEntity = new CredentialEntity(
 *   GenericEntityId.generate(),
 *   TenantId.create('tenant-123'),
 *   UserId.create('user-123'),
 *   CredentialType.PASSWORD,
 *   'hashedPassword',
 *   new Date('2024-12-31')
 * );
 *
 * credentialEntity.verify('inputPassword');
 * ```
 */
export class CredentialEntity extends BaseEntity<GenericEntityId> {
  // 凭证基本属性
  private _user: UserId;
  private _type: CredentialType;
  private _value: string;
  private _isActive: boolean;
  private _expiresAt?: Date;
  private _lastUsedAt?: Date;
  private _failedAttempts: number;
  private _lockedUntil?: Date;

  /**
   * 创建凭证内部实体
   * @description 构造函数，初始化凭证实体
   *
   * @param id - 凭证ID
   * @param tenantId - 租户ID
   * @param userId - 用户ID
   * @param type - 凭证类型
   * @param value - 凭证值（已加密的）
   * @param isActive - 是否激活（默认为true）
   * @param expiresAt - 过期时间（可选）
   */
  constructor(
    id: GenericEntityId,
    tenantId: TenantId,
    userId: UserId,
    type: CredentialType,
    value: string,
    isActive: boolean = true,
    expiresAt?: Date,
  ) {
    super(id, tenantId);

    this._user = userId;
    this._type = type;
    this._value = value;
    this._isActive = isActive;
    this._expiresAt = expiresAt;
    this._failedAttempts = 0;
  }

  /**
   * 获取用户ID
   * @returns 用户ID
   */
  public getUserId(): UserId {
    return this._user;
  }

  /**
   * 获取凭证类型
   * @returns 凭证类型
   */
  public getType(): CredentialType {
    return this._type;
  }

  /**
   * 获取凭证值（已加密）
   * @returns 凭证值
   */
  public getValue(): string {
    return this._value;
  }

  /**
   * 检查凭证是否激活
   * @returns 是否激活
   */
  public isActive(): boolean {
    return this._isActive;
  }

  /**
   * 检查凭证是否过期
   * @returns 是否过期
   */
  public isExpired(): boolean {
    if (!this._expiresAt) {
      return false;
    }
    return new Date() > this._expiresAt;
  }

  /**
   * 检查凭证是否被锁定
   * @returns 是否被锁定
   */
  public isLocked(): boolean {
    if (!this._lockedUntil) {
      return false;
    }
    return new Date() < this._lockedUntil;
  }

  /**
   * 激活凭证
   *
   * @example
   * ```typescript
   * credentialEntity.activate();
   * ```
   */
  public activate(): void {
    this._isActive = true;
  }

  /**
   * 停用凭证
   *
   * @example
   * ```typescript
   * credentialEntity.deactivate();
   * ```
   */
  public deactivate(): void {
    this._isActive = false;
  }

  /**
   * 更新凭证值
   * @param newValue - 新凭证值（已加密）
   *
   * @example
   * ```typescript
   * credentialEntity.updateValue('newHashedPassword');
   * ```
   */
  public updateValue(newValue: string): void {
    this._value = newValue;
    this._failedAttempts = 0;
    this._lockedUntil = undefined;
    this.updateLastUsedAt();
  }

  /**
   * 更新过期时间
   * @param newExpiresAt - 新过期时间
   *
   * @example
   * ```typescript
   * credentialEntity.updateExpiresAt(new Date('2025-12-31'));
   * ```
   */
  public updateExpiresAt(newExpiresAt: Date): void {
    this._expiresAt = newExpiresAt;
  }

  /**
   * 记录失败尝试
   * @description 记录验证失败，超过阈值时锁定凭证
   * @param maxAttempts - 最大允许尝试次数（默认5次）
   * @param lockDuration - 锁定时长（默认30分钟）
   *
   * @example
   * ```typescript
   * credentialEntity.recordFailedAttempt();
   * ```
   */
  public recordFailedAttempt(
    maxAttempts: number = 5,
    lockDuration: number = 30,
  ): void {
    this._failedAttempts++;

    if (this._failedAttempts >= maxAttempts) {
      const lockUntil = new Date();
      lockUntil.setMinutes(lockUntil.getMinutes() + lockDuration);
      this._lockedUntil = lockUntil;
    }
  }

  /**
   * 重置失败尝试次数
   *
   * @example
   * ```typescript
   * credentialEntity.resetFailedAttempts();
   * ```
   */
  public resetFailedAttempts(): void {
    this._failedAttempts = 0;
    this._lockedUntil = undefined;
  }

  /**
   * 更新最后使用时间
   */
  public updateLastUsedAt(): void {
    this._lastUsedAt = new Date();
  }

  /**
   * 获取失败尝试次数
   * @returns 失败尝试次数
   */
  public getFailedAttempts(): number {
    return this._failedAttempts;
  }

  /**
   * 获取过期时间
   * @returns 过期时间
   */
  public getExpiresAt(): Date | undefined {
    return this._expiresAt;
  }

  /**
   * 获取最后使用时间
   * @returns 最后使用时间
   */
  public getLastUsedAt(): Date | undefined {
    return this._lastUsedAt;
  }

  /**
   * 获取锁定到期时间
   * @returns 锁定到期时间
   */
  public getLockedUntil(): Date | undefined {
    return this._lockedUntil;
  }

  /**
   * 检查凭证是否可以操作
   * @returns 是否可以操作
   */
  public canOperate(): boolean {
    return this._isActive && !this.isExpired() && !this.isLocked();
  }
}
