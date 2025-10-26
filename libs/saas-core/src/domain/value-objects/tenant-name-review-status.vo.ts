/**
 * 租户名称审核状态值对象
 *
 * @description 表示租户名称审核的状态信息，包括审核状态、审核结果、审核意见等
 * @since 1.0.0
 */

import { BaseValueObject } from "./base-value-object.js";
import { UserId } from "@hl8/domain-kernel";

/**
 * 租户名称审核状态枚举
 */
export enum TenantNameReviewStatusEnum {
  PENDING = "PENDING",
  IN_REVIEW = "IN_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

/**
 * 租户名称审核结果枚举
 */
export enum TenantNameReviewResult {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  NEEDS_REVISION = "NEEDS_REVISION",
  PENDING_ADDITIONAL_INFO = "PENDING_ADDITIONAL_INFO",
}

/**
 * 租户名称审核状态接口
 */
export interface ITenantNameReviewStatus {
  readonly status: TenantNameReviewStatusEnum;
  readonly result?: TenantNameReviewResult;
  readonly reviewedBy?: UserId;
  readonly reviewedAt?: Date;
  readonly comments?: string;
  readonly rejectionReason?: string;
  readonly revisionNotes?: string;
  readonly additionalInfoRequired?: string;
  readonly metadata: Record<string, unknown>;
}

/**
 * 租户名称审核状态值对象
 *
 * 租户名称审核状态值对象表示租户名称审核的状态信息，包括审核状态、审核结果、审核意见等。
 * 支持多种审核状态、审核结果、审核意见管理等功能。
 *
 * @example
 * ```typescript
 * const status = new TenantNameReviewStatus({
 *   status: TenantNameReviewStatusEnum.APPROVED,
 *   result: TenantNameReviewResult.APPROVED,
 *   reviewedBy: UserId.create("reviewer-123"),
 *   reviewedAt: new Date(),
 *   comments: "名称符合要求",
 *   metadata: { source: "manual", category: "compliance" }
 * });
 * ```
 */
export class TenantNameReviewStatus extends BaseValueObject<ITenantNameReviewStatus> {
  constructor(status: ITenantNameReviewStatus) {
    super(status);
    this.validateStatus(status);
  }

  /**
   * 验证租户名称审核状态
   *
   * @param status - 租户名称审核状态
   * @throws {Error} 当状态无效时抛出错误
   */
  private validateStatus(status: ITenantNameReviewStatus): void {
    if (!status.status) {
      throw new Error("审核状态不能为空");
    }

    // 验证状态和结果的一致性
    if (
      status.status === TenantNameReviewStatusEnum.APPROVED &&
      status.result &&
      status.result !== TenantNameReviewResult.APPROVED
    ) {
      throw new Error("审核状态为已通过时，审核结果必须为已通过");
    }

    if (
      status.status === TenantNameReviewStatusEnum.REJECTED &&
      status.result &&
      status.result !== TenantNameReviewResult.REJECTED
    ) {
      throw new Error("审核状态为已拒绝时，审核结果必须为已拒绝");
    }

    // 验证审核者信息
    if (
      (status.status === TenantNameReviewStatusEnum.APPROVED ||
        status.status === TenantNameReviewStatusEnum.REJECTED) &&
      !status.reviewedBy
    ) {
      throw new Error("审核状态为已通过或已拒绝时，审核者不能为空");
    }

    if (
      (status.status === TenantNameReviewStatusEnum.APPROVED ||
        status.status === TenantNameReviewStatusEnum.REJECTED) &&
      !status.reviewedAt
    ) {
      throw new Error("审核状态为已通过或已拒绝时，审核时间不能为空");
    }

    // 验证拒绝原因
    if (
      status.status === TenantNameReviewStatusEnum.REJECTED &&
      (!status.rejectionReason || status.rejectionReason.trim().length === 0)
    ) {
      throw new Error("审核状态为已拒绝时，拒绝原因不能为空");
    }
  }

  /**
   * 获取审核状态
   *
   * @returns 审核状态
   */
  get status(): TenantNameReviewStatusEnum {
    return this.value.status;
  }

  /**
   * 获取审核结果
   *
   * @returns 审核结果或undefined
   */
  get result(): TenantNameReviewResult | undefined {
    return this.value.result;
  }

  /**
   * 获取审核者
   *
   * @returns 审核者或undefined
   */
  get reviewedBy(): UserId | undefined {
    return this.value.reviewedBy;
  }

  /**
   * 获取审核时间
   *
   * @returns 审核时间或undefined
   */
  get reviewedAt(): Date | undefined {
    return this.value.reviewedAt;
  }

  /**
   * 获取审核意见
   *
   * @returns 审核意见或undefined
   */
  get comments(): string | undefined {
    return this.value.comments;
  }

  /**
   * 获取拒绝原因
   *
   * @returns 拒绝原因或undefined
   */
  get rejectionReason(): string | undefined {
    return this.value.rejectionReason;
  }

  /**
   * 获取修订说明
   *
   * @returns 修订说明或undefined
   */
  get revisionNotes(): string | undefined {
    return this.value.revisionNotes;
  }

  /**
   * 获取需要额外信息
   *
   * @returns 需要额外信息或undefined
   */
  get additionalInfoRequired(): string | undefined {
    return this.value.additionalInfoRequired;
  }

  /**
   * 获取元数据
   *
   * @returns 元数据
   */
  get metadata(): Record<string, unknown> {
    return this.value.metadata;
  }

  /**
   * 检查审核状态是否为待审核
   *
   * @returns 是否为待审核
   */
  isPending(): boolean {
    return this.value.status === TenantNameReviewStatusEnum.PENDING;
  }

  /**
   * 检查审核状态是否为审核中
   *
   * @returns 是否为审核中
   */
  isInReview(): boolean {
    return this.value.status === TenantNameReviewStatusEnum.IN_REVIEW;
  }

  /**
   * 检查审核状态是否为已通过
   *
   * @returns 是否为已通过
   */
  isApproved(): boolean {
    return this.value.status === TenantNameReviewStatusEnum.APPROVED;
  }

  /**
   * 检查审核状态是否为已拒绝
   *
   * @returns 是否为已拒绝
   */
  isRejected(): boolean {
    return this.value.status === TenantNameReviewStatusEnum.REJECTED;
  }

  /**
   * 检查审核状态是否为已取消
   *
   * @returns 是否为已取消
   */
  isCancelled(): boolean {
    return this.value.status === TenantNameReviewStatusEnum.CANCELLED;
  }

  /**
   * 检查审核状态是否为已过期
   *
   * @returns 是否为已过期
   */
  isExpired(): boolean {
    return this.value.status === TenantNameReviewStatusEnum.EXPIRED;
  }

  /**
   * 检查审核状态是否为已完成
   *
   * @returns 是否为已完成
   */
  isCompleted(): boolean {
    return (
      this.value.status === TenantNameReviewStatusEnum.APPROVED ||
      this.value.status === TenantNameReviewStatusEnum.REJECTED ||
      this.value.status === TenantNameReviewStatusEnum.CANCELLED ||
      this.value.status === TenantNameReviewStatusEnum.EXPIRED
    );
  }

  /**
   * 检查审核状态是否为活跃状态
   *
   * @returns 是否为活跃状态
   */
  isActive(): boolean {
    return (
      this.value.status === TenantNameReviewStatusEnum.PENDING ||
      this.value.status === TenantNameReviewStatusEnum.IN_REVIEW
    );
  }

  /**
   * 检查是否需要修订
   *
   * @returns 是否需要修订
   */
  needsRevision(): boolean {
    return this.value.result === TenantNameReviewResult.NEEDS_REVISION;
  }

  /**
   * 检查是否需要额外信息
   *
   * @returns 是否需要额外信息
   */
  needsAdditionalInfo(): boolean {
    return this.value.result === TenantNameReviewResult.PENDING_ADDITIONAL_INFO;
  }

  /**
   * 获取审核持续时间（小时）
   *
   * @returns 审核持续时间
   */
  getReviewDuration(): number {
    if (!this.value.reviewedAt) {
      return 0;
    }
    const now = new Date();
    const diffTime = now.getTime() - this.value.reviewedAt.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60));
  }

  /**
   * 创建新的审核状态
   *
   * @param status - 新状态
   * @returns 新的租户名称审核状态
   */
  withStatus(status: TenantNameReviewStatusEnum): TenantNameReviewStatus {
    return new TenantNameReviewStatus({
      ...this.value,
      status,
    });
  }

  /**
   * 创建新的审核结果
   *
   * @param result - 新结果
   * @returns 新的租户名称审核状态
   */
  withResult(result: TenantNameReviewResult): TenantNameReviewStatus {
    return new TenantNameReviewStatus({
      ...this.value,
      result,
    });
  }

  /**
   * 创建新的审核者信息
   *
   * @param reviewedBy - 审核者
   * @param reviewedAt - 审核时间
   * @returns 新的租户名称审核状态
   */
  withReviewer(reviewedBy: UserId, reviewedAt: Date): TenantNameReviewStatus {
    return new TenantNameReviewStatus({
      ...this.value,
      reviewedBy,
      reviewedAt,
    });
  }

  /**
   * 创建新的审核意见
   *
   * @param comments - 审核意见
   * @returns 新的租户名称审核状态
   */
  withComments(comments: string): TenantNameReviewStatus {
    return new TenantNameReviewStatus({
      ...this.value,
      comments,
    });
  }

  /**
   * 创建新的拒绝原因
   *
   * @param rejectionReason - 拒绝原因
   * @returns 新的租户名称审核状态
   */
  withRejectionReason(rejectionReason: string): TenantNameReviewStatus {
    return new TenantNameReviewStatus({
      ...this.value,
      rejectionReason,
    });
  }

  /**
   * 创建新的修订说明
   *
   * @param revisionNotes - 修订说明
   * @returns 新的租户名称审核状态
   */
  withRevisionNotes(revisionNotes: string): TenantNameReviewStatus {
    return new TenantNameReviewStatus({
      ...this.value,
      revisionNotes,
    });
  }

  /**
   * 创建新的额外信息要求
   *
   * @param additionalInfoRequired - 额外信息要求
   * @returns 新的租户名称审核状态
   */
  withAdditionalInfoRequired(
    additionalInfoRequired: string,
  ): TenantNameReviewStatus {
    return new TenantNameReviewStatus({
      ...this.value,
      additionalInfoRequired,
    });
  }

  /**
   * 创建新的元数据
   *
   * @param metadata - 元数据
   * @returns 新的租户名称审核状态
   */
  withMetadata(metadata: Record<string, unknown>): TenantNameReviewStatus {
    return new TenantNameReviewStatus({
      ...this.value,
      metadata: { ...this.value.metadata, ...metadata },
    });
  }

  /**
   * 获取租户名称审核状态的字符串表示
   *
   * @returns 字符串表示
   */
  toString(): string {
    return `TenantNameReviewStatus(status: ${this.status}, result: ${this.result || "N/A"})`;
  }

  /**
   * 创建待审核状态
   *
   * @returns 待审核状态
   */
  static createPending(): TenantNameReviewStatus {
    return new TenantNameReviewStatus({
      status: TenantNameReviewStatusEnum.PENDING,
      metadata: {},
    });
  }

  /**
   * 创建审核中状态
   *
   * @param reviewedBy - 审核者
   * @param reviewedAt - 审核时间
   * @returns 审核中状态
   */
  static createInReview(
    reviewedBy: UserId,
    reviewedAt: Date,
  ): TenantNameReviewStatus {
    return new TenantNameReviewStatus({
      status: TenantNameReviewStatusEnum.IN_REVIEW,
      reviewedBy,
      reviewedAt,
      metadata: {},
    });
  }

  /**
   * 创建已通过状态
   *
   * @param reviewedBy - 审核者
   * @param reviewedAt - 审核时间
   * @param comments - 审核意见
   * @returns 已通过状态
   */
  static createApproved(
    reviewedBy: UserId,
    reviewedAt: Date,
    comments?: string,
  ): TenantNameReviewStatus {
    return new TenantNameReviewStatus({
      status: TenantNameReviewStatusEnum.APPROVED,
      result: TenantNameReviewResult.APPROVED,
      reviewedBy,
      reviewedAt,
      comments,
      metadata: {},
    });
  }

  /**
   * 创建已拒绝状态
   *
   * @param reviewedBy - 审核者
   * @param reviewedAt - 审核时间
   * @param rejectionReason - 拒绝原因
   * @param comments - 审核意见
   * @returns 已拒绝状态
   */
  static createRejected(
    reviewedBy: UserId,
    reviewedAt: Date,
    rejectionReason: string,
    comments?: string,
  ): TenantNameReviewStatus {
    return new TenantNameReviewStatus({
      status: TenantNameReviewStatusEnum.REJECTED,
      result: TenantNameReviewResult.REJECTED,
      reviewedBy,
      reviewedAt,
      rejectionReason,
      comments,
      metadata: {},
    });
  }

  /**
   * 创建需要修订状态
   *
   * @param reviewedBy - 审核者
   * @param reviewedAt - 审核时间
   * @param revisionNotes - 修订说明
   * @param comments - 审核意见
   * @returns 需要修订状态
   */
  static createNeedsRevision(
    reviewedBy: UserId,
    reviewedAt: Date,
    revisionNotes: string,
    comments?: string,
  ): TenantNameReviewStatus {
    return new TenantNameReviewStatus({
      status: TenantNameReviewStatusEnum.IN_REVIEW,
      result: TenantNameReviewResult.NEEDS_REVISION,
      reviewedBy,
      reviewedAt,
      revisionNotes,
      comments,
      metadata: {},
    });
  }

  /**
   * 创建需要额外信息状态
   *
   * @param reviewedBy - 审核者
   * @param reviewedAt - 审核时间
   * @param additionalInfoRequired - 额外信息要求
   * @param comments - 审核意见
   * @returns 需要额外信息状态
   */
  static createPendingAdditionalInfo(
    reviewedBy: UserId,
    reviewedAt: Date,
    additionalInfoRequired: string,
    comments?: string,
  ): TenantNameReviewStatus {
    return new TenantNameReviewStatus({
      status: TenantNameReviewStatusEnum.IN_REVIEW,
      result: TenantNameReviewResult.PENDING_ADDITIONAL_INFO,
      reviewedBy,
      reviewedAt,
      additionalInfoRequired,
      comments,
      metadata: {},
    });
  }
}
