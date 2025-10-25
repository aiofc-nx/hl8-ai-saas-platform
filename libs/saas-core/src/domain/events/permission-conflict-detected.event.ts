/**
 * 权限冲突检测事件
 *
 * @description 表示权限冲突被检测到的事件
 * @since 1.0.0
 */

import { DomainEvent } from "@hl8/domain-kernel";
import { TenantId } from "@hl8/domain-kernel";
import {
  PermissionConflictType,
  ConflictSeverity,
} from "../services/permission-conflict-detector.service.js";

/**
 * 权限冲突检测事件接口
 */
export interface IPermissionConflictDetectedEvent {
  readonly tenantId: TenantId;
  readonly conflictType: PermissionConflictType;
  readonly severity: ConflictSeverity;
  readonly description: string;
  readonly conflictingPermissions: readonly string[];
  readonly conflictingTemplates?: readonly string[];
  readonly suggestions: readonly string[];
  readonly detectedAt: Date;
  readonly metadata: Record<string, unknown>;
}

/**
 * 权限冲突检测事件
 *
 * 权限冲突检测事件表示权限冲突被检测到的事件。
 * 当权限模板之间存在冲突时，系统会发布此事件以通知相关组件。
 *
 * @example
 * ```typescript
 * const event = new PermissionConflictDetectedEvent({
 *   tenantId: TenantId.create("tenant-123"),
 *   conflictType: PermissionConflictType.DUPLICATE_PERMISSION,
 *   severity: ConflictSeverity.MEDIUM,
 *   description: "Permission 'user:create' is duplicated across multiple templates",
 *   conflictingPermissions: ["user:create"],
 *   conflictingTemplates: ["Admin Template", "User Template"],
 *   suggestions: ["Consider consolidating permission into a single template"],
 *   detectedAt: new Date(),
 *   metadata: { source: "automatic", category: "permission_conflict" }
 * });
 * ```
 */
export class PermissionConflictDetectedEvent extends DomainEvent {
  constructor(eventData: IPermissionConflictDetectedEvent) {
    super("PermissionConflictDetectedEvent", eventData.tenantId.value);

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
   * 获取冲突类型
   *
   * @returns 冲突类型
   */
  get conflictType(): PermissionConflictType {
    return this.eventData.conflictType;
  }

  /**
   * 获取严重程度
   *
   * @returns 严重程度
   */
  get severity(): ConflictSeverity {
    return this.eventData.severity;
  }

  /**
   * 获取描述
   *
   * @returns 描述
   */
  get description(): string {
    return this.eventData.description;
  }

  /**
   * 获取冲突权限列表
   *
   * @returns 冲突权限列表
   */
  get conflictingPermissions(): readonly string[] {
    return this.eventData.conflictingPermissions;
  }

  /**
   * 获取冲突模板列表
   *
   * @returns 冲突模板列表
   */
  get conflictingTemplates(): readonly string[] | undefined {
    return this.eventData.conflictingTemplates;
  }

  /**
   * 获取建议列表
   *
   * @returns 建议列表
   */
  get suggestions(): readonly string[] {
    return this.eventData.suggestions;
  }

  /**
   * 获取检测时间
   *
   * @returns 检测时间
   */
  get detectedAt(): Date {
    return this.eventData.detectedAt;
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
   * 检查是否为重复权限冲突
   *
   * @returns 是否为重复权限冲突
   */
  isDuplicatePermissionConflict(): boolean {
    return (
      this.eventData.conflictType ===
      PermissionConflictType.DUPLICATE_PERMISSION
    );
  }

  /**
   * 检查是否为矛盾权限冲突
   *
   * @returns 是否为矛盾权限冲突
   */
  isContradictoryPermissionConflict(): boolean {
    return (
      this.eventData.conflictType ===
      PermissionConflictType.CONTRADICTORY_PERMISSION
    );
  }

  /**
   * 检查是否为层次结构违规冲突
   *
   * @returns 是否为层次结构违规冲突
   */
  isHierarchyViolationConflict(): boolean {
    return (
      this.eventData.conflictType === PermissionConflictType.HIERARCHY_VIOLATION
    );
  }

  /**
   * 检查是否为资源冲突
   *
   * @returns 是否为资源冲突
   */
  isResourceConflict(): boolean {
    return (
      this.eventData.conflictType === PermissionConflictType.RESOURCE_CONFLICT
    );
  }

  /**
   * 检查是否为条件冲突
   *
   * @returns 是否为条件冲突
   */
  isConditionConflict(): boolean {
    return (
      this.eventData.conflictType === PermissionConflictType.CONDITION_CONFLICT
    );
  }

  /**
   * 检查是否为模板冲突
   *
   * @returns 是否为模板冲突
   */
  isTemplateConflict(): boolean {
    return (
      this.eventData.conflictType === PermissionConflictType.TEMPLATE_CONFLICT
    );
  }

  /**
   * 检查是否为严重冲突
   *
   * @returns 是否为严重冲突
   */
  isCritical(): boolean {
    return this.eventData.severity === ConflictSeverity.CRITICAL;
  }

  /**
   * 检查是否为高优先级冲突
   *
   * @returns 是否为高优先级冲突
   */
  isHighPriority(): boolean {
    return this.eventData.severity === ConflictSeverity.HIGH;
  }

  /**
   * 检查是否为中等优先级冲突
   *
   * @returns 是否为中等优先级冲突
   */
  isMediumPriority(): boolean {
    return this.eventData.severity === ConflictSeverity.MEDIUM;
  }

  /**
   * 检查是否为低优先级冲突
   *
   * @returns 是否为低优先级冲突
   */
  isLowPriority(): boolean {
    return this.eventData.severity === ConflictSeverity.LOW;
  }

  /**
   * 获取冲突摘要
   *
   * @returns 冲突摘要
   */
  getSummary(): string {
    const severityText = this.isCritical()
      ? "严重"
      : this.isHighPriority()
        ? "高优先级"
        : this.isMediumPriority()
          ? "中等优先级"
          : "低优先级";
    const conflictTypeText = this.isDuplicatePermissionConflict()
      ? "重复权限"
      : this.isContradictoryPermissionConflict()
        ? "矛盾权限"
        : this.isHierarchyViolationConflict()
          ? "层次结构违规"
          : this.isResourceConflict()
            ? "资源冲突"
            : this.isConditionConflict()
              ? "条件冲突"
              : "模板冲突";

    return `租户 ${this.tenantId.value} 检测到权限冲突: ${conflictTypeText}，严重程度: ${severityText}，涉及权限: ${this.conflictingPermissions.join(", ")}`;
  }

  /**
   * 获取事件详细信息
   *
   * @returns 事件详细信息
   */
  getDetails(): Record<string, unknown> {
    return {
      eventType: "PermissionConflictDetectedEvent",
      tenantId: this.tenantId.value,
      conflictType: this.conflictType,
      severity: this.severity,
      description: this.description,
      conflictingPermissions: this.conflictingPermissions,
      conflictingTemplates: this.conflictingTemplates,
      suggestions: this.suggestions,
      detectedAt: this.detectedAt.toISOString(),
      isDuplicatePermissionConflict: this.isDuplicatePermissionConflict(),
      isContradictoryPermissionConflict:
        this.isContradictoryPermissionConflict(),
      isHierarchyViolationConflict: this.isHierarchyViolationConflict(),
      isResourceConflict: this.isResourceConflict(),
      isConditionConflict: this.isConditionConflict(),
      isTemplateConflict: this.isTemplateConflict(),
      isCritical: this.isCritical(),
      isHighPriority: this.isHighPriority(),
      isMediumPriority: this.isMediumPriority(),
      isLowPriority: this.isLowPriority(),
      metadata: this.metadata,
    };
  }

  /**
   * 创建权限冲突检测事件
   *
   * @param tenantId - 租户ID
   * @param conflictType - 冲突类型
   * @param severity - 严重程度
   * @param description - 描述
   * @param conflictingPermissions - 冲突权限列表
   * @param suggestions - 建议列表
   * @param conflictingTemplates - 冲突模板列表
   * @param metadata - 元数据
   * @returns 权限冲突检测事件
   */
  static create(
    tenantId: TenantId,
    conflictType: PermissionConflictType,
    severity: ConflictSeverity,
    description: string,
    conflictingPermissions: readonly string[],
    suggestions: readonly string[],
    conflictingTemplates?: readonly string[],
    metadata: Record<string, unknown> = {},
  ): PermissionConflictDetectedEvent {
    return new PermissionConflictDetectedEvent({
      tenantId,
      conflictType,
      severity,
      description,
      conflictingPermissions,
      conflictingTemplates,
      suggestions,
      detectedAt: new Date(),
      metadata,
    });
  }

  /**
   * 创建重复权限冲突事件
   *
   * @param tenantId - 租户ID
   * @param description - 描述
   * @param conflictingPermissions - 冲突权限列表
   * @param conflictingTemplates - 冲突模板列表
   * @param suggestions - 建议列表
   * @param metadata - 元数据
   * @returns 重复权限冲突事件
   */
  static createDuplicatePermissionConflict(
    tenantId: TenantId,
    description: string,
    conflictingPermissions: readonly string[],
    conflictingTemplates: readonly string[],
    suggestions: readonly string[],
    metadata: Record<string, unknown> = {},
  ): PermissionConflictDetectedEvent {
    return PermissionConflictDetectedEvent.create(
      tenantId,
      PermissionConflictType.DUPLICATE_PERMISSION,
      ConflictSeverity.MEDIUM,
      description,
      conflictingPermissions,
      suggestions,
      conflictingTemplates,
      metadata,
    );
  }

  /**
   * 创建矛盾权限冲突事件
   *
   * @param tenantId - 租户ID
   * @param description - 描述
   * @param conflictingPermissions - 冲突权限列表
   * @param conflictingTemplates - 冲突模板列表
   * @param suggestions - 建议列表
   * @param metadata - 元数据
   * @returns 矛盾权限冲突事件
   */
  static createContradictoryPermissionConflict(
    tenantId: TenantId,
    description: string,
    conflictingPermissions: readonly string[],
    conflictingTemplates: readonly string[],
    suggestions: readonly string[],
    metadata: Record<string, unknown> = {},
  ): PermissionConflictDetectedEvent {
    return PermissionConflictDetectedEvent.create(
      tenantId,
      PermissionConflictType.CONTRADICTORY_PERMISSION,
      ConflictSeverity.HIGH,
      description,
      conflictingPermissions,
      suggestions,
      conflictingTemplates,
      metadata,
    );
  }

  /**
   * 创建层次结构违规冲突事件
   *
   * @param tenantId - 租户ID
   * @param description - 描述
   * @param conflictingPermissions - 冲突权限列表
   * @param conflictingTemplates - 冲突模板列表
   * @param suggestions - 建议列表
   * @param metadata - 元数据
   * @returns 层次结构违规冲突事件
   */
  static createHierarchyViolationConflict(
    tenantId: TenantId,
    description: string,
    conflictingPermissions: readonly string[],
    conflictingTemplates: readonly string[],
    suggestions: readonly string[],
    metadata: Record<string, unknown> = {},
  ): PermissionConflictDetectedEvent {
    return PermissionConflictDetectedEvent.create(
      tenantId,
      PermissionConflictType.HIERARCHY_VIOLATION,
      ConflictSeverity.HIGH,
      description,
      conflictingPermissions,
      suggestions,
      conflictingTemplates,
      metadata,
    );
  }

  /**
   * 创建模板冲突事件
   *
   * @param tenantId - 租户ID
   * @param description - 描述
   * @param conflictingTemplates - 冲突模板列表
   * @param suggestions - 建议列表
   * @param metadata - 元数据
   * @returns 模板冲突事件
   */
  static createTemplateConflict(
    tenantId: TenantId,
    description: string,
    conflictingTemplates: readonly string[],
    suggestions: readonly string[],
    metadata: Record<string, unknown> = {},
  ): PermissionConflictDetectedEvent {
    return PermissionConflictDetectedEvent.create(
      tenantId,
      PermissionConflictType.TEMPLATE_CONFLICT,
      ConflictSeverity.CRITICAL,
      description,
      [],
      suggestions,
      conflictingTemplates,
      metadata,
    );
  }
}
