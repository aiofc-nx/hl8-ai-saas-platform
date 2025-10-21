# Application Kernel 应用层开发指南

> **版本**: 1.0.0 | **创建日期**: 2025-01-21 | **模块**: libs/application-kernel

---

## 📋 目录

- [1. 概述](#1-概述)
- [2. 核心架构](#2-核心架构)
- [3. 快速开始](#3-快速开始)
- [4. CQRS 模式开发](#4-cqrs-模式开发)
- [5. 上下文管理](#5-上下文管理)
- [6. 事件驱动架构](#6-事件驱动架构)
- [7. 事务管理](#7-事务管理)
- [8. 用例开发](#8-用例开发)
- [9. 验证框架](#9-验证框架)
- [10. 最佳实践](#10-最佳实践)
- [11. 常见问题](#11-常见问题)

---

## 1. 概述

### 1.1 Application Kernel 简介

`@hl8/application-kernel` 是一个基于 Clean Architecture 的应用层内核库，提供统一的 CQRS 模式、上下文管理和应用层基础设施。它为业务模块提供通用的基础组件，支持多租户隔离和框架无关设计。

### 1.2 核心特性

- **CQRS 模式**: 完整的命令查询分离实现
- **多租户支持**: 基于 `@hl8/domain-kernel` 的隔离上下文管理
- **事件驱动**: 支持领域事件和集成事件
- **事务管理**: 完整的事务生命周期管理
- **验证框架**: 全面的数据验证和安全检查
- **框架无关**: 支持 NestJS、Express 等框架

### 1.3 设计原则

- **用例为中心**: 以业务用例为核心设计
- **依赖倒置**: 依赖抽象而非具体实现
- **单一职责**: 每个组件只负责一个职责
- **开闭原则**: 对扩展开放，对修改关闭

---

## 2. 核心架构

### 2.1 架构图

```text
┌─────────────────────────────────────────────────────────────┐
│                    Application Kernel                       │
├─────────────────────────────────────────────────────────────┤
│  CQRS Layer                                                 │
│  ├── Commands (BaseCommand)                                 │
│  ├── Queries (BaseQuery)                                    │
│  ├── Command Handlers                                        │
│  └── Query Handlers                                         │
├─────────────────────────────────────────────────────────────┤
│  Use Cases Layer                                            │
│  ├── BaseUseCase                                            │
│  ├── BaseCommandUseCase                                     │
│  └── Use Case Implementations                               │
├─────────────────────────────────────────────────────────────┤
│  Context Management                                          │
│  ├── Isolation Context                                      │
│  ├── User Context                                           │
│  └── Security Validation                                    │
├─────────────────────────────────────────────────────────────┤
│  Event System                                               │
│  ├── Event Publishing                                       │
│  ├── Event Subscription                                     │
│  └── Event Sourcing                                         │
├─────────────────────────────────────────────────────────────┤
│  Transaction Management                                      │
│  ├── Transaction Manager                                    │
│  ├── Isolation Utils                                        │
│  └── Rollback Utils                                         │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 核心组件

| 组件 | 职责 | 位置 |
|------|------|------|
| `BaseCommand` | 命令基类 | `src/cqrs/commands/` |
| `BaseQuery` | 查询基类 | `src/cqrs/queries/` |
| `BaseUseCase` | 用例基类 | `src/use-cases/` |
| `IsolationContext` | 隔离上下文 | 来自 `@hl8/domain-kernel` |
| `IEventBus` | 事件总线接口 | `src/events/` |
| `ITransactionManager` | 事务管理器接口 | `src/transactions/` |

---

## 3. 快速开始

### 3.1 安装依赖

```bash
npm install @hl8/application-kernel @hl8/domain-kernel
```

### 3.2 基本使用

```typescript
import { 
  BaseCommand, 
  BaseQuery, 
  BaseUseCase,
  IsolationContext,
  EntityId 
} from '@hl8/application-kernel';
import { TenantId, UserId } from '@hl8/domain-kernel';

// 创建命令
export class CreateUserCommand extends BaseCommand {
  constructor(
    public readonly email: string,
    public readonly username: string,
    isolationContext?: IsolationContext,
  ) {
    super('CreateUserCommand', '创建用户命令', isolationContext);
  }
}

// 创建查询
export class GetUserQuery extends BaseQuery {
  constructor(
    public readonly userId: UserId,
    isolationContext?: IsolationContext,
  ) {
    super('GetUserQuery', '获取用户查询', isolationContext);
  }
}

// 创建用例
export class CreateUserUseCase extends BaseUseCase {
  async execute(command: CreateUserCommand): Promise<EntityId> {
    // 实现用例逻辑
    return EntityId.generate();
  }
}
```

---

## 4. CQRS 模式开发

### 4.1 命令开发

#### 4.1.1 命令设计原则

- **不可变性**: 命令对象创建后不可修改
- **自描述性**: 命令名称和属性清晰表达意图
- **上下文感知**: 包含必要的隔离上下文信息

#### 4.1.2 命令实现示例

```typescript
import { BaseCommand } from '@hl8/application-kernel';
import { IsolationContext, TenantId, UserId } from '@hl8/domain-kernel';

export class CreateUserCommand extends BaseCommand {
  constructor(
    public readonly email: string,
    public readonly username: string,
    public readonly password: string,
    public readonly profile: UserProfileData,
    isolationContext?: IsolationContext,
  ) {
    super('CreateUserCommand', '创建用户命令', isolationContext);
  }
}

export class UpdateUserCommand extends BaseCommand {
  constructor(
    public readonly userId: UserId,
    public readonly updates: Partial<UserProfileData>,
    isolationContext?: IsolationContext,
  ) {
    super('UpdateUserCommand', '更新用户命令', isolationContext);
  }
}
```

#### 4.1.3 命令验证

```typescript
import { BaseCommand } from '@hl8/application-kernel';

export class CreateUserCommand extends BaseCommand {
  constructor(
    public readonly email: string,
    public readonly username: string,
    public readonly password: string,
    isolationContext?: IsolationContext,
  ) {
    super('CreateUserCommand', '创建用户命令', isolationContext);
    
    // ✅ 正确：应用层只验证命令结构，不验证业务规则
    this.validateCommandStructure();
  }
  
  private validateCommandStructure(): void {
    // 验证命令结构完整性
    if (!this.email) {
      throw new Error('邮箱参数不能为空');
    }
    
    if (!this.username) {
      throw new Error('用户名参数不能为空');
    }
    
    if (!this.password) {
      throw new Error('密码参数不能为空');
    }
    
    // ❌ 不要在这里验证业务规则，如邮箱格式、密码强度等
    // 这些应该在领域层或接口层验证
  }
}
```

**注意**: 业务规则验证（如邮箱格式、密码强度）应该在以下层级进行：

- **接口层**: 输入格式验证
- **领域层**: 业务规则验证
- **应用层**: 只验证命令结构完整性

### 4.2 查询开发

#### 4.2.1 查询设计原则

- **只读性**: 查询不改变系统状态
- **性能优化**: 针对读取场景优化
- **缓存友好**: 支持缓存策略

#### 4.2.2 查询实现示例

```typescript
import { BaseQuery } from '@hl8/application-kernel';
import { IsolationContext, UserId, TenantId } from '@hl8/domain-kernel';

export class GetUserQuery extends BaseQuery {
  constructor(
    public readonly userId: UserId,
    isolationContext?: IsolationContext,
  ) {
    super('GetUserQuery', '获取用户查询', isolationContext);
  }
}

export class GetUserListQuery extends BaseQuery {
  constructor(
    public readonly tenantId: TenantId,
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly filters?: UserFilters,
    isolationContext?: IsolationContext,
  ) {
    super('GetUserListQuery', '获取用户列表查询', isolationContext);
  }
}
```

### 4.3 处理器开发

#### 4.3.1 命令处理器

```typescript
import { CommandHandler } from '@hl8/application-kernel';
import { CreateUserCommand } from './create-user.command';
import { UserRepository } from '../repositories/user.repository';
import { EventBus } from '../events/event-bus';

export class CreateUserHandler implements CommandHandler<CreateUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
  ) {}
  
  async handle(command: CreateUserCommand): Promise<void> {
    // 1. 验证命令
    this.validateCommand(command);
    
    // 2. 执行业务逻辑
    const user = await this.createUser(command);
    
    // 3. 保存到仓库
    await this.userRepository.save(user);
    
    // 4. 发布事件
    await this.eventBus.publishAll(user.getUncommittedEvents());
  }
  
  private validateCommand(command: CreateUserCommand): void {
    // 命令验证逻辑
  }
  
  private async createUser(command: CreateUserCommand): Promise<User> {
    // 用户创建逻辑
  }
}
```

#### 4.3.2 查询处理器

```typescript
import { QueryHandler } from '@hl8/application-kernel';
import { GetUserQuery } from './get-user.query';
import { UserRepository } from '../repositories/user.repository';

export class GetUserHandler implements QueryHandler<GetUserQuery, UserDto> {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}
  
  async handle(query: GetUserQuery): Promise<UserDto> {
    // 1. 验证查询
    this.validateQuery(query);
    
    // 2. 执行查询
    const user = await this.userRepository.findById(query.userId);
    
    if (!user) {
      throw new Error('用户不存在');
    }
    
    // 3. 转换为DTO
    return this.toDto(user);
  }
  
  private validateQuery(query: GetUserQuery): void {
    // 查询验证逻辑
  }
  
  private toDto(user: User): UserDto {
    // DTO转换逻辑
  }
}
```

---

## 5. 上下文管理

### 5.1 隔离上下文

#### 5.1.1 上下文创建

```typescript
import { IsolationContext } from '@hl8/domain-kernel';
import { TenantId, OrganizationId, DepartmentId, UserId } from '@hl8/domain-kernel';

// 平台级上下文
const platformContext = IsolationContext.createPlatform();

// 租户级上下文
const tenantContext = IsolationContext.createTenant(
  TenantId.create('tenant-123')
);

// 组织级上下文
const orgContext = IsolationContext.createOrganization(
  TenantId.create('tenant-123'),
  OrganizationId.create('org-456')
);

// 部门级上下文
const deptContext = IsolationContext.createDepartment(
  TenantId.create('tenant-123'),
  OrganizationId.create('org-456'),
  DepartmentId.create('dept-789')
);

// 用户级上下文
const userContext = IsolationContext.createUser(
  TenantId.create('tenant-123'),
  OrganizationId.create('org-456'),
  DepartmentId.create('dept-789'),
  UserId.create('user-001')
);
```

#### 5.1.2 上下文验证

```typescript
import { ContextSecurityValidator } from '@hl8/application-kernel';

// 安全验证
const securityResult = ContextSecurityValidator.validateSecurity(
  useCaseContext,
  isolationContext
);

if (securityResult.securityLevel === 'critical') {
  throw new Error('安全级别过高，拒绝执行');
}

// 租户验证
const tenantResult = TenantContextValidator.validateTenantContext(
  useCaseContext,
  isolationContext
);

if (!tenantResult.isValid) {
  throw new Error('租户上下文验证失败');
}
```

### 5.2 用户上下文

#### 5.2.1 用户上下文管理

```typescript
import { UserContextUtils } from '@hl8/application-kernel';

// 创建用户上下文
const userContext = UserContextUtils.createUserContext({
  userId: 'user-123',
  tenantId: 'tenant-456',
  organizationId: 'org-789',
  roles: ['admin', 'user'],
  permissions: ['read', 'write']
});

// 验证用户权限
const hasPermission = UserContextUtils.hasPermission(
  userContext,
  'user:write'
);

// 检查角色
const hasRole = UserContextUtils.hasRole(
  userContext,
  'admin'
);
```

### 5.3 上下文传播

#### 5.3.1 异步上下文传播

```typescript
import { ContextPropagationUtils } from '@hl8/application-kernel';

// 在异步操作中传播上下文
async function processUserData(userId: string) {
  return await ContextPropagationUtils.propagateContext(
    async () => {
      // 异步操作逻辑
      const user = await userRepository.findById(userId);
      return await processUser(user);
    },
    {
      propagateTenant: true,
      propagateUser: true,
      propagateRequestId: true
    }
  );
}
```

---

## 6. 事件驱动架构

### 6.1 事件发布

#### 6.1.1 事件定义

```typescript
import { DomainEvent } from '@hl8/domain-kernel';

export class UserCreatedEvent implements DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly username: string,
    public readonly timestamp: Date = new Date(),
  ) {}
  
  getEventType(): string {
    return 'UserCreated';
  }
  
  getAggregateId(): string {
    return this.userId;
  }
}
```

#### 6.1.2 事件发布

```typescript
import { EventPublisher } from '@hl8/application-kernel';

export class UserService {
  constructor(
    private readonly eventPublisher: EventPublisher,
  ) {}
  
  async createUser(userData: CreateUserData): Promise<void> {
    // 创建用户
    const user = await this.createUserEntity(userData);
    
    // 发布事件
    await this.eventPublisher.publishEvent(
      new UserCreatedEvent(
        user.getId(),
        user.getEmail(),
        user.getUsername()
      )
    );
  }
}
```

### 6.2 事件订阅

#### 6.2.1 事件处理器

```typescript
import { EventHandler } from '@hl8/application-kernel';

export class UserCreatedHandler implements EventHandler<UserCreatedEvent> {
  constructor(
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationService,
  ) {}
  
  async handle(event: UserCreatedEvent): Promise<void> {
    // 发送欢迎邮件
    await this.emailService.sendWelcomeEmail(
      event.email,
      event.username
    );
    
    // 发送通知
    await this.notificationService.notifyUserCreated(event.userId);
  }
}
```

#### 6.2.2 事件订阅管理

```typescript
import { EventSubscriptionManager } from '@hl8/application-kernel';

export class EventService {
  constructor(
    private readonly subscriptionManager: EventSubscriptionManager,
  ) {}
  
  async setupSubscriptions(): Promise<void> {
    // 订阅用户创建事件
    await this.subscriptionManager.subscribe(
      'UserCreated',
      new UserCreatedHandler()
    );
    
    // 订阅用户更新事件
    await this.subscriptionManager.subscribe(
      'UserUpdated',
      new UserUpdatedHandler()
    );
  }
}
```

### 6.3 事件溯源

#### 6.3.1 事件存储

```typescript
import { EventSourcingUtils } from '@hl8/application-kernel';

export class UserAggregate {
  private events: DomainEvent[] = [];
  
  constructor(
    private readonly id: string,
    private email: string,
    private username: string,
  ) {}
  
  changeEmail(newEmail: string): void {
    this.email = newEmail;
    this.addEvent(new UserEmailChangedEvent(this.id, newEmail));
  }
  
  private addEvent(event: DomainEvent): void {
    this.events.push(event);
  }
  
  getUncommittedEvents(): DomainEvent[] {
    return [...this.events];
  }
  
  markEventsAsCommitted(): void {
    this.events = [];
  }
}
```

---

## 7. 事务管理

### 7.1 事务管理器

#### 7.1.1 基本事务操作

```typescript
import { TransactionManager } from '@hl8/application-kernel';

export class UserService {
  constructor(
    private readonly transactionManager: TransactionManager,
    private readonly userRepository: UserRepository,
  ) {}
  
  async createUserWithProfile(userData: CreateUserData): Promise<void> {
    await this.transactionManager.executeInTransaction(async () => {
      // 创建用户
      const user = await this.createUser(userData);
      await this.userRepository.save(user);
      
      // 创建用户资料
      const profile = await this.createProfile(user.getId(), userData.profile);
      await this.profileRepository.save(profile);
      
      // 发布事件
      await this.eventBus.publishAll(user.getUncommittedEvents());
    });
  }
}
```

#### 7.1.2 事务隔离

```typescript
import { TransactionIsolationUtils } from '@hl8/application-kernel';

export class OrderService {
  async processOrder(orderId: string): Promise<void> {
    await this.transactionManager.executeInTransaction(
      async () => {
        // 订单处理逻辑
        await this.processOrderLogic(orderId);
      },
      {
        isolationLevel: 'READ_COMMITTED',
        timeout: 30000
      }
    );
  }
}
```

### 7.2 事务回滚

#### 7.2.1 自动回滚

```typescript
import { TransactionRollbackUtils } from '@hl8/application-kernel';

export class PaymentService {
  async processPayment(paymentData: PaymentData): Promise<void> {
    try {
      await this.transactionManager.executeInTransaction(async () => {
        // 扣款
        await this.deductAmount(paymentData.amount);
        
        // 更新订单状态
        await this.updateOrderStatus(paymentData.orderId, 'PAID');
        
        // 发送确认邮件
        await this.sendConfirmationEmail(paymentData.email);
      });
    } catch (error) {
      // 自动回滚，无需手动处理
      console.error('支付处理失败，事务已回滚:', error);
      throw error;
    }
  }
}
```

#### 7.2.2 手动回滚

```typescript
export class ComplexService {
  async processComplexOperation(data: ComplexData): Promise<void> {
    const transaction = await this.transactionManager.beginTransaction();
    
    try {
      // 步骤1
      await this.step1(data);
      
      // 步骤2
      await this.step2(data);
      
      // 步骤3
      await this.step3(data);
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
```

---

## 8. 用例开发

### 8.1 用例基类

#### 8.1.1 基本用例

```typescript
import { BaseUseCase } from '@hl8/application-kernel';

export class CreateUserUseCase extends BaseUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
  ) {
    super();
  }
  
  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    // 1. 验证输入
    this.validateInput(input);
    
    // 2. 执行业务逻辑
    const user = await this.createUser(input);
    
    // 3. 保存到仓库
    await this.userRepository.save(user);
    
    // 4. 发布事件
    await this.eventBus.publishAll(user.getUncommittedEvents());
    
    // 5. 返回结果
    return new CreateUserOutput(user.getId());
  }
  
  private validateInput(input: CreateUserInput): void {
    if (!input.email || !input.username) {
      throw new Error('邮箱和用户名不能为空');
    }
  }
  
  private async createUser(input: CreateUserInput): Promise<User> {
    // 用户创建逻辑
  }
}
```

#### 8.1.2 命令用例

```typescript
import { BaseCommandUseCase } from '@hl8/application-kernel';

export class CreateUserCommandUseCase extends BaseCommandUseCase<CreateUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
  ) {
    super();
  }
  
  async execute(command: CreateUserCommand): Promise<void> {
    // 1. 验证命令
    this.validateCommand(command);
    
    // 2. 创建用户
    const user = await this.createUser(command);
    
    // 3. 保存用户
    await this.userRepository.save(user);
    
    // 4. 发布事件
    await this.eventBus.publishAll(user.getUncommittedEvents());
  }
  
  private validateCommand(command: CreateUserCommand): void {
    // 命令验证逻辑
  }
  
  private async createUser(command: CreateUserCommand): Promise<User> {
    // 用户创建逻辑
  }
}
```

### 8.2 用例协调

#### 8.2.1 复杂用例协调

```typescript
export class UserRegistrationUseCase extends BaseUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly emailService: EmailService,
    private readonly eventBus: EventBus,
  ) {
    super();
  }
  
  async execute(input: UserRegistrationInput): Promise<UserRegistrationOutput> {
    // 1. 创建用户
    const user = await this.createUser(input);
    await this.userRepository.save(user);
    
    // 2. 创建用户资料
    const profile = await this.createProfile(user.getId(), input.profile);
    await this.profileRepository.save(profile);
    
    // 3. 发送欢迎邮件
    await this.emailService.sendWelcomeEmail(user.getEmail());
    
    // 4. 发布事件
    await this.eventBus.publishAll(user.getUncommittedEvents());
    
    return new UserRegistrationOutput(user.getId());
  }
}
```

---

## 9. 验证框架

### 9.1 模式合规性验证

#### 9.1.1 自动验证

```typescript
import { PatternComplianceValidator } from '@hl8/application-kernel';

export class UserModuleValidator {
  async validateModule(): Promise<void> {
    const validator = new PatternComplianceValidator();
    
    const result = await validator.validateModule('UserModule');
    
    if (!result.isCompliant) {
      console.error('模块不符合规范:', result.violations);
      throw new Error('模块验证失败');
    }
  }
}
```

#### 9.1.2 接口合规性验证

```typescript
import { InterfaceComplianceValidator } from '@hl8/application-kernel';

export class HandlerValidator {
  async validateHandlers(): Promise<void> {
    const validator = new InterfaceComplianceValidator();
    
    const result = await validator.validateHandlers([
      CreateUserHandler,
      UpdateUserHandler,
      GetUserHandler
    ]);
    
    if (!result.isCompliant) {
      console.error('处理器不符合接口规范:', result.violations);
    }
  }
}
```

### 9.2 上下文验证

#### 9.2.1 安全验证

```typescript
import { ContextSecurityValidator } from '@hl8/application-kernel';

export class SecurityService {
  async validateContext(context: IUseCaseContext): Promise<boolean> {
    const result = ContextSecurityValidator.validateSecurity(context);
    
    if (result.securityLevel === 'critical') {
      throw new Error('安全级别过高，拒绝执行');
    }
    
    return result.threats.length === 0;
  }
}
```

#### 9.2.2 租户验证

```typescript
import { TenantContextValidator } from '@hl8/application-kernel';

export class TenantService {
  async validateTenantAccess(
    context: IUseCaseContext,
    targetTenantId: string
  ): Promise<boolean> {
    const result = TenantContextValidator.validateTenantIsolation(
      context,
      targetTenantId
    );
    
    return result.isValid;
  }
}
```

---

## 10. 最佳实践

### 10.1 代码组织

#### 10.1.1 目录结构

```text
src/
├── commands/           # 命令定义
│   ├── create-user.command.ts
│   └── update-user.command.ts
├── queries/            # 查询定义
│   ├── get-user.query.ts
│   └── get-user-list.query.ts
├── handlers/           # 处理器实现
│   ├── commands/
│   │   ├── create-user.handler.ts
│   │   └── update-user.handler.ts
│   └── queries/
│       ├── get-user.handler.ts
│       └── get-user-list.handler.ts
├── use-cases/          # 用例实现
│   ├── create-user.use-case.ts
│   └── update-user.use-case.ts
├── events/             # 事件定义和处理
│   ├── user-created.event.ts
│   └── handlers/
│       └── user-created.handler.ts
└── services/           # 应用服务
    ├── user.service.ts
    └── user-profile.service.ts
```

#### 10.1.2 命名规范

```typescript
// 命令命名: {Action}{Entity}Command
export class CreateUserCommand extends BaseCommand {}
export class UpdateUserCommand extends BaseCommand {}
export class DeleteUserCommand extends BaseCommand {}

// 查询命名: {Action}{Entity}Query
export class GetUserQuery extends BaseQuery {}
export class GetUserListQuery extends BaseQuery {}
export class SearchUsersQuery extends BaseQuery {}

// 用例命名: {Action}{Entity}UseCase
export class CreateUserUseCase extends BaseUseCase {}
export class UpdateUserUseCase extends BaseUseCase {}

// 事件命名: {Entity}{Action}Event
export class UserCreatedEvent implements DomainEvent {}
export class UserUpdatedEvent implements DomainEvent {}
```

### 10.2 错误处理

#### 10.2.1 统一错误处理

```typescript
export class ApplicationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class BusinessError extends ApplicationError {
  constructor(message: string) {
    super(message, 'BUSINESS_ERROR', 422);
  }
}
```

#### 10.2.2 错误处理中间件

```typescript
export class ErrorHandler {
  static handle(error: Error): ApplicationError {
    if (error instanceof ApplicationError) {
      return error;
    }
    
    if (error instanceof ValidationError) {
      return new ValidationError(error.message);
    }
    
    return new ApplicationError(
      'Internal server error',
      'INTERNAL_ERROR',
      500
    );
  }
}
```

### 10.3 性能优化

#### 10.3.1 查询优化

```typescript
export class GetUserListHandler implements QueryHandler<GetUserListQuery, UserListDto> {
  async handle(query: GetUserListQuery): Promise<UserListDto> {
    // 使用分页
    const users = await this.userRepository.findMany({
      tenantId: query.tenantId,
      page: query.page,
      limit: query.limit,
      filters: query.filters
    });
    
    // 使用投影减少数据传输
    const userDtos = users.map(user => ({
      id: user.getId(),
      email: user.getEmail(),
      username: user.getUsername(),
      // 不包含敏感信息
    }));
    
    return {
      users: userDtos,
      total: users.total,
      page: query.page,
      limit: query.limit
    };
  }
}
```

#### 10.3.2 缓存策略

```typescript
export class CachedUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cache: CacheService,
  ) {}
  
  async getUser(userId: string): Promise<UserDto> {
    const cacheKey = `user:${userId}`;
    
    // 尝试从缓存获取
    let user = await this.cache.get<UserDto>(cacheKey);
    
    if (!user) {
      // 从数据库获取
      const userEntity = await this.userRepository.findById(userId);
      user = this.toDto(userEntity);
      
      // 缓存结果
      await this.cache.set(cacheKey, user, 300); // 5分钟缓存
    }
    
    return user;
  }
}
```

### 10.4 测试策略

#### 10.4.1 单元测试

```typescript
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockEventBus: jest.Mocked<EventBus>;
  
  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockEventBus = createMockEventBus();
    useCase = new CreateUserUseCase(mockUserRepository, mockEventBus);
  });
  
  it('should create user successfully', async () => {
    // Arrange
    const input = new CreateUserInput('test@example.com', 'testuser');
    const expectedUser = new User('user-123', 'test@example.com', 'testuser');
    
    mockUserRepository.save.mockResolvedValue(undefined);
    mockEventBus.publishAll.mockResolvedValue(undefined);
    
    // Act
    const result = await useCase.execute(input);
    
    // Assert
    expect(result.userId).toBe('user-123');
    expect(mockUserRepository.save).toHaveBeenCalledWith(expect.any(User));
    expect(mockEventBus.publishAll).toHaveBeenCalled();
  });
  
  it('should throw error for invalid input', async () => {
    // Arrange
    const input = new CreateUserInput('', 'testuser');
    
    // Act & Assert
    await expect(useCase.execute(input)).rejects.toThrow('邮箱不能为空');
  });
});
```

#### 10.4.2 集成测试

```typescript
describe('User Module Integration', () => {
  let app: Application;
  let userService: UserService;
  
  beforeAll(async () => {
    app = await createTestApplication();
    userService = app.get<UserService>(UserService);
  });
  
  afterAll(async () => {
    await app.close();
  });
  
  it('should handle complete user creation flow', async () => {
    // 1. 创建用户
    const createCommand = new CreateUserCommand(
      'test@example.com',
      'testuser',
      'password123'
    );
    
    await userService.createUser(createCommand);
    
    // 2. 查询用户
    const getUserQuery = new GetUserQuery('user-123');
    const user = await userService.getUser(getUserQuery);
    
    expect(user.email).toBe('test@example.com');
    expect(user.username).toBe('testuser');
  });
});
```

---

## 11. 常见问题

### 11.1 架构问题

#### Q: 如何选择合适的隔离级别？

A: 隔离级别的选择取决于业务需求：

- **PLATFORM**: 系统级操作，如用户管理、租户管理
- **TENANT**: 租户级操作，如租户内的业务逻辑
- **ORGANIZATION**: 组织级操作，如部门管理
- **DEPARTMENT**: 部门级操作，如团队管理
- **USER**: 用户级操作，如个人设置

```typescript
// 平台级操作
const platformContext = IsolationContext.createPlatform();

// 租户级操作
const tenantContext = IsolationContext.createTenant(tenantId);

// 用户级操作
const userContext = IsolationContext.createUser(tenantId, orgId, deptId, userId);
```

#### Q: 如何处理跨聚合的事务？

A: 使用应用服务协调多个聚合：

```typescript
export class OrderProcessingService {
  async processOrder(orderData: OrderData): Promise<void> {
    await this.transactionManager.executeInTransaction(async () => {
      // 1. 创建订单
      const order = await this.createOrder(orderData);
      
      // 2. 扣减库存
      await this.reduceInventory(order.items);
      
      // 3. 处理支付
      await this.processPayment(order.payment);
      
      // 4. 发布事件
      await this.eventBus.publishAll([
        ...order.getUncommittedEvents(),
        ...inventory.getUncommittedEvents()
      ]);
    });
  }
}
```

### 11.2 性能问题

#### Q: 如何处理大量数据的查询？

A: 使用分页和投影：

```typescript
export class GetUserListQuery extends BaseQuery {
  constructor(
    public readonly tenantId: TenantId,
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly filters?: UserFilters,
    isolationContext?: IsolationContext,
  ) {
    super('GetUserListQuery', '获取用户列表查询', isolationContext);
  }
}

export class GetUserListHandler implements QueryHandler<GetUserListQuery, UserListDto> {
  async handle(query: GetUserListQuery): Promise<UserListDto> {
    // 使用分页查询
    const result = await this.userRepository.findMany({
      tenantId: query.tenantId,
      page: query.page,
      limit: query.limit,
      filters: query.filters,
      // 只选择需要的字段
      select: ['id', 'email', 'username', 'createdAt']
    });
    
    return {
      users: result.data,
      total: result.total,
      page: query.page,
      limit: query.limit
    };
  }
}
```

#### Q: 如何优化事件处理性能？

A: 使用异步处理和批量操作：

```typescript
export class EventProcessor {
  private readonly batchSize = 100;
  private readonly processingQueue: DomainEvent[] = [];
  
  async processEvents(events: DomainEvent[]): Promise<void> {
    // 批量处理事件
    const batches = this.chunkArray(events, this.batchSize);
    
    for (const batch of batches) {
      await this.processBatch(batch);
    }
  }
  
  private async processBatch(events: DomainEvent[]): Promise<void> {
    // 并行处理批次内的事件
    await Promise.all(
      events.map(event => this.processEvent(event))
    );
  }
  
  private async processEvent(event: DomainEvent): Promise<void> {
    // 事件处理逻辑
  }
}
```

### 11.3 调试问题

#### Q: 如何调试复杂的用例流程？

A: 使用日志和追踪：

```typescript
export class CreateUserUseCase extends BaseUseCase {
  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    const requestId = this.generateRequestId();
    
    this.logger.info('开始创建用户', {
      requestId,
      email: input.email,
      username: input.username
    });
    
    try {
      // 1. 验证输入
      this.logger.debug('验证输入参数', { requestId });
      this.validateInput(input);
      
      // 2. 创建用户
      this.logger.debug('创建用户实体', { requestId });
      const user = await this.createUser(input);
      
      // 3. 保存用户
      this.logger.debug('保存用户到仓库', { requestId, userId: user.getId() });
      await this.userRepository.save(user);
      
      // 4. 发布事件
      this.logger.debug('发布用户创建事件', { requestId, userId: user.getId() });
      await this.eventBus.publishAll(user.getUncommittedEvents());
      
      this.logger.info('用户创建成功', {
        requestId,
        userId: user.getId()
      });
      
      return new CreateUserOutput(user.getId());
    } catch (error) {
      this.logger.error('用户创建失败', {
        requestId,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
}
```

---

## 📚 相关资源

- [Domain Kernel 文档](../domain-kernel/docs/)
- [架构设计指南](./ARCHITECTURE_GUIDE.md)
- [API 参考](./API_REFERENCE.md)
- [示例项目](../examples/)

---

**版本历史**:

- v1.0.0 (2025-01-21): 初始版本，完整的应用层开发指南
