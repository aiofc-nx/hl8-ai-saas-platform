/**
 * 缓存服务单元测试
 *
 * @description 测试 CacheService 的缓存管理功能
 * @since 1.0.0
 */

import { Test, TestingModule } from "@nestjs/testing";
import { CacheService } from "../../src/services/cache/cache-service.js";

describe("CacheService", () => {
  let service: CacheService;
  let mockCacheAdapter: any;

  beforeEach(async () => {
    mockCacheAdapter = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      has: jest.fn(),
      clear: jest.fn(),
      getHealthStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: "ICacheAdapter",
          useValue: mockCacheAdapter,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  afterEach(async () => {
    await module.close();
  });

  describe("get", () => {
    it("should get value from cache", async () => {
      // Arrange
      const key = "test-key";
      const value = "test-value";

      mockCacheAdapter.get.mockResolvedValue(value);

      // Act
      const result = await service.get(key);

      // Assert
      expect(result).toBe(value);
      expect(mockCacheAdapter.get).toHaveBeenCalledWith(key);
    });

    it("should return undefined for non-existent key", async () => {
      // Arrange
      const key = "non-existent-key";

      mockCacheAdapter.get.mockResolvedValue(undefined);

      // Act
      const result = await service.get(key);

      // Assert
      expect(result).toBeUndefined();
    });

    it("should handle cache get errors", async () => {
      // Arrange
      const key = "test-key";

      mockCacheAdapter.get.mockRejectedValue(new Error("Cache get failed"));

      // Act & Assert
      await expect(service.get(key)).rejects.toThrow("Cache get failed");
    });
  });

  describe("set", () => {
    it("should set value in cache", async () => {
      // Arrange
      const key = "test-key";
      const value = "test-value";
      const ttl = 3600;

      mockCacheAdapter.set.mockResolvedValue(undefined);

      // Act
      await service.set(key, value, ttl);

      // Assert
      expect(mockCacheAdapter.set).toHaveBeenCalledWith(key, value, ttl);
    });

    it("should set value with default TTL", async () => {
      // Arrange
      const key = "test-key";
      const value = "test-value";

      mockCacheAdapter.set.mockResolvedValue(undefined);

      // Act
      await service.set(key, value);

      // Assert
      expect(mockCacheAdapter.set).toHaveBeenCalledWith(key, value, undefined);
    });

    it("should handle cache set errors", async () => {
      // Arrange
      const key = "test-key";
      const value = "test-value";

      mockCacheAdapter.set.mockRejectedValue(new Error("Cache set failed"));

      // Act & Assert
      await expect(service.set(key, value)).rejects.toThrow("Cache set failed");
    });
  });

  describe("del", () => {
    it("should delete value from cache", async () => {
      // Arrange
      const key = "test-key";

      mockCacheAdapter.del.mockResolvedValue(undefined);

      // Act
      await service.del(key);

      // Assert
      expect(mockCacheAdapter.del).toHaveBeenCalledWith(key);
    });

    it("should handle cache delete errors", async () => {
      // Arrange
      const key = "test-key";

      mockCacheAdapter.del.mockRejectedValue(new Error("Cache delete failed"));

      // Act & Assert
      await expect(service.del(key)).rejects.toThrow("Cache delete failed");
    });
  });

  describe("has", () => {
    it("should check if key exists in cache", async () => {
      // Arrange
      const key = "test-key";

      mockCacheAdapter.has.mockResolvedValue(true);

      // Act
      const result = await service.has(key);

      // Assert
      expect(result).toBe(true);
      expect(mockCacheAdapter.has).toHaveBeenCalledWith(key);
    });

    it("should return false for non-existent key", async () => {
      // Arrange
      const key = "non-existent-key";

      mockCacheAdapter.has.mockResolvedValue(false);

      // Act
      const result = await service.has(key);

      // Assert
      expect(result).toBe(false);
    });

    it("should handle cache has errors", async () => {
      // Arrange
      const key = "test-key";

      mockCacheAdapter.has.mockRejectedValue(new Error("Cache has failed"));

      // Act & Assert
      await expect(service.has(key)).rejects.toThrow("Cache has failed");
    });
  });

  describe("clear", () => {
    it("should clear all cache", async () => {
      // Arrange
      mockCacheAdapter.clear.mockResolvedValue(undefined);

      // Act
      await service.clear();

      // Assert
      expect(mockCacheAdapter.clear).toHaveBeenCalled();
    });

    it("should handle cache clear errors", async () => {
      // Arrange
      mockCacheAdapter.clear.mockRejectedValue(new Error("Cache clear failed"));

      // Act & Assert
      await expect(service.clear()).rejects.toThrow("Cache clear failed");
    });
  });

  describe("setStrategy", () => {
    it("should set cache strategy", async () => {
      // Arrange
      const strategy = "LRU";

      // Act
      await service.setStrategy(strategy);

      // Assert
      expect(service.getConfiguration().strategy).toBe(strategy);
    });
  });

  describe("getConfiguration", () => {
    it("should return cache configuration", () => {
      // Act
      const config = service.getConfiguration();

      // Assert
      expect(config).toBeDefined();
      expect(config.strategy).toBeDefined();
      expect(config.defaultTTL).toBeDefined();
      expect(config.maxSize).toBeDefined();
    });
  });

  describe("getStats", () => {
    it("should return cache statistics", () => {
      // Act
      const stats = service.getStats();

      // Assert
      expect(stats).toBeDefined();
      expect(stats.hits).toBeDefined();
      expect(stats.misses).toBeDefined();
      expect(stats.size).toBeDefined();
      expect(stats.memoryUsage).toBeDefined();
    });
  });

  describe("getHealthStatus", () => {
    it("should return cache health status", async () => {
      // Arrange
      mockCacheAdapter.getHealthStatus.mockResolvedValue({
        status: "healthy",
        details: {},
      });

      // Act
      const health = await service.getHealthStatus();

      // Assert
      expect(health).toBeDefined();
      expect(health.status).toBe("healthy");
      expect(health.details).toBeDefined();
    });

    it("should handle cache health check errors", async () => {
      // Arrange
      mockCacheAdapter.getHealthStatus.mockRejectedValue(
        new Error("Health check failed"),
      );

      // Act & Assert
      await expect(service.getHealthStatus()).rejects.toThrow(
        "Health check failed",
      );
    });
  });

  describe("getMetrics", () => {
    it("should return cache metrics", () => {
      // Act
      const metrics = service.getMetrics();

      // Assert
      expect(metrics).toBeDefined();
      expect(metrics.hitRate).toBeDefined();
      expect(metrics.missRate).toBeDefined();
      expect(metrics.averageResponseTime).toBeDefined();
      expect(metrics.memoryUsage).toBeDefined();
    });
  });

  describe("optimize", () => {
    it("should optimize cache performance", () => {
      // Act
      const optimization = service.optimize();

      // Assert
      expect(optimization).toBeDefined();
      expect(optimization.optimized).toBeDefined();
      expect(optimization.improvements).toBeDefined();
    });
  });

  describe("getCacheInfo", () => {
    it("should return cache information", () => {
      // Act
      const info = service.getCacheInfo();

      // Assert
      expect(info).toBeDefined();
      expect(info.name).toBeDefined();
      expect(info.version).toBeDefined();
      expect(info.description).toBeDefined();
      expect(info.features).toBeDefined();
    });
  });

  describe("validateKey", () => {
    it("should validate cache key", () => {
      // Arrange
      const validKey = "valid-key";

      // Act
      const isValid = service.validateKey(validKey);

      // Assert
      expect(isValid).toBe(true);
    });

    it("should reject invalid cache key", () => {
      // Arrange
      const invalidKey = "";

      // Act
      const isValid = service.validateKey(invalidKey);

      // Assert
      expect(isValid).toBe(false);
    });
  });

  describe("getKeyInfo", () => {
    it("should return key information", async () => {
      // Arrange
      const key = "test-key";

      mockCacheAdapter.has.mockResolvedValue(true);

      // Act
      const keyInfo = await service.getKeyInfo(key);

      // Assert
      expect(keyInfo).toBeDefined();
      expect(keyInfo.exists).toBe(true);
      expect(keyInfo.key).toBe(key);
    });
  });

  describe("getKeys", () => {
    it("should return all cache keys", async () => {
      // Arrange
      const keys = ["key1", "key2", "key3"];

      mockCacheAdapter.getKeys = jest.fn().mockResolvedValue(keys);

      // Act
      const result = await service.getKeys();

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(3);
    });

    it("should handle cache keys retrieval errors", async () => {
      // Arrange
      mockCacheAdapter.getKeys = jest
        .fn()
        .mockRejectedValue(new Error("Get keys failed"));

      // Act & Assert
      await expect(service.getKeys()).rejects.toThrow("Get keys failed");
    });
  });
});
