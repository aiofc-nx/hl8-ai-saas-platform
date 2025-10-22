/**
 * 基础仓储适配器
 *
 * @description 实现领域层仓储接口的基础适配器
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import type { IDatabaseAdapter } from "../../interfaces/database-adapter.interface.js";
import type { IsolationContext } from "../../types/isolation.types.js";
import type { ICacheService } from "../../interfaces/cache-service.interface.js";

/**
 * 基础仓储适配器
 */
@Injectable()
export class BaseRepositoryAdapter<T> {
  constructor(
    protected readonly databaseAdapter: IDatabaseAdapter,
    protected readonly cacheService?: ICacheService,
    protected readonly isolationContext?: IsolationContext,
  ) {}

  /**
   * 保存实体
   */
  async save(entity: T): Promise<void> {
    try {
      // 应用隔离上下文
      const isolatedEntity = this.applyIsolationContext(entity);

      // 执行数据库保存操作
      const repository = this.databaseAdapter.getRepository(entity.constructor as any);
      await (repository as { persistAndFlush(entity: unknown): Promise<void> }).persistAndFlush(isolatedEntity);

      // 更新缓存
      if (this.cacheService) {
        const cacheKey = this.generateCacheKey(entity);
        await this.cacheService.set(cacheKey, entity);
      }
    } catch (error) {
      throw new Error(
        `保存实体失败: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 根据ID查找实体
   */
  async findById(id: string): Promise<T | null> {
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
      const repository = this.databaseAdapter.getRepository(
        this.getEntityClass(),
      );
      const entity = await (repository as { findOne(conditions: unknown): Promise<unknown> }).findOne({ id } as any);

      if (entity) {
        // 应用隔离过滤
        const filteredEntity = this.applyIsolationFilter(entity as T);
        if (filteredEntity) {
          // 更新缓存
          if (this.cacheService) {
            const cacheKey = this.generateCacheKey(entity as T);
            await this.cacheService.set(cacheKey, filteredEntity as unknown);
          }
          return filteredEntity;
        }
      }

      return null;
    } catch (error) {
      throw new Error(
        `查找实体失败: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 查找所有实体
   */
  async findAll(): Promise<T[]> {
    try {
      const repository = this.databaseAdapter.getRepository(
        this.getEntityClass(),
      );
      const entities = await (repository as { findAll(): Promise<unknown[]> }).findAll();

      // 应用隔离过滤
      const filteredEntities = entities
        .map((entity) => this.applyIsolationFilter(entity as T))
        .filter((entity) => entity !== null) as T[];

      return filteredEntities;
    } catch (error) {
      throw new Error(
        `查找所有实体失败: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 根据条件查找实体
   */
  async findBy(conditions: Record<string, any>): Promise<T[]> {
    try {
      // 应用隔离条件
      const isolatedConditions = this.applyIsolationConditions(conditions);

      const repository = this.databaseAdapter.getRepository(
        this.getEntityClass(),
      );
      const entities = await (repository as { find(conditions: unknown): Promise<unknown[]> }).find(isolatedConditions);

      // 应用隔离过滤
      const filteredEntities = entities
        .map((entity) => this.applyIsolationFilter(entity as T))
        .filter((entity) => entity !== null) as T[];

      return filteredEntities;
    } catch (error) {
      throw new Error(
        `根据条件查找实体失败: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 删除实体
   */
  async delete(entity: T): Promise<void> {
    try {
      const repository = this.databaseAdapter.getRepository(
        this.getEntityClass(),
      );
      await (repository as { removeAndFlush(entity: unknown): Promise<void> }).removeAndFlush(entity);

      // 清除缓存
      if (this.cacheService) {
        const cacheKey = this.generateCacheKey(entity);
        await this.cacheService.delete(cacheKey);
      }
    } catch (error) {
      throw new Error(
        `删除实体失败: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 根据ID删除实体
   */
  async deleteById(id: string): Promise<void> {
    try {
      const repository = this.databaseAdapter.getRepository(
        this.getEntityClass(),
      );
      const entity = await (repository as { findOne(conditions: unknown): Promise<unknown> }).findOne({ id } as any);

      if (entity) {
        await (repository as { removeAndFlush(entity: unknown): Promise<void> }).removeAndFlush(entity);

        // 清除缓存
        if (this.cacheService) {
          const cacheKey = this.generateCacheKey({ id } as T);
          await this.cacheService.delete(cacheKey);
        }
      }
    } catch (error) {
      throw new Error(
        `根据ID删除实体失败: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 检查实体是否存在
   */
  async exists(id: string): Promise<boolean> {
    try {
      const entity = await this.findById(id);
      return entity !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取实体数量
   */
  async count(conditions?: Record<string, any>): Promise<number> {
    try {
      const repository = this.databaseAdapter.getRepository(
        this.getEntityClass(),
      );

      if (conditions) {
        const isolatedConditions = this.applyIsolationConditions(conditions);
        return await (repository as { count(conditions: unknown): Promise<number> }).count(isolatedConditions);
      }

      return await (repository as { count(): Promise<number> }).count();
    } catch (error) {
      throw new Error(
        `获取实体数量失败: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 应用隔离上下文
   */
  protected applyIsolationContext(entity: T): T {
    if (!this.isolationContext) {
      return entity;
    }

    // 添加隔离字段
    const isolatedEntity = { ...entity } as any;

    if (this.isolationContext.tenantId) {
      isolatedEntity.tenantId = this.isolationContext.tenantId;
    }

    if (this.isolationContext.organizationId) {
      isolatedEntity.organizationId = this.isolationContext.organizationId;
    }

    if (this.isolationContext.departmentId) {
      isolatedEntity.departmentId = this.isolationContext.departmentId;
    }

    if (this.isolationContext.userId) {
      isolatedEntity.userId = this.isolationContext.userId;
    }

    return isolatedEntity;
  }

  /**
   * 应用隔离过滤
   */
  protected applyIsolationFilter(entity: T): T | null {
    if (!this.isolationContext) {
      return entity;
    }

    const entityAny = entity as any;

    // 检查租户隔离
    if (
      this.isolationContext.tenantId &&
      entityAny.tenantId !== this.isolationContext.tenantId
    ) {
      return null;
    }

    // 检查组织隔离
    if (
      this.isolationContext.organizationId &&
      entityAny.organizationId !== this.isolationContext.organizationId
    ) {
      return null;
    }

    // 检查部门隔离
    if (
      this.isolationContext.departmentId &&
      entityAny.departmentId !== this.isolationContext.departmentId
    ) {
      return null;
    }

    // 检查用户隔离
    if (
      this.isolationContext.userId &&
      entityAny.userId !== this.isolationContext.userId
    ) {
      return null;
    }

    return entity;
  }

  /**
   * 应用隔离条件
   */
  protected applyIsolationConditions(
    conditions: Record<string, any>,
  ): Record<string, any> {
    if (!this.isolationContext) {
      return conditions;
    }

    const isolatedConditions = { ...conditions };

    if (this.isolationContext.tenantId) {
      isolatedConditions.tenantId = this.isolationContext.tenantId;
    }

    if (this.isolationContext.organizationId) {
      isolatedConditions.organizationId = this.isolationContext.organizationId;
    }

    if (this.isolationContext.departmentId) {
      isolatedConditions.departmentId = this.isolationContext.departmentId;
    }

    if (this.isolationContext.userId) {
      isolatedConditions.userId = this.isolationContext.userId;
    }

    return isolatedConditions;
  }

  /**
   * 生成缓存键
   */
  protected generateCacheKey(entity: T): string {
    const entityAny = entity as any;
    const id = entityAny.id || entityAny._id;
    const entityName = this.getEntityClass().name;

    let cacheKey = `${entityName}:${id}`;

    if (this.isolationContext) {
      cacheKey = `${this.isolationContext.tenantId}:${cacheKey}`;
    }

    return cacheKey;
  }

  /**
   * 获取实体类
   */
  protected getEntityClass(): new () => T {
    throw new Error("子类必须实现 getEntityClass 方法");
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
