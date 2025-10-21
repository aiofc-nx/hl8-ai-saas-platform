# Application Kernel 快速开始

> **版本**: 1.0.0 | **创建日期**: 2025-01-21

---

## 🚀 快速开始

### 1. 安装

```bash
npm install @hl8/application-kernel @hl8/domain-kernel
```

### 2. 基本使用

#### 2.1 创建命令

```typescript
import { BaseCommand } from '@hl8/application-kernel';
import { IsolationContext } from '@hl8/domain-kernel';

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

#### 2.2 创建查询

```typescript
import { BaseQuery } from '@hl8/application-kernel';
import { UserId } from '@hl8/domain-kernel';

export class GetUserQuery extends BaseQuery {
  constructor(
    public readonly userId: UserId,
    isolationContext?: IsolationContext,
  ) {
    super('GetUserQuery', '获取用户查询', isolationContext);
  }
}
```

#### 2.3 创建用例

```typescript
import { BaseUseCase } from '@hl8/application-kernel';

export class CreateUserUseCase extends BaseUseCase {
  async execute(command: CreateUserCommand): Promise<string> {
    // 实现用例逻辑
    const userId = 'user-' + Date.now();
    return userId;
  }
}
```

### 3. 上下文管理

```typescript
import { IsolationContext, TenantId, UserId } from '@hl8/domain-kernel';

// 创建租户级上下文
const tenantContext = IsolationContext.createTenant(
  TenantId.create('tenant-123')
);

// 创建用户级上下文
const userContext = IsolationContext.createUser(
  TenantId.create('tenant-123'),
  OrganizationId.create('org-456'),
  DepartmentId.create('dept-789'),
  UserId.create('user-001')
);
```

### 4. 事件处理

```typescript
import { EventPublisher } from '@hl8/application-kernel';

export class UserService {
  constructor(private readonly eventPublisher: EventPublisher) {}
  
  async createUser(email: string, username: string): Promise<void> {
    // 创建用户逻辑
    const userId = 'user-' + Date.now();
    
    // 发布事件
    await this.eventPublisher.publishEvent({
      type: 'UserCreated',
      userId,
      email,
      username,
      timestamp: new Date()
    });
  }
}
```

### 5. 事务管理

```typescript
import { TransactionManager } from '@hl8/application-kernel';

export class OrderService {
  constructor(private readonly transactionManager: TransactionManager) {}
  
  async processOrder(orderData: any): Promise<void> {
    await this.transactionManager.executeInTransaction(async () => {
      // 创建订单
      const order = await this.createOrder(orderData);
      
      // 扣减库存
      await this.reduceInventory(order.items);
      
      // 处理支付
      await this.processPayment(order.payment);
    });
  }
}
```

---

## 📖 更多信息

- [完整开发指南](./APPLICATION_LAYER_DEVELOPMENT_GUIDE.md)
- [API 参考](./API_REFERENCE.md)
- [示例项目](../examples/)

---

**需要帮助？** 查看 [常见问题](./APPLICATION_LAYER_DEVELOPMENT_GUIDE.md#11-常见问题) 或提交 Issue。
