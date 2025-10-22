/**
 * 缓存预热服务
 *
 * @description 实现缓存预热功能，提高系统性能
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import type { ICacheService } from "../../interfaces/cache-service.interface.js";
import type { IsolationContext } from "../../types/isolation.types.js";

/**
 * 预热配置
 */
export interface WarmingConfig {
  /** 是否启用预热 */
  enabled: boolean;
  /** 预热间隔(毫秒) */
  interval: number;
  /** 预热批次大小 */
  batchSize: number;
  /** 预热超时时间(毫秒) */
  timeout: number;
  /** 预热重试次数 */
  retryAttempts: number;
}

/**
 * 预热任务
 */
export interface WarmingTask {
  /** 任务ID */
  id: string;
  /** 任务名称 */
  name: string;
  /** 预热键列表 */
  keys: string[];
  /** 数据加载器 */
  dataLoader: () => Promise<Record<string, any>>;
  /** 优先级 */
  priority: number;
  /** 状态 */
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  /** 创建时间 */
  createdAt: Date;
  /** 开始时间 */
  startedAt?: Date;
  /** 完成时间 */
  completedAt?: Date;
  /** 错误信息 */
  error?: string;
}

/**
 * 缓存预热服务
 */
@Injectable()
export class CacheWarmingService {
  private warmingTasks = new Map<string, WarmingTask>();
  private warmingTimers = new Map<string, NodeJS.Timeout>();
  private config: WarmingConfig = {
    enabled: true,
    interval: 300000, // 5分钟
    batchSize: 100,
    timeout: 30000,
    retryAttempts: 3,
  };

  constructor(
    private readonly cacheService: ICacheService,
    private readonly isolationContext?: IsolationContext,
  ) {}

  /**
   * 设置预热配置
   */
  setConfig(config: Partial<WarmingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 添加预热任务
   */
  addWarmingTask(
    task: Omit<WarmingTask, "id" | "status" | "createdAt">,
  ): string {
    const taskId = this.generateTaskId();
    const warmingTask: WarmingTask = {
      id: taskId,
      status: "PENDING",
      createdAt: new Date(),
      ...task,
    };

    this.warmingTasks.set(taskId, warmingTask);

    // 如果启用预热，立即执行
    if (this.config.enabled) {
      this.executeWarmingTask(taskId);
    }

    return taskId;
  }

  /**
   * 执行预热任务
   */
  async executeWarmingTask(taskId: string): Promise<void> {
    const task = this.warmingTasks.get(taskId);
    if (!task) {
      throw new Error(`预热任务 ${taskId} 不存在`);
    }

    if (task.status === "RUNNING") {
      return;
    }

    task.status = "RUNNING";
    task.startedAt = new Date();
    this.warmingTasks.set(taskId, task);

    try {
      // 加载数据
      const data = await this.loadDataWithTimeout(
        task.dataLoader,
        this.config.timeout,
      );

      // 批量设置缓存
      await this.setCacheInBatches(task.keys, data);

      task.status = "COMPLETED";
      task.completedAt = new Date();
      this.warmingTasks.set(taskId, task);
    } catch (error) {
      task.status = "FAILED";
      task.error = error instanceof Error ? error.message : "预热任务失败";
      task.completedAt = new Date();
      this.warmingTasks.set(taskId, task);

      // 重试机制
      if (this.config.retryAttempts > 0) {
        setTimeout(() => {
          this.retryWarmingTask(taskId);
        }, 5000);
      }
    }
  }

  /**
   * 批量预热
   */
  async warmupBatch(
    keys: string[],
    dataLoader: () => Promise<Record<string, any>>,
  ): Promise<void> {
    try {
      const data = await dataLoader();
      await this.setCacheInBatches(keys, data);
    } catch (error) {
      throw new Error(
        `批量预热失败: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 预热所有任务
   */
  async warmupAll(): Promise<void> {
    const tasks = Array.from(this.warmingTasks.values())
      .filter((task) => task.status === "PENDING")
      .sort((a, b) => b.priority - a.priority);

    for (const task of tasks) {
      try {
        await this.executeWarmingTask(task.id);
      } catch (error) {
        console.error(`预热任务 ${task.id} 失败:`, error);
      }
    }
  }

  /**
   * 获取预热任务状态
   */
  getWarmingTaskStatus(taskId: string): WarmingTask | undefined {
    return this.warmingTasks.get(taskId);
  }

  /**
   * 获取所有预热任务状态
   */
  getAllWarmingTaskStatus(): WarmingTask[] {
    return Array.from(this.warmingTasks.values());
  }

  /**
   * 获取预热统计信息
   */
  getWarmingStats(): Record<string, any> {
    const tasks = Array.from(this.warmingTasks.values());
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "COMPLETED").length;
    const failed = tasks.filter((t) => t.status === "FAILED").length;
    const running = tasks.filter((t) => t.status === "RUNNING").length;
    const pending = tasks.filter((t) => t.status === "PENDING").length;

    return {
      total,
      completed,
      failed,
      running,
      pending,
      successRate: total > 0 ? completed / total : 0,
    };
  }

  /**
   * 移除预热任务
   */
  removeWarmingTask(taskId: string): void {
    this.warmingTasks.delete(taskId);

    // 清除定时器
    const timer = this.warmingTimers.get(taskId);
    if (timer) {
      clearTimeout(timer);
      this.warmingTimers.delete(taskId);
    }
  }

  /**
   * 清除所有预热任务
   */
  clearAllWarmingTasks(): void {
    this.warmingTasks.clear();

    // 清除所有定时器
    for (const timer of this.warmingTimers.values()) {
      clearTimeout(timer);
    }
    this.warmingTimers.clear();
  }

  /**
   * 启动定期预热
   */
  startPeriodicWarming(): void {
    if (!this.config.enabled) {
      return;
    }

    const timer = setInterval(async () => {
      try {
        await this.warmupAll();
      } catch (error) {
        console.error("定期预热失败:", error);
      }
    }, this.config.interval);

    this.warmingTimers.set("periodic", timer);
  }

  /**
   * 停止定期预热
   */
  stopPeriodicWarming(): void {
    const timer = this.warmingTimers.get("periodic");
    if (timer) {
      clearInterval(timer);
      this.warmingTimers.delete("periodic");
    }
  }

  /**
   * 加载数据（带超时）
   */
  private async loadDataWithTimeout(
    dataLoader: () => Promise<Record<string, any>>,
    timeout: number,
  ): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("数据加载超时"));
      }, timeout);

      dataLoader()
        .then((data) => {
          clearTimeout(timer);
          resolve(data);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * 批量设置缓存
   */
  private async setCacheInBatches(
    keys: string[],
    data: Record<string, any>,
  ): Promise<void> {
    const batches = this.chunkArray(keys, this.config.batchSize);

    for (const batch of batches) {
      const batchPromises = batch.map(async (key) => {
        const value = data[key];
        if (value !== undefined) {
          await this.cacheService.set(key, value);
        }
      });

      await Promise.all(batchPromises);
    }
  }

  /**
   * 重试预热任务
   */
  private async retryWarmingTask(taskId: string): Promise<void> {
    const task = this.warmingTasks.get(taskId);
    if (!task || task.status !== "FAILED") {
      return;
    }

    // 重置任务状态
    task.status = "PENDING";
    task.startedAt = undefined;
    task.completedAt = undefined;
    task.error = undefined;
    this.warmingTasks.set(taskId, task);

    // 重新执行
    await this.executeWarmingTask(taskId);
  }

  /**
   * 生成任务ID
   */
  private generateTaskId(): string {
    return `warming_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 数组分块
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      return await this.cacheService.healthCheck();
    } catch (error) {
      return false;
    }
  }
}
