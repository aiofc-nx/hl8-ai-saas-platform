# API 文档

## 核心服务 API

### MessagingService

#### publish(topic: string, message: any, options?: PublishOptions): Promise<void>
发布消息到指定主题

#### subscribe(topic: string, handler: MessageHandler): Promise<Subscription>
订阅主题消息

#### unsubscribe(subscription: Subscription): Promise<void>
取消订阅

#### healthCheck(): Promise<HealthStatus>
检查服务健康状态

### EventService

#### publishEvent(event: Event): Promise<void>
发布事件

#### subscribeToEvent(eventType: string, handler: EventHandler): Promise<Subscription>
订阅特定类型的事件

#### getEventHistory(aggregateId: string): Promise<Event[]>
获取聚合根的事件历史

### TaskService

#### scheduleTask(task: Task): Promise<TaskResult>
调度任务执行

#### getTaskStatus(taskId: string): Promise<TaskStatus>
获取任务状态

## 装饰器 API

### @MessageHandler(topic: string, options?: MessageHandlerOptions)
用于标记消息处理器的装饰器

### @EventHandler(eventType: string, options?: EventHandlerOptions)
用于标记事件处理器的装饰器

### @TaskHandler(taskType: string, options?: TaskHandlerOptions)
用于标记任务处理器的装饰器

## 类型定义

```typescript
interface Message {
  id: string;
  topic: string;
  data: any;
  headers?: Record<string, string>;
  timestamp: Date;
}

interface Event {
  id: string;
  type: string;
  aggregateId: string;
  data: any;
  version: number;
  timestamp: Date;
}

interface Task {
  id: string;
  type: string;
  payload: any;
  scheduleAt?: Date;
}
```