/**
 * 缓存服务接口
 *
 * @description 定义缓存服务的通用接口
 * @since 1.0.0
 */

import type { CacheService, CacheStats, CacheClearOptions, CacheClearResult } from '../types/cache.types.js';

/**
 * 缓存服务接口
 */
export interface ICacheService extends CacheService {
  /** 获取缓存统计信息 */
  getStats(): Promise<CacheStats>;
  
  /** 清理缓存 */
  clearByOptions(options: CacheClearOptions): Promise<CacheClearResult>;
  
  /** 预热缓存 */
  warmup(keys: string[]): Promise<void>;
  
  /** 获取缓存大小 */
  getSize(): Promise<number>;
  
  /** 获取内存使用情况 */
  getMemoryUsage(): Promise<number>;
  
  /** 设置缓存策略 */
  setStrategy(strategy: string): Promise<void>;
  
  /** 获取缓存策略 */
  getStrategy(): Promise<string>;
}

/**
 * Redis缓存服务接口
 */
export interface IRedisCacheService extends ICacheService {
  /** 执行Redis命令 */
  executeCommand(command: string, ...args: any[]): Promise<any>;
  
  /** 发布消息 */
  publish(channel: string, message: any): Promise<number>;
  
  /** 订阅消息 */
  subscribe(channel: string, callback: (message: any) => void): Promise<void>;
  
  /** 取消订阅 */
  unsubscribe(channel: string): Promise<void>;
  
  /** 获取Redis信息 */
  getRedisInfo(): Promise<Record<string, any>>;
  
  /** 执行Lua脚本 */
  executeScript(script: string, keys: string[], args: any[]): Promise<any>;
}

/**
 * 内存缓存服务接口
 */
export interface IMemoryCacheService extends ICacheService {
  /** 设置最大内存限制 */
  setMaxMemory(maxMemory: number): void;
  
  /** 获取当前内存使用 */
  getCurrentMemoryUsage(): number;
  
  /** 清理过期缓存 */
  cleanupExpired(): Promise<number>;
  
  /** 获取缓存命中率 */
  getHitRate(): number;
  
  /** 重置统计信息 */
  resetStats(): void;
}

/**
 * 缓存策略接口
 */
export interface ICacheStrategy {
  /** 策略名称 */
  name: string;
  
  /** 选择要删除的键 */
  selectKeysToEvict(keys: string[], maxCount: number): string[];
  
  /** 更新访问信息 */
  updateAccess(key: string, timestamp: Date): void;
  
  /** 获取策略统计 */
  getStats(): Record<string, any>;
}

/**
 * 缓存管理器接口
 */
export interface ICacheManager {
  /** 注册缓存服务 */
  registerService(name: string, service: ICacheService): void;
  
  /** 获取缓存服务 */
  getService(name: string): ICacheService;
  
  /** 获取所有服务 */
  getAllServices(): Record<string, ICacheService>;
  
  /** 健康检查 */
  healthCheck(): Promise<Record<string, boolean>>;
  
  /** 关闭所有服务 */
  closeAll(): Promise<void>;
}
