/**
 * 数据库连接配置
 * 支持PostgreSQL(默认)和MongoDB(可选)
 */

export interface DatabaseConfig {
  postgresql: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl?: boolean;
    pool?: {
      min: number;
      max: number;
    };
  };
  mongodb?: {
    uri: string;
    database: string;
    options?: {
      useNewUrlParser: boolean;
      useUnifiedTopology: boolean;
    };
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
}

export const databaseConfig: DatabaseConfig = {
  postgresql: {
    host: process.env.POSTGRES_HOST || "localhost",
    port: parseInt(process.env.POSTGRES_PORT || "5432"),
    database: process.env.POSTGRES_DB || "saas_core",
    username: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "password",
    ssl: process.env.POSTGRES_SSL === "true",
    pool: {
      min: 2,
      max: 10,
    },
  },
  mongodb: process.env.MONGODB_URI
    ? {
        uri: process.env.MONGODB_URI,
        database: process.env.MONGODB_DB || "saas_core",
        options: {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        },
      }
    : undefined,
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || "0"),
  },
};
