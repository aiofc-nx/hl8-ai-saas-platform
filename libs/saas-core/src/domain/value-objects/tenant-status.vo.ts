/**
 * 租户状态值对象
 *
 * @description 表示租户的状态，支持状态机转换和生命周期管理
 * @since 1.0.0
 */

import { BaseValueObject } from "./base-value-object.js";

/**
 * 租户状态枚举
 */
export enum TenantStatusEnum {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
}

/**
 * 租户状态转换规则
 */
export interface TenantStatusTransition {
  readonly from: TenantStatusEnum;
  readonly to: TenantStatusEnum;
  readonly reason: string;
  readonly requiresApproval: boolean;
}

/**
 * 租户状态值对象
 *
 * 租户状态定义了租户在其生命周期中的当前状态。
 * 支持5种状态：ACTIVE、SUSPENDED、PENDING、EXPIRED、CANCELLED，
 * 状态转换遵循严格的状态机规则。
 *
 * @example
 * ```typescript
 * const status = new TenantStatus(TenantStatusEnum.ACTIVE);
 * console.log(status.canTransitionTo(TenantStatusEnum.SUSPENDED)); // true
 * ```
 */
export class TenantStatus extends BaseValueObject<TenantStatusEnum> {
  private static readonly TRANSITIONS: TenantStatusTransition[] = [
    {
      from: TenantStatusEnum.PENDING,
      to: TenantStatusEnum.ACTIVE,
      reason: "approval",
      requiresApproval: false,
    },
    {
      from: TenantStatusEnum.ACTIVE,
      to: TenantStatusEnum.SUSPENDED,
      reason: "violation",
      requiresApproval: true,
    },
    {
      from: TenantStatusEnum.SUSPENDED,
      to: TenantStatusEnum.ACTIVE,
      reason: "resolution",
      requiresApproval: true,
    },
    {
      from: TenantStatusEnum.ACTIVE,
      to: TenantStatusEnum.EXPIRED,
      reason: "subscription_expired",
      requiresApproval: false,
    },
    {
      from: TenantStatusEnum.EXPIRED,
      to: TenantStatusEnum.ACTIVE,
      reason: "renewal",
      requiresApproval: false,
    },
    {
      from: TenantStatusEnum.ACTIVE,
      to: TenantStatusEnum.CANCELLED,
      reason: "cancellation",
      requiresApproval: true,
    },
    {
      from: TenantStatusEnum.SUSPENDED,
      to: TenantStatusEnum.CANCELLED,
      reason: "termination",
      requiresApproval: true,
    },
    {
      from: TenantStatusEnum.EXPIRED,
      to: TenantStatusEnum.CANCELLED,
      reason: "non_renewal",
      requiresApproval: false,
    },
  ];

  constructor(value: TenantStatusEnum) {
    super(value);
    this.validateValue(value);
  }

  /**
   * 验证租户状态
   *
   * @param value - 租户状态值
   * @throws {Error} 当状态无效时抛出错误
   */
  private validateValue(value: TenantStatusEnum): void {
    if (!Object.values(TenantStatusEnum).includes(value)) {
      throw new Error(`无效的租户状态: ${value}`);
    }
  }

  /**
   * 检查是否可以转换到指定状态
   *
   * @param targetStatus - 目标状态
   * @returns 是否可以转换
   */
  canTransitionTo(targetStatus: TenantStatusEnum): boolean {
    return TenantStatus.TRANSITIONS.some(
      (transition) =>
        transition.from === this.value && transition.to === targetStatus,
    );
  }

  /**
   * 获取状态转换信息
   *
   * @param targetStatus - 目标状态
   * @returns 转换信息或null
   */
  getTransitionInfo(
    targetStatus: TenantStatusEnum,
  ): TenantStatusTransition | null {
    return (
      TenantStatus.TRANSITIONS.find(
        (transition) =>
          transition.from === this.value && transition.to === targetStatus,
      ) || null
    );
  }

  /**
   * 获取所有可能的状态转换
   *
   * @returns 可能的状态转换列表
   */
  getPossibleTransitions(): TenantStatusTransition[] {
    return TenantStatus.TRANSITIONS.filter(
      (transition) => transition.from === this.value,
    );
  }

  /**
   * 检查是否为活跃状态
   *
   * @returns 是否为活跃状态
   */
  isActive(): boolean {
    return this.value === TenantStatusEnum.ACTIVE;
  }

  /**
   * 检查是否为暂停状态
   *
   * @returns 是否为暂停状态
   */
  isSuspended(): boolean {
    return this.value === TenantStatusEnum.SUSPENDED;
  }

  /**
   * 检查是否为待处理状态
   *
   * @returns 是否为待处理状态
   */
  isPending(): boolean {
    return this.value === TenantStatusEnum.PENDING;
  }

  /**
   * 检查是否已过期
   *
   * @returns 是否已过期
   */
  isExpired(): boolean {
    return this.value === TenantStatusEnum.EXPIRED;
  }

  /**
   * 检查是否已取消
   *
   * @returns 是否已取消
   */
  isCancelled(): boolean {
    return this.value === TenantStatusEnum.CANCELLED;
  }

  /**
   * 检查是否为终端状态（不可再转换）
   *
   * @returns 是否为终端状态
   */
  isTerminal(): boolean {
    return this.value === TenantStatusEnum.CANCELLED;
  }

  /**
   * 检查是否需要审批才能转换
   *
   * @param targetStatus - 目标状态
   * @returns 是否需要审批
   */
  requiresApprovalForTransition(targetStatus: TenantStatusEnum): boolean {
    const transition = this.getTransitionInfo(targetStatus);
    return transition ? transition.requiresApproval : false;
  }

  /**
   * 获取状态描述
   *
   * @returns 状态描述
   */
  getDescription(): string {
    const descriptions = {
      [TenantStatusEnum.ACTIVE]: "活跃",
      [TenantStatusEnum.SUSPENDED]: "暂停",
      [TenantStatusEnum.PENDING]: "待处理",
      [TenantStatusEnum.EXPIRED]: "已过期",
      [TenantStatusEnum.CANCELLED]: "已取消",
    };
    return descriptions[this.value];
  }

  /**
   * 获取租户状态的字符串表示
   *
   * @returns 租户状态字符串
   */
  toString(): string {
    return this.value;
  }

  /**
   * 检查是否为有效的租户状态
   *
   * @param value - 要检查的值
   * @returns 是否为有效状态
   */
  static isValid(value: string): boolean {
    return Object.values(TenantStatusEnum).includes(value as TenantStatusEnum);
  }

  /**
   * 获取所有可用的租户状态
   *
   * @returns 所有租户状态列表
   */
  static getAllStatuses(): TenantStatusEnum[] {
    return Object.values(TenantStatusEnum);
  }

  /**
   * 获取状态转换规则
   *
   * @returns 状态转换规则列表
   */
  static getTransitions(): readonly TenantStatusTransition[] {
    return TenantStatus.TRANSITIONS;
  }
}
