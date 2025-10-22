/**
 * 缓存类型定义
 *
 * @description 定义缓存相关的类型和接口
 * @since 1.0.0
 */

import type { IsolationContext } from "./isolation.types.js";

/**
 * 缓存条目接口
 */
export interface CacheEntry {
  /** 缓存键 */
  key: string;
  /** 缓存值 */
  value: unknown;
  /** 生存时间(秒) */
  ttl: number;
  /** 创建时间 */
  createdAt: Date;
  /** 过期时间 */
  expiresAt: Date;
  /** 访问次数 */
  accessCount: number;
  /** 最后访问时间 */
  lastAccessed: Date;
  /** 标签列表 */
  tags: string[];
  /** 隔离上下文 */
  isolationContext: IsolationContext;
}

/**
 * 缓存策略类型
 */
export type CacheStrategy = "LRU" | "LFU" | "FIFO" | "TTL";

/**
 * 缓存配置接口
 */
export interface CacheConfig {
  /** 缓存键前缀 */
  keyPrefix: string;
  /** 默认TTL(秒) */
  defaultTtl: number;
  /** 最大缓存大小(字节) */
  maxSize: number;
  /** 缓存策略 */
  strategy: CacheStrategy;
  /** 是否启用压缩 */
  enableCompression: boolean;
  /** 是否启用序列化 */
  enableSerialization: boolean;
}

/**
 * 缓存服务接口
 */
export interface CacheService {
  /** 设置缓存 */
  set(key: string, value: unknown, options?: CacheSetOptions): Promise<void>;
  /** 获取缓存 */
  get<T = unknown>(key: string): Promise<T | null>;
  /** 批量获取缓存 */
  mget<T = unknown>(keys: string[]): Promise<Record<string, T | null>>;
  /** 删除缓存 */
  delete(key: string): Promise<void>;
  /** 批量删除缓存 */
  mdelete(keys: string[]): Promise<void>;
  /** 清除缓存 */
  clear(pattern?: string): Promise<void>;
  /** 检查缓存是否存在 */
  exists(key: string): Promise<boolean>;
  /** 获取缓存TTL */
  ttl(key: string): Promise<number>;
  /** 设置缓存TTL */
  expire(key: string, ttl: number): Promise<void>;
  /** 健康检查 */
  healthCheck(): Promise<boolean>;
}

/**
 * 缓存设置选项
 */
export interface CacheSetOptions {
  /** 生存时间(秒) */
  ttl?: number;
  /** 标签列表 */
  tags?: string[];
  /** 是否覆盖现有值 */
  overwrite?: boolean;
  /** 隔离上下文 */
  isolationContext?: IsolationContext;
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  /** 命中率 */
  hitRate: number;
  /** 未命中率 */
  missRate: number;
  /** 总条目数 */
  totalEntries: number;
  /** 内存使用量(字节) */
  memoryUsage: number;
  /** 平均响应时间(毫秒) */
  averageResponseTime: number;
  /** 热门键统计 */
  topKeys: CacheKeyStats[];
}

/**
 * 缓存键统计
 */
export interface CacheKeyStats {
  /** 缓存键 */
  key: string;
  /** 访问次数 */
  accessCount: number;
  /** 最后访问时间 */
  lastAccessed: Date;
  /** 大小(字节) */
  size: number;
}

/**
 * 缓存清理选项
 */
export interface CacheClearOptions {
  /** 租户ID */
  tenantId?: string;
  /** 组织ID */
  organizationId?: string;
  /** 部门ID */
  departmentId?: string;
  /** 用户ID */
  userId?: string;
  /** 标签列表 */
  tags?: string[];
  /** 键模式匹配 */
  pattern?: string;
}

/**
 * 缓存清理结果
 */
export interface CacheClearResult {
  /** 清理的条目数量 */
  clearedCount: number;
  /** 操作结果消息 */
  message: string;
  /** 详细信息 */
  details?: Record<string, unknown>;
}
