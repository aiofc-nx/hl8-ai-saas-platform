/**
 * 事务服务接口
 *
 * @description 定义数据库事务管理的统一接口
 *
 * @since 1.0.0
 */

import type { EntityManager } from "@mikro-orm/core";

/**
 * 事务服务接口
 *
 * @description 提供数据库事务的统一管理
 */
export interface TransactionService {
  /**
   * 在事务中执行操作
   *
   * @description 自动管理事务的创建、提交和回滚
   * @param callback 事务回调函数
   * @returns 事务执行结果
   * @throws {DatabaseTransactionException} 事务失败时抛出
   */
  runInTransaction<T>(callback: (em: EntityManager) => Promise<T>): Promise<T>;

  /**
   * 开始事务
   *
   * @description 手动开始数据库事务
   * @throws {DatabaseTransactionException} 开始事务失败时抛出
   */
  beginTransaction(): Promise<void>;

  /**
   * 提交事务
   *
   * @description 提交当前事务
   * @throws {DatabaseTransactionException} 提交事务失败时抛出
   */
  commitTransaction(): Promise<void>;

  /**
   * 回滚事务
   *
   * @description 回滚当前事务
   * @throws {DatabaseTransactionException} 回滚事务失败时抛出
   */
  rollbackTransaction(): Promise<void>;

  /**
   * 检查是否在事务中
   *
   * @description 检查当前是否在事务上下文中
   * @returns 是否在事务中
   */
  isInTransaction(): boolean;

  /**
   * 获取当前事务的 EntityManager
   *
   * @description 获取事务上下文中的 EntityManager
   * @returns EntityManager 实例
   * @throws {DatabaseTransactionException} 不在事务中时抛出
   */
  getEntityManager(): EntityManager;

  /**
   * 设置事务超时
   *
   * @description 设置事务的超时时间
   * @param timeout 超时时间（毫秒）
   */
  setTransactionTimeout(timeout: number): void;

  /**
   * 获取事务统计信息
   *
   * @description 获取事务执行的统计信息
   * @returns 事务统计信息
   */
  getTransactionStats(): TransactionStats;
}

/**
 * 事务统计信息
 */
export interface TransactionStats {
  /** 总事务数 */
  totalTransactions: number;
  /** 成功事务数 */
  successfulTransactions: number;
  /** 失败事务数 */
  failedTransactions: number;
  /** 平均执行时间（毫秒） */
  averageExecutionTime: number;
  /** 最大执行时间（毫秒） */
  maxExecutionTime: number;
  /** 最小执行时间（毫秒） */
  minExecutionTime: number;
  /** 当前活跃事务数 */
  activeTransactions: number;
}

/**
 * 事务配置
 */
export interface TransactionConfig {
  /** 默认超时时间（毫秒） */
  defaultTimeout: number;
  /** 最大重试次数 */
  maxRetries: number;
  /** 重试延迟（毫秒） */
  retryDelay: number;
  /** 是否启用自动重试 */
  enableAutoRetry: boolean;
}

/**
 * 事务上下文
 */
export interface TransactionContext {
  /** 事务ID */
  id: string;
  /** 开始时间 */
  startTime: Date;
  /** 超时时间 */
  timeout: number;
  /** 是否活跃 */
  isActive: boolean;
  /** 重试次数 */
  retryCount: number;
  /** 最大重试次数 */
  maxRetries: number;
}
