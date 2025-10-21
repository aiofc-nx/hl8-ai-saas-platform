/**
 * 日志类型定义
 *
 * @description 定义日志相关的类型和接口
 * @since 1.0.0
 */

/**
 * 日志级别枚举
 */
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * 日志上下文接口
 */
export interface LogContext {
  /** 请求ID */
  requestId: string;
  /** 租户ID */
  tenantId: string;
  /** 组织ID */
  organizationId?: string;
  /** 部门ID */
  departmentId?: string;
  /** 用户ID */
  userId?: string;
  /** 操作类型 */
  operation: string;
  /** 资源类型 */
  resource: string;
  /** 时间戳 */
  timestamp: Date;
  /** 日志级别 */
  level: LogLevel;
  /** 消息 */
  message: string;
  /** 数据 */
  data?: Record<string, any>;
}

/**
 * Pino日志记录器配置接口
 */
export interface PinoLoggerConfig {
  /** 记录器名称 */
  name: string;
  /** 日志级别 */
  level: LogLevel;
  /** 序列化器 */
  serializers: Record<string, any>;
  /** 格式化器 */
  formatters: Record<string, any>;
  /** 是否包含时间戳 */
  timestamp: boolean;
  /** 基础数据 */
  base: Record<string, any>;
  /** 是否启用 */
  enabled: boolean;
}

/**
 * 日志服务接口
 */
export interface LoggingService {
  /** 记录日志 */
  log(
    context: LogContext,
    message: string,
    data?: Record<string, any>
  ): Promise<void>;
  /** 记录错误日志 */
  error(
    context: LogContext,
    message: string,
    error?: Error,
    data?: Record<string, any>
  ): Promise<void>;
  /** 记录警告日志 */
  warn(
    context: LogContext,
    message: string,
    data?: Record<string, any>
  ): Promise<void>;
  /** 记录信息日志 */
  info(
    context: LogContext,
    message: string,
    data?: Record<string, any>
  ): Promise<void>;
  /** 记录调试日志 */
  debug(
    context: LogContext,
    message: string,
    data?: Record<string, any>
  ): Promise<void>;
  /** 记录跟踪日志 */
  trace(
    context: LogContext,
    message: string,
    data?: Record<string, any>
  ): Promise<void>;
}

/**
 * 结构化日志接口
 */
export interface StructuredLogging {
  /** 创建日志上下文 */
  createContext(
    requestId: string,
    tenantId: string,
    operation: string,
    resource: string,
    level?: LogLevel
  ): LogContext;
  /** 记录结构化日志 */
  logStructured(
    context: LogContext,
    message: string,
    data?: Record<string, any>
  ): Promise<void>;
  /** 记录性能日志 */
  logPerformance(
    context: LogContext,
    operation: string,
    duration: number,
    data?: Record<string, any>
  ): Promise<void>;
  /** 记录审计日志 */
  logAudit(
    context: LogContext,
    action: string,
    resource: string,
    result: 'SUCCESS' | 'FAILURE' | 'ERROR',
    data?: Record<string, any>
  ): Promise<void>;
}

/**
 * 日志适配器接口
 */
export interface LoggingAdapter {
  /** 初始化适配器 */
  initialize(): Promise<void>;
  /** 记录日志 */
  log(level: LogLevel, message: string, data?: Record<string, any>): void;
  /** 关闭适配器 */
  close(): Promise<void>;
  /** 健康检查 */
  healthCheck(): Promise<boolean>;
}

/**
 * 日志配置接口
 */
export interface LoggingConfig {
  /** 日志级别 */
  level: LogLevel;
  /** 日志格式 */
  format: 'json' | 'text';
  /** 是否启用结构化日志 */
  enableStructuredLogging: boolean;
  /** 是否启用性能日志 */
  enablePerformanceLogging: boolean;
  /** 是否启用审计日志 */
  enableAuditLogging: boolean;
  /** 日志文件路径 */
  logFile?: string;
  /** 日志轮转配置 */
  rotation?: {
    maxSize: string;
    maxFiles: number;
    compress: boolean;
  };
}

/**
 * 日志查询过滤器
 */
export interface LogQueryFilters {
  /** 租户ID */
  tenantId?: string;
  /** 组织ID */
  organizationId?: string;
  /** 部门ID */
  departmentId?: string;
  /** 用户ID */
  userId?: string;
  /** 日志级别 */
  level?: LogLevel;
  /** 操作类型 */
  operation?: string;
  /** 资源类型 */
  resource?: string;
  /** 开始时间 */
  startTime?: Date;
  /** 结束时间 */
  endTime?: Date;
  /** 限制数量 */
  limit?: number;
  /** 偏移量 */
  offset?: number;
}

/**
 * 日志统计信息
 */
export interface LogStats {
  /** 总日志数 */
  totalLogs: number;
  /** 按级别统计 */
  byLevel: Record<LogLevel, number>;
  /** 按操作统计 */
  byOperation: Record<string, number>;
  /** 按资源统计 */
  byResource: Record<string, number>;
  /** 平均响应时间 */
  averageResponseTime: number;
  /** 错误率 */
  errorRate: number;
}
