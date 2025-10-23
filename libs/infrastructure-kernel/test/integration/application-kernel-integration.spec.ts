/**
 * 应用层集成服务单元测试
 *
 * @description 测试 ApplicationKernelIntegrationService 的集成功能
 * @since 1.0.0
 */

import { Test, TestingModule } from "@nestjs/testing";
import { ApplicationKernelIntegrationService } from "../../src/integration/application-kernel-integration.js";

describe("ApplicationKernelIntegrationService", () => {
  let service: ApplicationKernelIntegrationService;
  let mockConnectionManager: any;
  let mockCacheService: any;
  let mockLoggingService: any;

  beforeEach(async () => {
    mockConnectionManager = {
      getConnection: jest.fn(),
      createConnection: jest.fn(),
      closeConnection: jest.fn(),
    };

    mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    mockLoggingService = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationKernelIntegrationService,
        {
          provide: "IDatabaseConnectionManager",
          useValue: mockConnectionManager,
        },
        {
          provide: "ICacheService",
          useValue: mockCacheService,
        },
        {
          provide: "ILoggingService",
          useValue: mockLoggingService,
        },
      ],
    }).compile();

    service = module.get<ApplicationKernelIntegrationService>(
      ApplicationKernelIntegrationService,
    );
  });

  afterEach(async () => {
    await module.close();
  });

  describe("integrate", () => {
    it("should integrate with application kernel", async () => {
      // Arrange
      const config = {
        enabled: true,
        databaseConnection: "default",
        timeout: 30000,
        retryAttempts: 3,
      };

      mockConnectionManager.getConnection.mockResolvedValue({
        name: "default",
        isConnected: true,
      });

      // Act
      const result = await service.integrate(config);

      // Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it("should handle integration errors", async () => {
      // Arrange
      const config = {
        enabled: true,
        databaseConnection: "default",
        timeout: 30000,
        retryAttempts: 3,
      };

      mockConnectionManager.getConnection.mockRejectedValue(
        new Error("Connection failed"),
      );

      // Act
      const result = await service.integrate(config);

      // Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
    });
  });

  describe("getIntegrationStatus", () => {
    it("should return integration status", async () => {
      // Act
      const status = await service.getIntegrationStatus();

      // Assert
      expect(status).toBeDefined();
      expect(status.connected).toBeDefined();
      expect(status.lastSync).toBeDefined();
    });
  });

  describe("configure", () => {
    it("should update integration configuration", () => {
      // Arrange
      const newConfig = {
        enabled: true,
        databaseConnection: "new-connection",
        timeout: 60000,
        retryAttempts: 5,
      };

      // Act
      service.configure(newConfig);

      // Assert
      const currentConfig = service.getConfiguration();
      expect(currentConfig.databaseConnection).toBe("new-connection");
      expect(currentConfig.timeout).toBe(60000);
      expect(currentConfig.retryAttempts).toBe(5);
    });
  });

  describe("getConfiguration", () => {
    it("should return current configuration", () => {
      // Act
      const config = service.getConfiguration();

      // Assert
      expect(config).toBeDefined();
      expect(config.enabled).toBe(true);
      expect(config.databaseConnection).toBe("default");
      expect(config.timeout).toBe(30000);
      expect(config.retryAttempts).toBe(3);
    });
  });

  describe("isEnabled", () => {
    it("should return true when integration is enabled", () => {
      // Act
      const isEnabled = service.isEnabled();

      // Assert
      expect(isEnabled).toBe(true);
    });

    it("should return false when integration is disabled", () => {
      // Arrange
      service.configure({ enabled: false } as any);

      // Act
      const isEnabled = service.isEnabled();

      // Assert
      expect(isEnabled).toBe(false);
    });
  });

  describe("getConnectionStatus", () => {
    it("should return connection status", async () => {
      // Arrange
      mockConnectionManager.getConnection.mockResolvedValue({
        name: "default",
        isConnected: true,
      });

      // Act
      const status = await service.getConnectionStatus();

      // Assert
      expect(status).toBeDefined();
      expect(status.connected).toBe(true);
    });
  });

  describe("testConnection", () => {
    it("should test database connection", async () => {
      // Arrange
      mockConnectionManager.getConnection.mockResolvedValue({
        name: "default",
        isConnected: true,
      });

      // Act
      const result = await service.testConnection();

      // Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it("should handle connection test failure", async () => {
      // Arrange
      mockConnectionManager.getConnection.mockRejectedValue(
        new Error("Connection failed"),
      );

      // Act
      const result = await service.testConnection();

      // Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
    });
  });

  describe("getPerformanceMetrics", () => {
    it("should return performance metrics", async () => {
      // Act
      const metrics = await service.getPerformanceMetrics();

      // Assert
      expect(metrics).toBeDefined();
      expect(metrics.responseTime).toBeDefined();
      expect(metrics.throughput).toBeDefined();
      expect(metrics.errorRate).toBeDefined();
    });
  });

  describe("getHealthStatus", () => {
    it("should return health status", async () => {
      // Act
      const health = await service.getHealthStatus();

      // Assert
      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
      expect(health.details).toBeDefined();
    });
  });

  describe("disconnect", () => {
    it("should disconnect from application kernel", async () => {
      // Act
      const result = await service.disconnect();

      // Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe("reconnect", () => {
    it("should reconnect to application kernel", async () => {
      // Arrange
      mockConnectionManager.getConnection.mockResolvedValue({
        name: "default",
        isConnected: true,
      });

      // Act
      const result = await service.reconnect();

      // Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe("getIntegrationInfo", () => {
    it("should return integration information", () => {
      // Act
      const info = service.getIntegrationInfo();

      // Assert
      expect(info).toBeDefined();
      expect(info.name).toBeDefined();
      expect(info.version).toBeDefined();
      expect(info.description).toBeDefined();
    });
  });

  describe("validateConfiguration", () => {
    it("should validate configuration", () => {
      // Arrange
      const config = {
        enabled: true,
        databaseConnection: "default",
        timeout: 30000,
        retryAttempts: 3,
      };

      // Act
      const isValid = service.validateConfiguration(config);

      // Assert
      expect(isValid).toBe(true);
    });

    it("should reject invalid configuration", () => {
      // Arrange
      const config = {
        enabled: true,
        databaseConnection: "",
        timeout: -1,
        retryAttempts: -1,
      };

      // Act
      const isValid = service.validateConfiguration(config);

      // Assert
      expect(isValid).toBe(false);
    });
  });
});
