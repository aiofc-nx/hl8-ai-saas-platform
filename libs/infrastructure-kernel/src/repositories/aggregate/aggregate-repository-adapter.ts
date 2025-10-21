/**
 * 聚合根仓储适配器
 *
 * @description 实现聚合根的持久化，支持事件溯源
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { BaseRepositoryAdapter } from '../base/base-repository-adapter.js';
import type { IDatabaseAdapter } from '../../interfaces/database-adapter.interface.js';
import type { IsolationContext } from '../../types/isolation.types.js';
import type { ICacheService } from '../../interfaces/cache-service.interface.js';

/**
 * 聚合根仓储适配器
 */
@Injectable()
export class AggregateRepositoryAdapter<T> extends BaseRepositoryAdapter<T> {
  constructor(
    databaseAdapter: IDatabaseAdapter,
    cacheService?: ICacheService,
    isolationContext?: IsolationContext
  ) {
    super(databaseAdapter, cacheService, isolationContext);
  }

  /**
   * 保存聚合根（支持事件溯源）
   */
  async saveAggregate(aggregate: T): Promise<void> {
    try {
      // 应用隔离上下文
      const isolatedAggregate = this.applyIsolationContext(aggregate);
      
      // 获取未提交的领域事件
      const uncommittedEvents = this.getUncommittedEvents(isolatedAggregate);
      
      if (uncommittedEvents.length > 0) {
        // 在事务中保存聚合根和事件
        await this.databaseAdapter.transaction(async (em) => {
          // 保存聚合根
          const repository = em.getRepository(this.getEntityClass());
          await repository.persistAndFlush(isolatedAggregate);
          
          // 保存领域事件
          await this.saveDomainEvents(uncommittedEvents);
          
          // 标记事件为已提交
          this.markEventsAsCommitted(isolatedAggregate);
        });
      } else {
        // 没有事件，直接保存聚合根
        await this.save(isolatedAggregate);
      }
      
      // 更新缓存
      if (this.cacheService) {
        const cacheKey = this.generateCacheKey(isolatedAggregate);
        await this.cacheService.set(cacheKey, isolatedAggregate);
      }
    } catch (error) {
      throw new Error(`保存聚合根失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 根据ID获取聚合根
   */
  async getAggregateById(id: string): Promise<T | null> {
    try {
      // 尝试从缓存获取
      if (this.cacheService) {
        const cacheKey = this.generateCacheKey({ id } as T);
        const cached = await this.cacheService.get<T>(cacheKey);
        if (cached) {
          return cached;
        }
      }

      // 从数据库查询
      const repository = this.databaseAdapter.getRepository(this.getEntityClass());
      const aggregate = await repository.findOne({ id } as any);
      
      if (aggregate) {
        // 应用隔离过滤
        const filteredAggregate = this.applyIsolationFilter(aggregate);
        if (filteredAggregate) {
          // 重建聚合根状态（从事件重放）
          const reconstructedAggregate = await this.reconstructAggregateFromEvents(id);
          if (reconstructedAggregate) {
            // 更新缓存
            if (this.cacheService) {
              const cacheKey = this.generateCacheKey(reconstructedAggregate);
              await this.cacheService.set(cacheKey, reconstructedAggregate);
            }
            return reconstructedAggregate;
          }
        }
      }

      return null;
    } catch (error) {
      throw new Error(`获取聚合根失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 删除聚合根
   */
  async deleteAggregate(aggregate: T): Promise<void> {
    try {
      const aggregateAny = aggregate as any;
      const id = aggregateAny.id || aggregateAny._id;
      
      if (!id) {
        throw new Error('聚合根ID不能为空');
      }

      // 在事务中删除聚合根和相关事件
      await this.databaseAdapter.transaction(async (em) => {
        // 删除聚合根
        const repository = em.getRepository(this.getEntityClass());
        await repository.removeAndFlush(aggregate);
        
        // 删除相关事件
        await this.deleteDomainEvents(id);
      });
      
      // 清除缓存
      if (this.cacheService) {
        const cacheKey = this.generateCacheKey(aggregate);
        await this.cacheService.delete(cacheKey);
      }
    } catch (error) {
      throw new Error(`删除聚合根失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取聚合根版本
   */
  async getAggregateVersion(id: string): Promise<number> {
    try {
      const repository = this.databaseAdapter.getRepository(this.getEntityClass());
      const aggregate = await repository.findOne({ id } as any);
      
      if (aggregate) {
        const aggregateAny = aggregate as any;
        return aggregateAny.version || 0;
      }
      
      return 0;
    } catch (error) {
      throw new Error(`获取聚合根版本失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 检查聚合根是否存在
   */
  async aggregateExists(id: string): Promise<boolean> {
    try {
      const version = await this.getAggregateVersion(id);
      return version > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取未提交的领域事件
   */
  protected getUncommittedEvents(aggregate: T): any[] {
    const aggregateAny = aggregate as any;
    return aggregateAny.getUncommittedEvents ? aggregateAny.getUncommittedEvents() : [];
  }

  /**
   * 标记事件为已提交
   */
  protected markEventsAsCommitted(aggregate: T): void {
    const aggregateAny = aggregate as any;
    if (aggregateAny.markEventsAsCommitted) {
      aggregateAny.markEventsAsCommitted();
    }
  }

  /**
   * 保存领域事件
   */
  protected async saveDomainEvents(events: any[]): Promise<void> {
    try {
      for (const event of events) {
        // 这里应该调用事件存储服务
        // await this.eventStore.saveEvent(event);
        console.log('保存领域事件:', event);
      }
    } catch (error) {
      throw new Error(`保存领域事件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 删除领域事件
   */
  protected async deleteDomainEvents(aggregateId: string): Promise<void> {
    try {
      // 这里应该调用事件存储服务删除事件
      // await this.eventStore.deleteEvents(aggregateId);
      console.log('删除领域事件:', aggregateId);
    } catch (error) {
      throw new Error(`删除领域事件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 从事件重建聚合根
   */
  protected async reconstructAggregateFromEvents(aggregateId: string): Promise<T | null> {
    try {
      // 这里应该从事件存储获取所有事件并重建聚合根
      // const events = await this.eventStore.getEvents(aggregateId);
      // return this.replayEvents(events);
      console.log('从事件重建聚合根:', aggregateId);
      return null;
    } catch (error) {
      throw new Error(`重建聚合根失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 重放事件
   */
  protected replayEvents(events: any[]): T | null {
    try {
      // 这里应该实现事件重放逻辑
      // 根据事件类型和顺序重建聚合根状态
      console.log('重放事件:', events);
      return null;
    } catch (error) {
      throw new Error(`重放事件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取聚合根快照
   */
  async getAggregateSnapshot(id: string): Promise<T | null> {
    try {
      const repository = this.databaseAdapter.getRepository(this.getEntityClass());
      const snapshot = await repository.findOne({ id } as any);
      
      if (snapshot) {
        return this.applyIsolationFilter(snapshot);
      }
      
      return null;
    } catch (error) {
      throw new Error(`获取聚合根快照失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 保存聚合根快照
   */
  async saveAggregateSnapshot(aggregate: T): Promise<void> {
    try {
      await this.save(aggregate);
    } catch (error) {
      throw new Error(`保存聚合根快照失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
}
