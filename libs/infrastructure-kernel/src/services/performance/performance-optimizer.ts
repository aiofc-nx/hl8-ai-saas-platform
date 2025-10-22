/**
 * 性能优化器
 *
 * @description 基于性能指标自动优化系统性能
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import * as os from "os";
import type { IDatabaseAdapter } from "../../interfaces/database-adapter.interface.js";
import type { ICacheService } from "../../interfaces/cache-service.interface.js";
import type { ILoggingService } from "../../interfaces/logging-service.interface.js";
import type { PerformanceMetrics } from "./performance-monitor.js";

/**
 * 优化建议
 */
export interface OptimizationSuggestion {
  /** 建议ID */
  id: string;
  /** 建议类型 */
  type: "DATABASE" | "CACHE" | "MEMORY" | "CONNECTION" | "QUERY";
  /** 优先级 */
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  /** 标题 */
  title: string;
  /** 描述 */
  description: string;
  /** 建议操作 */
  action: string;
  /** 预期收益 */
  expectedBenefit: string;
  /** 实施难度 */
  difficulty: "EASY" | "MEDIUM" | "HARD";
  /** 时间戳 */
  timestamp: Date;
}

/**
 * 优化配置
 */
export interface OptimizationConfig {
  /** 是否启用自动优化 */
  autoOptimize: boolean;
  /** 优化间隔(毫秒) */
  optimizationInterval: number;
  /** 性能阈值 */
  performanceThresholds: {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
    cacheHitRate: number;
  };
  /** 优化策略 */
  strategies: {
    database: boolean;
    cache: boolean;
    memory: boolean;
    connection: boolean;
  };
}

/**
 * 性能优化器
 */
@Injectable()
export class PerformanceOptimizerService {
  private suggestions: OptimizationSuggestion[] = [];
  private config: OptimizationConfig = {
    autoOptimize: true,
    optimizationInterval: 300000, // 5分钟
    performanceThresholds: {
      responseTime: 1000,
      memoryUsage: 0.8,
      cpuUsage: 0.8,
      cacheHitRate: 0.8,
    },
    strategies: {
      database: true,
      cache: true,
      memory: true,
      connection: true,
    },
  };
  private optimizationTimer?: NodeJS.Timeout;
  private isOptimizing = false;

  constructor(
    private readonly databaseAdapter: IDatabaseAdapter,
    private readonly cacheService?: ICacheService,
    private readonly loggingService?: ILoggingService,
  ) {}

  /**
   * 开始自动优化
   */
  startAutoOptimization(): void {
    if (this.isOptimizing) {
      return;
    }

    this.isOptimizing = true;
    this.optimizationTimer = setInterval(async () => {
      try {
        await this.performOptimization();
      } catch (error) {
        console.error("自动优化失败:", error);
      }
    }, this.config.optimizationInterval);
  }

  /**
   * 停止自动优化
   */
  stopAutoOptimization(): void {
    if (this.optimizationTimer) {
      clearInterval(this.optimizationTimer);
      this.optimizationTimer = undefined;
    }
    this.isOptimizing = false;
  }

  /**
   * 执行性能优化
   */
  async performOptimization(): Promise<OptimizationSuggestion[]> {
    try {
      const suggestions: OptimizationSuggestion[] = [];

      // 分析数据库性能
      if (this.config.strategies.database) {
        const dbSuggestions = await this.analyzeDatabasePerformance();
        suggestions.push(...dbSuggestions);
      }

      // 分析缓存性能
      if (this.config.strategies.cache && this.cacheService) {
        const cacheSuggestions = await this.analyzeCachePerformance();
        suggestions.push(...cacheSuggestions);
      }

      // 分析内存性能
      if (this.config.strategies.memory) {
        const memorySuggestions = await this.analyzeMemoryPerformance();
        suggestions.push(...memorySuggestions);
      }

      // 分析连接性能
      if (this.config.strategies.connection) {
        const connectionSuggestions = await this.analyzeConnectionPerformance();
        suggestions.push(...connectionSuggestions);
      }

      // 存储建议
      this.suggestions.push(...suggestions);

      // 限制建议数量
      if (this.suggestions.length > 100) {
        this.suggestions = this.suggestions.slice(-100);
      }

      // 记录优化日志
      await this.logOptimization(suggestions);

      return suggestions;
    } catch (error) {
      throw new Error(
        `执行性能优化失败: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 分析数据库性能
   */
  private async analyzeDatabasePerformance(): Promise<
    OptimizationSuggestion[]
  > {
    const suggestions: OptimizationSuggestion[] = [];

    try {
      const connectionInfo = await this.databaseAdapter.getConnectionInfo();

      // 检查连接数
      if (connectionInfo.connections > 50) {
        suggestions.push({
          id: this.generateSuggestionId(),
          type: "DATABASE",
          priority: "MEDIUM",
          title: "数据库连接数过多",
          description: `当前连接数: ${connectionInfo.connections}，建议优化连接池配置`,
          action: "调整连接池大小，启用连接复用",
          expectedBenefit: "减少连接开销，提高性能",
          difficulty: "EASY",
          timestamp: new Date(),
        });
      }

      // 检查查询性能
      if (connectionInfo.slowQueries > 10) {
        suggestions.push({
          id: this.generateSuggestionId(),
          type: "QUERY",
          priority: "HIGH",
          title: "慢查询过多",
          description: `检测到 ${connectionInfo.slowQueries} 个慢查询`,
          action: "优化查询语句，添加索引",
          expectedBenefit: "显著提高查询性能",
          difficulty: "MEDIUM",
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error("分析数据库性能失败:", error);
    }

    return suggestions;
  }

  /**
   * 分析缓存性能
   */
  private async analyzeCachePerformance(): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];

    try {
      if (!this.cacheService) {
        return suggestions;
      }

      const stats = this.cacheService.getStats();

      // 检查缓存命中率
      if (
        (await stats).hitRate < this.config.performanceThresholds.cacheHitRate
      ) {
        suggestions.push({
          id: this.generateSuggestionId(),
          type: "CACHE",
          priority: "HIGH",
          title: "缓存命中率过低",
          description: `当前命中率: ${((await stats).hitRate * 100).toFixed(2)}%`,
          action: "优化缓存策略，增加缓存预热",
          expectedBenefit: "提高缓存命中率，减少数据库访问",
          difficulty: "MEDIUM",
          timestamp: new Date(),
        });
      }

      // 检查缓存大小
      if ((await stats).totalEntries > 10000) {
        suggestions.push({
          id: this.generateSuggestionId(),
          type: "CACHE",
          priority: "MEDIUM",
          title: "缓存条目过多",
          description: `当前条目数: ${(await stats).totalEntries}`,
          action: "清理过期缓存，优化缓存策略",
          expectedBenefit: "减少内存使用，提高缓存效率",
          difficulty: "EASY",
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error("分析缓存性能失败:", error);
    }

    return suggestions;
  }

  /**
   * 分析内存性能
   */
  private async analyzeMemoryPerformance(): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];

    try {
      const memUsage = process.memoryUsage();
      const totalMem = os.totalmem();
      const memoryUsage = memUsage.heapUsed / totalMem;

      // 检查内存使用率
      if (memoryUsage > this.config.performanceThresholds.memoryUsage) {
        suggestions.push({
          id: this.generateSuggestionId(),
          type: "MEMORY",
          priority: "CRITICAL",
          title: "内存使用率过高",
          description: `当前使用率: ${(memoryUsage * 100).toFixed(2)}%`,
          action: "优化内存使用，清理无用对象",
          expectedBenefit: "防止内存溢出，提高系统稳定性",
          difficulty: "HARD",
          timestamp: new Date(),
        });
      }

      // 检查堆内存使用
      if (memUsage.heapUsed > 500 * 1024 * 1024) {
        // 500MB
        suggestions.push({
          id: this.generateSuggestionId(),
          type: "MEMORY",
          priority: "HIGH",
          title: "堆内存使用过多",
          description: `当前堆内存: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
          action: "优化对象创建，使用对象池",
          expectedBenefit: "减少内存占用，提高性能",
          difficulty: "MEDIUM",
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error("分析内存性能失败:", error);
    }

    return suggestions;
  }

  /**
   * 分析连接性能
   */
  private async analyzeConnectionPerformance(): Promise<
    OptimizationSuggestion[]
  > {
    const suggestions: OptimizationSuggestion[] = [];

    try {
      // 这里可以实现连接性能分析逻辑
      // 例如：检查连接池使用率、连接超时等
    } catch (error) {
      console.error("分析连接性能失败:", error);
    }

    return suggestions;
  }

  /**
   * 获取优化建议
   */
  getSuggestions(priority?: string): OptimizationSuggestion[] {
    let suggestions = [...this.suggestions];

    if (priority) {
      suggestions = suggestions.filter((s) => s.priority === priority);
    }

    return suggestions;
  }

  /**
   * 获取优化统计
   */
  getOptimizationStats(): Record<string, any> {
    const total = this.suggestions.length;
    const byType = this.suggestions.reduce(
      (acc, s) => {
        acc[s.type] = (acc[s.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byPriority = this.suggestions.reduce(
      (acc, s) => {
        acc[s.priority] = (acc[s.priority] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total,
      byType,
      byPriority,
      autoOptimization: this.isOptimizing,
      config: this.config,
    };
  }

  /**
   * 设置优化配置
   */
  setConfig(config: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取优化配置
   */
  getConfig(): OptimizationConfig {
    return { ...this.config };
  }

  /**
   * 清除优化建议
   */
  clearSuggestions(): void {
    this.suggestions = [];
  }

  /**
   * 应用优化建议
   */
  async applySuggestion(suggestionId: string): Promise<boolean> {
    try {
      const suggestion = this.suggestions.find((s) => s.id === suggestionId);
      if (!suggestion) {
        return false;
      }

      // 根据建议类型执行相应的优化操作
      switch (suggestion.type) {
        case "DATABASE":
          await this.applyDatabaseOptimization(suggestion);
          break;
        case "CACHE":
          await this.applyCacheOptimization(suggestion);
          break;
        case "MEMORY":
          await this.applyMemoryOptimization(suggestion);
          break;
        case "CONNECTION":
          await this.applyConnectionOptimization(suggestion);
          break;
        case "QUERY":
          await this.applyQueryOptimization(suggestion);
          break;
      }

      // 记录应用日志
      await this.logSuggestionApplication(suggestion);

      return true;
    } catch (error) {
      console.error("应用优化建议失败:", error);
      return false;
    }
  }

  /**
   * 应用数据库优化
   */
  private async applyDatabaseOptimization(
    suggestion: OptimizationSuggestion,
  ): Promise<void> {
    // 实现数据库优化逻辑
    console.log("应用数据库优化:", suggestion.title);
  }

  /**
   * 应用缓存优化
   */
  private async applyCacheOptimization(
    suggestion: OptimizationSuggestion,
  ): Promise<void> {
    // 实现缓存优化逻辑
    console.log("应用缓存优化:", suggestion.title);
  }

  /**
   * 应用内存优化
   */
  private async applyMemoryOptimization(
    suggestion: OptimizationSuggestion,
  ): Promise<void> {
    // 实现内存优化逻辑
    console.log("应用内存优化:", suggestion.title);
  }

  /**
   * 应用连接优化
   */
  private async applyConnectionOptimization(
    suggestion: OptimizationSuggestion,
  ): Promise<void> {
    // 实现连接优化逻辑
    console.log("应用连接优化:", suggestion.title);
  }

  /**
   * 应用查询优化
   */
  private async applyQueryOptimization(
    suggestion: OptimizationSuggestion,
  ): Promise<void> {
    // 实现查询优化逻辑
    console.log("应用查询优化:", suggestion.title);
  }

  /**
   * 记录优化日志
   */
  private async logOptimization(
    suggestions: OptimizationSuggestion[],
  ): Promise<void> {
    try {
      if (this.loggingService && suggestions.length > 0) {
        const logContext = {
          requestId: `optimization_${Date.now()}`,
          tenantId: "system",
          operation: "performance-optimization",
          resource: "performance-optimizer",
          timestamp: new Date(),
          level: "info" as const,
          message: `性能优化: 生成 ${suggestions.length} 个建议`,
        };

        await this.loggingService.info(
          logContext,
          `性能优化: 生成 ${suggestions.length} 个建议`,
          {
            suggestions: suggestions.map((s) => ({
              id: s.id,
              type: s.type,
              priority: s.priority,
              title: s.title,
            })),
          },
        );
      }
    } catch (error) {
      console.error("记录优化日志失败:", error);
    }
  }

  /**
   * 记录建议应用日志
   */
  private async logSuggestionApplication(
    suggestion: OptimizationSuggestion,
  ): Promise<void> {
    try {
      if (this.loggingService) {
        const logContext = {
          requestId: `suggestion_${suggestion.id}`,
          tenantId: "system",
          operation: "suggestion-application",
          resource: "performance-optimizer",
          timestamp: new Date(),
          level: "info" as const,
          message: `应用优化建议: ${suggestion.title}`,
        };

        await this.loggingService.info(
          logContext,
          `应用优化建议: ${suggestion.title}`,
          suggestion as unknown as Record<string, unknown>,
        );
      }
    } catch (error) {
      console.error("记录建议应用日志失败:", error);
    }
  }

  /**
   * 生成建议ID
   */
  private generateSuggestionId(): string {
    return `suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
