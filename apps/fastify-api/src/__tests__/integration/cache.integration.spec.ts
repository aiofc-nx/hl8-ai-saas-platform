/**
 * 缓存集成测试
 *
 * @description 测试缓存模块在 Fastify API 应用中的集成功能
 *
 * ## 测试覆盖
 * - 多级数据隔离功能
 * - 装饰器缓存功能
 * - 缓存性能监控
 * - 缓存键生成和隔离
 * - 错误处理和降级
 */

import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../app.module.js";
import { CacheService } from "@hl8/caching";

describe("缓存集成测试", () => {
  let app: INestApplication;
  let cacheService: CacheService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    cacheService = moduleFixture.get<CacheService>(CacheService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // 清理缓存，确保测试环境干净
    await cacheService.clear("platform");
    await cacheService.clear("tenant");
    await cacheService.clear("organization");
  });

  describe("多级数据隔离测试", () => {
    it("应该正确隔离平台级缓存", async () => {
      const response = await fetch("http://localhost:3000/cache/platform/test-key");
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.isolationLevel).toBe("platform");
      expect(data.id).toContain("platform-");
      expect(data.name).toContain("Platform Data");
    });

    it("应该正确隔离租户级缓存", async () => {
      const response = await fetch("http://localhost:3000/cache/tenant/test-key", {
        headers: {
          "X-Tenant-Id": "tenant-123",
        },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.isolationLevel).toBe("tenant");
      expect(data.id).toContain("tenant-");
      expect(data.name).toContain("Tenant Data");
    });

    it("应该正确隔离组织级缓存", async () => {
      const response = await fetch("http://localhost:3000/cache/organization/test-key", {
        headers: {
          "X-Tenant-Id": "tenant-123",
          "X-Organization-Id": "org-456",
        },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.isolationLevel).toBe("organization");
      expect(data.id).toContain("organization-");
      expect(data.name).toContain("Organization Data");
    });

    it("应该在不同隔离级别间保持数据隔离", async () => {
      // 设置平台级缓存
      const platformResponse = await fetch("http://localhost:3000/cache/platform/shared-key");
      const platformData = await platformResponse.json();

      // 设置租户级缓存
      const tenantResponse = await fetch("http://localhost:3000/cache/tenant/shared-key", {
        headers: {
          "X-Tenant-Id": "tenant-123",
        },
      });
      const tenantData = await tenantResponse.json();

      // 设置组织级缓存
      const orgResponse = await fetch("http://localhost:3000/cache/organization/shared-key", {
        headers: {
          "X-Tenant-Id": "tenant-123",
          "X-Organization-Id": "org-456",
        },
      });
      const orgData = await orgResponse.json();

      // 验证数据隔离
      expect(platformData.id).not.toBe(tenantData.id);
      expect(tenantData.id).not.toBe(orgData.id);
      expect(platformData.isolationLevel).toBe("platform");
      expect(tenantData.isolationLevel).toBe("tenant");
      expect(orgData.isolationLevel).toBe("organization");
    });
  });

  describe("缓存功能测试", () => {
    it("应该正确缓存和返回数据", async () => {
      const key = "cache-test-key";
      
      // 第一次请求，应该生成新数据
      const firstResponse = await fetch(`http://localhost:3000/cache/platform/${key}`);
      const firstData = await firstResponse.json();
      
      expect(firstResponse.status).toBe(200);
      expect(firstData.id).toContain("platform-");
      
      // 第二次请求，应该从缓存返回相同数据
      const secondResponse = await fetch(`http://localhost:3000/cache/platform/${key}`);
      const secondData = await secondResponse.json();
      
      expect(secondResponse.status).toBe(200);
      expect(secondData.id).toBe(firstData.id);
      expect(secondData.timestamp).toBe(firstData.timestamp);
    });

    it("应该支持手动设置缓存", async () => {
      const namespace = "platform";
      const key = "manual-test-key";
      const testData = {
        id: "manual-test",
        name: "Manual Test Data",
        value: "This is manually set data",
        timestamp: new Date().toISOString(),
      };

      // 设置缓存
      const setResponse = await fetch(`http://localhost:3000/cache/${namespace}/${key}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      });

      expect(setResponse.status).toBe(201);
      const setResult = await setResponse.json();
      expect(setResult.success).toBe(true);

      // 验证缓存数据
      const getResponse = await fetch(`http://localhost:3000/cache/${namespace}/${key}`);
      const cachedData = await getResponse.json();

      expect(getResponse.status).toBe(200);
      expect(cachedData.id).toBe(testData.id);
      expect(cachedData.name).toBe(testData.name);
    });

    it("应该支持清除缓存", async () => {
      const namespace = "platform";
      const key = "delete-test-key";

      // 设置缓存
      await fetch(`http://localhost:3000/cache/${namespace}/${key}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "delete-test",
          name: "Delete Test Data",
        }),
      });

      // 验证缓存存在
      const getResponse = await fetch(`http://localhost:3000/cache/${namespace}/${key}`);
      expect(getResponse.status).toBe(200);

      // 清除缓存
      const deleteResponse = await fetch(`http://localhost:3000/cache/${namespace}/${key}`, {
        method: "DELETE",
      });
      expect(deleteResponse.status).toBe(204);

      // 验证缓存已清除（应该生成新数据）
      const finalResponse = await fetch(`http://localhost:3000/cache/${namespace}/${key}`);
      const finalData = await finalResponse.json();
      expect(finalData.id).not.toBe("delete-test");
    });
  });

  describe("性能监控测试", () => {
    it("应该返回缓存性能指标", async () => {
      // 执行一些缓存操作以生成指标
      await fetch("http://localhost:3000/cache/platform/metrics-test-1");
      await fetch("http://localhost:3000/cache/platform/metrics-test-1"); // 缓存命中
      await fetch("http://localhost:3000/cache/platform/metrics-test-2");

      const response = await fetch("http://localhost:3000/cache/metrics");
      const metrics = await response.json();

      expect(response.status).toBe(200);
      expect(metrics).toHaveProperty("hits");
      expect(metrics).toHaveProperty("misses");
      expect(metrics).toHaveProperty("hitRate");
      expect(metrics).toHaveProperty("averageLatency");
      expect(metrics).toHaveProperty("totalOperations");
      expect(metrics).toHaveProperty("errorRate");

      expect(typeof metrics.hits).toBe("number");
      expect(typeof metrics.misses).toBe("number");
      expect(typeof metrics.hitRate).toBe("number");
      expect(typeof metrics.averageLatency).toBe("number");
      expect(typeof metrics.totalOperations).toBe("number");
      expect(typeof metrics.errorRate).toBe("number");

      // 验证指标合理性
      expect(metrics.hits).toBeGreaterThanOrEqual(0);
      expect(metrics.misses).toBeGreaterThanOrEqual(0);
      expect(metrics.hitRate).toBeGreaterThanOrEqual(0);
      expect(metrics.hitRate).toBeLessThanOrEqual(100);
      expect(metrics.totalOperations).toBe(metrics.hits + metrics.misses);
    });
  });

  describe("错误处理测试", () => {
    it("应该处理无效的缓存键", async () => {
      const response = await fetch("http://localhost:3000/cache/platform/");
      expect(response.status).toBe(404);
    });

    it("应该处理缺失的隔离上下文", async () => {
      // 租户级缓存需要 X-Tenant-Id 请求头
      const response = await fetch("http://localhost:3000/cache/tenant/test-key");
      // 应该降级到平台级或返回错误
      expect(response.status).toBe(200);
    });
  });

  describe("并发测试", () => {
    it("应该正确处理并发缓存请求", async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        fetch(`http://localhost:3000/cache/platform/concurrent-test-${i}`)
      );

      const responses = await Promise.all(promises);
      const data = await Promise.all(responses.map(r => r.json()));

      // 验证所有请求都成功
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // 验证数据隔离
      const ids = data.map(d => d.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10);
    });
  });
});
