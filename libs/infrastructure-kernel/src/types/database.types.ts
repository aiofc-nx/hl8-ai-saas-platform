/**
 * 数据库连接类型定义
 *
 * @description 定义数据库连接相关的类型和接口
 * @since 1.0.0
 */

/**
 * 数据库连接类型
 */
export type DatabaseType = "POSTGRESQL" | "MONGODB";

/**
 * 数据库连接状态
 */
export type ConnectionStatus = "ACTIVE" | "INACTIVE" | "ERROR";

/**
 * 数据库连接配置接口
 */
export interface DatabaseConnectionConfig {
  /** 连接ID */
  id: string;
  /** 连接名称 */
  name: string;
  /** 数据库类型 */
  type: DatabaseType;
  /** 主机地址 */
  host: string;
  /** 端口号 */
  port: number;
  /** 数据库名称 */
  database: string;
  /** 用户名 */
  username: string;
  /** 密码 */
  password: string;
  /** 是否启用SSL */
  ssl: boolean;
  /** 连接池大小 */
  poolSize: number;
  /** 连接超时时间(秒) */
  timeout: number;
  /** 连接状态 */
  status: ConnectionStatus;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * PostgreSQL连接配置接口
 */
export interface PostgreSQLConnectionConfig extends DatabaseConnectionConfig {
  type: "POSTGRESQL";
  /** 数据库模式 */
  schema: string;
  /** SSL模式 */
  sslMode: "disable" | "require" | "verify-ca" | "verify-full";
  /** 最大连接数 */
  maxConnections: number;
  /** 空闲超时时间(秒) */
  idleTimeout: number;
  /** 查询超时时间(秒) */
  queryTimeout: number;
}

/**
 * MongoDB连接配置接口
 */
export interface MongoDBConnectionConfig extends DatabaseConnectionConfig {
  type: "MONGODB";
  /** 副本集名称 */
  replicaSet: string;
  /** 认证源 */
  authSource: string;
  /** 最大连接池大小 */
  maxPoolSize: number;
  /** 最小连接池大小 */
  minPoolSize: number;
  /** 最大空闲时间(毫秒) */
  maxIdleTimeMS: number;
  /** 服务器选择超时时间(毫秒) */
  serverSelectionTimeoutMS: number;
}

/**
 * 数据库配置接口
 */
export interface DatabaseConfig {
  /** 配置ID */
  id: string;
  /** 配置名称 */
  name: string;
  /** 主连接ID */
  primaryConnection: string;
  /** 备用连接ID列表 */
  secondaryConnections: string[];
  /** 默认连接ID */
  defaultConnection: string;
  /** 是否自动切换 */
  autoSwitch: boolean;
  /** 健康检查间隔(秒) */
  healthCheckInterval: number;
  /** 重试次数 */
  retryAttempts: number;
  /** 重试延迟(毫秒) */
  retryDelay: number;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 数据库适配器接口
 */
export interface DatabaseAdapter {
  /** 连接数据库 */
  connect(): Promise<void>;
  /** 断开数据库连接 */
  disconnect(): Promise<void>;
  /** 获取仓储实例 */
  getRepository(entity: unknown): unknown;
  /** 健康检查 */
  healthCheck(): Promise<boolean>;
  /** 获取连接状态 */
  getStatus(): ConnectionStatus;
}

/**
 * 数据库操作结果接口
 */
export interface DatabaseOperationResult<T = unknown> {
  /** 操作是否成功 */
  success: boolean;
  /** 返回数据 */
  data?: T;
  /** 错误信息 */
  _error?: string;
  /** 执行时间(毫秒) */
  executionTime: number;
}

/**
 * 数据库查询选项
 */
export interface DatabaseQueryOptions {
  /** 限制数量 */
  limit?: number;
  /** 偏移量 */
  offset?: number;
  /** 排序字段 */
  orderBy?: string;
  /** 排序方向 */
  orderDirection?: "ASC" | "DESC";
  /** 过滤条件 */
  where?: Record<string, unknown>;
}

/**
 * 数据库事务选项
 */
export interface DatabaseTransactionOptions {
  /** 隔离级别 */
  isolationLevel?:
    | "READ_UNCOMMITTED"
    | "READ_COMMITTED"
    | "REPEATABLE_READ"
    | "SERIALIZABLE";
  /** 超时时间(毫秒) */
  timeout?: number;
  /** 是否只读 */
  readOnly?: boolean;
}
