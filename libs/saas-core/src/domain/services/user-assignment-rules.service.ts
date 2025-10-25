/**
 * 用户分配规则服务
 *
 * @description 负责用户组织分配的业务规则验证和约束逻辑
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { UserId } from "../value-objects/user-id.vo.js";
import { OrganizationId } from "../value-objects/organization-id.vo.js";
import { DepartmentId } from "../value-objects/department-id.vo.js";

/**
 * 用户分配规则验证结果
 */
export interface UserAssignmentValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings?: readonly string[];
}

/**
 * 用户分配规则配置
 */
export interface UserAssignmentRulesConfig {
  readonly maxOrganizationsPerUser: number;
  readonly maxDepartmentsPerUser: number;
  readonly allowCrossOrganizationAssignment: boolean;
  readonly allowCrossDepartmentAssignment: boolean;
  readonly requireSingleDepartmentPerOrganization: boolean;
  readonly allowTemporaryAssignment: boolean;
  readonly maxTemporaryAssignmentDays: number;
}

/**
 * 用户分配规则服务
 *
 * 用户分配规则服务负责验证用户组织分配的业务规则和约束逻辑。
 * 支持用户跨组织分配、部门分配、临时分配等复杂业务场景的验证。
 *
 * @example
 * ```typescript
 * const rules = new UserAssignmentRules();
 * const result = await rules.validateUserAssignment(
 *   userId,
 *   organizationId,
 *   departmentId,
 *   existingAssignments
 * );
 * if (result.isValid) {
 *   console.log("用户分配验证通过");
 * } else {
 *   console.log("验证失败:", result.errors);
 * }
 * ```
 */
@Injectable()
export class UserAssignmentRules {
  private readonly config: UserAssignmentRulesConfig;

  constructor(config?: Partial<UserAssignmentRulesConfig>) {
    this.config = {
      maxOrganizationsPerUser: config?.maxOrganizationsPerUser || 5,
      maxDepartmentsPerUser: config?.maxDepartmentsPerUser || 10,
      allowCrossOrganizationAssignment:
        config?.allowCrossOrganizationAssignment || true,
      allowCrossDepartmentAssignment:
        config?.allowCrossDepartmentAssignment || true,
      requireSingleDepartmentPerOrganization:
        config?.requireSingleDepartmentPerOrganization || true,
      allowTemporaryAssignment: config?.allowTemporaryAssignment || true,
      maxTemporaryAssignmentDays: config?.maxTemporaryAssignmentDays || 30,
      ...config,
    };
  }

  /**
   * 验证用户分配
   *
   * @param userId - 用户ID
   * @param organizationId - 组织ID
   * @param departmentId - 部门ID
   * @param existingAssignments - 现有分配列表
   * @returns 验证结果
   */
  async validateUserAssignment(
    userId: UserId,
    organizationId: OrganizationId,
    departmentId: DepartmentId,
    existingAssignments: readonly {
      readonly userId: UserId;
      readonly organizationId: OrganizationId;
      readonly departmentId: DepartmentId;
      readonly isTemporary: boolean;
      readonly expiresAt?: Date;
    }[],
  ): Promise<UserAssignmentValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 获取用户的现有分配
    const userAssignments = existingAssignments.filter((assignment) =>
      assignment.userId.equals(userId),
    );

    // 验证组织分配限制
    const organizationValidation = this.validateOrganizationAssignment(
      userId,
      organizationId,
      userAssignments,
    );
    if (!organizationValidation.isValid) {
      errors.push(...organizationValidation.errors);
    }
    if (organizationValidation.warnings) {
      warnings.push(...organizationValidation.warnings);
    }

    // 验证部门分配限制
    const departmentValidation = this.validateDepartmentAssignment(
      userId,
      organizationId,
      departmentId,
      userAssignments,
    );
    if (!departmentValidation.isValid) {
      errors.push(...departmentValidation.errors);
    }
    if (departmentValidation.warnings) {
      warnings.push(...departmentValidation.warnings);
    }

    // 验证跨组织分配规则
    const crossOrganizationValidation =
      this.validateCrossOrganizationAssignment(
        userId,
        organizationId,
        userAssignments,
      );
    if (!crossOrganizationValidation.isValid) {
      errors.push(...crossOrganizationValidation.errors);
    }

    // 验证跨部门分配规则
    const crossDepartmentValidation = this.validateCrossDepartmentAssignment(
      userId,
      organizationId,
      departmentId,
      userAssignments,
    );
    if (!crossDepartmentValidation.isValid) {
      errors.push(...crossDepartmentValidation.errors);
    }

    // 验证单一部门归属规则
    const singleDepartmentValidation = this.validateSingleDepartmentAssignment(
      userId,
      organizationId,
      departmentId,
      userAssignments,
    );
    if (!singleDepartmentValidation.isValid) {
      errors.push(...singleDepartmentValidation.errors);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * 验证组织分配限制
   *
   * @param userId - 用户ID
   * @param organizationId - 组织ID
   * @param userAssignments - 用户现有分配
   * @returns 验证结果
   */
  private validateOrganizationAssignment(
    userId: UserId,
    organizationId: OrganizationId,
    userAssignments: readonly {
      readonly userId: UserId;
      readonly organizationId: OrganizationId;
      readonly departmentId: DepartmentId;
      readonly isTemporary: boolean;
      readonly expiresAt?: Date;
    }[],
  ): UserAssignmentValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 获取用户已分配的组织（排除临时分配）
    const permanentOrganizations = userAssignments
      .filter((assignment) => !assignment.isTemporary)
      .map((assignment) => assignment.organizationId);

    // 检查是否已在该组织
    const isAlreadyInOrganization = permanentOrganizations.some((orgId) =>
      orgId.equals(organizationId),
    );

    if (isAlreadyInOrganization) {
      errors.push(`用户已在该组织中`);
    }

    // 检查组织数量限制
    if (permanentOrganizations.length >= this.config.maxOrganizationsPerUser) {
      errors.push(
        `用户最多只能分配到 ${this.config.maxOrganizationsPerUser} 个组织`,
      );
    }

    // 检查是否接近限制
    if (
      permanentOrganizations.length >=
      this.config.maxOrganizationsPerUser - 1
    ) {
      warnings.push(`用户已接近组织分配限制`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * 验证部门分配限制
   *
   * @param userId - 用户ID
   * @param organizationId - 组织ID
   * @param departmentId - 部门ID
   * @param userAssignments - 用户现有分配
   * @returns 验证结果
   */
  private validateDepartmentAssignment(
    userId: UserId,
    organizationId: OrganizationId,
    departmentId: DepartmentId,
    userAssignments: readonly {
      readonly userId: UserId;
      readonly organizationId: OrganizationId;
      readonly departmentId: DepartmentId;
      readonly isTemporary: boolean;
      readonly expiresAt?: Date;
    }[],
  ): UserAssignmentValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 获取用户已分配的部门（排除临时分配）
    const permanentDepartments = userAssignments
      .filter((assignment) => !assignment.isTemporary)
      .map((assignment) => assignment.departmentId);

    // 检查是否已在该部门
    const isAlreadyInDepartment = permanentDepartments.some((deptId) =>
      deptId.equals(departmentId),
    );

    if (isAlreadyInDepartment) {
      errors.push(`用户已在该部门中`);
    }

    // 检查部门数量限制
    if (permanentDepartments.length >= this.config.maxDepartmentsPerUser) {
      errors.push(
        `用户最多只能分配到 ${this.config.maxDepartmentsPerUser} 个部门`,
      );
    }

    // 检查是否接近限制
    if (permanentDepartments.length >= this.config.maxDepartmentsPerUser - 1) {
      warnings.push(`用户已接近部门分配限制`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * 验证跨组织分配规则
   *
   * @param userId - 用户ID
   * @param organizationId - 组织ID
   * @param userAssignments - 用户现有分配
   * @returns 验证结果
   */
  private validateCrossOrganizationAssignment(
    userId: UserId,
    organizationId: OrganizationId,
    userAssignments: readonly {
      readonly userId: UserId;
      readonly organizationId: OrganizationId;
      readonly departmentId: DepartmentId;
      readonly isTemporary: boolean;
      readonly expiresAt?: Date;
    }[],
  ): UserAssignmentValidationResult {
    const errors: string[] = [];

    // 获取用户已分配的组织
    const existingOrganizations = userAssignments.map(
      (assignment) => assignment.organizationId,
    );

    // 检查是否允许跨组织分配
    if (
      !this.config.allowCrossOrganizationAssignment &&
      existingOrganizations.length > 0
    ) {
      const isDifferentOrganization = existingOrganizations.every(
        (orgId) => !orgId.equals(organizationId),
      );

      if (isDifferentOrganization) {
        errors.push(`不允许跨组织分配`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证跨部门分配规则
   *
   * @param userId - 用户ID
   * @param organizationId - 组织ID
   * @param departmentId - 部门ID
   * @param userAssignments - 用户现有分配
   * @returns 验证结果
   */
  private validateCrossDepartmentAssignment(
    userId: UserId,
    organizationId: OrganizationId,
    departmentId: DepartmentId,
    userAssignments: readonly {
      readonly userId: UserId;
      readonly organizationId: OrganizationId;
      readonly departmentId: DepartmentId;
      readonly isTemporary: boolean;
      readonly expiresAt?: Date;
    }[],
  ): UserAssignmentValidationResult {
    const errors: string[] = [];

    // 获取用户在同一组织内的部门分配
    const sameOrganizationAssignments = userAssignments.filter((assignment) =>
      assignment.organizationId.equals(organizationId),
    );

    // 检查是否允许跨部门分配
    if (
      !this.config.allowCrossDepartmentAssignment &&
      sameOrganizationAssignments.length > 0
    ) {
      const isDifferentDepartment = sameOrganizationAssignments.every(
        (assignment) => !assignment.departmentId.equals(departmentId),
      );

      if (isDifferentDepartment) {
        errors.push(`不允许跨部门分配`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证单一部门归属规则
   *
   * @param userId - 用户ID
   * @param organizationId - 组织ID
   * @param departmentId - 部门ID
   * @param userAssignments - 用户现有分配
   * @returns 验证结果
   */
  private validateSingleDepartmentAssignment(
    userId: UserId,
    organizationId: OrganizationId,
    departmentId: DepartmentId,
    userAssignments: readonly {
      readonly userId: UserId;
      readonly organizationId: OrganizationId;
      readonly departmentId: DepartmentId;
      readonly isTemporary: boolean;
      readonly expiresAt?: Date;
    }[],
  ): UserAssignmentValidationResult {
    const errors: string[] = [];

    // 获取用户在同一组织内的部门分配
    const sameOrganizationAssignments = userAssignments.filter((assignment) =>
      assignment.organizationId.equals(organizationId),
    );

    // 检查是否要求单一部门归属
    if (
      this.config.requireSingleDepartmentPerOrganization &&
      sameOrganizationAssignments.length > 0
    ) {
      const hasDifferentDepartment = sameOrganizationAssignments.some(
        (assignment) => !assignment.departmentId.equals(departmentId),
      );

      if (hasDifferentDepartment) {
        errors.push(`用户在同一组织内只能归属于一个部门`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证临时分配规则
   *
   * @param userId - 用户ID
   * @param organizationId - 组织ID
   * @param departmentId - 部门ID
   * @param expiresAt - 过期时间
   * @param existingAssignments - 现有分配列表
   * @returns 验证结果
   */
  async validateTemporaryAssignment(
    userId: UserId,
    organizationId: OrganizationId,
    departmentId: DepartmentId,
    expiresAt: Date,
    existingAssignments: readonly {
      readonly userId: UserId;
      readonly organizationId: OrganizationId;
      readonly departmentId: DepartmentId;
      readonly isTemporary: boolean;
      readonly expiresAt?: Date;
    }[],
  ): Promise<UserAssignmentValidationResult> {
    const errors: string[] = [];

    // 检查是否允许临时分配
    if (!this.config.allowTemporaryAssignment) {
      errors.push(`不允许临时分配`);
      return { isValid: false, errors };
    }

    // 检查临时分配时长限制
    const now = new Date();
    const assignmentDays = Math.ceil(
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (assignmentDays > this.config.maxTemporaryAssignmentDays) {
      errors.push(
        `临时分配时长不能超过 ${this.config.maxTemporaryAssignmentDays} 天`,
      );
    }

    if (assignmentDays < 1) {
      errors.push(`临时分配时长不能少于1天`);
    }

    // 验证基本分配规则
    const basicValidation = await this.validateUserAssignment(
      userId,
      organizationId,
      departmentId,
      existingAssignments,
    );

    if (!basicValidation.isValid) {
      errors.push(...basicValidation.errors);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: basicValidation.warnings,
    };
  }

  /**
   * 检查用户是否可以分配到指定组织
   *
   * @param userId - 用户ID
   * @param organizationId - 组织ID
   * @param existingAssignments - 现有分配列表
   * @returns 是否可以分配
   */
  async canAssignToOrganization(
    userId: UserId,
    organizationId: OrganizationId,
    existingAssignments: readonly {
      readonly userId: UserId;
      readonly organizationId: OrganizationId;
      readonly departmentId: DepartmentId;
      readonly isTemporary: boolean;
      readonly expiresAt?: Date;
    }[],
  ): Promise<boolean> {
    const userAssignments = existingAssignments.filter((assignment) =>
      assignment.userId.equals(userId),
    );

    // 检查是否已在该组织
    const isAlreadyInOrganization = userAssignments.some((assignment) =>
      assignment.organizationId.equals(organizationId),
    );

    if (isAlreadyInOrganization) {
      return false;
    }

    // 检查组织数量限制
    const permanentOrganizations = userAssignments
      .filter((assignment) => !assignment.isTemporary)
      .map((assignment) => assignment.organizationId);

    return permanentOrganizations.length < this.config.maxOrganizationsPerUser;
  }

  /**
   * 检查用户是否可以分配到指定部门
   *
   * @param userId - 用户ID
   * @param organizationId - 组织ID
   * @param departmentId - 部门ID
   * @param existingAssignments - 现有分配列表
   * @returns 是否可以分配
   */
  async canAssignToDepartment(
    userId: UserId,
    organizationId: OrganizationId,
    departmentId: DepartmentId,
    existingAssignments: readonly {
      readonly userId: UserId;
      readonly organizationId: OrganizationId;
      readonly departmentId: DepartmentId;
      readonly isTemporary: boolean;
      readonly expiresAt?: Date;
    }[],
  ): Promise<boolean> {
    const userAssignments = existingAssignments.filter((assignment) =>
      assignment.userId.equals(userId),
    );

    // 检查是否已在该部门
    const isAlreadyInDepartment = userAssignments.some((assignment) =>
      assignment.departmentId.equals(departmentId),
    );

    if (isAlreadyInDepartment) {
      return false;
    }

    // 检查部门数量限制
    const permanentDepartments = userAssignments
      .filter((assignment) => !assignment.isTemporary)
      .map((assignment) => assignment.departmentId);

    return permanentDepartments.length < this.config.maxDepartmentsPerUser;
  }
}
