/**
 * 隔离服务接口
 *
 * @description 定义多租户数据隔离服务的通用接口
 * @since 1.0.0
 */

import type {
  IsolationContext,
  IsolationContextManager,
  AccessControlService,
  AuditLogService,
  SecurityMonitor,
} from "../types/isolation.types.js";

/**
 * 隔离上下文管理器接口
 */
export interface IIsolationContextManager extends IsolationContextManager {
  /** 验证隔离上下文完整性 */
  validateContextIntegrity(context: IsolationContext): boolean;

  /** 获取隔离上下文层级 */
  getContextLevel(context: IsolationContext): number;

  /** 检查上下文权限 */
  checkContextPermissions(
    context: IsolationContext,
    resource: string,
    action: string,
  ): Promise<boolean>;

  /** 获取上下文统计 */
  getContextStats(): Promise<Record<string, any>>;
}

/**
 * 访问控制服务接口
 */
export interface IAccessControlService extends AccessControlService {
  /** 设置访问规则 */
  setAccessRule(resourceType: string, action: string, rule: AccessRule): void;

  /** 获取访问规则 */
  getAccessRules(resourceType: string, action: string): AccessRule[];

  /** 移除访问规则 */
  removeAccessRule(resourceType: string, action: string, ruleId: string): void;

  /** 检查批量访问权限 */
  checkBatchAccess(
    context: IsolationContext,
    resources: Array<{ type: string; id: string; action: string }>,
  ): Promise<Record<string, boolean>>;

  /** 获取权限摘要 */
  getPermissionSummary(context: IsolationContext): Promise<PermissionSummary>;
}

/**
 * 访问规则接口
 */
export interface AccessRule {
  /** 规则ID */
  id: string;
  /** 资源类型 */
  resourceType: string;
  /** 操作类型 */
  action: string;
  /** 是否允许 */
  allow: boolean;
  /** 条件 */
  conditions?: Record<string, any>;
  /** 优先级 */
  priority: number;
  /** 是否启用 */
  enabled: boolean;
}

/**
 * 权限摘要接口
 */
export interface PermissionSummary {
  /** 允许的操作 */
  allowedActions: string[];
  /** 禁止的操作 */
  deniedActions: string[];
  /** 资源权限 */
  resourcePermissions: Record<string, string[]>;
  /** 权限级别 */
  permissionLevel: "READ" | "WRITE" | "ADMIN" | "OWNER";
}

/**
 * 审计日志服务接口
 */
export interface IAuditLogService extends AuditLogService {
  /** 批量记录审计日志 */
  batchLog(
    auditLogs: Array<
      Omit<import("../types/isolation.types.js").AuditLog, "id" | "timestamp">
    >,
  ): Promise<void>;

  /** 获取审计统计 */
  getAuditStats(startTime: Date, endTime: Date): Promise<Record<string, any>>;

  /** 导出审计日志 */
  exportAuditLogs(
    filters: import("../types/isolation.types.js").AuditLogQueryFilters,
    format: "json" | "csv",
  ): Promise<string>;

  /** 设置审计配置 */
  setAuditConfig(config: AuditConfig): void;

  /** 获取审计配置 */
  getAuditConfig(): AuditConfig;
}

/**
 * 审计配置接口
 */
export interface AuditConfig {
  /** 是否启用审计 */
  enabled: boolean;
  /** 审计级别 */
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  /** 保留时间(天) */
  retentionDays: number;
  /** 是否加密 */
  encrypt: boolean;
  /** 审计字段 */
  auditFields: string[];
}

/**
 * 安全监控服务接口
 */
export interface ISecurityMonitorService extends SecurityMonitor {
  /** 设置监控规则 */
  setMonitoringRules(rules: MonitoringRule[]): void;

  /** 获取监控规则 */
  getMonitoringRules(): MonitoringRule[];

  /** 获取安全事件统计 */
  getSecurityEventStats(
    startTime: Date,
    endTime: Date,
  ): Promise<Record<string, any>>;

  /** 获取异常访问报告 */
  getAnomalousAccessReport(
    startTime: Date,
    endTime: Date,
  ): Promise<AnomalousAccessReport>;
}

/**
 * 监控规则接口
 */
export interface MonitoringRule {
  /** 规则ID */
  id: string;
  /** 规则名称 */
  name: string;
  /** 监控类型 */
  type: "ACCESS" | "PERMISSION" | "DATA" | "SECURITY";
  /** 条件 */
  condition: string;
  /** 阈值 */
  threshold: number;
  /** 告警级别 */
  alertLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  /** 是否启用 */
  enabled: boolean;
}

/**
 * 异常访问报告接口
 */
export interface AnomalousAccessReport {
  /** 异常访问次数 */
  anomalousAccessCount: number;
  /** 高风险访问 */
  highRiskAccess: Array<{
    context: IsolationContext;
    resource: string;
    riskLevel: "HIGH" | "CRITICAL";
    timestamp: Date;
  }>;
  /** 建议措施 */
  recommendations: string[];
}

/**
 * 隔离管理器接口
 */
export interface IIsolationManager {
  /** 注册隔离服务 */
  registerService(name: string, service: any): void;

  /** 获取隔离服务 */
  getService(name: string): any;

  /** 获取所有服务 */
  getAllServices(): Record<string, any>;

  /** 健康检查 */
  healthCheck(): Promise<Record<string, boolean>>;

  /** 获取隔离统计 */
  getIsolationStats(): Promise<Record<string, any>>;
}

// 重新导出类型 - 注释掉以避免冲突
// export type { AccessRule } from '../types/isolation.types.js';
