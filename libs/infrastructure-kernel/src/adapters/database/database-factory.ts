/**
 * 数据库工厂
 *
 * @description 创建数据库适配器和连接管理器
 * @since 1.0.0
 */

import type {
  IDatabaseFactory,
  IPostgreSQLAdapter,
  IMongoDBAdapter,
  IDatabaseConnectionManager,
} from "../../interfaces/database-adapter.interface.js";
import type { PostgreSQLConnectionEntity } from "../../entities/postgresql-connection.entity.js";
import type { MongoDBConnectionEntity } from "../../entities/mongodb-connection.entity.js";
import { PostgreSQLAdapter } from "./postgresql-adapter.js";
import { MongoDBAdapter } from "./mongodb-adapter.js";
import { DatabaseConnectionManager } from "./connection-manager.js";

/**
 * 数据库工厂
 */
export class DatabaseFactory implements IDatabaseFactory {
  /**
   * 创建PostgreSQL适配器
   */
  async createPostgreSQLAdapter(
    config: PostgreSQLConnectionEntity,
  ): Promise<IPostgreSQLAdapter> {
    const adapter = new PostgreSQLAdapter(config);
    await adapter.connect();
    return adapter;
  }

  /**
   * 创建MongoDB适配器
   */
  async createMongoDBAdapter(
    config: MongoDBConnectionEntity,
  ): Promise<IMongoDBAdapter> {
    const adapter = new MongoDBAdapter(config);
    await adapter.connect();
    return adapter;
  }

  /**
   * 创建连接管理器
   */
  createConnectionManager(): IDatabaseConnectionManager {
    return new DatabaseConnectionManager();
  }

  /**
   * 获取支持的数据库类型
   */
  getSupportedTypes(): string[] {
    return ["POSTGRESQL", "MONGODB"];
  }

  /**
   * 创建数据库适配器（通用方法）
   */
  async createAdapter(
    type: string,
    config: Record<string, unknown>,
  ): Promise<IPostgreSQLAdapter | IMongoDBAdapter> {
    switch (type.toUpperCase()) {
      case "POSTGRESQL":
        return this.createPostgreSQLAdapter(
          config as unknown as PostgreSQLConnectionEntity,
        );
      case "MONGODB":
        return this.createMongoDBAdapter(
          config as unknown as MongoDBConnectionEntity,
        );
      default:
        throw new Error(`不支持的数据库类型: ${type}`);
    }
  }

  /**
   * 验证配置
   */
  validateConfig(
    type: string,
    config: Record<string, unknown>,
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!type) {
      errors.push("数据库类型不能为空");
    }

    if (!config) {
      errors.push("配置不能为空");
      return { isValid: false, errors };
    }

    // 通用配置验证
    if (!config.host) {
      errors.push("主机地址不能为空");
    }

    const port = config.port as number;
    if (!port || port <= 0 || port > 65535) {
      errors.push("端口号必须在1-65535范围内");
    }

    if (!config.database) {
      errors.push("数据库名称不能为空");
    }

    if (!config.username) {
      errors.push("用户名不能为空");
    }

    if (!config.password) {
      errors.push("密码不能为空");
    }

    // 类型特定验证
    switch (type.toUpperCase()) {
      case "POSTGRESQL": {
        if (!config.schema) {
          errors.push("PostgreSQL模式不能为空");
        }
        const maxConnections = config.maxConnections as number;
        if (maxConnections && maxConnections <= 0) {
          errors.push("PostgreSQL最大连接数必须大于0");
        }
        break;
      }
      case "MONGODB": {
        if (!config.authSource) {
          errors.push("MongoDB认证源不能为空");
        }
        const maxPoolSize = config.maxPoolSize as number;
        if (maxPoolSize && maxPoolSize <= 0) {
          errors.push("MongoDB最大连接池大小必须大于0");
        }
        const minPoolSize = config.minPoolSize as number;
        if (minPoolSize && minPoolSize < 0) {
          errors.push("MongoDB最小连接池大小不能为负数");
        }
        break;
      }
      default:
        errors.push(`不支持的数据库类型: ${type}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 创建默认配置
   */
  createDefaultConfig(type: string): Record<string, unknown> {
    const baseConfig = {
      host: "localhost",
      port: type.toUpperCase() === "POSTGRESQL" ? 5432 : 27017,
      database: "hl8_saas",
      username: "admin",
      password: "password",
      ssl: false,
      poolSize: 10,
      timeout: 30,
    };

    switch (type.toUpperCase()) {
      case "POSTGRESQL":
        return {
          ...baseConfig,
          type: "POSTGRESQL",
          schema: "public",
          sslMode: "disable",
          maxConnections: 100,
          idleTimeout: 300,
          queryTimeout: 30,
        };
      case "MONGODB":
        return {
          ...baseConfig,
          type: "MONGODB",
          authSource: "admin",
          maxPoolSize: 50,
          minPoolSize: 5,
          maxIdleTimeMS: 30000,
          serverSelectionTimeoutMS: 30000,
        };
      default:
        throw new Error(`不支持的数据库类型: ${type}`);
    }
  }

  /**
   * 获取数据库信息
   */
  getDatabaseInfo(type: string): Record<string, unknown> {
    switch (type.toUpperCase()) {
      case "POSTGRESQL":
        return {
          name: "PostgreSQL",
          version: "15+",
          features: ["ACID事务", "JSON支持", "全文搜索", "复制", "分区"],
          defaultPort: 5432,
          defaultSchema: "public",
        };
      case "MONGODB":
        return {
          name: "MongoDB",
          version: "6.0+",
          features: ["文档存储", "副本集", "分片", "聚合管道", "GridFS"],
          defaultPort: 27017,
          defaultAuthSource: "admin",
        };
      default:
        return {
          name: "Unknown",
          version: "Unknown",
          features: [],
          defaultPort: 0,
        };
    }
  }
}
