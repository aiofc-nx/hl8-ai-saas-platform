import {
  AggregateRoot,
  TenantId,
  GenericEntityId,
  UserId,
} from "@hl8/domain-kernel";
import { CredentialEntity } from "../entities/credential-entity.js";
import { CredentialType } from "../value-objects/credential-type.vo.js";

/**
 * 凭证聚合根
 * @description 协调凭证内部实体，发布领域事件，管理聚合边界
 *
 * @remarks
 * 实体与聚合根分离：
 * - 聚合根（Credential）：协调内部实体，发布领域事件，管理聚合边界
 * - 内部实体（CredentialEntity）：执行业务逻辑操作，维护自身状态
 *
 * @example
 * ```typescript
 * const credential = Credential.create(
 *   TenantId.create('tenant-123'),
 *   UserId.create('user-123'),
 *   CredentialType.PASSWORD,
 *   'hashedPassword'
 * );
 *
 * credential.updateValue('newHashedPassword');
 * ```
 */
export class Credential extends AggregateRoot<GenericEntityId> {
  private _credential: CredentialEntity;

  /**
   * 构造函数
   * @description 创建凭证聚合根实例
   * @param credential - 凭证内部实体
   */
  private constructor(credential: CredentialEntity) {
    super(credential.id, credential.tenantId, undefined, undefined, 0);
    this._credential = credential;
  }

  /**
   * 创建凭证
   * @description 创建新凭证并发布凭证创建事件
   *
   * @param tenantId - 租户ID
   * @param userId - 用户ID
   * @param type - 凭证类型
   * @param value - 凭证值（已加密）
   * @param expiresAt - 过期时间（可选）
   * @returns 凭证聚合根
   *
   * @example
   * ```typescript
   * const credential = Credential.create(
   *   TenantId.create('tenant-123'),
   *   UserId.create('user-123'),
   *   CredentialType.PASSWORD,
   *   'hashedPassword'
   * );
   * ```
   */
  public static create(
    tenantId: TenantId,
    userId: UserId,
    type: CredentialType,
    value: string,
    expiresAt?: Date,
  ): Credential {
    const id = GenericEntityId.generate();
    const credentialEntity = new CredentialEntity(
      id,
      tenantId,
      userId,
      type,
      value,
      true,
      expiresAt,
    );

    const credential = new Credential(credentialEntity);

    // 发布凭证创建事件
    const createEvent = {
      eventId: GenericEntityId.generate(),
      occurredAt: new Date(),
      aggregateId: id,
      version: 1,
      eventType: "CredentialCreated",
      eventData: {
        credentialId: id.toString(),
        userId: userId.toString(),
        type,
        expiresAt: expiresAt?.toISOString(),
      },
    };
    credential.apply(createEvent);

    return credential;
  }

  /**
   * 从快照恢复
   * @description 从快照恢复凭证聚合根
   */
  public static fromSnapshot(snapshot: {
    id: string;
    tenantId: string;
    userId: string;
    type: CredentialType;
    value: string;
    isActive: boolean;
    expiresAt?: string;
  }): Credential {
    const id = GenericEntityId.create(snapshot.id);
    const tenantId = TenantId.create(snapshot.tenantId);
    const userId = UserId.create(snapshot.userId);
    const expiresAt = snapshot.expiresAt
      ? new Date(snapshot.expiresAt)
      : undefined;
    const credentialEntity = new CredentialEntity(
      id,
      tenantId,
      userId,
      snapshot.type,
      snapshot.value,
      snapshot.isActive,
      expiresAt,
    );

    return new Credential(credentialEntity);
  }

  /**
   * 更新凭证值
   * @description 验证并更新凭证值，发布凭证更新事件
   *
   * @param newValue - 新凭证值（已加密）
   *
   * @example
   * ```typescript
   * credential.updateValue('newHashedPassword');
   * ```
   */
  public updateValue(newValue: string): void {
    this._credential.updateValue(newValue);

    // 发布凭证更新事件
    const updateEvent = {
      eventId: GenericEntityId.generate(),
      occurredAt: new Date(),
      aggregateId: this.id,
      version: this.version + 1,
      eventType: "CredentialUpdated",
      eventData: {
        credentialId: this.id.toString(),
        userId: this._credential.getUserId().toString(),
      },
    };
    this.apply(updateEvent);
  }

  /**
   * 记录失败尝试
   * @description 记录验证失败，超过阈值时锁定凭证
   * @param maxAttempts - 最大允许尝试次数（默认5次）
   * @param lockDuration - 锁定时长（默认30分钟）
   */
  public recordFailedAttempt(
    maxAttempts: number = 5,
    lockDuration: number = 30,
  ): void {
    this._credential.recordFailedAttempt(maxAttempts, lockDuration);
  }

  /**
   * 重置失败尝试次数
   * @description 验证成功后重置失败尝试次数
   */
  public resetFailedAttempts(): void {
    this._credential.resetFailedAttempts();
  }

  /**
   * 激活凭证
   * @description 激活凭证
   *
   * @example
   * ```typescript
   * credential.activate();
   * ```
   */
  public activate(): void {
    this._credential.activate();
  }

  /**
   * 停用凭证
   * @description 停用凭证
   *
   * @example
   * ```typescript
   * credential.deactivate();
   * ```
   */
  public deactivate(): void {
    this._credential.deactivate();
  }

  /**
   * 获取用户ID
   * @returns 用户ID
   */
  public getUserId(): UserId {
    return this._credential.getUserId();
  }

  /**
   * 获取凭证类型
   * @returns 凭证类型
   */
  public getType(): CredentialType {
    return this._credential.getType();
  }

  /**
   * 检查凭证是否激活
   * @returns 是否激活
   */
  public isActive(): boolean {
    return this._credential.isActive();
  }

  /**
   * 检查凭证是否过期
   * @returns 是否过期
   */
  public isExpired(): boolean {
    return this._credential.isExpired();
  }

  /**
   * 检查凭证是否被锁定
   * @returns 是否被锁定
   */
  public isLocked(): boolean {
    return this._credential.isLocked();
  }

  /**
   * 检查凭证是否可以操作
   * @returns 是否可以操作
   */
  public canOperate(): boolean {
    return this._credential.canOperate();
  }

  /**
   * 获取快照数据
   * @description 用于事件溯源，返回聚合根的当前状态快照
   * @returns 快照数据
   */
  public getSnapshotData(): {
    id: string;
    tenantId: string;
    userId: string;
    type: CredentialType;
    value: string;
    isActive: boolean;
    expiresAt?: string;
  } {
    return {
      id: this.id.toString(),
      tenantId: this.tenantId.toString(),
      userId: this._credential.getUserId().toString(),
      type: this._credential.getType(),
      value: this._credential.getValue(),
      isActive: this._credential.isActive(),
      expiresAt: this._credential.getExpiresAt()?.toISOString(),
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
    userId: string;
    type: CredentialType;
    value: string;
    isActive: boolean;
    expiresAt?: string;
  }): void {
    // 重建内部实体
    const id = GenericEntityId.create(snapshot.id);
    const tenantId = TenantId.create(snapshot.tenantId);
    const userId = UserId.create(snapshot.userId);
    const expiresAt = snapshot.expiresAt
      ? new Date(snapshot.expiresAt)
      : undefined;
    this._credential = new CredentialEntity(
      id,
      tenantId,
      userId,
      snapshot.type,
      snapshot.value,
      snapshot.isActive,
      expiresAt,
    );
  }
}
