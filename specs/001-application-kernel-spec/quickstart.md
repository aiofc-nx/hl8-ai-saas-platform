# Quickstart Guide: Application Kernel Development Standards

**Date**: 2024-12-19  
**Feature**: Application Kernel Development Standards  
**Phase**: 1 - Design & Contracts

## Overview

The Application Kernel provides a comprehensive foundation for implementing consistent application layer patterns across business modules. This guide will help you get started with the core concepts and patterns.

## Installation

```bash
# Install the application kernel package
pnpm add @hl8/application-kernel

# Or if using workspace dependencies
pnpm add @hl8/application-kernel --workspace
```

## Core Concepts

### 1. CQRS Pattern

The Application Kernel implements Command Query Responsibility Segregation (CQRS) pattern:

- **Commands**: Change system state (CreateUser, UpdateUser, DeleteUser)
- **Queries**: Read system state (GetUser, GetUserList)
- **Handlers**: Process commands and queries
- **Separation**: Commands and queries are completely separated

### 2. Use Cases

Use cases encapsulate business logic and coordinate between domain objects:

- **BaseUseCase**: Base class for all use cases
- **BaseCommandUseCase**: Base class for command use cases with transaction support
- **Context Management**: Use cases receive execution context
- **Event Publishing**: Use cases can publish domain events

### 3. Context Management

Multi-tenant isolation is supported through context management:

- **IsolationContext**: Tenant and user context
- **IUseCaseContext**: Use case execution context
- **Multi-level Isolation**: Platform/tenant/organization/department/user levels
- **Data Classification**: Shared and non-shared data support

## Getting Started

### Step 1: Create a Command

```typescript
import { BaseCommand } from "@hl8/application-kernel";
import { IsolationContext, TenantId } from "@hl8/domain-kernel";

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
```

### Step 2: Create a Command Handler

```typescript
import { CommandHandler, BaseCommand } from "@hl8/application-kernel";

export class CreateUserCommandHandler
  implements CommandHandler<CreateUserCommand, CreateUserResponse>
{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async handle(command: CreateUserCommand): Promise<CreateUserResponse> {
    // 1. Validate command
    this.validateCommand(command);

    // 2. Create user
    const user = new User(command.username, command.email, command.displayName);
    await this.userRepository.save(user);

    // 3. Publish domain events
    await this.eventBus.publishAll(user.getUncommittedEvents());

    return new CreateUserResponse(user.id, user.username, user.email);
  }

  validateCommand(command: CreateUserCommand): void {
    if (!command.username || !command.email) {
      throw new Error("用户名和邮箱是必填项");
    }
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

### Step 3: Create a Use Case

```typescript
import { BaseCommandUseCase, IUseCaseContext } from "@hl8/application-kernel";

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
    // 1. Begin transaction
    await this.beginTransaction();

    try {
      // 2. Validate request
      this.validateRequest(request);

      // 3. Create user
      const user = new User(
        request.username,
        request.email,
        request.displayName,
      );
      await this.userRepository.save(user);

      // 4. Publish domain events
      await this.publishDomainEvents(user);

      // 5. Commit transaction
      await this.commitTransaction();

      return new CreateUserResponse(user.id, user.username, user.email);
    } catch (error) {
      // 6. Rollback transaction on error
      await this.rollbackTransaction();
      throw error;
    }
  }

  protected validateRequest(request: CreateUserRequest): void {
    if (!request.username || !request.email) {
      throw new Error("用户名和邮箱是必填项");
    }
  }
}
```

### Step 4: Create a Query

```typescript
import { BaseQuery } from "@hl8/application-kernel";
import { IsolationContext, UserId } from "@hl8/domain-kernel";

export class GetUserQuery extends BaseQuery {
  constructor(
    public readonly userId: UserId,
    isolationContext?: IsolationContext,
  ) {
    super("GetUserQuery", "获取用户查询", isolationContext);
  }
}
```

### Step 5: Create a Query Handler

```typescript
import { QueryHandler, BaseQuery } from "@hl8/application-kernel";

export class GetUserQueryHandler
  implements QueryHandler<GetUserQuery, GetUserResponse>
{
  constructor(private readonly userRepository: IUserRepository) {}

  async handle(query: GetUserQuery): Promise<GetUserResponse> {
    // 1. Validate query
    this.validateQuery(query);

    // 2. Get user from repository
    const user = await this.userRepository.findById(query.userId);

    if (!user) {
      throw new Error("用户不存在");
    }

    return new GetUserResponse(
      user.id,
      user.username,
      user.email,
      user.displayName,
    );
  }

  validateQuery(query: GetUserQuery): void {
    if (!query.userId) {
      throw new Error("用户ID是必填项");
    }
  }

  canHandle(query: GetUserQuery): boolean {
    return query.queryName === "GetUserQuery";
  }

  getHandlerName(): string {
    return "GetUserQueryHandler";
  }
}
```

## Context Management

### Setting Up Context

```typescript
import { IsolationContext, IUseCaseContext } from "@hl8/application-kernel";
import {
  TenantId,
  OrganizationId,
  DepartmentId,
  UserId,
} from "@hl8/domain-kernel";

// Create isolation context using domain-kernel
const isolationContext = IsolationContext.department(
  TenantId.create("tenant-123"),
  OrganizationId.create("org-456"),
  DepartmentId.create("dept-789"),
);

// Create use case context
const useCaseContext: IUseCaseContext = {
  tenant: { id: "tenant-123", name: "企业租户" },
  user: { id: "user-456", username: "admin" },
  requestId: "req-789",
  timestamp: new Date(),
};
```

## Event Publishing

### Publishing Domain Events

```typescript
import { DomainEvent, IEventBus } from "@hl8/application-kernel";
import { EntityId } from "@hl8/domain-kernel";

// Create domain event (aligned with domain-kernel)
const userCreatedEvent: DomainEvent = {
  eventId: EntityId.create(),
  occurredAt: new Date(),
  aggregateId: EntityId.create("user-456"),
  version: 1,
  eventType: "UserCreated",
  eventData: {
    username: "john.doe",
    email: "john@example.com",
    displayName: "John Doe",
  },
};

// Publish event
await eventBus.publish(userCreatedEvent);
```

## Transaction Management

### Using Transactions

```typescript
import { ITransactionManager } from "@hl8/application-kernel";

// Begin transaction
await transactionManager.begin();

try {
  // Perform operations
  await userRepository.save(user);
  await eventBus.publishAll(events);

  // Commit transaction
  await transactionManager.commit();
} catch (error) {
  // Rollback transaction on error
  await transactionManager.rollback();
  throw error;
}
```

## Best Practices

### 1. Command Design

- Commands should be immutable
- Include all necessary data for execution
- Use descriptive names and descriptions
- Include tenant and user context

### 2. Query Design

- Queries should be read-only
- Include filtering and pagination parameters
- Use descriptive names and descriptions
- Include tenant and user context

### 3. Use Case Design

- Use cases should be single-purpose
- Include proper validation
- Handle transactions correctly
- Publish domain events

### 4. Error Handling

- Use specific exception types
- Include meaningful error messages
- Handle validation errors separately
- Log errors appropriately

### 5. Testing

- Test commands and queries independently
- Mock dependencies properly
- Test error scenarios
- Verify event publishing

## Next Steps

1. **Explore Examples**: Check out the examples directory for more complex scenarios
2. **Read Documentation**: Review the full API documentation
3. **Join Community**: Connect with other developers using the Application Kernel
4. **Contribute**: Help improve the kernel by contributing code or documentation

## Support

For questions and support:

- **Documentation**: [Application Kernel Docs](./docs/)
- **Examples**: [Examples Directory](./examples/)
- **Issues**: [GitHub Issues](https://github.com/hl8/application-kernel/issues)
- **Community**: [Discord Server](https://discord.gg/hl8)
