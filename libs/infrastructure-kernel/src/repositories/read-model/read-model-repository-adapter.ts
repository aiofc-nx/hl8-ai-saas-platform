/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 读模型仓储适配器
 *
 * @description 实现读模型的持久化和查询，支持CQRS模式
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { BaseRepositoryAdapter } from "../base/base-repository-adapter.js";
import type { IDatabaseAdapter } from "../../interfaces/database-adapter.interface.js";
import type { IsolationContext } from "../../types/isolation.types.js";
import type { ICacheService } from "../../interfaces/cache-service.interface.js";
import type { BaseQuery } from "@hl8/application-kernel";

/**
 * 读模型查询选项
 */
export interface ReadModelQueryOptions {
  /** 限制数量 */
  limit?: number;
  /** 偏移量 */
  offset?: number;
  /** 排序字段 */
  orderBy?: string;
  /** 排序方向 */
  orderDirection?: "ASC" | "DESC";
  /** 过滤条件 */
  where?: Record<string, any>; // 符合宪章 IX：动态查询条件，支持任意键值对
  /** 包含字段 */
  select?: string[];
  /** 关联查询 */
  include?: string[];
}

/**
 * 读模型仓储适配器
 */
@Injectable()
export class ReadModelRepositoryAdapter<T> extends BaseRepositoryAdapter<T> {
  constructor(
    databaseAdapter: IDatabaseAdapter,
    cacheService?: ICacheService,
    isolationContext?: IsolationContext,
  ) {
    super(databaseAdapter, cacheService, isolationContext);
  }

  /**
   * 根据查询对象查找读模型
   */
  async findByQuery(query: BaseQuery): Promise<T[]> {
    try {
      // 应用隔离上下文
      const isolatedQuery = this.applyIsolationContext(query);

      // 构建查询条件
      const conditions = this.buildQueryConditions(isolatedQuery);

      // 执行查询
      const repository = this.databaseAdapter.getRepository(
        this.getEntityClass(),
      );
      const results = await (
        repository as {
          find(conditions: unknown, options?: unknown): Promise<unknown[]>;
        }
      ).find(conditions, {
        limit: (query as { limit?: number }).limit,
        offset: (query as { offset?: number }).offset,
        orderBy: (
          query as unknown as { orderBy?: string; orderDirection?: string }
        ).orderBy
          ? {
              [(query as unknown as { orderBy: string }).orderBy]:
                (query as unknown as { orderDirection?: string })
                  .orderDirection || "ASC",
            }
          : undefined,
      });

      // 应用隔离过滤
      const filteredResults = (results as unknown[])
        .map((result) => this.applyIsolationFilter(result as T))
        .filter((result) => result !== null) as T[];

      return filteredResults;
    } catch (error) {
      throw new Error(
        `根据查询对象查找读模型失败: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 根据ID查找读模型
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
      const result = await (
        repository as { findOne(conditions: unknown): Promise<unknown> }
      ).findOne({ id } as { id: string });

      if (result) {
        // 应用隔离过滤
        const filteredResult = this.applyIsolationFilter(result as T);
        if (filteredResult) {
          // 更新缓存
          if (this.cacheService) {
            const cacheKey = this.generateCacheKey(result as T);
            await this.cacheService.set(cacheKey, filteredResult as unknown);
          }
          return filteredResult;
        }
      }

      return null;
    } catch (error) {
      throw new Error(
        `根据ID查找读模型失败: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 根据条件查找读模型
   */
  async findBy(conditions: Record<string, any>): Promise<T[]> {
    // 符合宪章 IX：动态查询条件，支持任意键值对
    try {
      // 应用隔离条件
      const isolatedConditions = this.applyIsolationConditions(conditions);

      const repository = this.databaseAdapter.getRepository(
        this.getEntityClass(),
      );
      const results = await (
        repository as { find(conditions: unknown): Promise<unknown[]> }
      ).find(isolatedConditions);

      // 应用隔离过滤
      const filteredResults = (results as unknown[])
        .map((result) => this.applyIsolationFilter(result as T))
        .filter((result) => result !== null) as T[];

      return filteredResults;
    } catch (error) {
      throw new Error(
        `根据条件查找读模型失败: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 分页查询读模型
   */
  async findWithPagination(
    conditions: Record<string, any>, // 符合宪章 IX：动态查询条件，支持任意键值对
    page: number,
    pageSize: number,
  ): Promise<{ data: T[]; total: number; page: number; pageSize: number }> {
    try {
      // 应用隔离条件
      const isolatedConditions = this.applyIsolationConditions(conditions);

      const repository = this.databaseAdapter.getRepository(
        this.getEntityClass(),
      );

      // 获取总数
      const total = await (
        repository as { count(conditions: unknown): Promise<number> }
      ).count(isolatedConditions);

      // 获取分页数据
      const results = await (
        repository as {
          find(conditions: unknown, options?: unknown): Promise<unknown[]>;
        }
      ).find(isolatedConditions, {
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });

      // 应用隔离过滤
      const filteredResults = (results as unknown[])
        .map((result) => this.applyIsolationFilter(result as T))
        .filter((result) => result !== null) as T[];

      return {
        data: filteredResults,
        total,
        page,
        pageSize,
      };
    } catch (error) {
      throw new Error(
        `分页查询读模型失败: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 搜索读模型
   */
  async search(
    searchTerm: string,
    fields: string[],
    options?: ReadModelQueryOptions,
  ): Promise<T[]> {
    try {
      // 构建搜索条件
      const searchConditions = this.buildSearchConditions(searchTerm, fields);

      // 应用隔离条件
      const isolatedConditions =
        this.applyIsolationConditions(searchConditions);

      const repository = this.databaseAdapter.getRepository(
        this.getEntityClass(),
      );
      const results = await (
        repository as {
          find(conditions: unknown, options?: unknown): Promise<unknown[]>;
        }
      ).find(isolatedConditions, {
        limit: options?.limit,
        offset: options?.offset,
        orderBy: options?.orderBy
          ? { [options.orderBy]: options.orderDirection || "ASC" }
          : undefined,
      });

      // 应用隔离过滤
      const filteredResults = (results as unknown[])
        .map((result) => this.applyIsolationFilter(result as T))
        .filter((result) => result !== null) as T[];

      return filteredResults;
    } catch (error) {
      throw new Error(
        `搜索读模型失败: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 聚合查询
   */
  async aggregate(pipeline: any[]): Promise<any[]> {
    // 符合宪章 IX：MongoDB 聚合管道，支持任意操作符和阶段
    try {
      // 应用隔离条件到管道
      const isolatedPipeline = this.applyIsolationToPipeline(pipeline);

      const repository = this.databaseAdapter.getRepository(
        this.getEntityClass(),
      );
      const results = await (
        repository as { aggregate(pipeline: unknown): Promise<unknown[]> }
      ).aggregate(isolatedPipeline);

      return results;
    } catch (error) {
      throw new Error(
        `聚合查询失败: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 获取读模型统计信息
   */
  async getStatistics(): Promise<Record<string, any>> {
    // 符合宪章 IX：统计结果类型，支持任意统计指标
    try {
      const repository = this.databaseAdapter.getRepository(
        this.getEntityClass(),
      );

      // 获取基本统计
      const total = await (repository as { count(): Promise<number> }).count();

      // 获取按字段分组的统计
      const groupBy = await (
        repository as { aggregate(pipeline: unknown): Promise<unknown[]> }
      ).aggregate([{ $group: { _id: null, count: { $sum: 1 } } }]);

      return {
        total,
        groupBy,
      };
    } catch (error) {
      throw new Error(
        `获取读模型统计信息失败: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 构建查询条件
   */
  protected buildQueryConditions(query: BaseQuery): Record<string, any> {
    // 符合宪章 IX：动态查询条件构建，支持任意键值对
    const conditions: Record<string, any> = {}; // 符合宪章 IX：动态查询条件，支持任意键值对

    // 添加查询参数
    if ((query as unknown as { params?: Record<string, unknown> }).params) {
      Object.assign(
        conditions,
        (query as unknown as { params: Record<string, unknown> }).params,
      );
    }

    // 添加过滤条件
    if ((query as unknown as { filters?: Record<string, unknown> }).filters) {
      Object.assign(
        conditions,
        (query as unknown as { filters: Record<string, unknown> }).filters,
      );
    }

    return conditions;
  }

  /**
   * 构建搜索条件
   */
  protected buildSearchConditions(
    searchTerm: string,
    fields: string[],
  ): Record<string, any> {
    // 符合宪章 IX：动态搜索条件构建，支持任意键值对
    const conditions: Record<string, any> = {}; // 符合宪章 IX：动态搜索条件，支持任意键值对

    // 构建文本搜索条件
    const searchConditions = fields.map((field) => ({
      [field]: { $regex: searchTerm, $options: "i" },
    }));

    if (searchConditions.length > 0) {
      conditions.$or = searchConditions;
    }

    return conditions;
  }

  /**
   * 应用隔离上下文到实体
   */
  protected applyIsolationContext(entity: any): any {
    // 符合宪章 IX：实体隔离处理，支持任意实体类型
    if (!this.isolationContext) {
      return entity;
    }

    const isolatedEntity = { ...entity } as any; // 符合宪章 IX：实体隔离处理，支持任意实体类型

    // 添加隔离参数
    if (!isolatedEntity.params) {
      isolatedEntity.params = {};
    }

    if (this.isolationContext.tenantId) {
      isolatedEntity.params.tenantId = this.isolationContext.tenantId;
    }

    if (this.isolationContext.organizationId) {
      isolatedEntity.params.organizationId =
        this.isolationContext.organizationId;
    }

    if (this.isolationContext.departmentId) {
      isolatedEntity.params.departmentId = this.isolationContext.departmentId;
    }

    if (this.isolationContext.userId) {
      isolatedEntity.params.userId = this.isolationContext.userId;
    }

    return isolatedEntity;
  }

  /**
   * 应用隔离条件到聚合管道
   */
  protected applyIsolationToPipeline(pipeline: any[]): any[] {
    // 符合宪章 IX：MongoDB 聚合管道处理，支持任意操作符和阶段
    if (!this.isolationContext) {
      return pipeline;
    }

    const isolatedPipeline = [...pipeline];

    // 在管道开始添加匹配阶段
    const matchStage: any = {}; // 符合宪章 IX：MongoDB 匹配阶段，支持任意查询条件

    if (this.isolationContext.tenantId) {
      matchStage.tenantId = this.isolationContext.tenantId;
    }

    if (this.isolationContext.organizationId) {
      matchStage.organizationId = this.isolationContext.organizationId;
    }

    if (this.isolationContext.departmentId) {
      matchStage.departmentId = this.isolationContext.departmentId;
    }

    if (this.isolationContext.userId) {
      matchStage.userId = this.isolationContext.userId;
    }

    if (Object.keys(matchStage).length > 0) {
      isolatedPipeline.unshift({ $match: matchStage });
    }

    return isolatedPipeline;
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
