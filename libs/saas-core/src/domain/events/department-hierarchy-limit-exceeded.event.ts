/**
 * 部门层次结构限制超出事件
 *
 * @description 表示部门层次结构限制被超出的事件
 * @since 1.0.0
 */

import { DomainEvent as IDomainEvent, DomainEventBase } from "@hl8/domain-kernel";
import { TenantId } from "@hl8/domain-kernel";
import { OrganizationId } from "@hl8/domain-kernel";
import { DepartmentId } from "@hl8/domain-kernel";

/**
 * 部门层次结构限制超出事件接口
 */
export interface IDepartmentHierarchyLimitExceededEvent {
  readonly tenantId: TenantId;
  readonly organizationId: OrganizationId;
  readonly departmentId: DepartmentId;
  readonly limitType:
    | "MAX_CHILDREN"
    | "MAX_DEPTH"
    | "MAX_PERMISSIONS"
    | "MAX_CONSTRAINTS";
  readonly currentValue: number;
  readonly limitValue: number;
  readonly exceededBy: number;
  readonly departmentName: string;
  readonly departmentLevel: number;
  readonly departmentType: string;
  readonly exceededAt: Date;
  readonly severity: "WARNING" | "ERROR" | "CRITICAL";
  readonly autoExpansionEnabled: boolean;
  readonly expansionRecommendation?: {
    readonly recommendedLimit: number;
    readonly expansionFactor: number;
    readonly reason: string;
  };
  readonly metadata: Record<string, unknown>;
}

/**
 * 部门层次结构限制超出事件
 *
 * 部门层次结构限制超出事件表示部门层次结构限制被超出的事件。
 * 当部门层次结构超出设定的限制时，系统会发布此事件以通知相关组件。
 *
 * @example
 * ```typescript
 * const event = new DepartmentHierarchyLimitExceededEvent({
 *   tenantId: TenantId.create("tenant-123"),
 *   organizationId: OrganizationId.create("org-456"),
 *   departmentId: DepartmentId.create("dept-789"),
 *   limitType: "MAX_CHILDREN",
 *   currentValue: 15,
 *   limitValue: 10,
 *   exceededBy: 5,
 *   departmentName: "Engineering",
 *   departmentLevel: 2,
 *   departmentType: "BRANCH",
 *   exceededAt: new Date(),
 *   severity: "ERROR",
 *   autoExpansionEnabled: true,
 *   metadata: { source: "automatic", category: "department_hierarchy" }
 * });
 * ```
 */
export class DepartmentHierarchyLimitExceededEvent extends DomainEventBase implements IDomainEventBase implements IDomainEvent {
  public readonly eventData: Record<string, unknown>;
  public readonly eventType: string = "DepartmentHierarchyLimitExceededEvent";
  
  constructor(eventData: IDepartmentHierarchyLimitExceededEvent) {
    const { GenericEntityId } = require("@hl8/domain-kernel");
    const eventId = GenericEntityId.generate();
    super(eventId, new Date(), eventData.tenantId as any, 0);

    this.eventData = eventData as unknown as Record<string, unknown>;
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
   * 获取组织ID
   *
   * @returns 组织ID
   */
  get organizationId(): OrganizationId {
    return this.eventData.organizationId;
  }

  /**
   * 获取部门ID
   *
   * @returns 部门ID
   */
  get departmentId(): DepartmentId {
    return this.eventData.departmentId;
  }

  /**
   * 获取限制类型
   *
   * @returns 限制类型
   */
  get limitType():
    | "MAX_CHILDREN"
    | "MAX_DEPTH"
    | "MAX_PERMISSIONS"
    | "MAX_CONSTRAINTS" {
    return this.eventData.limitType;
  }

  /**
   * 获取当前值
   *
   * @returns 当前值
   */
  get currentValue(): number {
    return this.eventData.currentValue;
  }

  /**
   * 获取限制值
   *
   * @returns 限制值
   */
  get limitValue(): number {
    return this.eventData.limitValue;
  }

  /**
   * 获取超出量
   *
   * @returns 超出量
   */
  get exceededBy(): number {
    return this.eventData.exceededBy;
  }

  /**
   * 获取部门名称
   *
   * @returns 部门名称
   */
  get departmentName(): string {
    return this.eventData.departmentName;
  }

  /**
   * 获取部门层级
   *
   * @returns 部门层级
   */
  get departmentLevel(): number {
    return this.eventData.departmentLevel;
  }

  /**
   * 获取部门类型
   *
   * @returns 部门类型
   */
  get departmentType(): string {
    return this.eventData.departmentType;
  }

  /**
   * 获取超出时间
   *
   * @returns 超出时间
   */
  get exceededAt(): Date {
    return this.eventData.exceededAt;
  }

  /**
   * 获取严重程度
   *
   * @returns 严重程度
   */
  get severity(): "WARNING" | "ERROR" | "CRITICAL" {
    return this.eventData.severity;
  }

  /**
   * 获取是否启用自动扩容
   *
   * @returns 是否启用自动扩容
   */
  get autoExpansionEnabled(): boolean {
    return this.eventData.autoExpansionEnabled;
  }

  /**
   * 获取扩容建议
   *
   * @returns 扩容建议或undefined
   */
  get expansionRecommendation():
    | {
        readonly recommendedLimit: number;
        readonly expansionFactor: number;
        readonly reason: string;
      }
    | undefined {
    return this.eventData.expansionRecommendation;
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
   * 检查是否为最大子部门数超出
   *
   * @returns 是否为最大子部门数超出
   */
  isMaxChildrenExceeded(): boolean {
    return this.eventData.limitType === "MAX_CHILDREN";
  }

  /**
   * 检查是否为最大深度超出
   *
   * @returns 是否为最大深度超出
   */
  isMaxDepthExceeded(): boolean {
    return this.eventData.limitType === "MAX_DEPTH";
  }

  /**
   * 检查是否为最大权限数超出
   *
   * @returns 是否为最大权限数超出
   */
  isMaxPermissionsExceeded(): boolean {
    return this.eventData.limitType === "MAX_PERMISSIONS";
  }

  /**
   * 检查是否为最大约束数超出
   *
   * @returns 是否为最大约束数超出
   */
  isMaxConstraintsExceeded(): boolean {
    return this.eventData.limitType === "MAX_CONSTRAINTS";
  }

  /**
   * 检查是否为严重事件
   *
   * @returns 是否为严重事件
   */
  isCritical(): boolean {
    return this.eventData.severity === "CRITICAL";
  }

  /**
   * 检查是否为错误事件
   *
   * @returns 是否为错误事件
   */
  isError(): boolean {
    return this.eventData.severity === "ERROR";
  }

  /**
   * 检查是否为警告事件
   *
   * @returns 是否为警告事件
   */
  isWarning(): boolean {
    return this.eventData.severity === "WARNING";
  }

  /**
   * 获取超出百分比
   *
   * @returns 超出百分比
   */
  getExceededPercentage(): number {
    if (this.eventData.limitValue === 0) {
      return 0;
    }
    return (this.eventData.exceededBy / this.eventData.limitValue) * 100;
  }

  /**
   * 获取当前使用百分比
   *
   * @returns 当前使用百分比
   */
  getCurrentUsagePercentage(): number {
    if (this.eventData.limitValue === 0) {
      return 0;
    }
    return (this.eventData.currentValue / this.eventData.limitValue) * 100;
  }

  /**
   * 获取事件摘要
   *
   * @returns 事件摘要
   */
  getSummary(): string {
    const severityText = this.isCritical()
      ? "严重"
      : this.isError()
        ? "错误"
        : "警告";
    const limitTypeText = this.isMaxChildrenExceeded()
      ? "最大子部门数"
      : this.isMaxDepthExceeded()
        ? "最大深度"
        : this.isMaxPermissionsExceeded()
          ? "最大权限数"
          : "最大约束数";

    return `租户 ${this.tenantId.value} 的组织 ${this.organizationId.value} 的部门 ${this.departmentName} 超出 ${limitTypeText}，当前值: ${this.currentValue}，限制: ${this.limitValue}，超出: ${this.exceededBy}，严重程度: ${severityText}`;
  }

  /**
   * 获取事件详细信息
   *
   * @returns 事件详细信息
   */
  getDetails(): Record<string, unknown> {
    return {
      eventType: "DepartmentHierarchyLimitExceededEvent",
      tenantId: this.tenantId.value,
      organizationId: this.organizationId.value,
      departmentId: this.departmentId.value,
      limitType: this.limitType,
      currentValue: this.currentValue,
      limitValue: this.limitValue,
      exceededBy: this.exceededBy,
      departmentName: this.departmentName,
      departmentLevel: this.departmentLevel,
      departmentType: this.departmentType,
      exceededAt: this.exceededAt.toISOString(),
      severity: this.severity,
      autoExpansionEnabled: this.autoExpansionEnabled,
      expansionRecommendation: this.expansionRecommendation,
      isMaxChildrenExceeded: this.isMaxChildrenExceeded(),
      isMaxDepthExceeded: this.isMaxDepthExceeded(),
      isMaxPermissionsExceeded: this.isMaxPermissionsExceeded(),
      isMaxConstraintsExceeded: this.isMaxConstraintsExceeded(),
      isCritical: this.isCritical(),
      isError: this.isError(),
      isWarning: this.isWarning(),
      exceededPercentage: this.getExceededPercentage(),
      currentUsagePercentage: this.getCurrentUsagePercentage(),
      metadata: this.metadata,
    };
  }

  /**
   * 创建部门层次结构限制超出事件
   *
   * @param tenantId - 租户ID
   * @param organizationId - 组织ID
   * @param departmentId - 部门ID
   * @param limitType - 限制类型
   * @param currentValue - 当前值
   * @param limitValue - 限制值
   * @param exceededBy - 超出量
   * @param departmentName - 部门名称
   * @param departmentLevel - 部门层级
   * @param departmentType - 部门类型
   * @param severity - 严重程度
   * @param autoExpansionEnabled - 是否启用自动扩容
   * @param expansionRecommendation - 扩容建议
   * @param metadata - 元数据
   * @returns 部门层次结构限制超出事件
   */
  static create(
    tenantId: TenantId,
    organizationId: OrganizationId,
    departmentId: DepartmentId,
    limitType:
      | "MAX_CHILDREN"
      | "MAX_DEPTH"
      | "MAX_PERMISSIONS"
      | "MAX_CONSTRAINTS",
    currentValue: number,
    limitValue: number,
    exceededBy: number,
    departmentName: string,
    departmentLevel: number,
    departmentType: string,
    severity: "WARNING" | "ERROR" | "CRITICAL",
    autoExpansionEnabled: boolean = false,
    expansionRecommendation?: {
      readonly recommendedLimit: number;
      readonly expansionFactor: number;
      readonly reason: string;
    },
    metadata: Record<string, unknown> = {},
  ): DepartmentHierarchyLimitExceededEvent {
    return new DepartmentHierarchyLimitExceededEvent({
      tenantId,
      organizationId,
      departmentId,
      limitType,
      currentValue,
      limitValue,
      exceededBy,
      departmentName,
      departmentLevel,
      departmentType,
      exceededAt: new Date(),
      severity,
      autoExpansionEnabled,
      expansionRecommendation,
      metadata,
    });
  }

  /**
   * 创建最大子部门数超出事件
   *
   * @param tenantId - 租户ID
   * @param organizationId - 组织ID
   * @param departmentId - 部门ID
   * @param currentValue - 当前值
   * @param limitValue - 限制值
   * @param exceededBy - 超出量
   * @param departmentName - 部门名称
   * @param departmentLevel - 部门层级
   * @param departmentType - 部门类型
   * @param severity - 严重程度
   * @param autoExpansionEnabled - 是否启用自动扩容
   * @param expansionRecommendation - 扩容建议
   * @param metadata - 元数据
   * @returns 最大子部门数超出事件
   */
  static createMaxChildrenExceeded(
    tenantId: TenantId,
    organizationId: OrganizationId,
    departmentId: DepartmentId,
    currentValue: number,
    limitValue: number,
    exceededBy: number,
    departmentName: string,
    departmentLevel: number,
    departmentType: string,
    severity: "WARNING" | "ERROR" | "CRITICAL",
    autoExpansionEnabled: boolean = false,
    expansionRecommendation?: {
      readonly recommendedLimit: number;
      readonly expansionFactor: number;
      readonly reason: string;
    },
    metadata: Record<string, unknown> = {},
  ): DepartmentHierarchyLimitExceededEvent {
    return DepartmentHierarchyLimitExceededEvent.create(
      tenantId,
      organizationId,
      departmentId,
      "MAX_CHILDREN",
      currentValue,
      limitValue,
      exceededBy,
      departmentName,
      departmentLevel,
      departmentType,
      severity,
      autoExpansionEnabled,
      expansionRecommendation,
      metadata,
    );
  }

  /**
   * 创建最大深度超出事件
   *
   * @param tenantId - 租户ID
   * @param organizationId - 组织ID
   * @param departmentId - 部门ID
   * @param currentValue - 当前值
   * @param limitValue - 限制值
   * @param exceededBy - 超出量
   * @param departmentName - 部门名称
   * @param departmentLevel - 部门层级
   * @param departmentType - 部门类型
   * @param severity - 严重程度
   * @param autoExpansionEnabled - 是否启用自动扩容
   * @param expansionRecommendation - 扩容建议
   * @param metadata - 元数据
   * @returns 最大深度超出事件
   */
  static createMaxDepthExceeded(
    tenantId: TenantId,
    organizationId: OrganizationId,
    departmentId: DepartmentId,
    currentValue: number,
    limitValue: number,
    exceededBy: number,
    departmentName: string,
    departmentLevel: number,
    departmentType: string,
    severity: "WARNING" | "ERROR" | "CRITICAL",
    autoExpansionEnabled: boolean = false,
    expansionRecommendation?: {
      readonly recommendedLimit: number;
      readonly expansionFactor: number;
      readonly reason: string;
    },
    metadata: Record<string, unknown> = {},
  ): DepartmentHierarchyLimitExceededEvent {
    return DepartmentHierarchyLimitExceededEvent.create(
      tenantId,
      organizationId,
      departmentId,
      "MAX_DEPTH",
      currentValue,
      limitValue,
      exceededBy,
      departmentName,
      departmentLevel,
      departmentType,
      severity,
      autoExpansionEnabled,
      expansionRecommendation,
      metadata,
    );
  }
}
