import { AggregateRoot } from "@hl8/domain-kernel";
import { Organization } from "../entities/organization.entity.js";
import { OrganizationId } from "../value-objects/organization-id.vo.js";
import { TenantId } from "../value-objects/tenant-id.vo.js";
import { UserId } from "../value-objects/user-id.vo.js";
import { DepartmentId } from "../value-objects/department-id.vo.js";
import { type AuditInfo } from "@hl8/domain-kernel";
import { UserAssignmentRules } from "../services/user-assignment-rules.service.js";
import { UserAssignmentConflictEvent } from "../events/user-assignment-conflict.event.js";
import { UserOrganizationAssignment } from "../value-objects/user-organization-assignment.vo.js";
import { UserDepartmentAssignment } from "../value-objects/user-department-assignment.vo.js";

/**
 * 组织聚合根
 *
 * @description 组织聚合根，管理组织结构和权限
 * @since 1.0.0
 */
export class OrganizationAggregate extends AggregateRoot<OrganizationId> {
  private _organization: Organization;
  private _userAssignmentRules: UserAssignmentRules;

  /**
   * 创建组织聚合根
   *
   * @param organization - 组织实体
   */
  constructor(organization: Organization) {
    super(organization.id);
    this._organization = organization;
    this._userAssignmentRules = new UserAssignmentRules();
  }

  /**
   * 获取组织实体
   *
   * @returns 组织实体
   */
  get organization(): Organization {
    return this._organization;
  }

  /**
   * 获取组织ID
   *
   * @returns 组织ID
   */
  get id(): OrganizationId {
    return this._organization.id;
  }

  /**
   * 获取租户ID
   *
   * @returns 租户ID
   */
  get tenantId(): TenantId {
    return this._organization.tenantId;
  }

  /**
   * 更新组织名称
   *
   * @param name - 新的组织名称
   */
  updateName(name: string): void {
    this._organization.updateName(name);
    this.updateTimestamp();
  }

  /**
   * 更新组织描述
   *
   * @param description - 新的组织描述
   */
  updateDescription(description: string): void {
    this._organization.updateDescription(description);
    this.updateTimestamp();
  }

  /**
   * 更新组织类型
   *
   * @param type - 新的组织类型
   */
  updateType(type: string): void {
    this._organization.updateType(type);
    this.updateTimestamp();
  }

  /**
   * 激活组织
   */
  activate(): void {
    this._organization.activate();
    this.updateTimestamp();
  }

  /**
   * 停用组织
   */
  deactivate(): void {
    this._organization.deactivate();
    this.updateTimestamp();
  }

  /**
   * 检查组织是否活跃
   *
   * @returns 是否活跃
   */
  isActive(): boolean {
    return this._organization.isActive();
  }

  /**
   * 检查组织是否可以删除
   *
   * @param hasDepartments - 是否有部门
   * @param hasUsers - 是否有用户
   * @returns 是否可以删除
   */
  canBeDeleted(hasDepartments: boolean, hasUsers: boolean): boolean {
    return !hasDepartments && !hasUsers;
  }

  /**
   * 删除组织前的验证
   *
   * @param hasDepartments - 是否有部门
   * @param hasUsers - 是否有用户
   * @throws {Error} 当组织不能删除时抛出错误
   */
  validateDeletion(hasDepartments: boolean, hasUsers: boolean): void {
    if (hasDepartments) {
      throw new Error("无法删除包含部门的组织");
    }

    if (hasUsers) {
      throw new Error("无法删除包含用户的组织");
    }
  }

  /**
   * 获取快照数据
   *
   * @returns 快照数据
   */
  getSnapshotData(): Record<string, unknown> {
    return {
      id: this._organization.id.getValue(),
      name: this._organization.name,
      description: this._organization.description,
      type: this._organization.type,
      tenantId: this._organization.tenantId.getValue(),
      status: this._organization.status,
      auditInfo: this._organization.auditInfo,
    };
  }

  /**
   * 从快照加载数据
   *
   * @param snapshot - 快照数据
   */
  loadFromSnapshot(_snapshot: Record<string, unknown>): void {
    // 这里应该重新构建组织实体
    // 实际实现中需要根据快照数据重建组织实体
    throw new Error("从快照加载数据的方法需要在具体实现中完成");
  }

  /**
   * 验证用户分配
   *
   * @param userId - 用户ID
   * @param departmentId - 部门ID
   * @param existingAssignments - 现有分配列表
   * @returns 验证结果
   */
  async validateUserAssignment(
    userId: UserId,
    departmentId: DepartmentId,
    existingAssignments: readonly {
      readonly userId: UserId;
      readonly organizationId: OrganizationId;
      readonly departmentId: DepartmentId;
      readonly isTemporary: boolean;
      readonly expiresAt?: Date;
    }[],
  ): Promise<{
    readonly isValid: boolean;
    readonly errors: readonly string[];
    readonly warnings?: readonly string[];
  }> {
    const validation = await this._userAssignmentRules.validateUserAssignment(
      userId,
      this._organization.id,
      departmentId,
      existingAssignments,
    );

    if (!validation.isValid) {
      // 发布用户分配冲突事件
      this.addDomainEvent(
        new UserAssignmentConflictEvent({
          userId,
          organizationId: this._organization.id,
          departmentId,
          conflictType: this.determineConflictType(validation.errors),
          conflictReason: validation.errors.join(", "),
          existingAssignments: existingAssignments.filter((a) =>
            a.userId.equals(userId),
          ),
          attemptedAssignment: {
            userId,
            organizationId: this._organization.id,
            departmentId,
            assignedAt: new Date(),
            isTemporary: false,
          },
          conflictDetectedAt: new Date(),
          metadata: { source: "automatic", reason: "assignment_conflict" },
        }),
      );
    }

    return validation;
  }

  /**
   * 检查用户是否可以分配到指定部门
   *
   * @param userId - 用户ID
   * @param departmentId - 部门ID
   * @param existingAssignments - 现有分配列表
   * @returns 是否可以分配
   */
  async canAssignUserToDepartment(
    userId: UserId,
    departmentId: DepartmentId,
    existingAssignments: readonly {
      readonly userId: UserId;
      readonly organizationId: OrganizationId;
      readonly departmentId: DepartmentId;
      readonly isTemporary: boolean;
      readonly expiresAt?: Date;
    }[],
  ): Promise<boolean> {
    return await this._userAssignmentRules.canAssignToDepartment(
      userId,
      this._organization.id,
      departmentId,
      existingAssignments,
    );
  }

  /**
   * 检查用户是否可以分配到指定组织
   *
   * @param userId - 用户ID
   * @param existingAssignments - 现有分配列表
   * @returns 是否可以分配
   */
  async canAssignUserToOrganization(
    userId: UserId,
    existingAssignments: readonly {
      readonly userId: UserId;
      readonly organizationId: OrganizationId;
      readonly departmentId: DepartmentId;
      readonly isTemporary: boolean;
      readonly expiresAt?: Date;
    }[],
  ): Promise<boolean> {
    return await this._userAssignmentRules.canAssignToOrganization(
      userId,
      this._organization.id,
      existingAssignments,
    );
  }

  /**
   * 验证临时用户分配
   *
   * @param userId - 用户ID
   * @param departmentId - 部门ID
   * @param expiresAt - 过期时间
   * @param existingAssignments - 现有分配列表
   * @returns 验证结果
   */
  async validateTemporaryUserAssignment(
    userId: UserId,
    departmentId: DepartmentId,
    expiresAt: Date,
    existingAssignments: readonly {
      readonly userId: UserId;
      readonly organizationId: OrganizationId;
      readonly departmentId: DepartmentId;
      readonly isTemporary: boolean;
      readonly expiresAt?: Date;
    }[],
  ): Promise<{
    readonly isValid: boolean;
    readonly errors: readonly string[];
    readonly warnings?: readonly string[];
  }> {
    return await this._userAssignmentRules.validateTemporaryAssignment(
      userId,
      this._organization.id,
      departmentId,
      expiresAt,
      existingAssignments,
    );
  }

  /**
   * 确定冲突类型
   *
   * @param errors - 错误信息列表
   * @returns 冲突类型
   */
  private determineConflictType(errors: readonly string[]): string {
    if (errors.some((e) => e.includes("已存在"))) {
      return "DUPLICATE_ASSIGNMENT";
    }
    if (errors.some((e) => e.includes("跨组织"))) {
      return "CROSS_ORGANIZATION_CONFLICT";
    }
    if (errors.some((e) => e.includes("跨部门"))) {
      return "CROSS_DEPARTMENT_CONFLICT";
    }
    if (errors.some((e) => e.includes("单一部门"))) {
      return "SINGLE_DEPARTMENT_VIOLATION";
    }
    if (errors.some((e) => e.includes("临时"))) {
      return "TEMPORARY_ASSIGNMENT_CONFLICT";
    }
    if (errors.some((e) => e.includes("权限"))) {
      return "PERMISSION_CONFLICT";
    }
    if (errors.some((e) => e.includes("角色"))) {
      return "ROLE_CONFLICT";
    }
    return "UNKNOWN_CONFLICT";
  }

  /**
   * 获取用户分配规则
   *
   * @returns 用户分配规则
   */
  getUserAssignmentRules(): UserAssignmentRules {
    return this._userAssignmentRules;
  }

  /**
   * 更新用户分配规则
   *
   * @param rules - 新的用户分配规则
   */
  updateUserAssignmentRules(rules: UserAssignmentRules): void {
    this._userAssignmentRules = rules;
  }
}
