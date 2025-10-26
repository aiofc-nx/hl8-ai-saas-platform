import { BaseValueObject } from "@hl8/domain-kernel";

/**
 * 用户状态
 * @description 用户的生命周期状态
 */
export enum UserStatus {
  /** 待激活：用户已创建但未激活 */
  PENDING = "PENDING",

  /** 已激活：用户已激活且正常使用 */
  ACTIVE = "ACTIVE",

  /** 已禁用：用户被禁用 */
  DISABLED = "DISABLED",

  /** 已锁定：用户被锁定 */
  LOCKED = "LOCKED",

  /** 已过期：用户账户已过期 */
  EXPIRED = "EXPIRED",
}

/**
 * 用户状态转换规则
 * @description 定义用户状态之间的转换规则
 */
export class UserStatusTransition extends BaseValueObject {
  private static readonly VALID_TRANSITIONS = new Map<UserStatus, Set<UserStatus>>([
      [UserStatus.PENDING, new Set([UserStatus.ACTIVE, UserStatus.DISABLED])],
      [
        UserStatus.ACTIVE,
        new Set([UserStatus.DISABLED, UserStatus.LOCKED, UserStatus.EXPIRED]),
      ],
      [UserStatus.DISABLED, new Set([UserStatus.ACTIVE, UserStatus.LOCKED])],
      [UserStatus.LOCKED, new Set([UserStatus.ACTIVE, UserStatus.DISABLED])],
      [UserStatus.EXPIRED, new Set([UserStatus.ACTIVE, UserStatus.DISABLED])],
    ]);

  /**
   * 验证状态转换是否有效
   * @param fromStatus 当前状态
   * @param toStatus 目标状态
   * @returns 是否允许转换
   */
  public static canTransition(
    fromStatus: UserStatus,
    toStatus: UserStatus,
  ): boolean {
    const allowedStatuses = this.VALID_TRANSITIONS.get(fromStatus);
    return allowedStatuses?.has(toStatus) ?? false;
  }

  /**
   * 获取允许转换的目标状态列表
   * @param currentStatus 当前状态
   * @returns 允许转换的状态列表
   */
  public static getAllowedTransitions(
    currentStatus: UserStatus,
  ): Set<UserStatus> {
    return this.VALID_TRANSITIONS.get(currentStatus) ?? new Set();
  }

  constructor(private readonly status: UserStatus) {
    super();
    this.validate();
  }

  get value(): UserStatus {
    return this.status;
  }

  protected validate(): void {
    if (!Object.values(UserStatus).includes(this.status)) {
      throw new Error(`无效的用户状态: ${this.status}`);
    }
  }

  protected arePropertiesEqual(other: BaseValueObject): boolean {
    return other instanceof UserStatusTransition && this.status === other.status;
  }

  protected getPropertiesForEquality(): Record<string, unknown> {
    return { status: this.status };
  }
}
