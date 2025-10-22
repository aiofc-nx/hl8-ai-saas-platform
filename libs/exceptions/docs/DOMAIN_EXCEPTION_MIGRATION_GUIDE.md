# 领域层异常迁移指南

## 概述

本文档描述了将 `libs/domain-kernel` 中的异常类迁移到 `libs/exceptions` 进行集中管理的方案和实施步骤。

## 迁移方案

### 方案优势

#### 1. 集中管理

- ✅ 所有异常类统一管理
- ✅ 避免重复定义
- ✅ 统一的异常体系

#### 2. 架构清晰

- ✅ 领域层异常与HTTP异常分离
- ✅ 清晰的依赖关系
- ✅ 更好的模块化

#### 3. 维护便利

- ✅ 单一异常定义源
- ✅ 统一的异常处理逻辑
- ✅ 更好的测试覆盖

### 迁移架构

#### 新的异常体系结构

```
libs/exceptions/
├── src/core/
│   ├── domain/                    # 领域层异常（新增）
│   │   ├── domain-layer.exception.ts
│   │   ├── business-rule-violation.exception.ts
│   │   ├── validation.exception.ts
│   │   ├── tenant-isolation.exception.ts
│   │   └── index.ts
│   ├── auth/                      # 认证异常
│   ├── user/                      # 用户异常
│   ├── tenant/                    # 租户异常
│   ├── validation/                # 验证异常
│   ├── business/                  # 业务异常
│   └── ...
```

#### 异常类映射

| domain-kernel 异常类 | libs/exceptions 异常类 | 说明 |
|---------------------|----------------------|------|
| `DomainBusinessRuleViolationException` | `DomainBusinessRuleViolationException` | 迁移到 libs/exceptions |
| `DomainValidationException` | `DomainValidationException` | 迁移到 libs/exceptions |
| `DomainTenantIsolationException` | `DomainTenantIsolationException` | 迁移到 libs/exceptions |

## 实施步骤

### 步骤1：在 libs/exceptions 中添加领域层异常

#### 1.1 创建领域层异常基类

```typescript
// libs/exceptions/src/core/domain/domain-layer.exception.ts
export abstract class DomainException extends DomainLayerException {
  // 领域层异常基类实现
}
```

#### 1.2 创建具体异常类

```typescript
// libs/exceptions/src/core/domain/business-rule-violation.exception.ts
export class DomainBusinessRuleViolationException extends DomainException {
  // 业务规则违规异常实现
}
```

#### 1.3 更新导出配置

```typescript
// libs/exceptions/src/core/domain/index.ts
export * from "./domain-layer.exception.js";
export * from "./business-rule-violation.exception.js";
// ...
```

### 步骤2：更新 domain-kernel 使用新的异常类

#### 2.1 更新导入语句

```typescript
// 原代码
import { DomainBusinessRuleViolationException } from "../exceptions/business-rule.exception.js";

// 新代码
import { DomainBusinessRuleViolationException } from "@hl8/exceptions/core/domain";
```

#### 2.2 删除重复的异常类

删除以下文件：

- `libs/domain-kernel/src/exceptions/business-rule.exception.ts`
- `libs/domain-kernel/src/exceptions/validation.exception.ts`
- `libs/domain-kernel/src/exceptions/tenant.exception.ts`
- `libs/domain-kernel/src/exceptions/domain-exception.base.ts`

#### 2.3 更新异常转换器

```typescript
// libs/domain-kernel/src/exceptions/exception-converter.ts
import { DomainBusinessRuleViolationException } from "@hl8/exceptions/core/domain";
// 使用 libs/exceptions 中的异常类
```

### 步骤3：更新业务规则验证器

#### 3.1 更新业务规则验证器导入

```typescript
// libs/domain-kernel/src/rules/business-rule-validator.ts
import { DomainBusinessRuleViolationException } from "@hl8/exceptions/core/domain";
```

#### 3.2 更新用户注册规则

```typescript
// libs/domain-kernel/src/rules/user-registration.rule.ts
import { DomainBusinessRuleViolationException } from "@hl8/exceptions/core/domain";
```

### 步骤4：更新现有异常类迁移

#### 4.1 更新隔离验证异常

```typescript
// libs/domain-kernel/src/isolation/isolation-validation.error.ts
import { DomainTenantIsolationException } from "@hl8/exceptions/core/domain";

export class IsolationValidationError extends DomainTenantIsolationException {
  // 现有异常类迁移到新异常体系
}
```

## 使用示例

### 基本使用

```typescript
// 导入领域层异常
import { 
  DomainBusinessRuleViolationException,
  DomainValidationException,
  DomainTenantIsolationException,
  DomainExceptionFactory
} from "@hl8/exceptions/core/domain";

// 创建业务规则违规异常
const businessException = new DomainBusinessRuleViolationException(
  'INVALID_EMAIL',
  '邮箱格式无效',
  { email: 'invalid-email' }
);

// 使用工厂方法创建异常
const validationException = DomainExceptionFactory.createValidation(
  'email',
  '邮箱格式无效',
  { providedValue: 'invalid-email' }
);
```

### 业务规则验证器集成

```typescript
import { DomainBusinessRuleViolationException } from "@hl8/exceptions/core/domain";

class UserRegistrationBusinessRule extends BusinessRuleValidator {
  validateUserRegistrationAndThrow(context: UserRegistrationContext): void {
    const result = this.validate(context);
    if (!result.isValid) {
      const firstError = result.errors[0];
      throw new DomainBusinessRuleViolationException(
        firstError.code,
        firstError.message,
        firstError.context
      );
    }
  }
}
```

### 异常转换

```typescript
import { DomainBusinessRuleViolationException } from "@hl8/exceptions/core/domain";

// 领域层异常转换为HTTP异常
const domainException = new DomainBusinessRuleViolationException(
  'INVALID_EMAIL',
  '邮箱格式无效'
);

// 转换为HTTP异常（如果 libs/exceptions 可用）
const httpException = domainException.toHttpException();
```

## 测试验证

### 单元测试

```typescript
import { DomainBusinessRuleViolationException } from "@hl8/exceptions/core/domain";

describe('DomainBusinessRuleViolationException', () => {
  it('应该创建异常实例', () => {
    const exception = new DomainBusinessRuleViolationException(
      'INVALID_EMAIL',
      '邮箱格式无效',
      { email: 'invalid-email' }
    );

    expect(exception.errorCode).toBe('BUSINESS_RULE_VIOLATION');
    expect(exception.detail).toBe('邮箱格式无效');
    expect(exception.status).toBe(422);
  });
});
```

### 集成测试

```typescript
import { DomainExceptionFactory } from "@hl8/exceptions/core/domain";

describe('DomainExceptionFactory', () => {
  it('应该创建业务规则违规异常', () => {
    const exception = DomainExceptionFactory.createBusinessRuleViolation(
      'INVALID_EMAIL',
      '邮箱格式无效',
      { email: 'invalid-email' }
    );

    expect(exception).toBeInstanceOf(DomainBusinessRuleViolationException);
  });
});
```

## 迁移检查清单

### 代码迁移

- [ ] 在 libs/exceptions 中创建领域层异常类
- [ ] 更新 libs/exceptions 的导出配置
- [ ] 更新 domain-kernel 的导入语句
- [ ] 删除 domain-kernel 中的重复异常类
- [ ] 更新异常转换器
- [ ] 更新业务规则验证器
- [ ] 更新用户注册规则
- [ ] 更新现有异常类迁移

### 测试验证

- [ ] 更新单元测试
- [ ] 更新集成测试
- [ ] 验证异常创建功能
- [ ] 验证异常转换功能
- [ ] 验证业务规则验证器集成
- [ ] 验证现有异常类迁移

### 文档更新

- [ ] 更新 API 文档
- [ ] 更新使用示例
- [ ] 更新迁移指南
- [ ] 更新架构文档

## 总结

通过将 domain-kernel 中的异常类迁移到 libs/exceptions，我们实现了：

- ✅ **集中管理** - 所有异常类统一管理
- ✅ **架构清晰** - 领域层异常与HTTP异常分离
- ✅ **维护便利** - 单一异常定义源
- ✅ **功能完整** - 保持所有原有功能
- ✅ **向后兼容** - 支持现有代码迁移

这个迁移方案为 SAAS 平台提供了更加清晰、统一的异常处理体系。
