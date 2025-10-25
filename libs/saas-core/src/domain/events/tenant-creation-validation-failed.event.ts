/**
 * 租户创建验证失败事件
 *
 * @description 表示租户创建验证失败时触发的领域事件
 * @since 1.0.0
 */

import { DomainEventBase, EntityId, GenericEntityId } from "@hl8/domain-kernel";
import { TenantCode } from "../value-objects/tenant-code.vo.js";
import { TenantName } from "../value-objects/tenant-name.vo.js";
import { TenantType } from "../value-objects/tenant-type.vo.js";
import { randomUUID } from "node:crypto";

/**
 * 租户创建验证失败事件接口
 */
export interface ITenantCreationValidationFailedEvent {
  readonly tenantCode: TenantCode;
  readonly tenantName: TenantName;
  readonly tenantType: TenantType;
  readonly domain?: string;
  readonly createdBy: string;
  readonly validationErrors: readonly string[];
  readonly validationWarnings?: readonly string[];
  readonly validationSuggestions?: readonly string[];
  readonly failedAt: Date;
  readonly metadata: Record<string, unknown>;
}

/**
 * 租户创建验证失败事件
 *
 * 租户创建验证失败事件在租户创建验证失败时触发，包含验证失败的详细信息。
 * 事件包含租户信息、验证错误、警告、建议等数据。
 *
 * @example
 * ```typescript
 * const event = new TenantCreationValidationFailedEvent({
 *   tenantCode: new TenantCode("acme-corp"),
 *   tenantName: new TenantName("Acme Corporation"),
 *   tenantType: TenantType.PROFESSIONAL,
 *   domain: "acme.example.com",
 *   createdBy: "user-123",
 *   validationErrors: ["租户代码已存在", "域名格式不正确"],
 *   validationWarnings: ["租户名称包含敏感词"],
 *   validationSuggestions: ["acme-corp-2", "acme-corp-2024"],
 *   failedAt: new Date(),
 *   metadata: { source: "manual", reason: "validation_failed" }
 * });
 * ```
 */
export class TenantCreationValidationFailedEvent extends DomainEventBase {
  public readonly eventData: ITenantCreationValidationFailedEvent;

  constructor(aggregateId: EntityId, eventData: ITenantCreationValidationFailedEvent) {
    super(
      GenericEntityId.create(randomUUID()),
      new Date(),
      aggregateId,
      1
    );

    this.eventData = eventData;
    this.validateEvent(eventData);
  }

  get tenantCode(): TenantCode { return this.eventData.tenantCode; }
  get tenantName(): TenantName { return this.eventData.tenantName; }
  get tenantType(): TenantType { return this.eventData.tenantType; }
  get domain(): string | undefined { return this.eventData.domain; }
  get createdBy(): string { return this.eventData.createdBy; }
  get validationErrors(): readonly string[] { return this.eventData.validationErrors; }
  get validationWarnings(): readonly string[] | undefined { return this.eventData.validationWarnings; }
  get validationSuggestions(): readonly string[] | undefined { return this.eventData.validationSuggestions; }
  get failedAt(): Date { return this.eventData.failedAt; }
  get metadata(): Record<string, unknown> { return this.eventData.metadata; }

  /**
   * 验证租户创建验证失败事件
   *
   * @param eventData - 事件数据
   * @throws {Error} 当事件数据无效时抛出错误
   */
  private validateEvent(eventData: ITenantCreationValidationFailedEvent): void {
    if (!eventData.tenantCode) {
      throw new Error("租户代码不能为空");
    }
    if (!eventData.tenantName) {
      throw new Error("租户名称不能为空");
    }
    if (!eventData.tenantType) {
      throw new Error("租户类型不能为空");
    }
    if (!eventData.createdBy) {
      throw new Error("创建者不能为空");
    }
    if (
      !eventData.validationErrors ||
      eventData.validationErrors.length === 0
    ) {
      throw new Error("验证错误列表不能为空");
    }
    if (!eventData.failedAt) {
      throw new Error("失败时间不能为空");
    }
  }

  /**
   * 获取验证错误数量
   *
   * @returns 验证错误数量
   */
  getErrorCount(): number {
    return this.validationErrors.length;
  }

  /**
   * 获取验证警告数量
   *
   * @returns 验证警告数量
   */
  getWarningCount(): number {
    return this.validationWarnings?.length || 0;
  }

  /**
   * 获取验证建议数量
   *
   * @returns 验证建议数量
   */
  getSuggestionCount(): number {
    return this.validationSuggestions?.length || 0;
  }

  /**
   * 检查是否有验证错误
   *
   * @returns 是否有验证错误
   */
  hasErrors(): boolean {
    return this.validationErrors.length > 0;
  }

  /**
   * 检查是否有验证警告
   *
   * @returns 是否有验证警告
   */
  hasWarnings(): boolean {
    return (this.validationWarnings?.length || 0) > 0;
  }

  /**
   * 检查是否有验证建议
   *
   * @returns 是否有验证建议
   */
  hasSuggestions(): boolean {
    return (this.validationSuggestions?.length || 0) > 0;
  }

  /**
   * 检查是否包含特定错误
   *
   * @param error - 错误信息
   * @returns 是否包含特定错误
   */
  containsError(error: string): boolean {
    return this.validationErrors.some((e) => e.includes(error));
  }

  /**
   * 检查是否包含特定警告
   *
   * @param warning - 警告信息
   * @returns 是否包含特定警告
   */
  containsWarning(warning: string): boolean {
    return this.validationWarnings?.some((w) => w.includes(warning)) || false;
  }

  /**
   * 检查是否包含特定建议
   *
   * @param suggestion - 建议信息
   * @returns 是否包含特定建议
   */
  containsSuggestion(suggestion: string): boolean {
    return (
      this.validationSuggestions?.some((s) => s.includes(suggestion)) || false
    );
  }

  /**
   * 获取验证失败的主要原因
   *
   * @returns 主要原因
   */
  getMainReason(): string {
    if (this.validationErrors.length === 0) {
      return "未知原因";
    }

    // 根据错误类型确定主要原因
    const errors = this.validationErrors;
    if (errors.some((e) => e.includes("已存在"))) {
      return "租户信息已存在";
    }
    if (errors.some((e) => e.includes("格式"))) {
      return "格式不正确";
    }
    if (errors.some((e) => e.includes("长度"))) {
      return "长度不符合要求";
    }
    if (errors.some((e) => e.includes("限制"))) {
      return "超出限制";
    }

    return errors[0]; // 返回第一个错误作为主要原因
  }

  /**
   * 获取验证失败的建议操作
   *
   * @returns 建议操作
   */
  getSuggestedActions(): string[] {
    const actions: string[] = [];

    if (this.hasSuggestions()) {
      actions.push("使用建议的租户代码或域名");
    }

    if (this.containsError("已存在")) {
      actions.push("修改租户代码或域名");
    }

    if (this.containsError("格式")) {
      actions.push("检查租户代码或域名格式");
    }

    if (this.containsError("长度")) {
      actions.push("调整租户名称长度");
    }

    if (this.containsError("限制")) {
      actions.push("联系管理员提升限制");
    }

    return actions;
  }

  /**
   * 获取事件类型
   *
   * @returns 事件类型
   */
  getEventType(): string {
    return "TenantCreationValidationFailedEvent";
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
    return this.eventId.getValue();
  }

  /**
   * 获取事件聚合根ID
   *
   * @returns 聚合根ID
   */
  getAggregateId(): string {
    return this.aggregateId.getValue();
  }

  /**
   * 获取事件时间戳
   *
   * @returns 事件时间戳
   */
  getTimestamp(): Date {
    return this.failedAt;
  }

  /**
   * 获取事件数据
   *
   * @returns 事件数据
   */
  getEventData(): Record<string, unknown> {
    return {
      tenantCode: this.tenantCode.value,
      tenantName: this.tenantName.value,
      tenantType: this.tenantType,
      domain: this.domain,
      createdBy: this.createdBy,
      validationErrors: this.validationErrors,
      validationWarnings: this.validationWarnings,
      validationSuggestions: this.validationSuggestions,
      failedAt: this.failedAt.toISOString(),
      metadata: this.metadata,
    };
  }

  /**
   * 获取事件的字符串表示
   *
   * @returns 字符串表示
   */
  toString(): string {
    return `TenantCreationValidationFailedEvent(tenantCode: ${this.tenantCode.value}, tenantName: ${this.tenantName.value}, errors: ${this.validationErrors.length}, failedAt: ${this.failedAt.toISOString()})`;
  }

  /**
   * 创建租户创建验证失败事件
   *
   * @param tenantCode - 租户代码
   * @param tenantName - 租户名称
   * @param tenantType - 租户类型
   * @param createdBy - 创建者
   * @param validationErrors - 验证错误
   * @param domain - 域名
   * @param validationWarnings - 验证警告
   * @param validationSuggestions - 验证建议
   * @param metadata - 元数据
   * @returns 租户创建验证失败事件
   */
  static create(
    tenantCode: TenantCode,
    tenantName: TenantName,
    tenantType: TenantType,
    createdBy: string,
    validationErrors: readonly string[],
    domain?: string,
    validationWarnings?: readonly string[],
    validationSuggestions?: readonly string[],
    metadata: Record<string, unknown> = {},
  ): TenantCreationValidationFailedEvent {
    // 需要创建一个聚合根ID，这里使用一个临时ID
    const aggregateId = GenericEntityId.create(randomUUID());
    return new TenantCreationValidationFailedEvent(
      aggregateId,
      {
        tenantCode,
        tenantName,
        tenantType,
        domain,
        createdBy,
        validationErrors,
        validationWarnings,
        validationSuggestions,
        failedAt: new Date(),
        metadata,
      }
    );
  }

  /**
   * 从事件数据创建租户创建验证失败事件
   *
   * @param eventData - 事件数据
   * @returns 租户创建验证失败事件
   */
  static fromEventData(
    eventData: Record<string, unknown>,
  ): TenantCreationValidationFailedEvent {
    const aggregateId = GenericEntityId.create(randomUUID());
    return new TenantCreationValidationFailedEvent(
      aggregateId,
      {
        tenantCode: new TenantCode(eventData.tenantCode as string),
        tenantName: new TenantName(eventData.tenantName as string),
        tenantType: eventData.tenantType as TenantType,
        domain: eventData.domain as string,
        createdBy: eventData.createdBy as string,
        validationErrors: eventData.validationErrors as string[],
        validationWarnings: eventData.validationWarnings as string[],
        validationSuggestions: eventData.validationSuggestions as string[],
        failedAt: new Date(eventData.failedAt as string),
        metadata: eventData.metadata as Record<string, unknown>,
      }
    );
  }
}
