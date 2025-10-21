# Data Model: 基础设施层kernel数据模型

**Feature**: 002-optimize-infrastructure-kernel  
**Date**: 2025-01-27  
**Status**: Design Phase

## Entity Definitions

### 1. DatabaseConnection (数据库连接实体)

```typescript
interface DatabaseConnection {
  id: string;
  name: string;
  type: 'POSTGRESQL' | 'MONGODB';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  poolSize: number;
  timeout: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  createdAt: Date;
  updatedAt: Date;
}
```

**业务规则**:

- 每个连接必须包含完整的连接信息
- 连接状态必须实时更新
- 支持连接池配置和超时设置

### 2. PostgreSQLConnection (PostgreSQL连接实体)

```typescript
interface PostgreSQLConnection extends DatabaseConnection {
  type: 'POSTGRESQL';
  schema: string;
  sslMode: 'disable' | 'require' | 'verify-ca' | 'verify-full';
  maxConnections: number;
  idleTimeout: number;
  queryTimeout: number;
}
```

**业务规则**:

- 必须指定PostgreSQL特定的配置参数
- 支持SSL模式配置
- 支持连接池和查询超时设置

### 3. MongoDBConnection (MongoDB连接实体)

```typescript
interface MongoDBConnection extends DatabaseConnection {
  type: 'MONGODB';
  replicaSet: string;
  authSource: string;
  maxPoolSize: number;
  minPoolSize: number;
  maxIdleTimeMS: number;
  serverSelectionTimeoutMS: number;
}
```

**业务规则**:

- 必须指定MongoDB特定的配置参数
- 支持副本集配置
- 支持连接池和服务器选择超时

### 4. DatabaseConfig (数据库配置实体)

```typescript
interface DatabaseConfig {
  id: string;
  name: string;
  primaryConnection: string;
  secondaryConnections: string[];
  defaultConnection: string;
  autoSwitch: boolean;
  healthCheckInterval: number;
  retryAttempts: number;
  retryDelay: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**业务规则**:

- 必须指定主连接和备用连接
- 支持自动切换和健康检查
- 支持重试机制配置

### 5. CacheEntry (缓存条目实体)

```typescript
interface CacheEntry {
  key: string;
  value: any;
  ttl: number;
  createdAt: Date;
  expiresAt: Date;
  accessCount: number;
  lastAccessed: Date;
  tags: string[];
  isolationContext: IsolationContext;
}
```

**业务规则**:

- 缓存键必须包含隔离上下文信息
- 支持TTL和标签管理
- 记录访问统计信息

### 6. TransactionContext (事务上下文实体)

```typescript
interface TransactionContext {
  id: string;
  isolationLevel: 'READ_UNCOMMITTED' | 'READ_COMMITTED' | 'REPEATABLE_READ' | 'SERIALIZABLE';
  timeout: number;
  status: 'ACTIVE' | 'COMMITTED' | 'ROLLED_BACK' | 'TIMEOUT';
  startTime: Date;
  endTime?: Date;
  operations: TransactionOperation[];
  isolationContext: IsolationContext;
}
```

**业务规则**:

- 事务必须包含隔离级别和超时设置
- 支持事务状态跟踪
- 记录所有事务操作

### 7. IsolationContext (隔离上下文实体)

```typescript
interface IsolationContext {
  tenantId: string;
  organizationId?: string;
  departmentId?: string;
  userId?: string;
  sharingLevel: 'PLATFORM' | 'TENANT' | 'ORGANIZATION' | 'DEPARTMENT' | 'USER';
  isShared: boolean;
  accessRules: AccessRule[];
  createdAt: Date;
  updatedAt: Date;
}
```

**业务规则**:

- 必须包含租户ID
- 支持5级数据隔离
- 支持共享级别控制

### 8. AuditLog (审计日志实体)

```typescript
interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  userId: string;
  tenantId: string;
  organizationId?: string;
  departmentId?: string;
  timestamp: Date;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  result: 'SUCCESS' | 'FAILURE' | 'ERROR';
}
```

**业务规则**:

- 必须记录完整的操作信息
- 支持多层级审计追踪
- 记录操作结果和上下文

### 9. PinoLogger (Pino日志记录器实体)

```typescript
interface PinoLogger {
  name: string;
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  serializers: Record<string, Serializer>;
  formatters: Record<string, Formatter>;
  timestamp: boolean;
  base: Record<string, any>;
  enabled: boolean;
}
```

**业务规则**:

- 支持多级别日志记录
- 支持自定义序列化器
- 支持结构化日志输出

### 10. LogContext (日志上下文实体)

```typescript
interface LogContext {
  requestId: string;
  tenantId: string;
  organizationId?: string;
  departmentId?: string;
  userId?: string;
  operation: string;
  resource: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: Record<string, any>;
}
```

**业务规则**:

- 必须包含请求ID和租户ID
- 支持多层级日志隔离
- 支持结构化日志数据

### 11. HealthStatus (健康状态实体)

```typescript
interface HealthStatus {
  component: string;
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  lastCheck: Date;
  responseTime: number;
  errorRate: number;
  details: Record<string, any>;
  dependencies: HealthStatus[];
}
```

**业务规则**:

- 必须包含组件状态和检查时间
- 支持依赖关系检查
- 支持性能指标监控

### 12. Configuration (配置实体)

```typescript
interface Configuration {
  key: string;
  value: any;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'OBJECT' | 'ARRAY';
  category: string;
  description: string;
  isEncrypted: boolean;
  isRequired: boolean;
  defaultValue?: any;
  validationRules: ValidationRule[];
  createdAt: Date;
  updatedAt: Date;
}
```

**业务规则**:

- 配置键必须唯一
- 支持类型验证和加密
- 支持默认值和验证规则

## Relationships

### 1. DatabaseConnection → DatabaseConfig

- 一个配置可以包含多个连接
- 一个连接可以属于多个配置

### 2. IsolationContext → CacheEntry

- 缓存条目必须包含隔离上下文
- 隔离上下文影响缓存可见性

### 3. TransactionContext → IsolationContext

- 事务必须包含隔离上下文
- 隔离上下文影响事务范围

### 4. AuditLog → IsolationContext

- 审计日志必须包含隔离上下文
- 隔离上下文影响审计范围

## Validation Rules

### 1. DatabaseConnection验证

- 连接信息必须完整
- 端口号必须在有效范围内
- 密码必须加密存储

### 2. IsolationContext验证

- 租户ID必须存在
- 组织ID和部门ID必须属于同一租户
- 用户ID必须属于指定部门

### 3. CacheEntry验证

- 缓存键必须包含隔离上下文
- TTL必须大于0
- 标签必须符合命名规范

### 4. TransactionContext验证

- 隔离级别必须有效
- 超时时间必须大于0
- 操作列表不能为空

## State Transitions

### 1. DatabaseConnection状态转换

```
INACTIVE → ACTIVE (连接成功)
ACTIVE → ERROR (连接失败)
ERROR → ACTIVE (重连成功)
ERROR → INACTIVE (连接关闭)
```

### 2. TransactionContext状态转换

```
ACTIVE → COMMITTED (提交成功)
ACTIVE → ROLLED_BACK (回滚)
ACTIVE → TIMEOUT (超时)
```

### 3. HealthStatus状态转换

```
HEALTHY → DEGRADED (性能下降)
DEGRADED → UNHEALTHY (服务不可用)
UNHEALTHY → HEALTHY (服务恢复)
```

## Data Access Patterns

### 1. 多租户数据访问

- 所有查询必须包含隔离上下文
- 自动过滤非授权数据
- 支持跨层级数据共享

### 2. 缓存策略

- L1: 内存缓存 (Redis)
- L2: 数据库查询缓存
- L3: 应用层缓存

### 3. 事务管理

- 支持分布式事务
- 支持事务回滚
- 支持事务超时

## Performance Considerations

### 1. 数据库连接池

- PostgreSQL: 最大连接数100
- MongoDB: 最大连接数50
- Redis: 最大连接数200

### 2. 缓存策略

- 缓存命中率目标: 80%
- 缓存TTL: 5-60分钟
- 缓存大小限制: 1GB

### 3. 查询优化

- 索引优化
- 查询计划分析
- 慢查询监控
