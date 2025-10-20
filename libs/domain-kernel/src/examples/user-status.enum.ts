/**
 * 用户状态枚举
 * @description 定义用户的各种状态
 *
 * @since 1.0.0
 */

/**
 * 用户状态枚举
 */
export enum UserStatus {
  /** 待激活 */
  PENDING = "PENDING",
  /** 已激活 */
  ACTIVE = "ACTIVE",
  /** 已禁用 */
  DISABLED = "DISABLED",
  /** 已删除 */
  DELETED = "DELETED",
}

/**
 * 用户状态转换规则
 */
export class UserStatusTransition {
  private static readonly ALLOWED_TRANSITIONS: Record<
    UserStatus,
    UserStatus[]
  > = {
    [UserStatus.PENDING]: [UserStatus.ACTIVE, UserStatus.DELETED],
    [UserStatus.ACTIVE]: [UserStatus.DISABLED, UserStatus.DELETED],
    [UserStatus.DISABLED]: [UserStatus.ACTIVE, UserStatus.DELETED],
    [UserStatus.DELETED]: [], // 已删除状态不能转换到其他状态
  };

  /**
   * 检查状态转换是否允许
   * @param from - 当前状态
   * @param to - 目标状态
   * @returns 是否允许转换
   */
  static isTransitionAllowed(from: UserStatus, to: UserStatus): boolean {
    return this.ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
  }

  /**
   * 获取允许的状态转换
   * @param status - 当前状态
   * @returns 允许转换的状态列表
   */
  static getAllowedTransitions(status: UserStatus): UserStatus[] {
    return this.ALLOWED_TRANSITIONS[status] || [];
  }
}
