/**
 * 用户业务规则服务
 *
 * @description 定义和管理用户的业务规则，包括用户创建、更新、删除等操作的规则和约束
 * @since 1.0.0
 */

import { User } from "../entities/user.entity.js";
import { UserId } from "@hl8/domain-kernel";
import { TenantId } from "@hl8/domain-kernel";
import { IsolationContext } from "@hl8/domain-kernel";

/**
 * 用户业务规则服务
 *
 * 负责定义和管理用户相关的业务规则，包括：
 * - 用户创建规则
 * - 用户更新规则
 * - 用户删除规则
 * - 用户状态转换规则
 * - 用户权限和角色规则
 */
export class UserBusinessRules {
  /**
   * 验证用户是否可以创建
   *
   * @description 验证用户创建是否满足所有业务规则
   * @param email - 用户邮箱
   * @param username - 用户名
   * @param tenantId - 租户ID
   * @param context - 隔离上下文
   * @returns 验证结果
   * @throws {Error} 当违反业务规则时抛出错误
   * @example
   * ```typescript
   * const rules = new UserBusinessRules();
   * rules.validateCreation("user@example.com", "username", tenantId, context);
   * ```
   */
  validateCreation(
    email: string,
    username: string,
    tenantId: TenantId,
    context: IsolationContext,
  ): boolean {
    // 验证邮箱格式
    if (!this.isValidEmail(email)) {
      throw new Error("邮箱格式无效");
    }

    // 验证用户名格式
    if (!this.isValidUsername(username)) {
      throw new Error("用户名格式无效");
    }

    // 验证租户上下文
    if (!tenantId) {
      throw new Error("租户ID不能为空");
    }

    // 验证隔离级别
    if (!context || !context.isValid()) {
      throw new Error("隔离上下文无效");
    }

    return true;
  }

  /**
   * 验证用户是否可以被更新
   *
   * @description 验证用户更新是否满足所有业务规则
   * @param user - 用户实体
   * @param updates - 更新内容
   * @param context - 隔离上下文
   * @returns 验证结果
   * @throws {Error} 当违反业务规则时抛出错误
   * @example
   * ```typescript
   * const rules = new UserBusinessRules();
   * rules.validateUpdate(user, { displayName: "New Name" }, context);
   * ```
   */
  validateUpdate(
    user: User,
    updates: Partial<Pick<User, "displayName" | "email" | "username">>,
    context: IsolationContext,
  ): boolean {
    // 验证用户存在
    if (!user) {
      throw new Error("用户不存在");
    }

    // 验证用户状态
    if (!user.isActive()) {
      throw new Error("非活跃用户不能更新");
    }

    // 验证邮箱更新
    if (updates.email && !this.isValidEmail(updates.email)) {
      throw new Error("邮箱格式无效");
    }

    // 验证用户名更新
    if (updates.username && !this.isValidUsername(updates.username)) {
      throw new Error("用户名格式无效");
    }

    // 验证显示名称更新
    if (
      updates.displayName &&
      (updates.displayName.trim().length === 0 ||
        updates.displayName.length > 100)
    ) {
      throw new Error("显示名称无效");
    }

    return true;
  }

  /**
   * 验证用户是否可以被删除
   *
   * @description 验证用户删除是否满足所有业务规则
   * @param user - 用户实体
   * @param context - 隔离上下文
   * @returns 验证结果
   * @throws {Error} 当违反业务规则时抛出错误
   * @example
   * ```typescript
   * const rules = new UserBusinessRules();
   * rules.validateDeletion(user, context);
   * ```
   */
  validateDeletion(user: User, context: IsolationContext): boolean {
    // 验证用户存在
    if (!user) {
      throw new Error("用户不存在");
    }

    // 验证系统用户不能删除
    if (user.isSystem()) {
      throw new Error("系统用户不能删除");
    }

    // 验证管理员用户删除限制
    if (user.isAdmin()) {
      throw new Error("管理员用户需要额外授权才能删除");
    }

    return true;
  }

  /**
   * 验证用户状态转换是否有效
   *
   * @description 验证用户状态转换是否满足状态转换规则
   * @param currentStatus - 当前状态
   * @param newStatus - 目标状态
   * @returns 验证结果
   * @throws {Error} 当状态转换无效时抛出错误
   * @example
   * ```typescript
   * const rules = new UserBusinessRules();
   * rules.validateStatusTransition("ACTIVE", "SUSPENDED");
   * ```
   */
  validateStatusTransition(currentStatus: string, newStatus: string): boolean {
    // 定义允许的状态转换
    const allowedTransitions: Record<string, string[]> = {
      PENDING: ["ACTIVE", "LOCKED"],
      ACTIVE: ["SUSPENDED", "INACTIVE", "LOCKED"],
      SUSPENDED: ["ACTIVE", "INACTIVE"],
      INACTIVE: ["ACTIVE"],
      LOCKED: ["ACTIVE"],
    };

    const allowed = allowedTransitions[currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new Error(`不允许从 ${currentStatus} 转换到 ${newStatus}`);
    }

    return true;
  }

  /**
   * 验证邮箱格式
   *
   * @description 验证邮箱地址是否符合格式要求
   * @param email - 邮箱地址
   * @returns 是否为有效邮箱
   * @example
   * ```typescript
   * const rules = new UserBusinessRules();
   * const isValid = rules.isValidEmail("user@example.com");
   * ```
   */
  isValidEmail(email: string): boolean {
    if (!email || typeof email !== "string") {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 验证用户名格式
   *
   * @description 验证用户名是否符合格式要求
   * @param username - 用户名
   * @returns 是否为有效用户名
   * @example
   * ```typescript
   * const rules = new UserBusinessRules();
   * const isValid = rules.isValidUsername("username123");
   * ```
   */
  isValidUsername(username: string): boolean {
    if (!username || typeof username !== "string") {
      return false;
    }
    if (username.length < 3 || username.length > 50) {
      return false;
    }
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    return usernameRegex.test(username);
  }

  /**
   * 验证用户是否有权限执行操作
   *
   * @description 验证用户是否有足够的权限执行特定操作
   * @param user - 用户实体
   * @param action - 操作名称
   * @returns 是否有权限
   * @example
   * ```typescript
   * const rules = new UserBusinessRules();
   * const hasPermission = rules.canPerformAction(user, "delete");
   * ```
   */
  canPerformAction(user: User, action: string): boolean {
    // 管理员拥有所有权限
    if (user.isAdmin()) {
      return true;
    }

    // 系统用户只能执行系统操作
    if (user.isSystem()) {
      return action.startsWith("system.");
    }

    // 普通用户权限检查
    return user.hasPermission(action);
  }

  /**
   * 验证用户是否可以访问资源
   *
   * @description 验证用户是否有权限访问特定资源
   * @param user - 用户实体
   * @param resourceId - 资源ID
   * @param resourceType - 资源类型
   * @param context - 隔离上下文
   * @returns 是否可以访问
   * @example
   * ```typescript
   * const rules = new UserBusinessRules();
   * const canAccess = rules.canAccessResource(user, resourceId, "data", context);
   * ```
   */
  canAccessResource(
    user: User,
    resourceId: string,
    resourceType: string,
    context: IsolationContext,
  ): boolean {
    // 验证用户状态
    if (!user.isActive()) {
      return false;
    }

    // 验证隔离上下文
    if (!context || !context.isValid()) {
      return false;
    }

    // 管理员可以访问所有资源
    if (user.isAdmin()) {
      return true;
    }

    // 检查用户权限
    return user.hasPermission(`resource.${resourceType}.access`);
  }
}
