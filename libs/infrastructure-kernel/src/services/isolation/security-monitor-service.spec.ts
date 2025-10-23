/**
 * 安全监控服务单元测试
 *
 * @description 测试 SecurityMonitorService 的安全监控功能
 * @since 1.0.0
 */

import { Test, TestingModule } from "@nestjs/testing";
import { SecurityMonitorService } from "../../src/services/isolation/security-monitor-service.js";
import { IsolationLevel } from "@hl8/domain-kernel";

describe("SecurityMonitorService", () => {
  let service: SecurityMonitorService;
  let mockDatabaseAdapter: any;
  let mockLoggingService: any;

  beforeEach(async () => {
    mockDatabaseAdapter = {
      query: jest.fn(),
      batchInsert: jest.fn(),
    };

    mockLoggingService = {
      info: jest.fn(),
      _error: jest.fn(),
      warn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecurityMonitorService,
        {
          provide: "IDatabaseAdapter",
          useValue: mockDatabaseAdapter,
        },
        {
          provide: "ILoggingService",
          useValue: mockLoggingService,
        },
      ],
    }).compile();

    service = module.get<SecurityMonitorService>(SecurityMonitorService);
  });

  afterEach(async () => {
    await module.close();
  });

  describe("monitorAccess", () => {
    it("should monitor access attempt", async () => {
      // Arrange
      const context = {
        tenantId: "tenant-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      const resource = {
        id: "resource-1",
        tenantId: "tenant-1",
      };

      mockDatabaseAdapter.query.mockResolvedValue({ affectedRows: 1 });

      // Act
      await service.monitorAccess(context, resource);

      // Assert
      expect(mockDatabaseAdapter.query).toHaveBeenCalled();
    });

    it("should track access attempts for anomaly detection", async () => {
      // Arrange
      const context = {
        tenantId: "tenant-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      const resource = {
        id: "resource-1",
        tenantId: "tenant-1",
      };

      // Act
      await service.monitorAccess(context, resource);
      await service.monitorAccess(context, resource);

      // Assert
      const accessAttempts = service.getAccessAttempts();
      expect(accessAttempts.size).toBeGreaterThan(0);
    });
  });

  describe("detectAnomaly", () => {
    it("should detect anomaly in access pattern", () => {
      // Arrange
      const context = {
        tenantId: "tenant-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      const activity = "unusual_access_pattern";

      // Act
      const result = service.detectAnomaly(context, activity);

      // Assert
      expect(typeof result).toBe("boolean");
    });

    it("should return false for normal activity", () => {
      // Arrange
      const context = {
        tenantId: "tenant-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      const activity = "normal_access";

      // Act
      const result = service.detectAnomaly(context, activity);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("reportViolation", () => {
    it("should report security violation", async () => {
      // Arrange
      const context = {
        tenantId: "tenant-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      const violation = "cross_tenant_access";
      const details = { attemptedTenant: "tenant-2" };

      mockDatabaseAdapter.query.mockResolvedValue({ affectedRows: 1 });

      // Act
      await service.reportViolation(context, violation, details);

      // Assert
      expect(mockDatabaseAdapter.query).toHaveBeenCalled();
    });

    it("should log security violation", async () => {
      // Arrange
      const context = {
        tenantId: "tenant-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      const violation = "unauthorized_access";
      const details = { resource: "sensitive-data" };

      // Act
      await service.reportViolation(context, violation, details);

      // Assert
      expect(mockLoggingService.warn).toHaveBeenCalled();
    });
  });

  describe("getSecurityMetrics", () => {
    it("should return security metrics", () => {
      // Act
      const metrics = service.getSecurityMetrics();

      // Assert
      expect(metrics).toBeDefined();
      expect(typeof metrics.totalAccessAttempts).toBe("number");
      expect(typeof metrics.failedAttempts).toBe("number");
      expect(typeof metrics.anomalyDetections).toBe("number");
      expect(typeof metrics.violationsReported).toBe("number");
    });
  });

  describe("addMonitoringRule", () => {
    it("should add monitoring rule", () => {
      // Arrange
      const rule = {
        id: "rule-1",
        name: "High frequency access",
        condition: "access_count > 10",
        severity: "HIGH",
        enabled: true,
      };

      // Act
      service.addMonitoringRule(rule);

      // Assert
      const rules = service.getMonitoringRules();
      expect(rules.length).toBeGreaterThan(0);
    });
  });

  describe("removeMonitoringRule", () => {
    it("should remove monitoring rule", () => {
      // Arrange
      const rule = {
        id: "rule-1",
        name: "High frequency access",
        condition: "access_count > 10",
        severity: "HIGH",
        enabled: true,
      };

      service.addMonitoringRule(rule);

      // Act
      service.removeMonitoringRule("rule-1");

      // Assert
      const rules = service.getMonitoringRules();
      expect(rules.find((r) => r.id === "rule-1")).toBeUndefined();
    });
  });

  describe("getMonitoringRules", () => {
    it("should return all monitoring rules", () => {
      // Act
      const rules = service.getMonitoringRules();

      // Assert
      expect(Array.isArray(rules)).toBe(true);
    });
  });

  describe("updateMonitoringRule", () => {
    it("should update existing monitoring rule", () => {
      // Arrange
      const rule = {
        id: "rule-1",
        name: "High frequency access",
        condition: "access_count > 10",
        severity: "HIGH",
        enabled: true,
      };

      const updatedRule = {
        ...rule,
        severity: "CRITICAL",
      };

      service.addMonitoringRule(rule);

      // Act
      service.updateMonitoringRule("rule-1", updatedRule);

      // Assert
      const rules = service.getMonitoringRules();
      const foundRule = rules.find((r) => r.id === "rule-1");
      expect(foundRule?.severity).toBe("CRITICAL");
    });
  });

  describe("getSecurityEvents", () => {
    it("should return security events", () => {
      // Act
      const events = service.getSecurityEvents();

      // Assert
      expect(Array.isArray(events)).toBe(true);
    });
  });

  describe("getAccessAttempts", () => {
    it("should return access attempts map", () => {
      // Act
      const attempts = service.getAccessAttempts();

      // Assert
      expect(attempts).toBeInstanceOf(Map);
    });
  });

  describe("clearAccessAttempts", () => {
    it("should clear access attempts", () => {
      // Arrange
      const context = {
        tenantId: "tenant-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      // Act
      service.clearAccessAttempts(context);

      // Assert
      const attempts = service.getAccessAttempts();
      expect(attempts.size).toBe(0);
    });
  });

  describe("getAnomalyThresholds", () => {
    it("should return anomaly thresholds", () => {
      // Act
      const thresholds = service.getAnomalyThresholds();

      // Assert
      expect(thresholds).toBeDefined();
      expect(thresholds.maxAccessAttempts).toBeDefined();
      expect(thresholds.timeWindow).toBeDefined();
      expect(thresholds.riskLevels).toBeDefined();
    });
  });

  describe("updateAnomalyThresholds", () => {
    it("should update anomaly thresholds", () => {
      // Arrange
      const newThresholds = {
        maxAccessAttempts: 15,
        timeWindow: 600000,
        riskLevels: {
          LOW: 0.2,
          MEDIUM: 0.5,
          HIGH: 0.7,
          CRITICAL: 0.9,
        },
      };

      // Act
      service.updateAnomalyThresholds(newThresholds);

      // Assert
      const thresholds = service.getAnomalyThresholds();
      expect(thresholds.maxAccessAttempts).toBe(15);
      expect(thresholds.timeWindow).toBe(600000);
    });
  });

  describe("generateSecurityReport", () => {
    it("should generate security report", () => {
      // Act
      const report = service.generateSecurityReport();

      // Assert
      expect(report).toBeDefined();
      expect(report.timestamp).toBeInstanceOf(Date);
      expect(report.metrics).toBeDefined();
      expect(report.anomalies).toBeDefined();
      expect(report.violations).toBeDefined();
    });
  });

  describe("exportSecurityLogs", () => {
    it("should export security logs", () => {
      // Act
      const logs = service.exportSecurityLogs();

      // Assert
      expect(Array.isArray(logs)).toBe(true);
    });
  });
});
