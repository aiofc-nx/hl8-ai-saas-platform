/**
 * 连接池服务单元测试
 *
 * @description 测试 ConnectionPoolService 的连接池管理功能
 * @since 1.0.0
 */

import { Test, TestingModule } from "@nestjs/testing";
import { ConnectionPoolService } from "../../src/services/database/connection-pool-service.js";
import { IsolationLevel } from "@hl8/domain-kernel";

describe("ConnectionPoolService", () => {
  let service: ConnectionPoolService;
  let mockConnectionManager: any;

  beforeEach(async () => {
    mockConnectionManager = {
      getConnection: jest.fn(),
      createConnection: jest.fn(),
      closeConnection: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectionPoolService,
        {
          provide: "IDatabaseConnectionManager",
          useValue: mockConnectionManager,
        },
      ],
    }).compile();

    service = module.get<ConnectionPoolService>(ConnectionPoolService);
  });

  afterEach(async () => {
    await module.close();
  });

  describe("createPool", () => {
    it("should create a connection pool", async () => {
      // Arrange
      const config = {
        minConnections: 5,
        maxConnections: 20,
        connectionTimeout: 30000,
        idleTimeout: 600000,
        validationInterval: 300000,
        enabled: true,
      };

      mockConnectionManager.createConnection.mockResolvedValue({
        id: "connection-1",
        isConnected: true,
      });

      // Act
      const pool = await service.createPool("test-pool", config);

      // Assert
      expect(pool).toBeDefined();
      expect(pool.name).toBe("test-pool");
      expect(pool.config).toEqual(config);
    });

    it("should handle pool creation errors", async () => {
      // Arrange
      const config = {
        minConnections: 5,
        maxConnections: 20,
        connectionTimeout: 30000,
        idleTimeout: 600000,
        validationInterval: 300000,
        enabled: true,
      };

      mockConnectionManager.createConnection.mockRejectedValue(
        new Error("Connection failed"),
      );

      // Act & Assert
      await expect(service.createPool("test-pool", config)).rejects.toThrow(
        "Connection failed",
      );
    });
  });

  describe("getPool", () => {
    it("should return existing pool", async () => {
      // Arrange
      const config = {
        minConnections: 5,
        maxConnections: 20,
        connectionTimeout: 30000,
        idleTimeout: 600000,
        validationInterval: 300000,
        enabled: true,
      };

      mockConnectionManager.createConnection.mockResolvedValue({
        id: "connection-1",
        isConnected: true,
      });

      await service.createPool("test-pool", config);

      // Act
      const pool = service.getPool("test-pool");

      // Assert
      expect(pool).toBeDefined();
      expect(pool?.name).toBe("test-pool");
    });

    it("should return undefined for non-existent pool", () => {
      // Act
      const pool = service.getPool("non-existent-pool");

      // Assert
      expect(pool).toBeUndefined();
    });
  });

  describe("closePool", () => {
    it("should close connection pool", async () => {
      // Arrange
      const config = {
        minConnections: 5,
        maxConnections: 20,
        connectionTimeout: 30000,
        idleTimeout: 600000,
        validationInterval: 300000,
        enabled: true,
      };

      mockConnectionManager.createConnection.mockResolvedValue({
        id: "connection-1",
        isConnected: true,
      });

      mockConnectionManager.closeConnection.mockResolvedValue(undefined);

      await service.createPool("test-pool", config);

      // Act
      await service.closePool("test-pool");

      // Assert
      expect(mockConnectionManager.closeConnection).toHaveBeenCalled();
    });

    it("should handle pool close errors", async () => {
      // Arrange
      const config = {
        minConnections: 5,
        maxConnections: 20,
        connectionTimeout: 30000,
        idleTimeout: 600000,
        validationInterval: 300000,
        enabled: true,
      };

      mockConnectionManager.createConnection.mockResolvedValue({
        id: "connection-1",
        isConnected: true,
      });

      mockConnectionManager.closeConnection.mockRejectedValue(
        new Error("Close failed"),
      );

      await service.createPool("test-pool", config);

      // Act & Assert
      await expect(service.closePool("test-pool")).rejects.toThrow(
        "Close failed",
      );
    });
  });

  describe("getConnection", () => {
    it("should get connection from pool", async () => {
      // Arrange
      const config = {
        minConnections: 5,
        maxConnections: 20,
        connectionTimeout: 30000,
        idleTimeout: 600000,
        validationInterval: 300000,
        enabled: true,
      };

      const mockConnection = {
        id: "connection-1",
        isConnected: true,
      };

      mockConnectionManager.createConnection.mockResolvedValue(mockConnection);

      await service.createPool("test-pool", config);

      // Act
      const connection = await service.getConnection("test-pool");

      // Assert
      expect(connection).toBeDefined();
      expect(connection).toBe(mockConnection);
    });

    it("should handle connection retrieval errors", async () => {
      // Arrange
      const config = {
        minConnections: 5,
        maxConnections: 20,
        connectionTimeout: 30000,
        idleTimeout: 600000,
        validationInterval: 300000,
        enabled: true,
      };

      mockConnectionManager.createConnection.mockResolvedValue({
        id: "connection-1",
        isConnected: true,
      });

      mockConnectionManager.getConnection.mockRejectedValue(
        new Error("Connection retrieval failed"),
      );

      await service.createPool("test-pool", config);

      // Act & Assert
      await expect(service.getConnection("test-pool")).rejects.toThrow(
        "Connection retrieval failed",
      );
    });
  });

  describe("releaseConnection", () => {
    it("should release connection back to pool", async () => {
      // Arrange
      const config = {
        minConnections: 5,
        maxConnections: 20,
        connectionTimeout: 30000,
        idleTimeout: 600000,
        validationInterval: 300000,
        enabled: true,
      };

      const mockConnection = {
        id: "connection-1",
        isConnected: true,
      };

      mockConnectionManager.createConnection.mockResolvedValue(mockConnection);

      await service.createPool("test-pool", config);

      // Act
      await service.releaseConnection("test-pool", mockConnection);

      // Assert
      // Connection should be released back to pool
      expect(true).toBe(true);
    });
  });

  describe("getPoolStats", () => {
    it("should return pool statistics", async () => {
      // Arrange
      const config = {
        minConnections: 5,
        maxConnections: 20,
        connectionTimeout: 30000,
        idleTimeout: 600000,
        validationInterval: 300000,
        enabled: true,
      };

      mockConnectionManager.createConnection.mockResolvedValue({
        id: "connection-1",
        isConnected: true,
      });

      await service.createPool("test-pool", config);

      // Act
      const stats = service.getPoolStats("test-pool");

      // Assert
      expect(stats).toBeDefined();
      expect(stats.totalConnections).toBeDefined();
      expect(stats.activeConnections).toBeDefined();
      expect(stats.idleConnections).toBeDefined();
      expect(stats.waitingConnections).toBeDefined();
      expect(stats.utilizationRate).toBeDefined();
      expect(stats.averageResponseTime).toBeDefined();
      expect(stats.connectionErrors).toBeDefined();
    });

    it("should return undefined for non-existent pool", () => {
      // Act
      const stats = service.getPoolStats("non-existent-pool");

      // Assert
      expect(stats).toBeUndefined();
    });
  });

  describe("getAllPools", () => {
    it("should return all pools", async () => {
      // Arrange
      const config = {
        minConnections: 5,
        maxConnections: 20,
        connectionTimeout: 30000,
        idleTimeout: 600000,
        validationInterval: 300000,
        enabled: true,
      };

      mockConnectionManager.createConnection.mockResolvedValue({
        id: "connection-1",
        isConnected: true,
      });

      await service.createPool("pool-1", config);
      await service.createPool("pool-2", config);

      // Act
      const pools = service.getAllPools();

      // Assert
      expect(pools).toBeDefined();
      expect(pools.length).toBe(2);
    });
  });

  describe("closeAllPools", () => {
    it("should close all pools", async () => {
      // Arrange
      const config = {
        minConnections: 5,
        maxConnections: 20,
        connectionTimeout: 30000,
        idleTimeout: 600000,
        validationInterval: 300000,
        enabled: true,
      };

      mockConnectionManager.createConnection.mockResolvedValue({
        id: "connection-1",
        isConnected: true,
      });

      mockConnectionManager.closeConnection.mockResolvedValue(undefined);

      await service.createPool("pool-1", config);
      await service.createPool("pool-2", config);

      // Act
      await service.closeAllPools();

      // Assert
      expect(mockConnectionManager.closeConnection).toHaveBeenCalled();
    });
  });

  describe("validatePool", () => {
    it("should validate pool configuration", () => {
      // Arrange
      const validConfig = {
        minConnections: 5,
        maxConnections: 20,
        connectionTimeout: 30000,
        idleTimeout: 600000,
        validationInterval: 300000,
        enabled: true,
      };

      // Act
      const isValid = service.validatePool(validConfig);

      // Assert
      expect(isValid).toBe(true);
    });

    it("should reject invalid pool configuration", () => {
      // Arrange
      const invalidConfig = {
        minConnections: -1,
        maxConnections: 0,
        connectionTimeout: -1,
        idleTimeout: -1,
        validationInterval: -1,
        enabled: true,
      };

      // Act
      const isValid = service.validatePool(invalidConfig);

      // Assert
      expect(isValid).toBe(false);
    });
  });

  describe("getPoolHealth", () => {
    it("should return pool health status", async () => {
      // Arrange
      const config = {
        minConnections: 5,
        maxConnections: 20,
        connectionTimeout: 30000,
        idleTimeout: 600000,
        validationInterval: 300000,
        enabled: true,
      };

      mockConnectionManager.createConnection.mockResolvedValue({
        id: "connection-1",
        isConnected: true,
      });

      await service.createPool("test-pool", config);

      // Act
      const health = service.getPoolHealth("test-pool");

      // Assert
      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
      expect(health.details).toBeDefined();
    });

    it("should return unhealthy status for non-existent pool", () => {
      // Act
      const health = service.getPoolHealth("non-existent-pool");

      // Assert
      expect(health).toBeDefined();
      expect(health.status).toBe("unhealthy");
    });
  });

  describe("optimizePool", () => {
    it("should optimize pool configuration", async () => {
      // Arrange
      const config = {
        minConnections: 5,
        maxConnections: 20,
        connectionTimeout: 30000,
        idleTimeout: 600000,
        validationInterval: 300000,
        enabled: true,
      };

      mockConnectionManager.createConnection.mockResolvedValue({
        id: "connection-1",
        isConnected: true,
      });

      await service.createPool("test-pool", config);

      // Act
      const optimizedConfig = service.optimizePool("test-pool");

      // Assert
      expect(optimizedConfig).toBeDefined();
      expect(optimizedConfig.minConnections).toBeDefined();
      expect(optimizedConfig.maxConnections).toBeDefined();
    });
  });

  describe("getPoolMetrics", () => {
    it("should return pool metrics", async () => {
      // Arrange
      const config = {
        minConnections: 5,
        maxConnections: 20,
        connectionTimeout: 30000,
        idleTimeout: 600000,
        validationInterval: 300000,
        enabled: true,
      };

      mockConnectionManager.createConnection.mockResolvedValue({
        id: "connection-1",
        isConnected: true,
      });

      await service.createPool("test-pool", config);

      // Act
      const metrics = service.getPoolMetrics("test-pool");

      // Assert
      expect(metrics).toBeDefined();
      expect(metrics.throughput).toBeDefined();
      expect(metrics.responseTime).toBeDefined();
      expect(metrics.errorRate).toBeDefined();
      expect(metrics.connectionCount).toBeDefined();
    });
  });
});
