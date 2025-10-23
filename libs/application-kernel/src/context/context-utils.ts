/**
 * 上下文管理工具
 *
 * 提供上下文管理的实用工具函数
 * 支持上下文创建、验证、传播和清理
 *
 * @since 1.0.0
 */
import { IsolationContext } from "@hl8/domain-kernel";
import { IUseCaseContext } from "./use-case-context.interface.js";

/**
 * 上下文管理工具类
 *
 * 提供上下文管理的实用工具函数
 */
export class ContextUtils {
  /**
   * 创建用例上下文
   *
   * @param tenant - 租户信息
   * @param user - 用户信息
   * @param requestId - 请求标识符
   * @param metadata - 附加元数据
   * @returns 用例上下文
   */
  static createUseCaseContext(
    tenant?: { id: string; name: string },
    user?: { id: string; username: string },
    requestId?: string,
    metadata?: Record<string, unknown>,
  ): IUseCaseContext {
    return {
      tenant,
      user,
      requestId: requestId || this.generateRequestId(),
      timestamp: new Date(),
      metadata,
    };
  }

  /**
   * 从隔离上下文创建用例上下文
   *
   * @param isolationContext - 隔离上下文
   * @param tenant - 租户信息
   * @param user - 用户信息
   * @param requestId - 请求标识符
   * @returns 用例上下文
   */
  static createUseCaseContextFromIsolation(
    isolationContext: IsolationContext,
    tenant?: { id: string; name: string },
    user?: { id: string; username: string },
    requestId?: string,
  ): IUseCaseContext {
    return {
      tenant,
      user,
      requestId: requestId || this.generateRequestId(),
      timestamp: new Date(),
      metadata: {
        isolationLevel: isolationContext.getIsolationLevel(),
        ...isolationContext.buildLogContext(),
      },
    };
  }

  /**
   * 验证用例上下文
   *
   * @param context - 用例上下文
   * @returns 验证结果
   */
  static validateUseCaseContext(context: IUseCaseContext): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!context.requestId || context.requestId.trim() === "") {
      errors.push("请求标识符不能为空");
    }

    if (!context.timestamp || !(context.timestamp instanceof Date)) {
      errors.push("时间戳必须是有效的日期对象");
    }

    if (context.tenant && (!context.tenant.id || !context.tenant.name)) {
      errors.push("租户信息必须包含有效的ID和名称");
    }

    if (context.user && (!context.user.id || !context.user.username)) {
      errors.push("用户信息必须包含有效的ID和用户名");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 合并上下文
   *
   * @param baseContext - 基础上下文
   * @param additionalContext - 附加上下文
   * @returns 合并后的上下文
   */
  static mergeContexts(
    baseContext: IUseCaseContext,
    additionalContext: Partial<IUseCaseContext>,
  ): IUseCaseContext {
    return {
      ...baseContext,
      ...additionalContext,
      metadata: {
        ...baseContext.metadata,
        ...additionalContext.metadata,
      },
    };
  }

  /**
   * 生成请求标识符
   *
   * @returns 请求标识符
   */
  static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 创建上下文快照
   *
   * @param context - 用例上下文
   * @returns 上下文快照
   */
  static createContextSnapshot(context: IUseCaseContext): IUseCaseContext {
    return {
      tenant: context.tenant ? { ...context.tenant } : undefined,
      user: context.user ? { ...context.user } : undefined,
      requestId: context.requestId,
      timestamp: new Date(context.timestamp),
      metadata: context.metadata ? { ...context.metadata } : undefined,
    };
  }

  /**
   * 检查上下文是否过期
   *
   * @param context - 用例上下文
   * @param maxAgeMs - 最大年龄（毫秒）
   * @returns 是否过期
   */
  static isContextExpired(
    context: IUseCaseContext,
    maxAgeMs: number = 300000,
  ): boolean {
    const now = new Date();
    const age = now.getTime() - context.timestamp.getTime();
    return age > maxAgeMs;
  }

  /**
   * 清理上下文
   *
   * @param context - 用例上下文
   * @returns 清理后的上下文
   */
  static cleanupContext(context: IUseCaseContext): IUseCaseContext {
    return {
      tenant: context.tenant,
      user: context.user,
      requestId: context.requestId,
      timestamp: context.timestamp,
      metadata: undefined,
    };
  }
}
