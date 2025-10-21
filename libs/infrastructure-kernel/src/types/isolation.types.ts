/**
 * 隔离上下文类型定义
 *
 * @description 定义多租户数据隔离相关的类型和接口
 * @since 1.0.0
 */

/**
 * 共享级别枚举
 */
export type SharingLevel = 'PLATFORM' | 'TENANT' | 'ORGANIZATION' | 'DEPARTMENT' | 'USER';

/**
 * 隔离上下文接口
 */
export interface IsolationContext {
  /** 租户ID */
  tenantId: string;
  /** 组织ID */
  organizationId?: string;
  /** 部门ID */
  departmentId?: string;
  /** 用户ID */
  userId?: string;
  /** 共享级别 */
  sharingLevel: SharingLevel;
  /** 是否共享 */
  isShared: boolean;
  /** 访问规则 */
  accessRules: AccessRule[];
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
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
}

/**
 * 隔离上下文管理器接口
 */
export interface IsolationContextManager {
  /** 创建隔离上下文 */
  createContext(
    tenantId: string,
    organizationId?: string,
    departmentId?: string,
    userId?: string
  ): IsolationContext;
  /** 验证隔离上下文 */
  validateContext(context: IsolationContext): boolean;
  /** 获取当前隔离上下文 */
  getCurrentContext(): IsolationContext | null;
  /** 设置当前隔离上下文 */
  setCurrentContext(context: IsolationContext): void;
  /** 清除当前隔离上下文 */
  clearCurrentContext(): void;
}

/**
 * 访问控制服务接口
 */
export interface AccessControlService {
  /** 验证访问权限 */
  validateAccess(
    context: IsolationContext,
    resource: any
  ): Promise<boolean>;
  /** 检查资源访问权限 */
  checkResourceAccess(
    context: IsolationContext,
    resourceType: string,
    resourceId: string,
    action: string
  ): Promise<boolean>;
  /** 过滤数据 */
  filterData<T>(
    data: T[],
    context: IsolationContext
  ): T[];
  /** 应用隔离过滤 */
  applyIsolationFilter(
    query: any,
    context: IsolationContext
  ): any;
}

/**
 * 审计日志接口
 */
export interface AuditLog {
  /** 日志ID */
  id: string;
  /** 操作类型 */
  action: string;
  /** 资源类型 */
  resource: string;
  /** 资源ID */
  resourceId: string;
  /** 用户ID */
  userId: string;
  /** 租户ID */
  tenantId: string;
  /** 组织ID */
  organizationId?: string;
  /** 部门ID */
  departmentId?: string;
  /** 时间戳 */
  timestamp: Date;
  /** 详细信息 */
  details: Record<string, any>;
  /** IP地址 */
  ipAddress: string;
  /** 用户代理 */
  userAgent: string;
  /** 操作结果 */
  result: 'SUCCESS' | 'FAILURE' | 'ERROR';
}

/**
 * 审计日志服务接口
 */
export interface AuditLogService {
  /** 记录审计日志 */
  log(auditLog: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void>;
  /** 查询审计日志 */
  query(filters: AuditLogQueryFilters): Promise<AuditLog[]>;
  /** 清理过期日志 */
  cleanup(olderThan: Date): Promise<number>;
}

/**
 * 审计日志查询过滤器
 */
export interface AuditLogQueryFilters {
  /** 租户ID */
  tenantId?: string;
  /** 组织ID */
  organizationId?: string;
  /** 部门ID */
  departmentId?: string;
  /** 用户ID */
  userId?: string;
  /** 操作类型 */
  action?: string;
  /** 资源类型 */
  resource?: string;
  /** 开始时间 */
  startTime?: Date;
  /** 结束时间 */
  endTime?: Date;
  /** 操作结果 */
  result?: 'SUCCESS' | 'FAILURE' | 'ERROR';
  /** 限制数量 */
  limit?: number;
  /** 偏移量 */
  offset?: number;
}

/**
 * 安全监控接口
 */
export interface SecurityMonitor {
  /** 监控访问尝试 */
  monitorAccess(
    context: IsolationContext,
    resource: any,
    action: string
  ): Promise<void>;
  /** 检测异常访问 */
  detectAnomalousAccess(
    context: IsolationContext,
    resource: any
  ): Promise<boolean>;
  /** 记录安全事件 */
  recordSecurityEvent(
    event: SecurityEvent
  ): Promise<void>;
}

/**
 * 安全事件接口
 */
export interface SecurityEvent {
  /** 事件ID */
  id: string;
  /** 事件类型 */
  type: string;
  /** 严重级别 */
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  /** 描述 */
  description: string;
  /** 上下文 */
  context: IsolationContext;
  /** 时间戳 */
  timestamp: Date;
  /** 详细信息 */
  details: Record<string, any>;
}
