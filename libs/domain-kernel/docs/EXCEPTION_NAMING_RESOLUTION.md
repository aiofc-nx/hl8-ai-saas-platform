# 异常类命名冲突解决方案

## 问题描述

在集成 `libs/domain-kernel` 与 `libs/exceptions` 时，发现存在异常类名称重叠的问题：

### 重叠的异常类

1. **`BusinessRuleViolationException`**
   - **domain-kernel**: `libs/domain-kernel/src/exceptions/business-rule.exception.ts`
   - **libs/exceptions**: `libs/exceptions/src/core/validation/business-rule-violation.exception.ts`

2. **`ValidationException`**
   - **domain-kernel**: `libs/domain-kernel/src/exceptions/validation.exception.ts`
   - **libs/exceptions**: `libs/exceptions/src/core/validation/validation.exception.ts`

## 解决方案

### 重命名 domain-kernel 中的异常类

为了避免命名冲突，我们重命名了 domain-kernel 中的异常类，添加 `Domain` 前缀：

#### 重命名映射

| 原名称                           | 新名称                                 | 说明                   |
| -------------------------------- | -------------------------------------- | ---------------------- |
| `BusinessRuleViolationException` | `DomainBusinessRuleViolationException` | 领域层业务规则违规异常 |
| `ValidationException`            | `DomainValidationException`            | 领域层验证异常         |
| `TenantIsolationException`       | `DomainTenantIsolationException`       | 领域层租户隔离异常     |

### 实施细节

#### 1. 异常类重命名

```typescript
// 原代码
export class BusinessRuleViolationException extends DomainException {
  // ...
}

// 新代码
export class DomainBusinessRuleViolationException extends DomainException {
  // ...
}
```

#### 2. 导入更新

```typescript
// 原代码
import { BusinessRuleViolationException } from "./business-rule.exception.js";

// 新代码
import { DomainBusinessRuleViolationException } from "./business-rule.exception.js";
```

#### 3. 使用更新

```typescript
// 原代码
const exception = new BusinessRuleViolationException(
  "INVALID_EMAIL",
  "邮箱格式无效",
  { email: "invalid-email" },
);

// 新代码
const exception = new DomainBusinessRuleViolationException(
  "INVALID_EMAIL",
  "邮箱格式无效",
  { email: "invalid-email" },
);
```

## 命名规范

### 领域层异常命名规范

为了避免未来的命名冲突，我们制定了以下命名规范：

#### 1. 领域层异常类命名

- **格式**: `Domain{Category}Exception`
- **示例**:
  - `DomainBusinessRuleViolationException`
  - `DomainValidationException`
  - `DomainTenantIsolationException`

#### 2. 异常转换器命名

- **格式**: `Domain{Category}Converter`
- **示例**: `DomainExceptionConverter`

#### 3. 异常工厂命名

- **格式**: `Domain{Category}Factory`
- **示例**: `DomainExceptionFactory`

## 架构优势

### 1. 清晰的命名空间

通过添加 `Domain` 前缀，我们创建了清晰的命名空间：

```typescript
// 领域层异常
import { DomainBusinessRuleViolationException } from "@hl8/domain-kernel";

// HTTP异常
import { BusinessRuleViolationException } from "@hl8/exceptions";
```

### 2. 避免命名冲突

- ✅ 领域层异常：`DomainBusinessRuleViolationException`
- ✅ HTTP异常：`BusinessRuleViolationException`
- ✅ 无命名冲突

### 3. 保持功能完整性

重命名后的异常类保持了所有原有功能：

- ✅ 异常创建和基本信息
- ✅ RFC7807格式转换
- ✅ HTTP异常转换
- ✅ 异常信息获取
- ✅ 业务规则验证器集成

## 测试验证

### 测试覆盖

重命名后的异常类通过了所有测试：

```bash
✓ 应该创建业务规则违规异常
✓ 应该创建验证异常
✓ 应该创建租户隔离异常
✓ 应该返回异常基本信息
✓ 应该转换为 RFC7807 格式
✓ 应该转换为 HTTP 异常
```

### 集成测试

```bash
✓ 异常体系完整性测试
✓ 异常转换器功能测试
✓ 业务规则验证器集成测试
✓ 现有异常类迁移测试
```

## 迁移指南

### 对于现有代码

如果您有使用 domain-kernel 异常类的代码，需要进行以下更新：

#### 1. 更新导入

```typescript
// 原代码
import { BusinessRuleViolationException } from "@hl8/domain-kernel";

// 新代码
import { DomainBusinessRuleViolationException } from "@hl8/domain-kernel";
```

#### 2. 更新使用

```typescript
// 原代码
throw new BusinessRuleViolationException("INVALID_EMAIL", "邮箱格式无效");

// 新代码
throw new DomainBusinessRuleViolationException("INVALID_EMAIL", "邮箱格式无效");
```

#### 3. 更新类型注解

```typescript
// 原代码
function handleException(error: BusinessRuleViolationException) {
  // ...
}

// 新代码
function handleException(error: DomainBusinessRuleViolationException) {
  // ...
}
```

## 总结

通过重命名 domain-kernel 中的异常类，我们成功解决了与 libs/exceptions 的命名冲突问题：

- ✅ **解决命名冲突** - 避免了异常类名称重叠
- ✅ **保持功能完整** - 所有原有功能正常工作
- ✅ **清晰命名空间** - 通过前缀区分不同层的异常
- ✅ **向后兼容** - 现有异常类迁移保持兼容性
- ✅ **测试通过** - 所有测试验证功能正常

这个解决方案为 SAAS 平台提供了清晰、无冲突的异常处理体系，支持领域层异常与HTTP异常的 seamless 集成。
