/**
 * 审计日志服务
 *
 * @description 实现多租户数据隔离的审计日志功能
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import type { IAuditLogService, AuditConfig } from '../interfaces/isolation-service.interface.js';
import type { AuditLog, AuditLogQueryFilters } from '../types/isolation.types.js';
import type { IDatabaseAdapter } from '../interfaces/database-adapter.interface.js';
import type { ILoggingService } from '../interfaces/logging-service.interface.js';

/**
 * 审计日志服务
 */
@Injectable()
export class AuditLogService implements IAuditLogService {
  private config: AuditConfig = {
    enabled: true,
    level: 'MEDIUM',
    retentionDays: 90,
    encrypt: false,
    auditFields: ['id', 'action', 'resource', 'userId', 'tenantId', 'timestamp']
  };

  constructor(
    private readonly databaseAdapter: IDatabaseAdapter,
    private readonly loggingService?: ILoggingService
  ) {}

  /**
   * 记录审计日志
   */
  async log(auditLog: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      if (!this.config.enabled) {
        return;
      }

      const fullAuditLog: AuditLog = {
        id: this.generateAuditLogId(),
        timestamp: new Date(),
        ...auditLog
      };

      // 记录到数据库
      await this.saveAuditLog(fullAuditLog);

      // 记录到日志系统
      if (this.loggingService) {
        await this.logToLoggingService(fullAuditLog);
      }
    } catch (error) {
      console.error('记录审计日志失败:', error);
    }
  }

  /**
   * 查询审计日志
   */
  async query(filters: AuditLogQueryFilters): Promise<AuditLog[]> {
    try {
      const repository = this.databaseAdapter.getRepository(this.getAuditLogEntityClass());
      
      // 构建查询条件
      const conditions = this.buildQueryConditions(filters);
      
      // 执行查询
      const auditLogs = await repository.find(conditions, {
        limit: filters.limit || 100,
        offset: filters.offset || 0,
        orderBy: { timestamp: 'DESC' }
      });

      return auditLogs;
    } catch (error) {
      throw new Error(`查询审计日志失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 清理过期日志
   */
  async cleanup(olderThan: Date): Promise<number> {
    try {
      const repository = this.databaseAdapter.getRepository(this.getAuditLogEntityClass());
      
      // 删除过期日志
      const result = await repository.nativeDelete({
        timestamp: { $lt: olderThan }
      });

      return result.affectedRows || 0;
    } catch (error) {
      throw new Error(`清理过期日志失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 批量记录审计日志
   */
  async batchLog(auditLogs: Array<Omit<AuditLog, 'id' | 'timestamp'>>): Promise<void> {
    try {
      if (!this.config.enabled || auditLogs.length === 0) {
        return;
      }

      const fullAuditLogs: AuditLog[] = auditLogs.map(auditLog => ({
        id: this.generateAuditLogId(),
        timestamp: new Date(),
        ...auditLog
      }));

      // 批量保存到数据库
      await this.batchSaveAuditLogs(fullAuditLogs);

      // 批量记录到日志系统
      if (this.loggingService) {
        for (const auditLog of fullAuditLogs) {
          await this.logToLoggingService(auditLog);
        }
      }
    } catch (error) {
      throw new Error(`批量记录审计日志失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取审计统计
   */
  async getAuditStats(
    startTime: Date,
    endTime: Date
  ): Promise<Record<string, any>> {
    try {
      const repository = this.databaseAdapter.getRepository(this.getAuditLogEntityClass());
      
      // 获取基本统计
      const total = await repository.count({
        timestamp: { $gte: startTime, $lte: endTime }
      });

      // 按操作类型统计
      const byAction = await repository.aggregate([
        { $match: { timestamp: { $gte: startTime, $lte: endTime } } },
        { $group: { _id: '$action', count: { $sum: 1 } } }
      ]);

      // 按结果统计
      const byResult = await repository.aggregate([
        { $match: { timestamp: { $gte: startTime, $lte: endTime } } },
        { $group: { _id: '$result', count: { $sum: 1 } } }
      ]);

      // 按租户统计
      const byTenant = await repository.aggregate([
        { $match: { timestamp: { $gte: startTime, $lte: endTime } } },
        { $group: { _id: '$tenantId', count: { $sum: 1 } } }
      ]);

      return {
        total,
        byAction: Object.fromEntries(byAction.map(item => [item._id, item.count])),
        byResult: Object.fromEntries(byResult.map(item => [item._id, item.count])),
        byTenant: Object.fromEntries(byTenant.map(item => [item._id, item.count])),
        period: { startTime, endTime }
      };
    } catch (error) {
      throw new Error(`获取审计统计失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 导出审计日志
   */
  async exportAuditLogs(
    filters: AuditLogQueryFilters,
    format: 'json' | 'csv'
  ): Promise<string> {
    try {
      const auditLogs = await this.query(filters);
      
      if (format === 'json') {
        return JSON.stringify(auditLogs, null, 2);
      } else if (format === 'csv') {
        return this.convertToCSV(auditLogs);
      }
      
      throw new Error(`不支持的导出格式: ${format}`);
    } catch (error) {
      throw new Error(`导出审计日志失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 设置审计配置
   */
  setAuditConfig(config: AuditConfig): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取审计配置
   */
  getAuditConfig(): AuditConfig {
    return { ...this.config };
  }

  /**
   * 保存审计日志
   */
  private async saveAuditLog(auditLog: AuditLog): Promise<void> {
    try {
      const repository = this.databaseAdapter.getRepository(this.getAuditLogEntityClass());
      await repository.persistAndFlush(auditLog);
    } catch (error) {
      throw new Error(`保存审计日志失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 批量保存审计日志
   */
  private async batchSaveAuditLogs(auditLogs: AuditLog[]): Promise<void> {
    try {
      const repository = this.databaseAdapter.getRepository(this.getAuditLogEntityClass());
      await repository.persistAndFlush(auditLogs);
    } catch (error) {
      throw new Error(`批量保存审计日志失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 记录到日志系统
   */
  private async logToLoggingService(auditLog: AuditLog): Promise<void> {
    try {
      if (!this.loggingService) {
        return;
      }

      const logContext = {
        requestId: `audit_${auditLog.id}`,
        tenantId: auditLog.tenantId,
        operation: 'audit',
        resource: 'audit-log',
        timestamp: auditLog.timestamp,
        level: 'info' as const,
        message: `审计日志: ${auditLog.action}`
      };

      await this.loggingService.info(logContext, `审计日志: ${auditLog.action}`, {
        auditLogId: auditLog.id,
        action: auditLog.action,
        resource: auditLog.resource,
        resourceId: auditLog.resourceId,
        userId: auditLog.userId,
        result: auditLog.result,
        details: auditLog.details
      });
    } catch (error) {
      console.error('记录到日志系统失败:', error);
    }
  }

  /**
   * 构建查询条件
   */
  private buildQueryConditions(filters: AuditLogQueryFilters): Record<string, any> {
    const conditions: Record<string, any> = {};

    if (filters.tenantId) {
      conditions.tenantId = filters.tenantId;
    }

    if (filters.organizationId) {
      conditions.organizationId = filters.organizationId;
    }

    if (filters.departmentId) {
      conditions.departmentId = filters.departmentId;
    }

    if (filters.userId) {
      conditions.userId = filters.userId;
    }

    if (filters.action) {
      conditions.action = filters.action;
    }

    if (filters.resource) {
      conditions.resource = filters.resource;
    }

    if (filters.result) {
      conditions.result = filters.result;
    }

    if (filters.startTime || filters.endTime) {
      conditions.timestamp = {};
      if (filters.startTime) {
        conditions.timestamp.$gte = filters.startTime;
      }
      if (filters.endTime) {
        conditions.timestamp.$lte = filters.endTime;
      }
    }

    return conditions;
  }

  /**
   * 转换为CSV格式
   */
  private convertToCSV(auditLogs: AuditLog[]): string {
    if (auditLogs.length === 0) {
      return '';
    }

    const headers = ['id', 'action', 'resource', 'resourceId', 'userId', 'tenantId', 'organizationId', 'departmentId', 'timestamp', 'result', 'ipAddress', 'userAgent'];
    const rows = auditLogs.map(log => [
      log.id,
      log.action,
      log.resource,
      log.resourceId,
      log.userId,
      log.tenantId,
      log.organizationId,
      log.departmentId,
      log.timestamp.toISOString(),
      log.result,
      log.ipAddress,
      log.userAgent
    ]);

    return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
  }

  /**
   * 生成审计日志ID
   */
  private generateAuditLogId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取审计日志实体类
   */
  private getAuditLogEntityClass(): any {
    // 这里应该返回审计日志实体类
    // 暂时返回一个占位符
    return class AuditLogEntity {};
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      return await this.databaseAdapter.healthCheck();
    } catch (error) {
      return false;
    }
  }
}
