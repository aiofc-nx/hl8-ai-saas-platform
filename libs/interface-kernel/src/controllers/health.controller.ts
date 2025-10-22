/**
 * @fileoverview 健康检查控制器
 * @description 提供系统健康检查接口
 */

import { Controller, Get, HttpStatus, Logger } from "@nestjs/common";
import { HealthCheckService } from "../services/health-check.service.js";
import { MonitoringService } from "../services/monitoring.service.js";
import type { HealthCheckResult } from "../types/index.js";

/**
 * 健康检查控制器
 * @description 提供系统健康检查相关接口
 */
@Controller("health")
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly monitoringService: MonitoringService,
  ) {
    this.logger.log("Health Controller initialized");
  }

  /**
   * 基础健康检查
   * @description 提供基础的系统健康检查
   * @returns 健康检查结果
   */
  @Get()
  async getHealth(): Promise<HealthCheckResult> {
    try {
      this.logger.debug("Performing basic health check");
      return await this.healthCheckService.performHealthCheck();
    } catch (error) {
      this.logger.error(
        `Health check failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      return {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        uptime: 0,
        version: process.env.npm_package_version || "1.0.0",
        services: [
          {
            name: "health-check",
            status: "unhealthy",
            lastCheck: new Date().toISOString(),
            details: {
              error: error instanceof Error ? error.message : String(error),
            },
          },
        ],
      };
    }
  }

  /**
   * 详细健康检查
   * @description 提供详细的系统健康检查
   * @returns 详细健康检查结果
   */
  @Get("detailed")
  async getDetailedHealth(): Promise<{
    health: HealthCheckResult;
    metrics: any;
    systemInfo: any;
  }> {
    try {
      this.logger.debug("Performing detailed health check");

      const health = await this.healthCheckService.performHealthCheck();
      const metrics = this.monitoringService.getPerformanceMetrics();
      const systemInfo = this.monitoringService.getSystemInfo();

      return {
        health,
        metrics,
        systemInfo,
      };
    } catch (error) {
      this.logger.error(
        `Detailed health check failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      return {
        health: {
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          uptime: 0,
          version: process.env.npm_package_version || "1.0.0",
          services: [
            {
              name: "health-check",
              status: "unhealthy",
              lastCheck: new Date().toISOString(),
              details: {
                error: error instanceof Error ? error.message : String(error),
              },
            },
          ],
        },
        metrics: {},
        systemInfo: {},
      };
    }
  }

  /**
   * 健康检查摘要
   * @description 提供健康检查摘要信息
   * @returns 健康检查摘要
   */
  @Get("summary")
  async getHealthSummary(): Promise<{
    overallStatus: "healthy" | "unhealthy" | "degraded";
    totalServices: number;
    healthyServices: number;
    degradedServices: number;
    unhealthyServices: number;
    lastCheck: string;
  }> {
    try {
      this.logger.debug("Getting health check summary");
      return await this.healthCheckService.getHealthSummary();
    } catch (error) {
      this.logger.error(
        `Health summary failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      return {
        overallStatus: "unhealthy",
        totalServices: 0,
        healthyServices: 0,
        degradedServices: 0,
        unhealthyServices: 1,
        lastCheck: new Date().toISOString(),
      };
    }
  }

  /**
   * 服务健康检查
   * @description 检查特定服务的健康状态
   * @param serviceName 服务名称
   * @returns 服务健康状态
   */
  @Get("service/:serviceName")
  async getServiceHealth(serviceName: string): Promise<any> {
    try {
      this.logger.debug(`Checking health for service: ${serviceName}`);
      return await this.healthCheckService.checkServiceHealth(serviceName);
    } catch (error) {
      this.logger.error(
        `Service health check failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      return {
        name: serviceName,
        status: "unhealthy",
        lastCheck: new Date().toISOString(),
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * 就绪检查
   * @description 检查服务是否就绪
   * @returns 就绪状态
   */
  @Get("ready")
  async getReadiness(): Promise<{ ready: boolean; timestamp: string }> {
    try {
      this.logger.debug("Checking service readiness");

      const health = await this.healthCheckService.performHealthCheck();
      const ready = health.status === "healthy" || health.status === "degraded";

      return {
        ready,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Readiness check failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      return {
        ready: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 存活检查
   * @description 检查服务是否存活
   * @returns 存活状态
   */
  @Get("live")
  async getLiveness(): Promise<{ alive: boolean; timestamp: string }> {
    try {
      this.logger.debug("Checking service liveness");

      // 基础存活检查 - 只要服务能响应就认为存活
      return {
        alive: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Liveness check failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      return {
        alive: false,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
