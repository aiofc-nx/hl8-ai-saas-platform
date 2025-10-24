import { Injectable } from "@nestjs/common";
import { CacheService, IsolationContext } from "@hl8/caching";
import { TenantId } from "../../domain/entities/tenant.entity.js";

/**
 * 缓存服务适配器
 * 
 * @description 基于@hl8/caching的缓存服务实现，支持多租户隔离
 * @since 1.0.0
 */
@Injectable()
export class CacheServiceAdapter {
  constructor(private readonly cacheService: CacheService) {}

  /**
   * 获取缓存值
   * 
   * @param key - 缓存键
   * @param isolationContext - 隔离上下文
   * @returns 缓存值
   */
  async get<T>(
    key: string,
    isolationContext?: IsolationContext
  ): Promise<T | null> {
    return this.cacheService.get<T>(key, isolationContext);
  }

  /**
   * 设置缓存值
   * 
   * @param key - 缓存键
   * @param value - 缓存值
   * @param ttl - 生存时间（秒）
   * @param isolationContext - 隔离上下文
   */
  async set<T>(
    key: string,
    value: T,
    ttl?: number,
    isolationContext?: IsolationContext
  ): Promise<void> {
    await this.cacheService.set(key, value, ttl, isolationContext);
  }

  /**
   * 删除缓存
   * 
   * @param key - 缓存键
   * @param isolationContext - 隔离上下文
   */
  async delete(
    key: string,
    isolationContext?: IsolationContext
  ): Promise<void> {
    await this.cacheService.delete(key, isolationContext);
  }

  /**
   * 检查缓存是否存在
   * 
   * @param key - 缓存键
   * @param isolationContext - 隔离上下文
   * @returns 是否存在
   */
  async exists(
    key: string,
    isolationContext?: IsolationContext
  ): Promise<boolean> {
    return this.cacheService.exists(key, isolationContext);
  }

  /**
   * 获取或设置缓存
   * 
   * @param key - 缓存键
   * @param factory - 值工厂函数
   * @param ttl - 生存时间（秒）
   * @param isolationContext - 隔离上下文
   * @returns 缓存值
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
    isolationContext?: IsolationContext
  ): Promise<T> {
    return this.cacheService.getOrSet(key, factory, ttl, isolationContext);
  }

  /**
   * 批量获取缓存
   * 
   * @param keys - 缓存键数组
   * @param isolationContext - 隔离上下文
   * @returns 缓存值映射
   */
  async mget<T>(
    keys: string[],
    isolationContext?: IsolationContext
  ): Promise<Record<string, T | null>> {
    return this.cacheService.mget<T>(keys, isolationContext);
  }

  /**
   * 批量设置缓存
   * 
   * @param values - 缓存值映射
   * @param ttl - 生存时间（秒）
   * @param isolationContext - 隔离上下文
   */
  async mset<T>(
    values: Record<string, T>,
    ttl?: number,
    isolationContext?: IsolationContext
  ): Promise<void> {
    await this.cacheService.mset(values, ttl, isolationContext);
  }

  /**
   * 清空缓存
   * 
   * @param pattern - 键模式
   * @param isolationContext - 隔离上下文
   */
  async clear(
    pattern?: string,
    isolationContext?: IsolationContext
  ): Promise<void> {
    await this.cacheService.clear(pattern, isolationContext);
  }

  /**
   * 获取缓存统计信息
   * 
   * @param isolationContext - 隔离上下文
   * @returns 统计信息
   */
  async getStats(isolationContext?: IsolationContext) {
    return this.cacheService.getStats(isolationContext);
  }

  /**
   * 创建租户隔离上下文
   * 
   * @param tenantId - 租户ID
   * @returns 隔离上下文
   */
  createTenantContext(tenantId: TenantId): IsolationContext {
    return {
      tenantId: tenantId.toString(),
    };
  }

  /**
   * 创建组织隔离上下文
   * 
   * @param tenantId - 租户ID
   * @param organizationId - 组织ID
   * @returns 隔离上下文
   */
  createOrganizationContext(
    tenantId: TenantId,
    organizationId: string
  ): IsolationContext {
    return {
      tenantId: tenantId.toString(),
      organizationId,
    };
  }

  /**
   * 创建部门隔离上下文
   * 
   * @param tenantId - 租户ID
   * @param organizationId - 组织ID
   * @param departmentId - 部门ID
   * @returns 隔离上下文
   */
  createDepartmentContext(
    tenantId: TenantId,
    organizationId: string,
    departmentId: string
  ): IsolationContext {
    return {
      tenantId: tenantId.toString(),
      organizationId,
      departmentId,
    };
  }

  /**
   * 创建用户隔离上下文
   * 
   * @param tenantId - 租户ID
   * @param organizationId - 组织ID
   * @param departmentId - 部门ID
   * @param userId - 用户ID
   * @returns 隔离上下文
   */
  createUserContext(
    tenantId: TenantId,
    organizationId: string,
    departmentId: string,
    userId: string
  ): IsolationContext {
    return {
      tenantId: tenantId.toString(),
      organizationId,
      departmentId,
      userId,
    };
  }

  /**
   * 缓存租户信息
   * 
   * @param tenantId - 租户ID
   * @param tenantData - 租户数据
   * @param ttl - 生存时间（秒）
   */
  async cacheTenant(
    tenantId: TenantId,
    tenantData: unknown,
    ttl: number = 3600
  ): Promise<void> {
    const key = `tenant:${tenantId}`;
    const context = this.createTenantContext(tenantId);
    await this.set(key, tenantData, ttl, context);
  }

  /**
   * 获取租户缓存
   * 
   * @param tenantId - 租户ID
   * @returns 租户数据
   */
  async getTenantCache<T>(tenantId: TenantId): Promise<T | null> {
    const key = `tenant:${tenantId}`;
    const context = this.createTenantContext(tenantId);
    return this.get<T>(key, context);
  }

  /**
   * 清除租户缓存
   * 
   * @param tenantId - 租户ID
   */
  async clearTenantCache(tenantId: TenantId): Promise<void> {
    const pattern = `tenant:${tenantId}:*`;
    const context = this.createTenantContext(tenantId);
    await this.clear(pattern, context);
  }

  /**
   * 缓存用户会话
   * 
   * @param sessionId - 会话ID
   * @param sessionData - 会话数据
   * @param ttl - 生存时间（秒）
   */
  async cacheSession(
    sessionId: string,
    sessionData: unknown,
    ttl: number = 1800
  ): Promise<void> {
    const key = `session:${sessionId}`;
    await this.set(key, sessionData, ttl);
  }

  /**
   * 获取用户会话
   * 
   * @param sessionId - 会话ID
   * @returns 会话数据
   */
  async getSession<T>(sessionId: string): Promise<T | null> {
    const key = `session:${sessionId}`;
    return this.get<T>(key);
  }

  /**
   * 清除用户会话
   * 
   * @param sessionId - 会话ID
   */
  async clearSession(sessionId: string): Promise<void> {
    const key = `session:${sessionId}`;
    await this.delete(key);
  }
}
