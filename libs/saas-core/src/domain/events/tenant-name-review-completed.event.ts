/**
 * 租户名称审核完成事件
 *
 * @description 表示租户名称审核已完成的事件
 * @since 1.0.0
 */

import { DomainEventBase, EntityId, GenericEntityId, TenantId, UserId } from "@hl8/domain-kernel";
import {
  TenantNameReviewRequestType,
  TenantNameReviewRequestPriority,
} from "../value-objects/tenant-name-review-request.vo.js";
import {
  TenantNameReviewStatusEnum,
  TenantNameReviewResult,
} from "../value-objects/tenant-name-review-status.vo.js";
import { randomUUID } from "node:crypto";

/**
 * 租户名称审核完成事件接口
 */
export interface ITenantNameReviewCompletedEvent {
  readonly tenantId: TenantId;
  readonly requestId: string;
  readonly requestedName: string;
  readonly currentName?: string;
  readonly requestType: TenantNameReviewRequestType;
  readonly priority: TenantNameReviewRequestPriority;
  readonly reason: string;
  readonly requestedBy: UserId;
  readonly requestedAt: Date;
  readonly reviewedBy: UserId;
  readonly reviewedAt: Date;
  readonly status: TenantNameReviewStatusEnum;
  readonly result: TenantNameReviewResult;
  readonly comments?: string;
  readonly rejectionReason?: string;
  readonly revisionNotes?: string;
  readonly additionalInfoRequired?: string;
  readonly reviewDuration: number;
  readonly metadata: Record<string, unknown>;
}

/**
 * 租户名称审核完成事件
 *
 * 租户名称审核完成事件表示租户名称审核已完成的事件。
 * 当租户名称审核完成时，系统会发布此事件以通知相关组件。
 *
 * @example
 * ```typescript
 * const event = new TenantNameReviewCompletedEvent({
 *   tenantId: TenantId.create("tenant-123"),
 *   requestId: "review-456",
 *   requestedName: "新公司名称",
 *   currentName: "旧公司名称",
 *   requestType: TenantNameReviewRequestType.NAME_CHANGE,
 *   priority: TenantNameReviewRequestPriority.MEDIUM,
 *   reason: "公司更名",
 *   requestedBy: UserId.create("user-789"),
 *   requestedAt: new Date(),
 *   reviewedBy: UserId.create("reviewer-101"),
 *   reviewedAt: new Date(),
 *   status: TenantNameReviewStatusEnum.APPROVED,
 *   result: TenantNameReviewResult.APPROVED,
 *   comments: "名称符合要求",
 *   reviewDuration: 24,
 *   metadata: { source: "manual", category: "business_change" }
 * });
 * ```
 */
export class TenantNameReviewCompletedEvent extends DomainEventBase {
  public readonly eventData: ITenantNameReviewCompletedEvent;

  constructor(aggregateId: EntityId, eventData: ITenantNameReviewCompletedEvent) {
    super(
      GenericEntityId.create(randomUUID()),
      new Date(),
      aggregateId,
      1
    );

    this.eventData = eventData;
  }

  /**
   * 获取租户ID
   *
   * @returns 租户ID
   */
  get tenantId(): TenantId {
    return this.eventData.tenantId;
  }

  /**
   * 获取请求ID
   *
   * @returns 请求ID
   */
  get requestId(): string {
    return this.eventData.requestId;
  }

  /**
   * 获取请求的租户名称
   *
   * @returns 请求的租户名称
   */
  get requestedName(): string {
    return this.eventData.requestedName;
  }

  /**
   * 获取当前租户名称
   *
   * @returns 当前租户名称或undefined
   */
  get currentName(): string | undefined {
    return this.eventData.currentName;
  }

  /**
   * 获取请求类型
   *
   * @returns 请求类型
   */
  get requestType(): TenantNameReviewRequestType {
    return this.eventData.requestType;
  }

  /**
   * 获取优先级
   *
   * @returns 优先级
   */
  get priority(): TenantNameReviewRequestPriority {
    return this.eventData.priority;
  }

  /**
   * 获取请求原因
   *
   * @returns 请求原因
   */
  get reason(): string {
    return this.eventData.reason;
  }

  /**
   * 获取请求者
   *
   * @returns 请求者
   */
  get requestedBy(): UserId {
    return this.eventData.requestedBy;
  }

  /**
   * 获取请求时间
   *
   * @returns 请求时间
   */
  get requestedAt(): Date {
    return this.eventData.requestedAt;
  }

  /**
   * 获取审核者
   *
   * @returns 审核者
   */
  get reviewedBy(): UserId {
    return this.eventData.reviewedBy;
  }

  /**
   * 获取审核时间
   *
   * @returns 审核时间
   */
  get reviewedAt(): Date {
    return this.eventData.reviewedAt;
  }

  /**
   * 获取审核状态
   *
   * @returns 审核状态
   */
  get status(): TenantNameReviewStatusEnum {
    return this.eventData.status;
  }

  /**
   * 获取审核结果
   *
   * @returns 审核结果
   */
  get result(): TenantNameReviewResult {
    return this.eventData.result;
  }

  /**
   * 获取审核意见
   *
   * @returns 审核意见或undefined
   */
  get comments(): string | undefined {
    return this.eventData.comments;
  }

  /**
   * 获取拒绝原因
   *
   * @returns 拒绝原因或undefined
   */
  get rejectionReason(): string | undefined {
    return this.eventData.rejectionReason;
  }

  /**
   * 获取修订说明
   *
   * @returns 修订说明或undefined
   */
  get revisionNotes(): string | undefined {
    return this.eventData.revisionNotes;
  }

  /**
   * 获取需要额外信息
   *
   * @returns 需要额外信息或undefined
   */
  get additionalInfoRequired(): string | undefined {
    return this.eventData.additionalInfoRequired;
  }

  /**
   * 获取审核持续时间
   *
   * @returns 审核持续时间（小时）
   */
  get reviewDuration(): number {
    return this.eventData.reviewDuration;
  }

  /**
   * 获取元数据
   *
   * @returns 元数据
   */
  get metadata(): Record<string, unknown> {
    return this.eventData.metadata;
  }

  /**
   * 检查审核是否通过
   *
   * @returns 是否通过
   */
  isApproved(): boolean {
    return (
      this.eventData.status === TenantNameReviewStatusEnum.APPROVED &&
      this.eventData.result === TenantNameReviewResult.APPROVED
    );
  }

  /**
   * 检查审核是否被拒绝
   *
   * @returns 是否被拒绝
   */
  isRejected(): boolean {
    return (
      this.eventData.status === TenantNameReviewStatusEnum.REJECTED &&
      this.eventData.result === TenantNameReviewResult.REJECTED
    );
  }

  /**
   * 检查是否需要修订
   *
   * @returns 是否需要修订
   */
  needsRevision(): boolean {
    return this.eventData.result === TenantNameReviewResult.NEEDS_REVISION;
  }

  /**
   * 检查是否需要额外信息
   *
   * @returns 是否需要额外信息
   */
  needsAdditionalInfo(): boolean {
    return (
      this.eventData.result === TenantNameReviewResult.PENDING_ADDITIONAL_INFO
    );
  }

  /**
   * 检查审核是否已完成
   *
   * @returns 是否已完成
   */
  isCompleted(): boolean {
    return (
      this.eventData.status === TenantNameReviewStatusEnum.APPROVED ||
      this.eventData.status === TenantNameReviewStatusEnum.REJECTED
    );
  }

  /**
   * 获取事件摘要
   *
   * @returns 事件摘要
   */
  getSummary(): string {
    const resultText = this.isApproved()
      ? "已通过"
      : this.isRejected()
        ? "已拒绝"
        : this.needsRevision()
          ? "需要修订"
          : this.needsAdditionalInfo()
            ? "需要额外信息"
            : "未知";

    return `租户 ${this.tenantId.getValue()} 的租户名称审核已完成，请求名称: "${this.requestedName}"，结果: ${resultText}，审核者: ${this.reviewedBy.getValue()}，持续时间: ${this.reviewDuration}小时`;
  }

  /**
   * 获取事件详细信息
   *
   * @returns 事件详细信息
   */
  getDetails(): Record<string, unknown> {
    return {
      eventType: "TenantNameReviewCompletedEvent",
      tenantId: this.tenantId.getValue(),
      requestId: this.requestId,
      requestedName: this.requestedName,
      currentName: this.currentName,
      requestType: this.requestType,
      priority: this.priority,
      reason: this.reason,
      requestedBy: this.requestedBy.getValue(),
      requestedAt: this.requestedAt.toISOString(),
      reviewedBy: this.reviewedBy.getValue(),
      reviewedAt: this.reviewedAt.toISOString(),
      status: this.status,
      result: this.result,
      comments: this.comments,
      rejectionReason: this.rejectionReason,
      revisionNotes: this.revisionNotes,
      additionalInfoRequired: this.additionalInfoRequired,
      reviewDuration: this.reviewDuration,
      isApproved: this.isApproved(),
      isRejected: this.isRejected(),
      needsRevision: this.needsRevision(),
      needsAdditionalInfo: this.needsAdditionalInfo(),
      isCompleted: this.isCompleted(),
      metadata: this.metadata,
    };
  }

  /**
   * 创建租户名称审核完成事件
   *
   * @param tenantId - 租户ID
   * @param requestId - 请求ID
   * @param requestedName - 请求的租户名称
   * @param requestType - 请求类型
   * @param reason - 请求原因
   * @param requestedBy - 请求者
   * @param requestedAt - 请求时间
   * @param reviewedBy - 审核者
   * @param reviewedAt - 审核时间
   * @param status - 审核状态
   * @param result - 审核结果
   * @param reviewDuration - 审核持续时间
   * @param currentName - 当前租户名称
   * @param priority - 优先级
   * @param comments - 审核意见
   * @param rejectionReason - 拒绝原因
   * @param revisionNotes - 修订说明
   * @param additionalInfoRequired - 需要额外信息
   * @param metadata - 元数据
   * @returns 租户名称审核完成事件
   */
  static create(
    tenantId: TenantId,
    requestId: string,
    requestedName: string,
    requestType: TenantNameReviewRequestType,
    reason: string,
    requestedBy: UserId,
    requestedAt: Date,
    reviewedBy: UserId,
    reviewedAt: Date,
    status: TenantNameReviewStatusEnum,
    result: TenantNameReviewResult,
    reviewDuration: number,
    currentName?: string,
    priority?: TenantNameReviewRequestPriority,
    comments?: string,
    rejectionReason?: string,
    revisionNotes?: string,
    additionalInfoRequired?: string,
    metadata: Record<string, unknown> = {},
  ): TenantNameReviewCompletedEvent {
    return new TenantNameReviewCompletedEvent(
      tenantId, // aggregateId
      {
        tenantId,
        requestId,
        requestedName,
        currentName,
        requestType,
        priority: priority || TenantNameReviewRequestPriority.MEDIUM,
        reason,
        requestedBy,
        requestedAt,
        reviewedBy,
        reviewedAt,
        status,
        result,
        comments,
        rejectionReason,
        revisionNotes,
        additionalInfoRequired,
        reviewDuration,
        metadata,
      }
    );
  }

  /**
   * 创建审核通过事件
   *
   * @param tenantId - 租户ID
   * @param requestId - 请求ID
   * @param requestedName - 请求的租户名称
   * @param requestType - 请求类型
   * @param reason - 请求原因
   * @param requestedBy - 请求者
   * @param requestedAt - 请求时间
   * @param reviewedBy - 审核者
   * @param reviewedAt - 审核时间
   * @param reviewDuration - 审核持续时间
   * @param comments - 审核意见
   * @param currentName - 当前租户名称
   * @param metadata - 元数据
   * @returns 审核通过事件
   */
  static createApproved(
    tenantId: TenantId,
    requestId: string,
    requestedName: string,
    requestType: TenantNameReviewRequestType,
    reason: string,
    requestedBy: UserId,
    requestedAt: Date,
    reviewedBy: UserId,
    reviewedAt: Date,
    reviewDuration: number,
    comments?: string,
    currentName?: string,
    metadata: Record<string, unknown> = {},
  ): TenantNameReviewCompletedEvent {
    return TenantNameReviewCompletedEvent.create(
      tenantId,
      requestId,
      requestedName,
      requestType,
      reason,
      requestedBy,
      requestedAt,
      reviewedBy,
      reviewedAt,
      TenantNameReviewStatusEnum.APPROVED,
      TenantNameReviewResult.APPROVED,
      reviewDuration,
      currentName,
      undefined,
      comments,
      undefined,
      undefined,
      undefined,
      metadata,
    );
  }

  /**
   * 创建审核拒绝事件
   *
   * @param tenantId - 租户ID
   * @param requestId - 请求ID
   * @param requestedName - 请求的租户名称
   * @param requestType - 请求类型
   * @param reason - 请求原因
   * @param requestedBy - 请求者
   * @param requestedAt - 请求时间
   * @param reviewedBy - 审核者
   * @param reviewedAt - 审核时间
   * @param reviewDuration - 审核持续时间
   * @param rejectionReason - 拒绝原因
   * @param comments - 审核意见
   * @param currentName - 当前租户名称
   * @param metadata - 元数据
   * @returns 审核拒绝事件
   */
  static createRejected(
    tenantId: TenantId,
    requestId: string,
    requestedName: string,
    requestType: TenantNameReviewRequestType,
    reason: string,
    requestedBy: UserId,
    requestedAt: Date,
    reviewedBy: UserId,
    reviewedAt: Date,
    reviewDuration: number,
    rejectionReason: string,
    comments?: string,
    currentName?: string,
    metadata: Record<string, unknown> = {},
  ): TenantNameReviewCompletedEvent {
    return TenantNameReviewCompletedEvent.create(
      tenantId,
      requestId,
      requestedName,
      requestType,
      reason,
      requestedBy,
      requestedAt,
      reviewedBy,
      reviewedAt,
      TenantNameReviewStatusEnum.REJECTED,
      TenantNameReviewResult.REJECTED,
      reviewDuration,
      currentName,
      undefined,
      comments,
      rejectionReason,
      undefined,
      undefined,
      metadata,
    );
  }
}
