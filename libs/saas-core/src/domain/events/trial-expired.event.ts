/**
 * 试用期过期事件
 *
 * @description 表示租户试用期过期时触发的领域事件
 * @since 1.0.0
 */

import { DomainEvent } from "@hl8/domain-kernel";
import { TenantId } from "@hl8/domain-kernel";
import { UserId } from "@hl8/domain-kernel";
import { TrialPeriodStatus } from "../services/trial-period.service.js";

/**
 * 试用期过期事件接口
 */
export interface ITrialExpiredEvent {
  readonly tenantId: TenantId;
  readonly userId: UserId;
  readonly expiredAt: Date;
  readonly trialStartDate: Date;
  readonly trialEndDate: Date;
  readonly gracePeriodDays: number;
  readonly status: TrialPeriodStatus;
  readonly metadata: Record<string, unknown>;
}

/**
 * 试用期过期事件
 *
 * 试用期过期事件在租户试用期过期时触发，包含试用期的详细信息。
 * 事件包含租户ID、用户ID、过期时间、试用期信息等数据。
 *
 * @example
 * ```typescript
 * const event = new TrialExpiredEvent({
 *   tenantId: new TenantId("tenant-123"),
 *   userId: new UserId("user-456"),
 *   expiredAt: new Date(),
 *   trialStartDate: new Date("2024-01-01"),
 *   trialEndDate: new Date("2024-01-31"),
 *   gracePeriodDays: 7,
 *   status: TrialPeriodStatus.EXPIRED,
 *   metadata: { source: "automatic", reason: "trial_expired" }
 * });
 * ```
 */
export class TrialExpiredEvent
  extends DomainEvent
  implements ITrialExpiredEvent
{
  public readonly tenantId: TenantId;
  public readonly userId: UserId;
  public readonly expiredAt: Date;
  public readonly trialStartDate: Date;
  public readonly trialEndDate: Date;
  public readonly gracePeriodDays: number;
  public readonly status: TrialPeriodStatus;
  public readonly metadata: Record<string, unknown>;

  constructor(eventData: ITrialExpiredEvent) {
    super();
    this.tenantId = eventData.tenantId;
    this.userId = eventData.userId;
    this.expiredAt = eventData.expiredAt;
    this.trialStartDate = eventData.trialStartDate;
    this.trialEndDate = eventData.trialEndDate;
    this.gracePeriodDays = eventData.gracePeriodDays;
    this.status = eventData.status;
    this.metadata = eventData.metadata;
    this.validateEvent(eventData);
  }

  /**
   * 验证试用期过期事件
   *
   * @param eventData - 事件数据
   * @throws {Error} 当事件数据无效时抛出错误
   */
  private validateEvent(eventData: ITrialExpiredEvent): void {
    if (!eventData.tenantId) {
      throw new Error("租户ID不能为空");
    }
    if (!eventData.userId) {
      throw new Error("用户ID不能为空");
    }
    if (!eventData.expiredAt) {
      throw new Error("过期时间不能为空");
    }
    if (!eventData.trialStartDate) {
      throw new Error("试用期开始时间不能为空");
    }
    if (!eventData.trialEndDate) {
      throw new Error("试用期结束时间不能为空");
    }
    if (eventData.gracePeriodDays < 0) {
      throw new Error("宽限期天数不能为负数");
    }
    if (eventData.trialStartDate >= eventData.trialEndDate) {
      throw new Error("试用期开始时间必须早于结束时间");
    }
    if (eventData.trialEndDate > eventData.expiredAt) {
      throw new Error("试用期结束时间必须早于或等于过期时间");
    }
  }

  /**
   * 获取试用期持续时间（天数）
   *
   * @returns 试用期持续时间
   */
  getTrialDuration(): number {
    const diffTime =
      this.trialEndDate.getTime() - this.trialStartDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * 获取宽限期结束时间
   *
   * @returns 宽限期结束时间
   */
  getGracePeriodEndDate(): Date {
    const gracePeriodEndDate = new Date(this.trialEndDate);
    gracePeriodEndDate.setDate(
      gracePeriodEndDate.getDate() + this.gracePeriodDays,
    );
    return gracePeriodEndDate;
  }

  /**
   * 检查是否在宽限期内
   *
   * @returns 是否在宽限期内
   */
  isInGracePeriod(): boolean {
    const now = new Date();
    const gracePeriodEndDate = this.getGracePeriodEndDate();
    return now <= gracePeriodEndDate;
  }

  /**
   * 获取剩余宽限期天数
   *
   * @returns 剩余宽限期天数
   */
  getRemainingGracePeriodDays(): number {
    if (!this.isInGracePeriod()) {
      return 0;
    }
    const now = new Date();
    const gracePeriodEndDate = this.getGracePeriodEndDate();
    const diffTime = gracePeriodEndDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  /**
   * 检查是否需要发送提醒
   *
   * @param reminderDays - 提醒天数
   * @returns 是否需要发送提醒
   */
  shouldSendReminder(reminderDays: number = 3): boolean {
    const now = new Date();
    const reminderDate = new Date(this.trialEndDate);
    reminderDate.setDate(reminderDate.getDate() - reminderDays);
    return now >= reminderDate && now <= this.trialEndDate;
  }

  /**
   * 获取事件类型
   *
   * @returns 事件类型
   */
  getEventType(): string {
    return "TrialExpiredEvent";
  }

  /**
   * 获取事件版本
   *
   * @returns 事件版本
   */
  getEventVersion(): string {
    return "1.0.0";
  }

  /**
   * 获取事件ID
   *
   * @returns 事件ID
   */
  getEventId(): string {
    return `trial-expired-${this.tenantId.value}-${this.userId.value}-${this.expiredAt.getTime()}`;
  }

  /**
   * 获取事件聚合根ID
   *
   * @returns 聚合根ID
   */
  getAggregateId(): string {
    return this.tenantId.value;
  }

  /**
   * 获取事件时间戳
   *
   * @returns 事件时间戳
   */
  getTimestamp(): Date {
    return this.expiredAt;
  }

  /**
   * 获取事件数据
   *
   * @returns 事件数据
   */
  getEventData(): Record<string, unknown> {
    return {
      tenantId: this.tenantId.value,
      userId: this.userId.value,
      expiredAt: this.expiredAt.toISOString(),
      trialStartDate: this.trialStartDate.toISOString(),
      trialEndDate: this.trialEndDate.toISOString(),
      gracePeriodDays: this.gracePeriodDays,
      status: this.status,
      metadata: this.metadata,
    };
  }

  /**
   * 获取事件的字符串表示
   *
   * @returns 字符串表示
   */
  toString(): string {
    return `TrialExpiredEvent(tenantId: ${this.tenantId.value}, userId: ${this.userId.value}, expiredAt: ${this.expiredAt.toISOString()}, status: ${this.status})`;
  }

  /**
   * 创建试用期过期事件
   *
   * @param tenantId - 租户ID
   * @param userId - 用户ID
   * @param trialStartDate - 试用期开始时间
   * @param trialEndDate - 试用期结束时间
   * @param gracePeriodDays - 宽限期天数
   * @param metadata - 元数据
   * @returns 试用期过期事件
   */
  static create(
    tenantId: TenantId,
    userId: UserId,
    trialStartDate: Date,
    trialEndDate: Date,
    gracePeriodDays: number = 7,
    metadata: Record<string, unknown> = {},
  ): TrialExpiredEvent {
    return new TrialExpiredEvent({
      tenantId,
      userId,
      expiredAt: new Date(),
      trialStartDate,
      trialEndDate,
      gracePeriodDays,
      status: TrialPeriodStatus.EXPIRED,
      metadata,
    });
  }

  /**
   * 从事件数据创建试用期过期事件
   *
   * @param eventData - 事件数据
   * @returns 试用期过期事件
   */
  static fromEventData(eventData: Record<string, unknown>): TrialExpiredEvent {
    return new TrialExpiredEvent({
      tenantId: new TenantId(eventData.tenantId as string),
      userId: new UserId(eventData.userId as string),
      expiredAt: new Date(eventData.expiredAt as string),
      trialStartDate: new Date(eventData.trialStartDate as string),
      trialEndDate: new Date(eventData.trialEndDate as string),
      gracePeriodDays: eventData.gracePeriodDays as number,
      status: eventData.status as TrialPeriodStatus,
      metadata: eventData.metadata as Record<string, unknown>,
    });
  }
}
