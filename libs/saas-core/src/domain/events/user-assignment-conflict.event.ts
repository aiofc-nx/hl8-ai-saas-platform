/**
 * 用户分配冲突事件
 *
 * @description 表示用户分配发生冲突时触发的领域事件
 * @since 1.0.0
 */

import { DomainEvent } from "@hl8/domain-kernel";
import { UserId } from "../value-objects/user-id.vo.js";
import { OrganizationId } from "../value-objects/organization-id.vo.js";
import { DepartmentId } from "../value-objects/department-id.vo.js";

/**
 * 用户分配冲突类型枚举
 */
export enum UserAssignmentConflictType {
  DUPLICATE_ASSIGNMENT = "DUPLICATE_ASSIGNMENT",
  CROSS_ORGANIZATION_CONFLICT = "CROSS_ORGANIZATION_CONFLICT",
  CROSS_DEPARTMENT_CONFLICT = "CROSS_DEPARTMENT_CONFLICT",
  SINGLE_DEPARTMENT_VIOLATION = "SINGLE_DEPARTMENT_VIOLATION",
  TEMPORARY_ASSIGNMENT_CONFLICT = "TEMPORARY_ASSIGNMENT_CONFLICT",
  PERMISSION_CONFLICT = "PERMISSION_CONFLICT",
  ROLE_CONFLICT = "ROLE_CONFLICT",
}

/**
 * 用户分配冲突事件接口
 */
export interface IUserAssignmentConflictEvent {
  readonly userId: UserId;
  readonly organizationId: OrganizationId;
  readonly departmentId: DepartmentId;
  readonly conflictType: UserAssignmentConflictType;
  readonly conflictReason: string;
  readonly existingAssignments: readonly {
    readonly userId: UserId;
    readonly organizationId: OrganizationId;
    readonly departmentId: DepartmentId;
    readonly assignedAt: Date;
    readonly isTemporary: boolean;
    readonly expiresAt?: Date;
  }[];
  readonly attemptedAssignment: {
    readonly userId: UserId;
    readonly organizationId: OrganizationId;
    readonly departmentId: DepartmentId;
    readonly assignedAt: Date;
    readonly isTemporary: boolean;
    readonly expiresAt?: Date;
  };
  readonly conflictDetectedAt: Date;
  readonly metadata: Record<string, unknown>;
}

/**
 * 用户分配冲突事件
 *
 * 用户分配冲突事件在用户分配发生冲突时触发，包含冲突的详细信息。
 * 事件包含用户信息、冲突类型、冲突原因、现有分配、尝试分配等数据。
 *
 * @example
 * ```typescript
 * const event = new UserAssignmentConflictEvent({
 *   userId: new UserId("user-123"),
 *   organizationId: new OrganizationId("org-456"),
 *   departmentId: new DepartmentId("dept-789"),
 *   conflictType: UserAssignmentConflictType.DUPLICATE_ASSIGNMENT,
 *   conflictReason: "用户已在该部门中",
 *   existingAssignments: [existingAssignment],
 *   attemptedAssignment: attemptedAssignment,
 *   conflictDetectedAt: new Date(),
 *   metadata: { source: "automatic", reason: "assignment_conflict" }
 * });
 * ```
 */
export class UserAssignmentConflictEvent
  extends DomainEvent
  implements IUserAssignmentConflictEvent
{
  public readonly userId: UserId;
  public readonly organizationId: OrganizationId;
  public readonly departmentId: DepartmentId;
  public readonly conflictType: UserAssignmentConflictType;
  public readonly conflictReason: string;
  public readonly existingAssignments: readonly {
    readonly userId: UserId;
    readonly organizationId: OrganizationId;
    readonly departmentId: DepartmentId;
    readonly assignedAt: Date;
    readonly isTemporary: boolean;
    readonly expiresAt?: Date;
  }[];
  public readonly attemptedAssignment: {
    readonly userId: UserId;
    readonly organizationId: OrganizationId;
    readonly departmentId: DepartmentId;
    readonly assignedAt: Date;
    readonly isTemporary: boolean;
    readonly expiresAt?: Date;
  };
  public readonly conflictDetectedAt: Date;
  public readonly metadata: Record<string, unknown>;

  constructor(eventData: IUserAssignmentConflictEvent) {
    super();
    this.userId = eventData.userId;
    this.organizationId = eventData.organizationId;
    this.departmentId = eventData.departmentId;
    this.conflictType = eventData.conflictType;
    this.conflictReason = eventData.conflictReason;
    this.existingAssignments = eventData.existingAssignments;
    this.attemptedAssignment = eventData.attemptedAssignment;
    this.conflictDetectedAt = eventData.conflictDetectedAt;
    this.metadata = eventData.metadata;
    this.validateEvent(eventData);
  }

  /**
   * 验证用户分配冲突事件
   *
   * @param eventData - 事件数据
   * @throws {Error} 当事件数据无效时抛出错误
   */
  private validateEvent(eventData: IUserAssignmentConflictEvent): void {
    if (!eventData.userId) {
      throw new Error("用户ID不能为空");
    }
    if (!eventData.organizationId) {
      throw new Error("组织ID不能为空");
    }
    if (!eventData.departmentId) {
      throw new Error("部门ID不能为空");
    }
    if (!eventData.conflictType) {
      throw new Error("冲突类型不能为空");
    }
    if (!eventData.conflictReason) {
      throw new Error("冲突原因不能为空");
    }
    if (
      !eventData.existingAssignments ||
      eventData.existingAssignments.length === 0
    ) {
      throw new Error("现有分配列表不能为空");
    }
    if (!eventData.attemptedAssignment) {
      throw new Error("尝试分配不能为空");
    }
    if (!eventData.conflictDetectedAt) {
      throw new Error("冲突检测时间不能为空");
    }
  }

  /**
   * 获取冲突严重程度
   *
   * @returns 冲突严重程度
   */
  getConflictSeverity(): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    switch (this.conflictType) {
      case UserAssignmentConflictType.DUPLICATE_ASSIGNMENT:
        return "MEDIUM";
      case UserAssignmentConflictType.CROSS_ORGANIZATION_CONFLICT:
        return "HIGH";
      case UserAssignmentConflictType.CROSS_DEPARTMENT_CONFLICT:
        return "MEDIUM";
      case UserAssignmentConflictType.SINGLE_DEPARTMENT_VIOLATION:
        return "HIGH";
      case UserAssignmentConflictType.TEMPORARY_ASSIGNMENT_CONFLICT:
        return "LOW";
      case UserAssignmentConflictType.PERMISSION_CONFLICT:
        return "CRITICAL";
      case UserAssignmentConflictType.ROLE_CONFLICT:
        return "HIGH";
      default:
        return "MEDIUM";
    }
  }

  /**
   * 获取冲突影响范围
   *
   * @returns 冲突影响范围
   */
  getConflictScope(): "USER" | "DEPARTMENT" | "ORGANIZATION" | "SYSTEM" {
    switch (this.conflictType) {
      case UserAssignmentConflictType.DUPLICATE_ASSIGNMENT:
        return "USER";
      case UserAssignmentConflictType.CROSS_ORGANIZATION_CONFLICT:
        return "ORGANIZATION";
      case UserAssignmentConflictType.CROSS_DEPARTMENT_CONFLICT:
        return "DEPARTMENT";
      case UserAssignmentConflictType.SINGLE_DEPARTMENT_VIOLATION:
        return "DEPARTMENT";
      case UserAssignmentConflictType.TEMPORARY_ASSIGNMENT_CONFLICT:
        return "USER";
      case UserAssignmentConflictType.PERMISSION_CONFLICT:
        return "SYSTEM";
      case UserAssignmentConflictType.ROLE_CONFLICT:
        return "ORGANIZATION";
      default:
        return "USER";
    }
  }

  /**
   * 获取冲突解决建议
   *
   * @returns 冲突解决建议
   */
  getConflictResolutionSuggestions(): string[] {
    const suggestions: string[] = [];

    switch (this.conflictType) {
      case UserAssignmentConflictType.DUPLICATE_ASSIGNMENT:
        suggestions.push("检查现有分配，避免重复分配");
        suggestions.push("考虑使用临时分配替代永久分配");
        break;
      case UserAssignmentConflictType.CROSS_ORGANIZATION_CONFLICT:
        suggestions.push("确认用户是否确实需要跨组织分配");
        suggestions.push("检查组织分配策略和限制");
        break;
      case UserAssignmentConflictType.CROSS_DEPARTMENT_CONFLICT:
        suggestions.push("确认用户是否确实需要跨部门分配");
        suggestions.push("检查部门分配策略和限制");
        break;
      case UserAssignmentConflictType.SINGLE_DEPARTMENT_VIOLATION:
        suggestions.push("确保用户在同一组织内只归属于一个部门");
        suggestions.push("检查部门分配规则");
        break;
      case UserAssignmentConflictType.TEMPORARY_ASSIGNMENT_CONFLICT:
        suggestions.push("检查临时分配的有效期");
        suggestions.push("考虑延长或终止临时分配");
        break;
      case UserAssignmentConflictType.PERMISSION_CONFLICT:
        suggestions.push("检查权限配置和冲突");
        suggestions.push("联系系统管理员解决权限问题");
        break;
      case UserAssignmentConflictType.ROLE_CONFLICT:
        suggestions.push("检查角色分配和冲突");
        suggestions.push("确认用户角色配置");
        break;
    }

    return suggestions;
  }

  /**
   * 获取冲突影响用户数量
   *
   * @returns 影响用户数量
   */
  getAffectedUserCount(): number {
    return 1; // 当前只影响一个用户
  }

  /**
   * 获取冲突影响组织数量
   *
   * @returns 影响组织数量
   */
  getAffectedOrganizationCount(): number {
    const organizations = new Set([
      this.organizationId.value,
      ...this.existingAssignments.map((a) => a.organizationId.value),
    ]);
    return organizations.size;
  }

  /**
   * 获取冲突影响部门数量
   *
   * @returns 影响部门数量
   */
  getAffectedDepartmentCount(): number {
    const departments = new Set([
      this.departmentId.value,
      ...this.existingAssignments.map((a) => a.departmentId.value),
    ]);
    return departments.size;
  }

  /**
   * 检查冲突是否涉及临时分配
   *
   * @returns 是否涉及临时分配
   */
  involvesTemporaryAssignment(): boolean {
    return (
      this.attemptedAssignment.isTemporary ||
      this.existingAssignments.some((a) => a.isTemporary)
    );
  }

  /**
   * 获取冲突持续时间
   *
   * @returns 冲突持续时间（毫秒）
   */
  getConflictDuration(): number {
    const now = new Date();
    return now.getTime() - this.conflictDetectedAt.getTime();
  }

  /**
   * 检查冲突是否已过期
   *
   * @param timeoutMs - 超时时间（毫秒）
   * @returns 是否已过期
   */
  isConflictExpired(timeoutMs: number = 24 * 60 * 60 * 1000): boolean {
    return this.getConflictDuration() > timeoutMs;
  }

  /**
   * 获取事件类型
   *
   * @returns 事件类型
   */
  getEventType(): string {
    return "UserAssignmentConflictEvent";
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
    return `user-assignment-conflict-${this.userId.value}-${this.organizationId.value}-${this.departmentId.value}-${this.conflictDetectedAt.getTime()}`;
  }

  /**
   * 获取事件聚合根ID
   *
   * @returns 聚合根ID
   */
  getAggregateId(): string {
    return this.userId.value;
  }

  /**
   * 获取事件时间戳
   *
   * @returns 事件时间戳
   */
  getTimestamp(): Date {
    return this.conflictDetectedAt;
  }

  /**
   * 获取事件数据
   *
   * @returns 事件数据
   */
  getEventData(): Record<string, unknown> {
    return {
      userId: this.userId.value,
      organizationId: this.organizationId.value,
      departmentId: this.departmentId.value,
      conflictType: this.conflictType,
      conflictReason: this.conflictReason,
      existingAssignments: this.existingAssignments.map((a) => ({
        userId: a.userId.value,
        organizationId: a.organizationId.value,
        departmentId: a.departmentId.value,
        assignedAt: a.assignedAt.toISOString(),
        isTemporary: a.isTemporary,
        expiresAt: a.expiresAt?.toISOString(),
      })),
      attemptedAssignment: {
        userId: this.attemptedAssignment.userId.value,
        organizationId: this.attemptedAssignment.organizationId.value,
        departmentId: this.attemptedAssignment.departmentId.value,
        assignedAt: this.attemptedAssignment.assignedAt.toISOString(),
        isTemporary: this.attemptedAssignment.isTemporary,
        expiresAt: this.attemptedAssignment.expiresAt?.toISOString(),
      },
      conflictDetectedAt: this.conflictDetectedAt.toISOString(),
      metadata: this.metadata,
    };
  }

  /**
   * 获取事件的字符串表示
   *
   * @returns 字符串表示
   */
  toString(): string {
    return `UserAssignmentConflictEvent(userId: ${this.userId.value}, organizationId: ${this.organizationId.value}, departmentId: ${this.departmentId.value}, conflictType: ${this.conflictType}, conflictReason: ${this.conflictReason})`;
  }

  /**
   * 创建用户分配冲突事件
   *
   * @param userId - 用户ID
   * @param organizationId - 组织ID
   * @param departmentId - 部门ID
   * @param conflictType - 冲突类型
   * @param conflictReason - 冲突原因
   * @param existingAssignments - 现有分配
   * @param attemptedAssignment - 尝试分配
   * @param metadata - 元数据
   * @returns 用户分配冲突事件
   */
  static create(
    userId: UserId,
    organizationId: OrganizationId,
    departmentId: DepartmentId,
    conflictType: UserAssignmentConflictType,
    conflictReason: string,
    existingAssignments: readonly {
      readonly userId: UserId;
      readonly organizationId: OrganizationId;
      readonly departmentId: DepartmentId;
      readonly assignedAt: Date;
      readonly isTemporary: boolean;
      readonly expiresAt?: Date;
    }[],
    attemptedAssignment: {
      readonly userId: UserId;
      readonly organizationId: OrganizationId;
      readonly departmentId: DepartmentId;
      readonly assignedAt: Date;
      readonly isTemporary: boolean;
      readonly expiresAt?: Date;
    },
    metadata: Record<string, unknown> = {},
  ): UserAssignmentConflictEvent {
    return new UserAssignmentConflictEvent({
      userId,
      organizationId,
      departmentId,
      conflictType,
      conflictReason,
      existingAssignments,
      attemptedAssignment,
      conflictDetectedAt: new Date(),
      metadata,
    });
  }

  /**
   * 从事件数据创建用户分配冲突事件
   *
   * @param eventData - 事件数据
   * @returns 用户分配冲突事件
   */
  static fromEventData(
    eventData: Record<string, unknown>,
  ): UserAssignmentConflictEvent {
    return new UserAssignmentConflictEvent({
      userId: new UserId(eventData.userId as string),
      organizationId: new OrganizationId(eventData.organizationId as string),
      departmentId: new DepartmentId(eventData.departmentId as string),
      conflictType: eventData.conflictType as UserAssignmentConflictType,
      conflictReason: eventData.conflictReason as string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 动态解析事件数据，类型未知
      existingAssignments: (eventData.existingAssignments as any[]).map(
        (a) => ({
          userId: new UserId(a.userId),
          organizationId: new OrganizationId(a.organizationId),
          departmentId: new DepartmentId(a.departmentId),
          assignedAt: new Date(a.assignedAt),
          isTemporary: a.isTemporary,
          expiresAt: a.expiresAt ? new Date(a.expiresAt) : undefined,
        }),
      ),
      attemptedAssignment: {
        userId: new UserId(eventData.attemptedAssignment.userId),
        organizationId: new OrganizationId(
          eventData.attemptedAssignment.organizationId,
        ),
        departmentId: new DepartmentId(
          eventData.attemptedAssignment.departmentId,
        ),
        assignedAt: new Date(eventData.attemptedAssignment.assignedAt),
        isTemporary: eventData.attemptedAssignment.isTemporary,
        expiresAt: eventData.attemptedAssignment.expiresAt
          ? new Date(eventData.attemptedAssignment.expiresAt)
          : undefined,
      },
      conflictDetectedAt: new Date(eventData.conflictDetectedAt as string),
      metadata: eventData.metadata as Record<string, unknown>,
    });
  }
}
