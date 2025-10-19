# @hl8/messaging

企业级消息队列和事件总线模块 - 支持 Kafka、RabbitMQ、Redis 等多种消息中间件

## 特性

- **多消息中间件支持**: 支持 Kafka、RabbitMQ、Redis 等多种消息中间件
- **企业级架构**: 基于 Clean Architecture + CQRS + 事件溯源 + 事件驱动架构
- **多租户支持**: 原生支持多租户消息隔离
- **高性能**: 优化的消息处理性能和低延迟
- **监控完善**: 内置性能监控、健康检查和统计功能
- **类型安全**: 完整的 TypeScript 类型支持

## 快速开始

### 基本使用

```typescript
import { MessagingModule } from "@hl8/messaging";

@Module({
  imports: [
    MessagingModule.forRoot({
      adapter: "kafka",
      brokers: ["localhost:9092"],
    }),
  ],
})
export class AppModule {}
```

### 发布消息

```typescript
import { MessagingService } from "@hl8/messaging";

@Injectable()
export class OrderService {
  constructor(private messagingService: MessagingService) {}

  async createOrder(orderData: any) {
    await this.messagingService.publish("order.created", {
      orderId: order.id,
      customerId: order.customerId,
      amount: order.amount,
    });
  }
}
```

### 订阅消息

```typescript
import { MessageHandler } from "@hl8/messaging";

@Injectable()
export class NotificationService {
  @MessageHandler("order.created")
  async handleOrderCreated(message: any) {
    await this.sendNotification(message.customerId, "订单创建成功");
  }
}
```

## 详细文档

- [API 文档](./docs/api.md) - 详细的 API 参考
- [架构设计](./docs/architecture.md) - 详细的架构设计说明
- [配置指南](./docs/configuration.md) - 配置选项和最佳实践
- [使用示例](./docs/examples.md) - 更多使用示例
