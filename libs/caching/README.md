# @hl8/caching

> 高性能、多级数据隔离的缓存模块

[![npm version](https://badge.fury.io/js/%40hl8%2Fcaching.svg)](https://badge.fury.io/js/%40hl8%2Fcaching)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](https://www.typescriptlang.org/)

## 🚀 特性

- **多级数据隔离**: 支持平台、租户、组织、部门、用户级缓存隔离
- **高性能**: 基于 Redis 的高性能缓存，响应时间 < 50ms
- **装饰器支持**: 提供 `@Cacheable`、`@CacheEvict`、`@CachePut` 装饰器
- **性能监控**: 内置缓存性能指标收集和监控
- **错误处理**: 完善的异常处理和降级机制
- **TypeScript**: 完整的 TypeScript 类型支持
- **NestJS 集成**: 与 NestJS 框架无缝集成

## 📦 安装

```bash
pnpm add @hl8/caching
```

## 🎯 快速开始

### 1. 基本配置

```typescript
import { CachingModule } from '@hl8/caching';

@Module({
  imports: [
    CachingModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
        password: 'your-password', // 可选
        db: 0,
      },
      defaultTtl: 300, // 默认 TTL 5分钟
      keyPrefix: 'app:', // 键前缀
    }),
  ],
})
export class AppModule {}
```

### 2. 异步配置

```typescript
import { CachingModule } from '@hl8/caching';

@Module({
  imports: [
    CachingModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
          password: config.get('REDIS_PASSWORD'),
        },
        defaultTtl: config.get('CACHE_TTL', 300),
        keyPrefix: config.get('CACHE_PREFIX', 'app:'),
      }),
    }),
  ],
})
export class AppModule {}
```

## 🔧 使用方式

### 1. 服务注入

```typescript
import { Injectable } from '@nestjs/common';
import { CacheService } from '@hl8/caching';

@Injectable()
export class UserService {
  constructor(private readonly cacheService: CacheService) {}

  async getUser(id: string) {
    // 尝试从缓存获取
    const cached = await this.cacheService.get('users', id);
    if (cached) {
      return cached;
    }

    // 从数据库获取
    const user = await this.userRepository.findById(id);
    
    // 缓存结果
    await this.cacheService.set('users', id, user, 300);
    
    return user;
  }
}
```

### 2. 装饰器使用

```typescript
import { Injectable } from '@nestjs/common';
import { Cacheable, CacheEvict, CachePut } from '@hl8/caching';

@Injectable()
export class ProductService {
  @Cacheable('products', 300) // 缓存5分钟
  async getProduct(id: string) {
    // 复杂计算或数据库查询
    return await this.productRepository.findById(id);
  }

  @CacheEvict('products')
  async updateProduct(id: string, data: any) {
    // 更新产品后清除缓存
    return await this.productRepository.update(id, data);
  }

  @CachePut('products', 300)
  async createProduct(data: any) {
    // 创建产品并缓存结果
    return await this.productRepository.create(data);
  }
}
```

### 3. 多级数据隔离

```typescript
import { Injectable } from '@nestjs/common';
import { CacheService } from '@hl8/caching';

@Injectable()
export class DataService {
  constructor(private readonly cacheService: CacheService) {}

  // 平台级缓存 - 所有租户共享
  async getPlatformData(key: string) {
    return await this.cacheService.get('platform', key);
  }

  // 租户级缓存 - 需要 X-Tenant-Id 请求头
  async getTenantData(key: string) {
    return await this.cacheService.get('tenant', key);
  }

  // 组织级缓存 - 需要 X-Organization-Id 请求头
  async getOrganizationData(key: string) {
    return await this.cacheService.get('organization', key);
  }
}
```

## 🎨 API 参考

### CacheService

#### 基本操作

```typescript
class CacheService {
  // 获取缓存
  async get(namespace: string, key: string): Promise<any>

  // 设置缓存
  async set(namespace: string, key: string, value: any, ttl?: number): Promise<void>

  // 删除缓存
  async del(namespace: string, key: string): Promise<void>

  // 清除命名空间
  async clear(namespace: string): Promise<void>

  // 检查键是否存在
  async exists(namespace: string, key: string): Promise<boolean>

  // 获取所有键
  async keys(namespace: string, pattern?: string): Promise<string[]>
}
```

#### 多级隔离

```typescript
// 平台级 - 无隔离
await cacheService.get('platform', 'global-config');

// 租户级 - 需要 X-Tenant-Id 请求头
await cacheService.get('tenant', 'user-preferences');

// 组织级 - 需要 X-Organization-Id 请求头
await cacheService.get('organization', 'team-settings');

// 部门级 - 需要 X-Department-Id 请求头
await cacheService.get('department', 'department-data');

// 用户级 - 需要 X-User-Id 请求头
await cacheService.get('user', 'personal-settings');
```

### 装饰器

#### @Cacheable

```typescript
@Cacheable(namespace: string, ttl?: number, options?: CacheableOptions)
```

**参数**:
- `namespace`: 缓存命名空间
- `ttl`: 生存时间（秒），可选
- `options`: 额外选项，可选

**示例**:
```typescript
@Cacheable('products', 300)
async getProduct(id: string) {
  return await this.productRepository.findById(id);
}
```

#### @CacheEvict

```typescript
@CacheEvict(namespace: string, key?: string | Function)
```

**示例**:
```typescript
@CacheEvict('products')
async updateProduct(id: string, data: any) {
  return await this.productRepository.update(id, data);
}
```

#### @CachePut

```typescript
@CachePut(namespace: string, ttl?: number)
```

**示例**:
```typescript
@CachePut('products', 300)
async createProduct(data: any) {
  return await this.productRepository.create(data);
}
```

## 📊 性能监控

### 获取缓存指标

```typescript
import { CacheMetricsService } from '@hl8/caching';

@Injectable()
export class MetricsController {
  constructor(private readonly metricsService: CacheMetricsService) {}

  @Get('cache/metrics')
  async getCacheMetrics() {
    return await this.metricsService.getMetrics();
  }
}
```

### 指标说明

```typescript
interface CacheMetrics {
  hits: number;           // 缓存命中次数
  misses: number;         // 缓存未命中次数
  hitRate: number;        // 命中率 (0-100)
  averageLatency: number; // 平均延迟 (毫秒)
  totalOperations: number; // 总操作次数
  errorRate: number;      // 错误率 (0-100)
}
```

## 🔧 配置选项

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
  defaultTtl?: number;     // 默认 TTL (秒)
  keyPrefix?: string;      // 键前缀
  isolation?: {
    enabled?: boolean;     // 启用多级隔离
    strictMode?: boolean;  // 严格模式
  };
  performance?: {
    enableMetrics?: boolean; // 启用性能监控
    slowQueryThreshold?: number; // 慢查询阈值 (毫秒)
  };
}
```

## 🚨 错误处理

### 异常类型

```typescript
import {
  CacheError,
  RedisConnectionError,
  CacheSerializationError,
  CacheKeyValidationError,
  CacheConfigurationError,
  CacheTimeoutError,
} from '@hl8/caching';
```

### 错误处理示例

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { CacheService, CacheError } from '@hl8/caching';

@Injectable()
export class DataService {
  private readonly logger = new Logger(DataService.name);

  constructor(private readonly cacheService: CacheService) {}

  async getData(key: string) {
    try {
      return await this.cacheService.get('data', key);
    } catch (error) {
      if (error instanceof CacheError) {
        this.logger.error(`缓存操作失败: ${error.message}`);
        // 降级处理 - 直接从数据库获取
        return await this.databaseService.getData(key);
      }
      throw error;
    }
  }
}
```

## 🧪 测试

### 单元测试

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CachingModule, CacheService } from '@hl8/caching';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CachingModule.forRoot({
          redis: { host: 'localhost', port: 6379 },
        }),
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  it('should cache and retrieve data', async () => {
    const key = 'test-key';
    const value = { message: 'Hello, World!' };

    await service.set('test', key, value, 60);
    const cached = await service.get('test', key);

    expect(cached).toEqual(value);
  });
});
```

### 集成测试

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CachingModule } from '@hl8/caching';

describe('Caching Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        CachingModule.forRoot({
          redis: { host: 'localhost', port: 6379 },
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/cache/platform/test (GET)', () => {
    return request(app.getHttpServer())
      .get('/cache/platform/test')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('timestamp');
      });
  });
});
```

## 📈 性能优化

### 1. 连接池配置

```typescript
CachingModule.forRoot({
  redis: {
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    lazyConnect: true,
  },
})
```

### 2. 键命名策略

```typescript
// 使用有意义的命名空间
await cacheService.set('users', userId, userData);
await cacheService.set('products', productId, productData);
await cacheService.set('orders', orderId, orderData);
```

### 3. TTL 优化

```typescript
// 根据数据特性设置不同的 TTL
await cacheService.set('users', userId, userData, 3600);      // 用户数据 1小时
await cacheService.set('products', productId, productData, 1800); // 产品数据 30分钟
await cacheService.set('sessions', sessionId, sessionData, 86400); // 会话数据 24小时
```

## 🔒 安全考虑

### 1. 数据隔离

```typescript
// 确保敏感数据使用适当的隔离级别
await cacheService.set('user', 'sensitive-data', data); // 用户级隔离
await cacheService.set('tenant', 'shared-data', data);  // 租户级隔离
```

### 2. 键验证

```typescript
// 使用安全的键格式
const safeKey = key.replace(/[^a-zA-Z0-9:_-]/g, '_');
await cacheService.set('data', safeKey, value);
```

### 3. 访问控制

```typescript
// 在服务层实现访问控制
@Injectable()
export class SecureDataService {
  async getData(userId: string, dataId: string) {
    // 验证用户权限
    await this.authService.verifyAccess(userId, dataId);
    
    // 使用用户级隔离
    return await this.cacheService.get('user', `${userId}:${dataId}`);
  }
}
```

## 🚀 部署指南

### Docker 部署

```yaml
# docker-compose.yml
version: '3.8'
services:
  redis:
    image: redis:7.2-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  app:
    build: .
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - redis

volumes:
  redis_data:
```

### 环境变量

```bash
# .env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-password
REDIS_DB=0
CACHE_TTL=300
CACHE_PREFIX=app:
```

## 📚 更多资源

- [API 文档](./docs/api.md)
- [迁移指南](./docs/migration.md)
- [最佳实践](./docs/best-practices.md)
- [故障排除](./docs/troubleshooting.md)

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](./CONTRIBUTING.md) 了解详细信息。

## 📄 许可证

MIT License - 查看 [LICENSE](./LICENSE) 文件了解详情。

---

**@hl8/caching** - 为你的 SAAS 平台提供高性能缓存服务！ 🚀
