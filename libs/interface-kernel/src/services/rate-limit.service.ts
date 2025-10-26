/**
 * @fileoverview 速率限制服务
 * @description 提供请求速率限制功能，防止API滥用和DDoS攻击
 */

import { Injectable } from "@nestjs/common";
import { FastifyLoggerService } from "@hl8/nestjs-fastify";
import type {
  RateLimitConfig,
  InterfaceFastifyRequest,
} from "../types/index.js";

/**
 * 速率限制记录接口
 */
interface RateLimitRecord {
  count: number;
  resetTime: number;
  blocked: boolean;
}

/**
 * 速率限制服务
 * @description 提供请求速率限制相关功能
 */
@Injectable()
export class RateLimitService {
  private readonly rateLimitStore: Map<string, RateLimitRecord> = new Map();
  private readonly globalConfig: RateLimitConfig;
  private readonly endpointConfigs: Map<string, RateLimitConfig> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(private readonly logger: FastifyLoggerService) {
    this.logger.log("Rate Limit Service initialized");

    // 默认全局配置
    this.globalConfig = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      message: "Too many requests",
    };

    this.initializeDefaultConfigurations();
  }

  /**
   * 检查速率限制
   * @description 检查请求是否超过速率限制
   * @param request 请求对象
   * @param endpoint 端点路径
   * @returns 速率限制检查结果
   */
  async checkRateLimit(
    request: InterfaceFastifyRequest,
    endpoint?: string,
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    total: number;
    message?: string;
  }> {
    try {
      const key = this.generateRateLimitKey(request, endpoint);
      const config = this.getEndpointConfigPrivate(endpoint);

      const now = Date.now();
      const record = this.rateLimitStore.get(key);

      if (!record) {
        // 创建新记录
        const newRecord = {
          count: 1,
          resetTime: now + config.windowMs,
          blocked: false,
        };
        this.rateLimitStore.set(key, newRecord);
        return {
          allowed: true,
          remaining: config.max - 1,
          resetTime: newRecord.resetTime,
          total: config.max,
        };
      }

      // 检查是否需要重置
      if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + config.windowMs;
        record.blocked = false;
        return {
          allowed: true,
          remaining: config.max - 1,
          resetTime: record.resetTime,
          total: config.max,
        };
      }

      // 检查是否超过限制
      if (record.count >= config.max) {
        record.blocked = true;
        this.logger.warn(`Rate limit exceeded for key: ${key}`);
        return {
          allowed: false,
          remaining: 0,
          resetTime: record.resetTime,
          total: config.max,
          message: "Rate limit exceeded",
        };
      }

      // 增加计数
      record.count++;
      return {
        allowed: true,
        remaining: config.max - record.count,
        resetTime: record.resetTime,
        total: config.max,
      };
    } catch (error) {
      this.logger.error(
        `Rate limit check failed: ${error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)}`,
      );
      // 在错误情况下允许请求
      return {
        allowed: true,
        remaining: 999,
        resetTime: Date.now() + 60000,
        total: 1000,
      };
    }
  }

  /**
   * 生成速率限制键
   * @description 生成唯一的速率限制键
   * @param request 请求对象
   * @param endpoint 端点路径
   * @returns 速率限制键
   */
  private generateRateLimitKey(
    request: InterfaceFastifyRequest,
    endpoint?: string,
  ): string {
    const clientIp = this.getClientIp(request);
    const tenantId = request.tenantId || "default";
    const endpointKey =
      endpoint ||
      ((request as unknown as Record<string, unknown>).routerPath as string) ||
      request.url ||
      "unknown";

    return `${tenantId}:${endpointKey}:${clientIp}`;
  }

  /**
   * 获取客户端IP
   * @description 从请求中提取客户端IP地址
   * @param request 请求对象
   * @returns 客户端IP地址
   */
  private getClientIp(request: InterfaceFastifyRequest): string {
    // 优先从代理头获取IP
    const forwardedFor = request.headers?.["x-forwarded-for"] as string;
    if (forwardedFor) {
      return forwardedFor.split(",")[0]?.trim() || "unknown";
    }

    const realIP = request.headers?.["x-real-ip"] as string;
    if (realIP) {
      return realIP;
    }

    // 从socket获取IP
    const socket = (request as unknown as Record<string, unknown>)
      .socket as Record<string, unknown>;
    if (socket?.remoteAddress) {
      return socket.remoteAddress as string;
    }

    return "unknown";
  }

  /**
   * 获取客户端IP（别名方法，用于测试）
   * @description 从请求中提取客户端IP地址的别名方法
   * @param request 请求对象
   * @returns 客户端IP地址
   */
  private getClientIP(request: InterfaceFastifyRequest): string {
    return this.getClientIp(request);
  }

  /**
   * 生成键（别名方法，用于测试）
   * @description 生成速率限制键的别名方法
   * @param request 请求对象
   * @param endpoint 端点路径
   * @returns 速率限制键
   */
  private generateKey(
    request: InterfaceFastifyRequest,
    endpoint?: string,
  ): string {
    return this.generateRateLimitKey(request, endpoint);
  }

  /**
   * 获取端点配置（私有方法）
   * @description 获取指定端点的速率限制配置
   * @param endpoint 端点路径
   * @returns 速率限制配置
   */
  private getEndpointConfigPrivate(endpoint?: string): RateLimitConfig {
    if (endpoint && this.endpointConfigs.has(endpoint)) {
      return this.endpointConfigs.get(endpoint)!;
    }
    return this.globalConfig;
  }

  /**
   * 设置端点配置
   * @description 为特定端点设置速率限制配置
   * @param endpoint 端点路径
   * @param config 速率限制配置
   */
  setEndpointConfig(endpoint: string, config: RateLimitConfig): void {
    try {
      this.endpointConfigs.set(endpoint, config);
      this.logger.debug(`Set rate limit config for endpoint: ${endpoint}`);
    } catch (error) {
      this.logger.error(
        `Failed to set endpoint config: ${error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)}`,
      );
    }
  }

  /**
   * 移除端点配置
   * @description 移除特定端点的速率限制配置
   * @param endpoint 端点路径
   */
  removeEndpointConfig(endpoint: string): void {
    try {
      this.endpointConfigs.delete(endpoint);
      this.logger.debug(`Removed rate limit config for endpoint: ${endpoint}`);
    } catch (error) {
      this.logger.error(
        `Failed to remove endpoint config: ${error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)}`,
      );
    }
  }

  /**
   * 获取端点配置
   * @description 获取特定端点的速率限制配置
   * @param endpoint 端点路径
   * @returns 速率限制配置或undefined
   */
  getEndpointConfig(endpoint: string): RateLimitConfig | undefined {
    return this.endpointConfigs.get(endpoint);
  }

  /**
   * 重置速率限制
   * @description 重置指定键的速率限制记录
   * @param key 速率限制键
   */
  resetRateLimit(key: string): void {
    try {
      this.rateLimitStore.delete(key);
      this.logger.debug(`Reset rate limit for key: ${key}`);
    } catch (error) {
      this.logger.error(
        `Failed to reset rate limit: ${error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)}`,
      );
    }
  }

  /**
   * 获取速率限制状态
   * @description 获取指定键的速率限制状态
   * @param key 速率限制键
   * @returns 速率限制状态
   */
  getRateLimitStatus(key: string): RateLimitRecord | undefined {
    return this.rateLimitStore.get(key);
  }

  /**
   * 清理过期记录
   * @description 清理过期的速率限制记录
   */
  cleanupExpiredRecords(): void {
    try {
      const now = Date.now();
      let cleanedCount = 0;

      for (const [key, record] of this.rateLimitStore.entries()) {
        if (now > record.resetTime) {
          this.rateLimitStore.delete(key);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        this.logger.debug(
          `Cleaned up ${cleanedCount} expired rate limit records`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to cleanup expired records: ${error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)}`,
      );
    }
  }

  /**
   * 获取统计信息
   * @description 获取速率限制服务的统计信息
   * @returns 统计信息
   */
  getStatistics(): Record<string, unknown> {
    try {
      const now = Date.now();
      let activeRecords = 0;
      let blockedRecords = 0;

      for (const record of this.rateLimitStore.values()) {
        if (now <= record.resetTime) {
          activeRecords++;
          if (record.blocked) {
            blockedRecords++;
          }
        }
      }

      return {
        totalRecords: this.rateLimitStore.size,
        activeRecords,
        blockedRecords,
        endpoints: Array.from(this.endpointConfigs.keys()),
      };
    } catch (error) {
      this.logger.error(
        `Failed to get statistics: ${error instanceof Error ? error.message : String(error)}`,
      );
      return {};
    }
  }

  /**
   * 初始化默认配置
   * @description 初始化默认的端点配置
   */
  private initializeDefaultConfigurations(): void {
    try {
      // 认证端点配置
      this.setEndpointConfig("/api/v1/auth/login", {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5,
        message: "Too many login attempts",
      });

      this.setEndpointConfig("/api/v1/auth/register", {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 3,
        message: "Too many registration attempts",
      });

      this.setEndpointConfig("/api/v1/auth/reset-password", {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 2,
        message: "Too many password reset attempts",
      });

      // REST API 配置
      this.setEndpointConfig("/api/v1/rest", {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 200,
        message: "Too many API requests",
      });

      // GraphQL API 配置
      this.setEndpointConfig("/api/v1/graphql", {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100,
        message: "Too many GraphQL requests",
      });

      this.logger.debug("Default rate limit configurations initialized");
    } catch (error) {
      this.logger.error(
        `Failed to initialize default configurations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 启动清理任务
   * @description 启动定期清理过期记录的任务
   */
  startCleanupTask(): void {
    try {
      // 每5分钟清理一次过期记录
      this.cleanupInterval = setInterval(
        () => {
          this.cleanupExpiredRecords();
        },
        5 * 60 * 1000,
      );

      this.logger.debug("Rate limit cleanup task started");
    } catch (error) {
      this.logger.error(
        `Failed to start cleanup task: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 清理资源
   * @description 清理定时器和资源，用于测试环境
   */
  cleanup(): void {
    try {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
        this.logger.debug("Rate limit cleanup task stopped");
      }
    } catch (error) {
      this.logger.error(
        `Failed to cleanup rate limit service: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 销毁服务
   * @description 销毁服务时清理资源
   */
  onDestroy(): void {
    this.cleanup();
  }
}
