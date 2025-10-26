// libs/saas-core/src/infrastructure/messaging/kafka.config.ts
import { registerAs } from "@nestjs/config";

/**
 * Kafka 配置
 *
 * 基于环境变量的 Kafka 配置，支持开发、测试和生产环境
 * 提供完整的 Kafka 客户端配置选项
 */
export default registerAs("kafka", () => ({
  // 基础配置
  clientId: process.env.KAFKA_CLIENT_ID || "saas-core",
  brokers: process.env.KAFKA_BROKERS
    ? process.env.KAFKA_BROKERS.split(",")
    : ["localhost:9092"],

  // 连接配置
  connectionTimeout: parseInt(
    process.env.KAFKA_CONNECTION_TIMEOUT || "3000",
    10,
  ),
  requestTimeout: parseInt(process.env.KAFKA_REQUEST_TIMEOUT || "30000", 10),
  retry: {
    retries: parseInt(process.env.KAFKA_RETRY_RETRIES || "5", 10),
    initialRetryTime: parseInt(
      process.env.KAFKA_RETRY_INITIAL_TIME || "100",
      10,
    ),
    maxRetryTime: parseInt(process.env.KAFKA_RETRY_MAX_TIME || "30000", 10),
  },

  // 生产者配置
  producer: {
    maxInFlightRequests: parseInt(
      process.env.KAFKA_PRODUCER_MAX_IN_FLIGHT || "1",
      10,
    ),
    idempotent: process.env.KAFKA_PRODUCER_IDEMPOTENT === "true",
    compression: process.env.KAFKA_PRODUCER_COMPRESSION || "gzip",
    acks: process.env.KAFKA_PRODUCER_ACKS || "all",
    timeout: parseInt(process.env.KAFKA_PRODUCER_TIMEOUT || "30000", 10),
  },

  // 消费者配置
  consumer: {
    groupId: process.env.KAFKA_CONSUMER_GROUP_ID || "saas-core-group",
    sessionTimeout: parseInt(
      process.env.KAFKA_CONSUMER_SESSION_TIMEOUT || "30000",
      10,
    ),
    heartbeatInterval: parseInt(
      process.env.KAFKA_CONSUMER_HEARTBEAT_INTERVAL || "3000",
      10,
    ),
    maxBytesPerPartition: parseInt(
      process.env.KAFKA_CONSUMER_MAX_BYTES_PER_PARTITION || "1048576",
      10,
    ),
    maxBytes: parseInt(process.env.KAFKA_CONSUMER_MAX_BYTES || "10485760", 10),
    maxWaitTimeInMs: parseInt(
      process.env.KAFKA_CONSUMER_MAX_WAIT_TIME || "5000",
      10,
    ),
    allowAutoTopicCreation:
      process.env.KAFKA_CONSUMER_ALLOW_AUTO_TOPIC_CREATION === "true",
  },

  // 主题配置
  topics: {
    commands: {
      prefix: process.env.KAFKA_TOPICS_COMMANDS_PREFIX || "commands",
      partitions: parseInt(
        process.env.KAFKA_TOPICS_COMMANDS_PARTITIONS || "3",
        10,
      ),
      replicationFactor: parseInt(
        process.env.KAFKA_TOPICS_COMMANDS_REPLICATION_FACTOR || "1",
        10,
      ),
    },
    queries: {
      prefix: process.env.KAFKA_TOPICS_QUERIES_PREFIX || "queries",
      partitions: parseInt(
        process.env.KAFKA_TOPICS_QUERIES_PARTITIONS || "3",
        10,
      ),
      replicationFactor: parseInt(
        process.env.KAFKA_TOPICS_QUERIES_REPLICATION_FACTOR || "1",
        10,
      ),
    },
    events: {
      prefix: process.env.KAFKA_TOPICS_EVENTS_PREFIX || "events",
      partitions: parseInt(
        process.env.KAFKA_TOPICS_EVENTS_PARTITIONS || "3",
        10,
      ),
      replicationFactor: parseInt(
        process.env.KAFKA_TOPICS_EVENTS_REPLICATION_FACTOR || "1",
        10,
      ),
    },
  },

  // 安全配置
  sasl: {
    mechanism: process.env.KAFKA_SASL_MECHANISM || "plain",
    username: process.env.KAFKA_SASL_USERNAME || "",
    password: process.env.KAFKA_SASL_PASSWORD || "",
  },

  // SSL 配置
  ssl: {
    enabled: process.env.KAFKA_SSL_ENABLED === "true",
    rejectUnauthorized: process.env.KAFKA_SSL_REJECT_UNAUTHORIZED !== "false",
    ca: process.env.KAFKA_SSL_CA || "",
    cert: process.env.KAFKA_SSL_CERT || "",
    key: process.env.KAFKA_SSL_KEY || "",
  },

  // 日志配置
  logLevel: process.env.KAFKA_LOG_LEVEL || "info",
  logCreator: process.env.KAFKA_LOG_CREATOR || "default",

  // 监控配置
  metrics: {
    enabled: process.env.KAFKA_METRICS_ENABLED === "true",
    interval: parseInt(process.env.KAFKA_METRICS_INTERVAL || "5000", 10),
  },
}));
