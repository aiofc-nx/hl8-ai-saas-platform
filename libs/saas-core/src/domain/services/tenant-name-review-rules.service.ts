/**
 * 租户名称审核规则服务
 *
 * @description 处理租户名称审核的业务规则，包括审核规则验证、审核流程控制、审核结果验证等
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { BaseDomainService } from "@hl8/domain-kernel";
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
 * 租户名称审核规则服务
 *
 * 租户名称审核规则服务负责处理租户名称审核的业务规则，包括审核规则验证、审核流程控制、审核结果验证等。
 * 支持多种审核规则、流程控制、结果验证等功能。
 *
 * @example
 * ```typescript
 * const rulesService = new TenantNameReviewRulesService();
 * const isValid = await rulesService.validateReviewRequest(request);
 * ```
 */
@Injectable()
export class TenantNameReviewRulesService extends BaseDomainService {
  constructor() {
    super();
    this.setContext("TenantNameReviewRulesService");
  }

  /**
   * 验证审核请求
   *
   * @param request - 审核请求
   * @returns 验证结果
   */
  async validateReviewRequest(request: TenantNameReviewRequest): Promise<{
    readonly isValid: boolean;
    readonly errors: readonly string[];
    readonly warnings?: readonly string[];
    readonly suggestions?: readonly string[];
  }> {
    this.logger.log(`Validating review request ${request.id}`, this.context);

    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 验证租户名称格式
    if (!this.isValidTenantName(request.requestedName)) {
      errors.push("租户名称格式无效");
    }

    // 验证租户名称长度
    if (request.requestedName.length < 2) {
      errors.push("租户名称长度不能少于2个字符");
    }

    if (request.requestedName.length > 100) {
      errors.push("租户名称长度不能超过100个字符");
    }

    // 验证租户名称字符
    if (!this.isValidTenantNameCharacters(request.requestedName)) {
      errors.push("租户名称包含无效字符");
    }

    // 验证租户名称是否包含敏感词
    if (await this.containsSensitiveWords(request.requestedName)) {
      errors.push("租户名称包含敏感词");
    }

    // 验证租户名称是否与现有名称冲突
    if (await this.isNameConflict(request.requestedName, request.tenantId)) {
      errors.push("租户名称与现有名称冲突");
    }

    // 验证审核原因
    if (!request.reason || request.reason.trim().length === 0) {
      errors.push("审核原因不能为空");
    }

    if (request.reason.length > 500) {
      errors.push("审核原因长度不能超过500个字符");
    }

    // 验证优先级
    if (
      request.isUrgent() &&
      request.requestType !== TenantNameReviewRequestType.MANUAL_REVIEW
    ) {
      warnings.push("紧急优先级通常用于手动审核");
    }

    // 验证截止时间
    if (request.deadline && request.deadline <= request.requestedAt) {
      errors.push("截止时间必须晚于请求时间");
    }

    // 生成建议
    if (request.requestedName.length < 5) {
      suggestions.push("建议使用更长的租户名称以增强可识别性");
    }

    if (request.reason.length < 10) {
      suggestions.push("建议提供更详细的审核原因");
    }

    const isValid = errors.length === 0;

    this.logger.log(
      `Review request validation completed for ${request.id}: ${isValid ? "valid" : "invalid"}`,
      this.context,
    );

    return {
      isValid,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }

  /**
   * 验证审核状态转换
   *
   * @param currentStatus - 当前状态
   * @param newStatus - 新状态
   * @returns 是否允许转换
   */
  async validateStatusTransition(
    currentStatus: TenantNameReviewStatus,
    newStatus: TenantNameReviewStatusEnum,
  ): Promise<{
    readonly isValid: boolean;
    readonly errors: readonly string[];
    readonly warnings?: readonly string[];
  }> {
    this.logger.log(
      `Validating status transition from ${currentStatus.status} to ${newStatus}`,
      this.context,
    );

    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证状态转换规则
    switch (currentStatus.status) {
      case TenantNameReviewStatusEnum.PENDING:
        if (
          ![
            TenantNameReviewStatusEnum.IN_REVIEW,
            TenantNameReviewStatusEnum.CANCELLED,
          ].includes(newStatus)
        ) {
          errors.push("待审核状态只能转换为审核中或已取消");
        }
        break;
      case TenantNameReviewStatusEnum.IN_REVIEW:
        if (
          ![
            TenantNameReviewStatusEnum.APPROVED,
            TenantNameReviewStatusEnum.REJECTED,
            TenantNameReviewStatusEnum.CANCELLED,
          ].includes(newStatus)
        ) {
          errors.push("审核中状态只能转换为已通过、已拒绝或已取消");
        }
        break;
      case TenantNameReviewStatusEnum.APPROVED:
      case TenantNameReviewStatusEnum.REJECTED:
      case TenantNameReviewStatusEnum.CANCELLED:
      case TenantNameReviewStatusEnum.EXPIRED:
        errors.push("已完成的状态不能转换");
        break;
      default:
        errors.push(`未知的状态: ${currentStatus.status}`);
    }

    // 验证审核者信息
    if (
      newStatus === TenantNameReviewStatusEnum.IN_REVIEW &&
      !currentStatus.reviewedBy
    ) {
      errors.push("开始审核时必须指定审核者");
    }

    if (
      [
        TenantNameReviewStatusEnum.APPROVED,
        TenantNameReviewStatusEnum.REJECTED,
      ].includes(newStatus) &&
      !currentStatus.reviewedBy
    ) {
      errors.push("完成审核时必须指定审核者");
    }

    // 验证审核时间
    if (
      [
        TenantNameReviewStatusEnum.APPROVED,
        TenantNameReviewStatusEnum.REJECTED,
      ].includes(newStatus) &&
      !currentStatus.reviewedAt
    ) {
      errors.push("完成审核时必须指定审核时间");
    }

    // 验证拒绝原因
    if (
      newStatus === TenantNameReviewStatusEnum.REJECTED &&
      !currentStatus.rejectionReason
    ) {
      errors.push("拒绝审核时必须提供拒绝原因");
    }

    // 生成警告
    if (
      newStatus === TenantNameReviewStatusEnum.CANCELLED &&
      currentStatus.isInReview()
    ) {
      warnings.push("取消正在审核的请求可能会影响审核流程");
    }

    const isValid = errors.length === 0;

    this.logger.log(
      `Status transition validation completed: ${isValid ? "valid" : "invalid"}`,
      this.context,
    );

    return {
      isValid,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * 验证审核结果
   *
   * @param status - 审核状态
   * @param result - 审核结果
   * @returns 验证结果
   */
  async validateReviewResult(
    status: TenantNameReviewStatus,
    result: TenantNameReviewResult,
  ): Promise<{
    readonly isValid: boolean;
    readonly errors: readonly string[];
    readonly warnings?: readonly string[];
  }> {
    this.logger.log(
      `Validating review result ${result} for status ${status.status}`,
      this.context,
    );

    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证状态和结果的一致性
    if (
      status.status === TenantNameReviewStatusEnum.APPROVED &&
      result !== TenantNameReviewResult.APPROVED
    ) {
      errors.push("审核状态为已通过时，审核结果必须为已通过");
    }

    if (
      status.status === TenantNameReviewStatusEnum.REJECTED &&
      result !== TenantNameReviewResult.REJECTED
    ) {
      errors.push("审核状态为已拒绝时，审核结果必须为已拒绝");
    }

    // 验证审核者信息
    if (!status.reviewedBy) {
      errors.push("审核结果必须包含审核者信息");
    }

    if (!status.reviewedAt) {
      errors.push("审核结果必须包含审核时间");
    }

    // 验证审核意见
    if (result === TenantNameReviewResult.APPROVED && !status.comments) {
      warnings.push("建议为通过的审核提供审核意见");
    }

    if (result === TenantNameReviewResult.REJECTED && !status.rejectionReason) {
      errors.push("拒绝的审核必须提供拒绝原因");
    }

    if (
      result === TenantNameReviewResult.NEEDS_REVISION &&
      !status.revisionNotes
    ) {
      errors.push("需要修订的审核必须提供修订说明");
    }

    if (
      result === TenantNameReviewResult.PENDING_ADDITIONAL_INFO &&
      !status.additionalInfoRequired
    ) {
      errors.push("需要额外信息的审核必须说明需要的信息");
    }

    const isValid = errors.length === 0;

    this.logger.log(
      `Review result validation completed: ${isValid ? "valid" : "invalid"}`,
      this.context,
    );

    return {
      isValid,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * 检查租户名称是否有效
   *
   * @param name - 租户名称
   * @returns 是否有效
   */
  private isValidTenantName(name: string): boolean {
    if (!name || name.trim().length === 0) {
      return false;
    }

    // 检查是否包含有效字符
    const validNameRegex = /^[a-zA-Z0-9\u4e00-\u9fa5\s\-_\.]+$/;
    return validNameRegex.test(name);
  }

  /**
   * 检查租户名称字符是否有效
   *
   * @param name - 租户名称
   * @returns 是否有效
   */
  private isValidTenantNameCharacters(name: string): boolean {
    // 检查是否包含特殊字符
    const invalidChars = /[<>:"/\\|?*]/;
    return !invalidChars.test(name);
  }

  /**
   * 检查租户名称是否包含敏感词
   *
   * @param name - 租户名称
   * @returns 是否包含敏感词
   */
  private async containsSensitiveWords(name: string): Promise<boolean> {
    // 简化的敏感词检查，实际实现中应该使用更完善的敏感词库
    const sensitiveWords = [
      "admin",
      "root",
      "system",
      "test",
      "demo",
      "管理员",
      "系统",
      "测试",
    ];
    const lowerName = name.toLowerCase();

    return sensitiveWords.some((word) => lowerName.includes(word));
  }

  /**
   * 检查租户名称是否冲突
   *
   * @param name - 租户名称
   * @param tenantId - 租户ID
   * @returns 是否冲突
   */
  private async isNameConflict(
    name: string,
    tenantId: TenantId,
  ): Promise<boolean> {
    // 简化的名称冲突检查，实际实现中应该查询数据库
    // 这里返回false表示没有冲突
    return false;
  }

  /**
   * 获取审核规则配置
   *
   * @returns 审核规则配置
   */
  getReviewRulesConfig(): {
    readonly maxNameLength: number;
    readonly minNameLength: number;
    readonly maxReasonLength: number;
    readonly allowedCharacters: string;
    readonly sensitiveWords: readonly string[];
    readonly reviewTimeouts: Record<TenantNameReviewRequestType, number>;
  } {
    return {
      maxNameLength: 100,
      minNameLength: 2,
      maxReasonLength: 500,
      allowedCharacters: "a-zA-Z0-9\u4e00-\u9fa5\\s\\-_\\.",
      sensitiveWords: [
        "admin",
        "root",
        "system",
        "test",
        "demo",
        "管理员",
        "系统",
        "测试",
      ],
      reviewTimeouts: {
        [TenantNameReviewRequestType.INITIAL_REVIEW]: 48,
        [TenantNameReviewRequestType.NAME_CHANGE]: 24,
        [TenantNameReviewRequestType.COMPLIANCE_CHECK]: 72,
        [TenantNameReviewRequestType.MANUAL_REVIEW]: 12,
        [TenantNameReviewRequestType.APPEAL]: 96,
      },
    };
  }

  /**
   * 获取审核优先级建议
   *
   * @param requestType - 请求类型
   * @returns 优先级建议
   */
  getPriorityRecommendation(
    requestType: TenantNameReviewRequestType,
  ): TenantNameReviewRequestPriority {
    switch (requestType) {
      case TenantNameReviewRequestType.INITIAL_REVIEW:
        return TenantNameReviewRequestPriority.HIGH;
      case TenantNameReviewRequestType.NAME_CHANGE:
        return TenantNameReviewRequestPriority.MEDIUM;
      case TenantNameReviewRequestType.COMPLIANCE_CHECK:
        return TenantNameReviewRequestPriority.HIGH;
      case TenantNameReviewRequestType.MANUAL_REVIEW:
        return TenantNameReviewRequestPriority.URGENT;
      case TenantNameReviewRequestType.APPEAL:
        return TenantNameReviewRequestPriority.HIGH;
      default:
        return TenantNameReviewRequestPriority.MEDIUM;
    }
  }

  /**
   * 获取审核时间建议
   *
   * @param requestType - 请求类型
   * @returns 审核时间建议（小时）
   */
  getReviewTimeRecommendation(
    requestType: TenantNameReviewRequestType,
  ): number {
    const config = this.getReviewRulesConfig();
    return config.reviewTimeouts[requestType];
  }
}
