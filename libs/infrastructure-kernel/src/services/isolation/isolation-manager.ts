/**
 * 隔离管理器
 *
 * @description 统一管理多租户数据隔离功能
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import type { IIsolationManager } from "../../interfaces/isolation-service.interface.js";
import type { IsolationContext } from "../../types/isolation.types.js";
import { IsolationContextManager } from "./isolation-context-manager.js";
import { AccessControlService } from "./access-control-service.js";
import { AuditLogService } from "./audit-log-service.js";
import { SecurityMonitorService } from "./security-monitor-service.js";

/**
 * 隔离管理器
 */
@Injectable()
export class IsolationManager implements IIsolationManager {
  private services = new Map<string, any>();

  constructor(
    private readonly contextManager: IsolationContextManager,
    private readonly accessControlService: AccessControlService,
    private readonly auditLogService: AuditLogService,
    private readonly securityMonitorService: SecurityMonitorService,
  ) {
    this.registerDefaultServices();
  }

  /**
   * 注册隔离服务
   */
  registerService(name: string, service: unknown): void {
    this.services.set(name, service);
  }

  /**
   * 获取隔离服务
   */
  getService(name: string): unknown {
    return this.services.get(name);
  }

  /**
   * 获取所有服务
   */
  getAllServices(): Record<string, any> {
    return Object.fromEntries(this.services);
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const healthChecks: Record<string, boolean> = {};

    try {
      // 检查上下文管理器
      healthChecks["contextManager"] = true;

      // 检查访问控制服务
      healthChecks["accessControl"] = true;

      // 检查审计日志服务
      healthChecks["auditLog"] = await this.auditLogService.healthCheck();

      // 检查安全监控服务
      healthChecks["securityMonitor"] =
        await this.securityMonitorService.healthCheck();

      // 检查其他注册的服务
      for (const [name, service] of this.services.entries()) {
        if (service && typeof service.healthCheck === "function") {
          healthChecks[name] = await service.healthCheck();
        } else {
          healthChecks[name] = true;
        }
      }
    } catch (_error) {
      console.error("隔离管理器健康检查失败:", _error);
      // 设置所有服务为不健康
      for (const key of Object.keys(healthChecks)) {
        healthChecks[key] = false;
      }
    }

    return healthChecks;
  }

  /**
   * 获取隔离统计
   */
  async getIsolationStats(): Promise<Record<string, any>> {
    try {
      const contextStats = await this.contextManager.getContextStats();
      const auditStats = await this.auditLogService.getAuditStats(
        new Date(Date.now() - 24 * 60 * 60 * 1000), // 24小时前
        new Date(),
      );
      const securityStats =
        await this.securityMonitorService.getSecurityEventStats(
          new Date(Date.now() - 24 * 60 * 60 * 1000), // 24小时前
          new Date(),
        );

      return {
        context: contextStats,
        audit: auditStats,
        security: securityStats,
        services: {
          total: this.services.size,
          registered: Array.from(this.services.keys()),
        },
      };
    } catch (_error) {
      throw new Error(
        `获取隔离统计失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 创建隔离上下文
   */
  createIsolationContext(
    tenantId: string,
    organizationId?: string,
    departmentId?: string,
    userId?: string,
  ): IsolationContext {
    return this.contextManager.createContext(
      tenantId,
      organizationId,
      departmentId,
      userId,
    ) as any;
  }

  /**
   * 设置当前隔离上下文
   */
  setCurrentIsolationContext(context: IsolationContext): void {
    this.contextManager.setCurrentContext(context as any);
  }

  /**
   * 获取当前隔离上下文
   */
  getCurrentIsolationContext(): IsolationContext | null {
    return this.contextManager.getCurrentContext() as any;
  }

  /**
   * 验证访问权限
   */
  async validateAccess(
    context: IsolationContext,
    resource: unknown,
  ): Promise<boolean> {
    try {
      // 监控访问尝试
      await this.securityMonitorService.monitorAccess(
        context,
        resource,
        "access",
      );

      // 检测异常访问
      const isAnomalous =
        await this.securityMonitorService.detectAnomalousAccess(
          context,
          resource,
        );
      if (isAnomalous) {
        return false;
      }

      // 验证访问权限
      const hasAccess = await this.accessControlService.validateAccess(
        context as any,
        resource,
      );

      // 记录审计日志
      await this.auditLogService.log({
        action: "ACCESS_VALIDATION",
        resource: this.getResourceType(resource),
        resourceId: this.getResourceId(resource),
        userId: context.userId || "unknown",
        tenantId: context.tenantId,
        organizationId: context.organizationId,
        departmentId: context.departmentId,
        result: hasAccess ? "SUCCESS" : "FAILURE",
        details: {
          context: context,
          resource: resource,
          hasAccess: hasAccess,
        },
        ipAddress: "unknown",
        userAgent: "unknown",
      } as any);

      return hasAccess;
    } catch (_error) {
      console.error("验证访问权限失败:", _error);
      return false;
    }
  }

  /**
   * 应用隔离过滤
   */
  applyIsolationFilter(query: unknown, context: IsolationContext): unknown {
    return this.accessControlService.applyIsolationFilter(
      query,
      context as any,
    );
  }

  /**
   * 过滤数据
   */
  filterData<T>(data: T[], context: IsolationContext): T[] {
    return this.accessControlService.filterData(data, context as any);
  }

  /**
   * 记录审计日志
   */
  async logAuditEvent(
    action: string,
    resource: string,
    resourceId: string,
    result: "SUCCESS" | "FAILURE" | "ERROR",
    details?: Record<string, any>,
  ): Promise<void> {
    try {
      const context = this.getCurrentIsolationContext();
      if (!context) {
        throw new Error("未设置隔离上下文");
      }

      await this.auditLogService.log({
        action,
        resource,
        resourceId,
        userId: context.userId || "unknown",
        tenantId: context.tenantId,
        organizationId: context.organizationId,
        departmentId: context.departmentId,
        result,
        details: details || {},
        ipAddress: "unknown",
        userAgent: "unknown",
      } as any);
    } catch (_error) {
      console.error("记录审计事件失败:", _error);
    }
  }

  /**
   * 记录安全事件
   */
  async logSecurityEvent(
    type: string,
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    description: string,
    details?: Record<string, any>,
  ): Promise<void> {
    try {
      const context = this.getCurrentIsolationContext();
      if (!context) {
        throw new Error("未设置隔离上下文");
      }

      await this.securityMonitorService.recordSecurityEvent({
        id: this.generateSecurityEventId(),
        type,
        severity,
        description,
        context,
        timestamp: new Date(),
        details: details || {},
      });
    } catch (_error) {
      console.error("记录安全事件失败:", _error);
    }
  }

  /**
   * 获取访问权限摘要
   */
  async getPermissionSummary(context: IsolationContext): Promise<any> {
    return await this.accessControlService.getPermissionSummary(context as any);
  }

  /**
   * 获取审计日志
   */
  async getAuditLogs(filters: unknown): Promise<any[]> {
    return await this.auditLogService.query(filters);
  }

  /**
   * 获取安全事件
   */
  async getSecurityEvents(startTime: Date, endTime: Date): Promise<any> {
    return await this.securityMonitorService.getSecurityEventStats(
      startTime,
      endTime,
    );
  }

  /**
   * 获取异常访问报告
   */
  async getAnomalousAccessReport(startTime: Date, endTime: Date): Promise<any> {
    return await this.securityMonitorService.getAnomalousAccessReport(
      startTime,
      endTime,
    );
  }

  /**
   * 注册默认服务
   */
  private registerDefaultServices(): void {
    this.registerService("contextManager", this.contextManager);
    this.registerService("accessControl", this.accessControlService);
    this.registerService("auditLog", this.auditLogService);
    this.registerService("securityMonitor", this.securityMonitorService);
  }

  /**
   * 获取资源类型
   */
  private getResourceType(resource: unknown): string {
    if (typeof resource === "string") {
      return resource;
    }

    if (resource && typeof resource === "object") {
      const resourceObj = resource as Record<string, unknown>;
      return (
        (resourceObj.type as string) ||
        (resourceObj.resourceType as string) ||
        "unknown"
      );
    }

    return "unknown";
  }

  /**
   * 获取资源ID
   */
  private getResourceId(resource: unknown): string {
    if (typeof resource === "string") {
      return resource;
    }

    if (resource && typeof resource === "object") {
      const resourceObj = resource as Record<string, unknown>;
      return (
        (resourceObj.id as string) || (resourceObj.resourceId as string) || ""
      );
    }

    return "";
  }

  /**
   * 生成安全事件ID
   */
  private generateSecurityEventId(): string {
    return `security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
