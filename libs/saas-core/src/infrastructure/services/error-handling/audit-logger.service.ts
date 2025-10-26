// libs/saas-core/src/infrastructure/audit/audit-logger.service.ts
import { IsolationContext } from "@hl8/domain-kernel";
import { FastifyLoggerService } from "@hl8/nestjs-fastify";
import type { LogContext } from "@hl8/nestjs-fastify";

/**
 * 审计日志配置接口
 *
 * @description 定义审计日志服务的配置选项
 */
export interface AuditConfig {
  /** 存储方式：database, file, external */
  storage: "database" | "file" | "external";
  /** 是否启用审计日志 */
  enabled: boolean;
  /** 日志级别 */
  level: "DEBUG" | "INFO" | "WARN" | "ERROR";
  /** 数据库配置 */
  database?: {
    tableName: string;
    connectionString: string;
  };
  /** 文件配置 */
  file?: {
    path: string;
    maxSize: string;
    maxFiles: number;
  };
  /** 外部服务配置 */
  external?: {
    endpoint: string;
    apiKey: string;
    timeout: number;
  };
}

/**
 * 审计日志服务
 *
 * 基于@hl8内核组件实现的审计日志功能，支持多租户数据隔离
 * 提供完整的审计跟踪能力，包括用户操作、数据变更、权限检查等
 *
 * @description 审计日志服务负责记录所有关键业务操作，确保数据安全和合规性
 * @example
 * ```typescript
 * // 记录用户操作
 * await auditLogger.logUserAction({
 *   userId: 'user-123',
 *   action: 'CREATE_TENANT',
 *   resource: 'tenant',
 *   details: { tenantName: 'Acme Corp' }
 * });
 * ```
 */
export class AuditLoggerService {
  private readonly auditConfig: AuditConfig;

  constructor(
    private readonly logger: FastifyLoggerService,
    auditConfig: AuditConfig,
  ) {
    this.auditConfig = auditConfig;
    (this.logger as any).log("Initialized AuditLoggerService");
  }

  /**
   * 记录用户操作审计日志
   *
   * @param params 审计日志参数
   * @param params.userId 用户ID
   * @param params.action 操作类型
   * @param params.resource 资源类型
   * @param params.details 操作详情
   * @param params.isolationContext 隔离上下文
   * @returns Promise<void>
   *
   * @description 记录用户执行的操作，包括操作类型、资源、详情等信息
   * @example
   * ```typescript
   * await auditLogger.logUserAction({
   *   userId: 'user-123',
   *   action: 'CREATE_TENANT',
   *   resource: 'tenant',
   *   details: { tenantName: 'Acme Corp' },
   *   isolationContext: IsolationContext.tenant('tenant-123')
   * });
   * ```
   */
  async logUserAction(params: {
    userId: string;
    action: string;
    resource: string;
    details?: Record<string, unknown>;
    isolationContext?: IsolationContext;
  }): Promise<void> {
    if (!this.auditConfig.enabled) {
      return;
    }

    const auditLog = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      userId: params.userId,
      action: params.action,
      resource: params.resource,
      details: params.details,
      isolationContext: params.isolationContext?.buildLogContext(),
      level: "INFO",
      category: "USER_ACTION",
    };

    await this.saveAuditLog(auditLog);
    this.logger.log("Logged user action", {
      action: params.action,
      userId: params.userId,
    });
  }

  /**
   * 记录数据变更审计日志
   *
   * @param params 数据变更审计参数
   * @param params.entityId 实体ID
   * @param params.entityType 实体类型
   * @param params.operation 操作类型 (CREATE, UPDATE, DELETE)
   * @param params.oldValues 变更前的值
   * @param params.newValues 变更后的值
   * @param params.userId 操作用户ID
   * @param params.isolationContext 隔离上下文
   * @returns Promise<void>
   *
   * @description 记录数据实体的变更操作，包括变更前后的值对比
   * @example
   * ```typescript
   * await auditLogger.logDataChange({
   *   entityId: 'tenant-123',
   *   entityType: 'Tenant',
   *   operation: 'UPDATE',
   *   oldValues: { name: 'Old Name' },
   *   newValues: { name: 'New Name' },
   *   userId: 'user-123',
   *   isolationContext: IsolationContext.tenant('tenant-123')
   * });
   * ```
   */
  async logDataChange(params: {
    entityId: string;
    entityType: string;
    operation: "CREATE" | "UPDATE" | "DELETE";
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    userId: string;
    isolationContext?: IsolationContext;
  }): Promise<void> {
    if (!this.auditConfig.enabled) {
      return;
    }

    const auditLog = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      entityId: params.entityId,
      entityType: params.entityType,
      operation: params.operation,
      oldValues: params.oldValues,
      newValues: params.newValues,
      userId: params.userId,
      isolationContext: params.isolationContext?.buildLogContext(),
      level: "INFO",
      category: "DATA_CHANGE",
    };

    await this.saveAuditLog(auditLog);
    this.logger.log("Logged data change", {
      operation: params.operation,
      entityType: params.entityType,
      entityId: params.entityId,
    });
  }

  /**
   * 记录权限检查审计日志
   *
   * @param params 权限检查审计参数
   * @param params.userId 用户ID
   * @param params.resource 资源
   * @param params.permission 权限
   * @param params.result 检查结果
   * @param params.isolationContext 隔离上下文
   * @returns Promise<void>
   *
   * @description 记录权限检查操作，包括检查结果和上下文信息
   * @example
   * ```typescript
   * await auditLogger.logPermissionCheck({
   *   userId: 'user-123',
   *   resource: 'tenant-123',
   *   permission: 'READ',
   *   result: 'GRANTED',
   *   isolationContext: IsolationContext.tenant('tenant-123')
   * });
   * ```
   */
  async logPermissionCheck(params: {
    userId: string;
    resource: string;
    permission: string;
    result: "GRANTED" | "DENIED";
    isolationContext?: IsolationContext;
  }): Promise<void> {
    if (!this.auditConfig.enabled) {
      return;
    }

    const auditLog = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      userId: params.userId,
      resource: params.resource,
      permission: params.permission,
      result: params.result,
      isolationContext: params.isolationContext?.buildLogContext(),
      level: params.result === "DENIED" ? "WARN" : "INFO",
      category: "PERMISSION_CHECK",
    };

    await this.saveAuditLog(auditLog);
    this.logger.log("Logged permission check", {
      permission: params.permission,
      resource: params.resource,
      result: params.result,
    });
  }

  /**
   * 记录系统事件审计日志
   *
   * @param params 系统事件审计参数
   * @param params.event 事件名称
   * @param params.details 事件详情
   * @param params.isolationContext 隔离上下文
   * @returns Promise<void>
   *
   * @description 记录系统级别的事件，如服务启动、配置变更等
   * @example
   * ```typescript
   * await auditLogger.logSystemEvent({
   *   event: 'SERVICE_STARTED',
   *   details: { service: 'saas-core', version: '1.0.0' },
   *   isolationContext: IsolationContext.platform()
   * });
   * ```
   */
  async logSystemEvent(params: {
    event: string;
    details?: Record<string, unknown>;
    isolationContext?: IsolationContext;
  }): Promise<void> {
    if (!this.auditConfig.enabled) {
      return;
    }

    const auditLog = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      event: params.event,
      details: params.details,
      isolationContext: params.isolationContext?.buildLogContext(),
      level: "INFO",
      category: "SYSTEM_EVENT",
    };

    await this.saveAuditLog(auditLog);
    this.logger.log("Logged system event", { event: params.event });
  }

  /**
   * 记录安全事件审计日志
   *
   * @param params 安全事件审计参数
   * @param params.event 安全事件类型
   * @param params.severity 严重程度
   * @param params.details 事件详情
   * @param params.isolationContext 隔离上下文
   * @returns Promise<void>
   *
   * @description 记录安全相关的事件，如登录失败、权限提升等
   * @example
   * ```typescript
   * await auditLogger.logSecurityEvent({
   *   event: 'LOGIN_FAILED',
   *   severity: 'HIGH',
   *   details: { userId: 'user-123', reason: 'Invalid password' },
   *   isolationContext: IsolationContext.tenant('tenant-123')
   * });
   * ```
   */
  async logSecurityEvent(params: {
    event: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    details?: Record<string, unknown>;
    isolationContext?: IsolationContext;
  }): Promise<void> {
    if (!this.auditConfig.enabled) {
      return;
    }

    const auditLog = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      event: params.event,
      severity: params.severity,
      details: params.details,
      isolationContext: params.isolationContext?.buildLogContext(),
      level: this.mapSeverityToLevel(params.severity),
      category: "SECURITY_EVENT",
    };

    await this.saveAuditLog(auditLog);
    this.logger.log("Logged security event", {
      event: params.event,
      severity: params.severity,
    });
  }

  /**
   * 保存审计日志到存储系统
   *
   * @param auditLog 审计日志对象
   * @returns Promise<void>
   *
   * @description 将审计日志保存到配置的存储系统中
   * @private
   */
  private async saveAuditLog(auditLog: Record<string, unknown>): Promise<void> {
    try {
      // 根据配置选择存储方式
      switch (this.auditConfig.storage) {
        case "database":
          await this.saveToDatabase(auditLog);
          break;
        case "file":
          await this.saveToFile(auditLog);
          break;
        case "external":
          await this.saveToExternalService(auditLog);
          break;
        default:
          this.logger.log("Audit log saved", {
            auditLog: JSON.stringify(auditLog, null, 2),
          });
      }
    } catch (error) {
      this.logger.log("Failed to save audit log", {
        error: error instanceof Error ? error.message : String(error),
      });
      // 审计日志失败不应该影响业务流程，只记录错误
    }
  }

  /**
   * 保存到数据库
   *
   * @param _auditLog 审计日志对象
   * @returns Promise<void>
   * @private
   */
  private async saveToDatabase(
    _auditLog: Record<string, unknown>,
  ): Promise<void> {
    // TODO: 实现数据库保存逻辑
    this.logger.log("Saving audit log to database");
  }

  /**
   * 保存到文件
   *
   * @param _auditLog 审计日志对象
   * @returns Promise<void>
   * @private
   */
  private async saveToFile(_auditLog: Record<string, unknown>): Promise<void> {
    // TODO: 实现文件保存逻辑
    this.logger.log("Saving audit log to file");
  }

  /**
   * 保存到外部服务
   *
   * @param _auditLog 审计日志对象
   * @returns Promise<void>
   * @private
   */
  private async saveToExternalService(
    _auditLog: Record<string, unknown>,
  ): Promise<void> {
    // TODO: 实现外部服务保存逻辑
    this.logger.log("Saving audit log to external service");
  }

  /**
   * 生成审计日志ID
   *
   * @returns string 审计日志ID
   * @private
   */
  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 将严重程度映射到日志级别
   *
   * @param severity 严重程度
   * @returns string 日志级别
   * @private
   */
  private mapSeverityToLevel(severity: string): string {
    const mapping = {
      LOW: "INFO",
      MEDIUM: "WARN",
      HIGH: "ERROR",
      CRITICAL: "FATAL",
    };
    return mapping[severity as keyof typeof mapping] || "INFO";
  }
}
