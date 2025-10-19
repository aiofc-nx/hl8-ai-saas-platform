/**
 * 连接管理器接口
 *
 * @description 定义数据库连接管理的统一接口
 *
 * @since 1.0.0
 */

import type { DatabaseDriver } from './database-driver.interface.js';
import type { ConnectionInfo, PoolStats, ConnectionStatus } from '../types/connection.types.js';

/**
 * 连接管理器接口
 *
 * @description 管理数据库连接的生命周期
 */
export interface ConnectionManager {
  /**
   * 建立数据库连接
   *
   * @description 连接到数据库，失败时自动重试
   * @throws {DatabaseConnectionException} 连接失败时抛出
   */
  connect(): Promise<void>;

  /**
   * 断开数据库连接
   *
   * @description 优雅关闭数据库连接
   */
  disconnect(): Promise<void>;

  /**
   * 检查连接状态
   *
   * @description 检查数据库连接是否活跃
   * @returns 连接状态
   */
  isConnected(): Promise<boolean>;

  /**
   * 获取连接状态
   *
   * @description 获取当前连接状态
   * @returns 连接状态枚举
   */
  getStatus(): ConnectionStatus;

  /**
   * 获取连接信息
   *
   * @description 获取当前连接的详细信息
   * @returns 连接信息
   */
  getConnectionInfo(): ConnectionInfo;

  /**
   * 获取连接池统计
   *
   * @description 获取连接池的使用统计信息
   * @returns 连接池统计
   */
  getPoolStats(): PoolStats;

  /**
   * 重连数据库
   *
   * @description 尝试重新连接到数据库
   * @throws {DatabaseConnectionException} 重连失败时抛出
   */
  reconnect(): Promise<void>;

  /**
   * 健康检查
   *
   * @description 执行数据库健康检查
   * @returns 健康检查结果
   */
  healthCheck(): Promise<HealthCheckResult>;
}

/**
 * 健康检查结果
 */
export interface HealthCheckResult {
  /** 是否健康 */
  healthy: boolean;
  /** 响应时间（毫秒） */
  responseTime: number;
  /** 错误信息（如果有） */
  error?: string;
  /** 检查时间 */
  timestamp: Date;
  /** 连接状态 */
  status: ConnectionStatus;
  /** 连接信息 */
  connectionInfo: ConnectionInfo;
  /** 连接池统计 */
  poolStats: PoolStats;
}
