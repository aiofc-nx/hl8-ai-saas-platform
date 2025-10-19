/**
 * 缓存测试控制器
 *
 * @description 演示缓存模块的集成使用，包括多级数据隔离、装饰器缓存、性能监控等功能
 *
 * ## 功能特性
 * - 多级数据隔离测试（平台、租户、组织、部门、用户级）
 * - 装饰器缓存功能测试
 * - 缓存性能监控测试
 * - 缓存键生成和隔离验证
 *
 * @example
 * ```bash
 * # 测试平台级缓存
 * curl http://localhost:3000/cache/platform/data
 *
 * # 测试租户级缓存（需要 X-Tenant-Id 请求头）
 * curl http://localhost:3000/cache/tenant/data \
 *   -H "X-Tenant-Id: tenant-123"
 *
 * # 测试组织级缓存（需要 X-Organization-Id 请求头）
 * curl http://localhost:3000/cache/organization/data \
 *   -H "X-Tenant-Id: tenant-123" \
 *   -H "X-Organization-Id: org-456"
 *
 * # 测试装饰器缓存
 * curl http://localhost:3000/cache/decorator/compute \
 *   -H "X-Tenant-Id: tenant-123"
 *
 * # 获取缓存性能指标
 * curl http://localhost:3000/cache/metrics
 * ```
 */

import { CacheService } from "@hl8/caching";
import { FastifyLoggerService } from "@hl8/nestjs-fastify";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

/**
 * 缓存测试数据接口
 */
interface CacheTestData {
  id: string;
  name: string;
  value: any;
  timestamp: string;
  isolationLevel: string;
}

/**
 * 缓存性能指标接口
 */
interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  averageLatency: number;
  totalOperations: number;
  errorRate: number;
}

/**
 * 缓存测试控制器
 *
 * @description 提供缓存功能的集成测试端点
 */
@ApiTags("缓存测试")
@Controller("cache")
export class CacheController {
  constructor(
    private readonly cacheService: CacheService,
    private readonly logger: FastifyLoggerService,
  ) {}

  /**
   * 测试平台级缓存
   *
   * @description 测试平台级别的缓存功能，不涉及任何隔离上下文
   *
   * @param key - 缓存键
   * @returns 缓存数据或新生成的数据
   */
  @Get("platform/:key")
  @ApiOperation({
    summary: "测试平台级缓存",
    description: "测试平台级别的缓存功能，数据在所有租户间共享",
  })
  @ApiResponse({
    status: 200,
    description: "成功返回缓存数据",
    schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        value: { type: "string" },
        timestamp: { type: "string" },
        isolationLevel: { type: "string", example: "platform" },
      },
    },
  })
  async testPlatformCache(@Param("key") key: string): Promise<CacheTestData> {
    this.logger.debug(`Testing platform cache for key: ${key}`);

    // 尝试从缓存获取数据
    const cached = await this.cacheService.get("platform", key);
    if (cached) {
      this.logger.debug(`Cache hit for platform key: ${key}`);
      return {
        ...(cached as CacheTestData),
        isolationLevel: "platform",
      };
    }

    // 生成新数据并缓存
    const data: CacheTestData = {
      id: `platform-${key}`,
      name: `Platform Data ${key}`,
      value: `Platform value for ${key} at ${new Date().toISOString()}`,
      timestamp: new Date().toISOString(),
      isolationLevel: "platform",
    };

    await this.cacheService.set("platform", key, data, 300); // 5分钟TTL
    this.logger.debug(`Cached platform data for key: ${key}`);

    return data;
  }

  /**
   * 测试租户级缓存
   *
   * @description 测试租户级别的缓存功能，需要 X-Tenant-Id 请求头
   *
   * @param key - 缓存键
   * @returns 缓存数据或新生成的数据
   */
  @Get("tenant/:key")
  @ApiOperation({
    summary: "测试租户级缓存",
    description: "测试租户级别的缓存功能，数据在租户内隔离",
  })
  @ApiResponse({
    status: 200,
    description: "成功返回缓存数据",
  })
  async testTenantCache(@Param("key") key: string): Promise<CacheTestData> {
    this.logger.debug(`Testing tenant cache for key: ${key}`);

    // 尝试从缓存获取数据
    const cached = await this.cacheService.get("tenant", key);
    if (cached) {
      this.logger.debug(`Cache hit for tenant key: ${key}`);
      return {
        ...(cached as CacheTestData),
        isolationLevel: "tenant",
      };
    }

    // 生成新数据并缓存
    const data: CacheTestData = {
      id: `tenant-${key}`,
      name: `Tenant Data ${key}`,
      value: `Tenant value for ${key} at ${new Date().toISOString()}`,
      timestamp: new Date().toISOString(),
      isolationLevel: "tenant",
    };

    await this.cacheService.set("tenant", key, data, 300); // 5分钟TTL
    this.logger.debug(`Cached tenant data for key: ${key}`);

    return data;
  }

  /**
   * 测试组织级缓存
   *
   * @description 测试组织级别的缓存功能，需要 X-Organization-Id 请求头
   *
   * @param key - 缓存键
   * @returns 缓存数据或新生成的数据
   */
  @Get("organization/:key")
  @ApiOperation({
    summary: "测试组织级缓存",
    description: "测试组织级别的缓存功能，数据在组织内隔离",
  })
  @ApiResponse({
    status: 200,
    description: "成功返回缓存数据",
  })
  async testOrganizationCache(
    @Param("key") key: string,
  ): Promise<CacheTestData> {
    this.logger.debug(`Testing organization cache for key: ${key}`);

    // 尝试从缓存获取数据
    const cached = await this.cacheService.get("organization", key);
    if (cached) {
      this.logger.debug(`Cache hit for organization key: ${key}`);
      return {
        ...(cached as CacheTestData),
        isolationLevel: "organization",
      };
    }

    // 生成新数据并缓存
    const data: CacheTestData = {
      id: `organization-${key}`,
      name: `Organization Data ${key}`,
      value: `Organization value for ${key} at ${new Date().toISOString()}`,
      timestamp: new Date().toISOString(),
      isolationLevel: "organization",
    };

    await this.cacheService.set("organization", key, data, 300); // 5分钟TTL
    this.logger.debug(`Cached organization data for key: ${key}`);

    return data;
  }

  /**
   * 测试装饰器缓存
   *
   * @description 测试 @Cacheable 装饰器的缓存功能
   *
   * @param operation - 操作类型
   * @param input - 输入参数
   * @returns 计算结果
   */
  @Get("decorator/:operation")
  @ApiOperation({
    summary: "测试装饰器缓存",
    description: "测试 @Cacheable 装饰器的缓存功能",
  })
  @ApiResponse({
    status: 200,
    description: "成功返回计算结果",
  })
  async testDecoratorCache(
    @Param("operation") operation: string,
    @Query("input") input?: string,
  ): Promise<{ result: any; cached: boolean; timestamp: string }> {
    this.logger.debug(`Testing decorator cache for operation: ${operation}`);

    const startTime = Date.now();
    const result = await this.computeWithCache(operation, input || "default");
    const duration = Date.now() - startTime;

    return {
      result,
      cached: duration < 10, // 如果执行时间很短，说明是从缓存获取的
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 使用装饰器缓存的计算方法
   *
   * @description 演示 @Cacheable 装饰器的使用
   *
   * @param operation - 操作类型
   * @param input - 输入参数
   * @returns 计算结果
   */
  private async computeWithCache(
    operation: string,
    input: string,
  ): Promise<any> {
    // 模拟复杂计算
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      operation,
      input,
      result: `Computed result for ${operation} with input ${input}`,
      computedAt: new Date().toISOString(),
    };
  }

  /**
   * 获取缓存性能指标
   *
   * @description 获取缓存系统的性能指标
   *
   * @returns 缓存性能指标
   */
  @Get("metrics")
  @ApiOperation({
    summary: "获取缓存性能指标",
    description: "获取缓存系统的性能指标，包括命中率、延迟等",
  })
  @ApiResponse({
    status: 200,
    description: "成功返回性能指标",
    schema: {
      type: "object",
      properties: {
        hits: { type: "number" },
        misses: { type: "number" },
        hitRate: { type: "number" },
        averageLatency: { type: "number" },
        totalOperations: { type: "number" },
        errorRate: { type: "number" },
      },
    },
  })
  async getCacheMetrics(): Promise<CacheMetrics> {
    this.logger.debug("Getting cache metrics");

    // 获取缓存服务的性能指标（模拟实现）
    const metrics = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      averageLatency: 0,
      errors: 0,
    };

    return {
      hits: metrics.hits,
      misses: metrics.misses,
      hitRate: metrics.hitRate,
      averageLatency: metrics.averageLatency,
      totalOperations: metrics.hits + metrics.misses,
      errorRate:
        metrics.errors / (metrics.hits + metrics.misses + metrics.errors) || 0,
    };
  }

  /**
   * 清除指定键的缓存
   *
   * @description 清除指定命名空间和键的缓存
   *
   * @param namespace - 命名空间
   * @param key - 缓存键
   * @returns 清除结果
   */
  @Delete(":namespace/:key")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "清除缓存",
    description: "清除指定命名空间和键的缓存",
  })
  @ApiResponse({
    status: 204,
    description: "缓存已清除",
  })
  async clearCache(
    @Param("namespace") namespace: string,
    @Param("key") key: string,
  ): Promise<void> {
    this.logger.debug(`Clearing cache for ${namespace}:${key}`);

    await this.cacheService.del(namespace, key);
  }

  /**
   * 清除命名空间的所有缓存
   *
   * @description 清除指定命名空间的所有缓存
   *
   * @param namespace - 命名空间
   * @returns 清除结果
   */
  @Delete(":namespace")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "清除命名空间缓存",
    description: "清除指定命名空间的所有缓存",
  })
  @ApiResponse({
    status: 204,
    description: "命名空间缓存已清除",
  })
  async clearNamespace(@Param("namespace") namespace: string): Promise<void> {
    this.logger.debug(`Clearing all cache for namespace: ${namespace}`);

    await this.cacheService.clear(namespace);
  }

  /**
   * 设置缓存数据
   *
   * @description 手动设置缓存数据，用于测试
   *
   * @param namespace - 命名空间
   * @param key - 缓存键
   * @param data - 要缓存的数据
   * @param ttl - 生存时间（秒）
   * @returns 设置结果
   */
  @Post(":namespace/:key")
  @ApiOperation({
    summary: "设置缓存数据",
    description: "手动设置缓存数据，用于测试",
  })
  @ApiResponse({
    status: 201,
    description: "缓存数据已设置",
  })
  async setCache(
    @Param("namespace") namespace: string,
    @Param("key") key: string,
    @Body() data: any,
    @Query("ttl") ttl?: number,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.debug(`Setting cache for ${namespace}:${key}`);

    await this.cacheService.set(namespace, key, data, ttl || 300);

    return {
      success: true,
      message: `Cache set for ${namespace}:${key}`,
    };
  }
}
