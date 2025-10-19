# 数据库模块 MongoDB 支持快速开始

## 🚀 5分钟快速上手

### 1. 安装依赖

```bash
# 添加 MongoDB 驱动依赖
pnpm add @mikro-orm/mongodb
```

### 2. 配置环境变量

```env
# 数据库类型配置
DB_TYPE=mongodb
DB_HOST=localhost
DB_PORT=27017
DB_DATABASE=hl8_saas
DB_USERNAME=admin
DB_PASSWORD=password

# 连接池配置
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_IDLE_TIMEOUT=600000
DB_ACQUIRE_TIMEOUT=10000

# 监控配置
DB_SLOW_QUERY_THRESHOLD=1000
DB_DEBUG=false
```

### 3. 配置数据库模块

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { DatabaseModule } from '@hl8/database';

@Module({
  imports: [
    DatabaseModule.forRoot({
      connection: {
        type: 'mongodb',
        host: 'localhost',
        port: 27017,
        database: 'hl8_saas',
        username: 'admin',
        password: 'password',
      },
      pool: {
        min: 5,
        max: 20,
        idleTimeoutMillis: 600000,
        acquireTimeoutMillis: 10000,
      },
      entities: [User, Product, Order],
    }),
  ],
})
export class AppModule {}
```

### 4. 使用数据库服务

```typescript
// user.service.ts
import { Injectable } from '@nestjs/common';
import { ConnectionManager, TransactionService } from '@hl8/database';

@Injectable()
export class UserService {
  constructor(
    private readonly connectionManager: ConnectionManager,
    private readonly transactionService: TransactionService,
  ) {}

  async createUser(userData: CreateUserDto) {
    // 使用事务创建用户
    return await this.transactionService.runInTransaction(async (em) => {
      const user = new User(userData);
      await em.persistAndFlush(user);
      return user;
    });
  }

  async checkConnection() {
    const isConnected = await this.connectionManager.isConnected();
    const stats = this.connectionManager.getPoolStats();
    
    return {
      connected: isConnected,
      poolStats: stats,
    };
  }
}
```

## 🎯 常用场景

### 场景 1: PostgreSQL 和 MongoDB 混合使用

```typescript
// 配置两个数据库模块
@Module({
  imports: [
    // PostgreSQL 数据库
    DatabaseModule.forRoot({
      name: 'postgres',
      connection: {
        type: 'postgresql',
        host: 'localhost',
        port: 5432,
        database: 'hl8_saas',
        username: 'postgres',
        password: 'password',
      },
      entities: [User, Tenant, Organization],
    }),
    
    // MongoDB 数据库
    DatabaseModule.forRoot({
      name: 'mongodb',
      connection: {
        type: 'mongodb',
        host: 'localhost',
        port: 27017,
        database: 'hl8_saas',
        username: 'admin',
        password: 'password',
      },
      entities: [Product, Order, Analytics],
    }),
  ],
})
export class AppModule {}
```

### 场景 2: 数据库类型切换

```typescript
// 通过配置切换数据库类型
const config = {
  connection: {
    type: process.env.DB_TYPE || 'postgresql', // 支持动态切换
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
  // ... 其他配置
};
```

### 场景 3: 性能监控

```typescript
// monitoring.service.ts
import { Injectable } from '@nestjs/common';
import { ConnectionManager, MetricsService } from '@hl8/database';

@Injectable()
export class MonitoringService {
  constructor(
    private readonly connectionManager: ConnectionManager,
    private readonly metricsService: MetricsService,
  ) {}

  async getDatabaseHealth() {
    const health = await this.connectionManager.healthCheck();
    const stats = this.metricsService.getPerformanceStats();
    
    return {
      healthy: health.healthy,
      responseTime: health.responseTime,
      performance: stats,
    };
  }

  async getSlowQueries() {
    return this.metricsService.getSlowQueries(10);
  }
}
```

## 🔧 高级配置

### 异步配置

```typescript
// 使用配置服务进行异步配置
DatabaseModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    connection: {
      type: configService.get('DB_TYPE'),
      host: configService.get('DB_HOST'),
      port: configService.get('DB_PORT'),
      database: configService.get('DB_DATABASE'),
      username: configService.get('DB_USERNAME'),
      password: configService.get('DB_PASSWORD'),
    },
    pool: {
      min: configService.get('DB_POOL_MIN', 5),
      max: configService.get('DB_POOL_MAX', 20),
    },
  }),
  inject: [ConfigService],
})
```

### 多数据库配置

```typescript
// 支持多个数据库实例
@Module({
  imports: [
    DatabaseModule.forRoot({
      name: 'primary',
      connection: { /* PostgreSQL 配置 */ },
    }),
    DatabaseModule.forRoot({
      name: 'analytics',
      connection: { /* MongoDB 配置 */ },
    }),
  ],
})
export class AppModule {}
```

## 🧪 测试

### 单元测试

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule, ConnectionManager } from '@hl8/database';

describe('DatabaseModule', () => {
  let connectionManager: ConnectionManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        DatabaseModule.forRoot({
          connection: {
            type: 'mongodb',
            host: 'localhost',
            port: 27017,
            database: 'test_db',
            username: 'test',
            password: 'test',
          },
        }),
      ],
    }).compile();

    connectionManager = module.get<ConnectionManager>(ConnectionManager);
  });

  it('should connect to database', async () => {
    await connectionManager.connect();
    const isConnected = await connectionManager.isConnected();
    expect(isConnected).toBe(true);
  });
});
```

### 集成测试

```typescript
describe('Database Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        DatabaseModule.forRoot({
          connection: {
            type: 'mongodb',
            host: 'localhost',
            port: 27017,
            database: 'test_db',
            username: 'test',
            password: 'test',
          },
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should perform database operations', async () => {
    // 测试数据库操作
  });
});
```

## 🚀 部署

### Docker 配置

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: hl8_saas
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"

  mongodb:
    image: mongo:7.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    ports:
      - "27017:27017"

  app:
    build: .
    environment:
      DB_TYPE: mongodb
      DB_HOST: mongodb
      DB_PORT: 27017
      DB_DATABASE: hl8_saas
      DB_USERNAME: admin
      DB_PASSWORD: password
    depends_on:
      - postgres
      - mongodb
```

### 环境变量

```bash
# .env
DB_TYPE=mongodb
DB_HOST=localhost
DB_PORT=27017
DB_DATABASE=hl8_saas
DB_USERNAME=admin
DB_PASSWORD=password
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_IDLE_TIMEOUT=600000
DB_ACQUIRE_TIMEOUT=10000
DB_SLOW_QUERY_THRESHOLD=1000
DB_DEBUG=false
```

## 📚 下一步

- 查看 [API 文档](./api.md) 了解完整的 API 参考
- 阅读 [最佳实践](./best-practices.md) 学习高级用法
- 参考 [故障排除](./troubleshooting.md) 解决常见问题

现在你已经掌握了数据库模块的 MongoDB 支持，可以开始构建支持多数据库的应用了！ 🎉
