# 迁移指南：现有业务模块迁移到应用内核

**版本**: 1.0.0  
**日期**: 2024-12-19

## 概述

本指南帮助现有业务模块迁移到应用内核模式，确保应用层一致性和架构统一。

## 迁移步骤

### 1. 命令迁移

#### 迁移前

```typescript
// 旧方式 - 直接定义命令类
export class CreateUserCommand {
  constructor(
    public readonly email: string,
    public readonly username: string,
    public readonly tenantId: string,
  ) {}
}
```

#### 迁移后

```typescript
// 新方式 - 继承 BaseCommand
import { BaseCommand } from "@hl8/application-kernel";
import { IsolationContext, TenantId } from "@hl8/domain-kernel";

export class CreateUserCommand extends BaseCommand {
  constructor(
    public readonly email: string,
    public readonly username: string,
    isolationContext?: IsolationContext,
  ) {
    super("CreateUserCommand", "创建用户命令", isolationContext);
  }
}
```

### 2. 查询迁移

#### 迁移前

```typescript
// 旧方式 - 直接定义查询类
export class GetUserQuery {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
  ) {}
}
```

#### 迁移后

```typescript
// 新方式 - 继承 BaseQuery
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

### 3. 用例迁移

#### 迁移前

```typescript
// 旧方式 - 直接定义用例类
export class CreateUserUseCase {
  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // 业务逻辑
    return result;
  }
}
```

#### 迁移后

```typescript
// 新方式 - 继承 BaseCommandUseCase
import { BaseCommandUseCase, IUseCaseContext } from "@hl8/application-kernel";

export class CreateUserUseCase extends BaseCommandUseCase<
  CreateUserCommand,
  CreateUserResult
> {
  constructor(
    private readonly userRepository: IUserRepository,
    eventBus?: IEventBus,
    transactionManager?: ITransactionManager,
  ) {
    super(
      "CreateUser",
      "创建用户用例",
      "1.0.0",
      ["user:create"],
      eventBus,
      transactionManager,
    );
  }

  protected async executeCommand(
    request: CreateUserCommand,
    context: IUseCaseContext,
  ): Promise<CreateUserResult> {
    // 业务逻辑
    return result;
  }
}
```

### 4. 处理器迁移

#### 迁移前

```typescript
// 旧方式 - 直接定义处理器
export class CreateUserCommandHandler {
  async handle(command: CreateUserCommand): Promise<CreateUserResponse> {
    // 处理逻辑
  }
}
```

#### 迁移后

```typescript
// 新方式 - 实现 CommandHandler 接口
import { CommandHandler } from "@hl8/application-kernel";

export class CreateUserCommandHandler
  implements CommandHandler<CreateUserCommand, CreateUserResult>
{
  async handle(command: CreateUserCommand): Promise<CreateUserResult> {
    // 处理逻辑
  }

  validateCommand(command: CreateUserCommand): void {
    // 验证逻辑
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

## 迁移检查清单

### 命令迁移检查

- [ ] 命令类继承自 `BaseCommand`
- [ ] 构造函数调用 `super()` 并传递 `commandName` 和 `description`
- [ ] 使用 `IsolationContext` 替代直接的 `tenantId` 参数
- [ ] 使用 `EntityId` 替代字符串 ID

### 查询迁移检查

- [ ] 查询类继承自 `BaseQuery`
- [ ] 构造函数调用 `super()` 并传递 `queryName` 和 `description`
- [ ] 使用 `IsolationContext` 替代直接的 `tenantId` 参数
- [ ] 使用 `EntityId` 替代字符串 ID

### 用例迁移检查

- [ ] 用例类继承自 `BaseUseCase` 或 `BaseCommandUseCase`
- [ ] 实现 `executeUseCase` 或 `executeCommand` 方法
- [ ] 使用 `IUseCaseContext` 作为上下文参数
- [ ] 添加适当的权限要求

### 处理器迁移检查

- [ ] 处理器实现 `CommandHandler` 或 `QueryHandler` 接口
- [ ] 实现所有必需的方法
- [ ] 添加适当的验证逻辑
- [ ] 添加优先级支持

## 常见问题

### Q: 如何处理现有的字符串 ID？

A: 使用 `EntityId.create()` 创建新的 ID，或使用 `EntityId.create(existingId)` 包装现有 ID。

### Q: 如何处理现有的租户隔离？

A: 使用 `IsolationContext.tenant(TenantId.create(tenantId))` 创建隔离上下文。

### Q: 如何处理现有的事件发布？

A: 使用 `IEventBus` 接口，在用例中调用 `publishDomainEvents()` 方法。

### Q: 如何处理现有的事务管理？

A: 使用 `ITransactionManager` 接口，在用例中调用 `beginTransaction()`、`commitTransaction()` 和 `rollbackTransaction()` 方法。

## 验证迁移

使用模式合规性验证器检查迁移结果：

```typescript
import { PatternComplianceValidator } from "@hl8/application-kernel";

const result = PatternComplianceValidator.validateModule(YourModule);

if (result.isCompliant) {
  console.log("迁移成功！");
} else {
  console.log("发现违规项:", result.violations);
  console.log("建议改进:", result.suggestions);
}
```

## 最佳实践

1. **渐进式迁移**: 一次迁移一个模块，确保每个模块都通过验证
2. **测试覆盖**: 为迁移后的代码添加完整的测试覆盖
3. **文档更新**: 更新相关文档以反映新的架构模式
4. **团队培训**: 确保团队成员了解新的架构模式

## 支持

如果在迁移过程中遇到问题，请参考：

- [应用内核文档](./README.md)
- [基础使用示例](./examples/basic-usage.ts)
- [集成示例](./examples/integration-examples.ts)
