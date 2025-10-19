/**
 * 简化的缓存指标服务单元测试
 *
 * @description 测试简化后的性能监控功能
 *
 * @group monitoring
 */

import { Test, TestingModule } from "@nestjs/testing";
import { SimplifiedCacheMetricsService } from "./cache-metrics.service.js";

describe("SimplifiedCacheMetricsService", () => {
  let service: SimplifiedCacheMetricsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SimplifiedCacheMetricsService],
    }).compile();

    service = module.get<SimplifiedCacheMetricsService>(
      SimplifiedCacheMetricsService,
    );
  });

  describe("recordHit", () => {
    it("should record cache hit with latency", () => {
      service.recordHit(50);

      const metrics = service.getMetrics();
      expect(metrics.hits).toBe(1);
      expect(metrics.totalOperations).toBe(1);
      expect(metrics.totalLatency).toBe(50);
    });

    it("should accumulate multiple hits", () => {
      service.recordHit(50);
      service.recordHit(75);
      service.recordHit(25);

      const metrics = service.getMetrics();
      expect(metrics.hits).toBe(3);
      expect(metrics.totalOperations).toBe(3);
      expect(metrics.totalLatency).toBe(150);
    });
  });

  describe("recordMiss", () => {
    it("should record cache miss with latency", () => {
      service.recordMiss(100);

      const metrics = service.getMetrics();
      expect(metrics.misses).toBe(1);
      expect(metrics.totalOperations).toBe(1);
      expect(metrics.totalLatency).toBe(100);
    });

    it("should accumulate multiple misses", () => {
      service.recordMiss(100);
      service.recordMiss(150);
      service.recordMiss(200);

      const metrics = service.getMetrics();
      expect(metrics.misses).toBe(3);
      expect(metrics.totalOperations).toBe(3);
      expect(metrics.totalLatency).toBe(450);
    });
  });

  describe("recordError", () => {
    it("should record cache error with latency", () => {
      service.recordError(200);

      const metrics = service.getMetrics();
      expect(metrics.errors).toBe(1);
      expect(metrics.totalOperations).toBe(1);
      expect(metrics.totalLatency).toBe(200);
    });

    it("should accumulate multiple errors", () => {
      service.recordError(200);
      service.recordError(300);
      service.recordError(250);

      const metrics = service.getMetrics();
      expect(metrics.errors).toBe(3);
      expect(metrics.totalOperations).toBe(3);
      expect(metrics.totalLatency).toBe(750);
    });
  });

  describe("getMetrics", () => {
    it("should return correct metrics for hits only", () => {
      service.recordHit(50);
      service.recordHit(75);
      service.recordHit(25);

      const metrics = service.getMetrics();
      expect(metrics.hits).toBe(3);
      expect(metrics.misses).toBe(0);
      expect(metrics.errors).toBe(0);
      expect(metrics.hitRate).toBe(100);
      expect(metrics.averageLatency).toBe(50);
      expect(metrics.totalOperations).toBe(3);
      expect(metrics.totalLatency).toBe(150);
    });

    it("should return correct metrics for misses only", () => {
      service.recordMiss(100);
      service.recordMiss(150);

      const metrics = service.getMetrics();
      expect(metrics.hits).toBe(0);
      expect(metrics.misses).toBe(2);
      expect(metrics.errors).toBe(0);
      expect(metrics.hitRate).toBe(0);
      expect(metrics.averageLatency).toBe(125);
      expect(metrics.totalOperations).toBe(2);
      expect(metrics.totalLatency).toBe(250);
    });

    it("should return correct metrics for mixed operations", () => {
      service.recordHit(50);
      service.recordMiss(100);
      service.recordHit(75);
      service.recordError(200);

      const metrics = service.getMetrics();
      expect(metrics.hits).toBe(2);
      expect(metrics.misses).toBe(1);
      expect(metrics.errors).toBe(1);
      expect(metrics.hitRate).toBe(50); // 2 hits out of 4 total operations
      expect(metrics.averageLatency).toBe(106.25); // (50 + 100 + 75 + 200) / 4
      expect(metrics.totalOperations).toBe(4);
      expect(metrics.totalLatency).toBe(425);
    });

    it("should return zero metrics when no operations", () => {
      const metrics = service.getMetrics();
      expect(metrics.hits).toBe(0);
      expect(metrics.misses).toBe(0);
      expect(metrics.errors).toBe(0);
      expect(metrics.hitRate).toBe(0);
      expect(metrics.averageLatency).toBe(0);
      expect(metrics.totalOperations).toBe(0);
      expect(metrics.totalLatency).toBe(0);
    });
  });

  describe("reset", () => {
    it("should reset all metrics to zero", () => {
      service.recordHit(50);
      service.recordMiss(100);
      service.recordError(200);

      service.reset();

      const metrics = service.getMetrics();
      expect(metrics.hits).toBe(0);
      expect(metrics.misses).toBe(0);
      expect(metrics.errors).toBe(0);
      expect(metrics.hitRate).toBe(0);
      expect(metrics.averageLatency).toBe(0);
      expect(metrics.totalOperations).toBe(0);
      expect(metrics.totalLatency).toBe(0);
    });
  });

  describe("getHitRate", () => {
    it("should return correct hit rate", () => {
      service.recordHit(50);
      service.recordHit(75);
      service.recordMiss(100);

      const hitRate = service.getHitRate();
      expect(hitRate).toBeCloseTo(66.67, 1); // 2 hits out of 3 total operations
    });

    it("should return 0 when no operations", () => {
      const hitRate = service.getHitRate();
      expect(hitRate).toBe(0);
    });
  });

  describe("getAverageLatency", () => {
    it("should return correct average latency", () => {
      service.recordHit(50);
      service.recordMiss(100);
      service.recordHit(75);

      const avgLatency = service.getAverageLatency();
      expect(avgLatency).toBe(75); // (50 + 100 + 75) / 3
    });

    it("should return 0 when no operations", () => {
      const avgLatency = service.getAverageLatency();
      expect(avgLatency).toBe(0);
    });
  });

  describe("isPerformanceHealthy", () => {
    it("should return true when performance is healthy", () => {
      service.recordHit(50);
      service.recordHit(75);
      service.recordMiss(100);

      const isHealthy = service.isPerformanceHealthy(80, 100);
      expect(isHealthy).toBe(false); // 66.67% hit rate < 80%, but 75ms latency < 100ms
    });

    it("should return false when hit rate is too low", () => {
      service.recordMiss(50);
      service.recordMiss(75);

      const isHealthy = service.isPerformanceHealthy(80, 100);
      expect(isHealthy).toBe(false); // 0% hit rate < 80%
    });

    it("should return false when latency is too high", () => {
      service.recordHit(150);
      service.recordHit(200);

      const isHealthy = service.isPerformanceHealthy(80, 100);
      expect(isHealthy).toBe(false); // 175ms latency > 100ms
    });

    it("should use custom thresholds", () => {
      service.recordHit(50);
      service.recordMiss(100);

      const isHealthy = service.isPerformanceHealthy(50, 75);
      expect(isHealthy).toBe(true); // 50% hit rate >= 50%, 75ms latency <= 75ms
    });
  });

  describe("logSummary", () => {
    it("should log summary without throwing errors", () => {
      service.recordHit(50);
      service.recordMiss(100);

      expect(() => service.logSummary()).not.toThrow();
    });
  });

  describe("edge cases", () => {
    it("should handle zero latency", () => {
      service.recordHit(0);
      service.recordMiss(0);

      const metrics = service.getMetrics();
      expect(metrics.averageLatency).toBe(0);
    });

    it("should handle very high latency", () => {
      service.recordHit(10000);
      service.recordMiss(20000);

      const metrics = service.getMetrics();
      expect(metrics.averageLatency).toBe(15000);
    });

    it("should handle negative latency gracefully", () => {
      service.recordHit(-10);
      service.recordMiss(-5);

      const metrics = service.getMetrics();
      expect(metrics.totalLatency).toBe(-15);
    });
  });

  describe("performance monitoring", () => {
    it("should track performance over time", () => {
      // 模拟性能监控场景
      for (let i = 0; i < 100; i++) {
        if (i % 3 === 0) {
          service.recordMiss(100 + i);
        } else {
          service.recordHit(50 + i);
        }
      }

      const metrics = service.getMetrics();
      expect(metrics.totalOperations).toBe(100);
      expect(metrics.hits).toBe(66); // 66 hits out of 100 operations
      expect(metrics.misses).toBe(34); // 34 misses out of 100 operations
      expect(metrics.hitRate).toBe(66);
    });
  });
});
