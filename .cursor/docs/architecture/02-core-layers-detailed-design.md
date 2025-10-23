# 核心层详细设计

> **版本**: 1.0.0 | **创建日期**: 2025-01-27 | **模块**: 架构设计文档

---

## 📋 目录

- [1. 领域层详细设计](#1-领域层详细设计)
- [2. 应用层详细设计](#2-应用层详细设计)
- [3. 基础设施层详细设计](#3-基础设施层详细设计)
- [4. 接口层详细设计](#4-接口层详细设计)
- [5. 层间交互设计](#5-层间交互设计)
- [6. 核心组件设计](#6-核心组件设计)

---

## 1. 领域层详细设计

### 1.1 领域层架构

```
Domain Layer (领域层)
├── Entities (实体)
│   ├── Aggregate Roots (聚合根)
│   └── Internal Entities (内部实体)
├── Value Objects (值对象)
├── Domain Services (领域服务)
├── Domain Events (领域事件)
├── Business Rules (业务规则)
├── Specifications (规格模式)
└── Interfaces (接口定义)
```

### 1.2 核心组件

#### 1.2.1 实体 (Entities)

**基础实体类**:

```typescript
/**
 * 基础实体类
 * 
 * @description 提供实体的基础功能，包括ID、审计信息、生命周期管理等
 * 所有领域实体都应该继承此类，确保统一的实体行为
 * 
 * @example
 * ```typescript
 * export class User extends BaseEntity {
 *   constructor(
 *     id: UserId,
 *     private readonly email: Email,
 *     private readonly username: Username
 *   ) {
 *     super(id);
 *   }
 * 
 *   public changeEmail(newEmail: Email): void {
 *     // 业务逻辑实现
 *     this.email = newEmail;
 *     this.addDomainEvent(new UserEmailChangedEvent(this.id, newEmail));
 *   }
 * }
 * ```
 */
export abstract class BaseEntity {
  protected readonly _id: EntityId;
  protected readonly _auditInfo: AuditInfo;
  protected readonly _domainEvents: DomainEvent[] = [];
  
  constructor(id: EntityId) {
    this._id = id;
    this._auditInfo = AuditInfoBuilder.create().build();
  }
  
  public get id(): EntityId {
    return this._id;
  }
  
  public get auditInfo(): AuditInfo {
    return this._auditInfo;
  }
  
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }
  
  public getDomainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }
  
  public clearDomainEvents(): void {
    this._domainEvents.length = 0;
  }
}
```

**聚合根基类**:

```typescript
/**
 * 聚合根基类
 * 
 * @description 聚合根是聚合的入口点，负责管理聚合边界和一致性规则
 * 支持事件溯源和指令模式，确保业务规则的正确执行
 * 
 * @example
 * ```typescript
 * export class Order extends AggregateRoot {
 *   constructor(
 *     id: OrderId,
 *     private readonly customerId: CustomerId,
 *     private readonly items: OrderItem[]
 *   ) {
 *     super(id);
 *   }
 * 
 *   public addItem(item: OrderItem): void {
 *     // 业务规则验证
 *     if (this.isOrderClosed()) {
 *       throw new OrderClosedException();
 *     }
 *     
 *     this.items.push(item);
 *     this.addDomainEvent(new OrderItemAddedEvent(this.id, item));
 *   }
 * }
 * ```
 */
export abstract class AggregateRoot extends BaseEntity {
  private _version: number = 0;
  
  public get version(): number {
    return this._version;
  }
  
  protected incrementVersion(): void {
    this._version++;
  }
  
  /**
   * 从事件流重建聚合状态
   * 
   * @param events 事件流
   * @returns 重建后的聚合实例
   */
  public static fromEvents(events: DomainEvent[]): AggregateRoot {
    // 事件溯源实现
    const aggregate = new (this as any)();
    events.forEach(event => aggregate.applyEvent(event));
    return aggregate;
  }
  
  protected applyEvent(event: DomainEvent): void {
    // 事件应用逻辑
    this.incrementVersion();
  }
}
```

#### 1.2.2 值对象 (Value Objects)

**基础值对象类**:

```typescript
/**
 * 基础值对象类
 * 
 * @description 值对象表示无标识的不可变概念，通过值相等性进行比较
 * 所有值对象都应该继承此类，确保不可变性和值相等性
 * 
 * @example
 * ```typescript
 * export class Email extends BaseValueObject {
 *   constructor(private readonly value: string) {
 *     super();
 *     this.validateEmail(value);
 *   }
 * 
 *   private validateEmail(email: string): void {
 *     if (!this.isValidEmail(email)) {
 *       throw new InvalidEmailException(email);
 *     }
 *   }
 * 
 *   public equals(other: Email): boolean {
 *     return this.value === other.value;
 *   }
 * }
 * ```
 */
export abstract class BaseValueObject {
  public abstract equals(other: BaseValueObject): boolean;
  
  public abstract toString(): string;
}
```

**ID值对象**:

```typescript
/**
 * 实体ID基类
 * 
 * @description 提供统一的实体ID管理，支持类型安全和值相等性
 * 所有实体ID都应该继承此类，确保ID的唯一性和类型安全
 */
export abstract class EntityId extends BaseValueObject {
  constructor(protected readonly value: string) {
    super();
  }
  
  public equals(other: EntityId): boolean {
    return this.constructor === other.constructor && this.value === other.value;
  }
  
  public toString(): string {
    return this.value;
  }
}

/**
 * 租户ID
 * 
 * @description 租户标识符，用于多租户数据隔离
 */
export class TenantId extends EntityId {
  constructor(value: string) {
    super(value);
  }
}

/**
 * 组织ID
 * 
 * @description 组织标识符，用于组织级数据隔离
 */
export class OrganizationId extends EntityId {
  constructor(value: string) {
    super(value);
  }
}

/**
 * 部门ID
 * 
 * @description 部门标识符，用于部门级数据隔离
 */
export class DepartmentId extends EntityId {
  constructor(value: string) {
    super(value);
  }
}

/**
 * 用户ID
 * 
 * @description 用户标识符，用于用户级数据隔离
 */
export class UserId extends EntityId {
  constructor(value: string) {
    super(value);
  }
}
```

#### 1.2.3 领域服务 (Domain Services)

**基础领域服务类**:

```typescript
/**
 * 基础领域服务类
 * 
 * @description 领域服务处理跨实体的领域逻辑，不包含状态
 * 所有领域服务都应该继承此类，确保服务的一致性和可测试性
 * 
 * @example
 * ```typescript
 * export class UserDomainService extends BaseDomainService {
 *   public isEmailUnique(email: Email, excludeUserId?: UserId): boolean {
 *     // 跨实体的业务逻辑
 *     return this.userRepository.isEmailUnique(email, excludeUserId);
 *   }
 * 
 *   public canUserAccessResource(userId: UserId, resourceId: ResourceId): boolean {
 *     // 复杂的权限验证逻辑
 *     const user = this.userRepository.findById(userId);
 *     const resource = this.resourceRepository.findById(resourceId);
 *     return this.permissionService.hasAccess(user, resource);
 *   }
 * }
 * ```
 */
export abstract class BaseDomainService {
  protected constructor(
    protected readonly context: IsolationContext
  ) {}
  
  /**
   * 验证业务规则
   * 
   * @param rule 业务规则
   * @returns 验证结果
   */
  protected validateBusinessRule(rule: BusinessRule): BusinessRuleValidationResult {
    return rule.validate(this.context);
  }
}
```

#### 1.2.4 领域事件 (Domain Events)

**领域事件基类**:

```typescript
/**
 * 领域事件基类
 * 
 * @description 领域事件表示领域内发生的重要事实
 * 所有领域事件都应该继承此类，确保事件的一致性和可追溯性
 * 
 * @example
 * ```typescript
 * export class UserRegisteredEvent extends DomainEvent {
 *   constructor(
 *     public readonly userId: UserId,
 *     public readonly email: Email,
 *     public readonly registeredAt: Date
 *   ) {
 *     super('UserRegistered', new Date());
 *   }
 * }
 * ```
 */
export abstract class DomainEvent {
  constructor(
    public readonly eventType: string,
    public readonly occurredAt: Date,
    public readonly eventId: string = uuid()
  ) {}
  
  public abstract getAggregateId(): EntityId;
  public abstract getEventData(): Record<string, any>;
}
```

#### 1.2.5 业务规则 (Business Rules)

**业务规则系统**:

```typescript
/**
 * 业务规则验证器
 * 
 * @description 提供业务规则的验证和管理功能
 * 支持复杂业务规则的组合和验证
 * 
 * @example
 * ```typescript
 * export class UserRegistrationBusinessRule extends BusinessRuleValidator {
 *   public validate(context: IsolationContext): BusinessRuleValidationResult {
 *     const errors: BusinessRuleValidationError[] = [];
 *     
 *     // 验证邮箱格式
 *     if (!this.isValidEmail(context.email)) {
 *       errors.push(new BusinessRuleValidationError('INVALID_EMAIL', '邮箱格式不正确'));
 *     }
 *     
 *     // 验证用户名唯一性
 *     if (!this.isUsernameUnique(context.username)) {
 *       errors.push(new BusinessRuleValidationError('DUPLICATE_USERNAME', '用户名已存在'));
 *     }
 *     
 *     return new BusinessRuleValidationResult(errors.length === 0, errors);
 *   }
 * }
 * ```
 */
export class BusinessRuleValidator {
  public validate(context: IsolationContext): BusinessRuleValidationResult {
    // 业务规则验证逻辑
    return new BusinessRuleValidationResult(true, []);
  }
}
```

### 1.3 领域层设计原则

#### 1.3.1 充血模型设计

- **实体包含业务逻辑**: 实体不仅仅是数据容器，还包含业务行为
- **业务规则封装**: 业务规则在实体内部实现，确保一致性
- **状态变更控制**: 通过业务方法控制状态变更，防止非法操作

#### 1.3.2 聚合设计

- **聚合边界**: 聚合根管理聚合边界，确保一致性
- **事务边界**: 一个事务只能修改一个聚合
- **事件发布**: 聚合根负责发布领域事件

#### 1.3.3 事件溯源支持

- **事件存储**: 所有状态变更都通过事件记录
- **状态重建**: 可以从事件流重建聚合状态
- **事件版本**: 支持事件版本管理和迁移

---

## 2. 应用层详细设计

### 2.1 应用层架构

```
Application Layer (应用层)
├── Use Cases (用例)
│   ├── Command Use Cases (命令用例)
│   └── Query Use Cases (查询用例)
├── CQRS (命令查询职责分离)
│   ├── Commands (命令)
│   ├── Queries (查询)
│   ├── Command Handlers (命令处理器)
│   └── Query Handlers (查询处理器)
├── Application Services (应用服务)
├── Event Bus (事件总线)
└── Transaction Management (事务管理)
```

### 2.2 核心组件

#### 2.2.1 用例 (Use Cases)

**基础用例类**:

```typescript
/**
 * 基础用例类
 * 
 * @description 用例封装业务用例的实现，协调领域层和基础设施层
 * 所有用例都应该继承此类，确保用例的一致性和可测试性
 * 
 * @example
 * ```typescript
 * export class CreateUserUseCase extends BaseUseCase {
 *   constructor(
 *     private readonly userRepository: IUserRepository,
 *     private readonly eventBus: IEventBus
 *   ) {
 *     super();
 *   }
 * 
 *   public async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
 *     // 1. 验证输入
 *     this.validateRequest(request);
 *     
 *     // 2. 执行业务逻辑
 *     const user = User.create(request.email, request.username);
 *     
 *     // 3. 持久化
 *     await this.userRepository.save(user);
 *     
 *     // 4. 发布事件
 *     await this.eventBus.publish(user.getDomainEvents());
 *     
 *     return new CreateUserResponse(user.id);
 *   }
 * }
 * ```
 */
export abstract class BaseUseCase {
  protected constructor(
    protected readonly context: IUseCaseContext
  ) {}
  
  /**
   * 验证请求
   * 
   * @param request 请求对象
   * @throws ValidationException 验证失败时抛出
   */
  protected validateRequest(request: any): void {
    // 请求验证逻辑
  }
  
  /**
   * 执行业务逻辑
   * 
   * @param request 请求对象
   * @returns 响应对象
   */
  public abstract execute(request: any): Promise<any>;
}
```

**命令用例类**:

```typescript
/**
 * 基础命令用例类
 * 
 * @description 命令用例处理业务命令，通常涉及状态变更
 * 所有命令用例都应该继承此类，确保命令的一致性和可测试性
 * 
 * @example
 * ```typescript
 * export class CreateUserCommandUseCase extends BaseCommandUseCase {
 *   public async execute(command: CreateUserCommand): Promise<CreateUserResponse> {
 *     // 1. 验证命令
 *     this.validateCommand(command);
 *     
 *     // 2. 执行业务逻辑
 *     const user = User.create(command.email, command.username);
 *     
 *     // 3. 持久化
 *     await this.userRepository.save(user);
 *     
 *     // 4. 发布事件
 *     await this.eventBus.publish(user.getDomainEvents());
 *     
 *     return new CreateUserResponse(user.id);
 *   }
 * }
 * ```
 */
export abstract class BaseCommandUseCase extends BaseUseCase {
  /**
   * 验证命令
   * 
   * @param command 命令对象
   * @throws ValidationException 验证失败时抛出
   */
  protected validateCommand(command: any): void {
    // 命令验证逻辑
  }
}
```

#### 2.2.2 CQRS 模式

**命令和查询分离**:

```typescript
/**
 * 基础命令类
 * 
 * @description 命令表示业务操作，通常涉及状态变更
 * 所有命令都应该继承此类，确保命令的一致性和可追溯性
 * 
 * @example
 * ```typescript
 * export class CreateUserCommand extends BaseCommand {
 *   constructor(
 *     public readonly email: Email,
 *     public readonly username: Username,
 *     public readonly password: Password
 *   ) {
 *     super();
 *   }
 * }
 * ```
 */
export abstract class BaseCommand {
  constructor(
    public readonly commandId: string = uuid(),
    public readonly timestamp: Date = new Date()
  ) {}
}

/**
 * 基础查询类
 * 
 * @description 查询表示数据读取操作，不涉及状态变更
 * 所有查询都应该继承此类，确保查询的一致性和可测试性
 * 
 * @example
 * ```typescript
 * export class GetUserQuery extends BaseQuery {
 *   constructor(
 *     public readonly userId: UserId
 *   ) {
 *     super();
 *   }
 * }
 * ```
 */
export abstract class BaseQuery {
  constructor(
    public readonly queryId: string = uuid(),
    public readonly timestamp: Date = new Date()
  ) {}
}
```

**命令和查询处理器**:

```typescript
/**
 * 命令处理器接口
 * 
 * @description 命令处理器负责处理业务命令
 * 所有命令处理器都应该实现此接口，确保命令处理的一致性
 * 
 * @example
 * ```typescript
 * export class CreateUserCommandHandler implements CommandHandler<CreateUserCommand, CreateUserResponse> {
 *   constructor(
 *     private readonly userRepository: IUserRepository,
 *     private readonly eventBus: IEventBus
 *   ) {}
 * 
 *   public async handle(command: CreateUserCommand): Promise<CreateUserResponse> {
 *     // 命令处理逻辑
 *     const user = User.create(command.email, command.username);
 *     await this.userRepository.save(user);
 *     await this.eventBus.publish(user.getDomainEvents());
 *     return new CreateUserResponse(user.id);
 *   }
 * }
 * ```
 */
export interface CommandHandler<TCommand extends BaseCommand, TResponse> {
  handle(command: TCommand): Promise<TResponse>;
}

/**
 * 查询处理器接口
 * 
 * @description 查询处理器负责处理数据查询
 * 所有查询处理器都应该实现此接口，确保查询处理的一致性
 * 
 * @example
 * ```typescript
 * export class GetUserQueryHandler implements QueryHandler<GetUserQuery, GetUserResponse> {
 *   constructor(
 *     private readonly userRepository: IUserRepository
 *   ) {}
 * 
 *   public async handle(query: GetUserQuery): Promise<GetUserResponse> {
 *     // 查询处理逻辑
 *     const user = await this.userRepository.findById(query.userId);
 *     return new GetUserResponse(user);
 *   }
 * }
 * ```
 */
export interface QueryHandler<TQuery extends BaseQuery, TResponse> {
  handle(query: TQuery): Promise<TResponse>;
}
```

#### 2.2.3 事件总线

**事件总线接口**:

```typescript
/**
 * 事件总线接口
 * 
 * @description 事件总线负责事件的发布和订阅
 * 支持同步和异步事件处理，确保事件的一致性和可靠性
 * 
 * @example
 * ```typescript
 * export class EventBus implements IEventBus {
 *   constructor(
 *     private readonly messageQueue: IMessageQueue
 *   ) {}
 * 
 *   public async publish(events: DomainEvent[]): Promise<void> {
 *     for (const event of events) {
 *       await this.messageQueue.publish(event);
 *     }
 *   }
 * 
 *   public async subscribe<T extends DomainEvent>(
 *     eventType: string,
 *     handler: (event: T) => Promise<void>
 *   ): Promise<void> {
 *     await this.messageQueue.subscribe(eventType, handler);
 *   }
 * }
 * ```
 */
export interface IEventBus {
  /**
   * 发布事件
   * 
   * @param events 事件列表
   */
  publish(events: DomainEvent[]): Promise<void>;
  
  /**
   * 订阅事件
   * 
   * @param eventType 事件类型
   * @param handler 事件处理器
   */
  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: (event: T) => Promise<void>
  ): Promise<void>;
}
```

#### 2.2.4 事务管理

**事务管理器接口**:

```typescript
/**
 * 事务管理器接口
 * 
 * @description 事务管理器负责事务的开始、提交和回滚
 * 支持分布式事务和事务传播，确保数据一致性
 * 
 * @example
 * ```typescript
 * export class TransactionManager implements ITransactionManager {
 *   public async executeInTransaction<T>(
 *     operation: () => Promise<T>
 *   ): Promise<T> {
 *     const transaction = await this.beginTransaction();
 *     try {
 *       const result = await operation();
 *       await this.commitTransaction(transaction);
 *       return result;
 *     } catch (error) {
 *       await this.rollbackTransaction(transaction);
 *       throw error;
 *     }
 *   }
 * }
 * ```
 */
export interface ITransactionManager {
  /**
   * 在事务中执行操作
   * 
   * @param operation 操作函数
   * @returns 操作结果
   */
  executeInTransaction<T>(operation: () => Promise<T>): Promise<T>;
}
```

---

## 3. 基础设施层详细设计

### 3.1 基础设施层架构

```
Infrastructure Layer (基础设施层)
├── Repositories (仓储实现)
│   ├── User Repository
│   ├── Order Repository
│   └── Product Repository
├── External Services (外部服务)
│   ├── Email Service
│   ├── SMS Service
│   └── Payment Service
├── Message Queue (消息队列)
│   ├── Kafka Adapter
│   ├── RabbitMQ Adapter
│   └── Redis Adapter
├── Cache (缓存)
│   ├── Redis Cache
│   └── Memory Cache
└── Event Store (事件存储)
    ├── Database Event Store
    └── File Event Store
```

### 3.2 核心组件

#### 3.2.1 仓储实现

**用户仓储实现**:

```typescript
/**
 * 用户仓储实现
 * 
 * @description 用户仓储的数据库实现，负责用户数据的持久化
 * 实现领域层定义的仓储接口，确保数据访问的一致性
 * 
 * @example
 * ```typescript
 * export class UserRepository implements IUserRepository {
 *   constructor(
 *     private readonly entityManager: EntityManager,
 *     private readonly isolationContext: IsolationContext
 *   ) {}
 * 
 *   public async save(user: User): Promise<void> {
 *     const userEntity = this.mapToEntity(user);
 *     await this.entityManager.persistAndFlush(userEntity);
 *   }
 * 
 *   public async findById(id: UserId): Promise<User | null> {
 *     const userEntity = await this.entityManager.findOne(UserEntity, {
 *       id: id.value,
 *       tenantId: this.isolationContext.tenantId.value
 *     });
 *     
 *     return userEntity ? this.mapToDomain(userEntity) : null;
 *   }
 * }
 * ```
 */
export class UserRepository implements IUserRepository {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly isolationContext: IsolationContext
  ) {}
  
  public async save(user: User): Promise<void> {
    // 持久化逻辑
  }
  
  public async findById(id: UserId): Promise<User | null> {
    // 查询逻辑
    return null;
  }
  
  private mapToEntity(user: User): UserEntity {
    // 领域对象到实体的映射
    return new UserEntity();
  }
  
  private mapToDomain(userEntity: UserEntity): User {
    // 实体到领域对象的映射
    return new User();
  }
}
```

#### 3.2.2 外部服务适配器

**邮件服务适配器**:

```typescript
/**
 * 邮件服务适配器
 * 
 * @description 邮件服务的实现，负责发送邮件
 * 实现领域层定义的服务接口，确保外部服务的一致性
 * 
 * @example
 * ```typescript
 * export class EmailService implements IEmailService {
 *   constructor(
 *     private readonly smtpClient: SmtpClient
 *   ) {}
 * 
 *   public async sendEmail(email: EmailMessage): Promise<void> {
 *     await this.smtpClient.send({
 *       to: email.to,
 *       subject: email.subject,
 *       body: email.body
 *     });
 *   }
 * }
 * ```
 */
export class EmailService implements IEmailService {
  constructor(
    private readonly smtpClient: SmtpClient
  ) {}
  
  public async sendEmail(email: EmailMessage): Promise<void> {
    // 邮件发送逻辑
  }
}
```

#### 3.2.3 消息队列适配器

**Kafka适配器**:

```typescript
/**
 * Kafka消息队列适配器
 * 
 * @description Kafka消息队列的实现，负责消息的发布和订阅
 * 实现领域层定义的消息队列接口，确保消息处理的一致性
 * 
 * @example
 * ```typescript
 * export class KafkaMessageQueue implements IMessageQueue {
 *   constructor(
 *     private readonly kafkaProducer: KafkaProducer,
 *     private readonly kafkaConsumer: KafkaConsumer
 *   ) {}
 * 
 *   public async publish(topic: string, message: any): Promise<void> {
 *     await this.kafkaProducer.send({
 *       topic,
 *       messages: [{ value: JSON.stringify(message) }]
 *     });
 *   }
 * 
 *   public async subscribe(topic: string, handler: (message: any) => Promise<void>): Promise<void> {
 *     await this.kafkaConsumer.subscribe({ topic });
 *     await this.kafkaConsumer.run({
 *       eachMessage: async ({ message }) => {
 *         const data = JSON.parse(message.value.toString());
 *         await handler(data);
 *       }
 *     });
 *   }
 * }
 * ```
 */
export class KafkaMessageQueue implements IMessageQueue {
  constructor(
    private readonly kafkaProducer: KafkaProducer,
    private readonly kafkaConsumer: KafkaConsumer
  ) {}
  
  public async publish(topic: string, message: any): Promise<void> {
    // 消息发布逻辑
  }
  
  public async subscribe(topic: string, handler: (message: any) => Promise<void>): Promise<void> {
    // 消息订阅逻辑
  }
}
```

#### 3.2.4 缓存适配器

**Redis缓存适配器**:

```typescript
/**
 * Redis缓存适配器
 * 
 * @description Redis缓存的实现，负责数据的缓存和检索
 * 实现领域层定义的缓存接口，确保缓存操作的一致性
 * 
 * @example
 * ```typescript
 * export class RedisCache implements ICache {
 *   constructor(
 *     private readonly redisClient: RedisClient
 *   ) {}
 * 
 *   public async get<T>(key: string): Promise<T | null> {
 *     const value = await this.redisClient.get(key);
 *     return value ? JSON.parse(value) : null;
 *   }
 * 
 *   public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
 *     const serialized = JSON.stringify(value);
 *     if (ttl) {
 *       await this.redisClient.setex(key, ttl, serialized);
 *     } else {
 *       await this.redisClient.set(key, serialized);
 *     }
 *   }
 * }
 * ```
 */
export class RedisCache implements ICache {
  constructor(
    private readonly redisClient: RedisClient
  ) {}
  
  public async get<T>(key: string): Promise<T | null> {
    // 缓存获取逻辑
    return null;
  }
  
  public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // 缓存设置逻辑
  }
}
```

---

## 4. 接口层详细设计

### 4.1 接口层架构

```
Interface Layer (接口层)
├── Controllers (控制器)
│   ├── REST Controllers
│   ├── GraphQL Resolvers
│   └── WebSocket Handlers
├── Middleware (中间件)
│   ├── Authentication Middleware
│   ├── Authorization Middleware
│   └── Logging Middleware
├── Guards (守卫)
│   ├── Authentication Guard
│   ├── Authorization Guard
│   └── Rate Limiting Guard
├── Decorators (装饰器)
│   ├── Route Decorators
│   ├── Validation Decorators
│   └── Metadata Decorators
└── DTOs (数据传输对象)
    ├── Request DTOs
    ├── Response DTOs
    └── Validation DTOs
```

### 4.2 核心组件

#### 4.2.1 REST控制器

**用户控制器**:

```typescript
/**
 * 用户控制器
 * 
 * @description 用户相关的REST API端点
 * 处理用户相关的HTTP请求，协调应用层服务
 * 
 * @example
 * ```typescript
 * @Controller('users')
 * export class UserController {
 *   constructor(
 *     private readonly createUserUseCase: CreateUserUseCase,
 *     private readonly getUserUseCase: GetUserUseCase
 *   ) {}
 * 
 *   @Post()
 *   @UseGuards(AuthenticationGuard)
 *   public async createUser(@Body() request: CreateUserRequest): Promise<CreateUserResponse> {
 *     return await this.createUserUseCase.execute(request);
 *   }
 * 
 *   @Get(':id')
 *   @UseGuards(AuthenticationGuard, AuthorizationGuard)
 *   public async getUser(@Param('id') id: string): Promise<GetUserResponse> {
 *     return await this.getUserUseCase.execute(new GetUserRequest(id));
 *   }
 * }
 * ```
 */
@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase
  ) {}
  
  @Post()
  @UseGuards(AuthenticationGuard)
  public async createUser(@Body() request: CreateUserRequest): Promise<CreateUserResponse> {
    return await this.createUserUseCase.execute(request);
  }
  
  @Get(':id')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  public async getUser(@Param('id') id: string): Promise<GetUserResponse> {
    return await this.getUserUseCase.execute(new GetUserRequest(id));
  }
}
```

#### 4.2.2 GraphQL解析器

**用户GraphQL解析器**:

```typescript
/**
 * 用户GraphQL解析器
 * 
 * @description 用户相关的GraphQL查询和变更
 * 处理GraphQL请求，提供类型安全的API
 * 
 * @example
 * ```typescript
 * @Resolver(() => User)
 * export class UserResolver {
 *   constructor(
 *     private readonly createUserUseCase: CreateUserUseCase,
 *     private readonly getUserUseCase: GetUserUseCase
 *   ) {}
 * 
 *   @Mutation(() => User)
 *   @UseGuards(AuthenticationGuard)
 *   public async createUser(@Args('input') input: CreateUserInput): Promise<User> {
 *     const response = await this.createUserUseCase.execute(input);
 *     return response.user;
 *   }
 * 
 *   @Query(() => User)
 *   @UseGuards(AuthenticationGuard, AuthorizationGuard)
 *   public async getUser(@Args('id') id: string): Promise<User> {
 *     const response = await this.getUserUseCase.execute(new GetUserRequest(id));
 *     return response.user;
 *   }
 * }
 * ```
 */
@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase
  ) {}
  
  @Mutation(() => User)
  @UseGuards(AuthenticationGuard)
  public async createUser(@Args('input') input: CreateUserInput): Promise<User> {
    const response = await this.createUserUseCase.execute(input);
    return response.user;
  }
  
  @Query(() => User)
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  public async getUser(@Args('id') id: string): Promise<User> {
    const response = await this.getUserUseCase.execute(new GetUserRequest(id));
    return response.user;
  }
}
```

#### 4.2.3 中间件

**认证中间件**:

```typescript
/**
 * 认证中间件
 * 
 * @description 处理用户认证，验证JWT令牌
 * 自动提取用户信息，设置认证上下文
 * 
 * @example
 * ```typescript
 * @Injectable()
 * export class AuthenticationMiddleware implements NestMiddleware {
 *   constructor(
 *     private readonly jwtService: JwtService
   ) {}
 * 
 *   public async use(req: Request, res: Response, next: NextFunction): Promise<void> {
 *     const token = this.extractToken(req);
 *     if (!token) {
 *       throw new UnauthorizedException('未提供认证令牌');
 *     }
 * 
 *     try {
 *       const payload = await this.jwtService.verifyAsync(token);
 *       req.user = payload;
 *       next();
 *     } catch (error) {
 *       throw new UnauthorizedException('认证令牌无效');
 *     }
 *   }
 * }
 * ```
 */
@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService
  ) {}
  
  public async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    // 认证逻辑
    next();
  }
}
```

#### 4.2.4 守卫

**认证守卫**:

```typescript
/**
 * 认证守卫
 * 
 * @description 保护需要认证的端点
 * 验证用户身份，确保请求的合法性
 * 
 * @example
 * ```typescript
 * @Injectable()
 * export class AuthenticationGuard implements CanActivate {
 *   constructor(
 *     private readonly jwtService: JwtService
 *   ) {}
 * 
 *   public canActivate(context: ExecutionContext): boolean {
 *     const request = context.switchToHttp().getRequest();
 *     const token = this.extractToken(request);
 *     
 *     if (!token) {
 *       throw new UnauthorizedException('未提供认证令牌');
 *     }
 * 
 *     try {
 *       const payload = this.jwtService.verify(token);
 *       request.user = payload;
 *       return true;
 *     } catch (error) {
 *       throw new UnauthorizedException('认证令牌无效');
 *     }
 *   }
 * }
 * ```
 */
@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService
  ) {}
  
  public canActivate(context: ExecutionContext): boolean {
    // 认证逻辑
    return true;
  }
}
```

---

## 5. 层间交互设计

### 5.1 依赖关系

```
Interface Layer (接口层)
    ↓ 调用
Application Layer (应用层)
    ↓ 调用
Domain Layer (领域层)
    ↑ 被调用
Infrastructure Layer (基础设施层)
```

### 5.2 交互模式

#### 5.2.1 请求处理流程

```
HTTP请求 → 接口层 → 应用层 → 领域层
                ↓
            基础设施层 ← 领域层
                ↓
            响应返回 ← 接口层
```

#### 5.2.2 事件处理流程

```
领域事件 → 应用层 → 事件总线 → 基础设施层
                ↓
            外部系统 ← 消息队列
```

### 5.3 数据流

#### 5.3.1 命令数据流

```
Command → UseCase → Domain → Repository → Database
    ↓
Event → EventBus → MessageQueue → External Systems
```

#### 5.3.2 查询数据流

```
Query → UseCase → Repository → Database
    ↓
Response ← UseCase ← Repository ← Database
```

---

## 6. 核心组件设计

### 6.1 组件关系图

```
┌─────────────────────────────────────────────────────────────────┐
│                    Core Components                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐  │
│  │  Interface  │  │Application  │  │Infrastructure│  │ Domain  │  │
│  │   Layer     │  │   Layer     │  │   Layer      │  │ Layer   │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                    Shared Components                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐  │
│  │   Events    │  │  Context    │  │ Validation  │  │  Utils  │  │
│  │   System    │  │ Management  │  │   System    │  │ System  │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 共享组件

#### 6.2.1 事件系统

- **领域事件**: 业务事件定义
- **事件总线**: 事件发布和订阅
- **事件存储**: 事件持久化
- **事件处理器**: 事件处理逻辑

#### 6.2.2 上下文管理

- **隔离上下文**: 多租户数据隔离
- **用户上下文**: 用户身份信息
- **请求上下文**: 请求级上下文管理
- **事务上下文**: 事务级上下文管理

#### 6.2.3 验证系统

- **输入验证**: 请求参数验证
- **业务规则验证**: 业务逻辑验证
- **权限验证**: 访问权限验证
- **数据完整性验证**: 数据一致性验证

#### 6.2.4 工具系统

- **通用工具**: 通用功能实现
- **类型工具**: 类型安全工具
- **转换工具**: 数据转换工具
- **验证工具**: 验证辅助工具

---

## 📝 总结

核心层详细设计为HL8 SAAS平台提供了清晰的架构层次和职责分离。通过四层架构的设计，确保了业务逻辑的独立性、技术实现的灵活性以及系统的可维护性。

各层之间的清晰边界和明确的交互模式，为业务模块的开发提供了统一的基础设施和开发模式，支持快速、高质量的软件开发。
