/**
 * 数据库服务
 *
 * @description 提供统一的数据库操作服务
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { InfrastructureExceptionConverter } from "../../exceptions/infrastructure-exception.mapping.js";
import type {
  IDatabaseConnectionManager,
  IDatabaseAdapter,
} from "../../interfaces/database-adapter.interface.js";
import type { DatabaseConfigEntity } from "../../entities/database-config.entity.js";
import type { DatabaseConnectionEntity } from "../../entities/database-connection.entity.js";
import type { IsolationContext } from "../../types/isolation.types.js";

/**
 * 数据库服务
 */
@Injectable()
export class DatabaseService {
  constructor(
    private readonly connectionManager: IDatabaseConnectionManager,
    private readonly isolationContext?: IsolationContext,
  ) {}

  /**
   * 获取数据库连接
   */
  async getConnection(name: string): Promise<IDatabaseAdapter> {
    try {
      return await this.connectionManager.getConnection(name);
    } catch (_error) {
      const standardError =
        _error instanceof Error ? _error : new Error(String(_error));
      throw InfrastructureExceptionConverter.convertToStandardException(
        standardError,
        "DATABASE",
        { operation: "getConnection", connectionName: name },
      );
    }
  }

  /**
   * 创建数据库连接
   */
  async createConnection(
    name: string,
    config: DatabaseConfigEntity,
  ): Promise<IDatabaseAdapter> {
    try {
      return await this.connectionManager.createConnection(
        name,
        config as unknown as DatabaseConnectionEntity,
      );
    } catch (_error) {
      const standardError =
        _error instanceof Error ? _error : new Error(String(_error));
      throw InfrastructureExceptionConverter.convertToStandardException(
        standardError,
        "DATABASE",
        { operation: "createConnection", connectionName: name },
      );
    }
  }

  /**
   * 关闭数据库连接
   */
  async closeConnection(name: string): Promise<void> {
    try {
      await this.connectionManager.closeConnection(name);
    } catch (_error) {
      const standardError =
        _error instanceof Error ? _error : new Error(String(_error));
      throw InfrastructureExceptionConverter.convertToStandardException(
        standardError,
        "DATABASE",
        { operation: "closeConnection", connectionName: name },
      );
    }
  }

  /**
   * 执行数据库操作
   */
  async executeOperation<T>(
    connectionName: string,
    operation: (adapter: IDatabaseAdapter) => Promise<T>,
  ): Promise<T> {
    try {
      const connection = await this.getConnection(connectionName);
      return await operation(connection);
    } catch (_error) {
      throw new Error(
        `执行数据库操作失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 执行事务
   */
  async executeTransaction<T>(
    connectionName: string,
    operation: (adapter: IDatabaseAdapter) => Promise<T>,
  ): Promise<T> {
    try {
      const connection = await this.getConnection(connectionName);

      const result = await connection.transaction(async (_trx) => {
        return await operation(connection);
      });
      return result as T;
    } catch (_error) {
      throw new Error(
        `执行事务失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    try {
      return await this.connectionManager.healthCheck();
    } catch (_error) {
      throw new Error(
        `健康检查失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 获取连接状态
   */
  async getConnectionStatus(name: string): Promise<string> {
    try {
      return await this.connectionManager.getConnectionStatus(name);
    } catch (_error) {
      throw new Error(
        `获取连接状态失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 获取所有连接状态
   */
  async getAllConnectionStatus(): Promise<Record<string, string>> {
    try {
      return await this.connectionManager.getAllConnectionStatus();
    } catch (_error) {
      throw new Error(
        `获取所有连接状态失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 重新连接
   */
  async reconnect(_name: string): Promise<void> {
    try {
      // 暂时注释掉，因为接口中没有这个方法
      // await this.connectionManager.reconnect(name);
      console.warn("reconnect 方法暂时不可用");
    } catch (_error) {
      throw new Error(
        `重新连接失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 重新连接所有连接
   */
  async reconnectAll(): Promise<void> {
    try {
      // 暂时注释掉，因为接口中没有这个方法
      // await this.connectionManager.reconnectAll();
      console.warn("reconnectAll 方法暂时不可用");
    } catch (_error) {
      throw new Error(
        `重新连接所有连接失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 获取数据库统计信息
   */
  async getDatabaseStats(
    connectionName: string,
  ): Promise<Record<string, unknown>> {
    try {
      const connection = await this.getConnection(connectionName);
      return await connection.getPerformanceStats();
    } catch (_error) {
      throw new Error(
        `获取数据库统计信息失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 获取连接信息
   */
  async getConnectionInfo(
    connectionName: string,
  ): Promise<Record<string, unknown>> {
    try {
      const connection = await this.getConnection(connectionName);
      return await connection.getConnectionInfo();
    } catch (_error) {
      throw new Error(
        `获取连接信息失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 执行查询
   */
  async query(
    connectionName: string,
    sql: string,
    params?: unknown[],
  ): Promise<unknown> {
    try {
      const connection = await this.getConnection(connectionName);
      return await connection.query(sql, params);
    } catch (_error) {
      throw new Error(
        `执行查询失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 批量插入
   */
  async batchInsert(
    connectionName: string,
    table: string,
    data: Record<string, unknown>[],
    options?: Record<string, unknown>,
  ): Promise<number> {
    try {
      const connection = await this.getConnection(connectionName);
      const result = await connection.batchInsert(table, data, options);
      return result.data || 0;
    } catch (_error) {
      throw new Error(
        `批量插入失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 批量更新
   */
  async batchUpdate(
    connectionName: string,
    table: string,
    data: Record<string, unknown>[],
    where: Record<string, unknown>,
  ): Promise<number> {
    try {
      const connection = await this.getConnection(connectionName);
      const result = await connection.batchUpdate(table, data, where);
      return result.data || 0;
    } catch (_error) {
      throw new Error(
        `批量更新失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 批量删除
   */
  async batchDelete(
    connectionName: string,
    table: string,
    where: Record<string, unknown>,
  ): Promise<number> {
    try {
      const connection = await this.getConnection(connectionName);
      const result = await connection.batchDelete(table, where);
      return result.data || 0;
    } catch (_error) {
      throw new Error(
        `批量删除失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 获取管理器统计信息
   */
  getManagerStats(): Record<string, unknown> {
    try {
      // 暂时注释掉，因为接口中没有这个方法
      // return this.connectionManager.getManagerStats();
      console.warn("getManagerStats 方法暂时不可用");
      return {};
    } catch (_error) {
      throw new Error(
        `获取管理器统计信息失败: ${_error instanceof Error ? _error.message : "未知错误"}`,
      );
    }
  }

  /**
   * 检查连接是否存在
   */
  hasConnection(_name: string): boolean {
    try {
      // 暂时注释掉，因为接口中没有这个方法
      // return this.connectionManager.hasConnection(name);
      console.warn("hasConnection 方法暂时不可用");
      return false;
    } catch (_error) {
      return false;
    }
  }

  /**
   * 获取连接数量
   */
  getConnectionCount(): number {
    try {
      // 暂时注释掉，因为接口中没有这个方法
      // return this.connectionManager.getConnectionCount();
      console.warn("getConnectionCount 方法暂时不可用");
      return 0;
    } catch (_error) {
      return 0;
    }
  }
}
