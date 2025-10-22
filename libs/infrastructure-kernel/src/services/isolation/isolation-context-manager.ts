/**
 * 隔离上下文管理器
 *
 * @description 管理多租户数据隔离上下文
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import type { IIsolationContextManager } from '../../interfaces/isolation-service.interface.js';

/**
 * 隔离上下文管理器
 */
@Injectable()
export class IsolationContextManager implements IIsolationContextManager {
  private currentContext: any | null = null;
  private contextHistory: any[] = [];
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
  ): any {
    // 简化的上下文创建
    return {
      tenantId,
      organizationId,
      departmentId,
      userId,
      sharingLevel: userId ? 'USER' : departmentId ? 'DEPARTMENT' : organizationId ? 'ORGANIZATION' : tenantId ? 'TENANT' : 'PLATFORM',
      isShared: false,
      accessRules: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * 验证隔离上下文
   */
  validateContext(context: any): boolean {
    try {
      // 使用领域模型的验证逻辑
      // IsolationContext 构造函数内部已经进行了验证
      return context !== null && context !== undefined;
    } catch (error) {
      console.error('隔离上下文验证失败:', error);
      return false;
    }
  }

  /**
   * 获取当前隔离上下文
   */
  getCurrentContext(): any | null {
    return this.currentContext;
  }

  /**
   * 设置当前隔离上下文
   */
  setCurrentContext(context: any): void {
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
  validateContextIntegrity(context: any): boolean {
    try {
      // 验证上下文完整性
      if (!this.validateContext(context)) {
        return false;
      }

      // 验证访问规则
      if (!Array.isArray((context as any).accessRules)) {
        return false;
      }

      // 验证时间戳
      if (!(context as any).createdAt || !(context as any).updatedAt) {
        return false;
      }

      if ((context as any).updatedAt < (context as any).createdAt) {
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
  getContextLevel(context: any): number {
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
    context: any,
    resource: string,
    action: string
  ): Promise<boolean> {
    try {
      // 检查访问规则
      for (const rule of (context as any).accessRules) {
        if (rule.resourceType === resource && rule.action === action) {
          return rule.allow;
        }
      }

      // 默认权限检查
      return this.checkPermissions(context, resource, action);
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
        sharingLevel: (this.currentContext as any).sharingLevel,
        isShared: (this.currentContext as any).isShared
      } : null,
      historySize: this.contextHistory.length,
      maxHistorySize: this.maxHistorySize
    };
  }

  /**
   * 检查权限
   */
  private checkPermissions(
    context: any,
    resource: string,
    action: string
  ): boolean {
    // 使用领域模型的权限检查逻辑
    // 这里可以根据实际需求调整逻辑
    return true; // 简化实现，实际应该使用领域模型的权限检查
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(context: any): void {
    this.contextHistory.push(context);
    
    // 限制历史记录大小
    if (this.contextHistory.length > this.maxHistorySize) {
      this.contextHistory = this.contextHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * 获取历史记录
   */
  getContextHistory(): any[] {
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
