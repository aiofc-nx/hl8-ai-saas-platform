import { MikroOrmModuleOptions } from "@mikro-orm/core";
import { Tenant } from "../../domain/entities/tenant.entity.js";
import { Organization } from "../../domain/entities/organization.entity.js";
import { User } from "../../domain/entities/user.entity.js";
import { Role } from "../../domain/entities/role.entity.js";

/**
 * MikroORM配置
 *
 * @description 配置MikroORM数据库连接和实体映射
 * @since 1.0.0
 */
export const mikroOrmConfig: MikroOrmModuleOptions = {
  // 数据库类型
  type: "postgresql",

  // 数据库连接配置
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  dbName: process.env.DB_NAME || "saas_core",

  // 实体配置
  entities: [Tenant, Organization, User, Role],

  // 迁移配置
  migrations: {
    path: "./src/infrastructure/database/migrations",
    pattern: /^[\w-]+\d+\.(ts|js)$/,
    transactional: true,
    disableForeignKeys: false,
    allOrNothing: true,
    dropTables: false,
    safe: false,
    snapshot: true,
    emit: "ts",
  },

  // 种子配置
  seeder: {
    path: "./src/infrastructure/database/seeders",
    defaultSeeder: "DatabaseSeeder",
    emit: "ts",
    fileName: (className: string) => className,
  },

  // 开发环境配置
  debug: process.env.NODE_ENV === "development",

  // 日志配置
  logger: (message: string) => {
    if (process.env.NODE_ENV === "development") {
      console.log(message);
    }
  },

  // 性能优化配置
  cache: {
    enabled: true,
    pretty: process.env.NODE_ENV === "development",
    adapter: "redis",
    options: {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
    },
  },

  // 查询优化
  resultCache: {
    expiration: 1000 * 60 * 5, // 5分钟缓存
    adapter: "redis",
    options: {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
    },
  },

  // 连接池配置
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,
  },

  // 多租户配置
  filters: {
    tenant: {
      cond: (args: Record<string, unknown>) => ({ tenantId: args.tenantId }),
      entity: ["Tenant", "Organization", "User", "Role"],
      default: true,
    },
    organization: {
      cond: (args: Record<string, unknown>) => ({
        organizationId: args.organizationId,
      }),
      entity: ["Organization", "User", "Role"],
      default: true,
    },
    department: {
      cond: (args: Record<string, unknown>) => ({
        departmentId: args.departmentId,
      }),
      entity: ["User", "Role"],
      default: true,
    },
  },

  // 扩展配置
  extensions: [
    // 可以在这里添加自定义扩展
  ],

  // 类型安全配置
  strict: true,
  validate: true,
  validateRequired: true,

  // 时区配置
  timezone: "UTC",

  // 字符集配置
  charset: "utf8mb4",

  // 索引配置
  indexes: [
    {
      name: "tenant_tenant_id_idx",
      properties: ["tenantId"],
    },
    {
      name: "organization_tenant_id_idx",
      properties: ["tenantId"],
    },
    {
      name: "user_tenant_id_idx",
      properties: ["tenantId"],
    },
    {
      name: "role_tenant_id_idx",
      properties: ["tenantId"],
    },
  ],

  // 约束配置
  constraints: {
    foreignKeys: true,
    checkConstraints: true,
  },

  // 序列化配置
  serialization: {
    includePrimaryKeys: true,
    includeVersion: true,
    includeMetadata: true,
  },

  // 元数据配置
  metadataProvider: "ReflectMetadataProvider",

  // 实体发现配置
  discovery: {
    warnWhenNoEntities: true,
    requireEntitiesArray: true,
    alwaysAnalyseProperties: false,
  },

  // 性能监控配置
  performance: {
    enabled: process.env.NODE_ENV === "development",
    threshold: 1000, // 1秒阈值
  },
};
