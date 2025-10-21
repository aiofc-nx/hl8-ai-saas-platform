/**
 * 事件驱动架构示例
 *
 * 演示如何使用应用内核实现事件驱动架构
 * 展示事件发布、订阅、处理和验证
 *
 * @since 1.0.0
 */
import {
  BaseCommand,
  BaseQuery,
  BaseCommandUseCase,
} from "@hl8/application-kernel";
import {
  EntityId,
  IsolationContext,
  TenantId,
  UserId,
} from "@hl8/domain-kernel";
import { DomainEvent, IEventBus, EventHandler } from "@hl8/application-kernel";
import {
  EventPublisher,
  EventSubscriptionManager,
  EventValidationUtils,
} from "@hl8/application-kernel";

// 用户创建事件
export class UserCreatedEvent implements DomainEvent {
  readonly eventId: EntityId;
  readonly occurredAt: Date;
  readonly aggregateId: EntityId;
  readonly version: number;
  readonly eventType: string;
  readonly eventData: {
    userId: string;
    username: string;
    email: string;
    displayName: string;
  };

  constructor(
    userId: EntityId,
    username: string,
    email: string,
    displayName: string,
  ) {
    this.eventId = EntityId.create();
    this.occurredAt = new Date();
    this.aggregateId = userId;
    this.version = 1;
    this.eventType = "UserCreated";
    this.eventData = {
      userId: userId.getValue(),
      username,
      email,
      displayName,
    };
  }
}

// 用户更新事件
export class UserUpdatedEvent implements DomainEvent {
  readonly eventId: EntityId;
  readonly occurredAt: Date;
  readonly aggregateId: EntityId;
  readonly version: number;
  readonly eventType: string;
  readonly eventData: {
    userId: string;
    changes: Record<string, any>;
    updatedBy: string;
  };

  constructor(
    userId: EntityId,
    changes: Record<string, any>,
    updatedBy: string,
  ) {
    this.eventId = EntityId.create();
    this.occurredAt = new Date();
    this.aggregateId = userId;
    this.version = 2;
    this.eventType = "UserUpdated";
    this.eventData = {
      userId: userId.getValue(),
      changes,
      updatedBy,
    };
  }
}

// 用户删除事件
export class UserDeletedEvent implements DomainEvent {
  readonly eventId: EntityId;
  readonly occurredAt: Date;
  readonly aggregateId: EntityId;
  readonly version: number;
  readonly eventType: string;
  readonly eventData: {
    userId: string;
    deletedBy: string;
    reason?: string;
  };

  constructor(userId: EntityId, deletedBy: string, reason?: string) {
    this.eventId = EntityId.create();
    this.occurredAt = new Date();
    this.aggregateId = userId;
    this.version = 3;
    this.eventType = "UserDeleted";
    this.eventData = {
      userId: userId.getValue(),
      deletedBy,
      reason,
    };
  }
}

// 创建用户命令
export class CreateUserCommand extends BaseCommand {
  constructor(
    public readonly username: string,
    public readonly email: string,
    public readonly displayName: string,
    isolationContext?: IsolationContext,
  ) {
    super("CreateUserCommand", "创建用户命令", isolationContext);
  }
}

// 更新用户命令
export class UpdateUserCommand extends BaseCommand {
  constructor(
    public readonly userId: EntityId,
    public readonly changes: Record<string, any>,
    isolationContext?: IsolationContext,
  ) {
    super("UpdateUserCommand", "更新用户命令", isolationContext);
  }
}

// 删除用户命令
export class DeleteUserCommand extends BaseCommand {
  constructor(
    public readonly userId: EntityId,
    public readonly reason?: string,
    isolationContext?: IsolationContext,
  ) {
    super("DeleteUserCommand", "删除用户命令", isolationContext);
  }
}

// 获取用户查询
export class GetUserQuery extends BaseQuery {
  constructor(
    public readonly userId: EntityId,
    isolationContext?: IsolationContext,
  ) {
    super("GetUserQuery", "获取用户查询", isolationContext);
  }
}

// 用户用例
export class UserUseCase extends BaseCommandUseCase<
  CreateUserCommand,
  EntityId
> {
  constructor(private readonly eventBus: IEventBus) {
    super("UserUseCase", "用户用例", "1.0.0", ["user:manage"], eventBus);
  }

  protected async executeCommand(
    request: CreateUserCommand,
    context: any,
  ): Promise<EntityId> {
    const userId = EntityId.create();

    // 创建用户事件
    const userCreatedEvent = new UserCreatedEvent(
      userId,
      request.username,
      request.email,
      request.displayName,
    );

    // 验证事件
    const validation = EventValidationUtils.validateEvent(userCreatedEvent);
    if (!validation.isValid) {
      throw new Error(`事件验证失败: ${validation.errors.join(", ")}`);
    }

    // 发布事件
    const publishResult = await EventPublisher.publishEvent(
      this.eventBus,
      userCreatedEvent,
      {
        async: true,
        retryCount: 3,
        retryDelay: 1000,
        timeout: 30000,
        validate: true,
      },
    );

    if (!publishResult.success) {
      throw new Error(`事件发布失败: ${publishResult.errors?.join(", ")}`);
    }

    return userId;
  }
}

// 事件处理器示例
export class UserEventHandler implements EventHandler {
  async handle(event: DomainEvent): Promise<void> {
    console.log(`处理事件: ${event.eventType}`, event.eventData);

    switch (event.eventType) {
      case "UserCreated":
        await this.handleUserCreated(event);
        break;
      case "UserUpdated":
        await this.handleUserUpdated(event);
        break;
      case "UserDeleted":
        await this.handleUserDeleted(event);
        break;
      default:
        console.log(`未知事件类型: ${event.eventType}`);
    }
  }

  private async handleUserCreated(event: DomainEvent): Promise<void> {
    const { userId, username, email, displayName } = event.eventData;
    console.log(`用户创建: ${username} (${email}) - ${displayName}`);

    // 发送欢迎邮件
    await this.sendWelcomeEmail(email, displayName);

    // 创建用户档案
    await this.createUserProfile(userId);
  }

  private async handleUserUpdated(event: DomainEvent): Promise<void> {
    const { userId, changes, updatedBy } = event.eventData;
    console.log(`用户更新: ${userId} - 更新者: ${updatedBy}`);
    console.log("变更内容:", changes);

    // 记录变更日志
    await this.logUserChanges(userId, changes, updatedBy);
  }

  private async handleUserDeleted(event: DomainEvent): Promise<void> {
    const { userId, deletedBy, reason } = event.eventData;
    console.log(`用户删除: ${userId} - 删除者: ${deletedBy}`);
    if (reason) {
      console.log(`删除原因: ${reason}`);
    }

    // 清理用户数据
    await this.cleanupUserData(userId);
  }

  private async sendWelcomeEmail(
    email: string,
    displayName: string,
  ): Promise<void> {
    console.log(`发送欢迎邮件到: ${email} (${displayName})`);
    // 实际实现中这里会调用邮件服务
  }

  private async createUserProfile(userId: string): Promise<void> {
    console.log(`创建用户档案: ${userId}`);
    // 实际实现中这里会创建用户档案
  }

  private async logUserChanges(
    userId: string,
    changes: Record<string, any>,
    updatedBy: string,
  ): Promise<void> {
    console.log(`记录用户变更日志: ${userId} - ${updatedBy}`, changes);
    // 实际实现中这里会记录变更日志
  }

  private async cleanupUserData(userId: string): Promise<void> {
    console.log(`清理用户数据: ${userId}`);
    // 实际实现中这里会清理用户相关数据
  }
}

// 模拟事件总线实现
export class MockEventBus implements IEventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || [];
    console.log(`发布事件: ${event.eventType}`, event.eventData);

    for (const handler of handlers) {
      try {
        await handler.handle(event);
      } catch (error) {
        console.error(`事件处理器执行失败: ${event.eventType}`, error);
      }
    }
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    console.log(`批量发布事件: ${events.length} 个`);

    for (const event of events) {
      await this.publish(event);
    }
  }

  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
    console.log(`订阅事件: ${eventType}`);
  }

  unsubscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
      console.log(`取消订阅事件: ${eventType}`);
    }
  }
}

// 事件驱动架构演示
export async function demonstrateEventDrivenArchitecture() {
  console.log("=== 事件驱动架构演示 ===\n");

  // 创建事件总线
  const eventBus = new MockEventBus();
  const subscriptionManager = new EventSubscriptionManager(eventBus);

  // 订阅事件
  const userEventHandler = new UserEventHandler();
  const subscriptionId = subscriptionManager.subscribe(
    "UserCreated",
    userEventHandler,
  );
  subscriptionManager.subscribe("UserUpdated", userEventHandler);
  subscriptionManager.subscribe("UserDeleted", userEventHandler);

  console.log("事件订阅完成");
  console.log("订阅统计:", subscriptionManager.getSubscriptionStats());
  console.log();

  // 创建用户用例
  const userUseCase = new UserUseCase(eventBus);

  // 创建隔离上下文
  const tenantContext = IsolationContext.tenant(TenantId.create("tenant-123"));
  const useCaseContext = {
    tenant: { id: "tenant-123", name: "测试租户" },
    user: { id: "admin-456", username: "admin" },
    requestId: "req-789",
    timestamp: new Date(),
  };

  try {
    // 执行创建用户命令
    console.log("1. 创建用户:");
    const createCommand = new CreateUserCommand(
      "john.doe",
      "john@example.com",
      "John Doe",
      tenantContext,
    );

    const userId = await userUseCase.execute(createCommand, useCaseContext);
    console.log(`用户创建成功: ${userId.getValue()}`);
    console.log();

    // 发布用户更新事件
    console.log("2. 发布用户更新事件:");
    const updateEvent = new UserUpdatedEvent(
      userId,
      { displayName: "John Smith", email: "john.smith@example.com" },
      "admin-456",
    );

    const updateResult = await EventPublisher.publishEvent(
      eventBus,
      updateEvent,
      {
        async: true,
        retryCount: 2,
        retryDelay: 500,
        validate: true,
      },
    );

    console.log(`更新事件发布结果: ${updateResult.success ? "成功" : "失败"}`);
    if (updateResult.errors) {
      console.log("发布错误:", updateResult.errors);
    }
    console.log();

    // 发布用户删除事件
    console.log("3. 发布用户删除事件:");
    const deleteEvent = new UserDeletedEvent(
      userId,
      "admin-456",
      "用户请求删除账户",
    );

    const deleteResult = await EventPublisher.publishEvent(
      eventBus,
      deleteEvent,
      {
        async: true,
        retryCount: 2,
        retryDelay: 500,
        validate: true,
      },
    );

    console.log(`删除事件发布结果: ${deleteResult.success ? "成功" : "失败"}`);
    if (deleteResult.errors) {
      console.log("发布错误:", deleteResult.errors);
    }
    console.log();

    // 批量发布事件
    console.log("4. 批量发布事件:");
    const batchEvents = [
      new UserCreatedEvent(
        EntityId.create(),
        "alice",
        "alice@example.com",
        "Alice",
      ),
      new UserCreatedEvent(EntityId.create(), "bob", "bob@example.com", "Bob"),
      new UserCreatedEvent(
        EntityId.create(),
        "charlie",
        "charlie@example.com",
        "Charlie",
      ),
    ];

    const batchResult = await EventPublisher.publishEvents(
      eventBus,
      batchEvents,
      {
        async: true,
        retryCount: 1,
        retryDelay: 1000,
        validate: true,
      },
    );

    console.log(`批量发布结果: ${batchResult.success ? "成功" : "失败"}`);
    console.log(`发布事件数量: ${batchResult.eventCount}`);
    console.log(`耗时: ${batchResult.duration}ms`);
    console.log();
  } catch (error) {
    console.error("演示过程中发生错误:", error);
  } finally {
    // 清理订阅
    subscriptionManager.unsubscribeAll();
    console.log("事件订阅已清理");
  }
}

// 事件验证演示
export function demonstrateEventValidation() {
  console.log("=== 事件验证演示 ===\n");

  // 创建有效事件
  const validEvent = new UserCreatedEvent(
    EntityId.create(),
    "testuser",
    "test@example.com",
    "Test User",
  );

  console.log("1. 验证有效事件:");
  const validResult = EventValidationUtils.validateEvent(validEvent);
  console.log(`验证结果: ${validResult.isValid ? "有效" : "无效"}`);
  if (validResult.errors.length > 0) {
    console.log("错误:", validResult.errors);
  }
  if (validResult.warnings.length > 0) {
    console.log("警告:", validResult.warnings);
  }
  console.log();

  // 创建无效事件
  const invalidEvent = {
    eventId: EntityId.create(),
    occurredAt: new Date(),
    aggregateId: EntityId.create(),
    version: -1, // 无效版本
    eventType: "", // 空事件类型
    eventData: {}, // 空事件数据
  } as DomainEvent;

  console.log("2. 验证无效事件:");
  const invalidResult = EventValidationUtils.validateEvent(invalidEvent);
  console.log(`验证结果: ${invalidResult.isValid ? "有效" : "无效"}`);
  if (invalidResult.errors.length > 0) {
    console.log("错误:", invalidResult.errors);
  }
  if (invalidResult.warnings.length > 0) {
    console.log("警告:", invalidResult.warnings);
  }
  console.log();

  // 使用预定义规则验证
  console.log("3. 使用预定义规则验证:");
  const rules = EventValidationUtils.createPredefinedRules();
  const ruleResult = EventValidationUtils.validateEvent(validEvent, rules);
  console.log(`规则验证结果: ${ruleResult.isValid ? "通过" : "失败"}`);
  if (ruleResult.errors.length > 0) {
    console.log("规则错误:", ruleResult.errors);
  }
  console.log();
}

// 运行演示
if (require.main === module) {
  demonstrateEventDrivenArchitecture()
    .then(() => demonstrateEventValidation())
    .catch(console.error);
}
