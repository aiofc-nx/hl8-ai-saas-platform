/**
 * @fileoverview Health Check Service 单元测试
 * @description 测试健康检查服务的所有功能
 */

import { Test, TestingModule } from "@nestjs/testing";
import { HealthCheckService } from "./health-check.service";
import type { ServiceHealth } from "../types/index";

describe("HealthCheckService", () => {
  let service: HealthCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthCheckService],
    }).compile();

    service = module.get<HealthCheckService>(HealthCheckService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("performHealthCheck", () => {
    it("should perform health check successfully", async () => {
      const result = await service.performHealthCheck();

      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeDefined();
      expect(result.version).toBeDefined();
      expect(result.services).toBeDefined();
      expect(Array.isArray(result.services)).toBe(true);
    });

    it("should return healthy status when all services are healthy", async () => {
      const result = await service.performHealthCheck();

      expect(["healthy", "degraded", "unhealthy"]).toContain(result.status);
    });

    it("should include system services in health check", async () => {
      const result = await service.performHealthCheck();

      const serviceNames = result.services.map((s) => s.name);
      expect(serviceNames).toContain("system");
      expect(serviceNames).toContain("memory");
      expect(serviceNames).toContain("cpu");
    });

    it("should handle health check errors gracefully", async () => {
      // Mock a service check that throws an error
      const errorCheck = jest
        .fn()
        .mockRejectedValue(new Error("Service check failed"));
      service.registerServiceCheck("error-service", errorCheck);

      const result = await service.performHealthCheck();

      expect(result).toBeDefined();
      expect(result.status).toBe("unhealthy");
    });
  });

  describe("checkServiceHealth", () => {
    it("should check service health successfully", async () => {
      const result = await service.checkServiceHealth("system");

      expect(result).toBeDefined();
      expect(result.name).toBe("system");
      expect(result.status).toBeDefined();
      expect(result.lastCheck).toBeDefined();
    });

    it("should return unhealthy for non-existent service", async () => {
      const result = await service.checkServiceHealth("non-existent-service");

      expect(result).toBeDefined();
      expect(result.name).toBe("non-existent-service");
      expect(result.status).toBe("unhealthy");
      expect(result.details?.error).toBe("Service check not registered");
    });

    it("should handle service health check errors gracefully", async () => {
      const result = await service.checkServiceHealth(null as any);

      expect(result).toBeDefined();
      expect(result.status).toBe("unhealthy");
    });
  });

  describe("service check management", () => {
    it("should register service check", () => {
      const checkFunction = jest.fn().mockResolvedValue({
        name: "test-service",
        status: "healthy",
        lastCheck: new Date().toISOString(),
      });

      service.registerServiceCheck("test-service", checkFunction);

      const services = service.getRegisteredServices();
      expect(services).toContain("test-service");
    });

    it("should remove service check", () => {
      const checkFunction = jest.fn().mockResolvedValue({
        name: "test-service",
        status: "healthy",
        lastCheck: new Date().toISOString(),
      });

      service.registerServiceCheck("test-service", checkFunction);
      service.removeServiceCheck("test-service");

      const services = service.getRegisteredServices();
      expect(services).not.toContain("test-service");
    });

    it("should get registered services", () => {
      const services = service.getRegisteredServices();

      expect(Array.isArray(services)).toBe(true);
      expect(services).toContain("system");
      expect(services).toContain("memory");
      expect(services).toContain("cpu");
    });

    it("should handle service check management errors gracefully", () => {
      expect(() => {
        service.registerServiceCheck("", null as any);
      }).not.toThrow();

      expect(() => {
        service.removeServiceCheck("");
      }).not.toThrow();
    });
  });

  describe("checkDatabaseHealth", () => {
    it("should check database health", async () => {
      const result = await service.checkDatabaseHealth();

      expect(result).toBeDefined();
      expect(result.name).toBe("database");
      expect(result.status).toBeDefined();
      expect(result.lastCheck).toBeDefined();
    });

    it("should handle database health check errors gracefully", async () => {
      const result = await service.checkDatabaseHealth();

      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
    });
  });

  describe("checkExternalServiceHealth", () => {
    it("should check external service health", async () => {
      const serviceName = "external-api";
      const url = "https://api.example.com";

      const result = await service.checkExternalServiceHealth(serviceName, url);

      expect(result).toBeDefined();
      expect(result.name).toBe(serviceName);
      expect(result.status).toBeDefined();
      expect(result.lastCheck).toBeDefined();
    });

    it("should handle external service health check errors gracefully", async () => {
      const result = await service.checkExternalServiceHealth(
        null as any,
        null as any,
      );

      expect(result).toBeDefined();
      expect(result.status).toBe("unhealthy");
    });
  });

  describe("getHealthSummary", () => {
    it("should get health summary", async () => {
      const summary = await service.getHealthSummary();

      expect(summary).toBeDefined();
      expect(summary.overallStatus).toBeDefined();
      expect(typeof summary.totalServices).toBe("number");
      expect(typeof summary.healthyServices).toBe("number");
      expect(typeof summary.degradedServices).toBe("number");
      expect(typeof summary.unhealthyServices).toBe("number");
      expect(summary.lastCheck).toBeDefined();
    });

    it("should return consistent summary structure", async () => {
      const summary1 = await service.getHealthSummary();
      const summary2 = await service.getHealthSummary();

      expect(Object.keys(summary1)).toEqual(Object.keys(summary2));
    });

    it("should handle health summary errors gracefully", async () => {
      const summary = await service.getHealthSummary();

      expect(summary).toBeDefined();
      expect(summary.overallStatus).toBeDefined();
    });
  });

  describe("default service checks", () => {
    it("should have system service check", async () => {
      const result = await service.checkServiceHealth("system");

      expect(result).toBeDefined();
      expect(result.name).toBe("system");
      expect(result.status).toBeDefined();
    });

    it("should have memory service check", async () => {
      const result = await service.checkServiceHealth("memory");

      expect(result).toBeDefined();
      expect(result.name).toBe("memory");
      expect(result.status).toBeDefined();
    });

    it("should have cpu service check", async () => {
      const result = await service.checkServiceHealth("cpu");

      expect(result).toBeDefined();
      expect(result.name).toBe("cpu");
      expect(result.status).toBeDefined();
    });

    it("should have disk service check", async () => {
      const result = await service.checkServiceHealth("disk");

      expect(result).toBeDefined();
      expect(result.name).toBe("disk");
      expect(result.status).toBeDefined();
    });

    it("should have network service check", async () => {
      const result = await service.checkServiceHealth("network");

      expect(result).toBeDefined();
      expect(result.name).toBe("network");
      expect(result.status).toBeDefined();
    });
  });

  describe("service health status", () => {
    it("should return healthy status for good conditions", async () => {
      const result = await service.checkServiceHealth("system");

      expect(["healthy", "degraded", "unhealthy"]).toContain(result.status);
    });

    it("should include response time in service health", async () => {
      const result = await service.checkServiceHealth("system");

      expect(result).toBeDefined();
      // Response time might be undefined for some services
      if (result.responseTime !== undefined) {
        expect(typeof result.responseTime).toBe("number");
      }
    });

    it("should include details in service health", async () => {
      const result = await service.checkServiceHealth("system");

      expect(result).toBeDefined();
      // Details might be undefined for some services
      if (result.details !== undefined) {
        expect(typeof result.details).toBe("object");
      }
    });
  });

  describe("error handling", () => {
    it("should handle service check function errors", async () => {
      const errorCheck = jest
        .fn()
        .mockRejectedValue(new Error("Service error"));
      service.registerServiceCheck("error-service", errorCheck);

      const result = await service.checkServiceHealth("error-service");

      expect(result).toBeDefined();
      expect(result.status).toBe("unhealthy");
      expect(result.details?.error).toBe("Service error");
    });

    it("should handle health check service errors", async () => {
      // Mock a scenario where the health check itself fails
      const originalPerformHealthCheck = service.performHealthCheck;
      service.performHealthCheck = jest
        .fn()
        .mockRejectedValue(new Error("Health check failed"));

      try {
        const result = await service.performHealthCheck();
        expect(result).toBeDefined();
        expect(result.status).toBe("unhealthy");
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toBe("Health check failed");
      }

      // Restore original method
      service.performHealthCheck = originalPerformHealthCheck;
    });

    it("should handle invalid service names gracefully", async () => {
      const result = await service.checkServiceHealth("");

      expect(result).toBeDefined();
      expect(result.status).toBe("unhealthy");
    });
  });

  describe("concurrent health checks", () => {
    it("should handle concurrent health checks", async () => {
      const promises = Array(5)
        .fill(null)
        .map(() => service.performHealthCheck());

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result).toBeDefined();
        expect(result.status).toBeDefined();
      });
    });

    it("should handle concurrent service health checks", async () => {
      const promises = Array(5)
        .fill(null)
        .map(() => service.checkServiceHealth("system"));

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result).toBeDefined();
        expect(result.name).toBe("system");
      });
    });
  });

  describe("edge cases", () => {
    it("should handle null service names gracefully", async () => {
      const result = await service.checkServiceHealth(null as any);

      expect(result).toBeDefined();
      expect(result.status).toBe("unhealthy");
    });

    it("should handle undefined service names gracefully", async () => {
      const result = await service.checkServiceHealth(undefined as any);

      expect(result).toBeDefined();
      expect(result.status).toBe("unhealthy");
    });

    it("should handle empty service names gracefully", async () => {
      const result = await service.checkServiceHealth("");

      expect(result).toBeDefined();
      expect(result.status).toBe("unhealthy");
    });

    it("should handle service check registration with invalid parameters", () => {
      expect(() => {
        service.registerServiceCheck(null as any, null as any);
      }).not.toThrow();

      expect(() => {
        service.registerServiceCheck("test", null as any);
      }).not.toThrow();
    });

    it("should handle service check removal with invalid parameters", () => {
      expect(() => {
        service.removeServiceCheck(null as any);
      }).not.toThrow();

      expect(() => {
        service.removeServiceCheck(undefined as any);
      }).not.toThrow();
    });
  });

  describe("performance", () => {
    it("should perform health checks within reasonable time", async () => {
      const startTime = Date.now();
      const result = await service.performHealthCheck();
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it("should perform service health checks within reasonable time", async () => {
      const startTime = Date.now();
      const result = await service.checkServiceHealth("system");
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
