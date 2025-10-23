/**
 * 上下文清理工具
 *
 * 提供上下文清理的实用工具函数
 * 支持敏感数据清理、内存释放和资源管理
 *
 * @since 1.0.0
 */
import { IUseCaseContext } from "./use-case-context.interface.js";

/**
 * 上下文清理工具类
 *
 * 提供上下文清理的实用工具函数
 */
export class ContextCleanupUtils {
  /**
   * 清理敏感数据
   *
   * @param context - 用例上下文
   * @returns 清理后的上下文
   */
  static cleanupSensitiveData(context: IUseCaseContext): IUseCaseContext {
    return {
      tenant: context.tenant
        ? {
            id: context.tenant.id,
            name: context.tenant.name,
          }
        : undefined,
      user: context.user
        ? {
            id: context.user.id,
            username: context.user.username,
          }
        : undefined,
      requestId: context.requestId,
      timestamp: context.timestamp,
      metadata: this.cleanupMetadata(context.metadata),
    };
  }

  /**
   * 清理元数据
   *
   * @param metadata - 元数据
   * @returns 清理后的元数据
   */
  private static cleanupMetadata(
    metadata?: Record<string, unknown>,
  ): Record<string, unknown> | undefined {
    if (!metadata) {
      return undefined;
    }

    const cleaned: Record<string, unknown> = {};
    const sensitiveKeys = [
      "password",
      "token",
      "secret",
      "key",
      "auth",
      "credential",
    ];

    for (const [key, value] of Object.entries(metadata)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveKeys.some((sensitive) =>
        lowerKey.includes(sensitive),
      );

      if (isSensitive) {
        cleaned[key] = "[REDACTED]";
      } else if (typeof value === "object" && value !== null) {
        cleaned[key] = this.cleanupMetadata(value as Record<string, unknown>);
      } else {
        cleaned[key] = value;
      }
    }

    return cleaned;
  }

  /**
   * 清理上下文引用
   *
   * @param context - 用例上下文
   * @returns 清理后的上下文
   */
  static cleanupContextReferences(context: IUseCaseContext): IUseCaseContext {
    return {
      tenant: context.tenant ? { ...context.tenant } : undefined,
      user: context.user ? { ...context.user } : undefined,
      requestId: context.requestId,
      timestamp: new Date(context.timestamp),
      metadata: context.metadata ? { ...context.metadata } : undefined,
    };
  }

  /**
   * 深度清理上下文
   *
   * @param context - 用例上下文
   * @returns 清理后的上下文
   */
  static deepCleanupContext(context: IUseCaseContext): IUseCaseContext {
    const cleaned = this.cleanupSensitiveData(context);
    return this.cleanupContextReferences(cleaned);
  }

  /**
   * 清理过期上下文
   *
   * @param context - 用例上下文
   * @param maxAgeMs - 最大年龄（毫秒）
   * @returns 清理后的上下文或null
   */
  static cleanupExpiredContext(
    context: IUseCaseContext,
    maxAgeMs: number = 300000,
  ): IUseCaseContext | null {
    const now = new Date();
    const age = now.getTime() - context.timestamp.getTime();

    if (age > maxAgeMs) {
      return null;
    }

    return this.deepCleanupContext(context);
  }

  /**
   * 批量清理上下文
   *
   * @param contexts - 上下文数组
   * @param maxAgeMs - 最大年龄（毫秒）
   * @returns 清理后的上下文数组
   */
  static batchCleanupContexts(
    contexts: IUseCaseContext[],
    maxAgeMs: number = 300000,
  ): IUseCaseContext[] {
    return contexts
      .map((context) => this.cleanupExpiredContext(context, maxAgeMs))
      .filter((context): context is IUseCaseContext => context !== null);
  }

  /**
   * 清理上下文内存
   *
   * @param context - 用例上下文
   */
  static cleanupContextMemory(context: IUseCaseContext): void {
    // 清理循环引用
    if (context.metadata) {
      this.cleanupCircularReferences(context.metadata);
    }
  }

  /**
   * 清理循环引用
   *
   * @param obj - 对象
   * @param visited - 已访问的对象集合
   */
  private static cleanupCircularReferences(
    // 必须使用 any 类型：需要处理任意类型的对象结构，包括嵌套对象、数组等
    // 这是循环引用检测算法的核心需求，无法用具体类型替代
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: any,
    // 必须使用 any 类型：Set 需要存储任意类型的对象引用用于循环检测
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visited: Set<any> = new Set(),
  ): void {
    if (obj === null || typeof obj !== "object") {
      return;
    }

    if (visited.has(obj)) {
      return;
    }

    visited.add(obj);

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (typeof value === "object" && value !== null) {
          this.cleanupCircularReferences(value, visited);
        }
      }
    }

    visited.delete(obj);
  }

  /**
   * 创建清理后的上下文快照
   *
   * @param context - 用例上下文
   * @returns 清理后的上下文快照
   */
  static createCleanContextSnapshot(context: IUseCaseContext): IUseCaseContext {
    const cleaned = this.deepCleanupContext(context);
    this.cleanupContextMemory(cleaned);
    return cleaned;
  }
}
