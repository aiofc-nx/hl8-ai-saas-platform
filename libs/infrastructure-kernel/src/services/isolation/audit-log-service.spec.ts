/**
 * 审计日志服务单元测试
 *
 * @description 测试 AuditLogService 的审计日志功能
 * @since 1.0.0
 */

import { Test, TestingModule } from "@nestjs/testing";
import { AuditLogService } from "../../src/services/isolation/audit-log-service.js";
import { IsolationLevel } from "@hl8/domain-kernel";

describe("AuditLogService", () => {
  let service: AuditLogService;
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
        AuditLogService,
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

    service = module.get<AuditLogService>(AuditLogService);
  });

  afterEach(async () => {
    await module.close();
  });

  describe("log", () => {
    it("should log audit entry successfully", async () => {
      // Arrange
      const auditLog = {
        action: "create",
        resource: "user",
        userId: "user-1",
        tenantId: "tenant-1",
        details: { name: "test user" },
      };

      mockDatabaseAdapter.query.mockResolvedValue({ affectedRows: 1 });

      // Act
      await service.log(auditLog);

      // Assert
      expect(mockDatabaseAdapter.query).toHaveBeenCalled();
    });

    it("should handle logging errors gracefully", async () => {
      // Arrange
      const auditLog = {
        action: "create",
        resource: "user",
        userId: "user-1",
        tenantId: "tenant-1",
      };

      mockDatabaseAdapter.query.mockRejectedValue(new Error("Database _error"));

      // Act & Assert
      await expect(service.log(auditLog)).resolves.not.toThrow();
    });
  });

  describe("logAccess", () => {
    it("should log access attempt", async () => {
      // Arrange
      const userContext = {
        tenantId: "tenant-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      const resourceContext = {
        tenantId: "tenant-1",
        resourceId: "resource-1",
      };

      mockDatabaseAdapter.query.mockResolvedValue({ affectedRows: 1 });

      // Act
      await service.logAccess(userContext, resourceContext, true);

      // Assert
      expect(mockDatabaseAdapter.query).toHaveBeenCalled();
    });
  });

  describe("logOperation", () => {
    it("should log operation", async () => {
      // Arrange
      const userContext = {
        tenantId: "tenant-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      const operation = "create:user";
      const details = { userId: "user-123" };

      mockDatabaseAdapter.query.mockResolvedValue({ affectedRows: 1 });

      // Act
      await service.logOperation(userContext, operation, details);

      // Assert
      expect(mockDatabaseAdapter.query).toHaveBeenCalled();
    });
  });

  describe("logSecurityEvent", () => {
    it("should log security event", async () => {
      // Arrange
      const userContext = {
        tenantId: "tenant-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      const event = "unauthorized_access";
      const details = { resource: "sensitive-data" };

      mockDatabaseAdapter.query.mockResolvedValue({ affectedRows: 1 });

      // Act
      await service.logSecurityEvent(userContext, event, details);

      // Assert
      expect(mockDatabaseAdapter.query).toHaveBeenCalled();
    });
  });

  describe("getAuditLogs", () => {
    it("should retrieve audit logs", async () => {
      // Arrange
      const filters = { userId: "user-1" };
      const mockLogs = [
        {
          id: "log-1",
          userId: "user-1",
          action: "create",
          resource: "user",
          timestamp: new Date(),
        },
      ];

      mockDatabaseAdapter.query.mockResolvedValue(mockLogs);

      // Act
      const result = await service.getAuditLogs(filters);

      // Assert
      expect(mockDatabaseAdapter.query).toHaveBeenCalled();
      expect(result).toBe(mockLogs);
    });
  });

  describe("configure", () => {
    it("should update audit configuration", () => {
      // Arrange
      const config = {
        enabled: true,
        level: "HIGH",
        retentionDays: 180,
      };

      // Act
      service.configure(config);

      // Assert
      const currentConfig = service.getConfiguration();
      expect(currentConfig.enabled).toBe(true);
      expect(currentConfig.level).toBe("HIGH");
      expect(currentConfig.retentionDays).toBe(180);
    });
  });

  describe("getConfiguration", () => {
    it("should return current configuration", () => {
      // Act
      const config = service.getConfiguration();

      // Assert
      expect(config).toBeDefined();
      expect(config.enabled).toBe(true);
      expect(config.level).toBe("MEDIUM");
      expect(config.retentionDays).toBe(90);
    });
  });
});
