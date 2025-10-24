# libs/exceptions 模块架构图

> **版本**: 1.0.0 | **创建日期**: 2025-01-27 | **模块**: libs/exceptions

## 📊 异常分类架构图

### 1. 异常分类层次结构

```
libs/exceptions/
├── 认证授权异常 (Auth Exceptions)
│   ├── AuthenticationFailedException
│   ├── UnauthorizedException
│   ├── TokenExpiredException
│   ├── InvalidTokenException
│   └── InsufficientPermissionsException
│
├── 用户管理异常 (User Exceptions)
│   ├── UserNotFoundException
│   ├── UserAlreadyExistsException
│   ├── InvalidUserStatusException
│   ├── UserAccountLockedException
│   └── UserAccountDisabledException
│
├── 多租户异常 (Tenant Exceptions)
│   ├── TenantNotFoundException
│   ├── CrossTenantAccessException
│   ├── DataIsolationViolationException
│   └── InvalidTenantContextException
│
├── 组织管理异常 (Organization Exceptions)
│   ├── OrganizationNotFoundException
│   ├── UnauthorizedOrganizationException
│   └── InvalidOrganizationHierarchyException
│
├── 部门管理异常 (Department Exceptions)
│   ├── DepartmentNotFoundException
│   ├── UnauthorizedDepartmentException
│   └── InvalidDepartmentHierarchyException
│
├── 数据验证异常 (Validation Exceptions)
│   ├── ValidationFailedException
│   ├── BusinessRuleViolationException
│   └── ConstraintViolationException
│
├── 系统资源异常 (System Exceptions)
│   ├── RateLimitExceededException
│   ├── ServiceUnavailableException
│   └── ResourceNotFoundException
│
└── 通用异常 (General Exceptions)
    ├── GeneralBadRequestException
    ├── GeneralInternalServerException
    └── GeneralNotFoundException
```

## 🏛️ 分层架构异常映射图

### 2. Clean Architecture 分层异常映射

```
┌─────────────────────────────────────────────────────────────┐
│                    接口层 (Interface Layer)                   │
├─────────────────────────────────────────────────────────────┤
│ 认证授权异常    │ 权限控制异常    │ 请求格式异常    │ 参数验证异常  │
│ AuthException   │ PermissionEx    │ RequestFormatEx │ ParamValidEx │
└─────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────┐
│                    应用层 (Application Layer)                 │
├─────────────────────────────────────────────────────────────┤
│ 用例执行异常    │ 命令查询异常    │ 事件处理异常    │ 工作流异常    │
│ UseCaseEx       │ CQRSException   │ EventProcessEx  │ WorkflowEx   │
└─────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────┐
│                    领域层 (Domain Layer)                      │
├─────────────────────────────────────────────────────────────┤
│ 业务规则异常    │ 领域约束异常    │ 聚合一致性异常  │ 领域事件异常  │
│ BusinessRuleEx  │ DomainConstraint│ AggregateConsist│ DomainEventEx│
└─────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────┐
│                  基础设施层 (Infrastructure Layer)             │
├─────────────────────────────────────────────────────────────┤
│ 持久化异常      │ 外部服务异常    │ 集成异常        │ 配置异常      │
│ PersistenceEx   │ ExternalServiceEx│ IntegrationEx  │ ConfigEx      │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 异常传播流程图

### 3. 异常传播和处理流程

```
异常发生 → 异常分类 → 异常转换 → 异常过滤 → RFC7807响应 → 日志记录
    ↓           ↓           ↓           ↓           ↓           ↓
领域层异常 → 应用层异常 → 接口层异常 → 异常过滤器 → 标准响应 → 错误日志
    ↓           ↓           ↓           ↓           ↓           ↓
业务规则违规 → 用例执行失败 → 客户端错误 → 统一格式 → 问题详情 → 监控告警
```

## 📋 异常状态码映射表

### 4. HTTP 状态码与异常类型映射

| 状态码 | 异常类型       | 使用场景                   | 示例异常                       |
| ------ | -------------- | -------------------------- | ------------------------------ |
| 400    | 客户端错误     | 请求参数错误、业务规则违规 | ValidationFailedException      |
| 401    | 认证失败       | 未认证、令牌过期           | AuthenticationFailedException  |
| 403    | 权限不足       | 无权限访问资源             | UnauthorizedException          |
| 404    | 资源未找到     | 实体不存在                 | UserNotFoundException          |
| 409    | 资源冲突       | 重复创建、状态冲突         | UserAlreadyExistsException     |
| 422    | 业务逻辑错误   | 业务规则违规、状态不一致   | BusinessRuleViolationException |
| 423    | 资源锁定       | 账户锁定、资源被占用       | UserAccountLockedException     |
| 429    | 请求频率限制   | 速率限制超出               | RateLimitExceededException     |
| 500    | 服务器内部错误 | 未预期的系统错误           | GeneralInternalServerException |
| 503    | 服务不可用     | 外部服务不可用             | ServiceUnavailableException    |

## 🎯 异常使用场景映射

### 5. 业务场景与异常对应关系

```
用户认证场景:
├── 登录失败 → AuthenticationFailedException
├── 令牌过期 → TokenExpiredException
├── 权限不足 → InsufficientPermissionsException
└── 账户锁定 → UserAccountLockedException

用户管理场景:
├── 用户不存在 → UserNotFoundException
├── 用户已存在 → UserAlreadyExistsException
├── 状态无效 → InvalidUserStatusException
└── 账户禁用 → UserAccountDisabledException

多租户场景:
├── 租户不存在 → TenantNotFoundException
├── 跨租户访问 → CrossTenantAccessException
├── 数据隔离违规 → DataIsolationViolationException
└── 上下文无效 → InvalidTenantContextException

数据验证场景:
├── 验证失败 → ValidationFailedException
├── 业务规则违规 → BusinessRuleViolationException
├── 约束违规 → ConstraintViolationException
└── 参数无效 → InvalidParameterException

系统资源场景:
├── 速率限制 → RateLimitExceededException
├── 服务不可用 → ServiceUnavailableException
├── 资源未找到 → ResourceNotFoundException
└── 外部服务异常 → ExternalServiceException
```

## 🔧 异常配置映射

### 6. 异常配置与消息映射

```typescript
// 异常配置映射表
const EXCEPTION_CONFIG = {
  // 认证异常配置
  AUTH_LOGIN_FAILED: {
    status: 401,
    category: "auth",
    layer: "interface",
    message: {
      title: "认证失败",
      detail: "用户名或密码错误",
    },
  },

  // 用户异常配置
  USER_NOT_FOUND: {
    status: 404,
    category: "user",
    layer: "interface",
    message: {
      title: "用户未找到",
      detail: 'ID 为 "{{userId}}" 的用户不存在',
    },
  },

  // 业务规则异常配置
  BUSINESS_RULE_VIOLATION: {
    status: 422,
    category: "business",
    layer: "domain",
    message: {
      title: "业务规则违规",
      detail: '业务规则 "{{ruleName}}" 被违反: {{violation}}',
    },
  },
};
```

## 📊 异常统计和监控

### 7. 异常监控指标

```
异常统计指标:
├── 异常数量统计
│   ├── 按异常类型统计
│   ├── 按时间维度统计
│   └── 按业务模块统计
├── 异常趋势分析
│   ├── 异常频率趋势
│   ├── 异常严重程度趋势
│   └── 异常解决时间趋势
└── 异常影响评估
    ├── 用户体验影响
    ├── 系统稳定性影响
    └── 业务连续性影响
```

## 🎨 异常可视化展示

### 8. 异常分类饼图数据

```
异常类型分布 (示例数据):
├── 认证授权异常: 25%
├── 用户管理异常: 20%
├── 数据验证异常: 18%
├── 多租户异常: 15%
├── 系统资源异常: 12%
├── 业务规则异常: 8%
└── 其他异常: 2%
```

## 📚 总结

本架构图展示了 `libs/exceptions` 模块的完整设计：

1. **分类体系** - 清晰的异常分类和层次结构
2. **分层映射** - 与 Clean Architecture 对应的异常映射
3. **传播流程** - 异常在架构层次间的传播机制
4. **状态码映射** - HTTP 状态码与异常类型的对应关系
5. **场景映射** - 业务场景与异常类型的对应关系
6. **配置映射** - 异常配置和消息的映射关系
7. **监控指标** - 异常统计和监控的指标体系

通过这个架构设计，可以实现：

- 标准化的异常处理流程
- 清晰的异常分类和管理
- 与架构层次对应的异常映射
- 完整的异常监控和统计
- 可扩展的异常处理机制
