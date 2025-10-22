/**
 * PostgreSQL数据库适配器
 *
 * @description 实现PostgreSQL数据库的连接和操作
 * @since 1.0.0
 */

import { MikroORM, PostgreSqlDriver } from '@mikro-orm/postgresql';
import type { IPostgreSQLAdapter, DatabaseOperationResult, DatabaseQueryOptions, DatabaseTransactionOptions } from '../../interfaces/database-adapter.interface.js';
import type { PostgreSQLConnectionEntity } from '../../entities/postgresql-connection.entity.js';

/**
 * PostgreSQL数据库适配器
 */
export class PostgreSQLAdapter implements IPostgreSQLAdapter {
  private orm?: MikroORM;
  private connection?: any;
  private isConnected = false;

  constructor(
    private readonly config: PostgreSQLConnectionEntity
  ) {}

  /**
   * 连接数据库
   */
  async connect(): Promise<void> {
    try {
      const mikroConfig = this.config.getMikroORMConfig();
      this.orm = await MikroORM.init({
        ...mikroConfig,
        driver: PostgreSqlDriver,
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
      throw new Error(`PostgreSQL连接失败: ${error instanceof Error ? error.message : '未知错误'}`);
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
      throw new Error(`PostgreSQL断开连接失败: ${error instanceof Error ? error.message : '未知错误'}`);
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
      
      await this.connection.execute('SELECT 1');
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

      const columns = Object.keys(data[0] as any);
      const values = data.map(row => 
        columns.map(col => (row as any)[col])
      );

      const placeholders = values.map(() => 
        `(${columns.map(() => '?').join(', ')})`
      ).join(', ');

      const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders}`;
      const flatValues = values.flat();

      const result = await this.connection.execute(sql, flatValues);
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
        const setClause = Object.keys(row as any)
          .map(key => `${key} = ?`)
          .join(', ');
        
        const whereClause = Object.keys(where)
          .map(key => `${key} = ?`)
          .join(' AND ');

        const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
        const params = [
          ...Object.values(row as any),
          ...Object.values(where)
        ];

        const result = await this.connection.execute(sql, params);
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

      const whereClause = Object.keys(where)
        .map(key => `${key} = ?`)
        .join(' AND ');

      const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
      const params = Object.values(where);

      const result = await this.connection.execute(sql, params);
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
      type: 'PostgreSQL',
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      schema: this.config.schema,
      ssl: this.config.ssl,
      sslMode: this.config.sslMode,
      poolSize: this.config.poolSize,
      maxConnections: this.config.maxConnections,
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

      const stats = await this.query(`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections
        FROM pg_stat_activity 
        WHERE datname = ?
      `, [this.config.database]);

      return {
        totalConnections: stats.data?.[0]?.total_connections || 0,
        activeConnections: stats.data?.[0]?.active_connections || 0,
        idleConnections: stats.data?.[0]?.idle_connections || 0,
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
   * 执行PostgreSQL特定查询
   */
  async executePostgreSQLQuery<T = any>(
    sql: string,
    params?: any[]
  ): Promise<DatabaseOperationResult<T[]>> {
    return this.query<T>(sql, params);
  }

  /**
   * 创建索引
   */
  async createIndex(
    table: string,
    columns: string[],
    options?: Record<string, any>
  ): Promise<DatabaseOperationResult<void>> {
    const startTime = Date.now();
    
    try {
      if (!this.connection) {
        throw new Error('数据库未连接');
      }

      const indexName = options?.name || `idx_${table}_${columns.join('_')}`;
      const unique = options?.unique ? 'UNIQUE ' : '';
      const columnsStr = columns.join(', ');
      
      const sql = `CREATE ${unique}INDEX ${indexName} ON ${table} (${columnsStr})`;
      await this.connection.execute(sql);

      const executionTime = Date.now() - startTime;

      return {
        success: true,
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
    table: string,
    indexName: string
  ): Promise<DatabaseOperationResult<void>> {
    const startTime = Date.now();
    
    try {
      if (!this.connection) {
        throw new Error('数据库未连接');
      }

      const sql = `DROP INDEX IF EXISTS ${indexName}`;
      await this.connection.execute(sql);

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
   * 获取表信息
   */
  async getTableInfo(table: string): Promise<DatabaseOperationResult<any>> {
    const startTime = Date.now();
    
    try {
      if (!this.connection) {
        throw new Error('数据库未连接');
      }

      const sql = `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = ? AND table_schema = ?
        ORDER BY ordinal_position
      `;
      
      const result = await this.connection.execute(sql, [table, this.config.schema]);
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
        error: error instanceof Error ? error.message : '获取表信息失败',
        executionTime
      };
    }
  }

  /**
   * 获取索引信息
   */
  async getIndexInfo(table: string): Promise<DatabaseOperationResult<any[]>> {
    const startTime = Date.now();
    
    try {
      if (!this.connection) {
        throw new Error('数据库未连接');
      }

      const sql = `
        SELECT 
          indexname,
          indexdef,
          indisunique,
          indisprimary
        FROM pg_indexes 
        WHERE tablename = ? AND schemaname = ?
      `;
      
      const result = await this.connection.execute(sql, [table, this.config.schema]);
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
