/**
 * 数据库适配器接口
 *
 * @description 定义数据库适配器的通用接口
 * @since 1.0.0
 */

import type {
  DatabaseAdapter,
  DatabaseOperationResult,
  DatabaseQueryOptions,
  DatabaseTransactionOptions,
} from "../types/database.types.js";
import type { DatabaseConnectionEntity } from "../entities/database-connection.entity.js";
import type { PostgreSQLConnectionEntity } from "../entities/postgresql-connection.entity.js";
import type { MongoDBConnectionEntity } from "../entities/mongodb-connection.entity.js";

/**
 * 数据库适配器接口
 */
export interface IDatabaseAdapter extends DatabaseAdapter {
  /** 执行查询 */
  query<T = unknown>(
    sql: string,
    params?: unknown[],
  ): Promise<DatabaseOperationResult<T[]>>;

  /** 执行事务 */
  transaction<T>(
    callback: (trx: unknown) => Promise<T>,
    options?: DatabaseTransactionOptions,
  ): Promise<DatabaseOperationResult<T>>;

  /** 批量插入 */
  batchInsert<T>(
    table: string,
    data: T[],
    options?: DatabaseQueryOptions,
  ): Promise<DatabaseOperationResult<number>>;

  /** 批量更新 */
  batchUpdate<T>(
    table: string,
    data: T[],
    where: Record<string, unknown>,
  ): Promise<DatabaseOperationResult<number>>;

  /** 批量删除 */
  batchDelete(
    table: string,
    where: Record<string, unknown>,
  ): Promise<DatabaseOperationResult<number>>;

  /** 获取连接信息 */
  getConnectionInfo(): Promise<Record<string, unknown>>;

  /** 获取性能统计 */
  getPerformanceStats(): Promise<Record<string, unknown>>;
}

/**
 * PostgreSQL适配器接口
 */
export interface IPostgreSQLAdapter extends IDatabaseAdapter {
  /** 执行PostgreSQL特定查询 */
  executePostgreSQLQuery<T = unknown>(
    sql: string,
    params?: unknown[],
  ): Promise<DatabaseOperationResult<T[]>>;

  /** 创建索引 */
  createIndex(
    table: string,
    columns: string[],
    options?: Record<string, unknown>,
  ): Promise<DatabaseOperationResult<void>>;

  /** 删除索引 */
  dropIndex(
    table: string,
    indexName: string,
  ): Promise<DatabaseOperationResult<void>>;

  /** 获取表信息 */
  getTableInfo(table: string): Promise<DatabaseOperationResult<unknown>>;

  /** 获取索引信息 */
  getIndexInfo(table: string): Promise<DatabaseOperationResult<unknown[]>>;
}

/**
 * MongoDB适配器接口
 */
export interface IMongoDBAdapter extends IDatabaseAdapter {
  /** 执行MongoDB特定查询 */
  executeMongoDBQuery<T = unknown>(
    collection: string,
    query: Record<string, unknown>,
    options?: Record<string, unknown>,
  ): Promise<DatabaseOperationResult<T[]>>;

  /** 创建集合 */
  createCollection(
    name: string,
    options?: Record<string, unknown>,
  ): Promise<DatabaseOperationResult<void>>;

  /** 删除集合 */
  dropCollection(name: string): Promise<DatabaseOperationResult<void>>;

  /** 创建索引 */
  createIndex(
    collection: string,
    keys: Record<string, unknown>,
    options?: Record<string, unknown>,
  ): Promise<DatabaseOperationResult<string>>;

  /** 删除索引 */
  dropIndex(
    collection: string,
    indexName: string,
  ): Promise<DatabaseOperationResult<void>>;

  /** 获取集合信息 */
  getCollectionInfo(
    collection: string,
  ): Promise<DatabaseOperationResult<unknown>>;

  /** 获取索引信息 */
  getIndexInfo(collection: string): Promise<DatabaseOperationResult<unknown[]>>;
}

/**
 * 数据库连接管理器接口
 */
export interface IDatabaseConnectionManager {
  /** 获取连接 */
  getConnection(name: string): Promise<IDatabaseAdapter>;

  /** 创建连接 */
  createConnection(
    name: string,
    config: DatabaseConnectionEntity,
  ): Promise<IDatabaseAdapter>;

  /** 关闭连接 */
  closeConnection(name: string): Promise<void>;

  /** 关闭所有连接 */
  closeAllConnections(): Promise<void>;

  /** 获取连接状态 */
  getConnectionStatus(name: string): Promise<string>;

  /** 获取所有连接状态 */
  getAllConnectionStatus(): Promise<Record<string, string>>;

  /** 健康检查 */
  healthCheck(): Promise<Record<string, boolean>>;
}

/**
 * 数据库工厂接口
 */
export interface IDatabaseFactory {
  /** 创建PostgreSQL适配器 */
  createPostgreSQLAdapter(
    config: PostgreSQLConnectionEntity,
  ): Promise<IPostgreSQLAdapter>;

  /** 创建MongoDB适配器 */
  createMongoDBAdapter(
    config: MongoDBConnectionEntity,
  ): Promise<IMongoDBAdapter>;

  /** 创建连接管理器 */
  createConnectionManager(): IDatabaseConnectionManager;

  /** 获取支持的数据库类型 */
  getSupportedTypes(): string[];
}

// 重新导出类型
export type {
  DatabaseOperationResult,
  DatabaseQueryOptions,
  DatabaseTransactionOptions,
} from "../types/database.types.js";
