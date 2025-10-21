/**
 * 用户上下文管理工具
 *
 * 提供用户上下文管理的实用工具函数
 * 支持用户权限、会话管理和用户特定操作
 *
 * @since 1.0.0
 */
import { IsolationContext, UserId, TenantId } from "@hl8/domain-kernel";
import { IUseCaseContext } from "./use-case-context.interface.js";

/**
 * 用户权限信息
 */
export interface UserPermissions {
  /**
   * 权限列表
   */
  permissions: string[];

  /**
   * 角色列表
   */
  roles: string[];

  /**
   * 权限级别
   */
  level: "read" | "write" | "admin" | "super";
}

/**
 * 用户会话信息
 */
export interface UserSession {
  /**
   * 会话ID
   */
  sessionId: string;

  /**
   * 用户ID
   */
  userId: string;

  /**
   * 租户ID
   */
  tenantId?: string;

  /**
   * 会话开始时间
   */
  startTime: Date;

  /**
   * 最后活动时间
   */
  lastActivity: Date;

  /**
   * 会话过期时间
   */
  expiresAt: Date;
}

/**
 * 用户上下文管理工具类
 *
 * 提供用户上下文管理的实用工具函数
 */
export class UserContextUtils {
  /**
   * 创建用户上下文
   *
   * @param userId - 用户ID
   * @param username - 用户名
   * @param tenantId - 租户ID（可选）
   * @param permissions - 用户权限
   * @returns 用户上下文
   */
  static createUserContext(
    userId: string,
    username: string,
    tenantId?: string,
    permissions?: UserPermissions,
  ): IUseCaseContext {
    const isolationContext = tenantId
      ? IsolationContext.user(UserId.create(userId), TenantId.create(tenantId))
      : IsolationContext.user(UserId.create(userId));

    return {
      user: { id: userId, username },
      tenant: tenantId ? { id: tenantId, name: "用户租户" } : undefined,
      requestId: this.generateRequestId(),
      timestamp: new Date(),
      metadata: {
        permissions: permissions?.permissions || [],
        roles: permissions?.roles || [],
        level: permissions?.level || "read",
        isolationLevel: isolationContext.getIsolationLevel(),
      },
    };
  }

  /**
   * 验证用户权限
   *
   * @param context - 用例上下文
   * @param requiredPermission - 所需权限
   * @returns 是否有权限
   */
  static hasPermission(
    context: IUseCaseContext,
    requiredPermission: string,
  ): boolean {
    if (!context.user) {
      return false;
    }

    const permissions = (context.metadata?.permissions as string[]) || [];
    return (
      permissions.includes(requiredPermission) || permissions.includes("*")
    );
  }

  /**
   * 验证用户角色
   *
   * @param context - 用例上下文
   * @param requiredRole - 所需角色
   * @returns 是否有角色
   */
  static hasRole(context: IUseCaseContext, requiredRole: string): boolean {
    if (!context.user) {
      return false;
    }

    const roles = (context.metadata?.roles as string[]) || [];
    return roles.includes(requiredRole) || roles.includes("admin");
  }

  /**
   * 验证用户权限级别
   *
   * @param context - 用例上下文
   * @param requiredLevel - 所需权限级别
   * @returns 是否有足够权限级别
   */
  static hasPermissionLevel(
    context: IUseCaseContext,
    requiredLevel: string,
  ): boolean {
    if (!context.user) {
      return false;
    }

    const currentLevel = (context.metadata?.level as string) || "read";
    const levelHierarchy = ["read", "write", "admin", "super"];

    const currentIndex = levelHierarchy.indexOf(currentLevel);
    const requiredIndex = levelHierarchy.indexOf(requiredLevel);

    return currentIndex >= requiredIndex;
  }

  /**
   * 创建用户会话
   *
   * @param userId - 用户ID
   * @param tenantId - 租户ID（可选）
   * @param sessionDurationMs - 会话持续时间（毫秒）
   * @returns 用户会话
   */
  static createUserSession(
    userId: string,
    tenantId?: string,
    sessionDurationMs: number = 3600000, // 1小时
  ): UserSession {
    const now = new Date();
    return {
      sessionId: this.generateSessionId(),
      userId,
      tenantId,
      startTime: now,
      lastActivity: now,
      expiresAt: new Date(now.getTime() + sessionDurationMs),
    };
  }

  /**
   * 验证用户会话
   *
   * @param session - 用户会话
   * @returns 会话是否有效
   */
  static isSessionValid(session: UserSession): boolean {
    const now = new Date();
    return now < session.expiresAt;
  }

  /**
   * 更新用户会话活动
   *
   * @param session - 用户会话
   * @returns 更新后的会话
   */
  static updateSessionActivity(session: UserSession): UserSession {
    return {
      ...session,
      lastActivity: new Date(),
    };
  }

  /**
   * 延长用户会话
   *
   * @param session - 用户会话
   * @param additionalMs - 延长时间（毫秒）
   * @returns 更新后的会话
   */
  static extendSession(
    session: UserSession,
    additionalMs: number,
  ): UserSession {
    return {
      ...session,
      expiresAt: new Date(session.expiresAt.getTime() + additionalMs),
    };
  }

  /**
   * 获取用户隔离上下文
   *
   * @param context - 用例上下文
   * @returns 用户隔离上下文
   */
  static getUserIsolationContext(
    context: IUseCaseContext,
  ): IsolationContext | null {
    if (!context.user) {
      return null;
    }

    const tenantId = context.tenant?.id;
    if (tenantId) {
      return IsolationContext.user(
        UserId.create(context.user.id),
        TenantId.create(tenantId),
      );
    } else {
      return IsolationContext.user(UserId.create(context.user.id));
    }
  }

  /**
   * 检查用户是否可以访问租户
   *
   * @param context - 用例上下文
   * @param targetTenantId - 目标租户ID
   * @returns 是否可以访问
   */
  static canAccessTenant(
    context: IUseCaseContext,
    targetTenantId: string,
  ): boolean {
    if (!context.user) {
      return false;
    }

    // 超级管理员可以访问所有租户
    if (this.hasPermissionLevel(context, "super")) {
      return true;
    }

    // 检查是否是同一租户
    return context.tenant?.id === targetTenantId;
  }

  /**
   * 检查用户是否可以访问用户
   *
   * @param context - 用例上下文
   * @param targetUserId - 目标用户ID
   * @returns 是否可以访问
   */
  static canAccessUser(
    context: IUseCaseContext,
    targetUserId: string,
  ): boolean {
    if (!context.user) {
      return false;
    }

    // 管理员可以访问所有用户
    if (this.hasPermissionLevel(context, "admin")) {
      return true;
    }

    // 检查是否是同一用户
    return context.user.id === targetUserId;
  }

  /**
   * 生成请求标识符
   *
   * @returns 请求标识符
   */
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成会话标识符
   *
   * @returns 会话标识符
   */
  private static generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
