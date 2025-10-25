/**
 * 用户租户切换器
 *
 * @description 处理用户租户切换，包括身份验证、权限验证、上下文切换等
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { BaseDomainService } from "@hl8/domain-kernel";
import { UserId } from "@hl8/domain-kernel";
import { TenantId } from "@hl8/domain-kernel";
import { OrganizationId } from "@hl8/domain-kernel";
import { DepartmentId } from "@hl8/domain-kernel";
import { PlatformUser } from "../value-objects/platform-user.vo.js";
import { TenantUser } from "../value-objects/tenant-user.vo.js";

/**
 * 用户租户切换请求接口
 */
export interface UserTenantSwitchRequest {
  readonly userId: UserId;
  readonly fromTenantId?: TenantId;
  readonly toTenantId: TenantId;
  readonly organizationId?: OrganizationId;
  readonly departmentId?: DepartmentId;
  readonly reason?: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * 用户租户切换结果接口
 */
export interface UserTenantSwitchResult {
  readonly success: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly suggestions: readonly string[];
  readonly newContext?: {
    readonly userId: UserId;
    readonly tenantId: TenantId;
    readonly organizationId?: OrganizationId;
    readonly departmentId?: DepartmentId;
    readonly permissions: readonly string[];
    readonly roles: readonly string[];
  };
}

/**
 * 用户租户切换器
 *
 * 用户租户切换器负责处理用户租户切换，包括身份验证、权限验证、上下文切换等。
 * 支持平台用户和租户用户之间的切换，确保权限和上下文的正确性。
 *
 * @example
 * ```typescript
 * const switcher = new UserTenantSwitcher();
 * const result = await switcher.switchUserTenant(request);
 * if (result.success) {
 *   console.log("User tenant switched successfully");
 * }
 * ```
 */
@Injectable()
export class UserTenantSwitcher extends BaseDomainService {
  private readonly activeContexts: Map<
    string,
    {
      readonly userId: UserId;
      readonly tenantId: TenantId;
      readonly organizationId?: OrganizationId;
      readonly departmentId?: DepartmentId;
      readonly permissions: readonly string[];
      readonly roles: readonly string[];
      readonly switchedAt: Date;
    }
  > = new Map();

  constructor() {
    super();
    this.setContext("UserTenantSwitcher");
  }

  /**
   * 切换用户租户
   *
   * @param request - 切换请求
   * @returns 切换结果
   */
  async switchUserTenant(
    request: UserTenantSwitchRequest,
  ): Promise<UserTenantSwitchResult> {
    this.logger.log(
      `Switching user ${request.userId.value} from tenant ${request.fromTenantId?.value || "platform"} to tenant ${request.toTenantId.value}`,
      this.context,
    );

    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    try {
      // 验证用户身份
      const userValidation = await this.validateUserForTenantSwitch(request);
      if (!userValidation.isValid) {
        errors.push(...userValidation.errors);
        warnings.push(...(userValidation.warnings || []));
        suggestions.push(...(userValidation.suggestions || []));
      }

      // 验证目标租户权限
      const tenantValidation = await this.validateTenantAccess(request);
      if (!tenantValidation.isValid) {
        errors.push(...tenantValidation.errors);
        warnings.push(...(tenantValidation.warnings || []));
        suggestions.push(...(tenantValidation.suggestions || []));
      }

      // 验证组织权限（如果指定了组织）
      if (request.organizationId) {
        const orgValidation = await this.validateOrganizationAccess(request);
        if (!orgValidation.isValid) {
          errors.push(...orgValidation.errors);
          warnings.push(...(orgValidation.warnings || []));
          suggestions.push(...(orgValidation.suggestions || []));
        }
      }

      // 验证部门权限（如果指定了部门）
      if (request.departmentId) {
        const deptValidation = await this.validateDepartmentAccess(request);
        if (!deptValidation.isValid) {
          errors.push(...deptValidation.errors);
          warnings.push(...(orgValidation.warnings || []));
          suggestions.push(...(orgValidation.suggestions || []));
        }
      }

      if (errors.length > 0) {
        return {
          success: false,
          errors,
          warnings: warnings.length > 0 ? warnings : undefined,
          suggestions: suggestions.length > 0 ? suggestions : undefined,
        };
      }

      // 执行切换
      const newContext = await this.executeTenantSwitch(request);

      // 更新活动上下文
      const contextKey = `${request.userId.value}:${request.toTenantId.value}`;
      this.activeContexts.set(contextKey, {
        userId: request.userId,
        tenantId: request.toTenantId,
        organizationId: request.organizationId,
        departmentId: request.departmentId,
        permissions: newContext.permissions,
        roles: newContext.roles,
        switchedAt: new Date(),
      });

      this.logger.log(
        `User ${request.userId.value} successfully switched to tenant ${request.toTenantId.value}`,
        this.context,
      );

      return {
        success: true,
        errors: [],
        warnings: warnings.length > 0 ? warnings : undefined,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        newContext,
      };
    } catch (error) {
      this.logger.error(
        `Error switching user ${request.userId.value} to tenant ${request.toTenantId.value}: ${error.message}`,
        this.context,
      );

      return {
        success: false,
        errors: [error.message],
        warnings: warnings.length > 0 ? warnings : undefined,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
      };
    }
  }

  /**
   * 获取用户当前上下文
   *
   * @param userId - 用户ID
   * @param tenantId - 租户ID
   * @returns 用户上下文或undefined
   */
  async getUserContext(
    userId: UserId,
    tenantId: TenantId,
  ): Promise<
    | {
        readonly userId: UserId;
        readonly tenantId: TenantId;
        readonly organizationId?: OrganizationId;
        readonly departmentId?: DepartmentId;
        readonly permissions: readonly string[];
        readonly roles: readonly string[];
        readonly switchedAt: Date;
      }
    | undefined
  > {
    this.logger.log(
      `Getting user context for user ${userId.value} in tenant ${tenantId.value}`,
      this.context,
    );

    const contextKey = `${userId.value}:${tenantId.value}`;
    const context = this.activeContexts.get(contextKey);

    this.logger.log(
      `User context for user ${userId.value} in tenant ${tenantId.value} ${context ? "found" : "not found"}`,
      this.context,
    );

    return context;
  }

  /**
   * 清除用户上下文
   *
   * @param userId - 用户ID
   * @param tenantId - 租户ID
   * @returns 是否清除成功
   */
  async clearUserContext(userId: UserId, tenantId: TenantId): Promise<boolean> {
    this.logger.log(
      `Clearing user context for user ${userId.value} in tenant ${tenantId.value}`,
      this.context,
    );

    const contextKey = `${userId.value}:${tenantId.value}`;
    const deleted = this.activeContexts.delete(contextKey);

    this.logger.log(
      `User context for user ${userId.value} in tenant ${tenantId.value} cleared: ${deleted}`,
      this.context,
    );

    return deleted;
  }

  /**
   * 获取用户活动上下文列表
   *
   * @param userId - 用户ID
   * @returns 活动上下文列表
   */
  async getUserActiveContexts(userId: UserId): Promise<
    readonly {
      readonly userId: UserId;
      readonly tenantId: TenantId;
      readonly organizationId?: OrganizationId;
      readonly departmentId?: DepartmentId;
      readonly permissions: readonly string[];
      readonly roles: readonly string[];
      readonly switchedAt: Date;
    }[]
  > {
    this.logger.log(
      `Getting active contexts for user ${userId.value}`,
      this.context,
    );

    const contexts = Array.from(this.activeContexts.values()).filter(
      (context) => context.userId.equals(userId),
    );

    this.logger.log(
      `Found ${contexts.length} active contexts for user ${userId.value}`,
      this.context,
    );

    return contexts;
  }

  /**
   * 验证用户租户切换
   *
   * @param request - 切换请求
   * @returns 验证结果
   */
  private async validateUserForTenantSwitch(
    request: UserTenantSwitchRequest,
  ): Promise<{
    readonly isValid: boolean;
    readonly errors: readonly string[];
    readonly warnings: readonly string[];
    readonly suggestions: readonly string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 验证用户ID
    if (!request.userId) {
      errors.push("User ID is required");
    }

    // 验证目标租户ID
    if (!request.toTenantId) {
      errors.push("Target tenant ID is required");
    }

    // 验证不能切换到相同租户
    if (
      request.fromTenantId &&
      request.fromTenantId.equals(request.toTenantId)
    ) {
      errors.push("Cannot switch to the same tenant");
    }

    // 验证切换原因
    if (!request.reason || request.reason.trim() === "") {
      warnings.push("No reason provided for tenant switch");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }

  /**
   * 验证租户访问权限
   *
   * @param request - 切换请求
   * @returns 验证结果
   */
  private async validateTenantAccess(
    request: UserTenantSwitchRequest,
  ): Promise<{
    readonly isValid: boolean;
    readonly errors: readonly string[];
    readonly warnings: readonly string[];
    readonly suggestions: readonly string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 这里应该实现实际的租户访问权限验证逻辑
    // 例如：检查用户是否有权限访问目标租户
    // 检查租户是否处于活跃状态
    // 检查用户是否被分配到了目标租户

    // 模拟验证逻辑
    if (request.toTenantId.value === "blocked-tenant") {
      errors.push("Access to target tenant is blocked");
    }

    if (request.toTenantId.value === "inactive-tenant") {
      warnings.push("Target tenant is inactive");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }

  /**
   * 验证组织访问权限
   *
   * @param request - 切换请求
   * @returns 验证结果
   */
  private async validateOrganizationAccess(
    request: UserTenantSwitchRequest,
  ): Promise<{
    readonly isValid: boolean;
    readonly errors: readonly string[];
    readonly warnings: readonly string[];
    readonly suggestions: readonly string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 这里应该实现实际的组织访问权限验证逻辑
    // 例如：检查用户是否被分配到了目标组织
    // 检查组织是否处于活跃状态
    // 检查用户是否有权限访问目标组织

    // 模拟验证逻辑
    if (request.organizationId?.value === "blocked-org") {
      errors.push("Access to target organization is blocked");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }

  /**
   * 验证部门访问权限
   *
   * @param request - 切换请求
   * @returns 验证结果
   */
  private async validateDepartmentAccess(
    request: UserTenantSwitchRequest,
  ): Promise<{
    readonly isValid: boolean;
    readonly errors: readonly string[];
    readonly warnings: readonly string[];
    readonly suggestions: readonly string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 这里应该实现实际的部门访问权限验证逻辑
    // 例如：检查用户是否被分配到了目标部门
    // 检查部门是否处于活跃状态
    // 检查用户是否有权限访问目标部门

    // 模拟验证逻辑
    if (request.departmentId?.value === "blocked-dept") {
      errors.push("Access to target department is blocked");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }

  /**
   * 执行租户切换
   *
   * @param request - 切换请求
   * @returns 新上下文
   */
  private async executeTenantSwitch(request: UserTenantSwitchRequest): Promise<{
    readonly userId: UserId;
    readonly tenantId: TenantId;
    readonly organizationId?: OrganizationId;
    readonly departmentId?: DepartmentId;
    readonly permissions: readonly string[];
    readonly roles: readonly string[];
  }> {
    this.logger.log(
      `Executing tenant switch for user ${request.userId.value} to tenant ${request.toTenantId.value}`,
      this.context,
    );

    // 这里应该实现实际的租户切换逻辑
    // 例如：获取用户在目标租户中的权限和角色
    // 设置新的用户上下文
    // 记录切换日志

    // 模拟切换逻辑
    const newContext = {
      userId: request.userId,
      tenantId: request.toTenantId,
      organizationId: request.organizationId,
      departmentId: request.departmentId,
      permissions: ["user:read", "user:update", "tenant:access"],
      roles: ["user", "tenant_member"],
    };

    this.logger.log(
      `Tenant switch executed successfully for user ${request.userId.value}`,
      this.context,
    );

    return newContext;
  }
}
