# 使用示例

## 基本使用示例

### 1. 模块配置

```typescript
import { Module } from '@nestjs/common';
import { MessagingModule } from '@hl8/messaging';

@Module({
  imports: [
    MessagingModule.forRoot({
      adapter: 'kafka',
      brokers: ['localhost:9092'],
      clientId: 'my-app',
      groupId: 'my-group',
    }),
  ],
})
export class AppModule {}
```

### 2. 消息发布

```typescript
import { Injectable } from '@nestjs/common';
import { MessagingService } from '@hl8/messaging';

@Injectable()
export class UserService {
  constructor(private messagingService: MessagingService) {}

  async createUser(userData: CreateUserDto) {
    const user = await this.userRepository.save(userData);
    
    await this.messagingService.publish('user.created', {
      userId: user.id,
      email: user.email,
      name: user.name,
      timestamp: new Date(),
    });

    return user;
  }
}
```

### 3. 消息订阅

```typescript
import { Injectable } from '@nestjs/common';
import { MessagingService } from '@hl8/messaging';

@Injectable()
export class NotificationService {
  constructor(private messagingService: MessagingService) {}

  async onModuleInit() {
    await this.messagingService.subscribe('user.created', async (message) => {
      await this.sendWelcomeEmail(message.email);
    });
  }

  private async sendWelcomeEmail(email: string) {
    console.log(`发送欢迎邮件到: ${email}`);
  }
}
```

## 装饰器使用示例

### 消息处理器装饰器

```typescript
import { Injectable } from '@nestjs/common';
import { MessageHandler } from '@hl8/messaging';

@Injectable()
export class UserHandlersService {
  @MessageHandler('user.created')
  async handleUserCreated(message: any) {
    console.log('处理用户创建消息:', message);
    
    await this.emailService.sendWelcome(message.email);
    await this.preferenceService.createDefaults(message.userId);
  }

  @MessageHandler('user.updated')
  async handleUserUpdated(message: any) {
    console.log('处理用户更新消息:', message);
    
    await this.cacheService.invalidate(`user:${message.userId}`);
    await this.searchService.updateUser(message.userId, message.changes);
  }
}
```

### 事件处理器装饰器

```typescript
import { Injectable } from '@nestjs/common';
import { EventHandler } from '@hl8/messaging';

@Injectable()
export class OrderHandlersService {
  @EventHandler('OrderCreated')
  async handleOrderCreated(event: any) {
    console.log('处理订单创建事件:', event);
    
    await this.inventoryService.reserveItems(event.data.orderItems);
    await this.emailService.sendOrderConfirmation(event.data.customerEmail);
  }

  @EventHandler('OrderPaid')
  async handleOrderPaid(event: any) {
    console.log('处理订单支付事件:', event);
    
    await this.inventoryService.confirmReservation(event.data.orderId);
    await this.shippingService.createShipment(event.data.orderId);
  }
}
```

### 任务处理器装饰器

```typescript
import { Injectable } from '@nestjs/common';
import { TaskHandler } from '@hl8/messaging';

@Injectable()
export class TaskHandlersService {
  @TaskHandler('SendEmail')
  async handleSendEmail(task: any) {
    console.log('处理发送邮件任务:', task);
    
    const { to, subject, template, data } = task.payload;
    
    await this.emailService.send({
      to,
      subject,
      template,
      data,
    });
  }

  @TaskHandler('GenerateReport')
  async handleGenerateReport(task: any) {
    console.log('处理生成报告任务:', task);
    
    const { reportType, dateRange, userId } = task.payload;
    
    const report = await this.reportService.generate({
      type: reportType,
      dateRange,
      userId,
    });
    
    await this.reportService.save(report);
    await this.notificationService.notifyReportReady(userId, report.id);
  }
}
```

## 错误处理示例

### 重试机制

```typescript
import { Injectable } from '@nestjs/common';
import { MessagingService } from '@hl8/messaging';

@Injectable()
export class RetryHandlerService {
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor(private messagingService: MessagingService) {}

  async handleWithRetry(topic: string, handler: Function) {
    await this.messagingService.subscribe(topic, async (message) => {
      let retryCount = 0;
      
      while (retryCount < this.maxRetries) {
        try {
          await handler(message);
          break;
        } catch (error) {
          retryCount++;
          
          if (retryCount >= this.maxRetries) {
            await this.sendToDeadLetterQueue(message, error);
            break;
          }
          
          await this.delay(this.retryDelay * retryCount);
        }
      }
    });
  }

  private async sendToDeadLetterQueue(message: any, error: Error) {
    await this.messagingService.publish('dead.letter', {
      originalMessage: message,
      error: error.message,
      timestamp: new Date(),
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```
