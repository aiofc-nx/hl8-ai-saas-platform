/**
 * 租户名称审核请求值对象
 *
 * @description 表示租户名称审核请求的信息，包括审核原因、优先级、审核者等信息
 * @since 1.0.0
 */

import { BaseValueObject } from "./base-value-object.js";
import { TenantId } from "@hl8/domain-kernel";
import { UserId } from "./user-id.vo.js";

/**
 * 租户名称审核请求优先级枚举
 */
export enum TenantNameReviewRequestPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

/**
 * 租户名称审核请求类型枚举
 */
export enum TenantNameReviewRequestType {
  INITIAL_REVIEW = "INITIAL_REVIEW",
  NAME_CHANGE = "NAME_CHANGE",
  COMPLIANCE_CHECK = "COMPLIANCE_CHECK",
  MANUAL_REVIEW = "MANUAL_REVIEW",
  APPEAL = "APPEAL",
}

/**
 * 租户名称审核请求接口
 */
export interface ITenantNameReviewRequest {
  readonly id: string;
  readonly tenantId: TenantId;
  readonly requestedName: string;
  readonly currentName?: string;
  readonly requestType: TenantNameReviewRequestType;
  readonly priority: TenantNameReviewRequestPriority;
  readonly reason: string;
  readonly requestedBy: UserId;
  readonly requestedAt: Date;
  readonly assignedTo?: UserId;
  readonly assignedAt?: Date;
  readonly deadline?: Date;
  readonly metadata: Record<string, unknown>;
}

/**
 * 租户名称审核请求值对象
 *
 * 租户名称审核请求值对象表示租户名称审核请求的详细信息，包括审核原因、优先级、审核者等信息。
 * 支持多种审核类型、优先级管理、审核者分配等功能。
 *
 * @example
 * ```typescript
 * const request = new TenantNameReviewRequest({
 *   id: "review-123",
 *   tenantId: TenantId.create("tenant-456"),
 *   requestedName: "新公司名称",
 *   currentName: "旧公司名称",
 *   requestType: TenantNameReviewRequestType.NAME_CHANGE,
 *   priority: TenantNameReviewRequestPriority.MEDIUM,
 *   reason: "公司更名",
 *   requestedBy: UserId.create("user-789"),
 *   requestedAt: new Date(),
 *   metadata: { source: "manual", category: "business_change" }
 * });
 * ```
 */
export class TenantNameReviewRequest extends BaseValueObject<ITenantNameReviewRequest> {
  constructor(request: ITenantNameReviewRequest) {
    super(request);
    this.validateRequest(request);
  }

  /**
   * 验证租户名称审核请求
   *
   * @param request - 租户名称审核请求
   * @throws {Error} 当请求无效时抛出错误
   */
  private validateRequest(request: ITenantNameReviewRequest): void {
    if (!request.id) {
      throw new Error("审核请求ID不能为空");
    }
    if (!request.tenantId) {
      throw new Error("租户ID不能为空");
    }
    if (!request.requestedName || request.requestedName.trim().length === 0) {
      throw new Error("请求的租户名称不能为空");
    }
    if (!request.reason || request.reason.trim().length === 0) {
      throw new Error("审核原因不能为空");
    }
    if (!request.requestedBy) {
      throw new Error("请求者不能为空");
    }
    if (!request.requestedAt) {
      throw new Error("请求时间不能为空");
    }
    if (request.deadline && request.deadline <= request.requestedAt) {
      throw new Error("截止时间必须晚于请求时间");
    }
  }

  /**
   * 获取审核请求ID
   *
   * @returns 审核请求ID
   */
  get id(): string {
    return this.value.id;
  }

  /**
   * 获取租户ID
   *
   * @returns 租户ID
   */
  get tenantId(): TenantId {
    return this.value.tenantId;
  }

  /**
   * 获取请求的租户名称
   *
   * @returns 请求的租户名称
   */
  get requestedName(): string {
    return this.value.requestedName;
  }

  /**
   * 获取当前租户名称
   *
   * @returns 当前租户名称或undefined
   */
  get currentName(): string | undefined {
    return this.value.currentName;
  }

  /**
   * 获取审核请求类型
   *
   * @returns 审核请求类型
   */
  get requestType(): TenantNameReviewRequestType {
    return this.value.requestType;
  }

  /**
   * 获取优先级
   *
   * @returns 优先级
   */
  get priority(): TenantNameReviewRequestPriority {
    return this.value.priority;
  }

  /**
   * 获取审核原因
   *
   * @returns 审核原因
   */
  get reason(): string {
    return this.value.reason;
  }

  /**
   * 获取请求者
   *
   * @returns 请求者
   */
  get requestedBy(): UserId {
    return this.value.requestedBy;
  }

  /**
   * 获取请求时间
   *
   * @returns 请求时间
   */
  get requestedAt(): Date {
    return this.value.requestedAt;
  }

  /**
   * 获取分配给的审核者
   *
   * @returns 分配给的审核者或undefined
   */
  get assignedTo(): UserId | undefined {
    return this.value.assignedTo;
  }

  /**
   * 获取分配时间
   *
   * @returns 分配时间或undefined
   */
  get assignedAt(): Date | undefined {
    return this.value.assignedAt;
  }

  /**
   * 获取截止时间
   *
   * @returns 截止时间或undefined
   */
  get deadline(): Date | undefined {
    return this.value.deadline;
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
   * 检查审核请求是否已分配
   *
   * @returns 是否已分配
   */
  isAssigned(): boolean {
    return this.value.assignedTo !== undefined;
  }

  /**
   * 检查审核请求是否已过期
   *
   * @returns 是否已过期
   */
  isExpired(): boolean {
    if (!this.value.deadline) {
      return false;
    }
    return new Date() > this.value.deadline;
  }

  /**
   * 检查审核请求是否即将过期
   *
   * @param warningHours - 警告小时数
   * @returns 是否即将过期
   */
  isExpiringSoon(warningHours: number = 24): boolean {
    if (!this.value.deadline) {
      return false;
    }
    const warningTime = new Date();
    warningTime.setHours(warningTime.getHours() + warningHours);
    return this.value.deadline <= warningTime;
  }

  /**
   * 获取审核请求持续时间（小时）
   *
   * @returns 审核请求持续时间
   */
  getRequestDuration(): number {
    const now = new Date();
    const diffTime = now.getTime() - this.value.requestedAt.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60));
  }

  /**
   * 获取剩余审核时间（小时）
   *
   * @returns 剩余审核时间
   */
  getRemainingReviewTime(): number {
    if (!this.value.deadline) {
      return -1; // 无截止时间
    }
    const now = new Date();
    if (now > this.value.deadline) {
      return 0; // 已过期
    }
    const diffTime = this.value.deadline.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60));
  }

  /**
   * 检查是否为高优先级请求
   *
   * @returns 是否为高优先级
   */
  isHighPriority(): boolean {
    return (
      this.value.priority === TenantNameReviewRequestPriority.HIGH ||
      this.value.priority === TenantNameReviewRequestPriority.URGENT
    );
  }

  /**
   * 检查是否为紧急请求
   *
   * @returns 是否为紧急请求
   */
  isUrgent(): boolean {
    return this.value.priority === TenantNameReviewRequestPriority.URGENT;
  }

  /**
   * 创建新的分配信息
   *
   * @param assignedTo - 分配给的审核者
   * @param assignedAt - 分配时间
   * @returns 新的租户名称审核请求
   */
  withAssignment(
    assignedTo: UserId,
    assignedAt: Date,
  ): TenantNameReviewRequest {
    return new TenantNameReviewRequest({
      ...this.value,
      assignedTo,
      assignedAt,
    });
  }

  /**
   * 创建新的截止时间
   *
   * @param deadline - 截止时间
   * @returns 新的租户名称审核请求
   */
  withDeadline(deadline: Date): TenantNameReviewRequest {
    return new TenantNameReviewRequest({
      ...this.value,
      deadline,
    });
  }

  /**
   * 创建新的优先级
   *
   * @param priority - 优先级
   * @returns 新的租户名称审核请求
   */
  withPriority(
    priority: TenantNameReviewRequestPriority,
  ): TenantNameReviewRequest {
    return new TenantNameReviewRequest({
      ...this.value,
      priority,
    });
  }

  /**
   * 创建新的元数据
   *
   * @param metadata - 元数据
   * @returns 新的租户名称审核请求
   */
  withMetadata(metadata: Record<string, unknown>): TenantNameReviewRequest {
    return new TenantNameReviewRequest({
      ...this.value,
      metadata: { ...this.value.metadata, ...metadata },
    });
  }

  /**
   * 获取租户名称审核请求的字符串表示
   *
   * @returns 字符串表示
   */
  toString(): string {
    return `TenantNameReviewRequest(id: ${this.id}, tenantId: ${this.tenantId.value}, requestedName: ${this.requestedName}, priority: ${this.priority})`;
  }

  /**
   * 创建租户名称审核请求
   *
   * @param tenantId - 租户ID
   * @param requestedName - 请求的租户名称
   * @param requestType - 审核请求类型
   * @param reason - 审核原因
   * @param requestedBy - 请求者
   * @param priority - 优先级
   * @param currentName - 当前租户名称
   * @param metadata - 元数据
   * @returns 租户名称审核请求
   */
  static create(
    tenantId: TenantId,
    requestedName: string,
    requestType: TenantNameReviewRequestType,
    reason: string,
    requestedBy: UserId,
    priority: TenantNameReviewRequestPriority = TenantNameReviewRequestPriority.MEDIUM,
    currentName?: string,
    metadata: Record<string, unknown> = {},
  ): TenantNameReviewRequest {
    return new TenantNameReviewRequest({
      id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      requestedName,
      currentName,
      requestType,
      priority,
      reason,
      requestedBy,
      requestedAt: new Date(),
      metadata,
    });
  }

  /**
   * 创建高优先级租户名称审核请求
   *
   * @param tenantId - 租户ID
   * @param requestedName - 请求的租户名称
   * @param reason - 审核原因
   * @param requestedBy - 请求者
   * @param currentName - 当前租户名称
   * @param metadata - 元数据
   * @returns 高优先级租户名称审核请求
   */
  static createHighPriority(
    tenantId: TenantId,
    requestedName: string,
    reason: string,
    requestedBy: UserId,
    currentName?: string,
    metadata: Record<string, unknown> = {},
  ): TenantNameReviewRequest {
    return TenantNameReviewRequest.create(
      tenantId,
      requestedName,
      TenantNameReviewRequestType.MANUAL_REVIEW,
      reason,
      requestedBy,
      TenantNameReviewRequestPriority.HIGH,
      currentName,
      metadata,
    );
  }

  /**
   * 创建紧急租户名称审核请求
   *
   * @param tenantId - 租户ID
   * @param requestedName - 请求的租户名称
   * @param reason - 审核原因
   * @param requestedBy - 请求者
   * @param currentName - 当前租户名称
   * @param metadata - 元数据
   * @returns 紧急租户名称审核请求
   */
  static createUrgent(
    tenantId: TenantId,
    requestedName: string,
    reason: string,
    requestedBy: UserId,
    currentName?: string,
    metadata: Record<string, unknown> = {},
  ): TenantNameReviewRequest {
    return TenantNameReviewRequest.create(
      tenantId,
      requestedName,
      TenantNameReviewRequestType.MANUAL_REVIEW,
      reason,
      requestedBy,
      TenantNameReviewRequestPriority.URGENT,
      currentName,
      metadata,
    );
  }
}
