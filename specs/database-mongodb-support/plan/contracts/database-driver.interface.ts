/**
 * 数据库驱动接口
 *
 * @description 定义数据库驱动的统一接口，支持 PostgreSQL 和 MongoDB
 *
 * @since 1.0.0
 */

import type { ConnectionInfo, PoolStats } from "../types/connection.types.js";

/**
 * 数据库驱动接口
 *
 * @description 提供数据库连接的统一接口
 */
export interface DatabaseDriver {
  /**
   * 建立数据库连接
   *
   * @description 连接到数据库服务器
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
}

/**
 * 数据库驱动工厂接口
 *
 * @description 创建数据库驱动实例的工厂接口
 */
export interface DatabaseDriverFactory {
  /**
   * 创建数据库驱动
   *
   * @param config 数据库配置
   * @returns 数据库驱动实例
   */
  createDriver(config: DatabaseDriverConfig): DatabaseDriver;
}

/**
 * 数据库驱动配置
 */
export interface DatabaseDriverConfig {
  /** 数据库类型 */
  type: "postgresql" | "mongodb";
  /** 连接配置 */
  connection: ConnectionConfig;
  /** 连接池配置 */
  pool?: PoolConfig;
  /** 调试模式 */
  debug?: boolean;
}

/**
 * 连接配置
 */
export interface ConnectionConfig {
  /** 主机地址 */
  host: string;
  /** 端口号 */
  port: number;
  /** 数据库名 */
  database: string;
  /** 用户名 */
  username: string;
  /** 密码 */
  password: string;
}

/**
 * 连接池配置
 */
export interface PoolConfig {
  /** 最小连接数 */
  min: number;
  /** 最大连接数 */
  max: number;
  /** 空闲超时时间（毫秒） */
  idleTimeoutMillis: number;
  /** 获取连接超时时间（毫秒） */
  acquireTimeoutMillis: number;
  /** 创建连接超时时间（毫秒） */
  createTimeoutMillis: number;
}
