/**
 * 数据库连接实体
 *
 * @description 数据库连接的基础实体类
 * @since 1.0.0
 */

import { Entity, PrimaryKey, Property, Enum } from "@mikro-orm/core";
import type {
  DatabaseType,
  ConnectionStatus,
} from "../types/database.types.js";

/**
 * 数据库连接实体
 */
@Entity({ tableName: "database_connections" })
export class DatabaseConnectionEntity {
  /** 连接ID */
  @PrimaryKey({ type: "uuid" })
  id!: string;

  /** 连接名称 */
  @Property({ type: "varchar", length: 255 })
  name!: string;

  /** 数据库类型 */
  @Enum(() => String)
  type!: DatabaseType;

  /** 主机地址 */
  @Property({ type: "varchar", length: 255 })
  host!: string;

  /** 端口号 */
  @Property({ type: "int" })
  port!: number;

  /** 数据库名称 */
  @Property({ type: "varchar", length: 255 })
  database!: string;

  /** 用户名 */
  @Property({ type: "varchar", length: 255 })
  username!: string;

  /** 密码 */
  @Property({ type: "varchar", length: 255 })
  password!: string;

  /** 是否启用SSL */
  @Property({ type: "boolean", default: false })
  ssl!: boolean;

  /** 连接池大小 */
  @Property({ type: "int", default: 10 })
  poolSize!: number;

  /** 连接超时时间(秒) */
  @Property({ type: "int", default: 30 })
  timeout!: number;

  /** 连接状态 */
  @Enum(() => String)
  status!: ConnectionStatus;

  /** 创建时间 */
  @Property({ type: "datetime", defaultRaw: "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  /** 更新时间 */
  @Property({
    type: "datetime",
    defaultRaw: "CURRENT_TIMESTAMP",
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  /**
   * 构造函数
   * @param data 连接数据
   */
  constructor(data?: Partial<DatabaseConnectionEntity>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  /**
   * 更新连接状态
   * @param status 新状态
   */
  updateStatus(status: ConnectionStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  /**
   * 验证连接配置
   * @returns 验证结果
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push("连接名称不能为空");
    }

    if (!this.host || this.host.trim().length === 0) {
      errors.push("主机地址不能为空");
    }

    if (!this.port || this.port <= 0 || this.port > 65535) {
      errors.push("端口号必须在1-65535范围内");
    }

    if (!this.database || this.database.trim().length === 0) {
      errors.push("数据库名称不能为空");
    }

    if (!this.username || this.username.trim().length === 0) {
      errors.push("用户名不能为空");
    }

    if (!this.password || this.password.trim().length === 0) {
      errors.push("密码不能为空");
    }

    if (this.poolSize <= 0) {
      errors.push("连接池大小必须大于0");
    }

    if (this.timeout <= 0) {
      errors.push("超时时间必须大于0");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 获取连接字符串
   * @returns 连接字符串
   */
  getConnectionString(): string {
    const protocol = this.type === "POSTGRESQL" ? "postgresql" : "mongodb";
    const sslParam = this.ssl ? "?ssl=true" : "";
    return `${protocol}://${this.username}:${this.password}@${this.host}:${this.port}/${this.database}${sslParam}`;
  }

  /**
   * 获取连接配置对象
   * @returns 连接配置
   */
  getConnectionConfig(): Record<string, any> {
    return {
      host: this.host,
      port: this.port,
      database: this.database,
      username: this.username,
      password: this.password,
      ssl: this.ssl,
      poolSize: this.poolSize,
      timeout: this.timeout,
    };
  }
}
