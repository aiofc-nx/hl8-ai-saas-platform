/**
 * @fileoverview 指标控制器
 * @description 提供系统监控指标接口
 */

import { Controller, Get, Query, HttpStatus, Logger } from "@nestjs/common";
import { MonitoringService } from "../services/monitoring.service.js";
import { RateLimitService } from "../services/rate-limit.service.js";

/**
 * 指标控制器
 * @description 提供系统监控指标相关接口
 */
@Controller("metrics")
export class MetricsController {
  private readonly logger = new Logger(MetricsController.name);

  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly rateLimitService: RateLimitService,
  ) {
    this.logger.log("Metrics Controller initialized");
  }

  /**
   * 获取性能指标
   * @description 获取系统性能指标
   * @returns 性能指标
   */
  @Get("performance")
  async getPerformanceMetrics(): Promise<any> {
    try {
      this.logger.debug("Getting performance metrics");
      return this.monitoringService.getPerformanceMetrics();
    } catch (error) {
      this.logger.error(
        `Failed to get performance metrics: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * 获取系统信息
   * @description 获取系统运行信息
   * @returns 系统信息
   */
  @Get("system")
  async getSystemInfo(): Promise<any> {
    try {
      this.logger.debug("Getting system info");
      return this.monitoringService.getSystemInfo();
    } catch (error) {
      this.logger.error(
        `Failed to get system info: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * 获取指标数据
   * @description 获取指定指标的最近数据
   * @param name 指标名称
   * @param limit 数据条数限制
   * @returns 指标数据
   */
  @Get("data")
  async getMetricData(
    @Query("name") name: string,
    @Query("limit") limit?: number,
  ): Promise<any> {
    try {
      this.logger.debug(`Getting metric data for: ${name}`);

      if (!name) {
        return {
          success: false,
          error: {
            code: "MISSING_PARAMETER",
            message: "Metric name is required",
            timestamp: new Date().toISOString(),
          },
        };
      }

      const data = this.monitoringService.getMetricData(name, limit);
      return {
        success: true,
        data: {
          name,
          data,
          count: data.length,
        },
        meta: {
          timestamp: new Date().toISOString(),
          limit: limit || "unlimited",
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to get metric data: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * 获取所有指标名称
   * @description 获取所有已记录的指标名称
   * @returns 指标名称列表
   */
  @Get("names")
  async getMetricNames(): Promise<any> {
    try {
      this.logger.debug("Getting metric names");
      const names = this.monitoringService.getAllMetricNames();

      return {
        success: true,
        data: {
          names,
          count: names.length,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to get metric names: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * 获取速率限制统计
   * @description 获取速率限制的统计信息
   * @returns 速率限制统计
   */
  @Get("rate-limit")
  async getRateLimitStats(): Promise<any> {
    try {
      this.logger.debug("Getting rate limit statistics");
      const stats = this.rateLimitService.getStatistics();

      return {
        success: true,
        data: stats,
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to get rate limit stats: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * 导出所有指标
   * @description 导出所有指标数据
   * @returns 所有指标数据
   */
  @Get("export")
  async exportMetrics(): Promise<any> {
    try {
      this.logger.debug("Exporting all metrics");
      const metrics = this.monitoringService.exportMetrics();

      return {
        success: true,
        data: metrics,
        meta: {
          timestamp: new Date().toISOString(),
          count: Object.keys(metrics).length,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to export metrics: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * 重置指标
   * @description 重置所有指标数据
   * @returns 重置结果
   */
  @Get("reset")
  async resetMetrics(): Promise<any> {
    try {
      this.logger.debug("Resetting all metrics");
      this.monitoringService.resetMetrics();

      return {
        success: true,
        message: "All metrics have been reset",
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to reset metrics: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * 清理旧指标
   * @description 清理过期的指标数据
   * @param maxAge 最大保留时间（小时）
   * @returns 清理结果
   */
  @Get("cleanup")
  async cleanupMetrics(@Query("maxAge") maxAge?: number): Promise<any> {
    try {
      this.logger.debug("Cleaning up old metrics");

      const maxAgeMs = maxAge ? maxAge * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 默认24小时
      this.monitoringService.cleanupOldMetrics(maxAgeMs);

      return {
        success: true,
        message: `Cleaned up metrics older than ${maxAge || 24} hours`,
        meta: {
          timestamp: new Date().toISOString(),
          maxAge: maxAge || 24,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to cleanup metrics: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
