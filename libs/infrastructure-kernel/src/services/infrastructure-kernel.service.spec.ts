/**
 * 基础设施核心服务单元测试
 *
 * @description 测试 InfrastructureKernelService 的核心功能
 * @since 1.0.0
 */

import { Test, TestingModule } from "@nestjs/testing";
import { InfrastructureKernelService } from "../../src/services/infrastructure-kernel.service.js";

describe("InfrastructureKernelService", () => {
  let service: InfrastructureKernelService;
  let mockServices: any;

  beforeEach(async () => {
    // Create mock services
    mockServices = {
      databaseService: {
        getConnection: jest.fn(),
        createConnection: jest.fn(),
        closeConnection: jest.fn(),
      },
      connectionPoolService: {
        getPool: jest.fn(),
        createPool: jest.fn(),
        closePool: jest.fn(),
      },
      transactionService: {
        beginTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
      },
      cacheService: {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
      },
      isolationManager: {
        validateAccess: jest.fn(),
        checkPermission: jest.fn(),
        getCurrentContext: jest.fn(),
      },
      performanceMonitor: {
        startMonitoring: jest.fn(),
        stopMonitoring: jest.fn(),
        getMetrics: jest.fn(),
      },
      healthCheckService: {
        checkHealth: jest.fn(),
        getHealthStatus: jest.fn(),
      },
      metricsCollector: {
        collectMetrics: jest.fn(),
        getMetrics: jest.fn(),
      },
      performanceOptimizer: {
        optimize: jest.fn(),
        getOptimizationReport: jest.fn(),
      },
      monitoringDashboard: {
        getDashboard: jest.fn(),
        updateDashboard: jest.fn(),
      },
      errorHandler: {
        handleError: jest.fn(),
        getErrorHistory: jest.fn(),
      },
      circuitBreaker: {
        execute: jest.fn(),
        getState: jest.fn(),
      },
      retryManager: {
        retry: jest.fn(),
        getRetryPolicy: jest.fn(),
      },
      applicationKernelIntegration: {
        integrate: jest.fn(),
        getIntegrationStatus: jest.fn(),
      },
      domainKernelIntegration: {
        integrate: jest.fn(),
        getIntegrationStatus: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InfrastructureKernelService,
        {
          provide: "DatabaseService",
          useValue: mockServices.databaseService,
        },
        {
          provide: "ConnectionPoolService",
          useValue: mockServices.connectionPoolService,
        },
        {
          provide: "TransactionService",
          useValue: mockServices.transactionService,
        },
        {
          provide: "CacheService",
          useValue: mockServices.cacheService,
        },
        {
          provide: "IsolationManager",
          useValue: mockServices.isolationManager,
        },
        {
          provide: "PerformanceMonitorService",
          useValue: mockServices.performanceMonitor,
        },
        {
          provide: "HealthCheckService",
          useValue: mockServices.healthCheckService,
        },
        {
          provide: "MetricsCollectorService",
          useValue: mockServices.metricsCollector,
        },
        {
          provide: "PerformanceOptimizerService",
          useValue: mockServices.performanceOptimizer,
        },
        {
          provide: "MonitoringDashboardService",
          useValue: mockServices.monitoringDashboard,
        },
        {
          provide: "ErrorHandlerService",
          useValue: mockServices.errorHandler,
        },
        {
          provide: "CircuitBreakerService",
          useValue: mockServices.circuitBreaker,
        },
        {
          provide: "RetryManagerService",
          useValue: mockServices.retryManager,
        },
        {
          provide: "ApplicationKernelIntegrationService",
          useValue: mockServices.applicationKernelIntegration,
        },
        {
          provide: "DomainKernelIntegrationService",
          useValue: mockServices.domainKernelIntegration,
        },
      ],
    }).compile();

    service = module.get<InfrastructureKernelService>(
      InfrastructureKernelService,
    );
  });

  afterEach(async () => {
    await module.close();
  });

  describe("onModuleInit", () => {
    it("should initialize all services", async () => {
      // Act
      await service.onModuleInit();

      // Assert
      expect(service.isInitialized()).toBe(true);
    });

    it("should register all services", async () => {
      // Act
      await service.onModuleInit();

      // Assert
      const services = service.getAllServices();
      expect(services).toBeDefined();
    });
  });

  describe("onModuleDestroy", () => {
    it("should cleanup all services", async () => {
      // Arrange
      await service.onModuleInit();

      // Act
      await service.onModuleDestroy();

      // Assert
      expect(service.isInitialized()).toBe(false);
    });
  });

  describe("isInitialized", () => {
    it("should return false initially", () => {
      // Act
      const isInitialized = service.isInitialized();

      // Assert
      expect(isInitialized).toBe(false);
    });

    it("should return true after initialization", async () => {
      // Act
      await service.onModuleInit();
      const isInitialized = service.isInitialized();

      // Assert
      expect(isInitialized).toBe(true);
    });
  });

  describe("getService", () => {
    it("should return service by name", async () => {
      // Arrange
      await service.onModuleInit();

      // Act
      const databaseService = service.getService("database");

      // Assert
      expect(databaseService).toBeDefined();
    });

    it("should return undefined for unknown service", async () => {
      // Arrange
      await service.onModuleInit();

      // Act
      const unknownService = service.getService("unknown");

      // Assert
      expect(unknownService).toBeUndefined();
    });
  });

  describe("getAllServices", () => {
    it("should return all registered services", async () => {
      // Arrange
      await service.onModuleInit();

      // Act
      const services = service.getAllServices();

      // Assert
      expect(services).toBeDefined();
      expect(typeof services).toBe("object");
    });
  });

  describe("getHealthStatus", () => {
    it("should return health status", async () => {
      // Arrange
      await service.onModuleInit();
      mockServices.healthCheckService.getHealthStatus.mockResolvedValue({
        status: "healthy",
        services: {},
      });

      // Act
      const healthStatus = await service.getHealthStatus();

      // Assert
      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBe("healthy");
    });
  });

  describe("getPerformanceMetrics", () => {
    it("should return performance metrics", async () => {
      // Arrange
      await service.onModuleInit();
      mockServices.metricsCollector.getMetrics.mockResolvedValue({
        cpu: 50,
        memory: 60,
        responseTime: 100,
      });

      // Act
      const metrics = await service.getPerformanceMetrics();

      // Assert
      expect(metrics).toBeDefined();
      expect(metrics.cpu).toBe(50);
      expect(metrics.memory).toBe(60);
      expect(metrics.responseTime).toBe(100);
    });
  });

  describe("getMonitoringDashboard", () => {
    it("should return monitoring dashboard", async () => {
      // Arrange
      await service.onModuleInit();
      mockServices.monitoringDashboard.getDashboard.mockResolvedValue({
        metrics: {},
        alerts: [],
        charts: [],
      });

      // Act
      const dashboard = await service.getMonitoringDashboard();

      // Assert
      expect(dashboard).toBeDefined();
      expect(dashboard.metrics).toBeDefined();
      expect(dashboard.alerts).toBeDefined();
      expect(dashboard.charts).toBeDefined();
    });
  });

  describe("getErrorHistory", () => {
    it("should return _error history", async () => {
      // Arrange
      await service.onModuleInit();
      mockServices.errorHandler.getErrorHistory.mockResolvedValue([
        {
          id: "_error-1",
          message: "Test _error",
          timestamp: new Date(),
        },
      ]);

      // Act
      const errorHistory = await service.getErrorHistory();

      // Assert
      expect(errorHistory).toBeDefined();
      expect(Array.isArray(errorHistory)).toBe(true);
    });
  });

  describe("getIntegrationStatus", () => {
    it("should return integration status", async () => {
      // Arrange
      await service.onModuleInit();
      mockServices.applicationKernelIntegration.getIntegrationStatus.mockResolvedValue(
        {
          status: "connected",
          lastSync: new Date(),
        },
      );

      // Act
      const integrationStatus = await service.getIntegrationStatus();

      // Assert
      expect(integrationStatus).toBeDefined();
      expect(integrationStatus.status).toBe("connected");
    });
  });

  describe("optimizePerformance", () => {
    it("should optimize performance", async () => {
      // Arrange
      await service.onModuleInit();
      mockServices.performanceOptimizer.optimize.mockResolvedValue({
        optimized: true,
        improvements: ["cache", "database"],
      });

      // Act
      const optimizationResult = await service.optimizePerformance();

      // Assert
      expect(optimizationResult).toBeDefined();
      expect(optimizationResult.optimized).toBe(true);
      expect(optimizationResult.improvements).toBeDefined();
    });
  });

  describe("getOptimizationReport", () => {
    it("should return optimization report", async () => {
      // Arrange
      await service.onModuleInit();
      mockServices.performanceOptimizer.getOptimizationReport.mockResolvedValue(
        {
          report: "Optimization report",
          recommendations: [],
        },
      );

      // Act
      const report = await service.getOptimizationReport();

      // Assert
      expect(report).toBeDefined();
      expect(report.report).toBe("Optimization report");
      expect(report.recommendations).toBeDefined();
    });
  });

  describe("startMonitoring", () => {
    it("should start monitoring", async () => {
      // Arrange
      await service.onModuleInit();

      // Act
      await service.startMonitoring();

      // Assert
      expect(
        mockServices.performanceMonitor.startMonitoring,
      ).toHaveBeenCalled();
    });
  });

  describe("stopMonitoring", () => {
    it("should stop monitoring", async () => {
      // Arrange
      await service.onModuleInit();

      // Act
      await service.stopMonitoring();

      // Assert
      expect(mockServices.performanceMonitor.stopMonitoring).toHaveBeenCalled();
    });
  });

  describe("getServiceStatus", () => {
    it("should return service status", async () => {
      // Arrange
      await service.onModuleInit();

      // Act
      const serviceStatus = service.getServiceStatus();

      // Assert
      expect(serviceStatus).toBeDefined();
      expect(typeof serviceStatus).toBe("object");
    });
  });

  describe("getServiceMetrics", () => {
    it("should return service metrics", async () => {
      // Arrange
      await service.onModuleInit();

      // Act
      const serviceMetrics = service.getServiceMetrics();

      // Assert
      expect(serviceMetrics).toBeDefined();
      expect(typeof serviceMetrics).toBe("object");
    });
  });
});
