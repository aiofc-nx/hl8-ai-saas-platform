# Application Kernel API Contracts

**Date**: 2024-12-19  
**Feature**: Application Kernel Development Standards  
**Phase**: 1 - Design & Contracts

## API Overview

The Application Kernel provides a comprehensive set of interfaces and base classes for implementing consistent application layer patterns across business modules. All APIs are framework-agnostic and designed to support Clean Architecture, CQRS, and multi-tenant isolation.

## Core Interfaces

### BaseCommand

```typescript
import { EntityId } from "@hl8/domain-kernel";
import { IsolationContext } from "@hl8/domain-kernel";

export abstract class BaseCommand {
  public readonly commandId: EntityId;
  public readonly commandName: string;
  public readonly description: string;
  public readonly timestamp: Date;
  public readonly isolationContext?: IsolationContext;
  public readonly metadata?: Record<string, unknown>;

  constructor(
    commandName: string,
    description: string,
    isolationContext?: IsolationContext,
    metadata?: Record<string, unknown>,
  );
}
```

### BaseQuery

```typescript
import { EntityId } from "@hl8/domain-kernel";
import { IsolationContext } from "@hl8/domain-kernel";

export abstract class BaseQuery {
  public readonly queryId: EntityId;
  public readonly queryName: string;
  public readonly description: string;
  public readonly timestamp: Date;
  public readonly isolationContext?: IsolationContext;
  public readonly metadata?: Record<string, unknown>;

  constructor(
    queryName: string,
    description: string,
    isolationContext?: IsolationContext,
    metadata?: Record<string, unknown>,
  );
}
```

### CommandHandler Interface

```typescript
export interface CommandHandler<
  TCommand extends BaseCommand = BaseCommand,
  TResult = void,
> {
  handle(command: TCommand): Promise<TResult>;
  validateCommand(command: TCommand): void;
  canHandle(command: TCommand): boolean;
  getHandlerName(): string;
  getPriority(): number;
}
```

### QueryHandler Interface

```typescript
export interface QueryHandler<
  TQuery extends BaseQuery = BaseQuery,
  TResult = any,
> {
  handle(query: TQuery): Promise<TResult>;
  validateQuery(query: TQuery): void;
  canHandle(query: TQuery): boolean;
  getHandlerName(): string;
}
```

### BaseUseCase Abstract Class

```typescript
export abstract class BaseUseCase<TRequest, TResponse> {
  protected readonly useCaseName: string;
  protected readonly useCaseDescription: string;
  protected readonly useCaseVersion: string;
  protected readonly requiredPermissions: string[];

  constructor(
    useCaseName: string,
    useCaseDescription: string,
    useCaseVersion?: string,
    requiredPermissions?: string[],
  );

  abstract execute(
    request: TRequest,
    context: IUseCaseContext,
  ): Promise<TResponse>;
  protected abstract validateRequest(request: TRequest): void;
}
```

### BaseCommandUseCase Abstract Class

```typescript
export abstract class BaseCommandUseCase<
  TRequest,
  TResponse,
> extends BaseUseCase<TRequest, TResponse> {
  protected abstract executeCommand(
    request: TRequest,
    context: IUseCaseContext,
  ): Promise<TResponse>;
  protected async publishDomainEvents(aggregateRoot: any): Promise<void>;
  protected async beginTransaction(): Promise<void>;
  protected async commitTransaction(): Promise<void>;
  protected async rollbackTransaction(): Promise<void>;
}
```

## Context Management

### IsolationContext (from domain-kernel)

```typescript
// 使用 domain-kernel 中的 IsolationContext 实体
import { IsolationContext } from "@hl8/domain-kernel";

// IsolationContext 提供以下方法：
// - static platform(): IsolationContext
// - static tenant(tenantId: TenantId): IsolationContext
// - static organization(tenantId: TenantId, organizationId: OrganizationId): IsolationContext
// - static department(tenantId: TenantId, organizationId: OrganizationId, departmentId: DepartmentId): IsolationContext
// - static user(userId: UserId, tenantId?: TenantId): IsolationContext
// - getIsolationLevel(): IsolationLevel
// - buildCacheKey(namespace: string, key: string): string
// - buildLogContext(): Record<string, string>
// - buildWhereClause(alias?: string): Record<string, any>
// - canAccess(targetContext: IsolationContext, sharingLevel: SharingLevel): boolean
```

### IUseCaseContext Interface

```typescript
export interface IUseCaseContext {
  tenant?: { id: string; name: string };
  user?: { id: string; username: string };
  requestId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

## Event System

### DomainEvent Interface (aligned with domain-kernel)

```typescript
import { EntityId } from "@hl8/domain-kernel";

export interface DomainEvent {
  readonly eventId: EntityId;
  readonly occurredAt: Date;
  readonly aggregateId: EntityId;
  readonly version: number;
  readonly eventType: string;
  readonly eventData: Record<string, any>;
}
```

### IEventBus Interface

```typescript
export interface IEventBus {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
  subscribe(eventType: string, handler: EventHandler): void;
  unsubscribe(eventType: string, handler: EventHandler): void;
}
```

## Transaction Management

### ITransactionManager Interface

```typescript
export interface ITransactionManager {
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  isActive(): boolean;
}
```

## Usage Examples

### Creating a Command

```typescript
export class CreateUserCommand extends BaseCommand {
  constructor(
    public readonly username: string,
    public readonly email: string,
    public readonly displayName: string,
    tenantId?: string,
    userId?: string,
  ) {
    super("CreateUserCommand", "创建用户命令", tenantId, userId);
  }
}
```

### Creating a Command Handler

```typescript
export class CreateUserCommandHandler
  implements CommandHandler<CreateUserCommand, CreateUserResponse>
{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async handle(command: CreateUserCommand): Promise<CreateUserResponse> {
    // Implementation
  }

  validateCommand(command: CreateUserCommand): void {
    // Validation logic
  }

  canHandle(command: CreateUserCommand): boolean {
    return command.commandName === "CreateUserCommand";
  }

  getHandlerName(): string {
    return "CreateUserCommandHandler";
  }

  getPriority(): number {
    return 0;
  }
}
```

### Creating a Use Case

```typescript
export class CreateUserUseCase extends BaseCommandUseCase<
  CreateUserRequest,
  CreateUserResponse
> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly eventBus: IEventBus,
    private readonly transactionManager: ITransactionManager,
  ) {
    super("CreateUser", "创建用户用例", "1.0.0", ["user:create"]);
  }

  protected async executeCommand(
    request: CreateUserRequest,
    context: IUseCaseContext,
  ): Promise<CreateUserResponse> {
    // Implementation
  }

  protected validateRequest(request: CreateUserRequest): void {
    // Validation logic
  }
}
```

## Error Handling

All interfaces include proper error handling:

- **Validation Errors**: Thrown during command/query validation
- **Business Logic Errors**: Thrown during use case execution
- **Transaction Errors**: Thrown during transaction management
- **Event Publishing Errors**: Thrown during event publishing

## Multi-Tenant Support

All interfaces support multi-tenant isolation:

- **Tenant Context**: All operations include tenantId
- **User Context**: All operations include userId for audit
- **Isolation Levels**: Support for platform/tenant/organization/department/user isolation
- **Data Classification**: Support for shared/non-shared data scenarios

## Framework Integration

The Application Kernel is designed to be framework-agnostic:

- **Pure TypeScript**: No external framework dependencies
- **Interface-Based**: All implementations are interface-based
- **Dependency Injection**: Supports any DI container
- **Event System**: Compatible with any event system implementation
- **Transaction Management**: Compatible with any transaction manager
