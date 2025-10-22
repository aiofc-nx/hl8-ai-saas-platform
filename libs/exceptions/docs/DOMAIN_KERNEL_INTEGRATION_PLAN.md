# Domain Kernel 集成 libs/exceptions 实施计划

## 📋 概述

本实施计划详细描述了如何将 `libs/exceptions` 集成到 `libs/domain-kernel` 中，包括具体的实施步骤、代码示例、测试策略和迁移指南。

## 🎯 集成目标

### 主要目标

1. **统一异常处理** - 将 Domain Kernel 的异常处理统一到 libs/exceptions 体系
2. **保持架构纯净** - 确保 Domain Kernel 保持纯领域层特性
3. **向后兼容** - 保持现有 API 的兼容性
4. **提升开发体验** - 提供更好的异常处理和调试体验

### 成功标准

- ✅ 所有 Domain Kernel 异常都支持 RFC7807 格式
- ✅ 异常处理代码减少 30% 以上
- ✅ 100% 向后兼容现有 API
- ✅ 完整的测试覆盖
- ✅ 详细的文档和迁移指南

## 🚀 实施计划

### 阶段1：基础准备（Week 1-2）

#### 1.1 创建异常基类

**文件**: `libs/domain-kernel/src/exceptions/domain-exception.base.ts`

```typescript
/**
 * 领域层异常基类
 * @description 所有领域层异常的基类，提供与 libs/exceptions 的集成能力
 */
export abstract class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    
    // 设置原型链（TypeScript 继承 Error 的必需操作）
    Object.setPrototypeOf(this, DomainException.prototype);
  }

  /**
   * 转换为 libs/exceptions 格式的异常
   * @returns 对应的 HTTP 异常
   */
  abstract toHttpException(): any;

  /**
   * 获取异常类别
   * @returns 异常类别名称
   */
  abstract getCategory(): string;

  /**
   * 获取异常层级
   * @returns 异常层级名称
   */
  getLayer(): string {
    return "domain";
  }

  /**
   * 获取异常信息
   * @returns 异常详细信息
   */
  getExceptionInfo(): {
    code: string;
    message: string;
    category: string;
    layer: string;
    context?: Record<string, unknown>;
  } {
    return {
      code: this.code,
      message: this.message,
      category: this.getCategory(),
      layer: this.getLayer(),
      context: this.context,
    };
  }
}
```

#### 1.2 创建异常转换器

**文件**: `libs/domain-kernel/src/exceptions/exception-converter.ts`

```typescript
/**
 * 异常转换器
 * @description 将领域层异常转换为 libs/exceptions 格式
 */
export class ExceptionConverter {
  /**
   * 转换领域异常为 HTTP 异常
   * @param domainException 领域异常
   * @returns HTTP 异常
   */
  static convertToHttpException(domainException: DomainException): any {
    return domainException.toHttpException();
  }

  /**
   * 转换业务规则验证结果为异常数组
   * @param result 验证结果
   * @returns 异常数组
   */
  static convertValidationResult(result: BusinessRuleValidationResult): DomainException[] {
    return result.errors.map(error => 
      new BusinessRuleViolationException(
        error.code,
        error.message,
        error.context
      )
    );
  }

  /**
   * 转换验证结果为单个异常
   * @param result 验证结果
   * @returns 异常或 null
   */
  static convertToSingleException(result: BusinessRuleValidationResult): DomainException | null {
    if (result.isValid) {
      return null;
    }
    
    const firstError = result.errors[0];
    return new BusinessRuleViolationException(
      firstError.code,
      firstError.message,
      firstError.context
    );
  }
}
```

#### 1.3 创建具体异常类

**文件**: `libs/domain-kernel/src/exceptions/business-rule.exception.ts`

```typescript
import { DomainException } from "./domain-exception.base.js";

/**
 * 业务规则违规异常
 * @description 当业务规则验证失败时抛出
 */
export class BusinessRuleViolationException extends DomainException {
  constructor(
    ruleCode: string,
    message: string,
    context?: Record<string, unknown>,
  ) {
    super(message, ruleCode, context);
  }

  getCategory(): string {
    return "business";
  }

  toHttpException(): any {
    // 动态导入 libs/exceptions，避免硬依赖
    try {
      const { BusinessRuleViolationException } = require('@hl8/exceptions/core/business');
      return new BusinessRuleViolationException(
        this.code,
        this.message,
        { ...this.context }
      );
    } catch (error) {
      // 如果 libs/exceptions 不可用，返回基础异常
      return new Error(this.message);
    }
  }
}
```

**文件**: `libs/domain-kernel/src/exceptions/validation.exception.ts`

```typescript
import { DomainException } from "./domain-exception.base.js";

/**
 * 数据验证异常
 * @description 当数据验证失败时抛出
 */
export class ValidationException extends DomainException {
  constructor(
    field: string,
    message: string,
    context?: Record<string, unknown>,
  ) {
    super(message, `VALIDATION_FAILED_${field.toUpperCase()}`, context);
  }

  getCategory(): string {
    return "validation";
  }

  toHttpException(): any {
    try {
      const { ValidationFailedException } = require('@hl8/exceptions/core/validation');
      return new ValidationFailedException(
        this.context?.field as string || 'unknown',
        this.message,
        { ...this.context }
      );
    } catch (error) {
      return new Error(this.message);
    }
  }
}
```

**文件**: `libs/domain-kernel/src/exceptions/tenant.exception.ts`

```typescript
import { DomainException } from "./domain-exception.base.js";

/**
 * 租户隔离异常
 * @description 当租户隔离验证失败时抛出
 */
export class TenantIsolationException extends DomainException {
  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>,
  ) {
    super(message, code, context);
  }

  getCategory(): string {
    return "tenant";
  }

  toHttpException(): any {
    try {
      const { InvalidTenantContextException } = require('@hl8/exceptions/core/tenant');
      return new InvalidTenantContextException(
        this.message,
        { ...this.context }
      );
    } catch (error) {
      return new Error(this.message);
    }
  }
}
```

### 阶段2：业务规则集成（Week 3-4）

#### 2.1 更新业务规则验证器

**文件**: `libs/domain-kernel/src/rules/business-rule-validator.ts`

```typescript
import { BusinessRuleViolationException } from "../exceptions/business-rule.exception.js";

export class BusinessRuleValidator<Context = unknown> {
  // ... 现有代码 ...

  /**
   * 验证并抛出异常
   * @param context 验证上下文
   * @throws {BusinessRuleViolationException} 当验证失败时抛出异常
   */
  validateAndThrow(context: Context): void {
    const result = this.validate(context);
    if (!result.isValid) {
      const firstError = result.errors[0];
      throw new BusinessRuleViolationException(
        firstError.code,
        firstError.message,
        firstError.context
      );
    }
  }

  /**
   * 验证并返回异常（不抛出）
   * @param context 验证上下文
   * @returns 异常或 null
   */
  validateAndReturnException(context: Context): BusinessRuleViolationException | null {
    const result = this.validate(context);
    if (!result.isValid) {
      const firstError = result.errors[0];
      return new BusinessRuleViolationException(
        firstError.code,
        firstError.message,
        firstError.context
      );
    }
    return null;
  }
}
```

#### 2.2 更新业务规则管理器

**文件**: `libs/domain-kernel/src/rules/business-rule-validator.ts`

```typescript
export class BusinessRuleManager<Context = unknown> {
  // ... 现有代码 ...

  /**
   * 验证所有规则并抛出异常
   * @param context 验证上下文
   * @throws {BusinessRuleViolationException} 当验证失败时抛出异常
   */
  validateAllAndThrow(context: Context): void {
    const result = this.validateAll(context);
    if (!result.isValid) {
      const firstError = result.errors[0];
      throw new BusinessRuleViolationException(
        firstError.code,
        firstError.message,
        firstError.context
      );
    }
  }

  /**
   * 验证所有规则并返回异常数组
   * @param context 验证上下文
   * @returns 异常数组
   */
  validateAllAndReturnExceptions(context: Context): BusinessRuleViolationException[] {
    const result = this.validateAll(context);
    return result.errors.map(error => 
      new BusinessRuleViolationException(
        error.code,
        error.message,
        error.context
      )
    );
  }
}
```

### 阶段3：现有异常迁移（Week 5-6）

#### 3.1 迁移 IsolationValidationError

**文件**: `libs/domain-kernel/src/isolation/isolation-validation.error.ts`

```typescript
import { TenantIsolationException } from "../exceptions/tenant.exception.js";

/**
 * 隔离验证异常
 * @deprecated 使用 TenantIsolationException 替代
 */
export class IsolationValidationError extends TenantIsolationException {
  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>,
  ) {
    super(message, code, context);
    this.name = "IsolationValidationError";
  }
}

// 为了向后兼容，保留原有接口
export { TenantIsolationException as IsolationValidationException };
```

#### 3.2 更新实体验证

**文件**: `libs/domain-kernel/src/entities/base-entity.ts`

```typescript
import { ValidationException } from "../exceptions/validation.exception.js";

export class BaseEntity {
  // ... 现有代码 ...

  /**
   * 验证实体数据
   * @throws {ValidationException} 当验证失败时抛出异常
   */
  protected validateEntityData(): void {
    // 验证逻辑
    if (!this.isValid()) {
      throw new ValidationException(
        'entity',
        '实体数据验证失败',
        { entityId: this.id.toString() }
      );
    }
  }

  /**
   * 验证业务规则
   * @throws {BusinessRuleViolationException} 当业务规则验证失败时抛出异常
   */
  protected validateBusinessRules(): void {
    // 业务规则验证逻辑
  }
}
```

### 阶段4：测试和文档（Week 7-8）

#### 4.1 单元测试

**文件**: `libs/domain-kernel/src/exceptions/domain-exception.base.spec.ts`

```typescript
import { BusinessRuleViolationException } from "./business-rule.exception.js";

describe('DomainException', () => {
  describe('BusinessRuleViolationException', () => {
    it('应该创建异常实例', () => {
      const exception = new BusinessRuleViolationException(
        'INVALID_EMAIL',
        '邮箱格式无效',
        { email: 'invalid-email' }
      );

      expect(exception.code).toBe('INVALID_EMAIL');
      expect(exception.message).toBe('邮箱格式无效');
      expect(exception.context).toEqual({ email: 'invalid-email' });
      expect(exception.getCategory()).toBe('business');
      expect(exception.getLayer()).toBe('domain');
    });

    it('应该转换为 HTTP 异常', () => {
      const exception = new BusinessRuleViolationException(
        'INVALID_EMAIL',
        '邮箱格式无效',
        { email: 'invalid-email' }
      );

      const httpException = exception.toHttpException();
      expect(httpException).toBeDefined();
    });
  });
});
```

#### 4.2 集成测试

**文件**: `libs/domain-kernel/src/rules/business-rule-validator.integration.spec.ts`

```typescript
import { BusinessRuleManager, UserRegistrationBusinessRule } from "./index.js";
import { BusinessRuleViolationException } from "../exceptions/business-rule.exception.js";

describe('BusinessRuleManager Integration', () => {
  let manager: BusinessRuleManager;

  beforeEach(() => {
    manager = new BusinessRuleManager();
    manager.registerValidator(new UserRegistrationBusinessRule());
  });

  it('应该验证并抛出异常', () => {
    const context = {
      operation: 'user_registration',
      userData: {
        email: 'invalid-email',
        username: 'user',
        password: 'weak'
      }
    };

    expect(() => {
      manager.validateAllAndThrow(context);
    }).toThrow(BusinessRuleViolationException);
  });

  it('应该验证并返回异常数组', () => {
    const context = {
      operation: 'user_registration',
      userData: {
        email: 'invalid-email',
        username: 'user',
        password: 'weak'
      }
    };

    const exceptions = manager.validateAllAndReturnExceptions(context);
    expect(exceptions.length).toBeGreaterThan(0);
    expect(exceptions[0]).toBeInstanceOf(BusinessRuleViolationException);
  });
});
```

#### 4.3 更新文档

**文件**: `libs/domain-kernel/README.md`

```markdown
## 异常处理

Domain Kernel 现在支持与 `@hl8/exceptions` 的集成，提供统一的异常处理体验。

### 使用示例

```typescript
import { BusinessRuleManager, UserRegistrationBusinessRule } from "@hl8/domain-kernel";

const manager = new BusinessRuleManager();
manager.registerValidator(new UserRegistrationBusinessRule());

try {
  manager.validateAllAndThrow(context);
} catch (error) {
  if (error instanceof BusinessRuleViolationException) {
    // 转换为 HTTP 异常
    const httpException = error.toHttpException();
    // 处理异常...
  }
}
```

### 异常类型

- `BusinessRuleViolationException` - 业务规则违规异常
- `ValidationException` - 数据验证异常
- `TenantIsolationException` - 租户隔离异常

```

## 🔧 配置和依赖

### 依赖配置

**文件**: `libs/domain-kernel/package.json`

```json
{
  "name": "@hl8/domain-kernel",
  "version": "1.1.0",
  "dependencies": {},
  "peerDependencies": {
    "@hl8/exceptions": ">=2.0.0"
  },
  "peerDependenciesMeta": {
    "@hl8/exceptions": {
      "optional": true
    }
  }
}
```

### 类型定义

**文件**: `libs/domain-kernel/src/types/exceptions.ts`

```typescript
/**
 * 异常转换器类型
 */
export interface ExceptionConverter {
  convertToHttpException(domainException: DomainException): any;
  convertValidationResult(result: BusinessRuleValidationResult): DomainException[];
}

/**
 * 异常工厂类型
 */
export interface ExceptionFactory {
  createBusinessRuleViolationException(
    code: string,
    message: string,
    context?: Record<string, unknown>
  ): BusinessRuleViolationException;
  
  createValidationException(
    field: string,
    message: string,
    context?: Record<string, unknown>
  ): ValidationException;
  
  createTenantIsolationException(
    message: string,
    code: string,
    context?: Record<string, unknown>
  ): TenantIsolationException;
}
```

## 📊 迁移指南

### 现有代码迁移

#### 1. 如何进行异常处理迁移

**迁移前：**

```typescript
// 旧的方式
const result = businessRuleManager.validateAll(context);
if (!result.isValid) {
  console.log('验证失败:', result.errors);
}
```

**迁移后：**

```typescript
// 新的方式
try {
  businessRuleManager.validateAllAndThrow(context);
} catch (error) {
  if (error instanceof BusinessRuleViolationException) {
    const httpException = error.toHttpException();
    // 处理异常...
  }
}
```

#### 2. 异常类型迁移

**迁移前：**

```typescript
// 旧的异常类型
throw new IsolationValidationError('租户ID无效', 'INVALID_TENANT_ID');
```

**迁移后：**

```typescript
// 新的异常类型
throw new TenantIsolationException('租户ID无效', 'INVALID_TENANT_ID');
```

### 兼容性保证

#### 1. 向后兼容

- ✅ 保留所有现有 API
- ✅ 保留所有现有异常类型
- ✅ 保留所有现有接口

#### 2. 渐进式迁移

- ✅ 支持新旧异常处理方式并存
- ✅ 提供迁移工具和指南
- ✅ 支持分模块迁移

## 🎯 验收标准

### 功能验收

- ✅ 所有异常都支持 RFC7807 格式转换
- ✅ 业务规则验证支持异常抛出
- ✅ 异常转换器正常工作
- ✅ 向后兼容性保持

### 性能验收

- ✅ 异常创建性能不降低
- ✅ 异常转换性能可接受
- ✅ 内存使用不显著增加

### 质量验收

- ✅ 单元测试覆盖率 > 90%
- ✅ 集成测试通过
- ✅ 代码质量检查通过
- ✅ 文档完整性检查通过

## 📈 预期收益

### 开发效率

- **异常处理代码减少**: 30%
- **错误调试时间减少**: 50%
- **新功能开发速度提升**: 20%

### 代码质量

- **异常处理一致性**: 100%
- **错误响应标准化**: 100%
- **代码可维护性提升**: 40%

### 用户体验

- **错误信息清晰度**: 80%
- **错误响应格式统一性**: 100%
- **错误处理性能**: 15%

## 🚀 实施时间线

```
Week 1-2: 基础准备
├── 创建异常基类
├── 创建异常转换器
└── 创建具体异常类

Week 3-4: 业务规则集成
├── 更新业务规则验证器
├── 更新业务规则管理器
└── 更新现有代码

Week 5-6: 现有异常迁移
├── 迁移 IsolationValidationError
├── 更新实体验证
└── 更新其他异常

Week 7-8: 测试和文档
├── 单元测试
├── 集成测试
└── 更新文档
```

## 📚 参考资料

- [libs/exceptions API 文档](../API_REFERENCE.md)
- [Domain Kernel 架构文档](../../domain-kernel/docs/)
- [异常处理最佳实践](../BEST_PRACTICES.md)
- [RFC7807 标准](https://tools.ietf.org/html/rfc7807)

---

**计划创建时间**: 2025-01-27  
**计划状态**: ✅ 完成  
**预计完成时间**: 2025-03-24
