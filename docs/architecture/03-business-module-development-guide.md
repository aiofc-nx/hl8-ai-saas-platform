# 业务模块开发指南

> **版本**: 1.0.0 | **创建日期**: 2025-01-27 | **模块**: 架构设计文档

---

## 📋 目录

- [1. 业务模块开发概述](#1-业务模块开发概述)
- [2. 开发环境准备](#2-开发环境准备)
- [3. 业务模块结构](#3-业务模块结构)
- [4. 开发流程](#4-开发流程)
- [5. 代码实现指南](#5-代码实现指南)
- [6. 测试策略](#6-测试策略)
- [7. 部署和集成](#7-部署和集成)
- [8. 最佳实践](#8-最佳实践)

---

## 1. 业务模块开发概述

### 1.1 业务模块定义

业务模块是HL8 SAAS平台中的独立功能单元，每个模块都遵循混合架构模式，包含完整的四层架构：领域层、应用层、基础设施层和接口层。

### 1.2 业务模块特点

- **独立性**: 每个业务模块都是独立的，可以单独开发、测试和部署
- **可复用性**: 业务模块可以在不同的租户和组织中复用
- **可扩展性**: 支持功能的扩展和定制
- **多租户支持**: 内置多租户数据隔离和权限控制
- **事件驱动**: 支持事件驱动的业务流程

### 1.3 业务模块类型

#### 1.3.1 核心业务模块

- **用户管理模块**: 用户注册、认证、权限管理
- **组织管理模块**: 组织创建、管理、部门结构
- **租户管理模块**: 租户创建、配置、隔离管理

#### 1.3.2 业务功能模块

- **订单管理模块**: 订单创建、处理、状态管理
- **产品管理模块**: 产品信息、库存、价格管理
- **支付模块**: 支付处理、账单、财务记录

#### 1.3.3 扩展功能模块

- **报表模块**: 数据统计、报表生成、分析
- **通知模块**: 消息推送、邮件通知、短信通知
- **集成模块**: 第三方系统集成、API接口

---

## 2. 开发环境准备

### 2.1 环境要求

- **Node.js**: >= 20.0.0
- **pnpm**: >= 8.0.0
- **TypeScript**: >= 5.0.0
- **NestJS**: >= 10.0.0

### 2.2 项目结构

```
hl8-ai-saas-platform/
├── apps/                          # 应用程序
│   └── fastify-api/              # Fastify API应用
├── libs/                         # 核心库
│   ├── domain-kernel/            # 领域层核心
│   ├── application-kernel/        # 应用层核心
│   ├── infrastructure-kernel/    # 基础设施层核心
│   ├── interface-kernel/         # 接口层核心
│   ├── config/                   # 配置管理
│   ├── database/                 # 数据库管理
│   ├── caching/                  # 缓存管理
│   ├── messaging/                # 消息管理
│   └── exceptions/                # 异常处理
├── packages/                     # 共享包
│   ├── eslint-config/            # ESLint配置
│   └── typescript-config/        # TypeScript配置
└── docs/                        # 文档
    └── architecture/             # 架构文档
```

### 2.3 开发工具配置

#### 2.3.1 IDE配置

推荐使用VS Code，安装以下扩展：

- TypeScript Importer
- ESLint
- Prettier
- GitLens
- Thunder Client (API测试)

#### 2.3.2 代码规范

项目使用统一的代码规范：

- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **TypeScript**: 类型检查
- **Jest**: 单元测试

### 2.4 环境变量配置

创建 `.env` 文件：

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=hl8_platform
DB_USERNAME=hl8_user
DB_PASSWORD=hl8_password

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# 应用配置
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# 日志配置
LOGGING_LEVEL=info
LOGGING_PRETTY_PRINT=true

# 缓存配置
CACHE_TTL=3600
CACHE_MAX_ITEMS=1000
```

---

## 3. 业务模块结构

### 3.1 标准模块结构

```
business-module/
├── src/
│   ├── domain/                   # 领域层
│   │   ├── entities/            # 实体
│   │   ├── aggregates/           # 聚合根
│   │   ├── value-objects/       # 值对象
│   │   ├── domain-services/      # 领域服务
│   │   ├── domain-events/       # 领域事件
│   │   ├── business-rules/      # 业务规则
│   │   └── interfaces/           # 领域接口
│   ├── application/             # 应用层
│   │   ├── use-cases/           # 用例
│   │   ├── commands/            # 命令
│   │   ├── queries/             # 查询
│   │   ├── command-handlers/    # 命令处理器
│   │   ├── query-handlers/      # 查询处理器
│   │   └── services/            # 应用服务
│   ├── infrastructure/          # 基础设施层
│   │   ├── repositories/        # 仓储实现
│   │   ├── external-services/   # 外部服务
│   │   ├── message-queue/       # 消息队列
│   │   └── cache/              # 缓存实现
│   ├── interface/               # 接口层
│   │   ├── controllers/         # 控制器
│   │   ├── resolvers/           # GraphQL解析器
│   │   ├── middleware/           # 中间件
│   │   ├── guards/              # 守卫
│   │   ├── decorators/          # 装饰器
│   │   └── dto/                 # 数据传输对象
│   └── module/                  # 模块定义
│       ├── domain.module.ts     # 领域模块
│       ├── application.module.ts # 应用模块
│       ├── infrastructure.module.ts # 基础设施模块
│       ├── interface.module.ts  # 接口模块
│       └── business.module.ts   # 业务模块
├── test/                        # 测试
│   ├── unit/                    # 单元测试
│   ├── integration/              # 集成测试
│   └── e2e/                     # 端到端测试
├── docs/                        # 文档
│   ├── api/                     # API文档
│   ├── design/                  # 设计文档
│   └── user-guide/              # 用户指南
├── package.json                 # 包配置
├── tsconfig.json               # TypeScript配置
├── jest.config.js              # Jest配置
└── README.md                   # 模块说明
```

### 3.2 模块依赖关系

```
Business Module
├── @hl8/domain-kernel          # 领域层核心
├── @hl8/application-kernel     # 应用层核心
├── @hl8/infrastructure-kernel # 基础设施层核心
├── @hl8/interface-kernel        # 接口层核心
├── @hl8/config                # 配置管理
├── @hl8/database              # 数据库管理
├── @hl8/caching               # 缓存管理
├── @hl8/messaging             # 消息管理
└── @hl8/exceptions            # 异常处理
```

### 3.3 优先使用 kernel 组件

> **⚠️ 重要**: 业务模块的开发**必须基于**以下 kernel 和基础库提供的通用组件：
> - **@hl8/domain-kernel** - 领域层核心
> - **@hl8/application-kernel** - 应用层核心
> - **@hl8/infrastructure-kernel** - 基础设施层核心
> - **@hl8/interface-kernel** - 接口层核心
> - **@hl8/exceptions** - 异常处理
> - **@hl8/caching** - 缓存管理
> - **@hl8/config** - 配置管理
> - **@hl8/nestjs-fastify** - Fastify 集成和 logging
> 
> 因此，必须优先使用这些 kernel 和基础库提供的组件，而不是重新定义。

#### 3.3.1 为什么必须基于 kernel 层？

业务模块开发必须基于 kernel 层，使用其提供的组件有以下重要优势：

- **统一架构**: 所有业务模块基于相同的架构，确保一致性和可维护性
- **保证一致性**: 使用相同的基类和接口，确保行为一致
- **减少重复**: 避免在每个模块中重复定义相同的类
- **简化维护**: 只需在一个地方维护和更新
- **类型安全**: 统一的类型定义确保类型安全
- **多租户支持**: 正确的数据隔离机制
- **架构清晰**: 明确的分层架构，便于理解和扩展

#### 3.3.2 Domain-Kernel 组件（领域层）

**3.3.2.1 必须使用的基类**

所有领域实体、聚合根和值对象都应该继承 domain-kernel 提供的基类：

```typescript
// ✅ 正确：使用 domain-kernel 的基类
import { BaseEntity, AggregateRoot, BaseValueObject } from "@hl8/domain-kernel";

export class User extends BaseEntity {
  // ...
}

export class OrderAggregate extends AggregateRoot {
  // ...
}

export class Email extends BaseValueObject {
  // ...
}
```

```typescript
// ❌ 错误：自己定义基类
export abstract class BaseEntity {
  // ... 重复定义
}
```

**3.3.2.2 必须使用的 ID 值对象**

所有实体 ID 都应该使用 domain-kernel 提供的 ID 值对象：

```typescript
// ✅ 正确：使用 domain-kernel 的 ID 值对象
import { 
  TenantId, 
  OrganizationId, 
  DepartmentId, 
  UserId,
  GenericEntityId 
} from "@hl8/domain-kernel";

export class User extends BaseEntity {
  constructor(
    id: UserId,
    // ...
  ) {
    super(id);
  }
}
```

```typescript
// ❌ 错误：自己定义 ID 值对象
export class UserId extends BaseValueObject {
  // ... 重复定义
}
```

**3.3.2.3 必须使用的数据隔离机制**

所有涉及多租户数据访问的操作都必须使用 `IsolationContext`：

#### 3.3.3 Application-Kernel 组件（应用层）

**必须优先使用** `@hl8/application-kernel` 提供的以下组件：

```typescript
// ✅ 正确：使用 application-kernel 的基类
import { 
  BaseCommand, 
  BaseQuery, 
  BaseUseCase,
  CommandHandler,
  QueryHandler
} from "@hl8/application-kernel";

export class CreateUserCommand extends BaseCommand { ... }
export class GetUserQuery extends BaseQuery { ... }
export class CreateUserUseCase extends BaseUseCase { ... }
export class CreateUserHandler implements CommandHandler { ... }
```

#### 3.3.4 Infrastructure-Kernel 组件（基础设施层）

**必须优先使用** `@hl8/infrastructure-kernel` 提供的以下组件：

```typescript
// ✅ 正确：使用 infrastructure-kernel 的接口
import { 
  IDatabaseAdapter,
  ICacheService,
  IMessageBroker
} from "@hl8/infrastructure-kernel";

export class UserRepository implements IDatabaseAdapter { ... }
export class RedisCacheService implements ICacheService { ... }
export class RabbitMQBroker implements IMessageBroker { ... }
```

#### 3.3.5 Interface-Kernel 组件（接口层）

**必须优先使用** `@hl8/interface-kernel` 提供的以下组件：

```typescript
// ✅ 正确：使用 interface-kernel 的基类和守卫
import { 
  RestController,
  AuthenticationGuard,
  AuthorizationGuard
} from "@hl8/interface-kernel";

export class UserController extends RestController {
  @Get()
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  public async getUsers() { ... }
}
```

#### 3.3.6 Exceptions 组件（异常处理）

**必须优先使用** `@hl8/exceptions` 提供的异常类：

```typescript
// ✅ 正确：使用 exceptions 库的异常类
import { 
  DomainException,
  BusinessException,
  ValidationException,
  NotFoundException
} from "@hl8/exceptions";

export class UserService {
  public async getUser(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
```

```typescript
// ❌ 错误：自己定义异常类
export class NotFoundException extends Error {
  // ... 重复定义
}
```

#### 3.3.7 Caching 组件（缓存管理）

**必须优先使用** `@hl8/caching` 提供的缓存服务：

```typescript
// ✅ 正确：使用 caching 库的缓存服务
import { ICacheService } from "@hl8/caching";

@Injectable()
export class UserService {
  constructor(private readonly cacheService: ICacheService) {}
  
  public async getUser(id: string): Promise<User> {
    const cacheKey = `user:${id}`;
    let user = await this.cacheService.get<User>(cacheKey);
    
    if (!user) {
      user = await this.userRepository.findById(id);
      await this.cacheService.set(cacheKey, user, 3600);
    }
    
    return user;
  }
}
```

#### 3.3.8 Config 组件（配置管理）

**必须优先使用** `@hl8/config` 提供的配置管理：

```typescript
// ✅ 正确：使用 config 库的配置服务
import { ConfigService } from "@hl8/config";

@Injectable()
export class DatabaseService {
  constructor(private readonly configService: ConfigService) {}
  
  public getConnectionString(): string {
    return this.configService.get("DATABASE_URL") || 
           this.configService.get("database.url");
  }
}
```

#### 3.3.9 NestJS-Fastify 组件（Logging）

**必须优先使用** `@hl8/nestjs-fastify` 提供的 logging 组件：

```typescript
// ✅ 正确：使用 nestjs-fastify 的 logging
import { Logger } from "@hl8/nestjs-fastify";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  
  public async createUser(data: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user: ${data.email}`);
    
    try {
      const user = await this.userRepository.create(data);
      this.logger.log(`User created successfully: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

```typescript
// ❌ 错误：自己实现 logging
console.log("Creating user"); // 不应该使用 console.log
const logger = new CustomLogger(); // 不应该自己实现 logger
```

```typescript
// ✅ 正确：使用 IsolationContext
import { IsolationContext, SharingLevel } from "@hl8/domain-kernel";

export class UserRepository {
  public async findByTenant(
    tenantId: TenantId,
    context: IsolationContext
  ): Promise<User[]> {
    // 使用 context 进行数据隔离
    return this.query({
      tenantId: context.tenantId.value,
      organizationId: context.organizationId?.value,
      departmentId: context.departmentId?.value,
    });
  }
}
```

```typescript
// ❌ 错误：不使用 IsolationContext
export class UserRepository {
  public async findByTenant(tenantId: string): Promise<User[]> {
    // 没有使用隔离机制
  }
}
```

#### 3.3.10 完整的导入示例

以下是一个完整的实体实现示例，展示如何正确使用 domain-kernel 的组件：

```typescript
import { 
  BaseEntity, 
  EntityId,
  TenantId,
  OrganizationId,
  UserId,
  IsolationContext,
  SharingLevel
} from "@hl8/domain-kernel";

/**
 * 用户实体
 * 
 * @description 用户实体，继承 BaseEntity
 */
export class User extends BaseEntity {
  private _email: Email;
  private _organizationId: OrganizationId | null;
  
  constructor(
    id: UserId,
    tenantId: TenantId,
    email: Email,
    organizationId?: OrganizationId
  ) {
    super(id, tenantId);
    this._email = email;
    this._organizationId = organizationId || null;
  }

  public get email(): Email {
    return this._email;
  }

  public get organizationId(): OrganizationId | null {
    return this._organizationId;
  }

  /**
   * 分配组织
   */
  public assignToOrganization(organizationId: OrganizationId): void {
    this._organizationId = organizationId;
    this.updateTimestamp();
  }
}
```

#### 3.3.11 错误示例和常见问题

**问题 1: 重复定义 ID 值对象**

```typescript
// ❌ 错误：自己定义 TenantId
export class TenantId extends BaseValueObject {
  constructor(private readonly value: string) {
    super();
  }
}

// ✅ 正确：从 domain-kernel 导入
import { TenantId } from "@hl8/domain-kernel";
```

**问题 2: 不使用 IsolationContext**

```typescript
// ❌ 错误：直接传递 ID
public async findUsers(tenantId: string): Promise<User[]> {
  return this.repository.find({ tenantId });
}

// ✅ 正确：使用 IsolationContext
public async findUsers(context: IsolationContext): Promise<User[]> {
  return this.repository.find({
    tenantId: context.tenantId.value,
  });
}
```

**问题 3: 自己实现 BaseEntity**

```typescript
// ❌ 错误：自己实现 BaseEntity
export abstract class BaseEntity {
  protected readonly _id: EntityId;
  // ... 重复实现
}

// ✅ 正确：使用 domain-kernel 的 BaseEntity
import { BaseEntity } from "@hl8/domain-kernel";
```

---

## 4. 开发流程

### 4.1 开发阶段

#### 4.1.1 需求分析阶段

1. **业务需求分析**
   - 理解业务需求
   - 识别业务规则
   - 定义业务流程

2. **技术需求分析**
   - 确定技术架构
   - 选择技术栈
   - 设计接口规范

3. **需求文档编写**
   - 业务需求文档
   - 技术需求文档
   - 接口设计文档

#### 4.1.2 设计阶段

1. **领域建模**
   - 识别领域实体
   - 定义聚合根
   - 设计值对象

2. **架构设计**
   - 四层架构设计
   - 接口设计
   - 数据模型设计

3. **设计文档编写**
   - 架构设计文档
   - 数据库设计文档
   - API设计文档

#### 4.1.3 开发阶段

1. **领域层开发**
   - 实体实现
   - 聚合根实现
   - 领域服务实现

2. **应用层开发**
   - 用例实现
   - 命令查询实现
   - 应用服务实现

3. **基础设施层开发**
   - 仓储实现
   - 外部服务实现
   - 消息队列实现

4. **接口层开发**
   - 控制器实现
   - 中间件实现
   - 守卫实现

#### 4.1.4 测试阶段

1. **单元测试**
   - 领域层测试
   - 应用层测试
   - 基础设施层测试

2. **集成测试**
   - 模块集成测试
   - 系统集成测试
   - 性能测试

3. **端到端测试**
   - 用户场景测试
   - 业务流程测试
   - 异常情况测试

#### 4.1.5 部署阶段

1. **环境准备**
   - 开发环境
   - 测试环境
   - 生产环境

2. **部署配置**
   - 应用配置
   - 数据库配置
   - 缓存配置

3. **监控配置**
   - 日志监控
   - 性能监控
   - 错误监控

### 4.2 开发规范

#### 4.2.1 代码规范

- **命名规范**: 使用有意义的命名
- **注释规范**: 遵循TSDoc规范
- **类型规范**: 使用TypeScript类型
- **错误处理**: 统一的异常处理

#### 4.2.2 提交规范

使用Conventional Commits规范：

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 构建过程或辅助工具的变动
```

#### 4.2.3 分支规范

- **main**: 主分支，生产环境代码
- **develop**: 开发分支，开发环境代码
- **feature/**: 功能分支，新功能开发
- **hotfix/**: 热修复分支，紧急修复
- **release/**: 发布分支，版本发布

---

## 5. 代码实现指南

### 5.1 领域层实现

#### 5.1.1 实体实现

````typescript
/**
 * 用户实体
 *
 * @description 用户业务实体，包含用户相关的业务逻辑
 * 遵循充血模型设计，实体包含业务逻辑而不仅仅是数据容器
 *
 * @example
 * ```typescript
 * const user = new User(
 *   new UserId('user-123'),
 *   new Email('user@example.com'),
 *   new Username('john_doe')
 * );
 *
 * user.changeEmail(new Email('new@example.com'));
 * user.activate();
 * ```
 */
export class User extends BaseEntity {
  private _email: Email;
  private _username: Username;
  private _status: UserStatus;
  private _profile: UserProfile;

  constructor(
    id: UserId,
    email: Email,
    username: Username,
    profile?: UserProfile,
  ) {
    super(id);
    this._email = email;
    this._username = username;
    this._status = UserStatus.PENDING;
    this._profile = profile || UserProfile.createDefault();

    // 发布用户创建事件
    this.addDomainEvent(
      new UserCreatedEvent(this.id, this.email, this.username),
    );
  }

  /**
   * 获取用户邮箱
   *
   * @returns 用户邮箱
   */
  public get email(): Email {
    return this._email;
  }

  /**
   * 获取用户状态
   *
   * @returns 用户状态
   */
  public get status(): UserStatus {
    return this._status;
  }

  /**
   * 更改用户邮箱
   *
   * @param newEmail 新邮箱
   * @throws InvalidEmailException 邮箱格式无效时抛出
   * @throws UserNotActiveException 用户未激活时抛出
   *
   * @example
   * ```typescript
   * user.changeEmail(new Email('new@example.com'));
   * ```
   */
  public changeEmail(newEmail: Email): void {
    // 业务规则验证
    if (!this.isActive()) {
      throw new UserNotActiveException(this.id);
    }

    if (this._email.equals(newEmail)) {
      return; // 相同邮箱，无需更改
    }

    // 执行邮箱更改
    const oldEmail = this._email;
    this._email = newEmail;

    // 发布邮箱更改事件
    this.addDomainEvent(new UserEmailChangedEvent(this.id, oldEmail, newEmail));
  }

  /**
   * 激活用户
   *
   * @throws UserAlreadyActiveException 用户已激活时抛出
   *
   * @example
   * ```typescript
   * user.activate();
   * ```
   */
  public activate(): void {
    if (this.isActive()) {
      throw new UserAlreadyActiveException(this.id);
    }

    this._status = UserStatus.ACTIVE;
    this.addDomainEvent(new UserActivatedEvent(this.id));
  }

  /**
   * 检查用户是否激活
   *
   * @returns 是否激活
   */
  public isActive(): boolean {
    return this._status === UserStatus.ACTIVE;
  }

  /**
   * 更新用户资料
   *
   * @param profile 用户资料
   * @throws UserNotActiveException 用户未激活时抛出
   */
  public updateProfile(profile: UserProfile): void {
    if (!this.isActive()) {
      throw new UserNotActiveException(this.id);
    }

    this._profile = profile;
    this.addDomainEvent(new UserProfileUpdatedEvent(this.id, profile));
  }
}
````

#### 5.1.2 聚合根实现

````typescript
/**
 * 订单聚合根
 *
 * @description 订单聚合根，管理订单相关的业务逻辑
 * 负责维护订单的一致性边界和业务规则
 *
 * @example
 * ```typescript
 * const order = new Order(
 *   new OrderId('order-123'),
 *   new CustomerId('customer-456'),
 *   [orderItem1, orderItem2]
 * );
 *
 * order.addItem(new OrderItem(...));
 * order.confirm();
 * ```
 */
export class Order extends AggregateRoot {
  private _customerId: CustomerId;
  private _items: OrderItem[];
  private _status: OrderStatus;
  private _totalAmount: Money;
  private _shippingAddress: Address;

  constructor(id: OrderId, customerId: CustomerId, items: OrderItem[] = []) {
    super(id);
    this._customerId = customerId;
    this._items = [...items];
    this._status = OrderStatus.DRAFT;
    this._totalAmount = this.calculateTotalAmount();

    // 验证业务规则
    this.validateOrderRules();

    // 发布订单创建事件
    this.addDomainEvent(new OrderCreatedEvent(this.id, this.customerId));
  }

  /**
   * 添加订单项
   *
   * @param item 订单项
   * @throws OrderClosedException 订单已关闭时抛出
   * @throws InvalidOrderItemException 订单项无效时抛出
   */
  public addItem(item: OrderItem): void {
    // 业务规则验证
    if (this.isClosed()) {
      throw new OrderClosedException(this.id);
    }

    if (!item.isValid()) {
      throw new InvalidOrderItemException(item);
    }

    // 添加订单项
    this._items.push(item);
    this._totalAmount = this.calculateTotalAmount();

    // 发布订单项添加事件
    this.addDomainEvent(new OrderItemAddedEvent(this.id, item));
  }

  /**
   * 确认订单
   *
   * @throws OrderClosedException 订单已关闭时抛出
   * @throws EmptyOrderException 订单为空时抛出
   */
  public confirm(): void {
    if (this.isClosed()) {
      throw new OrderClosedException(this.id);
    }

    if (this._items.length === 0) {
      throw new EmptyOrderException(this.id);
    }

    this._status = OrderStatus.CONFIRMED;
    this.addDomainEvent(new OrderConfirmedEvent(this.id, this._totalAmount));
  }

  /**
   * 检查订单是否已关闭
   *
   * @returns 是否已关闭
   */
  public isClosed(): boolean {
    return (
      this._status === OrderStatus.CANCELLED ||
      this._status === OrderStatus.COMPLETED
    );
  }

  /**
   * 计算订单总金额
   *
   * @returns 总金额
   */
  private calculateTotalAmount(): Money {
    return this._items.reduce(
      (total, item) => total.add(item.getSubtotal()),
      Money.zero(),
    );
  }

  /**
   * 验证订单业务规则
   *
   * @throws BusinessRuleValidationException 业务规则验证失败时抛出
   */
  private validateOrderRules(): void {
    const rules = [
      new OrderAmountRule(this._totalAmount),
      new OrderItemCountRule(this._items.length),
      new OrderCustomerRule(this._customerId),
    ];

    for (const rule of rules) {
      const result = rule.validate();
      if (!result.isValid) {
        throw new BusinessRuleValidationException(result.errors);
      }
    }
  }
}
````

#### 5.1.3 值对象实现

````typescript
/**
 * 邮箱值对象
 *
 * @description 邮箱值对象，表示用户邮箱地址
 * 提供邮箱格式验证和不可变性保证
 *
 * @example
 * ```typescript
 * const email = new Email('user@example.com');
 * console.log(email.value); // 'user@example.com'
 * console.log(email.domain); // 'example.com'
 * ```
 */
export class Email extends BaseValueObject {
  private readonly _value: string;
  private readonly _domain: string;
  private readonly _localPart: string;

  constructor(value: string) {
    super();
    this.validateEmail(value);
    this._value = value.toLowerCase().trim();
    [this._localPart, this._domain] = this._value.split("@");
  }

  /**
   * 获取邮箱值
   *
   * @returns 邮箱值
   */
  public get value(): string {
    return this._value;
  }

  /**
   * 获取邮箱域名
   *
   * @returns 域名
   */
  public get domain(): string {
    return this._domain;
  }

  /**
   * 获取邮箱本地部分
   *
   * @returns 本地部分
   */
  public get localPart(): string {
    return this._localPart;
  }

  /**
   * 验证邮箱格式
   *
   * @param email 邮箱地址
   * @throws InvalidEmailException 邮箱格式无效时抛出
   */
  private validateEmail(email: string): void {
    if (!email || typeof email !== "string") {
      throw new InvalidEmailException("邮箱地址不能为空");
    }

    const trimmedEmail = email.trim();
    if (trimmedEmail.length === 0) {
      throw new InvalidEmailException("邮箱地址不能为空");
    }

    if (trimmedEmail.length > 254) {
      throw new InvalidEmailException("邮箱地址长度不能超过254个字符");
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      throw new InvalidEmailException("邮箱地址格式无效");
    }
  }

  /**
   * 比较邮箱是否相等
   *
   * @param other 其他邮箱对象
   * @returns 是否相等
   */
  public equals(other: Email): boolean {
    if (!(other instanceof Email)) {
      return false;
    }

    return this._value === other._value;
  }

  /**
   * 转换为字符串
   *
   * @returns 字符串表示
   */
  public toString(): string {
    return this._value;
  }
}
````

### 5.2 应用层实现

#### 5.2.1 用例实现

````typescript
/**
 * 创建用户用例
 *
 * @description 创建新用户的业务用例
 * 协调领域层和基础设施层，实现用户创建的业务流程
 *
 * @example
 * ```typescript
 * const useCase = new CreateUserUseCase(
 *   userRepository,
 *   eventBus,
 *   emailService
 * );
 *
 * const response = await useCase.execute({
 *   email: 'user@example.com',
 *   username: 'john_doe',
 *   password: 'password123'
 * });
 * ```
 */
export class CreateUserUseCase extends BaseUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly eventBus: IEventBus,
    private readonly emailService: IEmailService,
    private readonly passwordService: IPasswordService,
  ) {
    super();
  }

  /**
   * 执行创建用户用例
   *
   * @param request 创建用户请求
   * @returns 创建用户响应
   * @throws ValidationException 验证失败时抛出
   * @throws DuplicateUserException 用户已存在时抛出
   * @throws EmailServiceException 邮件服务异常时抛出
   */
  public async execute(
    request: CreateUserRequest,
  ): Promise<CreateUserResponse> {
    // 1. 验证输入
    this.validateRequest(request);

    // 2. 检查用户是否已存在
    await this.checkUserExists(request.email, request.username);

    // 3. 创建用户实体
    const user = this.createUser(request);

    // 4. 保存用户
    await this.userRepository.save(user);

    // 5. 发送欢迎邮件
    await this.sendWelcomeEmail(user);

    // 6. 发布领域事件
    await this.eventBus.publish(user.getDomainEvents());

    return new CreateUserResponse(user.id, user.email, user.username);
  }

  /**
   * 验证请求参数
   *
   * @param request 请求对象
   * @throws ValidationException 验证失败时抛出
   */
  private validateRequest(request: CreateUserRequest): void {
    const errors: ValidationError[] = [];

    if (!request.email) {
      errors.push(new ValidationError("email", "邮箱地址不能为空"));
    }

    if (!request.username) {
      errors.push(new ValidationError("username", "用户名不能为空"));
    }

    if (!request.password) {
      errors.push(new ValidationError("password", "密码不能为空"));
    }

    if (errors.length > 0) {
      throw new ValidationException("请求参数验证失败", errors);
    }
  }

  /**
   * 检查用户是否已存在
   *
   * @param email 邮箱地址
   * @param username 用户名
   * @throws DuplicateUserException 用户已存在时抛出
   */
  private async checkUserExists(
    email: string,
    username: string,
  ): Promise<void> {
    const existingUser = await this.userRepository.findByEmailOrUsername(
      email,
      username,
    );
    if (existingUser) {
      throw new DuplicateUserException("用户已存在");
    }
  }

  /**
   * 创建用户实体
   *
   * @param request 请求对象
   * @returns 用户实体
   */
  private createUser(request: CreateUserRequest): User {
    const userId = new UserId(uuid());
    const email = new Email(request.email);
    const username = new Username(request.username);
    const hashedPassword = this.passwordService.hash(request.password);

    return new User(userId, email, username, hashedPassword);
  }

  /**
   * 发送欢迎邮件
   *
   * @param user 用户实体
   * @throws EmailServiceException 邮件服务异常时抛出
   */
  private async sendWelcomeEmail(user: User): Promise<void> {
    const emailMessage = new EmailMessage({
      to: user.email.value,
      subject: "欢迎注册HL8平台",
      body: `欢迎 ${user.username.value} 注册HL8平台！`,
    });

    await this.emailService.sendEmail(emailMessage);
  }
}
````

#### 5.2.2 命令处理器实现

````typescript
/**
 * 创建用户命令处理器
 *
 * @description 处理创建用户命令
 * 实现CQRS模式的命令处理逻辑
 *
 * @example
 * ```typescript
 * const handler = new CreateUserCommandHandler(
 *   userRepository,
 *   eventBus,
 *   emailService
 * );
 *
 * const response = await handler.handle(new CreateUserCommand(
 *   'user@example.com',
 *   'john_doe',
 *   'password123'
 * ));
 * ```
 */
export class CreateUserCommandHandler
  implements CommandHandler<CreateUserCommand, CreateUserResponse>
{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly eventBus: IEventBus,
    private readonly emailService: IEmailService,
  ) {}

  /**
   * 处理创建用户命令
   *
   * @param command 创建用户命令
   * @returns 创建用户响应
   * @throws ValidationException 验证失败时抛出
   * @throws DuplicateUserException 用户已存在时抛出
   */
  public async handle(command: CreateUserCommand): Promise<CreateUserResponse> {
    // 1. 验证命令
    this.validateCommand(command);

    // 2. 检查用户是否已存在
    await this.checkUserExists(command.email, command.username);

    // 3. 创建用户实体
    const user = this.createUser(command);

    // 4. 保存用户
    await this.userRepository.save(user);

    // 5. 发送欢迎邮件
    await this.sendWelcomeEmail(user);

    // 6. 发布领域事件
    await this.eventBus.publish(user.getDomainEvents());

    return new CreateUserResponse(user.id, user.email, user.username);
  }

  /**
   * 验证命令
   *
   * @param command 命令对象
   * @throws ValidationException 验证失败时抛出
   */
  private validateCommand(command: CreateUserCommand): void {
    const errors: ValidationError[] = [];

    if (!command.email) {
      errors.push(new ValidationError("email", "邮箱地址不能为空"));
    }

    if (!command.username) {
      errors.push(new ValidationError("username", "用户名不能为空"));
    }

    if (!command.password) {
      errors.push(new ValidationError("password", "密码不能为空"));
    }

    if (errors.length > 0) {
      throw new ValidationException("命令验证失败", errors);
    }
  }

  /**
   * 检查用户是否已存在
   *
   * @param email 邮箱地址
   * @param username 用户名
   * @throws DuplicateUserException 用户已存在时抛出
   */
  private async checkUserExists(
    email: string,
    username: string,
  ): Promise<void> {
    const existingUser = await this.userRepository.findByEmailOrUsername(
      email,
      username,
    );
    if (existingUser) {
      throw new DuplicateUserException("用户已存在");
    }
  }

  /**
   * 创建用户实体
   *
   * @param command 命令对象
   * @returns 用户实体
   */
  private createUser(command: CreateUserCommand): User {
    const userId = new UserId(uuid());
    const email = new Email(command.email);
    const username = new Username(command.username);

    return new User(userId, email, username);
  }

  /**
   * 发送欢迎邮件
   *
   * @param user 用户实体
   * @throws EmailServiceException 邮件服务异常时抛出
   */
  private async sendWelcomeEmail(user: User): Promise<void> {
    const emailMessage = new EmailMessage({
      to: user.email.value,
      subject: "欢迎注册HL8平台",
      body: `欢迎 ${user.username.value} 注册HL8平台！`,
    });

    await this.emailService.sendEmail(emailMessage);
  }
}
````

### 5.3 基础设施层实现

#### 5.3.1 仓储实现

````typescript
/**
 * 用户仓储实现
 *
 * @description 用户仓储的数据库实现
 * 实现领域层定义的仓储接口，负责用户数据的持久化
 *
 * @example
 * ```typescript
 * const repository = new UserRepository(
 *   entityManager,
 *   isolationContext
 * );
 *
 * await repository.save(user);
 * const foundUser = await repository.findById(userId);
 * ```
 */
export class UserRepository implements IUserRepository {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly isolationContext: IsolationContext,
  ) {}

  /**
   * 保存用户
   *
   * @param user 用户实体
   * @throws DatabaseException 数据库异常时抛出
   */
  public async save(user: User): Promise<void> {
    try {
      const userEntity = this.mapToEntity(user);
      await this.entityManager.persistAndFlush(userEntity);
    } catch (error) {
      throw new DatabaseException("保存用户失败", error);
    }
  }

  /**
   * 根据ID查找用户
   *
   * @param id 用户ID
   * @returns 用户实体或null
   * @throws DatabaseException 数据库异常时抛出
   */
  public async findById(id: UserId): Promise<User | null> {
    try {
      const userEntity = await this.entityManager.findOne(UserEntity, {
        id: id.value,
        tenantId: this.isolationContext.tenantId.value,
      });

      return userEntity ? this.mapToDomain(userEntity) : null;
    } catch (error) {
      throw new DatabaseException("查找用户失败", error);
    }
  }

  /**
   * 根据邮箱或用户名查找用户
   *
   * @param email 邮箱地址
   * @param username 用户名
   * @returns 用户实体或null
   * @throws DatabaseException 数据库异常时抛出
   */
  public async findByEmailOrUsername(
    email: string,
    username: string,
  ): Promise<User | null> {
    try {
      const userEntity = await this.entityManager.findOne(UserEntity, {
        $or: [{ email: email }, { username: username }],
        tenantId: this.isolationContext.tenantId.value,
      });

      return userEntity ? this.mapToDomain(userEntity) : null;
    } catch (error) {
      throw new DatabaseException("查找用户失败", error);
    }
  }

  /**
   * 删除用户
   *
   * @param id 用户ID
   * @throws DatabaseException 数据库异常时抛出
   */
  public async delete(id: UserId): Promise<void> {
    try {
      const userEntity = await this.entityManager.findOne(UserEntity, {
        id: id.value,
        tenantId: this.isolationContext.tenantId.value,
      });

      if (userEntity) {
        await this.entityManager.removeAndFlush(userEntity);
      }
    } catch (error) {
      throw new DatabaseException("删除用户失败", error);
    }
  }

  /**
   * 将领域对象映射为实体
   *
   * @param user 用户领域对象
   * @returns 用户实体
   */
  private mapToEntity(user: User): UserEntity {
    const userEntity = new UserEntity();
    userEntity.id = user.id.value;
    userEntity.email = user.email.value;
    userEntity.username = user.username.value;
    userEntity.status = user.status;
    userEntity.tenantId = this.isolationContext.tenantId.value;
    userEntity.organizationId = this.isolationContext.organizationId?.value;
    userEntity.departmentId = this.isolationContext.departmentId?.value;
    userEntity.createdAt = user.auditInfo.createdAt;
    userEntity.updatedAt = user.auditInfo.updatedAt;

    return userEntity;
  }

  /**
   * 将实体映射为领域对象
   *
   * @param userEntity 用户实体
   * @returns 用户领域对象
   */
  private mapToDomain(userEntity: UserEntity): User {
    const userId = new UserId(userEntity.id);
    const email = new Email(userEntity.email);
    const username = new Username(userEntity.username);

    const user = new User(userId, email, username);

    // 设置用户状态
    if (userEntity.status === UserStatus.ACTIVE) {
      user.activate();
    }

    return user;
  }
}
````

### 5.4 接口层实现

#### 5.4.1 控制器实现

````typescript
/**
 * 用户控制器
 *
 * @description 用户相关的REST API端点
 * 处理用户相关的HTTP请求，协调应用层服务
 *
 * @example
 * ```typescript
 * // 创建用户
 * POST /api/users
 * {
 *   "email": "user@example.com",
 *   "username": "john_doe",
 *   "password": "password123"
 * }
 *
 * // 获取用户
 * GET /api/users/:id
 * ```
 */
@Controller("users")
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  /**
   * 创建用户
   *
   * @param request 创建用户请求
   * @returns 创建用户响应
   * @throws ValidationException 验证失败时抛出
   * @throws DuplicateUserException 用户已存在时抛出
   */
  @Post()
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ summary: "创建用户" })
  @ApiResponse({
    status: 201,
    description: "用户创建成功",
    type: CreateUserResponse,
  })
  @ApiResponse({ status: 400, description: "请求参数无效" })
  @ApiResponse({ status: 409, description: "用户已存在" })
  public async createUser(
    @Body() request: CreateUserRequest,
  ): Promise<CreateUserResponse> {
    return await this.createUserUseCase.execute(request);
  }

  /**
   * 获取用户
   *
   * @param id 用户ID
   * @returns 用户信息
   * @throws UserNotFoundException 用户不存在时抛出
   */
  @Get(":id")
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiOperation({ summary: "获取用户" })
  @ApiResponse({
    status: 200,
    description: "获取用户成功",
    type: GetUserResponse,
  })
  @ApiResponse({ status: 404, description: "用户不存在" })
  public async getUser(@Param("id") id: string): Promise<GetUserResponse> {
    return await this.getUserUseCase.execute(new GetUserRequest(id));
  }

  /**
   * 更新用户
   *
   * @param id 用户ID
   * @param request 更新用户请求
   * @returns 更新用户响应
   * @throws UserNotFoundException 用户不存在时抛出
   * @throws ValidationException 验证失败时抛出
   */
  @Put(":id")
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiOperation({ summary: "更新用户" })
  @ApiResponse({
    status: 200,
    description: "更新用户成功",
    type: UpdateUserResponse,
  })
  @ApiResponse({ status: 404, description: "用户不存在" })
  @ApiResponse({ status: 400, description: "请求参数无效" })
  public async updateUser(
    @Param("id") id: string,
    @Body() request: UpdateUserRequest,
  ): Promise<UpdateUserResponse> {
    return await this.updateUserUseCase.execute(
      new UpdateUserRequest(id, request),
    );
  }

  /**
   * 删除用户
   *
   * @param id 用户ID
   * @returns 删除用户响应
   * @throws UserNotFoundException 用户不存在时抛出
   */
  @Delete(":id")
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiOperation({ summary: "删除用户" })
  @ApiResponse({
    status: 200,
    description: "删除用户成功",
    type: DeleteUserResponse,
  })
  @ApiResponse({ status: 404, description: "用户不存在" })
  public async deleteUser(
    @Param("id") id: string,
  ): Promise<DeleteUserResponse> {
    return await this.deleteUserUseCase.execute(new DeleteUserRequest(id));
  }
}
````

---

## 6. 测试策略

### 6.1 测试层次

#### 6.1.1 单元测试

**领域层测试**:

```typescript
/**
 * 用户实体测试
 *
 * @description 测试用户实体的业务逻辑
 * 确保业务规则的正确实现
 */
describe("User Entity", () => {
  let user: User;
  let userId: UserId;
  let email: Email;
  let username: Username;

  beforeEach(() => {
    userId = new UserId("user-123");
    email = new Email("user@example.com");
    username = new Username("john_doe");
    user = new User(userId, email, username);
  });

  describe("用户创建", () => {
    it("应该创建用户实体", () => {
      expect(user).toBeDefined();
      expect(user.id).toEqual(userId);
      expect(user.email).toEqual(email);
      expect(user.username).toEqual(username);
      expect(user.status).toBe(UserStatus.PENDING);
    });

    it("应该发布用户创建事件", () => {
      const events = user.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(UserCreatedEvent);
    });
  });

  describe("邮箱更改", () => {
    it("应该更改用户邮箱", () => {
      const newEmail = new Email("new@example.com");
      user.changeEmail(newEmail);

      expect(user.email).toEqual(newEmail);
    });

    it("应该发布邮箱更改事件", () => {
      const newEmail = new Email("new@example.com");
      user.changeEmail(newEmail);

      const events = user.getDomainEvents();
      expect(events).toHaveLength(2); // 创建事件 + 邮箱更改事件
      expect(events[1]).toBeInstanceOf(UserEmailChangedEvent);
    });

    it("用户未激活时应该抛出异常", () => {
      const newEmail = new Email("new@example.com");

      expect(() => user.changeEmail(newEmail)).toThrow(UserNotActiveException);
    });
  });

  describe("用户激活", () => {
    it("应该激活用户", () => {
      user.activate();

      expect(user.status).toBe(UserStatus.ACTIVE);
      expect(user.isActive()).toBe(true);
    });

    it("应该发布用户激活事件", () => {
      user.activate();

      const events = user.getDomainEvents();
      expect(events).toHaveLength(2); // 创建事件 + 激活事件
      expect(events[1]).toBeInstanceOf(UserActivatedEvent);
    });

    it("用户已激活时应该抛出异常", () => {
      user.activate();

      expect(() => user.activate()).toThrow(UserAlreadyActiveException);
    });
  });
});
```

**应用层测试**:

```typescript
/**
 * 创建用户用例测试
 *
 * @description 测试创建用户用例的业务逻辑
 * 确保用例的正确实现
 */
describe("CreateUserUseCase", () => {
  let useCase: CreateUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let eventBus: jest.Mocked<IEventBus>;
  let emailService: jest.Mocked<IEmailService>;

  beforeEach(() => {
    userRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmailOrUsername: jest.fn(),
      delete: jest.fn(),
    };

    eventBus = {
      publish: jest.fn(),
    };

    emailService = {
      sendEmail: jest.fn(),
    };

    useCase = new CreateUserUseCase(userRepository, eventBus, emailService);
  });

  describe("执行创建用户用例", () => {
    it("应该成功创建用户", async () => {
      // Arrange
      const request = new CreateUserRequest(
        "user@example.com",
        "john_doe",
        "password123",
      );

      userRepository.findByEmailOrUsername.mockResolvedValue(null);
      userRepository.save.mockResolvedValue();
      eventBus.publish.mockResolvedValue();
      emailService.sendEmail.mockResolvedValue();

      // Act
      const response = await useCase.execute(request);

      // Assert
      expect(response).toBeDefined();
      expect(response.userId).toBeDefined();
      expect(response.email).toBe("user@example.com");
      expect(response.username).toBe("john_doe");

      expect(userRepository.findByEmailOrUsername).toHaveBeenCalledWith(
        "user@example.com",
        "john_doe",
      );
      expect(userRepository.save).toHaveBeenCalled();
      expect(eventBus.publish).toHaveBeenCalled();
      expect(emailService.sendEmail).toHaveBeenCalled();
    });

    it("用户已存在时应该抛出异常", async () => {
      // Arrange
      const request = new CreateUserRequest(
        "user@example.com",
        "john_doe",
        "password123",
      );

      const existingUser = new User(
        new UserId("existing-user"),
        new Email("user@example.com"),
        new Username("john_doe"),
      );

      userRepository.findByEmailOrUsername.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        DuplicateUserException,
      );
    });

    it("请求参数无效时应该抛出异常", async () => {
      // Arrange
      const request = new CreateUserRequest("", "", "");

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        ValidationException,
      );
    });
  });
});
```

#### 6.1.2 集成测试

```typescript
/**
 * 用户模块集成测试
 *
 * @description 测试用户模块的集成功能
 * 确保各层之间的正确协作
 */
describe("User Module Integration", () => {
  let app: INestApplication;
  let userRepository: IUserRepository;
  let eventBus: IEventBus;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        UserModule,
        DatabaseModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          entities: [UserEntity],
          synchronize: true,
        }),
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    userRepository = moduleRef.get<IUserRepository>(IUserRepository);
    eventBus = moduleRef.get<IEventBus>(IEventBus);
  });

  afterAll(async () => {
    await app.close();
  });

  describe("用户创建流程", () => {
    it("应该成功创建用户并保存到数据库", async () => {
      // Arrange
      const createUserRequest = {
        email: "user@example.com",
        username: "john_doe",
        password: "password123",
      };

      // Act
      const response = await request(app.getHttpServer())
        .post("/api/users")
        .send(createUserRequest)
        .expect(201);

      // Assert
      expect(response.body).toBeDefined();
      expect(response.body.userId).toBeDefined();
      expect(response.body.email).toBe("user@example.com");
      expect(response.body.username).toBe("john_doe");

      // 验证数据库中的用户
      const savedUser = await userRepository.findById(
        new UserId(response.body.userId),
      );
      expect(savedUser).toBeDefined();
      expect(savedUser?.email.value).toBe("user@example.com");
    });
  });
});
```

#### 6.1.3 端到端测试

```typescript
/**
 * 用户管理端到端测试
 *
 * @description 测试用户管理的完整业务流程
 * 确保从API到数据库的完整流程
 */
describe("User Management E2E", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("用户生命周期", () => {
    it("应该完成用户创建、激活、更新、删除的完整流程", async () => {
      // 1. 创建用户
      const createResponse = await request(app.getHttpServer())
        .post("/api/users")
        .send({
          email: "user@example.com",
          username: "john_doe",
          password: "password123",
        })
        .expect(201);

      const userId = createResponse.body.userId;

      // 2. 激活用户
      await request(app.getHttpServer())
        .put(`/api/users/${userId}/activate`)
        .expect(200);

      // 3. 更新用户
      await request(app.getHttpServer())
        .put(`/api/users/${userId}`)
        .send({
          profile: {
            firstName: "John",
            lastName: "Doe",
          },
        })
        .expect(200);

      // 4. 获取用户
      const getUserResponse = await request(app.getHttpServer())
        .get(`/api/users/${userId}`)
        .expect(200);

      expect(getUserResponse.body.status).toBe("ACTIVE");
      expect(getUserResponse.body.profile.firstName).toBe("John");

      // 5. 删除用户
      await request(app.getHttpServer())
        .delete(`/api/users/${userId}`)
        .expect(200);

      // 6. 验证用户已删除
      await request(app.getHttpServer())
        .get(`/api/users/${userId}`)
        .expect(404);
    });
  });
});
```

### 6.2 测试覆盖率

#### 6.2.1 覆盖率要求

- **领域层**: >= 90%
- **应用层**: >= 85%
- **基础设施层**: >= 80%
- **接口层**: >= 75%

#### 6.2.2 测试配置

```typescript
// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: ["**/__tests__/**/*.test.ts", "**/?(*.)+(spec|test).ts"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
```

---

## 7. 部署和集成

### 7.1 部署配置

#### 7.1.1 Docker配置

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

#### 7.1.2 Docker Compose配置

```yaml
# docker-compose.yml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=hl8_platform
      - POSTGRES_USER=hl8_user
      - POSTGRES_PASSWORD=hl8_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 7.2 环境配置

#### 7.2.1 开发环境

```bash
# .env.development
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=hl8_platform_dev
DB_USERNAME=hl8_user
DB_PASSWORD=hl8_password

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

LOGGING_LEVEL=debug
LOGGING_PRETTY_PRINT=true
```

#### 7.2.2 生产环境

```bash
# .env.production
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=hl8_platform
DB_USERNAME=hl8_user
DB_PASSWORD=${DB_PASSWORD}

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}

LOGGING_LEVEL=info
LOGGING_PRETTY_PRINT=false
```

### 7.3 监控配置

#### 7.3.1 日志监控

```typescript
// 日志配置
export const loggingConfig = {
  level: process.env.LOGGING_LEVEL || "info",
  prettyPrint: process.env.LOGGING_PRETTY_PRINT === "true",
  includeIsolationContext: true,
  timestamp: true,
  enabled: true,
};
```

#### 7.3.2 性能监控

```typescript
// 性能监控配置
export const metricsConfig = {
  defaultLabels: {
    app: "hl8-platform",
    environment: process.env.NODE_ENV || "development",
  },
  includeTenantMetrics: true,
  path: "/metrics",
  enableDefaultMetrics: true,
};
```

---

## 8. 最佳实践

### 8.1 开发最佳实践

#### 8.1.1 代码组织

- **模块化设计**: 每个业务模块独立开发
- **接口优先**: 先定义接口，再实现具体类
- **依赖注入**: 使用依赖注入管理对象生命周期
- **错误处理**: 统一的异常处理机制

#### 8.1.2 性能优化

- **数据库优化**: 合理使用索引，避免N+1查询
- **缓存策略**: 合理使用缓存，提高响应速度
- **连接池**: 配置合适的数据库连接池
- **异步处理**: 使用异步处理提高并发性能

#### 8.1.3 安全考虑

- **输入验证**: 严格验证所有输入参数
- **权限控制**: 实现细粒度的权限控制
- **数据隔离**: 确保多租户数据隔离
- **敏感信息**: 保护敏感信息，使用加密存储

### 8.2 测试最佳实践

#### 8.2.1 测试策略

- **测试金字塔**: 单元测试 > 集成测试 > 端到端测试
- **测试隔离**: 每个测试独立运行
- **测试数据**: 使用测试数据工厂
- **模拟依赖**: 合理使用模拟对象

#### 8.2.2 测试质量

- **覆盖率要求**: 达到要求的测试覆盖率
- **测试命名**: 使用描述性的测试名称
- **测试组织**: 合理组织测试结构
- **测试维护**: 及时更新测试代码

### 8.3 部署最佳实践

#### 8.3.1 环境管理

- **环境隔离**: 开发、测试、生产环境隔离
- **配置管理**: 使用环境变量管理配置
- **密钥管理**: 安全存储和管理密钥
- **版本控制**: 使用版本控制管理代码

#### 8.3.2 监控运维

- **日志管理**: 集中化日志管理
- **性能监控**: 实时监控系统性能
- **错误追踪**: 及时追踪和修复错误
- **容量规划**: 合理规划系统容量

---

## 📝 总结

业务模块开发指南为HL8 SAAS平台的业务模块开发提供了完整的指导。通过遵循混合架构模式、使用统一的基础设施、实施全面的测试策略，可以确保业务模块的高质量开发和部署。

该指南涵盖了从需求分析到部署运维的完整开发流程，为开发团队提供了清晰的开发路径和最佳实践，支持快速、高质量的软件开发。
