# 故障排除指南

## 🚨 常见问题

### 1. Redis 连接问题

#### 问题：无法连接到 Redis

**错误信息**:
```
RedisConnectionError: Redis connection failed: 无法连接到 Redis
```

**解决方案**:

1. **检查 Redis 服务状态**:
```bash
# 检查 Redis 是否运行
docker ps | grep redis
redis-cli ping
```

2. **检查连接配置**:
```typescript
// 确保配置正确
CachingModule.forRoot({
  redis: {
    host: 'localhost', // 或 Redis 服务器地址
    port: 6379,       // 或 Redis 端口
    password: 'your-password', // 如果设置了密码
  },
})
```

3. **检查网络连接**:
```bash
# 测试网络连接
telnet localhost 6379
```

#### 问题：Redis 连接超时

**解决方案**:

```typescript
CachingModule.forRoot({
  redis: {
    host: 'localhost',
    port: 6379,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true, // 延迟连接
  },
})
```

### 2. 缓存键问题

#### 问题：缓存键包含无效字符

**错误信息**:
```
CacheKeyValidationError: 键名包含无效字符，只能包含字母、数字、冒号、下划线和连字符
```

**解决方案**:

```typescript
// 清理键名
function sanitizeKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9:_-]/g, '_');
}

const cleanKey = sanitizeKey('user:123@domain.com');
await cacheService.set('users', cleanKey, data);
```

#### 问题：键名过长

**解决方案**:

```typescript
// 使用哈希缩短键名
import { createHash } from 'crypto';

function createShortKey(key: string): string {
  const hash = createHash('md5').update(key).digest('hex');
  return `k:${hash}`;
}

const shortKey = createShortKey('very-long-key-name');
await cacheService.set('data', shortKey, data);
```

### 3. 序列化问题

#### 问题：无法序列化数据

**错误信息**:
```
CacheSerializationError: 无法序列化数据
```

**解决方案**:

```typescript
// 避免循环引用
function sanitizeData(data: any): any {
  return JSON.parse(JSON.stringify(data));
}

// 处理特殊对象
function prepareForCache(data: any): any {
  if (data instanceof Date) {
    return { __type: 'Date', value: data.toISOString() };
  }
  
  if (data instanceof Buffer) {
    return { __type: 'Buffer', value: data.toString('base64') };
  }
  
  return data;
}
```

#### 问题：反序列化失败

**解决方案**:

```typescript
function restoreFromCache(data: any): any {
  if (data && typeof data === 'object') {
    if (data.__type === 'Date') {
      return new Date(data.value);
    }
    
    if (data.__type === 'Buffer') {
      return Buffer.from(data.value, 'base64');
    }
  }
  
  return data;
}
```

### 4. 性能问题

#### 问题：缓存操作缓慢

**诊断步骤**:

1. **检查 Redis 性能**:
```bash
# 监控 Redis 性能
redis-cli --latency-history -i 1
```

2. **检查网络延迟**:
```typescript
// 添加性能监控
class MonitoredCacheService {
  async get(namespace: string, key: string) {
    const start = Date.now();
    const result = await this.cacheService.get(namespace, key);
    const duration = Date.now() - start;
    
    if (duration > 100) { // 超过 100ms
      console.warn(`Slow cache operation: ${duration}ms for ${namespace}:${key}`);
    }
    
    return result;
  }
}
```

3. **优化连接池**:
```typescript
CachingModule.forRoot({
  redis: {
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: 1,
    retryDelayOnFailover: 50,
    lazyConnect: true,
  },
})
```

#### 问题：内存使用过高

**解决方案**:

1. **设置合理的 TTL**:
```typescript
// 根据数据特性设置 TTL
await cacheService.set('users', userId, userData, 3600);     // 1小时
await cacheService.set('sessions', sessionId, data, 300);    // 5分钟
await cacheService.set('realtime', key, data, 60);           // 1分钟
```

2. **定期清理缓存**:
```typescript
@Cron('0 2 * * *') // 每天凌晨2点
async cleanupCache() {
  // 清理过期数据
  await this.cacheService.clear('temp');
  await this.cacheService.clear('sessions');
}
```

### 5. 多级隔离问题

#### 问题：隔离级别不正确

**错误信息**:
```
IsolationValidationError: 缺少必要的隔离标识符
```

**解决方案**:

```typescript
// 确保请求头正确设置
const headers = {
  'X-Tenant-Id': 'tenant-123',        // 租户级隔离
  'X-Organization-Id': 'org-456',     // 组织级隔离
  'X-Department-Id': 'dept-789',       // 部门级隔离
  'X-User-Id': 'user-001',             // 用户级隔离
};

// 在服务中验证隔离级别
class IsolatedDataService {
  async getData(key: string) {
    const isolationLevel = this.getIsolationLevel();
    
    if (isolationLevel === 'tenant' && !this.hasTenantId()) {
      throw new Error('租户级隔离需要 X-Tenant-Id 请求头');
    }
    
    return await this.cacheService.get(isolationLevel, key);
  }
}
```

### 6. 装饰器问题

#### 问题：装饰器不生效

**解决方案**:

1. **检查方法签名**:
```typescript
// ✅ 正确 - 异步方法
@Cacheable('users', 300)
async getUser(id: string) {
  return await this.userRepository.findById(id);
}

// ❌ 错误 - 同步方法
@Cacheable('users', 300)
getUser(id: string) {
  return this.userRepository.findByIdSync(id);
}
```

2. **检查参数类型**:
```typescript
// ✅ 正确 - 简单参数
@Cacheable('users', 300)
async getUser(id: string) { }

// ❌ 错误 - 复杂对象参数
@Cacheable('users', 300)
async getUser(user: User) { }
```

#### 问题：键生成冲突

**解决方案**:

```typescript
// 使用自定义键生成器
@Cacheable('users', 300, {
  keyGenerator: (target, methodName, args) => `user:${args[0]}`,
})
async getUser(id: string) {
  return await this.userRepository.findById(id);
}
```

## 🔧 调试工具

### 1. 缓存调试中间件

```typescript
@Injectable()
export class CacheDebugMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const originalSend = res.send;
    
    res.send = function(data) {
      console.log(`[CACHE DEBUG] ${req.method} ${req.url}`);
      console.log(`[CACHE DEBUG] Response: ${data}`);
      return originalSend.call(this, data);
    };
    
    next();
  }
}
```

### 2. 缓存监控服务

```typescript
@Injectable()
export class CacheMonitorService {
  private metrics = {
    hits: 0,
    misses: 0,
    errors: 0,
    totalLatency: 0,
  };

  async getMetrics() {
    return {
      ...this.metrics,
      hitRate: this.metrics.hits / (this.metrics.hits + this.metrics.misses) * 100,
      averageLatency: this.metrics.totalLatency / (this.metrics.hits + this.metrics.misses),
    };
  }

  recordHit(latency: number) {
    this.metrics.hits++;
    this.metrics.totalLatency += latency;
  }

  recordMiss(latency: number) {
    this.metrics.misses++;
    this.metrics.totalLatency += latency;
  }

  recordError() {
    this.metrics.errors++;
  }
}
```

### 3. 缓存健康检查

```typescript
@Injectable()
export class CacheHealthService {
  constructor(private readonly cacheService: CacheService) {}

  async checkHealth() {
    const checks = {
      connection: false,
      read: false,
      write: false,
      delete: false,
    };

    try {
      // 测试连接
      const testKey = 'health-check';
      const testValue = { timestamp: Date.now() };

      // 测试写入
      await this.cacheService.set('health', testKey, testValue, 10);
      checks.write = true;

      // 测试读取
      const retrieved = await this.cacheService.get('health', testKey);
      checks.read = retrieved !== null;

      // 测试删除
      await this.cacheService.del('health', testKey);
      checks.delete = true;

      checks.connection = true;
    } catch (error) {
      console.error('缓存健康检查失败:', error);
    }

    return {
      status: Object.values(checks).every(Boolean) ? 'healthy' : 'unhealthy',
      checks,
    };
  }
}
```

## 📊 性能分析

### 1. 缓存命中率分析

```typescript
@Injectable()
export class CacheAnalyticsService {
  private stats = new Map<string, { hits: number; misses: number }>();

  async analyzeHitRate(namespace: string) {
    const stats = this.stats.get(namespace) || { hits: 0, misses: 0 };
    const total = stats.hits + stats.misses;
    
    return {
      namespace,
      hitRate: total > 0 ? (stats.hits / total) * 100 : 0,
      totalRequests: total,
      hits: stats.hits,
      misses: stats.misses,
    };
  }

  recordHit(namespace: string) {
    const stats = this.stats.get(namespace) || { hits: 0, misses: 0 };
    stats.hits++;
    this.stats.set(namespace, stats);
  }

  recordMiss(namespace: string) {
    const stats = this.stats.get(namespace) || { hits: 0, misses: 0 };
    stats.misses++;
    this.stats.set(namespace, stats);
  }
}
```

### 2. 慢查询分析

```typescript
@Injectable()
export class SlowQueryAnalyzer {
  private slowQueries: Array<{ key: string; duration: number; timestamp: Date }> = [];

  recordQuery(key: string, duration: number) {
    if (duration > 100) { // 超过 100ms
      this.slowQueries.push({
        key,
        duration,
        timestamp: new Date(),
      });
    }
  }

  getSlowQueries(limit = 10) {
    return this.slowQueries
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }
}
```

## 🚀 优化建议

### 1. 缓存预热

```typescript
@Injectable()
export class CacheWarmupService {
  constructor(private readonly cacheService: CacheService) {}

  async warmup() {
    // 预热热门数据
    const hotData = await this.getHotData();
    await this.cacheService.set('hot', 'data', hotData, 3600);

    // 预热用户数据
    const activeUsers = await this.getActiveUsers();
    for (const user of activeUsers) {
      await this.cacheService.set('users', user.id, user, 1800);
    }
  }
}
```

### 2. 缓存分层

```typescript
@Injectable()
export class LayeredCacheService {
  constructor(
    private readonly l1Cache: CacheService, // 本地缓存
    private readonly l2Cache: CacheService, // Redis 缓存
  ) {}

  async get(key: string) {
    // L1 缓存
    let data = await this.l1Cache.get('l1', key);
    if (data) return data;

    // L2 缓存
    data = await this.l2Cache.get('l2', key);
    if (data) {
      // 回填 L1 缓存
      await this.l1Cache.set('l1', key, data, 300);
      return data;
    }

    return null;
  }
}
```

这些故障排除指南将帮助你快速诊断和解决缓存模块的常见问题。
