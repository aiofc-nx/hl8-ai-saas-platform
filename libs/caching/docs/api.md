# API 参考文档

## 模块

### CachingModule

缓存模块的主要入口，提供配置和依赖注入。

#### 静态方法

##### `forRoot(options: CachingModuleConfig)`

同步配置缓存模块。

**参数**:
- `options`: 缓存模块配置选项

**返回**: `DynamicModule`

**示例**:
```typescript
CachingModule.forRoot({
  redis: {
    host: 'localhost',
    port: 6379,
  },
  defaultTtl: 300,
  keyPrefix: 'app:',
})
```

##### `forRootAsync(options: CachingModuleAsyncOptions)`

异步配置缓存模块。

**参数**:
- `options`: 异步配置选项

**返回**: `DynamicModule`

**示例**:
```typescript
CachingModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    redis: {
      host: config.get('REDIS_HOST'),
      port: config.get('REDIS_PORT'),
    },
  }),
})
```

## 服务

### CacheService

核心缓存服务，提供所有缓存操作。

#### 方法

##### `get(namespace: string, key: string): Promise<any>`

获取缓存数据。

**参数**:
- `namespace`: 命名空间
- `key`: 缓存键

**返回**: `Promise<any>` - 缓存的数据，如果不存在返回 `null`

**示例**:
```typescript
const data = await cacheService.get('users', 'user-123');
```

##### `set(namespace: string, key: string, value: any, ttl?: number): Promise<void>`

设置缓存数据。

**参数**:
- `namespace`: 命名空间
- `key`: 缓存键
- `value`: 要缓存的数据
- `ttl`: 生存时间（秒），可选

**返回**: `Promise<void>`

**示例**:
```typescript
await cacheService.set('users', 'user-123', userData, 3600);
```

##### `del(namespace: string, key: string): Promise<void>`

删除缓存数据。

**参数**:
- `namespace`: 命名空间
- `key`: 缓存键

**返回**: `Promise<void>`

**示例**:
```typescript
await cacheService.del('users', 'user-123');
```

##### `clear(namespace: string): Promise<void>`

清除命名空间的所有缓存。

**参数**:
- `namespace`: 命名空间

**返回**: `Promise<void>`

**示例**:
```typescript
await cacheService.clear('users');
```

##### `exists(namespace: string, key: string): Promise<boolean>`

检查缓存键是否存在。

**参数**:
- `namespace`: 命名空间
- `key`: 缓存键

**返回**: `Promise<boolean>`

**示例**:
```typescript
const exists = await cacheService.exists('users', 'user-123');
```

##### `keys(namespace: string, pattern?: string): Promise<string[]>`

获取匹配模式的所有键。

**参数**:
- `namespace`: 命名空间
- `pattern`: 匹配模式，可选

**返回**: `Promise<string[]>`

**示例**:
```typescript
const keys = await cacheService.keys('users', 'user-*');
```

### CacheMetricsService

缓存性能指标服务。

#### 方法

##### `getMetrics(): Promise<CacheMetrics>`

获取缓存性能指标。

**返回**: `Promise<CacheMetrics>`

**示例**:
```typescript
const metrics = await metricsService.getMetrics();
```

##### `incrementHits(): void`

增加命中计数。

##### `incrementMisses(): void`

增加未命中计数。

##### `recordLatency(latency: number): void`

记录操作延迟。

**参数**:
- `latency`: 延迟时间（毫秒）

## 装饰器

### @Cacheable

缓存方法返回值的装饰器。

#### 语法

```typescript
@Cacheable(namespace: string, ttl?: number, options?: CacheableOptions)
```

#### 参数

- `namespace`: 缓存命名空间
- `ttl`: 生存时间（秒），可选
- `options`: 额外选项，可选

#### 选项

```typescript
interface CacheableOptions {
  keyGenerator?: (target: any, methodName: string, args: any[]) => string;
  condition?: (target: any, methodName: string, args: any[], result: any) => boolean;
  unless?: (target: any, methodName: string, args: any[], result: any) => boolean;
}
```

#### 示例

```typescript
@Cacheable('products', 300)
async getProduct(id: string) {
  return await this.productRepository.findById(id);
}

@Cacheable('users', 600, {
  keyGenerator: (target, methodName, args) => `user:${args[0]}`,
  condition: (target, methodName, args, result) => result !== null,
})
async getUser(id: string) {
  return await this.userRepository.findById(id);
}
```

### @CacheEvict

清除缓存的装饰器。

#### 语法

```typescript
@CacheEvict(namespace: string, key?: string | Function, options?: CacheEvictOptions)
```

#### 参数

- `namespace`: 缓存命名空间
- `key`: 缓存键，可选
- `options`: 额外选项，可选

#### 选项

```typescript
interface CacheEvictOptions {
  allEntries?: boolean;
  beforeInvocation?: boolean;
}
```

#### 示例

```typescript
@CacheEvict('products')
async updateProduct(id: string, data: any) {
  return await this.productRepository.update(id, data);
}

@CacheEvict('users', (target, methodName, args) => `user:${args[0]}`)
async deleteUser(id: string) {
  return await this.userRepository.delete(id);
}
```

### @CachePut

更新缓存的装饰器。

#### 语法

```typescript
@CachePut(namespace: string, ttl?: number, options?: CachePutOptions)
```

#### 参数

- `namespace`: 缓存命名空间
- `ttl`: 生存时间（秒），可选
- `options`: 额外选项，可选

#### 示例

```typescript
@CachePut('products', 300)
async createProduct(data: any) {
  return await this.productRepository.create(data);
}
```

## 类型定义

### CachingModuleConfig

```typescript
interface CachingModuleConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
    db?: number;
    retryDelayOnFailover?: number;
    maxRetriesPerRequest?: number;
    lazyConnect?: boolean;
  };
  defaultTtl?: number;
  keyPrefix?: string;
  isolation?: {
    enabled?: boolean;
    strictMode?: boolean;
  };
  performance?: {
    enableMetrics?: boolean;
    slowQueryThreshold?: number;
  };
}
```

### CacheMetrics

```typescript
interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  averageLatency: number;
  totalOperations: number;
  errorRate: number;
}
```

### CacheableOptions

```typescript
interface CacheableOptions {
  keyGenerator?: (target: any, methodName: string, args: any[]) => string;
  condition?: (target: any, methodName: string, args: any[], result: any) => boolean;
  unless?: (target: any, methodName: string, args: any[], result: any) => boolean;
}
```

### CacheEvictOptions

```typescript
interface CacheEvictOptions {
  allEntries?: boolean;
  beforeInvocation?: boolean;
}
```

## 异常类型

### CacheError

基础缓存异常类。

```typescript
class CacheError extends Error {
  constructor(message: string, cause?: Error);
}
```

### RedisConnectionError

Redis 连接异常。

```typescript
class RedisConnectionError extends CacheError {
  constructor(message: string, cause?: Error);
}
```

### CacheSerializationError

缓存序列化异常。

```typescript
class CacheSerializationError extends CacheError {
  constructor(message: string, cause?: Error);
}
```

### CacheKeyValidationError

缓存键验证异常。

```typescript
class CacheKeyValidationError extends CacheError {
  constructor(message: string, cause?: Error);
}
```

### CacheConfigurationError

缓存配置异常。

```typescript
class CacheConfigurationError extends CacheError {
  constructor(message: string, cause?: Error);
}
```

### CacheTimeoutError

缓存超时异常。

```typescript
class CacheTimeoutError extends CacheError {
  constructor(message: string, cause?: Error);
}
```
