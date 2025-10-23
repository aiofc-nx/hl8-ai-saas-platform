/**
 * PostgreSQL连接实体
 *
 * @description PostgreSQL数据库连接实体，包含PostgreSQL特定配置
 * @since 1.0.0
 */

import { Entity, Property } from "@mikro-orm/core";
import { DatabaseConnectionEntity } from "./database-connection.entity.js";

/**
 * PostgreSQL连接实体
 */
@Entity({ tableName: "postgresql_connections" })
export class PostgreSQLConnectionEntity extends DatabaseConnectionEntity {
  /** 数据库模式 */
  @Property({ type: "varchar", length: 255, default: "public" })
  schema!: string;

  /** SSL模式 */
  @Property({ type: "varchar", length: 50, default: "disable" })
  sslMode!: "disable" | "require" | "verify-ca" | "verify-full";

  /** 最大连接数 */
  @Property({ type: "int", default: 100 })
  maxConnections!: number;

  /** 空闲超时时间(秒) */
  @Property({ type: "int", default: 300 })
  idleTimeout!: number;

  /** 查询超时时间(秒) */
  @Property({ type: "int", default: 30 })
  queryTimeout!: number;

  /**
   * 构造函数
   * @param data 连接数据
   */
  constructor(data?: Partial<PostgreSQLConnectionEntity>) {
    super(data);
    if (data) {
      Object.assign(this, data);
    }
    this.type = "POSTGRESQL";
  }

  /**
   * 验证PostgreSQL特定配置
   * @returns 验证结果
   */
  validatePostgreSQLConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.schema || this.schema.trim().length === 0) {
      errors.push("数据库模式不能为空");
    }

    if (this.maxConnections <= 0) {
      errors.push("最大连接数必须大于0");
    }

    if (this.idleTimeout < 0) {
      errors.push("空闲超时时间不能为负数");
    }

    if (this.queryTimeout <= 0) {
      errors.push("查询超时时间必须大于0");
    }

    const validSslModes = ["disable", "require", "verify-ca", "verify-full"];
    if (!validSslModes.includes(this.sslMode)) {
      errors.push("SSL模式必须是: disable, require, verify-ca, verify-full");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 获取PostgreSQL连接配置
   * @returns PostgreSQL连接配置
   */
  getPostgreSQLConfig(): Record<string, unknown> {
    return {
      ...this.getConnectionConfig(),
      schema: this.schema,
      sslMode: this.sslMode,
      maxConnections: this.maxConnections,
      idleTimeout: this.idleTimeout,
      queryTimeout: this.queryTimeout,
    };
  }

  /**
   * 获取PostgreSQL连接字符串
   * @returns PostgreSQL连接字符串
   */
  getPostgreSQLConnectionString(): string {
    const sslParam = this.ssl ? `?sslmode=${this.sslMode}` : "";
    return `postgresql://${this.username}:${this.password}@${this.host}:${this.port}/${this.database}${sslParam}`;
  }

  /**
   * 获取MikroORM配置
   * @returns MikroORM配置对象
   */
  getMikroORMConfig(): Record<string, unknown> {
    return {
      type: "postgresql",
      host: this.host,
      port: this.port,
      dbName: this.database,
      user: this.username,
      password: this.password,
      schema: this.schema,
      ssl: this.ssl,
      pool: {
        min: 1,
        max: this.maxConnections,
        idleTimeoutMillis: this.idleTimeout * 1000,
      },
      options: {
        statement_timeout: this.queryTimeout * 1000,
      },
    };
  }
}
