/**
 * 数据库连接管理器
 *
 * @description 管理多个数据库连接的生命周期
 * @since 1.0.0
 */

import type { IDatabaseConnectionManager, IDatabaseAdapter } from '../../interfaces/database-adapter.interface.js';
import type { DatabaseConnectionEntity } from '../../entities/database-connection.entity.js';
import { PostgreSQLAdapter } from './postgresql-adapter.js';
import { MongoDBAdapter } from './mongodb-adapter.js';

/**
 * 数据库连接管理器
 */
export class DatabaseConnectionManager implements IDatabaseConnectionManager {
  private connections = new Map<string, IDatabaseAdapter>();
  private connectionConfigs = new Map<string, DatabaseConnectionEntity>();

  /**
   * 获取连接
   */
  async getConnection(name: string): Promise<IDatabaseAdapter> {
    const connection = this.connections.get(name);
    if (!connection) {
      throw new Error(`连接 ${name} 不存在`);
    }
    return connection;
  }

  /**
   * 创建连接
   */
  async createConnection(
    name: string,
    config: DatabaseConnectionEntity
  ): Promise<IDatabaseAdapter> {
    if (this.connections.has(name)) {
      throw new Error(`连接 ${name} 已存在`);
    }

    let adapter: IDatabaseAdapter;

    switch (config.type) {
      case 'POSTGRESQL':
        adapter = new PostgreSQLAdapter(config as any);
        break;
      case 'MONGODB':
        adapter = new MongoDBAdapter(config as any);
        break;
      default:
        throw new Error(`不支持的数据库类型: ${config.type}`);
    }

    await adapter.connect();
    this.connections.set(name, adapter);
    this.connectionConfigs.set(name, config);

    return adapter;
  }

  /**
   * 关闭连接
   */
  async closeConnection(name: string): Promise<void> {
    const connection = this.connections.get(name);
    if (connection) {
      await connection.disconnect();
      this.connections.delete(name);
      this.connectionConfigs.delete(name);
    }
  }

  /**
   * 关闭所有连接
   */
  async closeAllConnections(): Promise<void> {
    const closePromises = Array.from(this.connections.entries()).map(
      async ([name, connection]) => {
        try {
          await connection.disconnect();
        } catch (error) {
          console.error(`关闭连接 ${name} 失败:`, error);
        }
      }
    );

    await Promise.all(closePromises);
    this.connections.clear();
    this.connectionConfigs.clear();
  }

  /**
   * 获取连接状态
   */
  async getConnectionStatus(name: string): Promise<string> {
    const connection = this.connections.get(name);
    if (!connection) {
      return 'NOT_FOUND';
    }
    return connection.getStatus();
  }

  /**
   * 获取所有连接状态
   */
  async getAllConnectionStatus(): Promise<Record<string, string>> {
    const statuses: Record<string, string> = {};
    
    for (const [name, connection] of this.connections.entries()) {
      statuses[name] = connection.getStatus();
    }

    return statuses;
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const healthChecks: Record<string, boolean> = {};
    
    const checkPromises = Array.from(this.connections.entries()).map(
      async ([name, connection]) => {
        try {
          const isHealthy = await connection.healthCheck();
          healthChecks[name] = isHealthy;
        } catch (error) {
          healthChecks[name] = false;
        }
      }
    );

    await Promise.all(checkPromises);
    return healthChecks;
  }

  /**
   * 获取连接列表
   */
  getConnectionNames(): string[] {
    return Array.from(this.connections.keys());
  }

  /**
   * 获取连接配置
   */
  getConnectionConfig(name: string): DatabaseConnectionEntity | undefined {
    return this.connectionConfigs.get(name);
  }

  /**
   * 获取所有连接配置
   */
  getAllConnectionConfigs(): Record<string, DatabaseConnectionEntity> {
    const configs: Record<string, DatabaseConnectionEntity> = {};
    
    for (const [name, config] of this.connectionConfigs.entries()) {
      configs[name] = config;
    }

    return configs;
  }

  /**
   * 检查连接是否存在
   */
  hasConnection(name: string): boolean {
    return this.connections.has(name);
  }

  /**
   * 获取连接数量
   */
  getConnectionCount(): number {
    return this.connections.size;
  }

  /**
   * 重新连接
   */
  async reconnect(name: string): Promise<void> {
    const connection = this.connections.get(name);
    const config = this.connectionConfigs.get(name);
    
    if (!connection || !config) {
      throw new Error(`连接 ${name} 不存在`);
    }

    try {
      await connection.disconnect();
    } catch (error) {
      // 忽略断开连接时的错误
    }

    await this.createConnection(name, config);
  }

  /**
   * 重新连接所有连接
   */
  async reconnectAll(): Promise<void> {
    const reconnectPromises = Array.from(this.connections.keys()).map(
      async (name) => {
        try {
          await this.reconnect(name);
        } catch (error) {
          console.error(`重新连接 ${name} 失败:`, error);
        }
      }
    );

    await Promise.all(reconnectPromises);
  }

  /**
   * 获取管理器统计信息
   */
  getManagerStats(): Record<string, any> {
    return {
      totalConnections: this.connections.size,
      connectionNames: this.getConnectionNames(),
      connectionTypes: Array.from(this.connectionConfigs.values()).map(
        config => config.type
      )
    };
  }
}
