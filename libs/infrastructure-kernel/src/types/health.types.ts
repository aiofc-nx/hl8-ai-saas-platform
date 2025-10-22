/**
 * 健康检查类型定义
 *
 * @description 定义健康检查相关的类型和接口
 * @since 1.0.0
 */

/**
 * 健康状态枚举
 */
export type HealthStatus = "HEALTHY" | "DEGRADED" | "UNHEALTHY";

/**
 * 健康状态接口
 */
export interface HealthCheckResult {
  /** 组件名称 */
  component: string;
  /** 健康状态 */
  status: HealthStatus;
  /** 最后检查时间 */
  lastCheck: Date;
  /** 响应时间(毫秒) */
  responseTime: number;
  /** 错误率 */
  errorRate: number;
  /** 详细信息 */
  details: Record<string, unknown>;
  /** 依赖组件状态 */
  dependencies: HealthCheckResult[];
}

/**
 * 健康检查服务接口
 */
export interface HealthCheckService {
  /** 执行健康检查 */
  checkHealth(): Promise<HealthCheckResult>;
  /** 检查特定组件 */
  checkComponent(component: string): Promise<HealthCheckResult>;
  /** 获取整体健康状态 */
  getOverallHealth(): Promise<HealthStatus>;
  /** 注册健康检查器 */
  registerChecker(component: string, checker: HealthChecker): void;
  /** 取消注册健康检查器 */
  unregisterChecker(component: string): void;
}

/**
 * 健康检查器接口
 */
export interface HealthChecker {
  /** 检查名称 */
  name: string;
  /** 执行检查 */
  check(): Promise<HealthCheckResult>;
  /** 检查间隔(毫秒) */
  interval?: number;
  /** 超时时间(毫秒) */
  timeout?: number;
}

/**
 * 健康监控接口
 */
export interface HealthMonitor {
  /** 开始监控 */
  start(): Promise<void>;
  /** 停止监控 */
  stop(): Promise<void>;
  /** 获取监控状态 */
  getStatus(): Promise<HealthMonitorStatus>;
  /** 设置监控间隔 */
  setInterval(interval: number): void;
  /** 添加健康检查器 */
  addChecker(checker: HealthChecker): void;
  /** 移除健康检查器 */
  removeChecker(name: string): void;
}

/**
 * 健康监控状态
 */
export interface HealthMonitorStatus {
  /** 是否运行中 */
  running: boolean;
  /** 监控间隔(毫秒) */
  interval: number;
  /** 检查器数量 */
  checkerCount: number;
  /** 最后检查时间 */
  lastCheck: Date;
  /** 整体健康状态 */
  overallStatus: HealthStatus;
}

/**
 * 健康报告接口
 */
export interface HealthReport {
  /** 报告ID */
  id: string;
  /** 生成时间 */
  timestamp: Date;
  /** 整体健康状态 */
  overallStatus: HealthStatus;
  /** 组件健康状态 */
  components: HealthCheckResult[];
  /** 性能指标 */
  metrics: HealthMetrics;
  /** 建议 */
  recommendations: string[];
}

/**
 * 健康指标接口
 */
export interface HealthMetrics {
  /** 平均响应时间(毫秒) */
  averageResponseTime: number;
  /** 最大响应时间(毫秒) */
  maxResponseTime: number;
  /** 最小响应时间(毫秒) */
  minResponseTime: number;
  /** 错误率 */
  errorRate: number;
  /** 可用性 */
  availability: number;
  /** 吞吐量 */
  throughput: number;
}

/**
 * 健康检查配置
 */
export interface HealthCheckConfig {
  /** 检查间隔(毫秒) */
  interval: number;
  /** 超时时间(毫秒) */
  timeout: number;
  /** 重试次数 */
  retries: number;
  /** 重试延迟(毫秒) */
  retryDelay: number;
  /** 是否启用详细日志 */
  enableDetailedLogging: boolean;
  /** 是否启用告警 */
  enableAlerts: boolean;
}

/**
 * 健康告警接口
 */
export interface HealthAlert {
  /** 告警ID */
  id: string;
  /** 组件名称 */
  component: string;
  /** 告警级别 */
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  /** 告警消息 */
  message: string;
  /** 触发时间 */
  timestamp: Date;
  /** 是否已处理 */
  resolved: boolean;
  /** 处理时间 */
  resolvedAt?: Date;
  /** 详细信息 */
  details: Record<string, unknown>;
}

/**
 * 健康告警服务接口
 */
export interface HealthAlertService {
  /** 发送告警 */
  sendAlert(alert: Omit<HealthAlert, "id" | "timestamp">): Promise<void>;
  /** 获取告警列表 */
  getAlerts(filters?: HealthAlertFilters): Promise<HealthAlert[]>;
  /** 解决告警 */
  resolveAlert(alertId: string): Promise<void>;
  /** 清除告警 */
  clearAlerts(component?: string): Promise<void>;
}

/**
 * 健康告警过滤器
 */
export interface HealthAlertFilters {
  /** 组件名称 */
  component?: string;
  /** 告警级别 */
  level?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  /** 是否已处理 */
  resolved?: boolean;
  /** 开始时间 */
  startTime?: Date;
  /** 结束时间 */
  endTime?: Date;
}
