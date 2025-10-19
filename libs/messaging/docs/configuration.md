# 配置指南

## 基本配置

### MessagingModule 配置

```typescript
import { MessagingModule } from "@hl8/messaging";

@Module({
  imports: [
    MessagingModule.forRoot({
      adapter: "kafka",
      brokers: ["localhost:9092"],
      clientId: "my-app",
      groupId: "my-group",
    }),
  ],
})
export class AppModule {}
```

## 适配器配置

### Kafka 配置

```typescript
const kafkaConfig = {
  adapter: "kafka",
  brokers: ["localhost:9092", "localhost:9093"],
  clientId: "messaging-client",
  groupId: "messaging-group",
  kafka: {
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
    compression: "gzip",
  },
};
```

### RabbitMQ 配置

```typescript
const rabbitmqConfig = {
  adapter: "rabbitmq",
  connectionString: "amqp://username:password@localhost:5672",
  rabbitmq: {
    exchange: {
      name: "messaging.exchange",
      type: "topic",
      durable: true,
    },
    queue: {
      name: "messaging.queue",
      durable: true,
    },
  },
};
```

### Redis 配置

```typescript
const redisConfig = {
  adapter: "redis",
  connectionString: "redis://localhost:6379",
  redis: {
    host: "localhost",
    port: 6379,
    keyPrefix: "messaging:",
  },
};
```

## 多租户配置

```typescript
const multiTenantConfig = {
  adapter: "kafka",
  brokers: ["localhost:9092"],
  multiTenant: {
    enabled: true,
    tenantHeader: "x-tenant-id",
    namespaceStrategy: "prefix",
    defaultTenant: "default",
  },
};
```

## 监控配置

```typescript
const monitoringConfig = {
  adapter: "kafka",
  brokers: ["localhost:9092"],
  monitoring: {
    enabled: true,
    metrics: {
      enabled: true,
      interval: 60000,
      exporters: ["console", "prometheus"],
    },
    healthCheck: {
      enabled: true,
      interval: 30000,
      timeout: 5000,
    },
  },
};
```
