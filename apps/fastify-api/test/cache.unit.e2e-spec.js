/**
 * 缓存模块单元测试（不依赖 Redis）
 *
 * @description 测试缓存模块的基本功能，使用内存模拟
 */

const { Test } = require("@nestjs/testing");
const { CachingModule } = require("@hl8/caching");

describe("缓存模块单元测试", () => {
  let app;
  let cacheService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        CachingModule.forRoot({
          redis: {
            host: "localhost",
            port: 6379,
            // 使用内存模拟，不实际连接 Redis
            lazyConnect: true,
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 0,
          },
          defaultTtl: 300,
          keyPrefix: "test:",
        }),
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    cacheService = app.get("CacheService");
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe("基本缓存操作", () => {
    it("应该能够设置和获取缓存", async () => {
      const key = "test-key";
      const value = {
        message: "Hello, World!",
        timestamp: new Date().toISOString(),
      };

      // 设置缓存
      await cacheService.set("platform", key, value, 60);

      // 获取缓存
      const cached = await cacheService.get("platform", key);

      expect(cached).toBeDefined();
      expect(cached.message).toBe(value.message);
    });

    it("应该能够删除缓存", async () => {
      const key = "test-delete-key";
      const value = { message: "To be deleted" };

      // 设置缓存
      await cacheService.set("platform", key, value, 60);

      // 验证缓存存在
      let cached = await cacheService.get("platform", key);
      expect(cached).toBeDefined();

      // 删除缓存
      await cacheService.del("platform", key);

      // 验证缓存已删除
      cached = await cacheService.get("platform", key);
      expect(cached).toBeNull();
    });

    it("应该能够清除命名空间", async () => {
      const namespace = "test-namespace";
      const key1 = "key1";
      const key2 = "key2";
      const value = { message: "Test value" };

      // 设置多个缓存
      await cacheService.set(namespace, key1, value, 60);
      await cacheService.set(namespace, key2, value, 60);

      // 验证缓存存在
      let cached1 = await cacheService.get(namespace, key1);
      let cached2 = await cacheService.get(namespace, key2);
      expect(cached1).toBeDefined();
      expect(cached2).toBeDefined();

      // 清除命名空间
      await cacheService.clear(namespace);

      // 验证缓存已清除
      cached1 = await cacheService.get(namespace, key1);
      cached2 = await cacheService.get(namespace, key2);
      expect(cached1).toBeNull();
      expect(cached2).toBeNull();
    });
  });

  describe("缓存键生成", () => {
    it("应该生成正确的缓存键", async () => {
      const namespace = "test";
      const key = "sample-key";
      const value = { data: "test" };

      await cacheService.set(namespace, key, value, 60);
      const cached = await cacheService.get(namespace, key);

      expect(cached).toBeDefined();
      expect(cached.data).toBe("test");
    });
  });

  describe("序列化功能", () => {
    it("应该能够序列化复杂对象", async () => {
      const key = "complex-object";
      const value = {
        string: "Hello",
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        object: { nested: "value" },
        date: new Date(),
      };

      await cacheService.set("platform", key, value, 60);
      const cached = await cacheService.get("platform", key);

      expect(cached).toBeDefined();
      expect(cached.string).toBe(value.string);
      expect(cached.number).toBe(value.number);
      expect(cached.boolean).toBe(value.boolean);
      expect(Array.isArray(cached.array)).toBe(true);
      expect(cached.object.nested).toBe(value.object.nested);
    });
  });
});
