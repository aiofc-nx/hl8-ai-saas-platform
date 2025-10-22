# libs/exceptions 模块优化完善方案

> **版本**: 1.0.0 | **创建日期**: 2025-01-27 | **模块**: libs/exceptions

## 📋 概述

本文档阐述如何优化完善 `libs/exceptions` 模块，包括异常分类管理、补充缺失异常以及建立分层架构的异常映射体系。目标是构建一个完整、规范、可扩展的异常处理系统，满足 HL8 SAAS 平台的业务需求。

## 🎯 优化目标

### 核心目标

1. **异常分类管理** - 建立清晰的异常分类体系
2. **补充缺失异常** - 完善业务场景覆盖
3. **分层架构映射** - 异常与架构层次对应
4. **标准化规范** - 统一的异常定义和使用规范

### 业务价值

- 提升错误处理的标准化程度
- 增强系统的可维护性和可扩展性
- 改善用户体验和问题诊断效率
- 支持多语言和国际化需求

## 🏗️ 异常分类管理方案

### 1. 分类体系设计

基于 HL8 SAAS 平台的业务特点，建立以下异常分类体系：

```
libs/exceptions/src/core/
├── auth/                    # 认证授权异常
├── user/                    # 用户管理异常
├── tenant/                  # 多租户管理异常
├── organization/            # 组织管理异常
├── department/              # 部门管理异常
├── validation/              # 数据验证异常
├── business/                # 业务规则异常
├── system/                  # 系统资源异常
├── integration/             # 集成服务异常
└── general/                 # 通用异常
```

### 2. 异常命名规范

#### 2.1 命名规则

- **类名格式**: `{业务领域}{异常类型}Exception`
- **错误代码格式**: `{领域}_{异常类型}` (大写蛇形命名法)
- **示例**: `UserNotFoundException` → `USER_NOT_FOUND`

#### 2.2 领域前缀映射

| 领域 | 前缀 | 示例 |
|------|------|------|
| 认证授权 | `AUTH_` | `AUTH_LOGIN_FAILED` |
| 用户管理 | `USER_` | `USER_NOT_FOUND` |
| 租户管理 | `TENANT_` | `TENANT_SUSPENDED` |
| 组织管理 | `ORG_` | `ORG_ACCESS_DENIED` |
| 部门管理 | `DEPT_` | `DEPT_NOT_FOUND` |
| 数据验证 | `VALIDATION_` | `VALIDATION_FAILED` |
| 业务规则 | `BUSINESS_` | `BUSINESS_RULE_VIOLATION` |
| 系统资源 | `SYSTEM_` | `SYSTEM_RATE_LIMIT` |
| 集成服务 | `INTEGRATION_` | `INTEGRATION_TIMEOUT` |

### 3. 异常层次结构

```
AbstractHttpException (抽象基类)
├── GeneralException (通用异常基类)
│   ├── GeneralBadRequestException
│   ├── GeneralInternalServerException
│   └── GeneralNotFoundException
├── AuthException (认证异常基类)
│   ├── AuthenticationFailedException
│   ├── UnauthorizedException
│   └── TokenExpiredException
├── UserException (用户异常基类)
│   ├── UserNotFoundException
│   ├── UserAlreadyExistsException
│   └── InvalidUserStatusException
├── TenantException (租户异常基类)
│   ├── TenantNotFoundException
│   ├── InvalidTenantContextException
│   └── CrossTenantAccessException
└── ... (其他领域异常)
```

## 📦 补充缺失的异常

### 1. 认证授权异常 (高优先级)

#### 1.1 核心认证异常

```typescript
// auth/authentication-failed.exception.ts
export class AuthenticationFailedException extends AbstractHttpException {
  constructor(reason: string, data?: Record<string, unknown>) {
    super(
      "AUTH_LOGIN_FAILED",
      "认证失败",
      `登录失败: ${reason}`,
      401,
      { reason, ...data }
    );
  }
}

// auth/unauthorized.exception.ts
export class UnauthorizedException extends AbstractHttpException {
  constructor(resource: string, action: string, data?: Record<string, unknown>) {
    super(
      "AUTH_UNAUTHORIZED",
      "未授权访问",
      `您没有权限${action}资源"${resource}"`,
      401,
      { resource, action, ...data }
    );
  }
}

// auth/token-expired.exception.ts
export class TokenExpiredException extends AbstractHttpException {
  constructor(tokenType: string = "access", data?: Record<string, unknown>) {
    super(
      "AUTH_TOKEN_EXPIRED",
      "令牌已过期",
      `${tokenType}令牌已过期，请重新登录`,
      401,
      { tokenType, ...data }
    );
  }
}

// auth/invalid-token.exception.ts
export class InvalidTokenException extends AbstractHttpException {
  constructor(tokenType: string = "access", data?: Record<string, unknown>) {
    super(
      "AUTH_INVALID_TOKEN",
      "无效令牌",
      `${tokenType}令牌格式无效或已损坏`,
      401,
      { tokenType, ...data }
    );
  }
}

// auth/insufficient-permissions.exception.ts
export class InsufficientPermissionsException extends AbstractHttpException {
  constructor(requiredPermissions: string[], data?: Record<string, unknown>) {
    super(
      "AUTH_INSUFFICIENT_PERMISSIONS",
      "权限不足",
      `执行此操作需要以下权限: ${requiredPermissions.join(", ")}`,
      403,
      { requiredPermissions, ...data }
    );
  }
}
```

#### 1.2 导出文件

```typescript
// auth/index.ts
export * from "./authentication-failed.exception.js";
export * from "./unauthorized.exception.js";
export * from "./token-expired.exception.js";
export * from "./invalid-token.exception.js";
export * from "./insufficient-permissions.exception.js";
```

### 2. 用户管理异常 (高优先级)

#### 2.1 核心用户异常

```typescript
// user/user-not-found.exception.ts
export class UserNotFoundException extends AbstractHttpException {
  constructor(userId: string, data?: Record<string, unknown>) {
    super(
      "USER_NOT_FOUND",
      "用户未找到",
      `ID 为 "${userId}" 的用户不存在`,
      404,
      { userId, ...data }
    );
  }
}

// user/user-already-exists.exception.ts
export class UserAlreadyExistsException extends AbstractHttpException {
  constructor(identifier: string, identifierType: string = "email", data?: Record<string, unknown>) {
    super(
      "USER_ALREADY_EXISTS",
      "用户已存在",
      `使用${identifierType}"${identifier}"的用户已存在`,
      409,
      { identifier, identifierType, ...data }
    );
  }
}

// user/invalid-user-status.exception.ts
export class InvalidUserStatusException extends AbstractHttpException {
  constructor(currentStatus: string, expectedStatus: string[], data?: Record<string, unknown>) {
    super(
      "USER_INVALID_STATUS",
      "无效用户状态",
      `用户当前状态"${currentStatus}"不允许执行此操作，期望状态: ${expectedStatus.join(", ")}`,
      400,
      { currentStatus, expectedStatus, ...data }
    );
  }
}

// user/user-account-locked.exception.ts
export class UserAccountLockedException extends AbstractHttpException {
  constructor(reason: string, lockUntil?: Date, data?: Record<string, unknown>) {
    super(
      "USER_ACCOUNT_LOCKED",
      "账户已锁定",
      `账户因"${reason}"被锁定${lockUntil ? `，锁定至 ${lockUntil.toISOString()}` : ""}`,
      423,
      { reason, lockUntil, ...data }
    );
  }
}

// user/user-account-disabled.exception.ts
export class UserAccountDisabledException extends AbstractHttpException {
  constructor(reason: string, data?: Record<string, unknown>) {
    super(
      "USER_ACCOUNT_DISABLED",
      "账户已禁用",
      `账户因"${reason}"被禁用`,
      403,
      { reason, ...data }
    );
  }
}
```

### 3. 多租户管理异常 (高优先级)

#### 3.1 部门管理异常

```typescript
// department/department-not-found.exception.ts
export class DepartmentNotFoundException extends AbstractHttpException {
  constructor(departmentId: string, data?: Record<string, unknown>) {
    super(
      "DEPT_NOT_FOUND",
      "部门未找到",
      `ID 为 "${departmentId}" 的部门不存在`,
      404,
      { departmentId, ...data }
    );
  }
}

// department/unauthorized-department.exception.ts
export class UnauthorizedDepartmentException extends AbstractHttpException {
  constructor(departmentId: string, data?: Record<string, unknown>) {
    super(
      "DEPT_UNAUTHORIZED",
      "未授权访问部门",
      `您没有权限访问部门 "${departmentId}"`,
      403,
      { departmentId, ...data }
    );
  }
}

// department/invalid-department-hierarchy.exception.ts
export class InvalidDepartmentHierarchyException extends AbstractHttpException {
  constructor(parentId: string, childId: string, data?: Record<string, unknown>) {
    super(
      "DEPT_INVALID_HIERARCHY",
      "无效部门层级",
      `部门 "${childId}" 不能成为部门 "${parentId}" 的下级`,
      400,
      { parentId, childId, ...data }
    );
  }
}
```

#### 3.2 租户隔离异常

```typescript
// tenant/cross-tenant-access.exception.ts
export class CrossTenantAccessException extends AbstractHttpException {
  constructor(sourceTenantId: string, targetTenantId: string, data?: Record<string, unknown>) {
    super(
      "TENANT_CROSS_ACCESS",
      "跨租户访问异常",
      `租户 "${sourceTenantId}" 尝试访问租户 "${targetTenantId}" 的数据`,
      403,
      { sourceTenantId, targetTenantId, ...data }
    );
  }
}

// tenant/data-isolation-violation.exception.ts
export class DataIsolationViolationException extends AbstractHttpException {
  constructor(violationType: string, data?: Record<string, unknown>) {
    super(
      "TENANT_DATA_ISOLATION_VIOLATION",
      "数据隔离违规",
      `检测到数据隔离违规: ${violationType}`,
      403,
      { violationType, ...data }
    );
  }
}

// tenant/invalid-tenant-context.exception.ts
export class InvalidTenantContextException extends AbstractHttpException {
  constructor(context: string, data?: Record<string, unknown>) {
    super(
      "TENANT_INVALID_CONTEXT",
      "无效租户上下文",
      `租户上下文无效: ${context}`,
      400,
      { context, ...data }
    );
  }
}
```

### 4. 数据验证异常 (中优先级)

#### 4.1 验证失败异常

```typescript
// validation/validation-failed.exception.ts
export class ValidationFailedException extends AbstractHttpException {
  constructor(field: string, message: string, data?: Record<string, unknown>) {
    super(
      "VALIDATION_FAILED",
      "数据验证失败",
      `字段 "${field}" 验证失败: ${message}`,
      400,
      { field, message, ...data }
    );
  }
}

// validation/business-rule-violation.exception.ts
export class BusinessRuleViolationException extends AbstractHttpException {
  constructor(ruleName: string, violation: string, data?: Record<string, unknown>) {
    super(
      "BUSINESS_RULE_VIOLATION",
      "业务规则违规",
      `业务规则 "${ruleName}" 被违反: ${violation}`,
      400,
      { ruleName, violation, ...data }
    );
  }
}

// validation/constraint-violation.exception.ts
export class ConstraintViolationException extends AbstractHttpException {
  constructor(constraint: string, value: unknown, data?: Record<string, unknown>) {
    super(
      "VALIDATION_CONSTRAINT_VIOLATION",
      "约束违规",
      `约束 "${constraint}" 被违反，值: ${JSON.stringify(value)}`,
      400,
      { constraint, value, ...data }
    );
  }
}
```

### 5. 系统资源异常 (中优先级)

#### 5.1 资源管理异常

```typescript
// system/rate-limit-exceeded.exception.ts
export class RateLimitExceededException extends AbstractHttpException {
  constructor(limit: number, window: string, data?: Record<string, unknown>) {
    super(
      "SYSTEM_RATE_LIMIT_EXCEEDED",
      "请求频率超限",
      `请求频率超过限制，限制: ${limit}/${window}`,
      429,
      { limit, window, ...data }
    );
  }
}

// system/service-unavailable.exception.ts
export class ServiceUnavailableException extends AbstractHttpException {
  constructor(serviceName: string, reason: string, data?: Record<string, unknown>) {
    super(
      "SYSTEM_SERVICE_UNAVAILABLE",
      "服务不可用",
      `服务 "${serviceName}" 暂时不可用: ${reason}`,
      503,
      { serviceName, reason, ...data }
    );
  }
}

// system/resource-not-found.exception.ts
export class ResourceNotFoundException extends AbstractHttpException {
  constructor(resourceType: string, resourceId: string, data?: Record<string, unknown>) {
    super(
      "SYSTEM_RESOURCE_NOT_FOUND",
      "资源未找到",
      `${resourceType} 资源 "${resourceId}" 不存在`,
      404,
      { resourceType, resourceId, ...data }
    );
  }
}
```

## 🏛️ 分层架构异常映射

### 1. 架构层次与异常对应关系

基于 Clean Architecture 的分层设计，建立异常与架构层次的映射关系：

```
接口层 (Interface Layer)
├── 认证授权异常 (AuthException)
├── 权限控制异常 (PermissionException)
├── 请求格式异常 (RequestFormatException)
└── 参数验证异常 (ParameterValidationException)

应用层 (Application Layer)
├── 用例执行异常 (UseCaseException)
├── 命令查询异常 (CQRSException)
├── 事件处理异常 (EventProcessingException)
└── 工作流异常 (WorkflowException)

领域层 (Domain Layer)
├── 业务规则异常 (BusinessRuleException)
├── 领域约束异常 (DomainConstraintException)
├── 聚合一致性异常 (AggregateConsistencyException)
└── 领域事件异常 (DomainEventException)

基础设施层 (Infrastructure Layer)
├── 持久化异常 (PersistenceException)
├── 外部服务异常 (ExternalServiceException)
├── 集成异常 (IntegrationException)
└── 配置异常 (ConfigurationException)
```

### 2. 分层异常基类设计

#### 2.1 接口层异常基类

```typescript
// layers/interface/interface-layer.exception.ts
export abstract class InterfaceLayerException extends AbstractHttpException {
  constructor(
    errorCode: string,
    title: string,
    detail: string,
    status: number,
    data?: Record<string, unknown>
  ) {
    super(errorCode, title, detail, status, data);
    this.name = this.constructor.name;
  }
}
```

#### 2.2 应用层异常基类

```typescript
// layers/application/application-layer.exception.ts
export abstract class ApplicationLayerException extends AbstractHttpException {
  constructor(
    errorCode: string,
    title: string,
    detail: string,
    status: number,
    data?: Record<string, unknown>
  ) {
    super(errorCode, title, detail, status, data);
    this.name = this.constructor.name;
  }
}
```

#### 2.3 领域层异常基类

```typescript
// layers/domain/domain-layer.exception.ts
export abstract class DomainLayerException extends AbstractHttpException {
  constructor(
    errorCode: string,
    title: string,
    detail: string,
    status: number,
    data?: Record<string, unknown>
  ) {
    super(errorCode, title, detail, status, data);
    this.name = this.constructor.name;
  }
}
```

#### 2.4 基础设施层异常基类

```typescript
// layers/infrastructure/infrastructure-layer.exception.ts
export abstract class InfrastructureLayerException extends AbstractHttpException {
  constructor(
    errorCode: string,
    title: string,
    detail: string,
    status: number,
    data?: Record<string, unknown>
  ) {
    super(errorCode, title, detail, status, data);
    this.name = this.constructor.name;
  }
}
```

### 3. 异常传播策略

#### 3.1 异常转换规则

```typescript
// 领域层异常 → 应用层异常
class DomainBusinessRuleViolation extends DomainLayerException {
  // 领域层业务规则违规
}

// 应用层异常 → 接口层异常
class UseCaseExecutionFailed extends ApplicationLayerException {
  // 用例执行失败
}

// 基础设施层异常 → 应用层异常
class DatabaseConnectionFailed extends InfrastructureLayerException {
  // 数据库连接失败
}
```

#### 3.2 异常映射配置

```typescript
// exception-mapping.config.ts
export const EXCEPTION_MAPPING = {
  // 领域层异常映射
  'BUSINESS_RULE_VIOLATION': {
    layer: 'domain',
    status: 400,
    category: 'business'
  },
  
  // 应用层异常映射
  'USE_CASE_EXECUTION_FAILED': {
    layer: 'application', 
    status: 422,
    category: 'workflow'
  },
  
  // 基础设施层异常映射
  'DATABASE_CONNECTION_FAILED': {
    layer: 'infrastructure',
    status: 503,
    category: 'system'
  }
};
```

## 📋 实施计划

### 阶段一：核心异常补充 (1-2周)

#### 1.1 认证授权异常

- [ ] 实现 5 个核心认证异常类
- [ ] 添加对应的单元测试
- [ ] 更新文档和示例

#### 1.2 用户管理异常

- [ ] 实现 5 个核心用户异常类
- [ ] 添加对应的单元测试
- [ ] 更新文档和示例

#### 1.3 多租户异常

- [ ] 补充 6 个多租户异常类
- [ ] 添加对应的单元测试
- [ ] 更新文档和示例

### 阶段二：数据验证异常 (1周)

#### 2.1 验证异常实现

- [ ] 实现 3 个数据验证异常类
- [ ] 添加对应的单元测试
- [ ] 更新文档和示例

#### 2.2 业务规则异常

- [ ] 实现 2 个业务规则异常类
- [ ] 添加对应的单元测试
- [ ] 更新文档和示例

### 阶段三：系统资源异常 (1周)

#### 3.1 资源管理异常

- [ ] 实现 3 个系统资源异常类
- [ ] 添加对应的单元测试
- [ ] 更新文档和示例

#### 3.2 集成服务异常

- [ ] 实现 2 个集成服务异常类
- [ ] 添加对应的单元测试
- [ ] 更新文档和示例

### 阶段四：分层架构映射 (1-2周)

#### 4.1 分层异常基类

- [ ] 实现 4 个分层异常基类
- [ ] 添加对应的单元测试
- [ ] 更新文档和示例

#### 4.2 异常映射配置

- [ ] 实现异常映射配置系统
- [ ] 添加对应的单元测试
- [ ] 更新文档和示例

### 阶段五：优化完善 (1周)

#### 5.1 消息提供者扩展

- [ ] 为所有新异常添加多语言支持
- [ ] 实现消息模板系统
- [ ] 添加对应的单元测试

#### 5.2 文档完善

- [ ] 更新 README 文档
- [ ] 添加使用示例和最佳实践
- [ ] 完善 API 文档

## 📊 预期成果

### 量化指标

- **异常类数量**: 从 6 个增加到 30+ 个
- **业务场景覆盖**: 从 30% 提升到 90%
- **代码覆盖率**: 保持 95% 以上
- **文档完整性**: 100% 覆盖所有异常类

### 质量提升

- **类型安全**: 完全消除 `any` 类型使用
- **标准化程度**: 统一的异常定义和使用规范
- **可维护性**: 清晰的分类和层次结构
- **可扩展性**: 支持新异常类型的快速添加

### 业务价值

- **用户体验**: 更精确的错误提示和状态码
- **开发效率**: 标准化的异常处理模式
- **问题诊断**: 更详细的错误信息和上下文
- **系统稳定性**: 更完善的异常处理机制

## 🔧 技术实现细节

### 1. 目录结构设计

```
libs/exceptions/src/
├── core/
│   ├── auth/                    # 认证授权异常
│   ├── user/                    # 用户管理异常
│   ├── tenant/                  # 多租户管理异常
│   ├── organization/            # 组织管理异常
│   ├── department/              # 部门管理异常
│   ├── validation/              # 数据验证异常
│   ├── business/                # 业务规则异常
│   ├── system/                  # 系统资源异常
│   ├── integration/             # 集成服务异常
│   ├── general/                 # 通用异常
│   └── layers/                  # 分层异常基类
│       ├── interface/           # 接口层异常
│       ├── application/         # 应用层异常
│       ├── domain/              # 领域层异常
│       └── infrastructure/      # 基础设施层异常
├── filters/                     # 异常过滤器
├── providers/                   # 消息提供者
├── config/                      # 配置
└── docs/                        # 文档
```

### 2. 导出策略

```typescript
// src/index.ts - 主导出文件
export * from "./core/general/index.js";
export * from "./core/auth/index.js";
export * from "./core/user/index.js";
export * from "./core/tenant/index.js";
export * from "./core/organization/index.js";
export * from "./core/department/index.js";
export * from "./core/validation/index.js";
export * from "./core/business/index.js";
export * from "./core/system/index.js";
export * from "./core/integration/index.js";
export * from "./core/layers/index.js";

// 按需导出
export * from "./filters/index.js";
export * from "./providers/index.js";
export * from "./config/index.js";
export * from "./exception.module.js";
```

### 3. 测试策略

```typescript
// 每个异常类都需要对应的测试文件
// 测试覆盖以下方面：
// 1. 构造函数参数验证
// 2. RFC7807 格式转换
// 3. 错误代码和状态码正确性
// 4. 数据字段完整性
// 5. 异常继承关系
```

## 📚 使用示例

### 1. 基本使用

```typescript
import { 
  UserNotFoundException,
  AuthenticationFailedException,
  BusinessRuleViolationException 
} from '@hl8/exceptions';

// 用户未找到异常
throw new UserNotFoundException('user-123', { 
  requestId: 'req-456',
  timestamp: new Date().toISOString()
});

// 认证失败异常
throw new AuthenticationFailedException('密码错误', {
  username: 'john.doe',
  attemptCount: 3
});

// 业务规则违规异常
throw new BusinessRuleViolationException(
  'ORDER_AMOUNT_LIMIT',
  '订单金额超过限制',
  { orderAmount: 10000, limit: 5000 }
);
```

### 2. 分层异常使用

```typescript
import { 
  DomainLayerException,
  ApplicationLayerException,
  InterfaceLayerException 
} from '@hl8/exceptions';

// 领域层异常
class OrderAmountExceededException extends DomainLayerException {
  constructor(amount: number, limit: number) {
    super(
      'ORDER_AMOUNT_EXCEEDED',
      '订单金额超限',
      `订单金额 ${amount} 超过限制 ${limit}`,
      400,
      { amount, limit }
    );
  }
}

// 应用层异常
class OrderProcessingFailedException extends ApplicationLayerException {
  constructor(orderId: string, reason: string) {
    super(
      'ORDER_PROCESSING_FAILED',
      '订单处理失败',
      `订单 ${orderId} 处理失败: ${reason}`,
      422,
      { orderId, reason }
    );
  }
}
```

## 🎯 总结

本优化方案通过建立清晰的异常分类体系、补充缺失的异常类型、建立分层架构映射，将 `libs/exceptions` 模块从当前的基础版本提升为企业级 SAAS 平台所需的完整异常处理系统。

### 关键优势

1. **完整性** - 覆盖所有业务场景的异常处理
2. **标准化** - 统一的异常定义和使用规范
3. **分层化** - 与架构层次对应的异常映射
4. **可扩展** - 支持新异常类型的快速添加
5. **国际化** - 支持多语言错误消息

### 实施价值

- 提升系统错误处理的专业性和用户体验
- 增强代码的可维护性和可扩展性
- 支持团队协作和知识传承
- 为后续功能开发提供坚实的基础

通过分阶段实施，预计在 4-6 周内完成所有优化工作，将异常处理能力提升到企业级标准。
