/**
 * 租户名称审核服务
 *
 * @description 处理租户名称审核的业务逻辑，包括审核请求创建、审核流程管理、审核结果处理等
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { DomainService } from "@hl8/domain-kernel";
import { TenantId } from "@hl8/domain-kernel";
import { UserId } from "@hl8/domain-kernel";
import {
  TenantNameReviewRequest,
  TenantNameReviewRequestType,
  TenantNameReviewRequestPriority,
} from "../value-objects/tenant-name-review-request.vo.js";
import {
  TenantNameReviewStatus,
  TenantNameReviewStatusEnum,
  TenantNameReviewResult,
} from "../value-objects/tenant-name-review-status.vo.js";

/**
 * 租户名称审核服务
 *
 * 租户名称审核服务负责处理租户名称审核的业务逻辑，包括审核请求创建、审核流程管理、审核结果处理等。
 * 支持多种审核类型、优先级管理、审核者分配等功能。
 *
 * @example
 * ```typescript
 * const reviewService = new TenantNameReviewService();
 * const request = await reviewService.createReviewRequest(
 *   tenantId,
 *   "新公司名称",
 *   TenantNameReviewRequestType.NAME_CHANGE,
 *   "公司更名",
 *   requestedBy
 * );
 * ```
 */
@Injectable()
export class TenantNameReviewService extends DomainService {
  constructor() {
    super();
    this.setContext("TenantNameReviewService");
  }

  /**
   * 创建审核请求
   *
   * @param tenantId - 租户ID
   * @param requestedName - 请求的租户名称
   * @param requestType - 审核请求类型
   * @param reason - 审核原因
   * @param requestedBy - 请求者
   * @param priority - 优先级
   * @param currentName - 当前租户名称
   * @param metadata - 元数据
   * @returns 审核请求
   */
  async createReviewRequest(
    tenantId: TenantId,
    requestedName: string,
    requestType: TenantNameReviewRequestType,
    reason: string,
    requestedBy: UserId,
    priority: TenantNameReviewRequestPriority = TenantNameReviewRequestPriority.MEDIUM,
    currentName?: string,
    metadata: Record<string, unknown> = {},
  ): Promise<TenantNameReviewRequest> {
    this.logger.log(
      `Creating review request for tenant ${tenantId.value} with name "${requestedName}"`,
      this.context,
    );

    const request = TenantNameReviewRequest.create(
      tenantId,
      requestedName,
      requestType,
      reason,
      requestedBy,
      priority,
      currentName,
      metadata,
    );

    this.logger.log(
      `Review request created with ID: ${request.id}`,
      this.context,
    );

    return request;
  }

  /**
   * 分配审核者
   *
   * @param request - 审核请求
   * @param assignedTo - 分配给的审核者
   * @param assignedAt - 分配时间
   * @returns 更新后的审核请求
   */
  async assignReviewer(
    request: TenantNameReviewRequest,
    assignedTo: UserId,
    assignedAt: Date = new Date(),
  ): Promise<TenantNameReviewRequest> {
    this.logger.log(
      `Assigning reviewer ${assignedTo.value} to review request ${request.id}`,
      this.context,
    );

    if (request.isAssigned()) {
      throw new Error("审核请求已经被分配");
    }

    const updatedRequest = request.withAssignment(assignedTo, assignedAt);

    this.logger.log(
      `Reviewer assigned successfully to request ${request.id}`,
      this.context,
    );

    return updatedRequest;
  }

  /**
   * 设置审核截止时间
   *
   * @param request - 审核请求
   * @param deadline - 截止时间
   * @returns 更新后的审核请求
   */
  async setDeadline(
    request: TenantNameReviewRequest,
    deadline: Date,
  ): Promise<TenantNameReviewRequest> {
    this.logger.log(
      `Setting deadline ${deadline.toISOString()} for review request ${request.id}`,
      this.context,
    );

    if (deadline <= request.requestedAt) {
      throw new Error("截止时间必须晚于请求时间");
    }

    const updatedRequest = request.withDeadline(deadline);

    this.logger.log(
      `Deadline set successfully for request ${request.id}`,
      this.context,
    );

    return updatedRequest;
  }

  /**
   * 更新审核优先级
   *
   * @param request - 审核请求
   * @param priority - 新优先级
   * @returns 更新后的审核请求
   */
  async updatePriority(
    request: TenantNameReviewRequest,
    priority: TenantNameReviewRequestPriority,
  ): Promise<TenantNameReviewRequest> {
    this.logger.log(
      `Updating priority to ${priority} for review request ${request.id}`,
      this.context,
    );

    const updatedRequest = request.withPriority(priority);

    this.logger.log(
      `Priority updated successfully for request ${request.id}`,
      this.context,
    );

    return updatedRequest;
  }

  /**
   * 开始审核
   *
   * @param request - 审核请求
   * @param reviewer - 审核者
   * @param reviewedAt - 审核时间
   * @returns 审核状态
   */
  async startReview(
    request: TenantNameReviewRequest,
    reviewer: UserId,
    reviewedAt: Date = new Date(),
  ): Promise<TenantNameReviewStatus> {
    this.logger.log(
      `Starting review for request ${request.id} by reviewer ${reviewer.value}`,
      this.context,
    );

    if (!request.isAssigned()) {
      throw new Error("审核请求尚未分配审核者");
    }

    if (request.assignedTo && !request.assignedTo.equals(reviewer)) {
      throw new Error("只有分配的审核者才能开始审核");
    }

    const status = TenantNameReviewStatus.createInReview(reviewer, reviewedAt);

    this.logger.log(
      `Review started successfully for request ${request.id}`,
      this.context,
    );

    return status;
  }

  /**
   * 完成审核
   *
   * @param request - 审核请求
   * @param status - 审核状态
   * @param result - 审核结果
   * @param reviewer - 审核者
   * @param reviewedAt - 审核时间
   * @param comments - 审核意见
   * @returns 审核状态
   */
  async completeReview(
    request: TenantNameReviewRequest,
    status: TenantNameReviewStatus,
    result: TenantNameReviewResult,
    reviewer: UserId,
    reviewedAt: Date = new Date(),
    comments?: string,
  ): Promise<TenantNameReviewStatus> {
    this.logger.log(
      `Completing review for request ${request.id} with result ${result}`,
      this.context,
    );

    if (!status.isInReview()) {
      throw new Error("只有审核中状态的请求才能完成审核");
    }

    let updatedStatus: TenantNameReviewStatus;

    switch (result) {
      case TenantNameReviewResult.APPROVED:
        updatedStatus = TenantNameReviewStatus.createApproved(
          reviewer,
          reviewedAt,
          comments,
        );
        break;
      case TenantNameReviewResult.REJECTED:
        updatedStatus = TenantNameReviewStatus.createRejected(
          reviewer,
          reviewedAt,
          "审核未通过",
          comments,
        );
        break;
      case TenantNameReviewResult.NEEDS_REVISION:
        updatedStatus = TenantNameReviewStatus.createNeedsRevision(
          reviewer,
          reviewedAt,
          "需要修订",
          comments,
        );
        break;
      case TenantNameReviewResult.PENDING_ADDITIONAL_INFO:
        updatedStatus = TenantNameReviewStatus.createPendingAdditionalInfo(
          reviewer,
          reviewedAt,
          "需要额外信息",
          comments,
        );
        break;
      default:
        throw new Error(`未知的审核结果: ${result}`);
    }

    this.logger.log(
      `Review completed successfully for request ${request.id}`,
      this.context,
    );

    return updatedStatus;
  }

  /**
   * 拒绝审核请求
   *
   * @param request - 审核请求
   * @param status - 审核状态
   * @param reviewer - 审核者
   * @param rejectionReason - 拒绝原因
   * @param reviewedAt - 审核时间
   * @param comments - 审核意见
   * @returns 审核状态
   */
  async rejectReview(
    request: TenantNameReviewRequest,
    status: TenantNameReviewStatus,
    reviewer: UserId,
    rejectionReason: string,
    reviewedAt: Date = new Date(),
    comments?: string,
  ): Promise<TenantNameReviewStatus> {
    this.logger.log(
      `Rejecting review for request ${request.id} with reason: ${rejectionReason}`,
      this.context,
    );

    if (!status.isInReview()) {
      throw new Error("只有审核中状态的请求才能被拒绝");
    }

    const updatedStatus = TenantNameReviewStatus.createRejected(
      reviewer,
      reviewedAt,
      rejectionReason,
      comments,
    );

    this.logger.log(
      `Review rejected successfully for request ${request.id}`,
      this.context,
    );

    return updatedStatus;
  }

  /**
   * 取消审核请求
   *
   * @param request - 审核请求
   * @param status - 审核状态
   * @param reason - 取消原因
   * @returns 审核状态
   */
  async cancelReview(
    request: TenantNameReviewRequest,
    status: TenantNameReviewStatus,
    reason: string,
  ): Promise<TenantNameReviewStatus> {
    this.logger.log(
      `Cancelling review for request ${request.id} with reason: ${reason}`,
      this.context,
    );

    if (status.isCompleted()) {
      throw new Error("已完成的审核请求不能被取消");
    }

    const updatedStatus = status.withStatus(
      TenantNameReviewStatusEnum.CANCELLED,
    );

    this.logger.log(
      `Review cancelled successfully for request ${request.id}`,
      this.context,
    );

    return updatedStatus;
  }

  /**
   * 检查审核请求是否过期
   *
   * @param request - 审核请求
   * @returns 是否过期
   */
  async checkExpiration(request: TenantNameReviewRequest): Promise<boolean> {
    if (!request.deadline) {
      return false;
    }

    const isExpired = request.isExpired();

    if (isExpired) {
      this.logger.warn(
        `Review request ${request.id} has expired`,
        this.context,
      );
    }

    return isExpired;
  }

  /**
   * 检查审核请求是否即将过期
   *
   * @param request - 审核请求
   * @param warningHours - 警告小时数
   * @returns 是否即将过期
   */
  async checkExpirationWarning(
    request: TenantNameReviewRequest,
    warningHours: number = 24,
  ): Promise<boolean> {
    if (!request.deadline) {
      return false;
    }

    const isExpiringSoon = request.isExpiringSoon(warningHours);

    if (isExpiringSoon) {
      this.logger.warn(
        `Review request ${request.id} is expiring soon`,
        this.context,
      );
    }

    return isExpiringSoon;
  }

  /**
   * 获取审核请求统计信息
   *
   * @param requests - 审核请求列表
   * @returns 统计信息
   */
  async getReviewStatistics(
    requests: readonly TenantNameReviewRequest[],
  ): Promise<{
    readonly totalRequests: number;
    readonly pendingRequests: number;
    readonly inReviewRequests: number;
    readonly completedRequests: number;
    readonly cancelledRequests: number;
    readonly expiredRequests: number;
    hasExpiredRequests: boolean;
    hasExpiringSoonRequests: boolean;
  }> {
    const totalRequests = requests.length;
    let pendingRequests = 0;
    let inReviewRequests = 0;
    let completedRequests = 0;
    let cancelledRequests = 0;
    let expiredRequests = 0;
    let hasExpiredRequests = false;
    let hasExpiringSoonRequests = false;

    for (const request of requests) {
      if (request.isExpired()) {
        expiredRequests++;
        hasExpiredRequests = true;
      } else if (request.isExpiringSoon()) {
        hasExpiringSoonRequests = true;
      }
    }

    return {
      totalRequests,
      pendingRequests,
      inReviewRequests,
      completedRequests,
      cancelledRequests,
      expiredRequests,
      hasExpiredRequests,
      hasExpiringSoonRequests,
    };
  }

  /**
   * 获取审核请求建议
   *
   * @param request - 审核请求
   * @returns 审核建议
   */
  async getReviewRecommendations(request: TenantNameReviewRequest): Promise<{
    readonly priority: TenantNameReviewRequestPriority;
    readonly suggestedDeadline: Date;
    readonly estimatedReviewTime: number;
    readonly requiredReviewers: number;
  }> {
    // 根据请求类型和优先级计算建议
    let priority = request.priority;
    let suggestedDeadline = new Date();
    let estimatedReviewTime = 24; // 小时
    let requiredReviewers = 1;

    // 根据请求类型调整建议
    switch (request.requestType) {
      case TenantNameReviewRequestType.INITIAL_REVIEW:
        priority = TenantNameReviewRequestPriority.HIGH;
        estimatedReviewTime = 48;
        requiredReviewers = 2;
        break;
      case TenantNameReviewRequestType.NAME_CHANGE:
        priority = TenantNameReviewRequestPriority.MEDIUM;
        estimatedReviewTime = 24;
        requiredReviewers = 1;
        break;
      case TenantNameReviewRequestType.COMPLIANCE_CHECK:
        priority = TenantNameReviewRequestPriority.HIGH;
        estimatedReviewTime = 72;
        requiredReviewers = 2;
        break;
      case TenantNameReviewRequestType.MANUAL_REVIEW:
        priority = TenantNameReviewRequestPriority.URGENT;
        estimatedReviewTime = 12;
        requiredReviewers = 1;
        break;
      case TenantNameReviewRequestType.APPEAL:
        priority = TenantNameReviewRequestPriority.HIGH;
        estimatedReviewTime = 96;
        requiredReviewers = 3;
        break;
    }

    // 设置建议截止时间
    suggestedDeadline.setHours(
      suggestedDeadline.getHours() + estimatedReviewTime,
    );

    return {
      priority,
      suggestedDeadline,
      estimatedReviewTime,
      requiredReviewers,
    };
  }
}
