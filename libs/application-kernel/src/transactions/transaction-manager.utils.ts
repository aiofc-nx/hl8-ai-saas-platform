/**
 * 事务管理工具
 *
 * 提供事务管理的实用工具函数
 * 支持事务边界管理、回滚处理和隔离级别控制
 *
 * @since 1.0.0
 */
import { ITransactionManager } from "./transaction-manager.interface.js";

/**
 * 事务选项
 */
export interface TransactionOptions {
  /**
   * 隔离级别
   */
  isolationLevel?:
    | "READ_UNCOMMITTED"
    | "READ_COMMITTED"
    | "REPEATABLE_READ"
    | "SERIALIZABLE";

  /**
   * 超时时间（毫秒）
   */
  timeout?: number;

  /**
   * 是否只读
   */
  readOnly?: boolean;

  /**
   * 是否自动提交
   */
  autoCommit?: boolean;

  /**
   * 重试次数
   */
  retryCount?: number;

  /**
   * 重试延迟（毫秒）
   */
  retryDelay?: number;
}

/**
 * 事务执行结果
 */
export interface TransactionResult<T> {
  /**
   * 是否成功
   */
  success: boolean;

  /**
   * 执行结果
   */
  result?: T;

  /**
   * 错误信息
   */
  error?: Error;

  /**
   * 执行耗时（毫秒）
   */
  duration: number;

  /**
   * 重试次数
   */
  retryCount: number;
}

/**
 * 事务管理工具类
 *
 * 提供事务管理的实用工具函数
 */
export class TransactionManagerUtils {
  /**
   * 在事务中执行操作
   *
   * @param transactionManager - 事务管理器
   * @param operation - 要执行的操作
   * @param options - 事务选项
   * @returns 执行结果
   */
  static async executeInTransaction<T>(
    transactionManager: ITransactionManager,
    operation: () => Promise<T>,
    options: TransactionOptions = {},
  ): Promise<TransactionResult<T>> {
    const startTime = Date.now();
    const {
      timeout = 30000,
      retryCount = 0,
      retryDelay = 1000,
      autoCommit = true,
    } = options;

    let lastError: Error | null = null;
    let actualRetryCount = 0;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        // 开始事务
        await transactionManager.begin();

        // 设置超时
        const timeoutPromise = this.createTimeoutPromise(timeout);
        const operationPromise = operation();

        // 执行操作
        const result = await Promise.race([operationPromise, timeoutPromise]);

        // 提交事务
        if (autoCommit) {
          await transactionManager.commit();
        }

        const duration = Date.now() - startTime;
        return {
          success: true,
          result,
          duration,
          retryCount: actualRetryCount,
        };
      } catch (error) {
        lastError = error as Error;
        actualRetryCount = attempt;

        try {
          // 回滚事务
          await transactionManager.rollback();
        } catch (rollbackError) {
          console.error("事务回滚失败:", rollbackError);
        }

        // 如果不是最后一次尝试，等待后重试
        if (attempt < retryCount) {
          await this.delay(retryDelay * Math.pow(2, attempt)); // 指数退避
        }
      }
    }

    const duration = Date.now() - startTime;
    return {
      success: false,
      error: lastError || new Error("事务执行失败"),
      duration,
      retryCount: actualRetryCount,
    };
  }

  /**
   * 在只读事务中执行操作
   *
   * @param transactionManager - 事务管理器
   * @param operation - 要执行的操作
   * @param options - 事务选项
   * @returns 执行结果
   */
  static async executeInReadOnlyTransaction<T>(
    transactionManager: ITransactionManager,
    operation: () => Promise<T>,
    options: TransactionOptions = {},
  ): Promise<TransactionResult<T>> {
    return this.executeInTransaction(transactionManager, operation, {
      ...options,
      readOnly: true,
    });
  }

  /**
   * 在嵌套事务中执行操作
   *
   * @param transactionManager - 事务管理器
   * @param operation - 要执行的操作
   * @param options - 事务选项
   * @returns 执行结果
   */
  static async executeInNestedTransaction<T>(
    transactionManager: ITransactionManager,
    operation: () => Promise<T>,
    options: TransactionOptions = {},
  ): Promise<TransactionResult<T>> {
    const startTime = Date.now();
    const { timeout = 30000, retryCount = 0, retryDelay = 1000 } = options;

    let lastError: Error | null = null;
    let actualRetryCount = 0;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        // 检查是否已有活跃事务
        const hasActiveTransaction = transactionManager.isActive();

        if (!hasActiveTransaction) {
          await transactionManager.begin();
        }

        // 设置超时
        const timeoutPromise = this.createTimeoutPromise(timeout);
        const operationPromise = operation();

        // 执行操作
        const result = await Promise.race([operationPromise, timeoutPromise]);

        // 只有在没有活跃事务时才提交
        if (!hasActiveTransaction) {
          await transactionManager.commit();
        }

        const duration = Date.now() - startTime;
        return {
          success: true,
          result,
          duration,
          retryCount: actualRetryCount,
        };
      } catch (error) {
        lastError = error as Error;
        actualRetryCount = attempt;

        try {
          // 只有在没有活跃事务时才回滚
          if (!transactionManager.isActive()) {
            await transactionManager.rollback();
          }
        } catch (rollbackError) {
          console.error("嵌套事务回滚失败:", rollbackError);
        }

        // 如果不是最后一次尝试，等待后重试
        if (attempt < retryCount) {
          await this.delay(retryDelay * Math.pow(2, attempt)); // 指数退避
        }
      }
    }

    const duration = Date.now() - startTime;
    return {
      success: false,
      error: lastError || new Error("嵌套事务执行失败"),
      duration,
      retryCount: actualRetryCount,
    };
  }

  /**
   * 批量执行事务操作
   *
   * @param transactionManager - 事务管理器
   * @param operations - 操作数组
   * @param options - 事务选项
   * @returns 执行结果
   */
  static async executeBatchInTransaction<T>(
    transactionManager: ITransactionManager,
    operations: Array<() => Promise<T>>,
    options: TransactionOptions = {},
  ): Promise<TransactionResult<T[]>> {
    const startTime = Date.now();
    const {
      timeout = 60000, // 批量操作需要更长时间
      retryCount = 0,
      retryDelay = 1000,
    } = options;

    let lastError: Error | null = null;
    let actualRetryCount = 0;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        // 开始事务
        await transactionManager.begin();

        // 设置超时
        const timeoutPromise = this.createTimeoutPromise(timeout);
        const batchPromise = this.executeBatch(operations);

        // 执行批量操作
        const results = await Promise.race([batchPromise, timeoutPromise]);

        // 提交事务
        await transactionManager.commit();

        const duration = Date.now() - startTime;
        return {
          success: true,
          result: results,
          duration,
          retryCount: actualRetryCount,
        };
      } catch (error) {
        lastError = error as Error;
        actualRetryCount = attempt;

        try {
          // 回滚事务
          await transactionManager.rollback();
        } catch (rollbackError) {
          console.error("批量事务回滚失败:", rollbackError);
        }

        // 如果不是最后一次尝试，等待后重试
        if (attempt < retryCount) {
          await this.delay(retryDelay * Math.pow(2, attempt)); // 指数退避
        }
      }
    }

    const duration = Date.now() - startTime;
    return {
      success: false,
      error: lastError || new Error("批量事务执行失败"),
      duration,
      retryCount: actualRetryCount,
    };
  }

  /**
   * 执行批量操作
   *
   * @param operations - 操作数组
   * @returns 执行结果
   */
  private static async executeBatch<T>(
    operations: Array<() => Promise<T>>,
  ): Promise<T[]> {
    const results: T[] = [];

    for (const operation of operations) {
      const result = await operation();
      results.push(result);
    }

    return results;
  }

  /**
   * 创建超时Promise
   *
   * @param timeout - 超时时间（毫秒）
   * @returns 超时Promise
   */
  private static createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`事务超时: ${timeout}ms`));
      }, timeout);
    });
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
}
