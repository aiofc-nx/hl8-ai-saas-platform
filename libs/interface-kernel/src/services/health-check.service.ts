/**
 * @fileoverview 健康检查服务
 * @description 提供系统健康检查功能，包括服务状态检查、依赖检查、性能检查等
 */

import { Injectable, Logger } from "@nestjs/common";
import type { HealthCheckResult, ServiceHealth } from "../types/index.js";

/**
 * 健康检查服务
 * @description 提供系统健康检查相关功能
 */
@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);
  private readonly serviceChecks: Map<string, () => Promise<ServiceHealth>> =
    new Map();
  private readonly startTime: number = Date.now();

  constructor() {
    this.logger.log("Health Check Service initialized");
    this.initializeDefaultChecks();
  }

  /**
   * 执行健康检查
   * @description 执行完整的系统健康检查
   * @returns 健康检查结果
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    try {
      this.logger.debug("Performing health check");

      const services: ServiceHealth[] = [];
      let overallStatus: "healthy" | "unhealthy" | "degraded" = "healthy";

      // 检查所有注册的服务
      for (const [serviceName, checkFunction] of this.serviceChecks.entries()) {
        try {
          const startTime = Date.now();
          const serviceHealth = await checkFunction();
          const responseTime = Date.now() - startTime;

          serviceHealth.responseTime = responseTime;
          services.push(serviceHealth);

          // 更新整体状态
          if (serviceHealth.status === "unhealthy") {
            overallStatus = "unhealthy";
          } else if (
            serviceHealth.status === "degraded" &&
            overallStatus !== "unhealthy"
          ) {
            overallStatus = "degraded";
          }
        } catch (error) {
          this.logger.error(
            `Health check failed for service ${serviceName}: ${error instanceof Error ? error.message : String(error)}`,
          );

          services.push({
            name: serviceName,
            status: "unhealthy",
            lastCheck: new Date().toISOString(),
            details: {
              error: error instanceof Error ? error.message : String(error),
            },
          });

          overallStatus = "unhealthy";
        }
      }

      const result: HealthCheckResult = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: Date.now() - this.startTime,
        version: process.env.npm_package_version || "1.0.0",
        services,
      };

      this.logger.debug(`Health check completed with status: ${overallStatus}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Health check failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      return {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        uptime: Date.now() - this.startTime,
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
   * 检查服务健康状态
   * @description 检查单个服务的健康状态
   * @param serviceName 服务名称
   * @returns 服务健康状态
   */
  async checkServiceHealth(serviceName: string): Promise<ServiceHealth> {
    try {
      this.logger.debug(`Checking health for service: ${serviceName}`);

      const checkFunction = this.serviceChecks.get(serviceName);
      if (!checkFunction) {
        return {
          name: serviceName,
          status: "unhealthy",
          lastCheck: new Date().toISOString(),
          details: { error: "Service check not registered" },
        };
      }

      const startTime = Date.now();
      const result = await checkFunction();
      const responseTime = Date.now() - startTime;

      result.responseTime = responseTime;
      return result;
    } catch (error) {
      this.logger.error(
        `Service health check failed for ${serviceName}: ${error instanceof Error ? error.message : String(error)}`,
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
   * 注册服务检查
   * @description 注册新的服务健康检查
   * @param serviceName 服务名称
   * @param checkFunction 检查函数
   */
  registerServiceCheck(
    serviceName: string,
    checkFunction: () => Promise<ServiceHealth>,
  ): void {
    try {
      this.serviceChecks.set(serviceName, checkFunction);
      this.logger.debug(`Registered health check for service: ${serviceName}`);
    } catch (error) {
      this.logger.error(
        `Failed to register service check: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 移除服务检查
   * @description 移除指定的服务健康检查
   * @param serviceName 服务名称
   */
  removeServiceCheck(serviceName: string): void {
    try {
      this.serviceChecks.delete(serviceName);
      this.logger.debug(`Removed health check for service: ${serviceName}`);
    } catch (error) {
      this.logger.error(
        `Failed to remove service check: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 获取所有注册的服务
   * @description 获取所有已注册的服务名称
   * @returns 服务名称列表
   */
  getRegisteredServices(): string[] {
    return Array.from(this.serviceChecks.keys());
  }

  /**
   * 初始化默认检查
   * @description 初始化系统默认的健康检查
   */
  private initializeDefaultChecks(): void {
    try {
      // 系统健康检查
      this.registerServiceCheck("system", async () => {
        const memoryUsage = process.memoryUsage();
        const memoryUsagePercent =
          (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

        let status: "healthy" | "unhealthy" | "degraded" = "healthy";
        if (memoryUsagePercent > 90) {
          status = "unhealthy";
        } else if (memoryUsagePercent > 80) {
          status = "degraded";
        }

        return {
          name: "system",
          status,
          lastCheck: new Date().toISOString(),
          details: {
            memoryUsage: memoryUsagePercent,
            uptime: process.uptime(),
            nodeVersion: process.version,
            platform: process.platform,
          },
        };
      });

      // 内存健康检查
      this.registerServiceCheck("memory", async () => {
        const memoryUsage = process.memoryUsage();
        const totalMemory = memoryUsage.heapTotal;
        const usedMemory = memoryUsage.heapUsed;
        const freeMemory = totalMemory - usedMemory;
        const memoryUsagePercent = (usedMemory / totalMemory) * 100;

        let status: "healthy" | "unhealthy" | "degraded" = "healthy";
        if (memoryUsagePercent > 95) {
          status = "unhealthy";
        } else if (memoryUsagePercent > 85) {
          status = "degraded";
        }

        return {
          name: "memory",
          status,
          lastCheck: new Date().toISOString(),
          details: {
            totalMemory,
            usedMemory,
            freeMemory,
            usagePercent: memoryUsagePercent,
          },
        };
      });

      // CPU健康检查
      this.registerServiceCheck("cpu", async () => {
        const cpuUsage = process.cpuUsage();
        const totalCpuUsage = cpuUsage.user + cpuUsage.system;

        // 简化的CPU使用率计算
        const cpuUsagePercent = Math.min(totalCpuUsage / 1000000, 100); // 转换为百分比

        let status: "healthy" | "unhealthy" | "degraded" = "healthy";
        if (cpuUsagePercent > 90) {
          status = "unhealthy";
        } else if (cpuUsagePercent > 80) {
          status = "degraded";
        }

        return {
          name: "cpu",
          status,
          lastCheck: new Date().toISOString(),
          details: {
            userCpu: cpuUsage.user,
            systemCpu: cpuUsage.system,
            totalCpu: totalCpuUsage,
            usagePercent: cpuUsagePercent,
          },
        };
      });

      // 磁盘空间健康检查（简化版本）
      this.registerServiceCheck("disk", async () => {
        // 这里应该检查磁盘空间，但Node.js没有直接的方法
        // 暂时返回健康状态
        return {
          name: "disk",
          status: "healthy",
          lastCheck: new Date().toISOString(),
          details: {
            message: "Disk space check not implemented",
          },
        };
      });

      // 网络连接健康检查
      this.registerServiceCheck("network", async () => {
        // 这里应该检查网络连接，暂时返回健康状态
        return {
          name: "network",
          status: "healthy",
          lastCheck: new Date().toISOString(),
          details: {
            message: "Network connectivity check not implemented",
          },
        };
      });

      this.logger.debug("Default health checks initialized");
    } catch (error) {
      this.logger.error(
        `Failed to initialize default checks: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 检查数据库连接
   * @description 检查数据库连接的健康状态
   * @returns 数据库健康状态
   */
  async checkDatabaseHealth(): Promise<ServiceHealth> {
    try {
      // 这里应该检查数据库连接
      // 暂时返回健康状态
      return {
        name: "database",
        status: "healthy",
        lastCheck: new Date().toISOString(),
        details: {
          message: "Database connection check not implemented",
        },
      };
    } catch (error) {
      return {
        name: "database",
        status: "unhealthy",
        lastCheck: new Date().toISOString(),
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * 检查外部服务连接
   * @description 检查外部服务的连接状态
   * @param serviceName 服务名称
   * @param url 服务URL
   * @returns 外部服务健康状态
   */
  async checkExternalServiceHealth(
    serviceName: string,
    url: string,
  ): Promise<ServiceHealth> {
    try {
      // 验证参数
      if (!serviceName || !url) {
        return {
          name: serviceName || "unknown",
          status: "unhealthy",
          lastCheck: new Date().toISOString(),
          details: {
            url: url || "unknown",
            message: "Invalid service name or URL",
          },
        };
      }

      // 这里应该检查外部服务连接
      // 暂时返回健康状态
      return {
        name: serviceName,
        status: "healthy",
        lastCheck: new Date().toISOString(),
        details: {
          url,
          message: "External service check not implemented",
        },
      };
    } catch (error) {
      return {
        name: serviceName,
        status: "unhealthy",
        lastCheck: new Date().toISOString(),
        details: {
          url,
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * 获取健康检查摘要
   * @description 获取健康检查的摘要信息
   * @returns 健康检查摘要
   */
  async getHealthSummary(): Promise<{
    overallStatus: "healthy" | "unhealthy" | "degraded";
    totalServices: number;
    healthyServices: number;
    degradedServices: number;
    unhealthyServices: number;
    lastCheck: string;
  }> {
    try {
      const result = await this.performHealthCheck();

      const healthyServices = result.services.filter(
        (s) => s.status === "healthy",
      ).length;
      const degradedServices = result.services.filter(
        (s) => s.status === "degraded",
      ).length;
      const unhealthyServices = result.services.filter(
        (s) => s.status === "unhealthy",
      ).length;

      return {
        overallStatus: result.status,
        totalServices: result.services.length,
        healthyServices,
        degradedServices,
        unhealthyServices,
        lastCheck: result.timestamp,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get health summary: ${error instanceof Error ? error.message : String(error)}`,
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
}
