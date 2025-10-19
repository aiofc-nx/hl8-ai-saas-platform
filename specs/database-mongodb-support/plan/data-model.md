# 数据库模块 MongoDB 支持数据模型

**功能**: 数据库模块 MongoDB 支持  
**创建日期**: 2024-12-19

## 核心实体

### DatabaseConfig

**描述**: 数据库配置信息

**字段**:

- `type: "postgresql" | "mongodb"` - 数据库类型
- `host: string` - 数据库主机
- `port: number` - 数据库端口
- `database: string` - 数据库名称
- `username: string` - 用户名
- `password: string` - 密码
- `poolMin: number` - 连接池最小连接数
- `poolMax: number` - 连接池最大连接数
- `idleTimeoutMillis: number` - 空闲超时时间
- `acquireTimeoutMillis: number` - 获取连接超时时间
- `slowQueryThreshold: number` - 慢查询阈值
- `debug: boolean` - 调试模式

**验证规则**:

- `type` 必须是 "postgresql" 或 "mongodb"
- `port` 必须在 1-65535 范围内
- `poolMin` 必须大于等于 0
- `poolMax` 必须大于 0
- `idleTimeoutMillis` 必须大于等于 1000
- `acquireTimeoutMillis` 必须大于等于 1000
- `slowQueryThreshold` 必须大于等于 100

### ConnectionConfig

**描述**: 连接配置参数

**字段**:

- `type: "postgresql" | "mongodb"` - 数据库类型
- `host: string` - 主机地址
- `port: number` - 端口号
- `database: string` - 数据库名
- `username: string` - 用户名
- `password: string` - 密码

**验证规则**:

- 所有字段都是必需的
- `port` 必须在有效范围内
- `database` 不能为空

### PoolConfig

**描述**: 连接池配置参数

**字段**:

- `min: number` - 最小连接数
- `max: number` - 最大连接数
- `idleTimeoutMillis: number` - 空闲超时
- `acquireTimeoutMillis: number` - 获取超时
- `createTimeoutMillis: number` - 创建超时

**验证规则**:

- `min` 必须大于等于 0
- `max` 必须大于 0
- `max` 必须大于等于 `min`
- 所有超时时间必须大于 0

## 数据库驱动实体

### DatabaseDriver

**描述**: 数据库驱动抽象接口

**方法**:

- `connect(): Promise<void>` - 建立连接
- `disconnect(): Promise<void>` - 断开连接
- `isConnected(): Promise<boolean>` - 检查连接状态
- `getConnectionInfo(): ConnectionInfo` - 获取连接信息
- `getPoolStats(): PoolStats` - 获取连接池统计

### PostgreSQLDriver

**描述**: PostgreSQL 驱动实现

**特性**:

- 支持 ACID 事务
- 支持关系型查询
- 支持连接池管理
- 支持慢查询监控

### MongoDBDriver

**描述**: MongoDB 驱动实现

**特性**:

- 支持文档级事务
- 支持聚合查询
- 支持连接管理
- 支持操作性能监控

## 连接管理实体

### ConnectionManager

**描述**: 连接管理器

**字段**:

- `driver: DatabaseDriver` - 数据库驱动
- `status: ConnectionStatus` - 连接状态
- `connectedAt: Date` - 连接时间
- `lastActivityAt: Date` - 最后活动时间
- `reconnectAttempts: number` - 重连尝试次数

**方法**:

- `connect(): Promise<void>` - 建立连接
- `disconnect(): Promise<void>` - 断开连接
- `isConnected(): Promise<boolean>` - 检查连接状态
- `getConnectionInfo(): ConnectionInfo` - 获取连接信息
- `getPoolStats(): PoolStats` - 获取连接池统计
- `reconnect(): Promise<void>` - 重连

### ConnectionStatus

**描述**: 连接状态枚举

**值**:

- `DISCONNECTED` - 未连接
- `CONNECTING` - 连接中
- `CONNECTED` - 已连接
- `FAILED` - 连接失败
- `RECONNECTING` - 重连中

### ConnectionInfo

**描述**: 连接信息

**字段**:

- `host: string` - 主机地址
- `port: number` - 端口号
- `database: string` - 数据库名
- `type: string` - 数据库类型
- `connectedAt: Date` - 连接时间
- `uptime: number` - 运行时间

### PoolStats

**描述**: 连接池统计信息

**字段**:

- `total: number` - 总连接数
- `active: number` - 活跃连接数
- `idle: number` - 空闲连接数
- `waiting: number` - 等待连接数
- `max: number` - 最大连接数
- `min: number` - 最小连接数

## 事务管理实体

### TransactionService

**描述**: 事务服务

**方法**:

- `runInTransaction<T>(callback: (em: EntityManager) => Promise<T>): Promise<T>` - 运行事务
- `beginTransaction(): Promise<void>` - 开始事务
- `commitTransaction(): Promise<void>` - 提交事务
- `rollbackTransaction(): Promise<void>` - 回滚事务
- `isInTransaction(): boolean` - 检查是否在事务中

### TransactionContext

**描述**: 事务上下文

**字段**:

- `id: string` - 事务ID
- `startTime: Date` - 开始时间
- `timeout: number` - 超时时间
- `isActive: boolean` - 是否活跃

## 监控实体

### MetricsService

**描述**: 性能指标服务

**方法**:

- `recordQuery(query: QueryMetrics): void` - 记录查询指标
- `getSlowQueries(limit: number): QueryMetrics[]` - 获取慢查询
- `getPerformanceStats(): PerformanceStats` - 获取性能统计
- `clearMetrics(): void` - 清空指标

### QueryMetrics

**描述**: 查询指标

**字段**:

- `query: string` - 查询语句
- `duration: number` - 执行时间
- `timestamp: Date` - 时间戳
- `database: string` - 数据库类型
- `operation: string` - 操作类型

### PerformanceStats

**描述**: 性能统计

**字段**:

- `totalQueries: number` - 总查询数
- `slowQueries: number` - 慢查询数
- `averageDuration: number` - 平均执行时间
- `maxDuration: number` - 最大执行时间
- `minDuration: number` - 最小执行时间

## 实体关系

### 一对多关系

- `DatabaseConfig` → `ConnectionConfig` (1:1)
- `DatabaseConfig` → `PoolConfig` (1:1)
- `ConnectionManager` → `DatabaseDriver` (1:1)
- `TransactionService` → `EntityManager` (1:1)

### 依赖关系

- `ConnectionManager` 依赖 `DatabaseDriver`
- `TransactionService` 依赖 `ConnectionManager`
- `MetricsService` 依赖 `ConnectionManager`

## 状态转换

### ConnectionStatus 状态转换

```
DISCONNECTED → CONNECTING → CONNECTED
     ↑              ↓
     ← RECONNECTING ← FAILED
```

### TransactionContext 状态转换

```
INACTIVE → ACTIVE → COMMITTED
    ↑         ↓
    ← ROLLED_BACK ←
```

## 验证规则

### 数据库配置验证

- 数据库类型必须是支持的类型
- 端口号必须在有效范围内
- 连接池配置必须合理
- 超时时间必须大于 0

### 连接管理验证

- 连接状态转换必须合法
- 重连次数不能超过限制
- 连接信息必须完整

### 事务管理验证

- 事务超时时间必须合理
- 事务状态转换必须合法
- 事务上下文必须完整

## 业务规则

### 连接管理规则

- 应用启动时自动建立连接
- 连接失败时使用指数退避重试
- 最多重试 5 次，超过后抛出异常
- 连接断开时自动尝试重连

### 事务管理规则

- 事务必须保证原子性
- 成功时自动提交，失败时自动回滚
- 支持嵌套事务
- 默认事务超时为 60 秒

### 监控规则

- 慢查询阈值默认为 1000ms
- 性能指标保存在内存中
- 重启后数据丢失（预期行为）
- 查询 SQL 需要脱敏处理
