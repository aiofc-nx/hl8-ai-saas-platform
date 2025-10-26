# Application Kernel

> **版本**: 1.0.0 | **创建日期**: 2025-01-21

基于 Clean Architecture 的应用层内核库，提供统一的 CQRS 模式、上下文管理和应用层基础设施。

## ✨ 特性

- **🚀 CQRS 模式**: 完整的命令查询分离实现
- **🏢 多租户支持**: 基于 `@hl8/domain-kernel` 的隔离上下文管理
- **📡 事件驱动**: 支持领域事件和集成事件
- **💾 事务管理**: 完整的事务生命周期管理
- **🔍 验证框架**: 全面的数据验证和安全检查
- **⚠️ 统一异常处理**: 集成 `@hl8/exceptions` 提供 RFC7807 标准异常
- **🔧 框架无关**: 支持 NestJS、Express 等框架

## 📦 安装

```bash
npm install @hl8/application-kernel @hl8/domain-kernel @hl8/exceptions
```

## 🚀 快速开始

```typescript
import {
  BaseCommand,
  BaseQuery,
  BaseUseCase,
  GeneralBadRequestException,
} from "@hl8/application-kernel";
import { IsolationContext, TenantId } from "@hl8/domain-kernel";

// 创建命令
export class CreateUserCommand extends BaseCommand {
  constructor(
    public readonly email: string,
    public readonly username: string,
    isolationContext?: IsolationContext,
  ) {
    super("CreateUserCommand", "创建用户命令", isolationContext);
  }
}

// 创建查询
export class GetUserQuery extends BaseQuery {
  constructor(
    public readonly userId: string,
    isolationContext?: IsolationContext,
  ) {
    super("GetUserQuery", "获取用户查询", isolationContext);
  }
}

// 创建用例
export class CreateUserUseCase extends BaseUseCase {
  async execute(command: CreateUserCommand): Promise<string> {
    // 实现用例逻辑
    return "user-" + Date.now();
  }
}

// 异常处理示例
export class ValidateUserUseCase extends BaseUseCase {
  async execute(command: CreateUserCommand): Promise<void> {
    // 参数验证
    if (!command.email || !command.email.includes("@")) {
      throw new GeneralBadRequestException(
        "邮箱格式错误",
        "邮箱地址格式不正确",
        { email: command.email, expectedFormat: "user@example.com" },
      );
    }

    // 业务逻辑...
  }
}
```

## 📚 文档

- **[快速开始](./docs/QUICK_START.md)** - 5分钟上手
- **[开发指南](./docs/APPLICATION_LAYER_DEVELOPMENT_GUIDE.md)** - 完整的开发指南
- **[API 参考](./docs/API_REFERENCE.md)** - 详细的API文档
- **[验证架构](./docs/VALIDATION_ARCHITECTURE.md)** - 验证分层设计指南
- **[异常集成](./docs/EXCEPTION_INTEGRATION.md)** - 异常系统集成说明

## 🏗️ 架构

```
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

## 🧪 测试

```bash
# 运行测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行linting
npm run lint
```

## 📊 测试覆盖率

- **单元测试**: 31个测试用例，100%通过
- **代码覆盖率**: 80%+ 分支、函数、行、语句覆盖率
- **Linting**: 0个错误，0个警告

## 🔧 开发

### 项目结构

```
libs/application-kernel/
├── src/
│   ├── cqrs/              # CQRS基础组件
│   ├── context/           # 上下文管理
│   ├── events/            # 事件驱动架构
│   ├── transactions/      # 事务管理
│   ├── use-cases/         # 用例基础
│   ├── validation/        # 验证工具
│   └── index.ts           # 入口文件
├── tests/                 # 测试文件
├── docs/                  # 文档
└── package.json
```

### 核心组件

| 组件                  | 职责           | 位置                      |
| --------------------- | -------------- | ------------------------- |
| `BaseCommand`         | 命令基类       | `src/cqrs/commands/`      |
| `BaseQuery`           | 查询基类       | `src/cqrs/queries/`       |
| `BaseUseCase`         | 用例基类       | `src/use-cases/`          |
| `IsolationContext`    | 隔离上下文     | 来自 `@hl8/domain-kernel` |
| `IEventBus`           | 事件总线接口   | `src/events/`             |
| `ITransactionManager` | 事务管理器接口 | `src/transactions/`       |

## 🤝 贡献

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关项目

- [Domain Kernel](../domain-kernel/) - 领域层内核
- [Infrastructure Kernel](../infrastructure-kernel/) - 基础设施层内核
- [Interface Kernel](../interface-kernel/) - 接口层内核

---

**需要帮助？** 查看 [常见问题](./docs/APPLICATION_LAYER_DEVELOPMENT_GUIDE.md#11-常见问题) 或提交 Issue。
