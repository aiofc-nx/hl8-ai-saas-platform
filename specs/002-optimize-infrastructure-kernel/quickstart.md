# 快速开始指南: 基础设施层kernel优化

**Feature**: 002-optimize-infrastructure-kernel  
**Date**: 2025-01-27  
**Status**: 设计完成

## 概述

基础设施层kernel优化项目旨在构建高性能、高可用的基础设施层核心组件，支持多数据库（PostgreSQL + MongoDB）、多租户数据隔离、性能优化和日志系统统一。

## 核心目标

- **多数据库支持**: 支持MikroORM + PostgreSQL和MikroORM + MongoDB
- **多租户隔离**: 实现5级数据隔离（平台/租户/组织/部门/用户）
- **性能优化**: 缓存命中率80%+，支持1000并发连接
- **日志系统统一**: 使用@hl8/nestjs-fastify的Pino logger
- **架构集成**: 与@hl8/domain-kernel和@hl8/application-kernel完整集成

## 主要功能

### 1. 多数据库支持

#### PostgreSQL配置

```typescript
import { PostgreSQLAdapter } from "@hl8/infrastructure-kernel";

const postgresAdapter = new PostgreSQLAdapter({
  host: "localhost",
  port: 5432,
  database: "hl8_saas",
  username: "postgres",
  password: "password",
  ssl: true,
  poolSize: 100,
  timeout: 30000,
});

await postgresAdapter.connect();
```

#### MongoDB配置

```typescript
import { MongoDBAdapter } from "@hl8/infrastructure-kernel";

const mongoAdapter = new MongoDBAdapter({
  host: "localhost",
  port: 27017,
  database: "hl8_saas",
  username: "mongodb",
  password: "password",
  replicaSet: "rs0",
  maxPoolSize: 50,
  minPoolSize: 5,
});

await mongoAdapter.connect();
```

### 2. 多租户数据隔离

#### 隔离上下文创建

```typescript
import { IsolationContextManager } from "@hl8/infrastructure-kernel";

const isolationManager = new IsolationContextManager();

// 创建租户级隔离上下文
const tenantContext = isolationManager.createContext(
  "tenant-123",
  undefined,
  undefined,
  undefined,
);

// 创建组织级隔离上下文
const orgContext = isolationManager.createContext(
  "tenant-123",
  "org-456",
  undefined,
  undefined,
);

// 创建部门级隔离上下文
const deptContext = isolationManager.createContext(
  "tenant-123",
  "org-456",
  "dept-789",
  undefined,
);

// 创建用户级隔离上下文
const userContext = isolationManager.createContext(
  "tenant-123",
  "org-456",
  "dept-789",
  "user-001",
);
```

#### 数据访问控制

```typescript
import { AccessControlService } from "@hl8/infrastructure-kernel";

const accessControl = new AccessControlService();

// 验证数据访问权限
const hasAccess = await accessControl.validateAccess(userContext, {
  tenantId: "tenant-123",
  organizationId: "org-456",
});

if (!hasAccess) {
  throw new Error("访问被拒绝：数据不在当前隔离上下文中");
}
```

### 3. 缓存系统

#### 缓存配置

```typescript
import { CacheService } from "@hl8/infrastructure-kernel";

const cacheService = new CacheService({
  redis: {
    host: "localhost",
    port: 6379,
    password: "redis_password",
    db: 0,
  },
  defaultTtl: 300, // 5分钟
  maxSize: 1024 * 1024 * 1024, // 1GB
  strategy: "LRU",
});

await cacheService.initialize();
```

#### 缓存使用

```typescript
// 设置缓存
await cacheService.set(
  "user:123",
  { id: "123", name: "张三", email: "zhangsan@example.com" },
  { ttl: 600, tags: ["user", "profile"] },
);

// 获取缓存
const user = await cacheService.get("user:123");

// 批量获取
const users = await cacheService.mget(["user:123", "user:456"]);

// 清除缓存
await cacheService.clearByTags(["user"]);
```

### 4. 日志系统

#### 日志配置

```typescript
import { InfrastructureLoggingService } from "@hl8/infrastructure-kernel";
import { PinoLogger } from "@hl8/nestjs-fastify";

const pinoLogger = new PinoLogger({
  name: "infrastructure-kernel",
  level: "info",
  serializers: {
    req: (req) => ({ id: req.id, method: req.method, url: req.url }),
    res: (res) => ({ statusCode: res.statusCode }),
    err: (err) => ({ type: err.constructor.name, message: err.message }),
  },
});

const loggingService = new InfrastructureLoggingService(pinoLogger);
```

#### 日志使用

```typescript
// 结构化日志记录
await loggingService.log(
  {
    requestId: "req-123",
    tenantId: "tenant-123",
    organizationId: "org-456",
    userId: "user-001",
    operation: "CREATE_USER",
    resource: "User",
  },
  "用户创建成功",
  { userId: "user-001", name: "张三" },
);

// 错误日志记录
await loggingService.error(
  {
    requestId: "req-123",
    tenantId: "tenant-123",
    operation: "CREATE_USER",
    resource: "User",
  },
  "用户创建失败",
  { error: "Email already exists", code: "EMAIL_EXISTS" },
);
```

### 5. 事件溯源

#### 事件存储

```typescript
import { EventStore } from "@hl8/infrastructure-kernel";

const eventStore = new EventStore({
  database: postgresAdapter,
  cache: cacheService,
  isolation: isolationManager,
});

// 保存事件
await eventStore.saveEvents(
  "user-123",
  [
    new UserCreatedEvent("user-123", "张三", "zhangsan@example.com"),
    new UserProfileUpdatedEvent("user-123", { name: "张三丰" }),
  ],
  1,
);

// 获取事件
const events = await eventStore.getEvents("user-123", 0);

// 重放事件
const user = await eventStore.replayEvents("user-123");
```

### 6. 健康检查

#### 健康检查配置

```typescript
import { HealthCheckService } from "@hl8/infrastructure-kernel";

const healthCheck = new HealthCheckService({
  checks: [
    {
      name: "database",
      check: () => postgresAdapter.healthCheck(),
    },
    {
      name: "cache",
      check: () => cacheService.healthCheck(),
    },
    {
      name: "event-store",
      check: () => eventStore.healthCheck(),
    },
  ],
  interval: 30000, // 30秒
  timeout: 5000, // 5秒
});

await healthCheck.start();
```

#### 健康状态查询

```typescript
// 获取整体健康状态
const overallHealth = await healthCheck.getOverallHealth();

// 获取组件健康状态
const componentHealth = await healthCheck.getComponentHealth("database");

// 健康状态响应
if (overallHealth.status === "UNHEALTHY") {
  console.error("系统健康状态异常:", overallHealth.details);
}
```

## 基础设施服务

### 1. 数据库服务

- **PostgreSQL连接管理**: 连接池、事务管理、查询优化
- **MongoDB连接管理**: 副本集、分片、文档存储
- **数据库切换**: 动态切换主从数据库
- **健康监控**: 连接状态、性能指标监控

### 2. 缓存服务

- **Redis缓存**: 内存缓存、持久化缓存
- **缓存策略**: LRU、LFU、TTL管理
- **缓存预热**: 应用启动时预加载热点数据
- **缓存统计**: 命中率、性能指标监控

### 3. 日志服务

- **Pino日志记录**: 高性能JSON日志
- **结构化日志**: 统一日志格式和字段
- **多租户日志隔离**: 基于隔离上下文的日志过滤
- **日志聚合**: 支持日志收集和分析

### 4. 安全服务

- **访问控制**: 基于角色的权限控制
- **数据隔离**: 多层级数据访问控制
- **审计日志**: 完整的操作审计追踪
- **安全监控**: 异常访问检测和告警

### 5. 性能服务

- **性能监控**: 响应时间、吞吐量、错误率监控
- **查询优化**: 慢查询检测、索引优化建议
- **资源管理**: 内存、CPU、网络资源监控
- **自动扩缩容**: 基于负载的自动扩缩容

## 成功标准

### 性能指标

- **并发连接**: 支持1000个并发数据库连接
- **响应时间**: 数据库操作响应时间保持在100ms以内
- **缓存命中率**: 缓存命中率达到80%以上
- **系统可用性**: 系统可用性达到99.9%

### 功能指标

- **多数据库支持**: PostgreSQL和MongoDB数据库切换时间在10秒以内
- **数据隔离**: 多租户数据隔离准确率达到99.99%
- **日志统一**: 日志系统统一性达到100%
- **健康检查**: 健康检查响应时间在1秒以内

### 集成指标

- **领域层集成**: 与@hl8/domain-kernel完整集成
- **应用层集成**: 与@hl8/application-kernel完整集成
- **数据库集成**: 与@hl8/database模块集成
- **日志集成**: 与@hl8/nestjs-fastify日志系统集成

## 使用示例

### 完整的基础设施层配置

```typescript
import { InfrastructureKernel } from "@hl8/infrastructure-kernel";

const infrastructure = new InfrastructureKernel({
  database: {
    postgresql: {
      host: "localhost",
      port: 5432,
      database: "hl8_saas",
      username: "postgres",
      password: "password",
    },
    mongodb: {
      host: "localhost",
      port: 27017,
      database: "hl8_saas",
      username: "mongodb",
      password: "password",
    },
  },
  cache: {
    redis: {
      host: "localhost",
      port: 6379,
      password: "redis_password",
    },
  },
  logging: {
    level: "info",
    format: "json",
  },
  health: {
    interval: 30000,
    timeout: 5000,
  },
});

await infrastructure.initialize();
await infrastructure.start();
```

### 在应用中使用

```typescript
import { InfrastructureKernel } from "@hl8/infrastructure-kernel";

@Injectable()
export class UserService {
  constructor(
    private readonly infrastructure: InfrastructureKernel,
    private readonly isolationContext: IsolationContext,
  ) {}

  async createUser(userData: CreateUserRequest): Promise<User> {
    // 使用基础设施层服务
    const user = await this.infrastructure.database.save(
      new User(userData),
      this.isolationContext,
    );

    // 缓存用户信息
    await this.infrastructure.cache.set(`user:${user.id}`, user, { ttl: 600 });

    // 记录日志
    await this.infrastructure.logging.log(
      {
        operation: "CREATE_USER",
        resource: "User",
        ...this.isolationContext,
      },
      "用户创建成功",
      { userId: user.id },
    );

    return user;
  }
}
```

## 总结

基础设施层kernel优化项目提供了完整的基础设施层解决方案，支持多数据库、多租户隔离、性能优化和日志系统统一。通过参考backup/infrastructure的架构设计，结合当前系统需求，构建了高性能、高可用的基础设施层核心组件，为整个SAAS平台提供了坚实的技术基础。
