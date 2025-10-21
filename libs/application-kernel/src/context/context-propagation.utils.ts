/**
 * 上下文传播工具
 *
 * 提供上下文传播的实用工具函数
 * 支持上下文在调用链中的传递和同步
 *
 * @since 1.0.0
 */
import { IUseCaseContext } from "./use-case-context.interface.js";
// import type { IsolationContext } from "@hl8/domain-kernel";

/**
 * 上下文传播选项
 */
export interface ContextPropagationOptions {
  /**
   * 是否传播租户信息
   */
  propagateTenant?: boolean;

  /**
   * 是否传播用户信息
   */
  propagateUser?: boolean;

  /**
   * 是否传播请求标识符
   */
  propagateRequestId?: boolean;

  /**
   * 是否传播元数据
   */
  propagateMetadata?: boolean;

  /**
   * 是否传播隔离上下文
   */
  propagateIsolation?: boolean;
}

/**
 * 上下文传播工具类
 *
 * 提供上下文传播的实用工具函数
 */
export class ContextPropagationUtils {
  /**
   * 传播上下文到子操作
   *
   * @param parentContext - 父上下文
   * @param options - 传播选项
   * @returns 传播后的上下文
   */
  static propagateContext(
    parentContext: IUseCaseContext,
    options: ContextPropagationOptions = {},
  ): IUseCaseContext {
    const {
      propagateTenant = true,
      propagateUser = true,
      propagateRequestId = true,
      propagateMetadata = true,
      propagateIsolation: _propagateIsolation = true,
    } = options;

    return {
      tenant: propagateTenant ? parentContext.tenant : undefined,
      user: propagateUser ? parentContext.user : undefined,
      requestId: propagateRequestId
        ? parentContext.requestId
        : this.generateRequestId(),
      timestamp: new Date(),
      metadata: propagateMetadata ? parentContext.metadata : undefined,
    };
  }

  /**
   * 传播上下文到异步操作
   *
   * @param parentContext - 父上下文
   * @param asyncOperation - 异步操作
   * @param options - 传播选项
   * @returns 异步操作结果
   */
  static async propagateToAsync<T>(
    parentContext: IUseCaseContext,
    asyncOperation: (context: IUseCaseContext) => Promise<T>,
    options: ContextPropagationOptions = {},
  ): Promise<T> {
    const propagatedContext = this.propagateContext(parentContext, options);
    return await asyncOperation(propagatedContext);
  }

  /**
   * 传播上下文到同步操作
   *
   * @param parentContext - 父上下文
   * @param syncOperation - 同步操作
   * @param options - 传播选项
   * @returns 同步操作结果
   */
  static propagateToSync<T>(
    parentContext: IUseCaseContext,
    syncOperation: (context: IUseCaseContext) => T,
    options: ContextPropagationOptions = {},
  ): T {
    const propagatedContext = this.propagateContext(parentContext, options);
    return syncOperation(propagatedContext);
  }

  /**
   * 传播上下文到批量操作
   *
   * @param parentContext - 父上下文
   * @param operations - 操作数组
   * @param options - 传播选项
   * @returns 批量操作结果
   */
  static async propagateToBatch<T>(
    parentContext: IUseCaseContext,
    operations: Array<(context: IUseCaseContext) => Promise<T>>,
    options: ContextPropagationOptions = {},
  ): Promise<T[]> {
    const propagatedContext = this.propagateContext(parentContext, options);
    return await Promise.all(operations.map((op) => op(propagatedContext)));
  }

  /**
   * 传播上下文到并行操作
   *
   * @param parentContext - 父上下文
   * @param operations - 操作数组
   * @param options - 传播选项
   * @returns 并行操作结果
   */
  static async propagateToParallel<T>(
    parentContext: IUseCaseContext,
    operations: Array<(context: IUseCaseContext) => Promise<T>>,
    options: ContextPropagationOptions = {},
  ): Promise<T[]> {
    const propagatedContext = this.propagateContext(parentContext, options);
    return await Promise.all(operations.map((op) => op(propagatedContext)));
  }

  /**
   * 传播上下文到条件操作
   *
   * @param parentContext - 父上下文
   * @param condition - 条件函数
   * @param trueOperation - 条件为真时的操作
   * @param falseOperation - 条件为假时的操作
   * @param options - 传播选项
   * @returns 条件操作结果
   */
  static async propagateToConditional<T>(
    parentContext: IUseCaseContext,
    condition: (context: IUseCaseContext) => boolean,
    trueOperation: (context: IUseCaseContext) => Promise<T>,
    falseOperation: (context: IUseCaseContext) => Promise<T>,
    options: ContextPropagationOptions = {},
  ): Promise<T> {
    const propagatedContext = this.propagateContext(parentContext, options);

    if (condition(propagatedContext)) {
      return await trueOperation(propagatedContext);
    } else {
      return await falseOperation(propagatedContext);
    }
  }

  /**
   * 传播上下文到重试操作
   *
   * @param parentContext - 父上下文
   * @param operation - 操作函数
   * @param maxRetries - 最大重试次数
   * @param retryDelay - 重试延迟（毫秒）
   * @param options - 传播选项
   * @returns 重试操作结果
   */
  static async propagateToRetry<T>(
    parentContext: IUseCaseContext,
    operation: (context: IUseCaseContext) => Promise<T>,
    maxRetries: number = 3,
    retryDelay: number = 1000,
    options: ContextPropagationOptions = {},
  ): Promise<T> {
    const propagatedContext = this.propagateContext(parentContext, options);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation(propagatedContext);
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries) {
          await this.delay(retryDelay * Math.pow(2, attempt)); // 指数退避
        }
      }
    }

    throw lastError || new Error("重试操作失败");
  }

  /**
   * 传播上下文到超时操作
   *
   * @param parentContext - 父上下文
   * @param operation - 操作函数
   * @param timeoutMs - 超时时间（毫秒）
   * @param options - 传播选项
   * @returns 超时操作结果
   */
  static async propagateToTimeout<T>(
    parentContext: IUseCaseContext,
    operation: (context: IUseCaseContext) => Promise<T>,
    timeoutMs: number,
    options: ContextPropagationOptions = {},
  ): Promise<T> {
    const propagatedContext = this.propagateContext(parentContext, options);

    return await Promise.race([
      operation(propagatedContext),
      this.createTimeoutPromise<T>(timeoutMs),
    ]);
  }

  /**
   * 传播上下文到事件处理
   *
   * @param parentContext - 父上下文
   * @param eventType - 事件类型
   * @param eventData - 事件数据
   * @param options - 传播选项
   * @returns 事件处理结果
   */
  static async propagateToEvent<T>(
    parentContext: IUseCaseContext,
    eventType: string,
    eventData: any,
    options: ContextPropagationOptions = {},
  ): Promise<T> {
    const propagatedContext = this.propagateContext(parentContext, options);

    // 这里应该集成实际的事件系统
    console.log(`处理事件 ${eventType}:`, eventData);
    console.log("上下文:", propagatedContext);

    return {} as T;
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
   * 延迟执行
   *
   * @param ms - 延迟时间（毫秒）
   * @returns Promise
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 创建超时Promise
   *
   * @param timeoutMs - 超时时间（毫秒）
   * @returns 超时Promise
   */
  private static createTimeoutPromise<T>(timeoutMs: number): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`操作超时: ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }
}
