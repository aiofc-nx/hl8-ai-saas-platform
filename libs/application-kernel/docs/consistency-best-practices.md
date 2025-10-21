# 应用层一致性最佳实践

**版本**: 1.0.0  
**日期**: 2024-12-19

## 概述

本文档提供确保应用层一致性的最佳实践，帮助开发团队遵循统一的应用内核模式。

## 核心原则

### 1. 统一继承模式

所有业务模块都应该继承应用内核提供的基础类：

```typescript
// ✅ 正确 - 继承基础类
export class CreateUserCommand extends BaseCommand {}
export class GetUserQuery extends BaseQuery {}
export class CreateUserUseCase extends BaseCommandUseCase {}

// ❌ 错误 - 直接定义类
export class CreateUserCommand {}
export class GetUserQuery {}
export class CreateUserUseCase {}
```

### 2. 统一接口实现

所有处理器都应该实现应用内核提供的接口：

```typescript
// ✅ 正确 - 实现接口
export class CreateUserCommandHandler implements CommandHandler {}
export class GetUserQueryHandler implements QueryHandler {}

// ❌ 错误 - 不实现接口
export class CreateUserCommandHandler {}
export class GetUserQueryHandler {}
```

### 3. 统一上下文管理

所有操作都应该使用统一的上下文管理：

```typescript
// ✅ 正确 - 使用 IsolationContext
const context = IsolationContext.tenant(TenantId.create("tenant-123"));

// ❌ 错误 - 直接传递字符串 ID
const context = { tenantId: "tenant-123" };
```

## 命名规范

### 命令命名

- 格式：`{Action}{Entity}Command`
- 示例：`CreateUserCommand`, `UpdateUserCommand`, `DeleteUserCommand`

### 查询命名

- 格式：`{Action}{Entity}Query`
- 示例：`GetUserQuery`, `GetUserListQuery`, `SearchUsersQuery`

### 用例命名

- 格式：`{Action}{Entity}UseCase`
- 示例：`CreateUserUseCase`, `UpdateUserUseCase`, `DeleteUserUseCase`

### 处理器命名

- 格式：`{Command/Query}Handler`
- 示例：`CreateUserCommandHandler`, `GetUserQueryHandler`

## 目录结构规范

```
src/
├── commands/           # 命令定义
│   ├── create-user.command.ts
│   └── update-user.command.ts
├── queries/            # 查询定义
│   ├── get-user.query.ts
│   └── get-user-list.query.ts
├── use-cases/          # 用例实现
│   ├── create-user.use-case.ts
│   └── update-user.use-case.ts
├── handlers/           # 处理器实现
│   ├── create-user-command.handler.ts
│   └── get-user-query.handler.ts
└── index.ts           # 模块导出
```

## 实现规范

### 命令实现规范

```typescript
export class CreateUserCommand extends BaseCommand {
  constructor(
    public readonly email: string,
    public readonly username: string,
    public readonly displayName: string,
    isolationContext?: IsolationContext,
  ) {
    super("CreateUserCommand", "创建用户命令", isolationContext);
  }
}
```

**要求**：

- 继承自 `BaseCommand`
- 构造函数调用 `super()` 并传递 `commandName` 和 `description`
- 使用 `IsolationContext` 进行多租户隔离
- 所有属性都应该是 `readonly`

### 查询实现规范

```typescript
export class GetUserQuery extends BaseQuery {
  constructor(
    public readonly userId: UserId,
    isolationContext?: IsolationContext,
  ) {
    super("GetUserQuery", "获取用户查询", isolationContext);
  }
}
```

**要求**：

- 继承自 `BaseQuery`
- 构造函数调用 `super()` 并传递 `queryName` 和 `description`
- 使用 `IsolationContext` 进行多租户隔离
- 所有属性都应该是 `readonly`

### 用例实现规范

```typescript
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
    // 实现业务逻辑
  }
}
```

**要求**：

- 继承自 `BaseUseCase` 或 `BaseCommandUseCase`
- 实现 `executeUseCase` 或 `executeCommand` 方法
- 使用 `IUseCaseContext` 作为上下文参数
- 添加适当的权限要求

### 处理器实现规范

```typescript
export class CreateUserCommandHandler
  implements CommandHandler<CreateUserCommand, CreateUserResult>
{
  async handle(command: CreateUserCommand): Promise<CreateUserResult> {
    // 实现处理逻辑
  }

  validateCommand(command: CreateUserCommand): void {
    // 实现验证逻辑
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

**要求**：

- 实现 `CommandHandler` 或 `QueryHandler` 接口
- 实现所有必需的方法
- 添加适当的验证逻辑
- 添加优先级支持

## 验证和测试

### 模式合规性验证

使用模式合规性验证器检查实现：

```typescript
import { PatternComplianceValidator } from "@hl8/application-kernel";

const result = PatternComplianceValidator.validateModule(YourModule);

if (!result.isCompliant) {
  console.error("模式违规:", result.violations);
  console.log("改进建议:", result.suggestions);
}
```

### 单元测试规范

```typescript
describe("CreateUserCommand", () => {
  it("should create command with correct properties", () => {
    const command = new CreateUserCommand(
      "user@example.com",
      "username",
      "User Name",
    );

    expect(command.commandName).toBe("CreateUserCommand");
    expect(command.description).toBe("创建用户命令");
    expect(command.email).toBe("user@example.com");
  });
});
```

## 常见错误和解决方案

### 错误 1: 不继承基础类

```typescript
// ❌ 错误
export class CreateUserCommand {
  constructor(public readonly email: string) {}
}

// ✅ 正确
export class CreateUserCommand extends BaseCommand {
  constructor(
    public readonly email: string,
    isolationContext?: IsolationContext,
  ) {
    super("CreateUserCommand", "创建用户命令", isolationContext);
  }
}
```

### 错误 2: 不使用统一上下文

```typescript
// ❌ 错误
export class CreateUserCommand {
  constructor(
    public readonly email: string,
    public readonly tenantId: string,
  ) {}
}

// ✅ 正确
export class CreateUserCommand extends BaseCommand {
  constructor(
    public readonly email: string,
    isolationContext?: IsolationContext,
  ) {
    super("CreateUserCommand", "创建用户命令", isolationContext);
  }
}
```

### 错误 3: 不实现必需接口

```typescript
// ❌ 错误
export class CreateUserCommandHandler {
  async handle(command: CreateUserCommand) {
    // 处理逻辑
  }
}

// ✅ 正确
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

## 工具支持

### ESLint 规则

配置 ESLint 规则确保一致性：

```json
{
  "rules": {
    "@typescript-eslint/no-extraneous-class": "error",
    "@typescript-eslint/prefer-readonly": "error"
  }
}
```

### 代码生成器

使用代码生成器快速创建符合规范的代码：

```bash
# 生成命令
npx @hl8/application-kernel generate command CreateUser

# 生成查询
npx @hl8/application-kernel generate query GetUser

# 生成用例
npx @hl8/application-kernel generate use-case CreateUser
```

## 持续改进

1. **定期审查**: 定期审查代码库，确保遵循最佳实践
2. **团队培训**: 定期培训团队成员，确保了解最新规范
3. **工具更新**: 及时更新工具和规则，支持新的最佳实践
4. **反馈收集**: 收集团队反馈，持续改进规范

## 总结

遵循这些最佳实践可以确保：

- 应用层架构的一致性
- 代码的可维护性和可读性
- 团队开发效率的提升
- 系统整体质量的改善

记住：一致性比完美性更重要。选择一套规范并坚持执行，比追求完美但不一致的代码更有价值。
