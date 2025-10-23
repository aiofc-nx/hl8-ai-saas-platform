/**
 * 健康检查服务单元测试
 *
 * @description 测试 HealthCheckService 的健康检查功能
 * @since 1.0.0
 */

import { Test, TestingModule } from "@nestjs/testing";
import { HealthCheckService } from "../../src/services/performance/health-check-service.js";

describe("HealthCheckService", () => {
  let service: HealthCheckService;
  let mockDatabaseAdapter: any;
  let mockCacheService: any;
  let mockLoggingService: any;

  beforeEach(async () => {
    mockDatabaseAdapter = {
      getHealthStatus: jest.fn(),
      query: jest.fn(),
    };

    mockCacheService = {
      getHealthStatus: jest.fn(),
      get: jest.fn(),
    };

    mockLoggingService = {
      info: jest.fn(),
      _error: jest.fn(),
      warn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthCheckService,
        {
          provide: "IDatabaseAdapter",
          useValue: mockDatabaseAdapter,
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

    service = module.get<HealthCheckService>(HealthCheckService);
  });

  afterEach(async () => {
    await module.close();
  });

  describe("checkHealth", () => {
    it("should check overall health status", async () => {
      // Arrange
      mockDatabaseAdapter.getHealthStatus.mockResolvedValue({
        status: "healthy",
        details: { connected: true },
      });

      mockCacheService.getHealthStatus.mockResolvedValue({
        status: "healthy",
        details: { connected: true },
      });

      // Act
      const health = await service.checkHealth();

      // Assert
      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
      expect(health.details).toBeDefined();
      expect(health.timestamp).toBeInstanceOf(Date);
    });

    it("should return unhealthy status when components fail", async () => {
      // Arrange
      mockDatabaseAdapter.getHealthStatus.mockResolvedValue({
        status: "unhealthy",
        details: { connected: false },
      });

      mockCacheService.getHealthStatus.mockResolvedValue({
        status: "healthy",
        details: { connected: true },
      });

      // Act
      const health = await service.checkHealth();

      // Assert
      expect(health).toBeDefined();
      expect(health.status).toBe("unhealthy");
    });
  });

  describe("getHealthStatus", () => {
    it("should return health status", async () => {
      // Arrange
      mockDatabaseAdapter.getHealthStatus.mockResolvedValue({
        status: "healthy",
        details: { connected: true },
      });

      mockCacheService.getHealthStatus.mockResolvedValue({
        status: "healthy",
        details: { connected: true },
      });

      // Act
      const health = await service.getHealthStatus();

      // Assert
      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
      expect(health.details).toBeDefined();
    });
  });

  describe("getHealthMetrics", () => {
    it("should return health metrics", async () => {
      // Arrange
      mockDatabaseAdapter.getHealthStatus.mockResolvedValue({
        status: "healthy",
        details: { connected: true },
      });

      mockCacheService.getHealthStatus.mockResolvedValue({
        status: "healthy",
        details: { connected: true },
      });

      // Act
      const metrics = await service.getHealthMetrics();

      // Assert
      expect(metrics).toBeDefined();
      expect(metrics.status).toBeDefined();
      expect(metrics.details).toBeDefined();
    });
  });

  describe("checkComponent", () => {
    it("should check specific component health", async () => {
      // Arrange
      const component = "database";

      mockDatabaseAdapter.getHealthStatus.mockResolvedValue({
        status: "healthy",
        details: { connected: true },
      });

      // Act
      const health = await service.checkComponent(component);

      // Assert
      expect(health).toBeDefined();
      expect(health.status).toBe("healthy");
      expect(health.component).toBe(component);
    });

    it("should return unhealthy status for failed component", async () => {
      // Arrange
      const component = "database";

      mockDatabaseAdapter.getHealthStatus.mockResolvedValue({
        status: "unhealthy",
        details: { connected: false },
      });

      // Act
      const health = await service.checkComponent(component);

      // Assert
      expect(health).toBeDefined();
      expect(health.status).toBe("unhealthy");
      expect(health.component).toBe(component);
    });
  });

  describe("getOverallHealth", () => {
    it("should return overall health status", async () => {
      // Arrange
      mockDatabaseAdapter.getHealthStatus.mockResolvedValue({
        status: "healthy",
        details: { connected: true },
      });

      mockCacheService.getHealthStatus.mockResolvedValue({
        status: "healthy",
        details: { connected: true },
      });

      // Act
      const health = await service.getOverallHealth();

      // Assert
      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
      expect(health.details).toBeDefined();
    });
  });

  describe("registerChecker", () => {
    it("should register health checker", () => {
      // Arrange
      const name = "custom-checker";
      const checker = jest.fn().mockResolvedValue({
        status: "healthy",
        details: {},
      });

      // Act
      service.registerChecker(name, checker);

      // Assert
      expect(checker).toBeDefined();
    });
  });

  describe("getComponentStatus", () => {
    it("should return component status", async () => {
      // Arrange
      const componentName = "database";

      mockDatabaseAdapter.getHealthStatus.mockResolvedValue({
        status: "healthy",
        details: { connected: true },
      });

      // Act
      const status = await service.getComponentStatus(componentName);

      // Assert
      expect(status).toBeDefined();
      expect(typeof status).toBe("string");
    });
  });

  describe("getHealthSummary", () => {
    it("should return health summary", async () => {
      // Arrange
      mockDatabaseAdapter.getHealthStatus.mockResolvedValue({
        status: "healthy",
        details: { connected: true },
      });

      mockCacheService.getHealthStatus.mockResolvedValue({
        status: "healthy",
        details: { connected: true },
      });

      // Act
      const summary = await service.getHealthSummary();

      // Assert
      expect(summary).toBeDefined();
      expect(summary.overall).toBeDefined();
      expect(summary.components).toBeDefined();
      expect(summary.timestamp).toBeInstanceOf(Date);
    });
  });

  describe("getHealthHistory", () => {
    it("should return health history", () => {
      // Act
      const history = service.getHealthHistory();

      // Assert
      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe("clearHealthHistory", () => {
    it("should clear health history", () => {
      // Act
      service.clearHealthHistory();

      // Assert
      const history = service.getHealthHistory();
      expect(history.length).toBe(0);
    });
  });

  describe("getHealthConfig", () => {
    it("should return health configuration", () => {
      // Act
      const config = service.getHealthConfig();

      // Assert
      expect(config).toBeDefined();
      expect(config.interval).toBeDefined();
      expect(config.timeout).toBeDefined();
      expect(config.retries).toBeDefined();
    });
  });

  describe("updateHealthConfig", () => {
    it("should update health configuration", () => {
      // Arrange
      const newConfig = {
        interval: 60000,
        timeout: 10000,
        retries: 2,
      };

      // Act
      service.updateHealthConfig(newConfig);

      // Assert
      const config = service.getHealthConfig();
      expect(config.interval).toBe(60000);
      expect(config.timeout).toBe(10000);
      expect(config.retries).toBe(2);
    });
  });

  describe("getHealthAlerts", () => {
    it("should return health alerts", () => {
      // Act
      const alerts = service.getHealthAlerts();

      // Assert
      expect(alerts).toBeDefined();
      expect(Array.isArray(alerts)).toBe(true);
    });
  });

  describe("addHealthAlert", () => {
    it("should add health alert", () => {
      // Arrange
      const alert = {
        id: "alert-1",
        component: "database",
        message: "Database connection failed",
        severity: "high",
        timestamp: new Date(),
      };

      // Act
      service.addHealthAlert(alert);

      // Assert
      const alerts = service.getHealthAlerts();
      expect(alerts.length).toBe(1);
      expect(alerts[0].id).toBe("alert-1");
    });
  });

  describe("clearHealthAlerts", () => {
    it("should clear health alerts", () => {
      // Arrange
      const alert = {
        id: "alert-1",
        component: "database",
        message: "Database connection failed",
        severity: "high",
        timestamp: new Date(),
      };

      service.addHealthAlert(alert);

      // Act
      service.clearHealthAlerts();

      // Assert
      const alerts = service.getHealthAlerts();
      expect(alerts.length).toBe(0);
    });
  });
});
