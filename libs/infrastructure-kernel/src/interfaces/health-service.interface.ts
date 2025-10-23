/**
 * 健康检查服务接口
 *
 * @description 定义健康检查服务的通用接口
 * @since 1.0.0
 */

import type {
  HealthCheckService,
  HealthCheckResult,
  HealthStatus,
  HealthChecker,
  HealthMonitor,
  HealthReport,
  HealthAlertService,
} from "../types/health.types.js";

/**
 * 健康检查服务接口
 */
export interface IHealthCheckService extends HealthCheckService {
  /** 获取健康报告 */
  getHealthReport(): Promise<HealthReport>;

  /** 获取组件列表 */
  getComponents(): string[];

  /** 设置检查间隔 */
  setCheckInterval(interval: number): void;

  /** 获取检查间隔 */
  getCheckInterval(): number;

  /** 启用/禁用组件检查 */
  enableComponent(component: string): void;

  /** 禁用组件检查 */
  disableComponent(component: string): void;

  /** 获取组件状态 */
  getComponentStatus(component: string): Promise<HealthStatus>;
}

/**
 * 健康监控服务接口
 */
export interface IHealthMonitorService extends HealthMonitor {
  /** 获取监控配置 */
  getConfig(): Record<string, unknown>;

  /** 设置监控配置 */
  setConfig(config: Record<string, unknown>): void;

  /** 获取历史数据 */
  getHistory(
    component: string,
    startTime: Date,
    endTime: Date,
  ): Promise<HealthCheckResult[]>;

  /** 获取趋势分析 */
  getTrendAnalysis(
    component: string,
    period: "hour" | "day" | "week" | "month",
  ): Promise<Record<string, unknown>>;
}

/**
 * 健康告警服务接口
 */
export interface IHealthAlertService extends HealthAlertService {
  /** 配置告警规则 */
  configureAlert(component: string, rules: AlertRule[]): void;

  /** 获取告警规则 */
  getAlertRules(component: string): AlertRule[];

  /** 测试告警 */
  testAlert(component: string, rule: AlertRule): Promise<boolean>;

  /** 获取告警统计 */
  getAlertStats(
    startTime: Date,
    endTime: Date,
  ): Promise<Record<string, unknown>>;
}

/**
 * 告警规则接口
 */
export interface AlertRule {
  /** 规则ID */
  id: string;
  /** 规则名称 */
  name: string;
  /** 条件 */
  condition: string;
  /** 阈值 */
  threshold: number;
  /** 告警级别 */
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  /** 是否启用 */
  enabled: boolean;
  /** 通知方式 */
  notifications: string[];
}

/**
 * 健康检查器接口
 */
export interface IHealthChecker extends HealthChecker {
  /** 获取检查器配置 */
  getConfig(): Record<string, unknown>;

  /** 设置检查器配置 */
  setConfig(config: Record<string, unknown>): void;

  /** 获取检查历史 */
  getCheckHistory(): HealthCheckResult[];

  /** 重置检查历史 */
  resetHistory(): void;
}

/**
 * 健康管理器接口
 */
export interface IHealthManager {
  /** 注册健康检查器 */
  registerChecker(checker: IHealthChecker): void;

  /** 获取健康检查器 */
  getChecker(name: string): IHealthChecker;

  /** 获取所有检查器 */
  getAllCheckers(): Record<string, IHealthChecker>;

  /** 移除健康检查器 */
  removeChecker(name: string): void;

  /** 获取整体健康状态 */
  getOverallHealth(): Promise<HealthStatus>;

  /** 获取健康摘要 */
  getHealthSummary(): Promise<HealthSummary>;

  /** 健康检查 */
  healthCheck(): Promise<Record<string, boolean>>;
}

/**
 * 健康摘要接口
 */
export interface HealthSummary {
  /** 整体状态 */
  overallStatus: HealthStatus;
  /** 健康组件数 */
  healthyComponents: number;
  /** 不健康组件数 */
  unhealthyComponents: number;
  /** 降级组件数 */
  degradedComponents: number;
  /** 总组件数 */
  totalComponents: number;
  /** 最后检查时间 */
  lastCheck: Date;
  /** 平均响应时间 */
  averageResponseTime: number;
}

// 重新导出类型
export type { HealthCheckResult } from "../types/health.types.js";
