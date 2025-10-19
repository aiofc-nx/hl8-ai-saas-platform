# 快速开始指南

## 🚀 5分钟快速上手

### 1. 安装依赖

```bash
pnpm add @hl8/caching
```

### 2. 基本配置

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { CachingModule } from '@hl8/caching';

@Module({
  imports: [
    CachingModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
      defaultTtl: 300, // 5分钟
      keyPrefix: 'myapp:',
    }),
  ],
})
export class AppModule {}
```

### 3. 使用缓存服务

```typescript
// user.service.ts
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
    await this.cacheService.set('users', id, user, 3600); // 1小时
    
    return user;
  }
}
```

### 4. 使用装饰器

```typescript
// product.service.ts
import { Injectable } from '@nestjs/common';
import { Cacheable, CacheEvict } from '@hl8/caching';

@Injectable()
export class ProductService {
  @Cacheable('products', 300) // 缓存5分钟
  async getProduct(id: string) {
    return await this.productRepository.findById(id);
  }

  @CacheEvict('products')
  async updateProduct(id: string, data: any) {
    return await this.productRepository.update(id, data);
  }
}
```

## 🎯 常用场景

### 场景1：用户数据缓存

```typescript
@Injectable()
export class UserService {
  constructor(private readonly cacheService: CacheService) {}

  async getUserProfile(userId: string) {
    const cacheKey = `profile:${userId}`;
    
    // 尝试从缓存获取
    let profile = await this.cacheService.get('users', cacheKey);
    if (profile) {
      return profile;
    }

    // 从数据库获取
    profile = await this.userRepository.getProfile(userId);
    
    // 缓存用户资料（1小时）
    await this.cacheService.set('users', cacheKey, profile, 3600);
    
    return profile;
  }

  async updateUserProfile(userId: string, data: any) {
    // 更新数据库
    const profile = await this.userRepository.updateProfile(userId, data);
    
    // 更新缓存
    await this.cacheService.set('users', `profile:${userId}`, profile, 3600);
    
    return profile;
  }
}
```

### 场景2：API响应缓存

```typescript
@Injectable()
export class ApiService {
  constructor(private readonly cacheService: CacheService) {}

  async getApiData(endpoint: string, params: any) {
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
    
    // 尝试从缓存获取
    const cached = await this.cacheService.get('api', cacheKey);
    if (cached) {
      return cached;
    }

    // 调用外部API
    const data = await this.externalApiService.getData(endpoint, params);
    
    // 缓存API响应（10分钟）
    await this.cacheService.set('api', cacheKey, data, 600);
    
    return data;
  }
}
```

### 场景3：会话数据缓存

```typescript
@Injectable()
export class SessionService {
  constructor(private readonly cacheService: CacheService) {}

  async getSession(sessionId: string) {
    return await this.cacheService.get('sessions', sessionId);
  }

  async createSession(userId: string) {
    const session = {
      id: generateSessionId(),
      userId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时
    };

    // 缓存会话（24小时）
    await this.cacheService.set('sessions', session.id, session, 86400);
    
    return session;
  }

  async destroySession(sessionId: string) {
    await this.cacheService.del('sessions', sessionId);
  }
}
```

## 🔧 高级配置

### 异步配置

```typescript
// app.module.ts
import { ConfigService } from '@nestjs/config';
import { CachingModule } from '@hl8/caching';

@Module({
  imports: [
    CachingModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get('REDIS_PORT', 6379),
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

### 多级数据隔离

```typescript
@Injectable()
export class DataService {
  constructor(private readonly cacheService: CacheService) {}

  // 平台级数据 - 所有用户共享
  async getGlobalConfig() {
    return await this.cacheService.get('platform', 'global-config');
  }

  // 租户级数据 - 需要 X-Tenant-Id 请求头
  async getTenantSettings() {
    return await this.cacheService.get('tenant', 'settings');
  }

  // 用户级数据 - 需要 X-User-Id 请求头
  async getUserPreferences() {
    return await this.cacheService.get('user', 'preferences');
  }
}
```

## 📊 性能监控

### 获取缓存指标

```typescript
@Injectable()
export class MetricsService {
  constructor(private readonly metricsService: CacheMetricsService) {}

  @Get('cache/metrics')
  async getCacheMetrics() {
    return await this.metricsService.getMetrics();
  }
}
```

### 自定义监控

```typescript
@Injectable()
export class MonitoredCacheService {
  constructor(private readonly cacheService: CacheService) {}

  async getWithMonitoring(namespace: string, key: string) {
    const start = Date.now();
    
    try {
      const result = await this.cacheService.get(namespace, key);
      const duration = Date.now() - start;
      
      // 记录性能指标
      console.log(`Cache ${result ? 'HIT' : 'MISS'}: ${namespace}:${key} (${duration}ms)`);
      
      return result;
    } catch (error) {
      console.error(`Cache ERROR: ${namespace}:${key}`, error);
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

describe('UserService', () => {
  let service: UserService;
  let cacheService: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CachingModule.forRoot({
          redis: { host: 'localhost', port: 6379 },
        }),
      ],
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
    cacheService = module.get<CacheService>(CacheService);
  });

  it('should cache user data', async () => {
    const userId = 'user-123';
    const userData = { id: userId, name: 'John Doe' };

    // 设置缓存
    await cacheService.set('users', userId, userData, 60);

    // 获取缓存
    const cached = await cacheService.get('users', userId);
    expect(cached).toEqual(userData);
  });
});
```

## 🚀 部署

### Docker 配置

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
CACHE_TTL=300
CACHE_PREFIX=myapp:
```

## 📚 下一步

- 查看 [API 文档](./api.md) 了解完整的 API 参考
- 阅读 [最佳实践](./best-practices.md) 学习高级用法
- 参考 [故障排除](./troubleshooting.md) 解决常见问题

现在你已经掌握了缓存模块的基本用法，可以开始构建高性能的应用了！ 🎉
