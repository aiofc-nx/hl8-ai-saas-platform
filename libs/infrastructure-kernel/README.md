# 基础设施层kernel

基础设施层kernel为SAAS平台提供企业级的基础设施支撑，包括多数据库支持、多租户隔离、性能监控、错误处理等核心功能。

## 🚀 核心功能

### 1. 多数据库支持

- **PostgreSQL支持**: 完整的MikroORM集成，支持事务、索引、查询优化
- **MongoDB支持**: 文档数据库支持，副本集配置，聚合查询
- **连接管理**: 统一的连接池管理，健康检查，自动重连
- **连接池服务**: 支持LRU、LFU、FIFO、TTL策略，性能优化

### 2. 领域层集成

- **聚合根支持**: 事件溯源，状态重建，快照管理
- **事件存储**: 领域事件持久化，版本控制，隔离过滤
- **读模型**: CQRS模式支持，查询优化，缓存集成

### 3. 应用层集成

- **CQRS模式**: 命令处理、查询处理、用例执行、事件处理
- **事务管理**: 分布式事务支持，事务上下文管理
- **缓存系统**: 多策略缓存，缓存预热，性能优化
- **集成服务**: 与application-kernel和domain-kernel的完整集成

### 4. 多租户隔离

- **隔离上下文**: 5级数据隔离 (平台/租户/组织/部门/用户)
- **访问控制**: 基于上下文的权限验证，规则引擎
- **数据过滤**: 自动应用隔离条件到所有查询
- **权限管理**: 细粒度权限控制，权限摘要
- **审计日志**: 完整的审计跟踪，安全事件记录
- **安全监控**: 异常访问检测，安全告警

### 5. 性能监控

- **性能指标**: 响应时间、吞吐量、错误率、内存使用、CPU使用
- **健康检查**: 数据库、缓存、日志、内存、磁盘健康检查
- **指标收集**: 多维度指标收集，聚合分析
- **告警系统**: 阈值监控，性能告警
- **监控仪表板**: 实时性能监控，历史数据分析
- **性能优化**: 自动性能优化建议，智能优化策略

### 6. 错误处理

- **错误处理**: 统一错误处理，错误分类，错误恢复
- **熔断器**: 防止级联故障，自动熔断和恢复
- **重试机制**: 智能重试策略，指数退避，抖动因子
- **故障恢复**: 自动故障检测和恢复，系统自愈

## 📦 安装

```bash
pnpm add @hl8/infrastructure-kernel
```

## 🔧 配置

### 数据库配置

```typescript
import { DatabaseService } from '@hl8/infrastructure-kernel';

const databaseService = new DatabaseService();

// 配置PostgreSQL
await databaseService.connect('postgres', 'postgresql', {
  type: 'postgresql',
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'password',
  dbName: 'myapp'
});

// 配置MongoDB
await databaseService.connect('mongodb', 'mongodb', {
  type: 'mongodb',
  host: 'localhost',
  port: 27017,
  dbName: 'myapp'
});
```

### 缓存配置

```typescript
import { CacheService } from '@hl8/infrastructure-kernel';

const cacheService = new CacheService();

// 配置缓存策略
cacheService.setConfig({
  keyPrefix: 'myapp:',
  defaultTtl: 300,
  maxSize: 1000,
  strategy: 'LRU',
  enableCompression: false,
  enableSerialization: true
});
```

### 隔离配置

```typescript
import { IsolationManager } from '@hl8/infrastructure-kernel';

const isolationManager = new IsolationManager();

// 创建隔离上下文
const context = isolationManager.createIsolationContext(
  'tenant1',
  'org1',
  'dept1',
  'user1'
);

// 设置当前隔离上下文
isolationManager.setCurrentIsolationContext(context);
```

## 🎯 使用示例

### 基础使用

```typescript
import { InfrastructureKernelService } from '@hl8/infrastructure-kernel';

@Injectable()
export class AppService {
  constructor(
    private readonly infrastructureKernel: InfrastructureKernelService
  ) {}

  async initialize() {
    // 初始化基础设施层
    await this.infrastructureKernel.initialize();
  }

  async getSystemStatus() {
    // 获取系统状态
    return await this.infrastructureKernel.getSystemStatus();
  }

  async healthCheck() {
    // 健康检查
    return await this.infrastructureKernel.healthCheck();
  }
}
```

### 数据库操作

```typescript
import { DatabaseService } from '@hl8/infrastructure-kernel';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createUser(userData: any) {
    const connection = this.databaseService.getConnection('postgres');
    // 执行数据库操作
    return await connection.query('INSERT INTO users ...');
  }
}
```

### 缓存操作

```typescript
import { CacheService } from '@hl8/infrastructure-kernel';

@Injectable()
export class CacheService {
  constructor(private readonly cacheService: CacheService) {}

  async getUser(id: string) {
    // 尝试从缓存获取
    const cached = await this.cacheService.get(`user:${id}`);
    if (cached) {
      return cached;
    }

    // 从数据库获取
    const user = await this.databaseService.getUser(id);
    
    // 缓存结果
    await this.cacheService.set(`user:${id}`, user, { ttl: 300 });
    
    return user;
  }
}
```

### 隔离操作

```typescript
import { IsolationManager } from '@hl8/infrastructure-kernel';

@Injectable()
export class DataService {
  constructor(private readonly isolationManager: IsolationManager) {}

  async getData() {
    // 获取当前隔离上下文
    const context = this.isolationManager.getCurrentIsolationContext();
    
    // 验证访问权限
    const hasAccess = await this.isolationManager.validateAccess(context, { id: 'data1' });
    if (!hasAccess) {
      throw new Error('访问被拒绝');
    }

    // 获取数据
    const data = await this.databaseService.getData();
    
    // 应用隔离过滤
    return this.isolationManager.filterData(data, context);
  }
}
```

### 性能监控

```typescript
import { PerformanceMonitorService } from '@hl8/infrastructure-kernel';

@Injectable()
export class MonitoringService {
  constructor(private readonly performanceMonitor: PerformanceMonitorService) {}

  async startMonitoring() {
    // 开始性能监控
    this.performanceMonitor.startMonitoring();
  }

  async getPerformanceStats() {
    // 获取性能统计
    return this.performanceMonitor.getPerformanceStats();
  }
}
```

### 错误处理

```typescript
import { ErrorHandlerService, CircuitBreakerService } from '@hl8/infrastructure-kernel';

@Injectable()
export class ApiService {
  constructor(
    private readonly errorHandler: ErrorHandlerService,
    private readonly circuitBreaker: CircuitBreakerService
  ) {}

  async callExternalApi() {
    try {
      // 使用熔断器保护外部API调用
      return await this.circuitBreaker.execute('external-api', async () => {
        // 调用外部API
        return await this.httpService.get('https://api.example.com');
      });
    } catch (error) {
      // 处理错误
      await this.errorHandler.handleError(error, { operation: 'callExternalApi' });
      throw error;
    }
  }
}
```

## 🏗️ 架构设计

### Clean Architecture + DDD + CQRS + ES + EDA

基础设施层遵循Clean Architecture原则，与领域层和应用层完整集成：

- **Clean Architecture**: 基础设施层不依赖其他层，提供技术实现
- **DDD**: 支持富领域模型，聚合根，值对象，领域服务
- **CQRS**: 命令查询分离，独立优化读写模型
- **ES**: 事件溯源，状态重建，版本控制
- **EDA**: 事件驱动架构，松耦合设计

### 多租户架构

支持5级数据隔离：

1. **平台级**: 全局数据，所有租户共享
2. **租户级**: 租户内数据，租户间隔离
3. **组织级**: 组织内数据，组织间隔离
4. **部门级**: 部门内数据，部门间隔离
5. **用户级**: 用户私有数据，用户间隔离

### 性能优化

- **连接池管理**: 支持1000并发连接
- **缓存集成**: Redis + 内存缓存，多策略支持
- **查询优化**: 索引优化，聚合查询
- **事务管理**: ACID保证，分布式事务
- **性能监控**: 实时指标收集，自动优化

### 可靠性保证

- **熔断器模式**: 防止级联故障
- **重试机制**: 智能重试策略
- **错误处理**: 统一错误管理
- **故障恢复**: 系统自愈能力
- **健康检查**: 系统状态监控

## 📊 监控和指标

### 性能指标

- 响应时间
- 吞吐量
- 错误率
- 内存使用
- CPU使用
- 数据库连接数
- 缓存命中率

### 健康检查

- 数据库健康
- 缓存健康
- 日志健康
- 内存健康
- 磁盘健康

### 告警系统

- 阈值监控
- 性能告警
- 错误告警
- 资源告警

## 🔒 安全特性

### 访问控制

- 基于上下文的权限验证
- 细粒度权限控制
- 规则引擎
- 权限摘要

### 审计日志

- 完整的操作跟踪
- 安全事件记录
- 异常访问检测
- 合规性支持

### 数据隔离

- 5级数据隔离
- 自动隔离过滤
- 数据安全保护
- 隐私保护

## 🧪 测试

```bash
# 运行测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 运行特定测试
pnpm test --testNamePattern="DatabaseService"
```

## 📚 API文档

详细的API文档请参考：

- [数据库服务API](./docs/database-api.md)
- [缓存服务API](./docs/cache-api.md)
- [隔离服务API](./docs/isolation-api.md)
- [性能监控API](./docs/performance-api.md)
- [错误处理API](./docs/error-handling-api.md)

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](./CONTRIBUTING.md) 了解详细信息。

## 📄 许可证

本项目采用 MIT 许可证。详情请查看 [LICENSE](./LICENSE) 文件。

## 🆘 支持

如果您遇到问题或有任何疑问，请：

1. 查看 [FAQ](./docs/faq.md)
2. 搜索 [Issues](https://github.com/your-org/hl8-ai-saas-platform/issues)
3. 创建新的 Issue
4. 联系维护团队

---

**基础设施层kernel - 为SAAS平台提供企业级基础设施支撑** 🚀
