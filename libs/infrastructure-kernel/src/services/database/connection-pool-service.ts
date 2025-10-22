/**
 * 连接池服务
 *
 * @description 管理数据库连接池，优化连接性能
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import type { IDatabaseConnectionManager } from "../../interfaces/database-adapter.interface.js";
import type { IsolationContext } from "../../types/isolation.types.js";

/**
 * 连接池配置
 */
export interface ConnectionPoolConfig {
  /** 最小连接数 */
  minConnections: number;
  /** 最大连接数 */
  maxConnections: number;
  /** 连接超时时间(毫秒) */
  connectionTimeout: number;
  /** 空闲超时时间(毫秒) */
  idleTimeout: number;
  /** 连接验证间隔(毫秒) */
  validationInterval: number;
  /** 是否启用连接池 */
  enabled: boolean;
}

/**
 * 连接池统计信息
 */
export interface ConnectionPoolStats {
  /** 总连接数 */
  totalConnections: number;
  /** 活跃连接数 */
  activeConnections: number;
  /** 空闲连接数 */
  idleConnections: number;
  /** 等待连接数 */
  waitingConnections: number;
  /** 连接池使用率 */
  utilizationRate: number;
  /** 平均响应时间(毫秒) */
  averageResponseTime: number;
  /** 连接错误数 */
  connectionErrors: number;
}

/**
 * 连接池服务
 */
@Injectable()
export class ConnectionPoolService {
  private poolConfigs = new Map<string, ConnectionPoolConfig>();
  private poolStats = new Map<string, ConnectionPoolStats>();
  private validationTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly connectionManager: IDatabaseConnectionManager,
    private readonly isolationContext?: IsolationContext,
  ) {}

  /**
   * 配置连接池
   */
  configurePool(connectionName: string, config: ConnectionPoolConfig): void {
    this.poolConfigs.set(connectionName, config);
    this.initializePoolStats(connectionName);

    if (config.enabled) {
      this.startValidationTimer(connectionName);
    }
  }

  /**
   * 获取连接池配置
   */
  getPoolConfig(connectionName: string): ConnectionPoolConfig | undefined {
    return this.poolConfigs.get(connectionName);
  }

  /**
   * 获取连接池统计信息
   */
  getPoolStats(connectionName: string): ConnectionPoolStats | undefined {
    return this.poolStats.get(connectionName);
  }

  /**
   * 获取所有连接池统计信息
   */
  getAllPoolStats(): Record<string, ConnectionPoolStats> {
    const stats: Record<string, ConnectionPoolStats> = {};

    for (const [name, stat] of this.poolStats.entries()) {
      stats[name] = stat;
    }

    return stats;
  }

  /**
   * 预热连接池
   */
  async warmupPool(connectionName: string): Promise<void> {
    try {
      const config = this.poolConfigs.get(connectionName);
      if (!config || !config.enabled) {
        return;
      }

      const minConnections = config.minConnections;
      const promises: Promise<void>[] = [];

      for (let i = 0; i < minConnections; i++) {
        promises.push(this.createConnection(connectionName));
      }

      await Promise.all(promises);
    } catch (error) {
      throw new Error(
        `预热连接池失败: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 清理空闲连接
   */
  async cleanupIdleConnections(connectionName: string): Promise<void> {
    try {
      const config = this.poolConfigs.get(connectionName);
      if (!config || !config.enabled) {
        return;
      }

      const stats = this.poolStats.get(connectionName);
      if (!stats) {
        return;
      }

      const idleConnections = stats.idleConnections;
      const excessConnections = idleConnections - config.minConnections;

      if (excessConnections > 0) {
        // 清理多余的空闲连接
        for (let i = 0; i < excessConnections; i++) {
          await this.closeIdleConnection(connectionName);
        }
      }
    } catch (error) {
      throw new Error(
        `清理空闲连接失败: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 验证连接池健康状态
   */
  async validatePoolHealth(connectionName: string): Promise<boolean> {
    try {
      const config = this.poolConfigs.get(connectionName);
      if (!config || !config.enabled) {
        return true;
      }

      const stats = this.poolStats.get(connectionName);
      if (!stats) {
        return false;
      }

      // 检查连接池使用率
      const utilizationRate = stats.utilizationRate;
      if (utilizationRate > 0.9) {
        console.warn(`连接池 ${connectionName} 使用率过高: ${utilizationRate}`);
        return false;
      }

      // 检查连接错误数
      if (stats.connectionErrors > 10) {
        console.warn(
          `连接池 ${connectionName} 错误数过多: ${stats.connectionErrors}`,
        );
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 调整连接池大小
   */
  async resizePool(connectionName: string, newSize: number): Promise<void> {
    try {
      const config = this.poolConfigs.get(connectionName);
      if (!config || !config.enabled) {
        return;
      }

      const currentStats = this.poolStats.get(connectionName);
      if (!currentStats) {
        return;
      }

      const currentSize = currentStats.totalConnections;

      if (newSize > currentSize) {
        // 增加连接
        const connectionsToAdd = newSize - currentSize;
        for (let i = 0; i < connectionsToAdd; i++) {
          await this.createConnection(connectionName);
        }
      } else if (newSize < currentSize) {
        // 减少连接
        const connectionsToRemove = currentSize - newSize;
        for (let i = 0; i < connectionsToRemove; i++) {
          await this.closeIdleConnection(connectionName);
        }
      }

      // 更新配置
      config.maxConnections = newSize;
      this.poolConfigs.set(connectionName, config);
    } catch (error) {
      throw new Error(
        `调整连接池大小失败: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 获取连接池建议配置
   */
  getRecommendedConfig(
    connectionName: string,
    expectedLoad: number,
  ): ConnectionPoolConfig {
    // 基于预期负载计算建议配置
    const minConnections = Math.max(2, Math.floor(expectedLoad * 0.1));
    const maxConnections = Math.max(
      minConnections * 2,
      Math.floor(expectedLoad * 0.5),
    );

    return {
      minConnections,
      maxConnections,
      connectionTimeout: 30000,
      idleTimeout: 300000,
      validationInterval: 60000,
      enabled: true,
    };
  }

  /**
   * 创建连接
   */
  private async createConnection(connectionName: string): Promise<void> {
    try {
      const config = this.poolConfigs.get(connectionName);
      if (!config || !config.enabled) {
        return;
      }

      const stats = this.poolStats.get(connectionName);
      if (!stats) {
        return;
      }

      if (stats.totalConnections >= config.maxConnections) {
        throw new Error("连接池已满");
      }

      // 这里应该创建实际连接
      // 暂时模拟连接创建
      stats.totalConnections++;
      stats.idleConnections++;

      this.poolStats.set(connectionName, stats);
    } catch (error) {
      const stats = this.poolStats.get(connectionName);
      if (stats) {
        stats.connectionErrors++;
        this.poolStats.set(connectionName, stats);
      }
      throw error;
    }
  }

  /**
   * 关闭空闲连接
   */
  private async closeIdleConnection(connectionName: string): Promise<void> {
    try {
      const config = this.poolConfigs.get(connectionName);
      if (!config || !config.enabled) {
        return;
      }

      const stats = this.poolStats.get(connectionName);
      if (!stats) {
        return;
      }

      if (stats.idleConnections <= config.minConnections) {
        return;
      }

      // 这里应该关闭实际连接
      // 暂时模拟连接关闭
      stats.totalConnections--;
      stats.idleConnections--;

      this.poolStats.set(connectionName, stats);
    } catch (error) {
      const stats = this.poolStats.get(connectionName);
      if (stats) {
        stats.connectionErrors++;
        this.poolStats.set(connectionName, stats);
      }
      throw error;
    }
  }

  /**
   * 初始化连接池统计信息
   */
  private initializePoolStats(connectionName: string): void {
    this.poolStats.set(connectionName, {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      waitingConnections: 0,
      utilizationRate: 0,
      averageResponseTime: 0,
      connectionErrors: 0,
    });
  }

  /**
   * 启动验证定时器
   */
  private startValidationTimer(connectionName: string): void {
    const config = this.poolConfigs.get(connectionName);
    if (!config || !config.enabled) {
      return;
    }

    const timer = setInterval(async () => {
      try {
        await this.validatePoolHealth(connectionName);
        await this.cleanupIdleConnections(connectionName);
      } catch (error) {
        console.error(`连接池验证失败: ${error}`);
      }
    }, config.validationInterval);

    this.validationTimers.set(connectionName, timer);
  }

  /**
   * 停止验证定时器
   */
  private stopValidationTimer(connectionName: string): void {
    const timer = this.validationTimers.get(connectionName);
    if (timer) {
      clearInterval(timer);
      this.validationTimers.delete(connectionName);
    }
  }

  /**
   * 关闭连接池
   */
  async closePool(connectionName: string): Promise<void> {
    try {
      this.stopValidationTimer(connectionName);

      const stats = this.poolStats.get(connectionName);
      if (stats) {
        // 关闭所有连接
        stats.totalConnections = 0;
        stats.activeConnections = 0;
        stats.idleConnections = 0;
        this.poolStats.set(connectionName, stats);
      }
    } catch (error) {
      throw new Error(
        `关闭连接池失败: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 关闭所有连接池
   */
  async closeAllPools(): Promise<void> {
    try {
      const closePromises = Array.from(this.poolConfigs.keys()).map(
        async (connectionName) => {
          try {
            await this.closePool(connectionName);
          } catch (error) {
            console.error(`关闭连接池 ${connectionName} 失败:`, error);
          }
        },
      );

      await Promise.all(closePromises);
    } catch (error) {
      throw new Error(
        `关闭所有连接池失败: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const healthChecks: Record<string, boolean> = {};

    const checkPromises = Array.from(this.poolConfigs.keys()).map(
      async (connectionName) => {
        try {
          const isHealthy = await this.validatePoolHealth(connectionName);
          healthChecks[connectionName] = isHealthy;
        } catch (error) {
          healthChecks[connectionName] = false;
        }
      },
    );

    await Promise.all(checkPromises);
    return healthChecks;
  }
}
