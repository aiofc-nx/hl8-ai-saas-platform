# 验证架构设计指南

> **版本**: 1.0.0 | **创建日期**: 2025-01-21

## 概述

在 Clean Architecture 中，验证逻辑的放置位置是一个重要的架构决策。不同的验证类型应该放在不同的层级，以确保职责清晰、依赖方向正确、可维护性和可测试性。

## 验证分层架构

### 接口层验证 (Interface Layer)

- 输入数据格式验证
- 数据类型验证
- 权限验证
- 必填字段验证

### 应用层验证 (Application Layer) - 当前实现

- 架构模式合规验证
- 接口实现验证
- CQRS模式验证
- 依赖注入验证
- **注意**: 应用层不验证业务规则，只验证架构模式

### 领域层验证 (Domain Layer)

- 业务规则验证
- 实体状态验证
- 值对象约束验证
- 领域事件验证

## 为什么应用层验证放在 application-kernel？

### ✅ 正确的设计决策

1. **职责匹配**: 应用层验证关注架构模式，与application-kernel职责匹配
2. **依赖关系**: 验证逻辑依赖应用层组件（BaseCommand、BaseQuery等）
3. **使用场景**: 在应用层开发时进行验证，确保代码质量
4. **维护性**: 验证逻辑与应用层代码紧密相关

### ❌ 为什么不放在领域层？

1. **职责不匹配**: 领域层应该关注业务规则，不是架构模式
2. **依赖方向错误**: 领域层不应该依赖应用层组件
3. **使用场景不符**: 架构模式验证在应用层开发时使用

## 验证类型分析

| 验证类型 | 层级 | 关注点 | 示例 |
|---------|------|--------|------|
| **格式验证** | 接口层 | 数据格式、类型 | JSON格式、邮箱格式 |
| **权限验证** | 接口层 | 用户权限、角色 | 访问权限、操作权限 |
| **模式验证** | 应用层 | 架构模式合规 | CQRS模式、依赖注入 |
| **业务验证** | 领域层 | 业务规则、约束 | 用户年龄、订单金额 |

## 实现示例

### 应用层验证 (当前实现)

```typescript
// libs/application-kernel/src/validation/pattern-compliance.validator.ts
export class PatternComplianceValidator {
  static validateCommand(commandClass: any): PatternComplianceResult {
    const violations: string[] = [];
    
    // 检查是否继承自BaseCommand
    if (!this.extendsBaseCommand(commandClass)) {
      violations.push('命令类必须继承自BaseCommand');
    }
    
    return {
      isCompliant: violations.length === 0,
      violations
    };
  }
}

// ❌ 错误示例：应用层不应该验证业务规则
export class CreateUserCommand extends BaseCommand {
  constructor(email: string, username: string, password: string) {
    super('CreateUserCommand', '创建用户命令');
    
    // ❌ 错误：业务规则验证不应该在应用层
    if (!email.includes('@')) {
      throw new Error('邮箱格式无效');
    }
  }
}

// ✅ 正确示例：应用层只验证结构
export class CreateUserCommand extends BaseCommand {
  constructor(email: string, username: string, password: string) {
    super('CreateUserCommand', '创建用户命令');
    
    // ✅ 正确：只验证参数完整性
    if (!email || !username || !password) {
      throw new Error('命令参数不能为空');
    }
  }
}
```

### 领域层验证 (应该在domain-kernel中)

```typescript
// libs/domain-kernel/src/validation/business-rule.validator.ts
export class BusinessRuleValidator {
  static validateUserRegistration(userData: UserRegistrationData): ValidationResult {
    const errors: string[] = [];
    
    // 验证邮箱格式
    if (!this.isValidEmail(userData.email)) {
      errors.push('邮箱格式无效');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

### 接口层验证 (应该在interface-kernel中)

```typescript
// libs/interface-kernel/src/validation/input.validator.ts
export class InputValidator {
  static validateCreateUserRequest(request: any): ValidationResult {
    const errors: string[] = [];
    
    // 验证必填字段
    if (!request.email) {
      errors.push('邮箱字段必填');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

## 最佳实践

### 验证设计原则

1. **单一职责**: 每个验证器只负责一种验证
2. **依赖注入**: 使用依赖注入管理验证器
3. **错误处理**: 明确的错误处理机制
4. **性能优化**: 缓存验证结果，异步验证

### 测试策略

1. **单元测试**: 每个验证器独立测试
2. **集成测试**: 验证完整工作流程
3. **性能测试**: 验证性能优化效果

## 常见问题

### Q: 为什么不在领域层进行所有验证？

A: 不同层级的验证关注点不同：

- 领域层验证关注业务规则和领域约束
- 应用层验证关注架构模式和代码质量
- 接口层验证关注输入格式和权限

### Q: 验证逻辑重复怎么办？

A: 使用验证策略模式，将验证逻辑抽象为可复用的策略。

### Q: 验证性能如何优化？

A: 使用缓存验证结果、异步验证、批量验证等策略。

## 总结

当前的设计是正确的！应用层验证放在 application-kernel 中符合 Clean Architecture 原则：

- ✅ 职责清晰：每层只负责自己关注点的验证
- ✅ 依赖方向正确：内层不依赖外层
- ✅ 可维护性：验证逻辑与对应层级紧密相关
- ✅ 可测试性：每层验证可以独立测试

建议保持当前应用层验证不变，在 domain-kernel 和 interface-kernel 中补充相应的业务验证和输入验证。

---

**相关资源**:

- [应用层开发指南](./APPLICATION_LAYER_DEVELOPMENT_GUIDE.md)
- [API 参考](./API_REFERENCE.md)
- [快速开始](./QUICK_START.md)
