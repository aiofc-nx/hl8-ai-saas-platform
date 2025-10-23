/**
 * 事务服务
 *
 * @description 管理数据库事务，支持分布式事务
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import type { IDatabaseConnectionManager } from "../../interfaces/database-adapter.interface.js";
import type { IsolationContext } from "../../types/isolation.types.js";

/**
 * 事务配置
 */
export interface TransactionConfig {
  /** 隔离级别 */
  isolationLevel:
    | "READ_UNCOMMITTED"
    | "READ_COMMITTED"
    | "REPEATABLE_READ"
    | "SERIALIZABLE";
  /** 超时时间(毫秒) */
  timeout: number;
  /** 是否只读 */
  readOnly: boolean;
  /** 是否启用分布式事务 */
  distributed: boolean;
  /** 重试次数 */
  retryAttempts: number;
  /** 重试延迟(毫秒) */
  retryDelay: number;
}

/**
 * 事务上下文
 */
export interface TransactionContext {
  /** 事务ID */
  id: string;
  /** 连接名称 */
  connectionName: string;
  /** 隔离级别 */
  isolationLevel: string;
  /** 超时时间 */
  timeout: number;
  /** 状态 */
  status: "ACTIVE" | "COMMITTED" | "ROLLED_BACK" | "TIMEOUT";
  /** 开始时间 */
  startTime: Date;
  /** 结束时间 */
  endTime?: Date;
  /** 操作列表 */
  operations: TransactionOperation[];
  /** 隔离上下文 */
  isolationContext?: IsolationContext;
}

/**
 * 事务操作
 */
export interface TransactionOperation {
  /** 操作ID */
  id: string;
  /** 操作类型 */
  type: "INSERT" | "UPDATE" | "DELETE" | "SELECT";
  /** 表名 */
  table: string;
  /** 数据 */
  data?: unknown;
  /** 条件 */
  where?: Record<string, unknown>;
  /** 时间戳 */
  timestamp: Date;
}

/**
 * 事务服务
 */
@Injectable()
export class TransactionService {
  private activeTransactions = new Map<string, TransactionContext>();
  private transactionConfigs = new Map<string, TransactionConfig>();

  constructor(
    private readonly connectionManager: IDatabaseConnectionManager,
    private readonly isolationContext?: IsolationContext,
  ) {}

  /**
   * 开始事务
   */
  async beginTransaction(
    connectionName: string,
    config?: Partial<TransactionConfig>,
  ): Promise<TransactionContext> {
    try {
      const transactionId = this.generateTransactionId();
      const defaultConfig = this.getDefaultTransactionConfig();
      const finalConfig = { ...defaultConfig, ...config };

      const transactionContext: TransactionContext = {
        id: transactionId,
        connectionName,
        isolationLevel: finalConfig.isolationLevel,
        timeout: finalConfig.timeout,
        status: "ACTIVE",
        startTime: new Date(),
        operations: [],
        isolationContext: this.isolationContext,
      };

      this.activeTransactions.set(transactionId, transactionContext);
      this.transactionConfigs.set(transactionId, finalConfig);

      // 设置超时定时器
      if (finalConfig.timeout > 0) {
        setTimeout(() => {
          this.handleTransactionTimeout(transactionId);
        }, finalConfig.timeout);
      }

      return transactionContext;
    } catch (_error) {
      throw new Error(
        `开始事务失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 提交事务
   */
  async commitTransaction(transactionId: string): Promise<void> {
    try {
      const transaction = this.activeTransactions.get(transactionId);
      if (!transaction) {
        throw new Error(`事务 ${transactionId} 不存在`);
      }

      if (transaction.status !== "ACTIVE") {
        throw new Error(
          `事务 ${transactionId} 状态无效: ${transaction.status}`,
        );
      }

      const connection = await this.connectionManager.getConnection(
        transaction.connectionName,
      );

      // 执行事务提交
      await connection.transaction(async (_trx) => {
        // 执行所有操作
        for (const operation of transaction.operations) {
          await this.executeOperation(connection, operation);
        }
      });

      // 更新事务状态
      transaction.status = "COMMITTED";
      transaction.endTime = new Date();
      this.activeTransactions.set(transactionId, transaction);

      // 清理事务
      this.cleanupTransaction(transactionId);
    } catch (_error) {
      await this.rollbackTransaction(transactionId);
      throw new Error(
        `提交事务失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 回滚事务
   */
  async rollbackTransaction(transactionId: string): Promise<void> {
    try {
      const transaction = this.activeTransactions.get(transactionId);
      if (!transaction) {
        throw new Error(`事务 ${transactionId} 不存在`);
      }

      // 更新事务状态
      transaction.status = "ROLLED_BACK";
      transaction.endTime = new Date();
      this.activeTransactions.set(transactionId, transaction);

      // 清理事务
      this.cleanupTransaction(transactionId);
    } catch (_error) {
      throw new Error(
        `回滚事务失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 添加事务操作
   */
  addOperation(
    transactionId: string,
    operation: Omit<TransactionOperation, "id" | "timestamp">,
  ): void {
    try {
      const transaction = this.activeTransactions.get(transactionId);
      if (!transaction) {
        throw new Error(`事务 ${transactionId} 不存在`);
      }

      if (transaction.status !== "ACTIVE") {
        throw new Error(
          `事务 ${transactionId} 状态无效: ${transaction.status}`,
        );
      }

      const fullOperation: TransactionOperation = {
        id: this.generateOperationId(),
        timestamp: new Date(),
        ...operation,
      };

      transaction.operations.push(fullOperation);
      this.activeTransactions.set(transactionId, transaction);
    } catch (_error) {
      throw new Error(
        `添加事务操作失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 获取事务状态
   */
  getTransactionStatus(transactionId: string): string | null {
    const transaction = this.activeTransactions.get(transactionId);
    return transaction ? transaction.status : null;
  }

  /**
   * 获取活跃事务列表
   */
  getActiveTransactions(): TransactionContext[] {
    return Array.from(this.activeTransactions.values()).filter(
      (tx) => tx.status === "ACTIVE",
    );
  }

  /**
   * 获取事务统计信息
   */
  getTransactionStats(): Record<string, unknown> {
    const activeCount = this.getActiveTransactions().length;
    const totalCount = this.activeTransactions.size;

    const statusCounts = {
      ACTIVE: 0,
      COMMITTED: 0,
      ROLLED_BACK: 0,
      TIMEOUT: 0,
    };

    for (const transaction of this.activeTransactions.values()) {
      statusCounts[transaction.status]++;
    }

    return {
      activeCount,
      totalCount,
      statusCounts,
    };
  }

  /**
   * 执行分布式事务
   */
  async executeDistributedTransaction(
    operations: Array<{
      connectionName: string;
      operation: Omit<TransactionOperation, "id" | "timestamp">;
    }>,
  ): Promise<void> {
    try {
      const transactionId = this.generateTransactionId();
      const _transaction = await this.beginTransaction("distributed", {
        distributed: true,
        timeout: 60000,
      });

      // 添加所有操作
      for (const op of operations) {
        this.addOperation(transactionId, op.operation);
      }

      // 提交事务
      await this.commitTransaction(transactionId);
    } catch (_error) {
      throw new Error(
        `执行分布式事务失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 执行操作
   */
  private async executeOperation(
    connection: unknown,
    operation: TransactionOperation,
  ): Promise<void> {
    try {
      const dbConnection = connection as {
        batchInsert: (table: string, data: unknown[]) => Promise<void>;
        batchUpdate: (
          table: string,
          data: unknown[],
          where?: Record<string, unknown>,
        ) => Promise<void>;
        batchDelete: (
          table: string,
          where?: Record<string, unknown>,
        ) => Promise<void>;
      };

      switch (operation.type) {
        case "INSERT":
          await dbConnection.batchInsert(operation.table, [operation.data]);
          break;
        case "UPDATE":
          await dbConnection.batchUpdate(
            operation.table,
            [operation.data],
            operation.where,
          );
          break;
        case "DELETE":
          await dbConnection.batchDelete(operation.table, operation.where);
          break;
        case "SELECT":
          // SELECT操作通常不需要在事务中执行
          break;
        default:
          throw new Error(`不支持的操作类型: ${operation.type}`);
      }
    } catch (_error) {
      throw new Error(
        `执行操作失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 处理事务超时
   */
  private handleTransactionTimeout(transactionId: string): void {
    const transaction = this.activeTransactions.get(transactionId);
    if (transaction && transaction.status === "ACTIVE") {
      transaction.status = "TIMEOUT";
      transaction.endTime = new Date();
      this.activeTransactions.set(transactionId, transaction);
      this.cleanupTransaction(transactionId);
    }
  }

  /**
   * 清理事务
   */
  private cleanupTransaction(transactionId: string): void {
    this.activeTransactions.delete(transactionId);
    this.transactionConfigs.delete(transactionId);
  }

  /**
   * 生成事务ID
   */
  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成操作ID
   */
  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取默认事务配置
   */
  private getDefaultTransactionConfig(): TransactionConfig {
    return {
      isolationLevel: "READ_COMMITTED",
      timeout: 30000,
      readOnly: false,
      distributed: false,
      retryAttempts: 3,
      retryDelay: 1000,
    };
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const healthChecks: Record<string, boolean> = {};

    try {
      const activeTransactions = this.getActiveTransactions();
      const timeoutThreshold = 300000; // 5分钟
      const now = Date.now();

      for (const transaction of activeTransactions) {
        const duration = now - transaction.startTime.getTime();
        healthChecks[transaction.id] = duration < timeoutThreshold;
      }

      return healthChecks;
    } catch (_error) {
      return {};
    }
  }
}
