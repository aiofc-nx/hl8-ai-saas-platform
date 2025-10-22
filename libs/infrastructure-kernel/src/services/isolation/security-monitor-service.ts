/**
 * 安全监控服务
 *
 * @description 实现多租户数据隔离的安全监控功能
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import type { ISecurityMonitorService, MonitoringRule, AnomalousAccessReport } from '../../interfaces/isolation-service.interface.js';
import type { IsolationContext, SecurityEvent } from '../../types/isolation.types.js';
import type { IDatabaseAdapter } from '../../interfaces/database-adapter.interface.js';
import type { ILoggingService } from '../../interfaces/logging-service.interface.js';

/**
 * 安全监控服务
 */
@Injectable()
export class SecurityMonitorService implements ISecurityMonitorService {
  private monitoringRules: MonitoringRule[] = [];
  private securityEvents: SecurityEvent[] = [];
  private accessAttempts = new Map<string, number>();
  private anomalyThresholds = {
    maxAccessAttempts: 10,
    timeWindow: 300000, // 5分钟
    riskLevels: {
      LOW: 0.3,
      MEDIUM: 0.6,
      HIGH: 0.8,
      CRITICAL: 1.0
    }
  };

  constructor(
    private readonly databaseAdapter: IDatabaseAdapter,
    private readonly loggingService?: ILoggingService
  ) {}

  /**
   * 监控访问尝试
   */
  async monitorAccess(
    context: IsolationContext,
    resource: any,
    action: string
  ): Promise<void> {
    try {
      const accessKey = this.generateAccessKey(context, resource, action);
      const currentAttempts = this.accessAttempts.get(accessKey) || 0;
      this.accessAttempts.set(accessKey, currentAttempts + 1);

      // 检查是否触发监控规则
      await this.checkMonitoringRules(context, resource, action);

      // 记录访问日志
      await this.logAccessAttempt(context, resource, action);
    } catch (error) {
      console.error('监控访问尝试失败:', error);
    }
  }

  /**
   * 检测异常访问
   */
  async detectAnomalousAccess(
    context: IsolationContext,
    resource: any
  ): Promise<boolean> {
    try {
      const accessKey = this.generateAccessKey(context, resource, 'access');
      const attempts = this.accessAttempts.get(accessKey) || 0;
      
      // 检查访问频率
      if (attempts > this.anomalyThresholds.maxAccessAttempts) {
        await this.recordSecurityEvent({
          id: this.generateSecurityEventId(),
          type: 'ANOMALOUS_ACCESS',
          severity: 'HIGH',
          description: `异常访问检测: 访问次数 ${attempts}`,
          context,
          timestamp: new Date(),
          details: {
            accessKey,
            attempts,
            resource: this.getResourceInfo(resource)
          }
        });
        
        return true;
      }

      // 检查时间窗口内的访问模式
      const isAnomalous = await this.checkAccessPattern(context, resource);
      if (isAnomalous) {
        await this.recordSecurityEvent({
          id: this.generateSecurityEventId(),
          type: 'SUSPICIOUS_PATTERN',
          severity: 'MEDIUM',
          description: '可疑访问模式检测',
          context,
          timestamp: new Date(),
          details: {
            accessKey,
            resource: this.getResourceInfo(resource)
          }
        });
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('检测异常访问失败:', error);
      return false;
    }
  }

  /**
   * 记录安全事件
   */
  async recordSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      this.securityEvents.push(event);
      
      // 记录到数据库
      await this.saveSecurityEvent(event);
      
      // 记录到日志系统
      if (this.loggingService) {
        await this.logToLoggingService(event);
      }
      
      // 检查是否需要告警
      await this.checkSecurityAlerts(event);
    } catch (error) {
      console.error('记录安全事件失败:', error);
    }
  }

  /**
   * 设置监控规则
   */
  setMonitoringRules(rules: MonitoringRule[]): void {
    this.monitoringRules = rules;
  }

  /**
   * 获取监控规则
   */
  getMonitoringRules(): MonitoringRule[] {
    return [...this.monitoringRules];
  }

  /**
   * 获取安全事件统计
   */
  async getSecurityEventStats(
    startTime: Date,
    endTime: Date
  ): Promise<Record<string, any>> {
    try {
      const events = this.securityEvents.filter(
        event => event.timestamp >= startTime && event.timestamp <= endTime
      );

      const total = events.length;
      const bySeverity = events.reduce((acc, event) => {
        acc[event.severity] = (acc[event.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const byType = events.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const byTenant = events.reduce((acc, event) => {
        const tenantId = event.context.tenantId;
        acc[tenantId] = (acc[tenantId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total,
        bySeverity,
        byType,
        byTenant,
        period: { startTime, endTime }
      };
    } catch (error) {
      throw new Error(`获取安全事件统计失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取异常访问报告
   */
  async getAnomalousAccessReport(
    startTime: Date,
    endTime: Date
  ): Promise<AnomalousAccessReport> {
    try {
      const events = this.securityEvents.filter(
        event => event.timestamp >= startTime && event.timestamp <= endTime
      );

      const anomalousEvents = events.filter(
        event => event.type === 'ANOMALOUS_ACCESS' || event.type === 'SUSPICIOUS_PATTERN'
      );

      const highRiskAccess = anomalousEvents
        .filter(event => event.severity === 'HIGH' || event.severity === 'CRITICAL')
        .map(event => ({
          context: event.context,
          resource: event.details?.resource || 'unknown',
          riskLevel: event.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
          timestamp: event.timestamp
        }));

      const recommendations = this.generateRecommendations(anomalousEvents);

      return {
        anomalousAccessCount: anomalousEvents.length,
        highRiskAccess: highRiskAccess as any,
        recommendations
      };
    } catch (error) {
      throw new Error(`获取异常访问报告失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 检查监控规则
   */
  private async checkMonitoringRules(
    context: IsolationContext,
    resource: any,
    action: string
  ): Promise<void> {
    try {
      for (const rule of this.monitoringRules) {
        if (!rule.enabled) {
          continue;
        }

        if (this.isRuleApplicable(rule, context, resource, action)) {
          await this.evaluateRule(rule, context, resource, action);
        }
      }
    } catch (error) {
      console.error('检查监控规则失败:', error);
    }
  }

  /**
   * 检查访问模式
   */
  private async checkAccessPattern(
    context: IsolationContext,
    resource: any
  ): Promise<boolean> {
    try {
      // 这里可以实现更复杂的访问模式检测逻辑
      // 例如：检测异常时间访问、异常地理位置访问等
      
      const now = new Date();
      const hour = now.getHours();
      
      // 检测非工作时间访问
      if (hour < 6 || hour > 22) {
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * 检查安全告警
   */
  private async checkSecurityAlerts(event: SecurityEvent): Promise<void> {
    try {
      if (event.severity === 'CRITICAL') {
        await this.triggerSecurityAlert(event);
      }
    } catch (error) {
      console.error('检查安全告警失败:', error);
    }
  }

  /**
   * 触发安全告警
   */
  private async triggerSecurityAlert(event: SecurityEvent): Promise<void> {
    try {
      // 这里可以实现告警逻辑，例如发送邮件、短信等
      console.warn('安全告警:', event);
      
      if (this.loggingService) {
        const logContext = {
          requestId: `security_alert_${event.id}`,
          tenantId: event.context.tenantId,
          operation: 'security-alert',
          resource: 'security-monitor',
          timestamp: new Date(),
          level: 'warn' as const,
          message: `安全告警: ${event.type}`
        };
        
        await this.loggingService.warn(logContext, `安全告警: ${event.type}`, event);
      }
    } catch (error) {
      console.error('触发安全告警失败:', error);
    }
  }

  /**
   * 生成访问键
   */
  private generateAccessKey(
    context: IsolationContext,
    resource: any,
    action: string
  ): string {
    const resourceInfo = this.getResourceInfo(resource);
    return `${context.tenantId}:${context.userId}:${resourceInfo.type}:${action}`;
  }

  /**
   * 获取资源信息
   */
  private getResourceInfo(resource: any): { type: string; id: string } {
    if (typeof resource === 'string') {
      return { type: 'string', id: resource };
    }
    
    if (resource && typeof resource === 'object') {
      return {
        type: resource.type || resource.resourceType || 'unknown',
        id: resource.id || resource.resourceId || 'unknown'
      };
    }
    
    return { type: 'unknown', id: 'unknown' };
  }

  /**
   * 检查规则是否适用
   */
  private isRuleApplicable(
    rule: MonitoringRule,
    context: IsolationContext,
    resource: any,
    action: string
  ): boolean {
    try {
      // 检查规则类型
      if (rule.type === 'ACCESS' && action !== 'access') {
        return false;
      }
      
      if (rule.type === 'PERMISSION' && action !== 'permission') {
        return false;
      }
      
      if (rule.type === 'DATA' && action !== 'data') {
        return false;
      }
      
      if (rule.type === 'SECURITY' && action !== 'security') {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 评估规则
   */
  private async evaluateRule(
    rule: MonitoringRule,
    context: IsolationContext,
    resource: any,
    action: string
  ): Promise<void> {
    try {
      // 这里可以实现规则评估逻辑
      // 例如：检查访问频率、权限变更等
      
      if (rule.condition.includes('frequency')) {
        const accessKey = this.generateAccessKey(context, resource, action);
        const attempts = this.accessAttempts.get(accessKey) || 0;
        
        if (attempts > rule.threshold) {
          await this.recordSecurityEvent({
            id: this.generateSecurityEventId(),
            type: 'RULE_VIOLATION',
            severity: rule.alertLevel,
            description: `规则违反: ${rule.name}`,
            context,
            timestamp: new Date(),
            details: {
              ruleId: rule.id,
              ruleName: rule.name,
              condition: rule.condition,
              threshold: rule.threshold,
              actualValue: attempts
            }
          });
        }
      }
    } catch (error) {
      console.error('评估规则失败:', error);
    }
  }

  /**
   * 生成建议
   */
  private generateRecommendations(events: SecurityEvent[]): string[] {
    const recommendations: string[] = [];
    
    if (events.length > 0) {
      recommendations.push('建议加强访问控制策略');
      recommendations.push('建议实施多因素认证');
      recommendations.push('建议定期审查访问日志');
    }
    
    return recommendations;
  }

  /**
   * 记录访问尝试
   */
  private async logAccessAttempt(
    context: IsolationContext,
    resource: any,
    action: string
  ): Promise<void> {
    try {
      if (this.loggingService) {
        const logContext = {
          requestId: `access_${Date.now()}`,
          tenantId: context.tenantId,
          operation: 'access-monitor',
          resource: 'security-monitor',
          timestamp: new Date(),
          level: 'info' as const,
          message: `访问监控: ${action}`
        };
        
        await this.loggingService.info(logContext, `访问监控: ${action}`, {
          context,
          resource: this.getResourceInfo(resource),
          action
        });
      }
    } catch (error) {
      console.error('记录访问尝试失败:', error);
    }
  }

  /**
   * 记录到日志系统
   */
  private async logToLoggingService(event: SecurityEvent): Promise<void> {
    try {
      if (!this.loggingService) {
        return;
      }

      const logContext = {
        requestId: `security_${event.id}`,
        tenantId: event.context.tenantId,
        operation: 'security-monitor',
        resource: 'security-monitor',
        timestamp: event.timestamp,
        level: 'warn' as const,
        message: `安全事件: ${event.type}`
      };

      await this.loggingService.warn(logContext, `安全事件: ${event.type}`, event);
    } catch (error) {
      console.error('记录到日志系统失败:', error);
    }
  }

  /**
   * 保存安全事件
   */
  private async saveSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      const repository = this.databaseAdapter.getRepository(this.getSecurityEventEntityClass());
      await repository.persistAndFlush(event);
    } catch (error) {
      console.error('保存安全事件失败:', error);
    }
  }

  /**
   * 生成安全事件ID
   */
  private generateSecurityEventId(): string {
    return `security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取安全事件实体类
   */
  private getSecurityEventEntityClass(): any {
    // 这里应该返回安全事件实体类
    // 暂时返回一个占位符
    return class SecurityEventEntity {};
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
