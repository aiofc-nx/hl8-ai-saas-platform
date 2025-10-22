# 领域层验证指南

> **版本**: 1.0.0 | **创建日期**: 2025-01-21 | **模块**: libs/domain-kernel

---

## 📋 目录

- [1. 概述](#1-概述)
- [2. 验证架构](#2-验证架构)
- [3. 验证器类型](#3-验证器类型)
- [4. 使用示例](#4-使用示例)
- [5. 最佳实践](#5-最佳实践)
- [6. 常见问题](#6-常见问题)

---

## 1. 概述

### 1.1 领域层验证的作用

领域层验证专注于业务规则和领域约束的验证，确保：

- **业务规则正确性**: 验证业务逻辑和约束条件
- **实体状态一致性**: 验证实体状态转换的合法性
- **值对象约束**: 验证值对象的业务约束
- **领域事件完整性**: 验证领域事件的合法性和顺序

### 1.2 验证分层

```
应用层验证 (application-kernel)
├── 架构模式合规验证
├── 接口实现验证
└── CQRS模式验证

领域层验证 (domain-kernel) ← 当前实现
├── 业务规则验证
├── 实体状态验证
├── 值对象约束验证
└── 领域事件验证

接口层验证 (interface-kernel)
├── 输入格式验证
├── 数据类型验证
└── 权限验证
```

---

## 2. 验证架构

### 2.1 核心组件

#### **DomainValidator** - 领域验证器基类

```typescript
export abstract class DomainValidator {
  abstract validate(context: DomainValidationContext): DomainValidationResult;
  abstract getValidatorName(): string;
  abstract getValidatorDescription(): string;
  isApplicable(context: DomainValidationContext): boolean;
  getPriority(): number;
}
```

#### **DomainValidationManager** - 验证管理器

```typescript
export class DomainValidationManager {
  registerValidator(validator: DomainValidator): void;
  validateAll(context: DomainValidationContext): DomainValidationResult;
  getValidators(): DomainValidator[];
  clearValidators(): void;
}
```

#### **DomainValidationResult** - 验证结果

```typescript
export interface DomainValidationResult {
  isValid: boolean;
  errors: DomainValidationError[];
  warnings: DomainValidationWarning[];
}
```

### 2.2 验证流程

```typescript
// 1. 创建验证管理器
const validationManager = new DomainValidationManager();

// 2. 注册验证器
validationManager.registerValidator(
  new UserRegistrationBusinessRuleValidator(),
);

// 3. 创建验证上下文
const context: DomainValidationContext = {
  operation: "user_registration",
  metadata: { userData },
};

// 4. 执行验证
const result = validationManager.validateAll(context);

// 5. 处理验证结果
if (!result.isValid) {
  console.log("验证失败:", result.errors);
}
```

---

## 3. 验证器类型

### 3.1 业务规则验证器

#### **UserRegistrationBusinessRuleValidator**

验证用户注册的业务规则：

```typescript
// 验证邮箱格式
if (!this.isValidEmail(userData.email)) {
  errors.push({
    code: "INVALID_EMAIL_FORMAT",
    message: "邮箱格式无效",
    field: "email",
  });
}

// 验证密码强度
const passwordValidation = this.validatePasswordStrength(userData.password);
if (!passwordValidation.isValid) {
  errors.push({
    code: "WEAK_PASSWORD",
    message: passwordValidation.message,
    field: "password",
  });
}
```

#### **OrderCreationBusinessRuleValidator**

验证订单创建的业务规则：

```typescript
// 验证订单金额
if (!orderData.amount || orderData.amount <= 0) {
  errors.push({
    code: "INVALID_ORDER_AMOUNT",
    message: "订单金额必须大于0",
    field: "amount",
  });
}

// 验证库存
if (item.quantity > item.availableStock) {
  warnings.push({
    code: "INSUFFICIENT_STOCK",
    message: `商品 ${item.name} 库存不足`,
    field: "items.stock",
  });
}
```

### 3.2 实体状态验证器

#### **UserStateValidator**

验证用户状态转换：

```typescript
// 验证状态转换
const validTransitions: Record<string, string[]> = {
  PENDING: ["ACTIVE", "REJECTED"],
  ACTIVE: ["SUSPENDED", "INACTIVE"],
  SUSPENDED: ["ACTIVE", "INACTIVE"],
  INACTIVE: ["ACTIVE"],
  REJECTED: [],
};

if (!allowedTransitions.includes(newStatus)) {
  errors.push({
    code: "INVALID_STATUS_TRANSITION",
    message: `不能从状态 ${currentStatus} 转换到 ${newStatus}`,
  });
}
```

#### **OrderStateValidator**

验证订单状态转换：

```typescript
// 验证订单状态与支付状态的一致性
const validCombinations: Record<string, string[]> = {
  CONFIRMED: ["PAID", "PROCESSING"],
  SHIPPED: ["PAID"],
  DELIVERED: ["PAID"],
};

if (!allowedPaymentStatuses.includes(paymentStatus)) {
  errors.push({
    code: "INCONSISTENT_ORDER_PAYMENT_STATUS",
    message: `订单状态 ${orderStatus} 与支付状态 ${paymentStatus} 不匹配`,
  });
}
```

### 3.3 值对象验证器

#### **EmailValueObjectValidator**

验证邮箱值对象：

```typescript
// 验证邮箱格式
if (!this.isValidEmailFormat(email)) {
  errors.push({
    code: "INVALID_EMAIL_FORMAT",
    message: "邮箱格式无效",
    field: "email",
  });
}

// 验证可疑域名
const suspiciousDomains = ["tempmail.com", "10minutemail.com"];
if (suspiciousDomains.includes(domain.toLowerCase())) {
  warnings.push({
    code: "SUSPICIOUS_EMAIL_DOMAIN",
    message: "检测到临时邮箱域名，建议使用正式邮箱",
  });
}
```

#### **DateRangeValueObjectValidator**

验证日期范围值对象：

```typescript
// 验证日期范围
if (startDate >= endDate) {
  errors.push({
    code: "INVALID_DATE_RANGE",
    message: "开始日期必须早于结束日期",
  });
}

// 验证日期范围跨度
const daysDiff = Math.ceil(
  (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
);
if (daysDiff > 365) {
  warnings.push({
    code: "LONG_DATE_RANGE",
    message: "日期范围跨度超过一年，请确认是否合理",
  });
}
```

### 3.4 领域事件验证器

#### **UserDomainEventValidator**

验证用户领域事件：

```typescript
// 验证事件顺序
const validEventSequences: Record<string, string[]> = {
  UserCreated: ["UserStatusChanged", "UserEmailChanged", "UserDeleted"],
  UserStatusChanged: ["UserStatusChanged", "UserEmailChanged", "UserDeleted"],
  UserDeleted: [], // 删除后不能再有其他事件
};

if (!allowedNextEvents.includes(event.eventType)) {
  errors.push({
    code: "INVALID_EVENT_SEQUENCE",
    message: `事件 ${previousEventType} 后不能跟随 ${currentEventType}`,
  });
}
```

---

## 4. 使用示例

### 4.1 用户注册验证

```typescript
import { UserRegistrationValidationExample } from "@hl8/domain-kernel";

const validator = new UserRegistrationValidationExample();

const userData = {
  email: "user@example.com",
  username: "john_doe",
  password: "SecurePass123!",
  age: 25,
};

const result = await validator.validateUserRegistration(userData);

if (!result.isValid) {
  console.log("验证失败:", result.errors);
} else {
  console.log("验证通过");
  if (result.warnings.length > 0) {
    console.log("警告:", result.warnings);
  }
}
```

### 4.2 订单创建验证

```typescript
import { OrderCreationValidationExample } from "@hl8/domain-kernel";

const validator = new OrderCreationValidationExample();

const orderData = {
  amount: 100.0,
  items: [
    {
      id: "item1",
      name: "商品A",
      quantity: 2,
      availableStock: 5,
    },
  ],
};

const result = await validator.validateOrderCreation(orderData);

if (!result.isValid) {
  console.log("订单验证失败:", result.errors);
} else {
  console.log("订单验证通过");
}
```

### 4.3 综合验证

```typescript
import { ComprehensiveValidationExample } from "@hl8/domain-kernel";

const validator = new ComprehensiveValidationExample();

const operationData = {
  userData: {
    email: "user@example.com",
    username: "john_doe",
    password: "SecurePass123!",
  },
  operation: "user_registration",
};

const result = await validator.validateUserOperation(operationData);

if (!result.isValid) {
  console.log("操作验证失败:", result.errors);
} else {
  console.log("操作验证通过");
}
```

---

## 5. 最佳实践

### 5.1 验证器设计原则

#### **单一职责**

```typescript
// ✅ 正确：每个验证器只负责一种验证
export class UserRegistrationBusinessRuleValidator extends DomainValidator {
  validate(context: DomainValidationContext): DomainValidationResult {
    // 只验证用户注册的业务规则
  }
}

// ❌ 错误：验证器职责过多
export class UniversalValidator extends DomainValidator {
  validate(context: DomainValidationContext): DomainValidationResult {
    // 验证所有类型的业务规则
  }
}
```

#### **错误处理**

```typescript
// ✅ 正确：明确的错误信息
errors.push({
  code: "INVALID_EMAIL_FORMAT",
  message: "邮箱格式无效",
  field: "email",
  context: { email: userData.email },
});

// ❌ 错误：模糊的错误信息
errors.push({
  code: "VALIDATION_ERROR",
  message: "验证失败",
});
```

#### **性能优化**

```typescript
// ✅ 正确：缓存验证结果
export class CachedValidator extends DomainValidator {
  private static cache = new Map<string, DomainValidationResult>();

  validate(context: DomainValidationContext): DomainValidationResult {
    const key = this.generateCacheKey(context);

    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const result = this.performValidation(context);
    this.cache.set(key, result);
    return result;
  }
}
```

### 5.2 验证器组合

#### **验证器链**

```typescript
const validationManager = new DomainValidationManager();

// 按优先级注册验证器
validationManager.registerValidator(
  new UserRegistrationBusinessRuleValidator(),
); // 优先级: 100
validationManager.registerValidator(new UserStateValidator()); // 优先级: 100
validationManager.registerValidator(new EmailValueObjectValidator()); // 优先级: 100

// 验证器会按优先级顺序执行
const result = validationManager.validateAll(context);
```

#### **条件验证**

```typescript
export class ConditionalValidator extends DomainValidator {
  isApplicable(context: DomainValidationContext): boolean {
    // 只在特定条件下执行验证
    return context.operation === "user_registration";
  }

  validate(context: DomainValidationContext): DomainValidationResult {
    // 验证逻辑
  }
}
```

### 5.3 测试策略

#### **单元测试**

```typescript
describe("UserRegistrationBusinessRuleValidator", () => {
  it("should validate email format", () => {
    const validator = new UserRegistrationBusinessRuleValidator();
    const context: DomainValidationContext = {
      operation: "user_registration",
      metadata: {
        userData: {
          email: "invalid-email",
          username: "test",
          password: "password",
        },
      },
    };

    const result = validator.validate(context);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual({
      code: "INVALID_EMAIL_FORMAT",
      message: "邮箱格式无效",
      field: "email",
    });
  });
});
```

#### **集成测试**

```typescript
describe("DomainValidationManager", () => {
  it("should validate user registration with multiple validators", async () => {
    const manager = new DomainValidationManager();
    manager.registerValidator(new UserRegistrationBusinessRuleValidator());
    manager.registerValidator(new EmailValueObjectValidator());

    const context: DomainValidationContext = {
      operation: "user_registration",
      metadata: { userData: validUserData },
    };

    const result = manager.validateAll(context);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
```

---

## 6. 常见问题

### 6.1 验证器设计问题

#### Q: 如何避免验证器之间的冲突？

A: 使用验证器优先级和条件验证：

```typescript
export class UserRegistrationBusinessRuleValidator extends DomainValidator {
  getPriority(): number {
    return 50; // 高优先级，先执行
  }

  isApplicable(context: DomainValidationContext): boolean {
    return context.operation === "user_registration";
  }
}
```

#### Q: 如何处理异步验证？

A: 使用异步验证器：

```typescript
export class AsyncDomainValidator extends DomainValidator {
  async validateAsync(
    context: DomainValidationContext,
  ): Promise<DomainValidationResult> {
    // 异步验证逻辑
    const emailExists = await this.checkEmailExists(
      context.metadata.userData.email,
    );

    if (emailExists) {
      return {
        isValid: false,
        errors: [
          {
            code: "EMAIL_ALREADY_EXISTS",
            message: "邮箱已被使用",
            field: "email",
          },
        ],
        warnings: [],
      };
    }

    return { isValid: true, errors: [], warnings: [] };
  }
}
```

### 6.2 性能问题

#### Q: 验证性能如何优化？

A: 使用以下策略：

1. **缓存验证结果**
2. **异步验证**
3. **批量验证**
4. **验证结果复用**

```typescript
export class OptimizedValidator extends DomainValidator {
  private static cache = new Map<string, DomainValidationResult>();

  validate(context: DomainValidationContext): DomainValidationResult {
    const key = this.generateCacheKey(context);

    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const result = this.performValidation(context);
    this.cache.set(key, result);
    return result;
  }
}
```

### 6.3 维护问题

#### Q: 如何保持验证逻辑的一致性？

A: 使用验证规范和常量：

```typescript
export class DomainValidationConstants {
  static readonly INVALID_EMAIL_FORMAT = "INVALID_EMAIL_FORMAT";
  static readonly WEAK_PASSWORD = "WEAK_PASSWORD";
  static readonly INVALID_STATUS_TRANSITION = "INVALID_STATUS_TRANSITION";
}

export class UserRegistrationBusinessRuleValidator extends DomainValidator {
  validate(context: DomainValidationContext): DomainValidationResult {
    const errors: DomainValidationError[] = [];

    if (!this.isValidEmail(userData.email)) {
      errors.push({
        code: DomainValidationConstants.INVALID_EMAIL_FORMAT,
        message: "邮箱格式无效",
        field: "email",
      });
    }

    return { isValid: errors.length === 0, errors, warnings: [] };
  }
}
```

---

## 📚 相关资源

- [应用层验证架构](../application-kernel/docs/VALIDATION_ARCHITECTURE.md)
- [领域层开发指南](./DOMAIN_LAYER_DEVELOPMENT_GUIDE.md)
- [API 参考](./API_REFERENCE.md)

---

**版本历史**:

- v1.0.0 (2025-01-21): 初始版本，完整的领域层验证功能
