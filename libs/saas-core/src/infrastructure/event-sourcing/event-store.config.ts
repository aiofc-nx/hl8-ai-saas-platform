/**
 * 事件溯源基础设施配置
 * 基于@hl8/domain-kernel事件基础设施
 */

/**
 * 事件存储配置
 */
export interface EventStoreConfig {
  provider: "postgresql" | "mongodb";
  connectionString: string;
  database: string;
  table?: string; // PostgreSQL表名
  collection?: string; // MongoDB集合名
  batchSize: number;
  retentionDays: number;
}

/**
 * 事件溯源配置
 */
export const eventStoreConfig: EventStoreConfig = {
  provider:
    (process.env.EVENT_STORE_PROVIDER as "postgresql" | "mongodb") ||
    "postgresql",
  connectionString: process.env.EVENT_STORE_CONNECTION_STRING || "",
  database: process.env.EVENT_STORE_DATABASE || "saas_core_events",
  table: process.env.EVENT_STORE_TABLE || "domain_events",
  collection: process.env.EVENT_STORE_COLLECTION || "domain_events",
  batchSize: parseInt(process.env.EVENT_STORE_BATCH_SIZE || "100"),
  retentionDays: parseInt(process.env.EVENT_STORE_RETENTION_DAYS || "365"),
};

/**
 * 事件处理配置
 */
export interface EventProcessingConfig {
  maxRetries: number;
  retryDelay: number;
  deadLetterQueue: boolean;
  eventOrdering: boolean;
  snapshotFrequency: number;
}

export const eventProcessingConfig: EventProcessingConfig = {
  maxRetries: parseInt(process.env.EVENT_MAX_RETRIES || "3"),
  retryDelay: parseInt(process.env.EVENT_RETRY_DELAY || "1000"),
  deadLetterQueue: process.env.EVENT_DEAD_LETTER_QUEUE === "true",
  eventOrdering: process.env.EVENT_ORDERING === "true",
  snapshotFrequency: parseInt(process.env.EVENT_SNAPSHOT_FREQUENCY || "100"),
};
