/**
 * 日志服务接口
 *
 * @description 定义日志服务的通用接口
 * @since 1.0.0
 */

import type {
  LoggingService,
  LogContext,
  LogLevel,
  LoggingConfig,
  LogQueryFilters,
  LogStats,
} from "../types/logging.types.js";

/**
 * 日志服务接口
 */
export interface ILoggingService extends LoggingService {
  /** 获取日志配置 */
  getConfig(): LoggingConfig;

  /** 设置日志配置 */
  setConfig(config: LoggingConfig): void;

  /** 查询日志 */
  query(filters: LogQueryFilters): Promise<LogContext[]>;

  /** 获取日志统计 */
  getStats(filters?: LogQueryFilters): Promise<LogStats>;

  /** 清理日志 */
  cleanup(olderThan: Date): Promise<number>;

  /** 导出日志 */
  export(filters: LogQueryFilters, format: "json" | "csv"): Promise<string>;
}

/**
 * Pino日志服务接口
 */
export interface IPinoLoggingService extends ILoggingService {
  /** 获取Pino实例 */
  getPinoInstance(): unknown;

  /** 设置日志级别 */
  setLevel(level: LogLevel): void;

  /** 获取当前日志级别 */
  getLevel(): LogLevel;

  /** 添加序列化器 */
  addSerializer(name: string, serializer: unknown): void;

  /** 移除序列化器 */
  removeSerializer(name: string): void;

  /** 添加格式化器 */
  addFormatter(name: string, formatter: unknown): void;

  /** 移除格式化器 */
  removeFormatter(name: string): void;
}

/**
 * 结构化日志服务接口
 */
export interface IStructuredLoggingService extends ILoggingService {
  /** 创建日志上下文 */
  createContext(
    requestId: string,
    tenantId: string,
    operation: string,
    resource: string,
    level?: LogLevel,
  ): LogContext;

  /** 记录性能日志 */
  logPerformance(
    context: LogContext,
    operation: string,
    duration: number,
    data?: Record<string, unknown>,
  ): Promise<void>;

  /** 记录审计日志 */
  logAudit(
    context: LogContext,
    action: string,
    resource: string,
    result: "SUCCESS" | "FAILURE" | "ERROR",
    data?: Record<string, unknown>,
  ): Promise<void>;

  /** 记录业务日志 */
  logBusiness(
    context: LogContext,
    event: string,
    data?: Record<string, unknown>,
  ): Promise<void>;
}

/**
 * 日志适配器接口
 */
export interface ILoggingAdapter {
  /** 初始化适配器 */
  initialize(): Promise<void>;

  /** 记录日志 */
  log(level: LogLevel, message: string, data?: Record<string, unknown>): void;

  /** 关闭适配器 */
  close(): Promise<void>;

  /** 健康检查 */
  healthCheck(): Promise<boolean>;

  /** 获取适配器信息 */
  getInfo(): Record<string, unknown>;
}

/**
 * 日志管理器接口
 */
export interface ILoggingManager {
  /** 注册日志服务 */
  registerService(name: string, service: ILoggingService): void;

  /** 获取日志服务 */
  getService(name: string): ILoggingService;

  /** 获取所有服务 */
  getAllServices(): Record<string, ILoggingService>;

  /** 设置默认服务 */
  setDefaultService(name: string): void;

  /** 获取默认服务 */
  getDefaultService(): ILoggingService;

  /** 健康检查 */
  healthCheck(): Promise<Record<string, boolean>>;

  /** 关闭所有服务 */
  closeAll(): Promise<void>;
}

// 重新导出类型
export type {
  LogContext,
  LogLevel,
  LoggingConfig,
  LogQueryFilters,
  LogStats,
} from "../types/logging.types.js";
