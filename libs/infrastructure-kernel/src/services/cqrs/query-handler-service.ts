/**
 * 查询处理器服务
 *
 * @description 处理CQRS模式中的查询操作
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import type { IDatabaseAdapter } from "../../interfaces/database-adapter.interface.js";
import type { IsolationContext } from "../../types/isolation.types.js";
import type { ICacheService } from "../../interfaces/cache-service.interface.js";
import type { BaseQuery } from "@hl8/application-kernel";

/**
 * 查询接口
 */
export interface Query {
  /** 查询ID */
  id: string;
  /** 查询类型 */
  type: string;
  /** 查询参数 */
  params: Record<string, unknown>;
  /** 过滤条件 */
  filters?: Record<string, unknown>;
  /** 排序字段 */
  orderBy?: string;
  /** 排序方向 */
  orderDirection?: "ASC" | "DESC";
  /** 限制数量 */
  limit?: number;
  /** 偏移量 */
  offset?: number;
  /** 时间戳 */
  timestamp: Date;
  /** 用户ID */
  userId?: string;
  /** 租户ID */
  tenantId?: string;
}

/**
 * 查询结果
 */
export interface QueryResult<T = unknown> {
  /** 是否成功 */
  success: boolean;
  /** 返回数据 */
  data?: T;
  /** 总数 */
  total?: number;
  /** 页码 */
  page?: number;
  /** 页大小 */
  pageSize?: number;
  /** 错误信息 */
  _error?: string;
  /** 执行时间(毫秒) */
  executionTime: number;
  /** 查询ID */
  queryId: string;
}

/**
 * 查询处理器接口
 */
export interface QueryHandler<TQuery extends Query = Query, TResult = unknown> {
  /** 处理查询 */
  handle(query: TQuery): Promise<QueryResult<TResult>>;
  /** 验证查询 */
  validate(query: TQuery): Promise<boolean>;
  /** 获取处理器名称 */
  getHandlerName(): string;
}

/**
 * 查询处理器服务
 */
@Injectable()
export class QueryHandlerService {
  private handlers = new Map<string, QueryHandler>();
  private queryCache = new Map<string, unknown>();
  private cacheConfig = {
    enabled: true,
    ttl: 300000, // 5分钟
    maxSize: 1000,
  };

  constructor(
    private readonly databaseAdapter: IDatabaseAdapter,
    private readonly cacheService?: ICacheService,
    private readonly isolationContext?: IsolationContext,
  ) {}

  /**
   * 注册查询处理器
   */
  registerHandler(queryType: string, handler: QueryHandler): void {
    this.handlers.set(queryType, handler);
  }

  /**
   * 处理查询
   */
  async handleQuery<T = unknown>(query: Query): Promise<QueryResult<T>> {
    const startTime = Date.now();

    try {
      // 应用隔离上下文
      const isolatedQuery = this.applyIsolationContext(query);

      // 检查缓存
      if (this.cacheConfig.enabled) {
        const cacheKey = this.generateCacheKey(isolatedQuery);
        const cached = await this.getCachedResult(cacheKey);
        if (cached) {
          return {
            ...cached,
            executionTime: Date.now() - startTime,
            queryId: query.id,
          } as QueryResult<T>;
        }
      }

      // 获取处理器
      const handler = this.handlers.get(query.type);
      if (!handler) {
        throw new Error(`未找到查询处理器: ${query.type}`);
      }

      // 验证查询
      const isValid = await handler.validate(isolatedQuery);
      if (!isValid) {
        throw new Error(`查询验证失败: ${query.type}`);
      }

      // 执行查询
      const result = await handler.handle(isolatedQuery);

      // 更新执行时间
      result.executionTime = Date.now() - startTime;
      result.queryId = query.id;

      // 缓存结果
      if (this.cacheConfig.enabled && result.success) {
        await this.cacheResult(isolatedQuery, result);
      }

      // 记录查询执行日志
      await this.logQueryExecution(query, result);

      return result as QueryResult<T>;
    } catch (_error) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        _error: _error instanceof Error ? _error.message : "查询处理失败",
        executionTime,
        queryId: query.id,
      };
    }
  }

  /**
   * 批量处理查询
   */
  async handleQueries(queries: Query[]): Promise<QueryResult[]> {
    const results: QueryResult[] = [];

    for (const query of queries) {
      try {
        const result = await this.handleQuery(query);
        results.push(result);
      } catch (_error) {
        results.push({
          success: false,
          _error: _error instanceof Error ? _error.message : "查询处理失败",
          executionTime: 0,
          queryId: query.id,
        });
      }
    }

    return results;
  }

  /**
   * 设置缓存配置
   */
  setCacheConfig(config: Partial<typeof this.cacheConfig>): void {
    this.cacheConfig = { ...this.cacheConfig, ...config };
  }

  /**
   * 清除查询缓存
   */
  clearCache(): void {
    this.queryCache.clear();
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): Record<string, unknown> {
    return {
      cacheSize: this.queryCache.size,
      maxSize: this.cacheConfig.maxSize,
      ttl: this.cacheConfig.ttl,
      enabled: this.cacheConfig.enabled,
    };
  }

  /**
   * 获取注册的处理器
   */
  getRegisteredHandlers(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * 移除查询处理器
   */
  removeHandler(queryType: string): void {
    this.handlers.delete(queryType);
  }

  /**
   * 应用隔离上下文
   */
  private applyIsolationContext(query: Query): Query {
    if (!this.isolationContext) {
      return query;
    }

    const isolatedQuery = { ...query };

    if (this.isolationContext.tenantId) {
      isolatedQuery.tenantId = this.isolationContext.tenantId;
    }

    if (this.isolationContext.userId) {
      isolatedQuery.userId = this.isolationContext.userId;
    }

    // 添加隔离过滤条件
    if (!isolatedQuery.filters) {
      isolatedQuery.filters = {};
    }

    if (this.isolationContext.tenantId) {
      isolatedQuery.filters.tenantId = this.isolationContext.tenantId;
    }

    if (this.isolationContext.organizationId) {
      isolatedQuery.filters.organizationId =
        this.isolationContext.organizationId;
    }

    if (this.isolationContext.departmentId) {
      isolatedQuery.filters.departmentId = this.isolationContext.departmentId;
    }

    if (this.isolationContext.userId) {
      isolatedQuery.filters.userId = this.isolationContext.userId;
    }

    return isolatedQuery;
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(query: Query): string {
    const keyData = {
      type: query.type,
      params: query.params,
      filters: query.filters,
      orderBy: query.orderBy,
      orderDirection: query.orderDirection,
      limit: query.limit,
      offset: query.offset,
    };

    let cacheKey = `query:${JSON.stringify(keyData)}`;

    if (this.isolationContext) {
      cacheKey = `${this.isolationContext.tenantId}:${cacheKey}`;
    }

    return cacheKey;
  }

  /**
   * 获取缓存结果
   */
  private async getCachedResult(cacheKey: string): Promise<QueryResult | null> {
    try {
      // 首先检查内存缓存
      if (this.queryCache.has(cacheKey)) {
        const cached = this.queryCache.get(cacheKey) as
          | { timestamp: number; result: unknown }
          | undefined;
        if (cached && Date.now() - cached.timestamp < this.cacheConfig.ttl) {
          return cached.result as QueryResult;
        } else {
          this.queryCache.delete(cacheKey);
        }
      }

      // 检查外部缓存服务
      if (this.cacheService) {
        const cached = await this.cacheService.get<QueryResult>(cacheKey);
        if (cached) {
          return cached;
        }
      }

      return null;
    } catch (_error) {
      return null;
    }
  }

  /**
   * 缓存结果
   */
  private async cacheResult(query: Query, result: QueryResult): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(query);
      const cacheData = {
        result,
        timestamp: Date.now(),
      };

      // 存储到内存缓存
      if (this.queryCache.size >= this.cacheConfig.maxSize) {
        // 清理最旧的缓存
        const oldestKey = this.queryCache.keys().next().value;
        this.queryCache.delete(oldestKey);
      }

      this.queryCache.set(cacheKey, cacheData);

      // 存储到外部缓存服务
      if (this.cacheService) {
        await this.cacheService.set(cacheKey, result, {
          ttl: this.cacheConfig.ttl / 1000, // 转换为秒
        });
      }
    } catch (_error) {
      console.error("缓存查询结果失败:", _error);
    }
  }

  /**
   * 记录查询执行日志
   */
  private async logQueryExecution(
    query: Query,
    result: QueryResult,
  ): Promise<void> {
    try {
      const logData = {
        queryId: query.id,
        queryType: query.type,
        success: result.success,
        executionTime: result.executionTime,
        timestamp: new Date(),
        userId: query.userId,
        tenantId: query.tenantId,
      };

      // 这里应该记录到日志系统
      console.log("查询执行日志:", logData);
    } catch (_error) {
      console.error("记录查询执行日志失败:", _error);
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      return await this.databaseAdapter.healthCheck();
    } catch (_error) {
      return false;
    }
  }
}
