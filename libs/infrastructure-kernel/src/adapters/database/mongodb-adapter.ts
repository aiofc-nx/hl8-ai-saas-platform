/**
 * MongoDB数据库适配器
 *
 * @description 实现MongoDB数据库的连接和操作
 * @since 1.0.0
 */

import { MikroORM, MongoDriver } from '@mikro-orm/mongodb';
import type { IMongoDBAdapter, DatabaseOperationResult, DatabaseQueryOptions, DatabaseTransactionOptions } from '../../interfaces/database-adapter.interface.js';
import type { MongoDBConnectionEntity } from '../../entities/mongodb-connection.entity.js';

/**
 * MongoDB数据库适配器
 */
export class MongoDBAdapter implements IMongoDBAdapter {
  private orm?: MikroORM;
  private connection?: any;
  private isConnected = false;

  constructor(
    private readonly config: MongoDBConnectionEntity
  ) {}

  /**
   * 连接数据库
   */
  async connect(): Promise<void> {
    try {
      const mikroConfig = this.config.getMikroORMConfig();
      this.orm = await MikroORM.init({
        ...mikroConfig,
        driver: MongoDriver,
        entities: [],
        migrations: {
          path: './migrations'
          // pattern: /^[\w-]+\d+\.(ts|js)$/ // 注释掉不支持的属性
        }
      });

      this.connection = this.orm.em.getConnection();
      this.isConnected = true;
    } catch (error) {
      this.isConnected = false;
      throw new Error(`MongoDB连接失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 断开数据库连接
   */
  async disconnect(): Promise<void> {
    try {
      if (this.orm) {
        await this.orm.close();
        this.orm = undefined;
        this.connection = undefined;
        this.isConnected = false;
      }
    } catch (error) {
      throw new Error(`MongoDB断开连接失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取仓储实例
   */
  getRepository<T>(entity: any): any {
    if (!this.orm) {
      throw new Error('数据库未连接');
    }
    return this.orm.em.getRepository(entity);
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.connection) {
        return false;
      }
      
      await this.connection.execute('ping');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取连接状态
   */
  getStatus(): 'ACTIVE' | 'INACTIVE' | 'ERROR' {
    return this.isConnected ? 'ACTIVE' : 'INACTIVE';
  }

  /**
   * 执行查询
   */
  async query<T = any>(
    sql: string,
    params?: any[]
  ): Promise<DatabaseOperationResult<T[]>> {
    const startTime = Date.now();
    
    try {
      if (!this.connection) {
        throw new Error('数据库未连接');
      }

      // MongoDB使用不同的查询语法
      const result = await this.connection.execute(sql, params);
      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: result,
        executionTime
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : '查询执行失败',
        executionTime
      };
    }
  }

  /**
   * 执行事务
   */
  async transaction<T>(
    callback: (trx: any) => Promise<T>,
    options?: DatabaseTransactionOptions
  ): Promise<DatabaseOperationResult<T>> {
    const startTime = Date.now();
    
    try {
      if (!this.orm) {
        throw new Error('数据库未连接');
      }

      const result = await this.orm.em.transactional(async (em) => {
        return await callback(em);
      });

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: result,
        executionTime
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : '事务执行失败',
        executionTime
      };
    }
  }

  /**
   * 批量插入
   */
  async batchInsert<T>(
    table: string,
    data: T[],
    options?: DatabaseQueryOptions
  ): Promise<DatabaseOperationResult<number>> {
    const startTime = Date.now();
    
    try {
      if (!this.connection) {
        throw new Error('数据库未连接');
      }

      if (data.length === 0) {
        return {
          success: true,
          data: 0,
          executionTime: Date.now() - startTime
        };
      }

      const result = await this.connection.execute(
        `INSERT INTO ${table} VALUES ?`,
        [data]
      );
      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: result.affectedRows || data.length,
        executionTime
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : '批量插入失败',
        executionTime
      };
    }
  }

  /**
   * 批量更新
   */
  async batchUpdate<T>(
    table: string,
    data: T[],
    where: Record<string, any>
  ): Promise<DatabaseOperationResult<number>> {
    const startTime = Date.now();
    
    try {
      if (!this.connection) {
        throw new Error('数据库未连接');
      }

      if (data.length === 0) {
        return {
          success: true,
          data: 0,
          executionTime: Date.now() - startTime
        };
      }

      let totalAffected = 0;
      for (const row of data) {
        const result = await this.connection.execute(
          `UPDATE ${table} SET ? WHERE ?`,
          [row, where]
        );
        totalAffected += result.affectedRows || 0;
      }

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: totalAffected,
        executionTime
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : '批量更新失败',
        executionTime
      };
    }
  }

  /**
   * 批量删除
   */
  async batchDelete(
    table: string,
    where: Record<string, any>
  ): Promise<DatabaseOperationResult<number>> {
    const startTime = Date.now();
    
    try {
      if (!this.connection) {
        throw new Error('数据库未连接');
      }

      const result = await this.connection.execute(
        `DELETE FROM ${table} WHERE ?`,
        [where]
      );
      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: result.affectedRows || 0,
        executionTime
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : '批量删除失败',
        executionTime
      };
    }
  }

  /**
   * 获取连接信息
   */
  async getConnectionInfo(): Promise<Record<string, any>> {
    return {
      type: 'MongoDB',
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      replicaSet: this.config.replicaSet,
      authSource: this.config.authSource,
      ssl: this.config.ssl,
      maxPoolSize: this.config.maxPoolSize,
      minPoolSize: this.config.minPoolSize,
      isConnected: this.isConnected,
      status: this.getStatus()
    };
  }

  /**
   * 获取性能统计
   */
  async getPerformanceStats(): Promise<Record<string, any>> {
    try {
      if (!this.connection) {
        return {};
      }

      const stats = await this.connection.execute('db.serverStatus()');
      return {
        connections: stats.connections || {},
        network: stats.network || {},
        opcounters: stats.opcounters || {},
        isConnected: this.isConnected
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : '获取统计信息失败',
        isConnected: this.isConnected
      };
    }
  }

  /**
   * 执行MongoDB特定查询
   */
  async executeMongoDBQuery<T = any>(
    collection: string,
    query: any,
    options?: any
  ): Promise<DatabaseOperationResult<T[]>> {
    const startTime = Date.now();
    
    try {
      if (!this.connection) {
        throw new Error('数据库未连接');
      }

      const result = await this.connection.execute(
        `SELECT * FROM ${collection} WHERE ?`,
        [query]
      );
      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: result,
        executionTime
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'MongoDB查询失败',
        executionTime
      };
    }
  }

  /**
   * 创建集合
   */
  async createCollection(
    name: string,
    options?: any
  ): Promise<DatabaseOperationResult<void>> {
    const startTime = Date.now();
    
    try {
      if (!this.connection) {
        throw new Error('数据库未连接');
      }

      await this.connection.execute(`CREATE COLLECTION ${name}`);
      const executionTime = Date.now() - startTime;

      return {
        success: true,
        executionTime
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建集合失败',
        executionTime
      };
    }
  }

  /**
   * 删除集合
   */
  async dropCollection(
    name: string
  ): Promise<DatabaseOperationResult<void>> {
    const startTime = Date.now();
    
    try {
      if (!this.connection) {
        throw new Error('数据库未连接');
      }

      await this.connection.execute(`DROP COLLECTION ${name}`);
      const executionTime = Date.now() - startTime;

      return {
        success: true,
        executionTime
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除集合失败',
        executionTime
      };
    }
  }

  /**
   * 创建索引
   */
  async createIndex(
    collection: string,
    keys: Record<string, any>,
    options?: any
  ): Promise<DatabaseOperationResult<string>> {
    const startTime = Date.now();
    
    try {
      if (!this.connection) {
        throw new Error('数据库未连接');
      }

      const indexName = options?.name || `idx_${collection}_${Object.keys(keys).join('_')}`;
      const unique = options?.unique ? 'UNIQUE ' : '';
      const keysStr = Object.entries(keys)
        .map(([key, value]) => `${key}:${value}`)
        .join(', ');
      
      await this.connection.execute(
        `CREATE ${unique}INDEX ${indexName} ON ${collection} (${keysStr})`
      );

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: indexName,
        executionTime
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建索引失败',
        executionTime
      };
    }
  }

  /**
   * 删除索引
   */
  async dropIndex(
    collection: string,
    indexName: string
  ): Promise<DatabaseOperationResult<void>> {
    const startTime = Date.now();
    
    try {
      if (!this.connection) {
        throw new Error('数据库未连接');
      }

      await this.connection.execute(
        `DROP INDEX ${indexName} ON ${collection}`
      );

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        executionTime
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除索引失败',
        executionTime
      };
    }
  }

  /**
   * 获取集合信息
   */
  async getCollectionInfo(collection: string): Promise<DatabaseOperationResult<any>> {
    const startTime = Date.now();
    
    try {
      if (!this.connection) {
        throw new Error('数据库未连接');
      }

      const result = await this.connection.execute(
        `DESCRIBE ${collection}`
      );
      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: result,
        executionTime
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取集合信息失败',
        executionTime
      };
    }
  }

  /**
   * 获取索引信息
   */
  async getIndexInfo(collection: string): Promise<DatabaseOperationResult<any[]>> {
    const startTime = Date.now();
    
    try {
      if (!this.connection) {
        throw new Error('数据库未连接');
      }

      const result = await this.connection.execute(
        `SHOW INDEX FROM ${collection}`
      );
      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: result,
        executionTime
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取索引信息失败',
        executionTime
      };
    }
  }
}
