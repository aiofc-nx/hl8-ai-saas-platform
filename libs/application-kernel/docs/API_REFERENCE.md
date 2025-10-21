# Application Kernel API 参考

> **版本**: 1.0.0 | **创建日期**: 2025-01-21

---

## 📋 目录

- [核心类](#核心类)
- [CQRS 组件](#cqrs-组件)
- [上下文管理](#上下文管理)
- [事件系统](#事件系统)
- [事务管理](#事务管理)
- [验证框架](#验证框架)
- [工具类](#工具类)

---

## 核心类

### BaseCommand

命令基类，所有命令都应该继承此类。

```typescript
export class BaseCommand {
  constructor(
    public readonly commandType: string,
    public readonly description: string,
    public readonly isolationContext?: IsolationContext,
  ) {}
  
  readonly commandId: string;
  readonly timestamp: Date;
}
```

**示例**:

```typescript
export class CreateUserCommand extends BaseCommand {
  constructor(
    public readonly email: string,
    public readonly username: string,
    isolationContext?: IsolationContext,
  ) {
    super('CreateUserCommand', '创建用户命令', isolationContext);
  }
}
```

### BaseQuery

查询基类，所有查询都应该继承此类。

```typescript
export class BaseQuery {
  constructor(
    public readonly queryType: string,
    public readonly description: string,
    public readonly isolationContext?: IsolationContext,
  ) {}
  
  readonly queryId: string;
  readonly timestamp: Date;
}
```

**示例**:

```typescript
export class GetUserQuery extends BaseQuery {
  constructor(
    public readonly userId: UserId,
    isolationContext?: IsolationContext,
  ) {
    super('GetUserQuery', '获取用户查询', isolationContext);
  }
}
```

### BaseUseCase

用例基类，提供用例的基础功能。

```typescript
export abstract class BaseUseCase {
  protected readonly requiredPermissions: string[] = [];
  
  abstract execute(input: any): Promise<any>;
  
  protected async validatePermissions(context: IUseCaseContext): Promise<void>;
  protected async validateInput(input: any): Promise<void>;
}
```

**示例**:

```typescript
export class CreateUserUseCase extends BaseUseCase {
  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    await this.validateInput(input);
    // 实现用例逻辑
  }
}
```

---

## CQRS 组件

### CommandHandler

命令处理器接口。

```typescript
export interface CommandHandler<TCommand> {
  handle(command: TCommand): Promise<void>;
}
```

### QueryHandler

查询处理器接口。

```typescript
export interface QueryHandler<TQuery, TResult> {
  handle(query: TQuery): Promise<TResult>;
}
```

### BaseCommandUseCase

命令用例基类。

```typescript
export abstract class BaseCommandUseCase<TCommand> extends BaseUseCase {
  abstract execute(command: TCommand): Promise<void>;
}
```

---

## 上下文管理

### IUseCaseContext

用例上下文接口。

```typescript
export interface IUseCaseContext {
  readonly requestId: string;
  readonly timestamp: Date;
  readonly tenant?: TenantContext;
  readonly user?: UserContext;
  readonly metadata?: Record<string, any>;
}
```

### ContextUtils

上下文工具类。

```typescript
export class ContextUtils {
  static createContext(options: ContextOptions): IUseCaseContext;
  static mergeContexts(...contexts: IUseCaseContext[]): IUseCaseContext;
  static extractContext<T>(context: IUseCaseContext, key: string): T | undefined;
}
```

### ContextSecurityValidator

上下文安全验证器。

```typescript
export class ContextSecurityValidator {
  static validateSecurity(
    context: IUseCaseContext,
    isolationContext?: IsolationContext,
  ): SecurityValidationResult;
  
  static validateSensitiveData(context: IUseCaseContext): SecurityValidationResult;
  static validatePermissionSecurity(context: IUseCaseContext): SecurityValidationResult;
}
```

### TenantContextValidator

租户上下文验证器。

```typescript
export class TenantContextValidator {
  static validateTenantContext(
    context: IUseCaseContext,
    isolationContext?: IsolationContext,
  ): TenantContextValidationResult;
  
  static validateTenantIsolation(
    context: IUseCaseContext,
    targetTenantId: string,
  ): TenantContextValidationResult;
}
```

---

## 事件系统

### IEventBus

事件总线接口。

```typescript
export interface IEventBus {
  publish<T>(event: T): Promise<void>;
  publishAll(events: any[]): Promise<void>;
  subscribe<T>(eventType: string, handler: EventHandler<T>): void;
  unsubscribe(eventType: string, handler: EventHandler<any>): void;
}
```

### EventPublisher

事件发布器。

```typescript
export class EventPublisher {
  constructor(private readonly eventBus: IEventBus) {}
  
  async publishEvent<T>(event: T, options?: PublishOptions): Promise<void>;
  async publishEvents<T>(events: T[], options?: PublishOptions): Promise<void>;
  async publishEventAsync<T>(event: T, options?: PublishOptions): Promise<void>;
}
```

### EventSubscriptionManager

事件订阅管理器。

```typescript
export class EventSubscriptionManager {
  subscribe<T>(eventType: string, handler: EventHandler<T>): string;
  unsubscribe(subscriptionId: string): void;
  unsubscribeAll(): void;
  getSubscriptionsByEventType(eventType: string): EventSubscription[];
}
```

### EventSourcingUtils

事件溯源工具。

```typescript
export class EventSourcingUtils {
  static createSnapshot<T>(aggregate: T, version: number): Snapshot<T>;
  static restoreFromSnapshot<T>(snapshot: Snapshot<T>): T;
  static shouldCreateSnapshot(version: number, interval: number): boolean;
}
```

---

## 事务管理

### ITransactionManager

事务管理器接口。

```typescript
export interface ITransactionManager {
  beginTransaction(): Promise<Transaction>;
  executeInTransaction<T>(fn: () => Promise<T>): Promise<T>;
  isActive(): boolean;
}
```

### TransactionManagerUtils

事务管理器工具。

```typescript
export class TransactionManagerUtils {
  static createTransactionManager(options: TransactionOptions): ITransactionManager;
  static validateTransactionBoundary(transactionManager: ITransactionManager): ValidationResult;
}
```

### TransactionIsolationUtils

事务隔离工具。

```typescript
export class TransactionIsolationUtils {
  static setIsolationLevel(level: IsolationLevel): void;
  static enableDeadlockDetection(transactionManager: ITransactionManager): Promise<void>;
  static detectDeadlock(transactionManager: ITransactionManager): Promise<boolean>;
  static resolveDeadlock(transactionManager: ITransactionManager): Promise<boolean>;
}
```

### TransactionRollbackUtils

事务回滚工具。

```typescript
export class TransactionRollbackUtils {
  static createRollbackStrategy(strategy: RollbackStrategy): RollbackHandler;
  static executeWithRollback<T>(
    operation: () => Promise<T>,
    rollbackHandler: RollbackHandler,
  ): Promise<T>;
}
```

---

## 验证框架

### PatternComplianceValidator

模式合规性验证器。

```typescript
export class PatternComplianceValidator {
  static validateModule(moduleName: string): Promise<PatternComplianceResult>;
  static validateCommand(commandClass: any): PatternComplianceResult;
  static validateQuery(queryClass: any): PatternComplianceResult;
  static validateUseCase(useCaseClass: any): PatternComplianceResult;
}
```

### InterfaceComplianceValidator

接口合规性验证器。

```typescript
export class InterfaceComplianceValidator {
  static validateHandlers(handlers: any[]): InterfaceComplianceResult;
  static validateUseCases(useCases: any[]): InterfaceComplianceResult;
  static validateServices(services: any[]): InterfaceComplianceResult;
}
```

### BaseClassValidator

基础类验证器。

```typescript
export class BaseClassValidator {
  static validateCommandClass(commandClass: any): ValidationResult;
  static validateQueryClass(queryClass: any): ValidationResult;
  static validateUseCaseClass(useCaseClass: any): ValidationResult;
}
```

---

## 工具类

### ContextCleanupUtils

上下文清理工具。

```typescript
export class ContextCleanupUtils {
  static cleanupContext(context: IUseCaseContext): IUseCaseContext;
  static cleanupCircularReferences(obj: any): any;
  static resetContext(): void;
}
```

### ContextPropagationUtils

上下文传播工具。

```typescript
export class ContextPropagationUtils {
  static propagateContext<T>(
    operation: () => Promise<T>,
    options?: ContextPropagationOptions,
  ): Promise<T>;
  static createChildContext(
    parentContext: IUseCaseContext,
    options?: ContextPropagationOptions,
  ): IUseCaseContext;
}
```

### UserContextUtils

用户上下文工具。

```typescript
export class UserContextUtils {
  static createUserContext(options: UserContextOptions): IUseCaseContext;
  static validateUserContext(context: IUseCaseContext): ValidationResult;
  static hasPermission(context: IUseCaseContext, permission: string): boolean;
  static hasRole(context: IUseCaseContext, role: string): boolean;
}
```

---

## 类型定义

### 验证结果类型

```typescript
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface SecurityValidationResult extends ValidationResult {
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
  threats: string[];
  recommendations: string[];
}

export interface TenantContextValidationResult extends ValidationResult {
  tenantInfo?: {
    id: string;
    name: string;
    isolationLevel: string;
  };
}
```

### 事件类型

```typescript
export interface DomainEvent {
  getEventType(): string;
  getAggregateId(): string;
  getTimestamp(): Date;
}

export interface EventHandler<T> {
  handle(event: T): Promise<void>;
}

export interface EventSubscription {
  id: string;
  eventType: string;
  handler: EventHandler<any>;
}
```

### 事务类型

```typescript
export interface Transaction {
  commit(): Promise<void>;
  rollback(): Promise<void>;
  isActive(): boolean;
}

export interface TransactionOptions {
  isolationLevel?: IsolationLevel;
  timeout?: number;
  retryAttempts?: number;
}
```

---

## 使用示例

### 完整的用户管理示例

```typescript
import {
  BaseCommand,
  BaseQuery,
  BaseUseCase,
  EventPublisher,
  TransactionManager,
  ContextUtils
} from '@hl8/application-kernel';
import { IsolationContext, TenantId, UserId } from '@hl8/domain-kernel';

// 1. 定义命令
export class CreateUserCommand extends BaseCommand {
  constructor(
    public readonly email: string,
    public readonly username: string,
    isolationContext?: IsolationContext,
  ) {
    super('CreateUserCommand', '创建用户命令', isolationContext);
  }
}

// 2. 定义查询
export class GetUserQuery extends BaseQuery {
  constructor(
    public readonly userId: UserId,
    isolationContext?: IsolationContext,
  ) {
    super('GetUserQuery', '获取用户查询', isolationContext);
  }
}

// 3. 实现用例
export class CreateUserUseCase extends BaseUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly transactionManager: TransactionManager,
  ) {
    super();
  }
  
  async execute(command: CreateUserCommand): Promise<UserId> {
    return await this.transactionManager.executeInTransaction(async () => {
      // 创建用户
      const user = new User(command.email, command.username);
      
      // 保存用户
      await this.userRepository.save(user);
      
      // 发布事件
      await this.eventPublisher.publishEvent({
        type: 'UserCreated',
        userId: user.getId(),
        email: user.getEmail(),
        username: user.getUsername(),
        timestamp: new Date()
      });
      
      return user.getId();
    });
  }
}

// 4. 使用示例
async function example() {
  const tenantContext = IsolationContext.createTenant(TenantId.create('tenant-123'));
  const context = ContextUtils.createContext({
    requestId: 'req-123',
    tenant: { id: 'tenant-123', name: 'Test Tenant' }
  });
  
  const createUserUseCase = new CreateUserUseCase(
    userRepository,
    eventPublisher,
    transactionManager
  );
  
  const command = new CreateUserCommand(
    'user@example.com',
    'testuser',
    tenantContext
  );
  
  const userId = await createUserUseCase.execute(command);
  console.log('用户创建成功:', userId);
}
```

---

## 📚 相关资源

- [快速开始](./QUICK_START.md)
- [完整开发指南](./APPLICATION_LAYER_DEVELOPMENT_GUIDE.md)
- [示例项目](../examples/)

---

**版本历史**:

- v1.0.0 (2025-01-21): 初始版本，完整的API参考文档
