# 最佳实践指南

## 🎯 缓存策略

### 1. 缓存键设计

#### 使用有意义的命名空间

```typescript
// ✅ 好的做法
await cacheService.set("users", userId, userData);
await cacheService.set("products", productId, productData);
await cacheService.set("orders", orderId, orderData);

// ❌ 避免的做法
await cacheService.set("data", "key1", data);
await cacheService.set("cache", "item", data);
```

#### 使用一致的键格式

```typescript
// ✅ 好的做法 - 使用一致的格式
const userKey = `user:${userId}`;
const productKey = `product:${productId}`;
const orderKey = `order:${orderId}`;

// ❌ 避免的做法 - 格式不一致
const userKey = `user_${userId}`;
const productKey = `product-${productId}`;
const orderKey = `order:${orderId}`;
```

### 2. TTL 策略

#### 根据数据特性设置 TTL

```typescript
// 用户数据 - 相对稳定，较长 TTL
await cacheService.set("users", userId, userData, 3600); // 1小时

// 产品数据 - 中等稳定性
await cacheService.set("products", productId, productData, 1800); // 30分钟

// 会话数据 - 短期数据
await cacheService.set("sessions", sessionId, sessionData, 300); // 5分钟

// 实时数据 - 很短 TTL
await cacheService.set("realtime", key, data, 60); // 1分钟
```

#### 使用分层 TTL

```typescript
class DataService {
  // 基础数据 - 长 TTL
  async getBaseData(id: string) {
    return (
      (await this.cacheService.get("base", id)) ||
      (await this.loadAndCache("base", id, 3600))
    );
  }

  // 扩展数据 - 中等 TTL
  async getExtendedData(id: string) {
    return (
      (await this.cacheService.get("extended", id)) ||
      (await this.loadAndCache("extended", id, 1800))
    );
  }

  // 实时数据 - 短 TTL
  async getRealtimeData(id: string) {
    return (
      (await this.cacheService.get("realtime", id)) ||
      (await this.loadAndCache("realtime", id, 60))
    );
  }
}
```

## 🔒 数据隔离

### 1. 多级隔离使用

#### 平台级数据

```typescript
// 全局配置、系统设置等
await cacheService.set("platform", "global-config", config);
await cacheService.set("platform", "system-settings", settings);
```

#### 租户级数据

```typescript
// 租户特定配置、租户设置等
// 需要 X-Tenant-Id 请求头
await cacheService.set("tenant", "tenant-config", config);
await cacheService.set("tenant", "tenant-settings", settings);
```

#### 组织级数据

```typescript
// 组织特定数据、团队设置等
// 需要 X-Organization-Id 请求头
await cacheService.set("organization", "org-config", config);
await cacheService.set("organization", "team-settings", settings);
```

### 2. 隔离级别选择

```typescript
class DataService {
  // 敏感数据 - 用户级隔离
  async getUserPreferences(userId: string) {
    return await this.cacheService.get("user", `preferences:${userId}`);
  }

  // 共享数据 - 租户级隔离
  async getTenantSettings(tenantId: string) {
    return await this.cacheService.get("tenant", `settings:${tenantId}`);
  }

  // 全局数据 - 平台级
  async getSystemConfig() {
    return await this.cacheService.get("platform", "system-config");
  }
}
```

## 🚀 性能优化

### 1. 批量操作

```typescript
class BatchCacheService {
  // 批量获取
  async getMultiple(keys: string[]) {
    const promises = keys.map((key) => this.cacheService.get("data", key));
    return await Promise.all(promises);
  }

  // 批量设置
  async setMultiple(items: Array<{ key: string; value: any; ttl?: number }>) {
    const promises = items.map((item) =>
      this.cacheService.set("data", item.key, item.value, item.ttl),
    );
    await Promise.all(promises);
  }
}
```

### 2. 缓存预热

```typescript
@Injectable()
export class CacheWarmupService {
  constructor(private readonly cacheService: CacheService) {}

  async warmupCache() {
    // 预热热门数据
    const hotData = await this.getHotData();
    await this.cacheService.set("hot", "data", hotData, 3600);

    // 预热用户数据
    const activeUsers = await this.getActiveUsers();
    for (const user of activeUsers) {
      await this.cacheService.set("users", user.id, user, 1800);
    }
  }
}
```

### 3. 缓存穿透防护

```typescript
class SecureCacheService {
  // 使用空值缓存防止穿透
  async getData(key: string) {
    const cached = await this.cacheService.get("data", key);

    if (cached === null) {
      // 空值缓存，防止重复查询
      await this.cacheService.set("data", key, null, 60);
      return null;
    }

    return cached;
  }

  // 使用布隆过滤器
  async getDataWithBloomFilter(key: string) {
    if (!this.bloomFilter.mightContain(key)) {
      return null;
    }

    return await this.cacheService.get("data", key);
  }
}
```

## 🛡️ 错误处理

### 1. 降级策略

```typescript
@Injectable()
export class ResilientDataService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly databaseService: DatabaseService,
  ) {}

  async getData(key: string) {
    try {
      // 尝试从缓存获取
      const cached = await this.cacheService.get("data", key);
      if (cached) {
        return cached;
      }
    } catch (error) {
      this.logger.warn("缓存获取失败，降级到数据库", error);
    }

    try {
      // 降级到数据库
      const data = await this.databaseService.getData(key);

      // 尝试缓存结果（忽略失败）
      try {
        await this.cacheService.set("data", key, data, 300);
      } catch (cacheError) {
        this.logger.warn("缓存设置失败", cacheError);
      }

      return data;
    } catch (error) {
      this.logger.error("数据库查询失败", error);
      throw new ServiceUnavailableException("服务暂时不可用");
    }
  }
}
```

### 2. 重试机制

```typescript
class RetryableCacheService {
  async getWithRetry(key: string, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.cacheService.get("data", key);
      } catch (error) {
        if (i === maxRetries - 1) {
          throw error;
        }

        // 指数退避
        await this.delay(Math.pow(2, i) * 100);
      }
    }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

## 🔧 监控和调试

### 1. 性能监控

```typescript
@Injectable()
export class MonitoredCacheService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly metricsService: CacheMetricsService,
  ) {}

  async get(key: string) {
    const start = Date.now();

    try {
      const result = await this.cacheService.get("data", key);
      this.metricsService.recordLatency(Date.now() - start);

      if (result) {
        this.metricsService.incrementHits();
      } else {
        this.metricsService.incrementMisses();
      }

      return result;
    } catch (error) {
      this.metricsService.recordError();
      throw error;
    }
  }
}
```

### 2. 缓存健康检查

```typescript
@Injectable()
export class CacheHealthService {
  constructor(private readonly cacheService: CacheService) {}

  async checkHealth() {
    try {
      const testKey = "health-check";
      const testValue = { timestamp: Date.now() };

      // 测试设置
      await this.cacheService.set("health", testKey, testValue, 10);

      // 测试获取
      const retrieved = await this.cacheService.get("health", testKey);

      // 测试删除
      await this.cacheService.del("health", testKey);

      return {
        status: "healthy",
        latency: Date.now() - testValue.timestamp,
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
      };
    }
  }
}
```

## 📊 缓存模式

### 1. Cache-Aside 模式

```typescript
class CacheAsideService {
  async getData(id: string) {
    // 1. 检查缓存
    let data = await this.cacheService.get("data", id);

    if (!data) {
      // 2. 从数据库获取
      data = await this.databaseService.getData(id);

      // 3. 写入缓存
      if (data) {
        await this.cacheService.set("data", id, data, 300);
      }
    }

    return data;
  }

  async updateData(id: string, newData: any) {
    // 1. 更新数据库
    const result = await this.databaseService.updateData(id, newData);

    // 2. 更新缓存
    await this.cacheService.set("data", id, result, 300);

    return result;
  }
}
```

### 2. Write-Through 模式

```typescript
class WriteThroughService {
  async updateData(id: string, data: any) {
    // 1. 更新数据库
    const result = await this.databaseService.updateData(id, data);

    // 2. 同步更新缓存
    await this.cacheService.set("data", id, result, 300);

    return result;
  }
}
```

### 3. Write-Behind 模式

```typescript
class WriteBehindService {
  private updateQueue = new Map<string, any>();

  async updateData(id: string, data: any) {
    // 1. 立即更新缓存
    await this.cacheService.set("data", id, data, 300);

    // 2. 异步更新数据库
    this.updateQueue.set(id, data);
    this.scheduleDatabaseUpdate(id, data);
  }

  private scheduleDatabaseUpdate(id: string, data: any) {
    setTimeout(async () => {
      try {
        await this.databaseService.updateData(id, data);
        this.updateQueue.delete(id);
      } catch (error) {
        this.logger.error("异步数据库更新失败", error);
      }
    }, 1000);
  }
}
```

## 🧪 测试策略

### 1. 单元测试

```typescript
describe("CacheService", () => {
  let service: CacheService;
  let mockRedis: any;

  beforeEach(async () => {
    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        { provide: "RedisService", useValue: mockRedis },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  it("should cache and retrieve data", async () => {
    const key = "test-key";
    const value = { message: "Hello, World!" };

    mockRedis.get.mockResolvedValue(JSON.stringify(value));
    mockRedis.set.mockResolvedValue("OK");

    await service.set("test", key, value, 60);
    const result = await service.get("test", key);

    expect(result).toEqual(value);
    expect(mockRedis.set).toHaveBeenCalledWith(
      expect.stringContaining(key),
      JSON.stringify(value),
      "EX",
      60,
    );
  });
});
```

### 2. 集成测试

```typescript
describe("Cache Integration", () => {
  let app: INestApplication;
  let cacheService: CacheService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        CachingModule.forRoot({
          redis: { host: "localhost", port: 6379 },
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    cacheService = moduleFixture.get<CacheService>(CacheService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should handle cache operations", async () => {
    const key = "integration-test";
    const value = { test: "data" };

    // 设置缓存
    await cacheService.set("test", key, value, 60);

    // 获取缓存
    const result = await cacheService.get("test", key);
    expect(result).toEqual(value);

    // 删除缓存
    await cacheService.del("test", key);
    const deleted = await cacheService.get("test", key);
    expect(deleted).toBeNull();
  });
});
```

## 🔍 故障排除

### 1. 常见问题

#### 缓存未命中

```typescript
// 检查键格式
const key = "user:123"; // ✅ 正确
const key = "user 123"; // ❌ 包含空格

// 检查命名空间
await cacheService.get("users", "123"); // ✅ 正确
await cacheService.get("user", "123"); // ❌ 命名空间不匹配
```

#### 序列化问题

```typescript
// 避免循环引用
const data = { user: user, profile: user.profile }; // ❌ 可能循环引用
const data = {
  user: { id: user.id, name: user.name },
  profile: { id: user.profile.id, bio: user.profile.bio },
}; // ✅ 扁平化数据
```

### 2. 调试技巧

```typescript
class DebugCacheService {
  async getWithDebug(namespace: string, key: string) {
    console.log(`[CACHE] Getting ${namespace}:${key}`);

    const start = Date.now();
    const result = await this.cacheService.get(namespace, key);
    const duration = Date.now() - start;

    console.log(
      `[CACHE] ${result ? "HIT" : "MISS"} ${namespace}:${key} (${duration}ms)`,
    );

    return result;
  }
}
```

这些最佳实践将帮助你更好地使用缓存模块，提高应用性能和可靠性。
