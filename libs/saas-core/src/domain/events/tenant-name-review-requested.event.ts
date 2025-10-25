/**
 * 租户名称审核请求事件
 *
 * @description 表示租户名称审核请求已创建的事件
 * @since 1.0.0
 */

import { DomainEventBase, EntityId, GenericEntityId, TenantId, UserId } from "@hl8/domain-kernel";
import {
  TenantNameReviewRequestType,
  TenantNameReviewRequestPriority,
} from "../value-objects/tenant-name-review-request.vo.js";
import { randomUUID } from "node:crypto";

/**
 * 租户名称审核请求事件接口
 */
export interface ITenantNameReviewRequestedEvent {
  readonly tenantId: TenantId;
  readonly requestId: string;
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
 * 租户名称审核请求事件
 *
 * 租户名称审核请求事件表示租户名称审核请求已创建的事件。
 * 当租户名称审核请求被创建时，系统会发布此事件以通知相关组件。
 *
 * @example
 * ```typescript
 * const event = new TenantNameReviewRequestedEvent({
 *   tenantId: TenantId.create("tenant-123"),
 *   requestId: "review-456",
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
export class TenantNameReviewRequestedEvent extends DomainEventBase {
  public readonly eventData: ITenantNameReviewRequestedEvent;

  constructor(aggregateId: EntityId, eventData: ITenantNameReviewRequestedEvent) {
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
   * 获取分配给的审核者
   *
   * @returns 分配给的审核者或undefined
   */
  get assignedTo(): UserId | undefined {
    return this.eventData.assignedTo;
  }

  /**
   * 获取分配时间
   *
   * @returns 分配时间或undefined
   */
  get assignedAt(): Date | undefined {
    return this.eventData.assignedAt;
  }

  /**
   * 获取截止时间
   *
   * @returns 截止时间或undefined
   */
  get deadline(): Date | undefined {
    return this.eventData.deadline;
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
   * 检查事件是否已分配审核者
   *
   * @returns 是否已分配
   */
  isAssigned(): boolean {
    return this.eventData.assignedTo !== undefined;
  }

  /**
   * 检查事件是否有截止时间
   *
   * @returns 是否有截止时间
   */
  hasDeadline(): boolean {
    return this.eventData.deadline !== undefined;
  }

  /**
   * 检查事件是否为高优先级
   *
   * @returns 是否为高优先级
   */
  isHighPriority(): boolean {
    return (
      this.eventData.priority === TenantNameReviewRequestPriority.HIGH ||
      this.eventData.priority === TenantNameReviewRequestPriority.URGENT
    );
  }

  /**
   * 检查事件是否为紧急优先级
   *
   * @returns 是否为紧急优先级
   */
  isUrgent(): boolean {
    return this.eventData.priority === TenantNameReviewRequestPriority.URGENT;
  }

  /**
   * 获取事件摘要
   *
   * @returns 事件摘要
   */
  getSummary(): string {
    const priorityText = this.isUrgent()
      ? "紧急"
      : this.isHighPriority()
        ? "高优先级"
        : "普通";
    const assignedText = this.isAssigned()
      ? `，已分配给 ${this.assignedTo?.getValue()}`
      : "，待分配";
    const deadlineText = this.hasDeadline()
      ? `，截止时间 ${this.deadline?.toISOString()}`
      : "";

    return `租户 ${this.tenantId.getValue()} 的租户名称审核请求已创建，请求名称: "${this.requestedName}"，类型: ${this.requestType}，优先级: ${priorityText}${assignedText}${deadlineText}`;
  }

  /**
   * 获取事件详细信息
   *
   * @returns 事件详细信息
   */
  getDetails(): Record<string, unknown> {
    return {
      eventType: "TenantNameReviewRequestedEvent",
      tenantId: this.tenantId.getValue(),
      requestId: this.requestId,
      requestedName: this.requestedName,
      currentName: this.currentName,
      requestType: this.requestType,
      priority: this.priority,
      reason: this.reason,
      requestedBy: this.requestedBy.getValue(),
      requestedAt: this.requestedAt.toISOString(),
      assignedTo: this.assignedTo?.getValue(),
      assignedAt: this.assignedAt?.toISOString(),
      deadline: this.deadline?.toISOString(),
      isAssigned: this.isAssigned(),
      hasDeadline: this.hasDeadline(),
      isHighPriority: this.isHighPriority(),
      isUrgent: this.isUrgent(),
      metadata: this.metadata,
    };
  }

  /**
   * 创建租户名称审核请求事件
   *
   * @param tenantId - 租户ID
   * @param requestId - 请求ID
   * @param requestedName - 请求的租户名称
   * @param requestType - 请求类型
   * @param reason - 请求原因
   * @param requestedBy - 请求者
   * @param priority - 优先级
   * @param currentName - 当前租户名称
   * @param assignedTo - 分配给的审核者
   * @param assignedAt - 分配时间
   * @param deadline - 截止时间
   * @param metadata - 元数据
   * @returns 租户名称审核请求事件
   */
  static create(
    tenantId: TenantId,
    requestId: string,
    requestedName: string,
    requestType: TenantNameReviewRequestType,
    reason: string,
    requestedBy: UserId,
    priority: TenantNameReviewRequestPriority = TenantNameReviewRequestPriority.MEDIUM,
    currentName?: string,
    assignedTo?: UserId,
    assignedAt?: Date,
    deadline?: Date,
    metadata: Record<string, unknown> = {},
  ): TenantNameReviewRequestedEvent {
    return new TenantNameReviewRequestedEvent(
      tenantId, // aggregateId
      {
        tenantId,
        requestId,
        requestedName,
        currentName,
        requestType,
        priority,
        reason,
        requestedBy,
        requestedAt: new Date(),
        assignedTo,
        assignedAt,
        deadline,
        metadata,
      }
    );
  }

  /**
   * 创建高优先级租户名称审核请求事件
   *
   * @param tenantId - 租户ID
   * @param requestId - 请求ID
   * @param requestedName - 请求的租户名称
   * @param reason - 请求原因
   * @param requestedBy - 请求者
   * @param currentName - 当前租户名称
   * @param metadata - 元数据
   * @returns 高优先级租户名称审核请求事件
   */
  static createHighPriority(
    tenantId: TenantId,
    requestId: string,
    requestedName: string,
    reason: string,
    requestedBy: UserId,
    currentName?: string,
    metadata: Record<string, unknown> = {},
  ): TenantNameReviewRequestedEvent {
    return TenantNameReviewRequestedEvent.create(
      tenantId,
      requestId,
      requestedName,
      TenantNameReviewRequestType.MANUAL_REVIEW,
      reason,
      requestedBy,
      TenantNameReviewRequestPriority.HIGH,
      currentName,
      undefined,
      undefined,
      undefined,
      metadata,
    );
  }

  /**
   * 创建紧急租户名称审核请求事件
   *
   * @param tenantId - 租户ID
   * @param requestId - 请求ID
   * @param requestedName - 请求的租户名称
   * @param reason - 请求原因
   * @param requestedBy - 请求者
   * @param currentName - 当前租户名称
   * @param metadata - 元数据
   * @returns 紧急租户名称审核请求事件
   */
  static createUrgent(
    tenantId: TenantId,
    requestId: string,
    requestedName: string,
    reason: string,
    requestedBy: UserId,
    currentName?: string,
    metadata: Record<string, unknown> = {},
  ): TenantNameReviewRequestedEvent {
    return TenantNameReviewRequestedEvent.create(
      tenantId,
      requestId,
      requestedName,
      TenantNameReviewRequestType.MANUAL_REVIEW,
      reason,
      requestedBy,
      TenantNameReviewRequestPriority.URGENT,
      currentName,
      undefined,
      undefined,
      undefined,
      metadata,
    );
  }
}
