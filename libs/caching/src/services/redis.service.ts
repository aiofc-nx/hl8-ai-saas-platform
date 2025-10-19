/**
 * 简化的 Redis 服务
 *
 * @description 提供简单直接的 Redis 连接管理，替代复杂的连接处理
 *
 * @since 1.0.0
 */

import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import Redis from "ioredis";
import { RedisConnectionError } from "../exceptions/cache.exceptions.js";
import type { SimplifiedRedisOptions } from "../types/cache.types.js";

/**
 * 简化的 Redis 服务
 *
 * @description 提供简单直接的 Redis 连接管理
 */
@Injectable()
export class SimplifiedRedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SimplifiedRedisService.name);
  private client: any = null;
  private isConnected = false;

  constructor(private readonly options: SimplifiedRedisOptions) {}

  /**
   * 模块初始化
   *
   * @description 创建 Redis 连接
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.createConnection();
      this.logger.log("Redis 连接已建立");
    } catch (error) {
      this.logger.error("Redis 连接失败", error);
      throw new RedisConnectionError(
        `无法连接到 Redis: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined,
        { options: this.options },
      );
    }
  }

  /**
   * 模块销毁
   *
   * @description 关闭 Redis 连接
   */
  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
      this.logger.log("Redis 连接已关闭");
    }
  }

  /**
   * 获取 Redis 客户端
   *
   * @description 获取 Redis 客户端实例
   *
   * @returns Redis 客户端
   *
   * @throws {RedisConnectionError} 如果客户端未连接
   *
   * @example
   * ```typescript
   * const redis = redisService.getClient();
   * await redis.set('key', 'value');
   * ```
   */
  getClient(): any {
    if (!this.client || !this.isConnected) {
      throw new RedisConnectionError("Redis 客户端未连接");
    }
    return this.client;
  }

  /**
   * 健康检查
   *
   * @description 检查 Redis 连接是否健康
   *
   * @returns 如果连接健康返回 true，否则返回 false
   *
   * @example
   * ```typescript
   * const isHealthy = await redisService.healthCheck();
   * if (!isHealthy) {
   *   console.log('Redis 连接不健康');
   * }
   * ```
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.client || !this.isConnected) {
        return false;
      }

      const result = await this.client.ping();
      return result === "PONG";
    } catch (error) {
      this.logger.warn("Redis 健康检查失败", error);
      return false;
    }
  }

  /**
   * 检查客户端是否已连接
   *
   * @description 检查 Redis 客户端是否已连接
   *
   * @returns 如果已连接返回 true，否则返回 false
   *
   * @example
   * ```typescript
   * if (redisService.isClientConnected()) {
   *   // 可以安全使用 Redis 客户端
   * }
   * ```
   */
  isClientConnected(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * 创建 Redis 连接
   *
   * @description 创建新的 Redis 连接
   *
   * @private
   */
  private async createConnection(): Promise<void> {
    const redisOptions: Redis.RedisOptions = {
      host: this.options.host,
      port: this.options.port,
      password: this.options.password,
      db: this.options.db ?? 0,
      connectTimeout: this.options.connectTimeout ?? 10000,
      commandTimeout: this.options.commandTimeout ?? 5000,
      retryStrategy: this.options.retryStrategy ?? this.defaultRetryStrategy,
      lazyConnect: true,
    };

    const Redis = await import("ioredis");
    this.client = new (Redis as any).default(redisOptions);

    // 设置事件监听器
    this.setupEventListeners();

    // 连接 Redis
    await this.client.connect();
    this.isConnected = true;
  }

  /**
   * 设置事件监听器
   *
   * @description 设置 Redis 连接事件监听器
   *
   * @private
   */
  private setupEventListeners(): void {
    if (!this.client) return;

    this.client.on("connect", () => {
      this.logger.log("Redis 连接已建立");
      this.isConnected = true;
    });

    this.client.on("ready", () => {
      this.logger.log("Redis 客户端已准备就绪");
    });

    this.client.on("error", (error) => {
      this.logger.error("Redis 连接错误", error);
      this.isConnected = false;
    });

    this.client.on("close", () => {
      this.logger.warn("Redis 连接已关闭");
      this.isConnected = false;
    });

    this.client.on("reconnecting", () => {
      this.logger.log("Redis 正在重新连接");
    });

    this.client.on("end", () => {
      this.logger.log("Redis 连接已结束");
      this.isConnected = false;
    });
  }

  /**
   * 默认重试策略
   *
   * @description 提供简单的重试策略
   *
   * @param times - 重试次数
   * @returns 重试延迟（毫秒）或 null（停止重试）
   * @private
   */
  private defaultRetryStrategy(times: number): number | null {
    // 最多重试 3 次，每次延迟递增
    if (times > 3) {
      return null;
    }

    // 重试延迟：1秒、2秒、4秒
    return Math.min(1000 * Math.pow(2, times - 1), 4000);
  }

  /**
   * 重新连接
   *
   * @description 重新建立 Redis 连接
   *
   * @returns 如果重连成功返回 true，否则返回 false
   *
   * @example
   * ```typescript
   * const reconnected = await redisService.reconnect();
   * if (reconnected) {
   *   console.log('Redis 重连成功');
   * }
   * ```
   */
  async reconnect(): Promise<boolean> {
    try {
      if (this.client) {
        await this.client.quit();
      }

      await this.createConnection();
      this.logger.log("Redis 重连成功");
      return true;
    } catch (error) {
      this.logger.error("Redis 重连失败", error);
      return false;
    }
  }

  /**
   * 获取连接信息
   *
   * @description 获取当前连接信息
   *
   * @returns 连接信息
   *
   * @example
   * ```typescript
   * const info = redisService.getConnectionInfo();
   * console.log(`连接到 ${info.host}:${info.port}`);
   * ```
   */
  getConnectionInfo(): {
    host: string;
    port: number;
    db: number;
    connected: boolean;
  } {
    return {
      host: this.options.host,
      port: this.options.port,
      db: this.options.db ?? 0,
      connected: this.isConnected,
    };
  }
}
