# Domain Kernel

> **版本**: 1.0.0 | **创建日期**: 2025-01-27 | **模块**: libs/domain-kernel

## 📋 概述

Domain Kernel 是 Hybrid Architecture 的核心领域层，提供纯领域层的组件和功能。该模块完全无外部依赖，专注于业务逻辑和业务规则的实现。

## 🏗️ 架构特性

### 核心设计原则

- **充血模型**: 实体包含业务逻辑，不仅仅是数据容器
- **实体与聚合根分离**: 聚合根作为管理者，实体作为被管理者
- **指令模式**: 聚合根发出指令，实体执行指令
- **事件溯源**: 支持事件流重建状态
- **事件驱动**: 支持领域事件发布和处理
- **多租户支持**: 内置租户隔离和权限控制
- **领域层验证**: 完整的业务规则和约束验证系统

### 架构模式支持

- **Clean Architecture**: 领域层无外部依赖
- **CQRS**: 命令查询职责分离
- **Event Sourcing**: 事件溯源
- **Event-Driven Architecture**: 事件驱动架构

## 📦 核心组件

### 基础类

- **BaseEntity**: 基础实体类，提供生命周期管理
- **BaseValueObject**: 基础值对象类，提供不可变性
- **AggregateRoot**: 聚合根基类，支持事件溯源和指令模式
- **BaseDomainService**: 基础领域服务类

### 实体 (Entities)

- **IsolationContext**: 隔离上下文实体，管理多租户数据隔离

### 值对象 (Value Objects)

- **EntityId**: 实体ID基类
- **TenantId**: 租户ID
- **OrganizationId**: 组织ID
- **DepartmentId**: 部门ID
- **UserId**: 用户ID
- **GenericEntityId**: 通用实体ID

### 聚合根 (Aggregate Roots)

- **AggregateRoot**: 聚合根基类，支持事件溯源和指令模式

### 领域事件 (Domain Events)

- **DomainEvent**: 领域事件基类
- **IsolationContextCreatedEvent**: 隔离上下文创建事件
- **IsolationContextSwitchedEvent**: 隔离上下文切换事件
- **DataAccessDeniedEvent**: 数据访问拒绝事件（已移动到isolation模块）

### 领域服务 (Domain Services)

- **BaseDomainService**: 基础领域服务类

### 业务规则 (Business Rules)

- **BusinessRuleValidator**: 业务规则验证器基类
- **BusinessRuleManager**: 业务规则管理器
- **BusinessRuleFactory**: 业务规则工厂
- **BusinessRules**: 业务规则常量
- **具体业务规则验证器**:
  - `UserRegistrationBusinessRule`: 用户注册业务规则验证
  - `OrderCreationBusinessRule`: 订单创建业务规则验证
  - `UserStateBusinessRule`: 用户状态业务规则验证

### 规格模式 (Specification Pattern)

- **BaseSpecification**: 基础规格抽象类
- **AndSpecification**: 与规格
- **OrSpecification**: 或规格
- **NotSpecification**: 非规格
- **SpecificationFactory**: 规格工厂
- **具体规格实现**:
  - `UserActiveSpecification`: 用户激活规格
  - `UserEmailFormatSpecification`: 用户邮箱格式规格
  - `UsernameFormatSpecification`: 用户名格式规格
  - `UserLifecycleSpecification`: 用户生命周期规格
  - `ValidUserSpecification`: 有效用户规格（组合规格）
  - `OrderAmountSpecification`: 订单金额规格
  - `OrderStatusSpecification`: 订单状态规格
  - `OrderItemsSpecification`: 订单项规格
  - `OrderLifecycleSpecification`: 订单生命周期规格
  - `ValidOrderSpecification`: 有效订单规格（组合规格）

### 示例实现

- **User**: 用户实体示例
- **UserAggregate**: 用户聚合根示例
- **Email**: 邮箱值对象示例
- **Username**: 用户名值对象示例
- **UserStatus**: 用户状态枚举示例

## 🚀 快速开始

### 安装

```bash
pnpm add @hl8/domain-kernel
```

### 基本使用

```typescript
import {
  UserAggregate,
  User,
  Email,
  Username,
  UserId,
  TenantId,
} from "@hl8/domain-kernel";

// 创建用户聚合根
const userId = UserId.create();
const tenantId = TenantId.create("t123");
const userAggregate = new UserAggregate(userId, tenantId);

// 创建用户
const email = Email.create("test@example.com");
const username = Username.create("testuser");
userAggregate.createUser(email, username);

// 激活用户
userAggregate.activateUser();

// 获取领域事件
const events = userAggregate.pullEvents();
console.log(events); // [UserCreatedEvent, UserActivatedEvent]
```

### 业务规则使用

```typescript
import {
  BusinessRuleManager,
  BusinessRuleFactory,
  UserRegistrationBusinessRule,
  OrderCreationBusinessRule,
} from "@hl8/domain-kernel";

// 方式1：使用工厂创建默认管理器
const defaultManager = BusinessRuleFactory.createDefaultManager();

// 方式2：手动创建和管理
const customManager = new BusinessRuleManager();
customManager.registerValidator(new UserRegistrationBusinessRule());
customManager.registerValidator(new OrderCreationBusinessRule());

// 验证用户注册
const userContext = {
  operation: "user_registration",
  userData: {
    email: "user@example.com",
    username: "john_doe",
    password: "SecurePass123!",
    age: 25,
  },
};

const result = customManager.validateAll(userContext);

if (!result.isValid) {
  console.log(
    "验证失败:",
    result.errors.map((e) => e.message),
  );
} else {
  console.log("验证通过");
  if (result.warnings.length > 0) {
    console.log(
      "警告:",
      result.warnings.map((w) => w.message),
    );
  }
}
```

### 规格模式使用

```typescript
import {
  SpecificationFactory,
  UserActiveSpecification,
  UserEmailFormatSpecification,
  ValidUserSpecification,
  type UserData,
} from "@hl8/domain-kernel";

// 创建用户数据
const user: UserData = {
  id: "user1",
  email: "user@example.com",
  username: "john_doe",
  status: "ACTIVE",
  isDeleted: false,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-02"),
};

// 方式1：使用单个规格
const activeSpec = SpecificationFactory.createUserActiveSpecification();
const emailSpec = SpecificationFactory.createUserEmailFormatSpecification();

console.log("用户激活检查:", activeSpec.isSatisfiedBy(user));
console.log("用户邮箱检查:", emailSpec.isSatisfiedBy(user));

// 方式2：组合规格
const combinedSpec = activeSpec.and(emailSpec);
console.log("组合规格检查:", combinedSpec.isSatisfiedBy(user));

// 方式3：使用复杂规格
const validUserSpec = SpecificationFactory.createValidUserSpecification();
const result = validUserSpec.check(user);

if (result.isSatisfied) {
  console.log("用户验证通过");
} else {
  console.log("用户验证失败:", result.errorMessage);
}
```

## 📚 详细文档

### 实体与聚合根分离

Domain Kernel 实现了实体与聚合根分离的设计模式：

```typescript
// 聚合根 - 管理者
export class UserAggregate extends AggregateRoot {
  private _user?: User;

  public activateUser(): void {
    // 1. 委托给内部实体执行
    this._user.activate();

    // 2. 发布领域事件
    this.apply(this.createDomainEvent("UserActivated", {...}));
  }
}

// 实体 - 被管理者
export class User extends BaseEntity {
  public activate(): void {
    // 执行具体的业务逻辑
    if (this.status !== UserStatus.PENDING) {
      throw new UserNotPendingException();
    }
    this.status = UserStatus.ACTIVE;
    this.updateTimestamp();
  }
}
```

### 事件溯源支持

```typescript
// 从事件流重建状态
const events = await eventStore.getEvents(aggregateId);
aggregate.replayEvents(events);

// 创建快照
const snapshot = aggregate.createSnapshot();

// 从快照恢复
aggregate.restoreFromSnapshot(snapshot, version);
```

### 业务规则验证

```typescript
import { BusinessRuleManager, BusinessRules } from "@hl8/domain-kernel";

const ruleManager = new BusinessRuleManager();

// 注册业务规则
ruleManager.registerValidator(new EmailUniquenessValidator());

// 验证业务规则
const result = ruleManager.validateAll(context);
if (!result.isValid) {
  console.log("业务规则验证失败:", result.errors);
}
```

## 🧪 测试

```bash
# 运行测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage
```

## 📖 开发指南

详细的开发指南请参考：[领域层开发指南](./docs/06-DOMAIN_LAYER_DEVELOPMENT_GUIDE.md)

## 🔧 配置

### TypeScript 配置

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true
  }
}
```

### ESLint 配置

```javascript
module.exports = {
  extends: ["@repo/eslint-config"],
  // 其他配置...
};
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如有问题，请联系开发团队。
