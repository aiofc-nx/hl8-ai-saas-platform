/**
 * 隔离上下文管理器
 *
 * @description 管理多租户数据隔离上下文
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import type { IIsolationContextManager } from '../interfaces/isolation-service.interface.js';
import type { IsolationContext, SharingLevel } from '../types/isolation.types.js';

/**
 * 隔离上下文管理器
 */
@Injectable()
export class IsolationContextManager implements IIsolationContextManager {
  private currentContext: IsolationContext | null = null;
  private contextHistory: IsolationContext[] = [];
  private maxHistorySize = 100;

  constructor() {}

  /**
   * 创建隔离上下文
   */
  createContext(
    tenantId: string,
    organizationId?: string,
    departmentId?: string,
    userId?: string
  ): IsolationContext {
    const context: IsolationContext = {
      tenantId,
      organizationId,
      departmentId,
      userId,
      sharingLevel: this.determineSharingLevel(tenantId, organizationId, departmentId, userId),
      isShared: this.determineIsShared(tenantId, organizationId, departmentId, userId),
      accessRules: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return context;
  }

  /**
   * 验证隔离上下文
   */
  validateContext(context: IsolationContext): boolean {
    try {
      // 验证必需字段
      if (!context.tenantId || context.tenantId.trim().length === 0) {
        return false;
      }

      // 验证层级关系
      if (context.organizationId && !context.tenantId) {
        return false;
      }

      if (context.departmentId && !context.organizationId) {
        return false;
      }

      if (context.userId && !context.departmentId) {
        return false;
      }

      // 验证共享级别
      if (!this.isValidSharingLevel(context.sharingLevel)) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取当前隔离上下文
   */
  getCurrentContext(): IsolationContext | null {
    return this.currentContext;
  }

  /**
   * 设置当前隔离上下文
   */
  setCurrentContext(context: IsolationContext): void {
    if (!this.validateContext(context)) {
      throw new Error('无效的隔离上下文');
    }

    // 保存到历史记录
    if (this.currentContext) {
      this.addToHistory(this.currentContext);
    }

    this.currentContext = context;
  }

  /**
   * 清除当前隔离上下文
   */
  clearCurrentContext(): void {
    if (this.currentContext) {
      this.addToHistory(this.currentContext);
    }
    this.currentContext = null;
  }

  /**
   * 验证隔离上下文完整性
   */
  validateContextIntegrity(context: IsolationContext): boolean {
    try {
      // 验证上下文完整性
      if (!this.validateContext(context)) {
        return false;
      }

      // 验证访问规则
      if (!Array.isArray(context.accessRules)) {
        return false;
      }

      // 验证时间戳
      if (!context.createdAt || !context.updatedAt) {
        return false;
      }

      if (context.updatedAt < context.createdAt) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取隔离上下文层级
   */
  getContextLevel(context: IsolationContext): number {
    let level = 0;
    
    if (context.tenantId) level++;
    if (context.organizationId) level++;
    if (context.departmentId) level++;
    if (context.userId) level++;
    
    return level;
  }

  /**
   * 检查上下文权限
   */
  async checkContextPermissions(
    context: IsolationContext,
    resource: string,
    action: string
  ): Promise<boolean> {
    try {
      // 检查访问规则
      for (const rule of context.accessRules) {
        if (rule.resourceType === resource && rule.action === action) {
          return rule.allow;
        }
      }

      // 默认权限检查
      return this.checkDefaultPermissions(context, resource, action);
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取上下文统计
   */
  async getContextStats(): Promise<Record<string, any>> {
    return {
      currentContext: this.currentContext ? {
        tenantId: this.currentContext.tenantId,
        organizationId: this.currentContext.organizationId,
        departmentId: this.currentContext.departmentId,
        userId: this.currentContext.userId,
        sharingLevel: this.currentContext.sharingLevel,
        isShared: this.currentContext.isShared
      } : null,
      historySize: this.contextHistory.length,
      maxHistorySize: this.maxHistorySize
    };
  }

  /**
   * 确定共享级别
   */
  private determineSharingLevel(
    tenantId: string,
    organizationId?: string,
    departmentId?: string,
    userId?: string
  ): SharingLevel {
    if (userId) return 'USER';
    if (departmentId) return 'DEPARTMENT';
    if (organizationId) return 'ORGANIZATION';
    if (tenantId) return 'TENANT';
    return 'PLATFORM';
  }

  /**
   * 确定是否共享
   */
  private determineIsShared(
    tenantId: string,
    organizationId?: string,
    departmentId?: string,
    userId?: string
  ): boolean {
    // 根据业务规则确定是否共享
    // 这里可以根据实际需求调整逻辑
    return false;
  }

  /**
   * 验证共享级别
   */
  private isValidSharingLevel(level: SharingLevel): boolean {
    const validLevels: SharingLevel[] = ['PLATFORM', 'TENANT', 'ORGANIZATION', 'DEPARTMENT', 'USER'];
    return validLevels.includes(level);
  }

  /**
   * 检查默认权限
   */
  private checkDefaultPermissions(
    context: IsolationContext,
    resource: string,
    action: string
  ): boolean {
    // 根据共享级别和资源类型确定默认权限
    switch (context.sharingLevel) {
      case 'PLATFORM':
        return true; // 平台级别通常有所有权限
      case 'TENANT':
        return resource.startsWith('tenant:');
      case 'ORGANIZATION':
        return resource.startsWith('org:') || resource.startsWith('tenant:');
      case 'DEPARTMENT':
        return resource.startsWith('dept:') || resource.startsWith('org:') || resource.startsWith('tenant:');
      case 'USER':
        return resource.startsWith('user:') || resource.startsWith('dept:') || resource.startsWith('org:') || resource.startsWith('tenant:');
      default:
        return false;
    }
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(context: IsolationContext): void {
    this.contextHistory.push(context);
    
    // 限制历史记录大小
    if (this.contextHistory.length > this.maxHistorySize) {
      this.contextHistory = this.contextHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * 获取历史记录
   */
  getContextHistory(): IsolationContext[] {
    return [...this.contextHistory];
  }

  /**
   * 清除历史记录
   */
  clearContextHistory(): void {
    this.contextHistory = [];
  }

  /**
   * 设置最大历史记录大小
   */
  setMaxHistorySize(size: number): void {
    this.maxHistorySize = Math.max(0, size);
    
    // 如果当前历史记录超过新的大小，截取
    if (this.contextHistory.length > this.maxHistorySize) {
      this.contextHistory = this.contextHistory.slice(-this.maxHistorySize);
    }
  }
}
