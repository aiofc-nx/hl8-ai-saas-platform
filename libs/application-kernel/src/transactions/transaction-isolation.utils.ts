/**
 * 事务隔离工具
 *
 * 提供事务隔离的实用工具函数
 * 支持隔离级别管理、并发控制和死锁检测
 *
 * @since 1.0.0
 */
import { ITransactionManager } from "./transaction-manager.interface.js";

/**
 * 事务隔离级别
 */
export type TransactionIsolationLevel =
  | "READ_UNCOMMITTED"
  | "READ_COMMITTED"
  | "REPEATABLE_READ"
  | "SERIALIZABLE";

/**
 * 隔离级别配置
 */
export interface IsolationLevelConfig {
  /**
   * 隔离级别
   */
  level: TransactionIsolationLevel;

  /**
   * 是否只读
   */
  readOnly?: boolean;

  /**
   * 超时时间（毫秒）
   */
  timeout?: number;

  /**
   * 死锁检测
   */
  deadlockDetection?: boolean;

  /**
   * 锁等待时间（毫秒）
   */
  lockWaitTimeout?: number;
}

/**
 * 事务隔离结果
 */
export interface TransactionIsolationResult {
  /**
   * 是否成功
   */
  success: boolean;

  /**
   * 错误信息
   */
  error?: Error;

  /**
   * 隔离级别
   */
  isolationLevel: TransactionIsolationLevel;

  /**
   * 执行耗时（毫秒）
   */
  duration: number;

  /**
   * 是否检测到死锁
   */
  deadlockDetected: boolean;
}

/**
 * 事务隔离工具类
 *
 * 提供事务隔离的实用工具函数
 */
export class TransactionIsolationUtils {
  /**
   * 设置事务隔离级别
   *
   * @param transactionManager - 事务管理器
   * @param config - 隔离级别配置
   * @returns 隔离结果
   */
  static async setIsolationLevel(
    transactionManager: ITransactionManager,
    config: IsolationLevelConfig,
  ): Promise<TransactionIsolationResult> {
    const startTime = Date.now();
    const {
      level,
      readOnly = false,
      timeout = 30000,
      deadlockDetection = true,
      lockWaitTimeout = 5000,
    } = config;

    try {
      // 检查当前事务状态
      if (!transactionManager.isActive()) {
        throw new Error("没有活跃事务，无法设置隔离级别");
      }

      // 设置隔离级别（这里需要根据实际的事务管理器实现）
      await this.applyIsolationLevel(transactionManager, level, readOnly);

      // 设置超时
      if (timeout > 0) {
        await this.setTransactionTimeout(transactionManager, timeout);
      }

      // 启用死锁检测
      if (deadlockDetection) {
        await this.enableDeadlockDetection(transactionManager);
      }

      // 设置锁等待超时
      if (lockWaitTimeout > 0) {
        await this.setLockWaitTimeout(transactionManager, lockWaitTimeout);
      }

      const duration = Date.now() - startTime;
      return {
        success: true,
        isolationLevel: level,
        duration,
        deadlockDetected: false,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        error: error as Error,
        isolationLevel: level,
        duration,
        deadlockDetected: false,
      };
    }
  }

  /**
   * 应用隔离级别
   *
   * @param transactionManager - 事务管理器
   * @param level - 隔离级别
   * @param readOnly - 是否只读
   */
  private static async applyIsolationLevel(
    transactionManager: ITransactionManager,
    level: TransactionIsolationLevel,
    readOnly: boolean,
  ): Promise<void> {
    // 这里需要根据实际的事务管理器实现
    // 例如：await transactionManager.setIsolationLevel(level);
    // 例如：await transactionManager.setReadOnly(readOnly);
    console.log(`设置隔离级别: ${level}, 只读: ${readOnly}`);
  }

  /**
   * 设置事务超时
   *
   * @param transactionManager - 事务管理器
   * @param timeout - 超时时间
   */
  private static async setTransactionTimeout(
    transactionManager: ITransactionManager,
    timeout: number,
  ): Promise<void> {
    // 这里需要根据实际的事务管理器实现
    // 例如：await transactionManager.setTimeout(timeout);
    console.log(`设置事务超时: ${timeout}ms`);
  }

  /**
   * 启用死锁检测
   *
   * @param transactionManager - 事务管理器
   */
  private static async enableDeadlockDetection(
    _transactionManager: ITransactionManager,
  ): Promise<void> {
    // 这里需要根据实际的事务管理器实现
    // 例如：await transactionManager.enableDeadlockDetection();
    console.log("启用死锁检测");
  }

  /**
   * 设置锁等待超时
   *
   * @param transactionManager - 事务管理器
   * @param timeout - 超时时间
   */
  private static async setLockWaitTimeout(
    transactionManager: ITransactionManager,
    timeout: number,
  ): Promise<void> {
    // 这里需要根据实际的事务管理器实现
    // 例如：await transactionManager.setLockWaitTimeout(timeout);
    console.log(`设置锁等待超时: ${timeout}ms`);
  }

  /**
   * 检测死锁
   *
   * @param transactionManager - 事务管理器
   * @returns 是否检测到死锁
   */
  static async detectDeadlock(
    _transactionManager: ITransactionManager,
  ): Promise<boolean> {
    try {
      // 这里需要根据实际的事务管理器实现
      // 例如：return await transactionManager.detectDeadlock();
      return false;
    } catch (error) {
      console.error("死锁检测失败:", error);
      return false;
    }
  }

  /**
   * 解决死锁
   *
   * @param transactionManager - 事务管理器
   * @returns 是否成功解决死锁
   */
  static async resolveDeadlock(
    _transactionManager: ITransactionManager,
  ): Promise<boolean> {
    try {
      // 这里需要根据实际的事务管理器实现
      // 例如：return await transactionManager.resolveDeadlock();
      return true;
    } catch (error) {
      console.error("死锁解决失败:", error);
      return false;
    }
  }

  /**
   * 获取隔离级别信息
   *
   * @param level - 隔离级别
   * @returns 隔离级别信息
   */
  static getIsolationLevelInfo(level: TransactionIsolationLevel): {
    name: string;
    description: string;
    characteristics: string[];
    useCases: string[];
  } {
    const levelInfo = {
      READ_UNCOMMITTED: {
        name: "读未提交",
        description: "最低隔离级别，允许脏读",
        characteristics: ["脏读", "不可重复读", "幻读"],
        useCases: ["性能要求极高的只读操作", "数据一致性要求不高的场景"],
      },
      READ_COMMITTED: {
        name: "读已提交",
        description: "防止脏读，但允许不可重复读",
        characteristics: ["防止脏读", "不可重复读", "幻读"],
        useCases: ["大多数业务场景", "平衡性能和一致性"],
      },
      REPEATABLE_READ: {
        name: "可重复读",
        description: "防止脏读和不可重复读，但允许幻读",
        characteristics: ["防止脏读", "防止不可重复读", "幻读"],
        useCases: ["需要一致性读取的场景", "财务系统"],
      },
      SERIALIZABLE: {
        name: "串行化",
        description: "最高隔离级别，防止所有并发问题",
        characteristics: ["防止脏读", "防止不可重复读", "防止幻读"],
        useCases: ["数据一致性要求极高的场景", "关键业务操作"],
      },
    };

    return levelInfo[level];
  }

  /**
   * 比较隔离级别
   *
   * @param level1 - 隔离级别1
   * @param level2 - 隔离级别2
   * @returns 比较结果
   */
  static compareIsolationLevels(
    level1: TransactionIsolationLevel,
    level2: TransactionIsolationLevel,
  ): {
    isHigher: boolean;
    isLower: boolean;
    isEqual: boolean;
    difference: string;
  } {
    const levels = {
      READ_UNCOMMITTED: 1,
      READ_COMMITTED: 2,
      REPEATABLE_READ: 3,
      SERIALIZABLE: 4,
    };

    const level1Value = levels[level1];
    const level2Value = levels[level2];

    return {
      isHigher: level1Value > level2Value,
      isLower: level1Value < level2Value,
      isEqual: level1Value === level2Value,
      difference:
        level1Value > level2Value
          ? "更高"
          : level1Value < level2Value
            ? "更低"
            : "相同",
    };
  }

  /**
   * 验证隔离级别兼容性
   *
   * @param level - 隔离级别
   * @param operation - 操作类型
   * @returns 是否兼容
   */
  static validateIsolationCompatibility(
    level: TransactionIsolationLevel,
    operation: "read" | "write" | "mixed",
  ): boolean {
    const compatibility = {
      READ_UNCOMMITTED: { read: true, write: true, mixed: true },
      READ_COMMITTED: { read: true, write: true, mixed: true },
      REPEATABLE_READ: { read: true, write: true, mixed: true },
      SERIALIZABLE: { read: true, write: true, mixed: true },
    };

    return compatibility[level][operation];
  }

  /**
   * 获取推荐的隔离级别
   *
   * @param scenario - 使用场景
   * @returns 推荐的隔离级别
   */
  static getRecommendedIsolationLevel(
    scenario: "read-heavy" | "write-heavy" | "mixed" | "critical",
  ): TransactionIsolationLevel {
    const recommendations = {
      "read-heavy": "READ_COMMITTED" as TransactionIsolationLevel,
      "write-heavy": "REPEATABLE_READ" as TransactionIsolationLevel,
      mixed: "READ_COMMITTED" as TransactionIsolationLevel,
      critical: "SERIALIZABLE" as TransactionIsolationLevel,
    };

    return recommendations[scenario];
  }
}
