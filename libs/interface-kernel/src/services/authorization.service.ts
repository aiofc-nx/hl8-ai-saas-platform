/**
 * @fileoverview 授权服务
 * @description 提供用户授权功能，包括权限检查、角色验证、资源访问控制等
 */

import { Injectable } from "@nestjs/common";
import { FastifyLoggerService } from "@hl8/nestjs-fastify";
import {
  GeneralBadRequestException,
  GeneralInternalServerException,
} from "@hl8/exceptions";
import type {
  UserContext,
  AuthorizationRule,
  IsolationContext,
  InterfaceFastifyRequest,
} from "../types/index.js";

/**
 * 授权服务
 * @description 提供用户授权相关功能
 */
@Injectable()
export class AuthorizationService {
  private readonly authorizationRules: Map<string, AuthorizationRule[]> =
    new Map();

  constructor(private readonly logger: FastifyLoggerService) {
    this.logger.log("Authorization Service initialized");
    this.initializeDefaultRules();
  }

  /**
   * 检查用户权限
   * @description 检查用户是否有执行特定操作的权限
   * @param user 用户上下文
   * @param resource 资源名称
   * @param action 操作名称
   * @param context 隔离上下文
   * @returns 是否有权限
   */
  async checkPermission(
    user: UserContext,
    resource: string,
    action: string,
    context?: IsolationContext,
  ): Promise<boolean> {
    try {
      this.logger.debug(
        `Checking permission for user ${user.email}: ${action} on ${resource}`,
      );

      // 1. 检查超级管理员权限
      if (this.isSuperAdmin(user)) {
        this.logger.debug("User is super admin, granting all permissions");
        return true;
      }

      // 2. 检查用户角色权限
      const hasRolePermission = await this.checkRolePermission(
        user,
        resource,
        action,
      );
      if (hasRolePermission) {
        this.logger.debug("User has role-based permission");
        return true;
      }

      // 3. 检查用户直接权限
      const hasDirectPermission = await this.checkDirectPermission(
        user,
        resource,
        action,
      );
      if (hasDirectPermission) {
        this.logger.debug("User has direct permission");
        return true;
      }

      // 4. 检查隔离上下文权限
      if (context) {
        const hasContextPermission = await this.checkContextPermission(
          user,
          resource,
          action,
          context,
        );
        if (hasContextPermission) {
          this.logger.debug("User has context-based permission");
          return true;
        }
      }

      this.logger.debug("User does not have required permission");

      // 根据上下文抛出具体的异常
      if (context && user.tenantId !== context.tenantId) {
        throw new GeneralBadRequestException(
          "跨租户访问被拒绝",
          "用户尝试访问其他租户的数据",
        );
      }

      if (
        context &&
        context.organizationId &&
        user.organizationId !== context.organizationId
      ) {
        throw new GeneralBadRequestException(
          "组织数据隔离违规",
          "用户尝试访问其他组织的数据",
        );
      }

      throw new GeneralBadRequestException(
        "权限不足",
        "用户没有执行此操作的权限",
      );
    } catch (error) {
      this.logger.error(
        `Permission check failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      // 如果是标准异常，直接抛出
      if (
        error instanceof GeneralBadRequestException ||
        error instanceof GeneralInternalServerException
      ) {
        throw error;
      }

      // 其他错误转换为权限不足异常
      throw new GeneralBadRequestException(
        "权限检查失败",
        "权限验证过程中发生错误",
      );
    }
  }

  /**
   * 检查用户角色权限
   * @description 检查用户角色是否有权限执行操作
   * @param user 用户上下文
   * @param resource 资源名称
   * @param action 操作名称
   * @returns 是否有角色权限
   */
  private async checkRolePermission(
    user: UserContext,
    resource: string,
    action: string,
  ): Promise<boolean> {
    try {
      // 获取资源的所有授权规则
      const rules = this.authorizationRules.get(resource) || [];

      for (const rule of rules) {
        // 检查规则是否匹配操作
        if (rule.action !== action && rule.action !== "*") {
          continue;
        }

        // 检查用户角色是否匹配
        if (rule.roles && rule.roles.length > 0) {
          const hasMatchingRole = user.roles.some((role) =>
            rule.roles!.includes(role),
          );
          if (hasMatchingRole) {
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      this.logger.error(
        `Role permission check failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  /**
   * 检查用户直接权限
   * @description 检查用户是否有直接权限执行操作
   * @param user 用户上下文
   * @param resource 资源名称
   * @param action 操作名称
   * @returns 是否有直接权限
   */
  private async checkDirectPermission(
    user: UserContext,
    resource: string,
    action: string,
  ): Promise<boolean> {
    try {
      // 检查用户权限列表
      const permission = `${resource}:${action}`;
      const wildcardPermission = `${resource}:*`;
      const globalPermission = "*:*";

      return (
        user.permissions.includes(permission) ||
        user.permissions.includes(wildcardPermission) ||
        user.permissions.includes(globalPermission)
      );
    } catch (error) {
      this.logger.error(
        `Direct permission check failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  /**
   * 检查隔离上下文权限
   * @description 检查用户在当前隔离上下文中是否有权限
   * @param user 用户上下文
   * @param resource 资源名称
   * @param action 操作名称
   * @param context 隔离上下文
   * @returns 是否有上下文权限
   */
  private async checkContextPermission(
    user: UserContext,
    resource: string,
    action: string,
    context: IsolationContext,
  ): Promise<boolean> {
    try {
      // 检查用户是否在正确的隔离上下文中
      if (user.tenantId !== context.tenantId) {
        this.logger.debug("User tenant does not match context tenant");
        return false;
      }

      // 检查组织级别权限
      if (
        context.organizationId &&
        user.organizationId !== context.organizationId
      ) {
        this.logger.debug(
          "User organization does not match context organization",
        );
        return false;
      }

      // 检查部门级别权限
      if (context.departmentId && user.departmentId !== context.departmentId) {
        this.logger.debug("User department does not match context department");
        return false;
      }

      // 检查用户级别权限
      if (context.userId && user.id !== context.userId) {
        this.logger.debug("User ID does not match context user ID");
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(
        `Context permission check failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  /**
   * 检查是否为超级管理员
   * @description 检查用户是否为超级管理员
   * @param user 用户上下文
   * @returns 是否为超级管理员
   */
  private isSuperAdmin(user: UserContext): boolean {
    return (
      user.roles.includes("super-admin") ||
      user.permissions.includes("*") ||
      user.isolationLevel === "platform"
    );
  }

  /**
   * 验证资源访问权限
   * @description 验证用户是否可以访问特定资源
   * @param user 用户上下文
   * @param resourceId 资源ID
   * @param resourceType 资源类型
   * @param action 操作类型
   * @returns 是否可以访问
   */
  async validateResourceAccess(
    user: UserContext,
    resourceId: string,
    resourceType: string,
    action: string,
  ): Promise<boolean> {
    try {
      this.logger.debug(
        `Validating resource access: ${action} on ${resourceType}:${resourceId}`,
      );

      // 1. 检查基本权限
      const hasBasicPermission = await this.checkPermission(
        user,
        resourceType,
        action,
      );
      if (!hasBasicPermission) {
        return false;
      }

      // 2. 检查资源所有权
      const isOwner = await this.checkResourceOwnership(
        user,
        resourceId,
        resourceType,
      );
      if (isOwner) {
        this.logger.debug("User owns the resource");
        return true;
      }

      // 3. 检查共享权限
      const hasSharedAccess = await this.checkSharedAccess(
        user,
        resourceId,
        resourceType,
      );
      if (hasSharedAccess) {
        this.logger.debug("User has shared access to the resource");
        return true;
      }

      this.logger.debug("User does not have access to the resource");
      return false;
    } catch (error) {
      this.logger.error(
        `Resource access validation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  /**
   * 检查资源所有权
   * @description 检查用户是否拥有特定资源
   * @param user 用户上下文
   * @param resourceId 资源ID
   * @param resourceType 资源类型
   * @returns 是否拥有资源
   */
  private async checkResourceOwnership(
    user: UserContext,
    resourceId: string,
    _resourceType: string,
  ): Promise<boolean> {
    try {
      // 这里应该调用应用层服务检查资源所有权
      // 暂时返回模拟结果
      return resourceId.startsWith(user.id);
    } catch (error) {
      this.logger.error(
        `Resource ownership check failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  /**
   * 检查共享访问权限
   * @description 检查用户是否有共享访问权限
   * @param user 用户上下文
   * @param resourceId 资源ID
   * @param resourceType 资源类型
   * @returns 是否有共享访问权限
   */
  private async checkSharedAccess(
    _user: UserContext,
    _resourceId: string,
    _resourceType: string,
  ): Promise<boolean> {
    try {
      // 这里应该调用应用层服务检查共享访问权限
      // 暂时返回模拟结果
      return false;
    } catch (error) {
      this.logger.error(
        `Shared access check failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  /**
   * 添加授权规则
   * @description 添加新的授权规则
   * @param resource 资源名称
   * @param rule 授权规则
   */
  addAuthorizationRule(resource: string, rule: AuthorizationRule): void {
    try {
      const rules = this.authorizationRules.get(resource) || [];
      rules.push(rule);
      this.authorizationRules.set(resource, rules);

      this.logger.debug(`Added authorization rule for resource: ${resource}`);
    } catch (error) {
      this.logger.error(
        `Failed to add authorization rule: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 移除授权规则
   * @description 移除指定的授权规则
   * @param resource 资源名称
   * @param ruleIndex 规则索引
   */
  removeAuthorizationRule(resource: string, ruleIndex: number): void {
    try {
      const rules = this.authorizationRules.get(resource) || [];
      if (ruleIndex >= 0 && ruleIndex < rules.length) {
        rules.splice(ruleIndex, 1);
        this.authorizationRules.set(resource, rules);
        this.logger.debug(
          `Removed authorization rule for resource: ${resource}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to remove authorization rule: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 获取授权规则
   * @description 获取指定资源的所有授权规则
   * @param resource 资源名称
   * @returns 授权规则列表
   */
  getAuthorizationRules(resource: string): AuthorizationRule[] {
    return this.authorizationRules.get(resource) || [];
  }

  /**
   * 初始化默认授权规则
   * @description 初始化系统默认的授权规则
   */
  private initializeDefaultRules(): void {
    try {
      // 用户管理权限
      this.addAuthorizationRule("users", {
        resource: "users",
        action: "read",
        roles: ["admin", "user-manager"],
      });

      this.addAuthorizationRule("users", {
        resource: "users",
        action: "create",
        roles: ["admin", "user-manager"],
      });

      this.addAuthorizationRule("users", {
        resource: "users",
        action: "update",
        roles: ["admin", "user-manager"],
      });

      this.addAuthorizationRule("users", {
        resource: "users",
        action: "delete",
        roles: ["admin"],
      });

      // 租户管理权限
      this.addAuthorizationRule("tenants", {
        resource: "tenants",
        action: "*",
        roles: ["super-admin"],
      });

      // 组织管理权限
      this.addAuthorizationRule("organizations", {
        resource: "organizations",
        action: "read",
        roles: ["admin", "org-manager"],
      });

      this.addAuthorizationRule("organizations", {
        resource: "organizations",
        action: "create",
        roles: ["admin", "org-manager"],
      });

      this.logger.debug("Default authorization rules initialized");
    } catch (error) {
      this.logger.error(
        `Failed to initialize default rules: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 检查请求权限
   * @description 检查请求是否有权限访问资源
   * @param request 请求对象
   * @param resource 资源名称
   * @param action 操作名称
   * @returns 是否有权限
   */
  async checkRequestPermission(
    request: InterfaceFastifyRequest,
    resource: string,
    action: string,
  ): Promise<boolean> {
    try {
      const user = request.user;
      if (!user) {
        this.logger.debug("No user context found in request");
        return false;
      }

      const context = request.isolationContext;
      return await this.checkPermission(user, resource, action, context);
    } catch (error) {
      this.logger.error(
        `Request permission check failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }
}
