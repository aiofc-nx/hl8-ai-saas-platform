/**
 * MongoDB连接实体
 *
 * @description MongoDB数据库连接实体，包含MongoDB特定配置
 * @since 1.0.0
 */

import { Entity, Property } from "@mikro-orm/core";
import { DatabaseConnectionEntity } from "./database-connection.entity.js";

/**
 * MongoDB连接实体
 */
@Entity({ tableName: "mongodb_connections" })
export class MongoDBConnectionEntity extends DatabaseConnectionEntity {
  /** 副本集名称 */
  @Property({ type: "varchar", length: 255, nullable: true })
  replicaSet?: string;

  /** 认证源 */
  @Property({ type: "varchar", length: 255, default: "admin" })
  authSource!: string;

  /** 最大连接池大小 */
  @Property({ type: "int", default: 50 })
  maxPoolSize!: number;

  /** 最小连接池大小 */
  @Property({ type: "int", default: 5 })
  minPoolSize!: number;

  /** 最大空闲时间(毫秒) */
  @Property({ type: "int", default: 30000 })
  maxIdleTimeMS!: number;

  /** 服务器选择超时时间(毫秒) */
  @Property({ type: "int", default: 30000 })
  serverSelectionTimeoutMS!: number;

  /**
   * 构造函数
   * @param data 连接数据
   */
  constructor(data?: Partial<MongoDBConnectionEntity>) {
    super(data);
    if (data) {
      Object.assign(this, data);
    }
    this.type = "MONGODB";
  }

  /**
   * 验证MongoDB特定配置
   * @returns 验证结果
   */
  validateMongoDBConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.authSource || this.authSource.trim().length === 0) {
      errors.push("认证源不能为空");
    }

    if (this.maxPoolSize <= 0) {
      errors.push("最大连接池大小必须大于0");
    }

    if (this.minPoolSize < 0) {
      errors.push("最小连接池大小不能为负数");
    }

    if (this.minPoolSize > this.maxPoolSize) {
      errors.push("最小连接池大小不能大于最大连接池大小");
    }

    if (this.maxIdleTimeMS < 0) {
      errors.push("最大空闲时间不能为负数");
    }

    if (this.serverSelectionTimeoutMS <= 0) {
      errors.push("服务器选择超时时间必须大于0");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 获取MongoDB连接配置
   * @returns MongoDB连接配置
   */
  getMongoDBConfig(): Record<string, unknown> {
    return {
      ...this.getConnectionConfig(),
      replicaSet: this.replicaSet,
      authSource: this.authSource,
      maxPoolSize: this.maxPoolSize,
      minPoolSize: this.minPoolSize,
      maxIdleTimeMS: this.maxIdleTimeMS,
      serverSelectionTimeoutMS: this.serverSelectionTimeoutMS,
    };
  }

  /**
   * 获取MongoDB连接字符串
   * @returns MongoDB连接字符串
   */
  getMongoDBConnectionString(): string {
    let connectionString = `mongodb://${this.username}:${this.password}@${this.host}:${this.port}/${this.database}`;

    const params = new URLSearchParams();
    if (this.authSource) {
      params.append("authSource", this.authSource);
    }
    if (this.replicaSet) {
      params.append("replicaSet", this.replicaSet);
    }
    if (this.ssl) {
      params.append("ssl", "true");
    }

    const queryString = params.toString();
    if (queryString) {
      connectionString += `?${queryString}`;
    }

    return connectionString;
  }

  /**
   * 获取MikroORM配置
   * @returns MikroORM配置对象
   */
  getMikroORMConfig(): Record<string, unknown> {
    return {
      type: "mongo",
      clientUrl: this.getMongoDBConnectionString(),
      dbName: this.database,
      pool: {
        min: this.minPoolSize,
        max: this.maxPoolSize,
        idleTimeoutMillis: this.maxIdleTimeMS,
      },
      options: {
        serverSelectionTimeoutMS: this.serverSelectionTimeoutMS,
        maxIdleTimeMS: this.maxIdleTimeMS,
      },
    };
  }

  /**
   * 检查是否为副本集连接
   * @returns 是否为副本集
   */
  isReplicaSet(): boolean {
    return !!this.replicaSet && this.replicaSet.trim().length > 0;
  }

  /**
   * 获取副本集配置
   * @returns 副本集配置
   */
  getReplicaSetConfig(): Record<string, unknown> | null {
    if (!this.isReplicaSet()) {
      return null;
    }

    return {
      replicaSet: this.replicaSet,
      readPreference: "primary",
      readConcern: { level: "majority" },
      writeConcern: { w: "majority" },
    };
  }
}
