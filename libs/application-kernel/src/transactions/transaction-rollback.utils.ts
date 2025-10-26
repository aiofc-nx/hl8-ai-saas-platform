/**
 * 事务回滚工具
 *
 * 提供事务回滚的实用工具函数
 * 支持回滚策略、补偿操作和错误恢复
 *
 * @since 1.0.0
 */
import { ITransactionManager } from "./transaction-manager.interface.js";
import { FastifyLoggerService } from "@hl8/nestjs-fastify";

/**
 * 回滚策略
 */
export type RollbackStrategy =
  | "immediate"
  | "delayed"
  | "compensating"
  | "retry";

/**
 * 回滚选项
 */
export interface RollbackOptions {
  /**
   * 回滚策略
   */
  strategy?: RollbackStrategy;

  /**
   * 延迟时间（毫秒）
   */
  delay?: number;

  /**
   * 重试次数
   */
  retryCount?: number;

  /**
   * 重试延迟（毫秒）
   */
  retryDelay?: number;

  /**
   * 补偿操作
   */
  compensation?: () => Promise<void>;

  /**
   * 错误处理
   */
  errorHandler?: (error: Error) => Promise<void>;
}

/**
 * 回滚结果
 */
export interface RollbackResult {
  /**
   * 是否成功
   */
  success: boolean;

  /**
   * 错误信息
   */
  error?: Error;

  /**
   * 回滚耗时（毫秒）
   */
  duration: number;

  /**
   * 重试次数
   */
  retryCount: number;

  /**
   * 是否执行了补偿操作
   */
  compensationExecuted: boolean;
}

/**
 * 事务回滚工具类
 *
 * 提供事务回滚的实用工具函数
 */
export class TransactionRollbackUtils {
  private static logger?: FastifyLoggerService;

  /**
   * 设置日志服务
   */
  static setLogger(logger: FastifyLoggerService): void {
    this.logger = logger;
  }
  /**
   * 执行事务回滚
   *
   * @param transactionManager - 事务管理器
   * @param options - 回滚选项
   * @returns 回滚结果
   */
  static async executeRollback(
    transactionManager: ITransactionManager,
    options: RollbackOptions = {},
  ): Promise<RollbackResult> {
    const startTime = Date.now();
    const {
      strategy = "immediate",
      delay = 0,
      retryCount = 0,
      retryDelay = 1000,
      compensation,
      errorHandler,
    } = options;

    let lastError: Error | null = null;
    let actualRetryCount = 0;
    let compensationExecuted = false;

    try {
      // 根据策略执行回滚
      switch (strategy) {
        case "immediate":
          await this.executeImmediateRollback(transactionManager);
          break;
        case "delayed":
          await this.executeDelayedRollback(transactionManager, delay);
          break;
        case "compensating":
          await this.executeCompensatingRollback(
            transactionManager,
            compensation,
          );
          compensationExecuted = true;
          break;
        case "retry":
          await this.executeRetryRollback(
            transactionManager,
            retryCount,
            retryDelay,
          );
          actualRetryCount = retryCount;
          break;
      }

      const duration = Date.now() - startTime;
      return {
        success: true,
        duration,
        retryCount: actualRetryCount,
        compensationExecuted,
      };
    } catch (error) {
      lastError = error as Error;

      // 执行错误处理
      if (errorHandler) {
        try {
          await errorHandler(lastError);
        } catch (handlerError) {
          if (this.logger) {
            this.logger.log("错误处理器执行失败", {
              error:
                handlerError instanceof Error
                  ? handlerError.message
                  : String(handlerError),
            });
          }
        }
      }

      const duration = Date.now() - startTime;
      return {
        success: false,
        error: lastError,
        duration,
        retryCount: actualRetryCount,
        compensationExecuted,
      };
    }
  }

  /**
   * 执行立即回滚
   *
   * @param transactionManager - 事务管理器
   */
  private static async executeImmediateRollback(
    transactionManager: ITransactionManager,
  ): Promise<void> {
    if (transactionManager.isActive()) {
      await transactionManager.rollback();
    }
  }

  /**
   * 执行延迟回滚
   *
   * @param transactionManager - 事务管理器
   * @param delay - 延迟时间
   */
  private static async executeDelayedRollback(
    transactionManager: ITransactionManager,
    delay: number,
  ): Promise<void> {
    if (delay > 0) {
      await this.delay(delay);
    }

    if (transactionManager.isActive()) {
      await transactionManager.rollback();
    }
  }

  /**
   * 执行补偿回滚
   *
   * @param transactionManager - 事务管理器
   * @param compensation - 补偿操作
   */
  private static async executeCompensatingRollback(
    transactionManager: ITransactionManager,
    compensation?: () => Promise<void>,
  ): Promise<void> {
    if (transactionManager.isActive()) {
      await transactionManager.rollback();
    }

    // 执行补偿操作
    if (compensation) {
      await compensation();
    }
  }

  /**
   * 执行重试回滚
   *
   * @param transactionManager - 事务管理器
   * @param retryCount - 重试次数
   * @param retryDelay - 重试延迟
   */
  private static async executeRetryRollback(
    transactionManager: ITransactionManager,
    retryCount: number,
    retryDelay: number,
  ): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        if (transactionManager.isActive()) {
          await transactionManager.rollback();
        }
        return;
      } catch (error) {
        lastError = error as Error;

        if (attempt < retryCount) {
          await this.delay(retryDelay * Math.pow(2, attempt)); // 指数退避
        }
      }
    }

    throw lastError || new Error("重试回滚失败");
  }

  /**
   * 执行批量回滚
   *
   * @param transactionManagers - 事务管理器数组
   * @param options - 回滚选项
   * @returns 回滚结果
   */
  static async executeBatchRollback(
    transactionManagers: ITransactionManager[],
    options: RollbackOptions = {},
  ): Promise<RollbackResult[]> {
    const results: RollbackResult[] = [];

    for (const transactionManager of transactionManagers) {
      try {
        const result = await this.executeRollback(transactionManager, options);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: error as Error,
          duration: 0,
          retryCount: 0,
          compensationExecuted: false,
        });
      }
    }

    return results;
  }

  /**
   * 执行条件回滚
   *
   * @param transactionManager - 事务管理器
   * @param condition - 回滚条件
   * @param options - 回滚选项
   * @returns 回滚结果
   */
  static async executeConditionalRollback(
    transactionManager: ITransactionManager,
    condition: () => boolean,
    options: RollbackOptions = {},
  ): Promise<RollbackResult> {
    if (condition()) {
      return this.executeRollback(transactionManager, options);
    } else {
      return {
        success: true,
        duration: 0,
        retryCount: 0,
        compensationExecuted: false,
      };
    }
  }

  /**
   * 执行安全回滚
   *
   * @param transactionManager - 事务管理器
   * @param options - 回滚选项
   * @returns 回滚结果
   */
  static async executeSafeRollback(
    transactionManager: ITransactionManager,
    options: RollbackOptions = {},
  ): Promise<RollbackResult> {
    try {
      return await this.executeRollback(transactionManager, options);
    } catch (error) {
      // 安全回滚：即使失败也不抛出异常
      return {
        success: false,
        error: error as Error,
        duration: 0,
        retryCount: 0,
        compensationExecuted: false,
      };
    }
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
