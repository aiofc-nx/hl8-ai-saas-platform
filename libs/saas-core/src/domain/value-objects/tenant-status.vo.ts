/**
 * 租户状态枚举
 * @description 定义租户的生命周期状态
 *
 * @example
 * ```typescript
 * // 检查状态转换是否允许
 * const allowed = TenantStatusTransition.isTransitionAllowed(
 *   TenantStatus.TRIAL,
 *   TenantStatus.ACTIVE
 * ); // true
 *
 * // 获取允许的状态转换列表
 * const transitions = TenantStatusTransition.getAllowedTransitions(TenantStatus.TRIAL);
 * console.log(transitions); // [TenantStatus.ACTIVE, TenantStatus.EXPIRED]
 * ```
 */
export enum TenantStatus {
  /**
   * 试用状态
   * @description 租户处于试用期，可以转为活跃或过期状态
   */
  TRIAL = "TRIAL",

  /**
   * 活跃状态
   * @description 租户正常运行，可以转为暂停或删除状态
   */
  ACTIVE = "ACTIVE",

  /**
   * 暂停状态
   * @description 租户被暂停服务，可以转为活跃或删除状态
   */
  SUSPENDED = "SUSPENDED",

  /**
   * 过期状态
   * @description 租户试用期过期或服务到期，只能转为删除状态
   */
  EXPIRED = "EXPIRED",

  /**
   * 已删除状态
   * @description 租户已被删除，不能转为其他状态
   */
  DELETED = "DELETED",
}

/**
 * 租户状态转换规则
 * @description 定义租户状态之间的合法转换规则
 *
 * ## 状态转换规则
 * - TRIAL → ACTIVE ✅
 * - TRIAL → EXPIRED ✅
 * - ACTIVE → SUSPENDED ✅
 * - SUSPENDED → ACTIVE ✅
 * - 任何状态 → DELETED ✅
 * - DELETED → 任何状态 ❌ (禁止)
 */
export class TenantStatusTransition {
  /**
   * 允许的状态转换映射
   * @description 定义每个状态可以转换到的目标状态列表
   */
  private static readonly ALLOWED_TRANSITIONS: Record<
    TenantStatus,
    TenantStatus[]
  > = {
    [TenantStatus.TRIAL]: [
      TenantStatus.ACTIVE,
      TenantStatus.EXPIRED,
      TenantStatus.DELETED,
    ],
    [TenantStatus.ACTIVE]: [TenantStatus.SUSPENDED, TenantStatus.DELETED],
    [TenantStatus.SUSPENDED]: [TenantStatus.ACTIVE, TenantStatus.DELETED],
    [TenantStatus.EXPIRED]: [TenantStatus.DELETED],
    [TenantStatus.DELETED]: [], // 已删除状态不能转换到其他状态
  };

  /**
   * 检查状态转换是否允许
   * @description 验证从当前状态转换到目标状态是否合法
   *
   * @param from - 当前状态
   * @param to - 目标状态
   * @returns 是否允许转换
   *
   * @example
   * ```typescript
   * const allowed = TenantStatusTransition.isTransitionAllowed(
   *   TenantStatus.TRIAL,
   *   TenantStatus.ACTIVE
   * );
   * console.log(allowed); // true
   * ```
   */
  public static isTransitionAllowed(
    from: TenantStatus,
    to: TenantStatus,
  ): boolean {
    if (from === to) {
      return true; // 允许保持相同状态
    }
    return this.ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
  }

  /**
   * 获取允许的状态转换列表
   * @description 获取从指定状态可以转换到的所有目标状态
   *
   * @param status - 当前状态
   * @returns 允许转换的目标状态列表
   *
   * @example
   * ```typescript
   * const transitions = TenantStatusTransition.getAllowedTransitions(TenantStatus.TRIAL);
   * console.log(transitions); // [TenantStatus.ACTIVE, TenantStatus.EXPIRED, TenantStatus.DELETED]
   * ```
   */
  public static getAllowedTransitions(status: TenantStatus): TenantStatus[] {
    return this.ALLOWED_TRANSITIONS[status] || [];
  }

  /**
   * 验证状态转换
   * @description 验证状态转换并抛出异常如果转换不合法
   *
   * @param from - 当前状态
   * @param to - 目标状态
   * @throws {Error} 如果状态转换不合法
   *
   * @example
   * ```typescript
   * TenantStatusTransition.validateTransition(
   *   TenantStatus.TRIAL,
   *   TenantStatus.ACTIVE
   * ); // OK
   *
   * TenantStatusTransition.validateTransition(
   *   TenantStatus.DELETED,
   *   TenantStatus.ACTIVE
   * ); // throws Error: 不允许从 DELETED 状态转换到 ACTIVE 状态
   * ```
   */
  public static validateTransition(from: TenantStatus, to: TenantStatus): void {
    if (!this.isTransitionAllowed(from, to)) {
      throw new Error(`不允许从 ${from} 状态转换到 ${to} 状态`);
    }
  }
}
