/**
 * 事件存储适配器
 *
 * @description 实现领域事件的存储和检索，支持事件溯源
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import type { IDatabaseAdapter } from '../../interfaces/database-adapter.interface.js';
import type { IsolationContext } from '../../types/isolation.types.js';
import type { ICacheService } from '../../interfaces/cache-service.interface.js';

/**
 * 领域事件接口
 */
export interface DomainEvent {
  /** 事件ID */
  id: string;
  /** 聚合根ID */
  aggregateId: string;
  /** 事件类型 */
  eventType: string;
  /** 事件数据 */
  eventData: Record<string, any>;
  /** 事件版本 */
  version: number;
  /** 时间戳 */
  timestamp: Date;
  /** 元数据 */
  metadata?: Record<string, any>;
}

/**
 * 事件存储适配器
 */
@Injectable()
export class EventStoreAdapter {
  constructor(
    private readonly databaseAdapter: IDatabaseAdapter,
    private readonly cacheService?: ICacheService,
    private readonly isolationContext?: IsolationContext
  ) {}

  /**
   * 保存事件
   */
  async saveEvent(event: DomainEvent): Promise<void> {
    try {
      // 应用隔离上下文
      const isolatedEvent = this.applyIsolationContext(event);
      
      // 在事务中保存事件
      await this.databaseAdapter.transaction(async (em) => {
        const repository = em.getRepository(this.getEventEntityClass());
        await repository.persistAndFlush(isolatedEvent);
      });
      
      // 更新缓存
      if (this.cacheService) {
        const cacheKey = this.generateEventCacheKey(event);
        await this.cacheService.set(cacheKey, event);
      }
    } catch (error) {
      throw new Error(`保存事件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 批量保存事件
   */
  async saveEvents(events: DomainEvent[]): Promise<void> {
    try {
      if (events.length === 0) {
        return;
      }

      // 应用隔离上下文
      const isolatedEvents = events.map(event => this.applyIsolationContext(event));
      
      // 在事务中批量保存事件
      await this.databaseAdapter.transaction(async (em) => {
        const repository = em.getRepository(this.getEventEntityClass());
        await repository.persistAndFlush(isolatedEvents);
      });
      
      // 更新缓存
      if (this.cacheService) {
        for (const event of events) {
          const cacheKey = this.generateEventCacheKey(event);
          await this.cacheService.set(cacheKey, event);
        }
      }
    } catch (error) {
      throw new Error(`批量保存事件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取聚合根的所有事件
   */
  async getEvents(aggregateId: string, fromVersion?: number): Promise<DomainEvent[]> {
    try {
      // 尝试从缓存获取
      if (this.cacheService) {
        const cacheKey = this.generateAggregateCacheKey(aggregateId, fromVersion);
        const cached = await this.cacheService.get<DomainEvent[]>(cacheKey);
        if (cached) {
          return cached;
        }
      }

      // 从数据库查询
      const repository = this.databaseAdapter.getRepository(this.getEventEntityClass());
      const conditions: any = { aggregateId };
      
      if (fromVersion !== undefined) {
        conditions.version = { $gte: fromVersion };
      }
      
      // 应用隔离条件
      const isolatedConditions = this.applyIsolationConditions(conditions);
      
      const events = await repository.find(isolatedConditions, {
        orderBy: { version: 'ASC' }
      });
      
      // 应用隔离过滤
      const filteredEvents = events
        .map(event => this.applyIsolationFilter(event))
        .filter(event => event !== null) as DomainEvent[];

      // 更新缓存
      if (this.cacheService) {
        const cacheKey = this.generateAggregateCacheKey(aggregateId, fromVersion);
        await this.cacheService.set(cacheKey, filteredEvents);
      }

      return filteredEvents;
    } catch (error) {
      throw new Error(`获取事件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取事件流
   */
  async getEventStream(
    aggregateId: string,
    fromVersion?: number,
    toVersion?: number
  ): Promise<DomainEvent[]> {
    try {
      const repository = this.databaseAdapter.getRepository(this.getEventEntityClass());
      const conditions: any = { aggregateId };
      
      if (fromVersion !== undefined) {
        conditions.version = { $gte: fromVersion };
      }
      
      if (toVersion !== undefined) {
        conditions.version = { ...conditions.version, $lte: toVersion };
      }
      
      // 应用隔离条件
      const isolatedConditions = this.applyIsolationConditions(conditions);
      
      const events = await repository.find(isolatedConditions, {
        orderBy: { version: 'ASC' }
      });
      
      // 应用隔离过滤
      const filteredEvents = events
        .map(event => this.applyIsolationFilter(event))
        .filter(event => event !== null) as DomainEvent[];

      return filteredEvents;
    } catch (error) {
      throw new Error(`获取事件流失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 根据事件类型获取事件
   */
  async getEventsByType(eventType: string): Promise<DomainEvent[]> {
    try {
      const repository = this.databaseAdapter.getRepository(this.getEventEntityClass());
      const conditions = { eventType };
      
      // 应用隔离条件
      const isolatedConditions = this.applyIsolationConditions(conditions);
      
      const events = await repository.find(isolatedConditions, {
        orderBy: { timestamp: 'ASC' }
      });
      
      // 应用隔离过滤
      const filteredEvents = events
        .map(event => this.applyIsolationFilter(event))
        .filter(event => event !== null) as DomainEvent[];

      return filteredEvents;
    } catch (error) {
      throw new Error(`根据事件类型获取事件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 删除事件
   */
  async deleteEvents(aggregateId: string): Promise<void> {
    try {
      // 在事务中删除事件
      await this.databaseAdapter.transaction(async (em) => {
        const repository = em.getRepository(this.getEventEntityClass());
        await repository.nativeDelete({ aggregateId });
      });
      
      // 清除缓存
      if (this.cacheService) {
        const cacheKey = this.generateAggregateCacheKey(aggregateId);
        await this.cacheService.delete(cacheKey);
      }
    } catch (error) {
      throw new Error(`删除事件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取事件数量
   */
  async getEventCount(aggregateId: string): Promise<number> {
    try {
      const repository = this.databaseAdapter.getRepository(this.getEventEntityClass());
      const conditions = { aggregateId };
      
      // 应用隔离条件
      const isolatedConditions = this.applyIsolationConditions(conditions);
      
      return await repository.count(isolatedConditions);
    } catch (error) {
      throw new Error(`获取事件数量失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取最新事件版本
   */
  async getLatestEventVersion(aggregateId: string): Promise<number> {
    try {
      const repository = this.databaseAdapter.getRepository(this.getEventEntityClass());
      const conditions = { aggregateId };
      
      // 应用隔离条件
      const isolatedConditions = this.applyIsolationConditions(conditions);
      
      const latestEvent = await repository.findOne(isolatedConditions, {
        orderBy: { version: 'DESC' }
      });
      
      return latestEvent ? (latestEvent as any).version : 0;
    } catch (error) {
      throw new Error(`获取最新事件版本失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 检查事件是否存在
   */
  async eventExists(eventId: string): Promise<boolean> {
    try {
      const repository = this.databaseAdapter.getRepository(this.getEventEntityClass());
      const event = await repository.findOne({ id: eventId } as any);
      return event !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * 应用隔离上下文
   */
  protected applyIsolationContext(event: DomainEvent): DomainEvent {
    if (!this.isolationContext) {
      return event;
    }

    const isolatedEvent = { ...event };
    
    // 添加隔离字段到元数据
    if (!isolatedEvent.metadata) {
      isolatedEvent.metadata = {};
    }
    
    if (this.isolationContext.tenantId) {
      isolatedEvent.metadata.tenantId = this.isolationContext.tenantId;
    }
    
    if (this.isolationContext.organizationId) {
      isolatedEvent.metadata.organizationId = this.isolationContext.organizationId;
    }
    
    if (this.isolationContext.departmentId) {
      isolatedEvent.metadata.departmentId = this.isolationContext.departmentId;
    }
    
    if (this.isolationContext.userId) {
      isolatedEvent.metadata.userId = this.isolationContext.userId;
    }

    return isolatedEvent;
  }

  /**
   * 应用隔离过滤
   */
  protected applyIsolationFilter(event: any): DomainEvent | null {
    if (!this.isolationContext) {
      return event;
    }

    const metadata = event.metadata || {};
    
    // 检查租户隔离
    if (this.isolationContext.tenantId && metadata.tenantId !== this.isolationContext.tenantId) {
      return null;
    }
    
    // 检查组织隔离
    if (this.isolationContext.organizationId && metadata.organizationId !== this.isolationContext.organizationId) {
      return null;
    }
    
    // 检查部门隔离
    if (this.isolationContext.departmentId && metadata.departmentId !== this.isolationContext.departmentId) {
      return null;
    }
    
    // 检查用户隔离
    if (this.isolationContext.userId && metadata.userId !== this.isolationContext.userId) {
      return null;
    }

    return event;
  }

  /**
   * 应用隔离条件
   */
  protected applyIsolationConditions(conditions: Record<string, any>): Record<string, any> {
    if (!this.isolationContext) {
      return conditions;
    }

    const isolatedConditions = { ...conditions };
    
    // 添加隔离条件到元数据查询
    if (!isolatedConditions.metadata) {
      isolatedConditions.metadata = {};
    }
    
    if (this.isolationContext.tenantId) {
      isolatedConditions.metadata.tenantId = this.isolationContext.tenantId;
    }
    
    if (this.isolationContext.organizationId) {
      isolatedConditions.metadata.organizationId = this.isolationContext.organizationId;
    }
    
    if (this.isolationContext.departmentId) {
      isolatedConditions.metadata.departmentId = this.isolationContext.departmentId;
    }
    
    if (this.isolationContext.userId) {
      isolatedConditions.metadata.userId = this.isolationContext.userId;
    }

    return isolatedConditions;
  }

  /**
   * 生成事件缓存键
   */
  protected generateEventCacheKey(event: DomainEvent): string {
    let cacheKey = `event:${event.id}`;
    
    if (this.isolationContext) {
      cacheKey = `${this.isolationContext.tenantId}:${cacheKey}`;
    }
    
    return cacheKey;
  }

  /**
   * 生成聚合根缓存键
   */
  protected generateAggregateCacheKey(aggregateId: string, fromVersion?: number): string {
    let cacheKey = `events:${aggregateId}`;
    
    if (fromVersion !== undefined) {
      cacheKey += `:${fromVersion}`;
    }
    
    if (this.isolationContext) {
      cacheKey = `${this.isolationContext.tenantId}:${cacheKey}`;
    }
    
    return cacheKey;
  }

  /**
   * 获取事件实体类
   */
  protected getEventEntityClass(): any {
    // 这里应该返回事件实体类
    // 暂时返回一个占位符
    return class EventEntity {};
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
