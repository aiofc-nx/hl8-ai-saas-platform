/**
 * 缓存端到端测试
 *
 * @description 测试缓存模块的完整工作流，包括HTTP请求、数据隔离、性能监控等
 *
 * ## 测试覆盖
 * - 缓存API端点的完整工作流
 * - 多级数据隔离的端到端验证
 * - 装饰器缓存的端到端测试
 * - 性能监控的端到端验证
 * - 错误处理和降级机制
 */

import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module.js";
import { CacheService } from "@hl8/caching";

describe("缓存端到端测试", () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let cacheService: CacheService;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    cacheService = moduleFixture.get<CacheService>(CacheService);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await moduleFixture.close();
  });

  beforeEach(async () => {
    // 清理缓存，确保测试环境干净
    await cacheService.clear("platform");
    await cacheService.clear("tenant");
    await cacheService.clear("organization");
  });

  describe("缓存API端点测试", () => {
    it("应该支持平台级缓存API", async () => {
      const key = "platform-e2e-test";
      const expectedData = {
        id: expect.stringContaining("platform-"),
        name: expect.stringContaining("Platform Data"),
        value: expect.stringContaining("Platform value"),
        timestamp: expect.any(String),
        isolationLevel: "platform",
      };

      // 第一次请求，应该生成新数据
      const response1 = await fetch(`http://localhost:3000/cache/platform/${key}`);
      expect(response1.status).toBe(200);
      const data1 = await response1.json();
      expect(data1).toMatchObject(expectedData);

      // 第二次请求，应该从缓存返回相同数据
      const response2 = await fetch(`http://localhost:3000/cache/platform/${key}`);
      expect(response2.status).toBe(200);
      const data2 = await response2.json();
      expect(data2).toEqual(data1);
    });

    it("应该支持租户级缓存API", async () => {
      const key = "tenant-e2e-test";
      const headers = {
        "X-Tenant-Id": "tenant-123",
      };

      const expectedData = {
        id: expect.stringContaining("tenant-"),
        name: expect.stringContaining("Tenant Data"),
        value: expect.stringContaining("Tenant value"),
        timestamp: expect.any(String),
        isolationLevel: "tenant",
      };

      // 第一次请求，应该生成新数据
      const response1 = await fetch(`http://localhost:3000/cache/tenant/${key}`, {
        headers,
      });
      expect(response1.status).toBe(200);
      const data1 = await response1.json();
      expect(data1).toMatchObject(expectedData);

      // 第二次请求，应该从缓存返回相同数据
      const response2 = await fetch(`http://localhost:3000/cache/tenant/${key}`, {
        headers,
      });
      expect(response2.status).toBe(200);
      const data2 = await response2.json();
      expect(data2).toEqual(data1);
    });

    it("应该支持组织级缓存API", async () => {
      const key = "organization-e2e-test";
      const headers = {
        "X-Tenant-Id": "tenant-123",
        "X-Organization-Id": "org-456",
      };

      const expectedData = {
        id: expect.stringContaining("organization-"),
        name: expect.stringContaining("Organization Data"),
        value: expect.stringContaining("Organization value"),
        timestamp: expect.any(String),
        isolationLevel: "organization",
      };

      // 第一次请求，应该生成新数据
      const response1 = await fetch(`http://localhost:3000/cache/organization/${key}`, {
        headers,
      });
      expect(response1.status).toBe(200);
      const data1 = await response1.json();
      expect(data1).toMatchObject(expectedData);

      // 第二次请求，应该从缓存返回相同数据
      const response2 = await fetch(`http://localhost:3000/cache/organization/${key}`, {
        headers,
      });
      expect(response2.status).toBe(200);
      const data2 = await response2.json();
      expect(data2).toEqual(data1);
    });
  });

  describe("多级数据隔离端到端测试", () => {
    it("应该在不同隔离级别间保持数据隔离", async () => {
      const key = "isolation-e2e-test";
      const platformHeaders = {};
      const tenantHeaders = { "X-Tenant-Id": "tenant-123" };
      const orgHeaders = {
        "X-Tenant-Id": "tenant-123",
        "X-Organization-Id": "org-456",
      };

      // 设置不同级别的缓存
      const platformResponse = await fetch(`http://localhost:3000/cache/platform/${key}`, {
        headers: platformHeaders,
      });
      const tenantResponse = await fetch(`http://localhost:3000/cache/tenant/${key}`, {
        headers: tenantHeaders,
      });
      const orgResponse = await fetch(`http://localhost:3000/cache/organization/${key}`, {
        headers: orgHeaders,
      });

      expect(platformResponse.status).toBe(200);
      expect(tenantResponse.status).toBe(200);
      expect(orgResponse.status).toBe(200);

      const platformData = await platformResponse.json();
      const tenantData = await tenantResponse.json();
      const orgData = await orgResponse.json();

      // 验证数据隔离
      expect(platformData.isolationLevel).toBe("platform");
      expect(tenantData.isolationLevel).toBe("tenant");
      expect(orgData.isolationLevel).toBe("organization");

      expect(platformData.id).not.toBe(tenantData.id);
      expect(tenantData.id).not.toBe(orgData.id);
      expect(platformData.id).not.toBe(orgData.id);
    });

    it("应该支持不同租户间的数据隔离", async () => {
      const key = "tenant-isolation-test";
      const tenant1Headers = { "X-Tenant-Id": "tenant-1" };
      const tenant2Headers = { "X-Tenant-Id": "tenant-2" };

      // 租户1的缓存
      const tenant1Response = await fetch(`http://localhost:3000/cache/tenant/${key}`, {
        headers: tenant1Headers,
      });
      expect(tenant1Response.status).toBe(200);
      const tenant1Data = await tenant1Response.json();

      // 租户2的缓存
      const tenant2Response = await fetch(`http://localhost:3000/cache/tenant/${key}`, {
        headers: tenant2Headers,
      });
      expect(tenant2Response.status).toBe(200);
      const tenant2Data = await tenant2Response.json();

      // 验证租户间数据隔离
      expect(tenant1Data.id).not.toBe(tenant2Data.id);
      expect(tenant1Data.value).not.toBe(tenant2Data.value);
    });
  });

  describe("缓存管理API测试", () => {
    it("应该支持手动设置缓存", async () => {
      const namespace = "platform";
      const key = "manual-e2e-test";
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
      expect(setResult.message).toContain("Cache set");

      // 验证缓存数据
      const getResponse = await fetch(`http://localhost:3000/cache/${namespace}/${key}`);
      expect(getResponse.status).toBe(200);
      const cachedData = await getResponse.json();

      expect(cachedData.id).toBe(testData.id);
      expect(cachedData.name).toBe(testData.name);
    });

    it("应该支持删除缓存", async () => {
      const namespace = "platform";
      const key = "delete-e2e-test";

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

      // 删除缓存
      const deleteResponse = await fetch(`http://localhost:3000/cache/${namespace}/${key}`, {
        method: "DELETE",
      });
      expect(deleteResponse.status).toBe(204);

      // 验证缓存已删除（应该生成新数据）
      const finalResponse = await fetch(`http://localhost:3000/cache/${namespace}/${key}`);
      expect(finalResponse.status).toBe(200);
      const finalData = await finalResponse.json();
      expect(finalData.id).not.toBe("delete-test");
    });

    it("应该支持清除命名空间缓存", async () => {
      const namespace = "platform";
      const keys = ["clear-test-1", "clear-test-2", "clear-test-3"];

      // 设置多个缓存
      for (const key of keys) {
        await fetch(`http://localhost:3000/cache/${namespace}/${key}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: `clear-${key}`,
            name: `Clear Test ${key}`,
          }),
        });
      }

      // 验证所有缓存都存在
      for (const key of keys) {
        const response = await fetch(`http://localhost:3000/cache/${namespace}/${key}`);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.id).toBe(`clear-${key}`);
      }

      // 清除命名空间
      const clearResponse = await fetch(`http://localhost:3000/cache/${namespace}`, {
        method: "DELETE",
      });
      expect(clearResponse.status).toBe(204);

      // 验证所有缓存都已清除（应该生成新数据）
      for (const key of keys) {
        const response = await fetch(`http://localhost:3000/cache/${namespace}/${key}`);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.id).not.toBe(`clear-${key}`);
      }
    });
  });

  describe("性能监控端到端测试", () => {
    it("应该返回缓存性能指标", async () => {
      // 执行一些缓存操作以生成指标
      await fetch("http://localhost:3000/cache/platform/metrics-test-1");
      await fetch("http://localhost:3000/cache/platform/metrics-test-1"); // 缓存命中
      await fetch("http://localhost:3000/cache/platform/metrics-test-2");

      const response = await fetch("http://localhost:3000/cache/metrics");
      expect(response.status).toBe(200);
      const metrics = await response.json();

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

    it("应该正确计算命中率", async () => {
      // 执行已知的缓存操作
      await fetch("http://localhost:3000/cache/platform/hit-rate-test");
      await fetch("http://localhost:3000/cache/platform/hit-rate-test"); // 命中
      await fetch("http://localhost:3000/cache/platform/hit-rate-test"); // 命中
      await fetch("http://localhost:3000/cache/platform/miss-test"); // 未命中

      const response = await fetch("http://localhost:3000/cache/metrics");
      expect(response.status).toBe(200);
      const metrics = await response.json();

      // 应该有2次命中，1次未命中，命中率应该是66.67%
      expect(metrics.hits).toBeGreaterThanOrEqual(2);
      expect(metrics.misses).toBeGreaterThanOrEqual(1);
      expect(metrics.hitRate).toBeGreaterThan(50);
    });
  });

  describe("错误处理端到端测试", () => {
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

    it("应该处理无效的JSON数据", async () => {
      const response = await fetch("http://localhost:3000/cache/platform/invalid-json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "invalid json",
      });

      // 应该返回400错误
      expect(response.status).toBe(400);
    });
  });

  describe("并发处理端到端测试", () => {
    it("应该正确处理并发缓存请求", async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        fetch(`http://localhost:3000/cache/platform/concurrent-e2e-test-${i}`)
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

    it("应该正确处理并发读写操作", async () => {
      const writePromises = Array.from({ length: 5 }, async (_, i) => {
        const key = `concurrent-write-${i}`;
        const value = { id: `write-${i}`, timestamp: Date.now() };
        
        return fetch(`http://localhost:3000/cache/platform/${key}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(value),
        });
      });

      const readPromises = Array.from({ length: 5 }, async (_, i) => {
        const key = `concurrent-write-${i}`;
        return fetch(`http://localhost:3000/cache/platform/${key}`);
      });

      // 并发执行读写操作
      const [writeResults, readResults] = await Promise.all([
        Promise.all(writePromises),
        Promise.all(readPromises),
      ]);

      // 验证操作成功
      expect(writeResults).toHaveLength(5);
      expect(readResults).toHaveLength(5);

      writeResults.forEach(response => {
        expect(response.status).toBe(201);
      });

      readResults.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe("完整工作流测试", () => {
    it("应该支持完整的缓存生命周期", async () => {
      const namespace = "platform";
      const key = "lifecycle-test";
      const testData = {
        id: "lifecycle-test",
        name: "Lifecycle Test Data",
        value: "This is lifecycle test data",
        timestamp: new Date().toISOString(),
      };

      // 1. 设置缓存
      const setResponse = await fetch(`http://localhost:3000/cache/${namespace}/${key}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      });
      expect(setResponse.status).toBe(201);

      // 2. 获取缓存
      const getResponse = await fetch(`http://localhost:3000/cache/${namespace}/${key}`);
      expect(getResponse.status).toBe(200);
      const cachedData = await getResponse.json();
      expect(cachedData.id).toBe(testData.id);

      // 3. 更新缓存
      const updatedData = { ...testData, value: "Updated value" };
      const updateResponse = await fetch(`http://localhost:3000/cache/${namespace}/${key}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });
      expect(updateResponse.status).toBe(201);

      // 4. 验证更新
      const updatedGetResponse = await fetch(`http://localhost:3000/cache/${namespace}/${key}`);
      expect(updatedGetResponse.status).toBe(200);
      const updatedCachedData = await updatedGetResponse.json();
      expect(updatedCachedData.value).toBe("Updated value");

      // 5. 删除缓存
      const deleteResponse = await fetch(`http://localhost:3000/cache/${namespace}/${key}`, {
        method: "DELETE",
      });
      expect(deleteResponse.status).toBe(204);

      // 6. 验证删除
      const finalGetResponse = await fetch(`http://localhost:3000/cache/${namespace}/${key}`);
      expect(finalGetResponse.status).toBe(200);
      const finalData = await finalGetResponse.json();
      expect(finalData.id).not.toBe(testData.id);
    });
  });
});
