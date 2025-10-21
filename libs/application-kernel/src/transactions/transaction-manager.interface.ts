/**
 * 事务管理器接口
 *
 * 提供事务生命周期管理功能
 * 支持事务的开始、提交、回滚和状态检查
 *
 * @since 1.0.0
 */

/**
 * 事务管理器接口
 *
 * 提供统一的事务管理机制
 * 支持跨业务模块的事务协调
 */
export interface ITransactionManager {
  /**
   * 开始事务
   *
   * @returns Promise<void>
   */
  begin(): Promise<void>;

  /**
   * 提交事务
   *
   * @returns Promise<void>
   */
  commit(): Promise<void>;

  /**
   * 回滚事务
   *
   * @returns Promise<void>
   */
  rollback(): Promise<void>;

  /**
   * 检查事务是否活跃
   *
   * @returns 事务是否活跃
   */
  isActive(): boolean;
}
