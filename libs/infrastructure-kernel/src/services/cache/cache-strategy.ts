/**
 * 缓存策略服务
 *
 * @description 实现不同的缓存策略
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import type { ICacheStrategy } from "../../interfaces/cache-service.interface.js";

/**
 * 缓存条目信息
 */
interface CacheEntryInfo {
  key: string;
  value: any;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

/**
 * LRU缓存策略
 */
@Injectable()
export class LRUCacheStrategy implements ICacheStrategy {
  name = "LRU";
  private accessOrder: string[] = [];

  selectKeysToEvict(keys: string[], maxCount: number): string[] {
    // 按访问时间排序，选择最久未访问的键
    const sortedKeys = keys.sort((a, b) => {
      const aIndex = this.accessOrder.indexOf(a);
      const bIndex = this.accessOrder.indexOf(b);
      return aIndex - bIndex;
    });

    return sortedKeys.slice(0, maxCount);
  }

  updateAccess(key: string, timestamp: Date): void {
    // 更新访问顺序
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  getStats(): Record<string, any> {
    return {
      strategy: "LRU",
      accessOrderLength: this.accessOrder.length,
    };
  }
}

/**
 * LFU缓存策略
 */
@Injectable()
export class LFUCacheStrategy implements ICacheStrategy {
  name = "LFU";
  private accessCounts = new Map<string, number>();

  selectKeysToEvict(keys: string[], maxCount: number): string[] {
    // 按访问次数排序，选择访问次数最少的键
    const sortedKeys = keys.sort((a, b) => {
      const aCount = this.accessCounts.get(a) || 0;
      const bCount = this.accessCounts.get(b) || 0;
      return aCount - bCount;
    });

    return sortedKeys.slice(0, maxCount);
  }

  updateAccess(key: string, timestamp: Date): void {
    // 更新访问次数
    const currentCount = this.accessCounts.get(key) || 0;
    this.accessCounts.set(key, currentCount + 1);
  }

  getStats(): Record<string, any> {
    return {
      strategy: "LFU",
      accessCounts: Object.fromEntries(this.accessCounts),
    };
  }
}

/**
 * FIFO缓存策略
 */
@Injectable()
export class FIFOCacheStrategy implements ICacheStrategy {
  name = "FIFO";
  private insertionOrder: string[] = [];

  selectKeysToEvict(keys: string[], maxCount: number): string[] {
    // 按插入顺序排序，选择最先插入的键
    const sortedKeys = keys.sort((a, b) => {
      const aIndex = this.insertionOrder.indexOf(a);
      const bIndex = this.insertionOrder.indexOf(b);
      return aIndex - bIndex;
    });

    return sortedKeys.slice(0, maxCount);
  }

  updateAccess(key: string, timestamp: Date): void {
    // FIFO策略不需要更新访问信息
  }

  getStats(): Record<string, any> {
    return {
      strategy: "FIFO",
      insertionOrderLength: this.insertionOrder.length,
    };
  }
}

/**
 * TTL缓存策略
 */
@Injectable()
export class TTLCacheStrategy implements ICacheStrategy {
  name = "TTL";
  private keyTimestamps = new Map<string, number>();
  private defaultTTL = 300000; // 5分钟

  selectKeysToEvict(keys: string[], maxCount: number): string[] {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const key of keys) {
      const timestamp = this.keyTimestamps.get(key);
      if (timestamp && now - timestamp > this.defaultTTL) {
        expiredKeys.push(key);
      }
    }

    // 如果过期键不够，按时间戳排序选择最旧的键
    if (expiredKeys.length < maxCount) {
      const sortedKeys = keys
        .filter((key) => !expiredKeys.includes(key))
        .sort((a, b) => {
          const aTime = this.keyTimestamps.get(a) || 0;
          const bTime = this.keyTimestamps.get(b) || 0;
          return aTime - bTime;
        });

      const additionalKeys = sortedKeys.slice(0, maxCount - expiredKeys.length);
      expiredKeys.push(...additionalKeys);
    }

    return expiredKeys.slice(0, maxCount);
  }

  updateAccess(key: string, timestamp: Date): void {
    // 更新时间戳
    this.keyTimestamps.set(key, timestamp.getTime());
  }

  getStats(): Record<string, any> {
    return {
      strategy: "TTL",
      keyCount: this.keyTimestamps.size,
      defaultTTL: this.defaultTTL,
    };
  }
}

/**
 * 缓存策略工厂
 */
@Injectable()
export class CacheStrategyFactory {
  private strategies = new Map<string, ICacheStrategy>();

  constructor() {
    this.registerStrategy("LRU", new LRUCacheStrategy());
    this.registerStrategy("LFU", new LFUCacheStrategy());
    this.registerStrategy("FIFO", new FIFOCacheStrategy());
    this.registerStrategy("TTL", new TTLCacheStrategy());
  }

  /**
   * 注册缓存策略
   */
  registerStrategy(name: string, strategy: ICacheStrategy): void {
    this.strategies.set(name, strategy);
  }

  /**
   * 获取缓存策略
   */
  getStrategy(name: string): ICacheStrategy | undefined {
    return this.strategies.get(name);
  }

  /**
   * 获取所有策略
   */
  getAllStrategies(): Record<string, ICacheStrategy> {
    return Object.fromEntries(this.strategies);
  }

  /**
   * 创建策略实例
   */
  createStrategy(name: string): ICacheStrategy | undefined {
    const strategy = this.strategies.get(name);
    if (!strategy) {
      return undefined;
    }

    // 返回策略的副本
    switch (name) {
      case "LRU":
        return new LRUCacheStrategy();
      case "LFU":
        return new LFUCacheStrategy();
      case "FIFO":
        return new FIFOCacheStrategy();
      case "TTL":
        return new TTLCacheStrategy();
      default:
        return undefined;
    }
  }
}
