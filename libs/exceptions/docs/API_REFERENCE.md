# API 参考文档

## 概述

本文档详细描述了 `@hl8/exceptions` 模块的所有API接口、异常类、过滤器和配置选项。

## 目录

- [核心异常类](#核心异常类)
- [分层异常基类](#分层异常基类)
- [业务域异常类](#业务域异常类)
- [异常过滤器](#异常过滤器)
- [消息提供者](#消息提供者)
- [配置选项](#配置选项)
- [接口定义](#接口定义)

## 核心异常类

### AbstractHttpException

所有自定义异常的抽象基类，继承自 NestJS 的 `HttpException`。

```typescript
abstract class AbstractHttpException extends HttpException {
  /**
   * 错误代码
   */
  readonly errorCode: string;

  /**
   * 错误标题
   */
  readonly title: string;

  /**
   * 错误详情
   */
  readonly detail: string;

  /**
   * HTTP状态码
   */
  readonly httpStatus: number;

  /**
   * 附加数据
   */
  readonly data?: Record<string, unknown>;

  /**
   * 错误类型URI
   */
  readonly type?: string;

  /**
   * 根本原因
   */
  readonly rootCause?: Error;

  /**
   * 构造函数
   */
  constructor(
    errorCode: string,
    title: string,
    detail: string,
    status: number,
    data?: Record<string, unknown>,
    type?: string,
    rootCause?: Error,
  );

  /**
   * 转换为RFC7807格式
   */
  toRFC7807(): ProblemDetails;
}
```

### ProblemDetails

RFC7807标准的问题详情接口。

```typescript
interface ProblemDetails {
  /**
   * 错误类型的URI引用
   */
  type: string;

  /**
   * 错误的简短摘要
   */
  title: string;

  /**
   * 错误的详细说明
   */
  detail: string;

  /**
   * HTTP状态码
   */
  status: number;

  /**
   * 应用自定义的错误代码
   */
  errorCode: string;

  /**
   * 请求实例的唯一标识符
   */
  instance?: string;

  /**
   * 附加数据
   */
  data?: Record<string, unknown>;
}
```

## 分层异常基类

### InterfaceLayerException

接口层异常基类，用于处理来自接口层的异常。

```typescript
abstract class InterfaceLayerException extends AbstractHttpException {
  /**
   * 获取层级名称
   */
  getLayer(): string; // 返回 "interface"
}
```

### ApplicationLayerException

应用层异常基类，用于处理来自应用层的异常。

```typescript
abstract class ApplicationLayerException extends AbstractHttpException {
  /**
   * 获取层级名称
   */
  getLayer(): string; // 返回 "application"
}
```

### DomainLayerException

领域层异常基类，用于处理来自领域层的异常。

```typescript
abstract class DomainLayerException extends AbstractHttpException {
  /**
   * 获取层级名称
   */
  getLayer(): string; // 返回 "domain"
}
```

### InfrastructureLayerException

基础设施层异常基类，用于处理来自基础设施层的异常。

```typescript
abstract class InfrastructureLayerException extends AbstractHttpException {
  /**
   * 获取层级名称
   */
  getLayer(): string; // 返回 "infrastructure"
}
```

## 业务域异常类

### 认证授权异常 (auth)

#### AuthException

认证异常基类。

```typescript
abstract class AuthException extends InterfaceLayerException {
  /**
   * 获取异常类别
   */
  getCategory(): string; // 返回 "auth"
}
```

#### AuthenticationFailedException

认证失败异常。

```typescript
class AuthenticationFailedException extends AuthException {
  constructor(reason: string, data?: Record<string, unknown>);
}
```

#### UnauthorizedException

未授权访问异常。

```typescript
class UnauthorizedException extends AuthException {
  constructor(reason: string, data?: Record<string, unknown>);
}
```

#### TokenExpiredException

令牌过期异常。

```typescript
class TokenExpiredException extends AuthException {
  constructor(reason: string, data?: Record<string, unknown>);
}
```

#### InvalidTokenException

无效令牌异常。

```typescript
class InvalidTokenException extends AuthException {
  constructor(reason: string, data?: Record<string, unknown>);
}
```

#### InsufficientPermissionsException

权限不足异常。

```typescript
class InsufficientPermissionsException extends AuthException {
  constructor(reason: string, data?: Record<string, unknown>);
}
```

### 用户管理异常 (user)

#### UserException

用户异常基类。

```typescript
abstract class UserException extends InterfaceLayerException {
  /**
   * 获取异常类别
   */
  getCategory(): string; // 返回 "user"
}
```

#### UserNotFoundException

用户未找到异常。

```typescript
class UserNotFoundException extends UserException {
  constructor(userId: string, data?: Record<string, unknown>);
}
```

#### UserAlreadyExistsException

用户已存在异常。

```typescript
class UserAlreadyExistsException extends UserException {
  constructor(identifier: string, field: string, data?: Record<string, unknown>);
}
```

#### InvalidUserStatusException

用户状态无效异常。

```typescript
class InvalidUserStatusException extends UserException {
  constructor(currentStatus: string, expectedStatus: string, data?: Record<string, unknown>);
}
```

#### UserAccountLockedException

用户账户锁定异常。

```typescript
class UserAccountLockedException extends UserException {
  constructor(reason: string, data?: Record<string, unknown>);
}
```

#### UserAccountDisabledException

用户账户禁用异常。

```typescript
class UserAccountDisabledException extends UserException {
  constructor(reason: string, data?: Record<string, unknown>);
}
```

### 多租户异常 (tenant)

#### TenantException

租户异常基类。

```typescript
abstract class TenantException extends DomainLayerException {
  /**
   * 获取异常类别
   */
  getCategory(): string; // 返回 "tenant"
}
```

#### CrossTenantAccessException

跨租户访问违规异常。

```typescript
class CrossTenantAccessException extends TenantException {
  constructor(currentTenantId: string, targetTenantId: string, data?: Record<string, unknown>);
}
```

#### DataIsolationViolationException

数据隔离违规异常。

```typescript
class DataIsolationViolationException extends TenantException {
  constructor(reason: string, data?: Record<string, unknown>);
}
```

#### InvalidTenantContextException

无效租户上下文异常。

```typescript
class InvalidTenantContextException extends TenantException {
  constructor(reason: string, data?: Record<string, unknown>);
}
```

### 数据验证异常 (validation)

#### ValidationException

验证异常基类。

```typescript
abstract class ValidationException extends DomainLayerException {
  /**
   * 获取异常类别
   */
  getCategory(): string; // 返回 "validation"
}
```

#### ValidationFailedException

验证失败异常。

```typescript
class ValidationFailedException extends ValidationException {
  constructor(field: string, reason: string, data?: Record<string, unknown>);
}
```

#### BusinessRuleViolationException

业务规则违规异常。

```typescript
class BusinessRuleViolationException extends ValidationException {
  constructor(ruleName: string, violation: string, data?: Record<string, unknown>);
}
```

#### ConstraintViolationException

约束违规异常。

```typescript
class ConstraintViolationException extends ValidationException {
  constructor(constraintType: string, violation: string, data?: Record<string, unknown>);
}
```

### 系统资源异常 (system)

#### SystemException

系统异常基类。

```typescript
abstract class SystemException extends InfrastructureLayerException {
  /**
   * 获取异常类别
   */
  getCategory(): string; // 返回 "system"
}
```

#### RateLimitExceededException

速率限制超出异常。

```typescript
class RateLimitExceededException extends SystemException {
  constructor(reason: string, data?: Record<string, unknown>);
}
```

#### ServiceUnavailableException

服务不可用异常。

```typescript
class ServiceUnavailableException extends SystemException {
  constructor(reason: string, data?: Record<string, unknown>);
}
```

#### ResourceNotFoundException

资源未找到异常。

```typescript
class ResourceNotFoundException extends SystemException {
  constructor(resourceType: string, resourceId: string, data?: Record<string, unknown>);
}
```

### 组织管理异常 (organization)

#### OrganizationException

组织异常基类。

```typescript
abstract class OrganizationException extends ApplicationLayerException {
  /**
   * 获取异常类别
   */
  getCategory(): string; // 返回 "organization"
}
```

#### OrganizationNotFoundException

组织未找到异常。

```typescript
class OrganizationNotFoundException extends OrganizationException {
  constructor(organizationId: string, data?: Record<string, unknown>);
}
```

#### UnauthorizedOrganizationException

未授权组织访问异常。

```typescript
class UnauthorizedOrganizationException extends OrganizationException {
  constructor(userId: string, organizationId: string, data?: Record<string, unknown>);
}
```

### 部门管理异常 (department)

#### DepartmentException

部门异常基类。

```typescript
abstract class DepartmentException extends ApplicationLayerException {
  /**
   * 获取异常类别
   */
  getCategory(): string; // 返回 "department"
}
```

#### DepartmentNotFoundException

部门未找到异常。

```typescript
class DepartmentNotFoundException extends DepartmentException {
  constructor(departmentId: string, data?: Record<string, unknown>);
}
```

#### UnauthorizedDepartmentException

未授权部门访问异常。

```typescript
class UnauthorizedDepartmentException extends DepartmentException {
  constructor(userId: string, departmentId: string, data?: Record<string, unknown>);
}
```

#### InvalidDepartmentHierarchyException

无效部门层级异常。

```typescript
class InvalidDepartmentHierarchyException extends DepartmentException {
  constructor(reason: string, data?: Record<string, unknown>);
}
```

### 业务逻辑异常 (business)

#### BusinessException

业务异常基类。

```typescript
abstract class BusinessException extends DomainLayerException {
  /**
   * 获取异常类别
   */
  getCategory(): string; // 返回 "business"
}
```

#### OperationFailedException

操作失败异常。

```typescript
class OperationFailedException extends BusinessException {
  constructor(operation: string, reason: string, data?: Record<string, unknown>);
}
```

#### InvalidStateTransitionException

无效状态转换异常。

```typescript
class InvalidStateTransitionException extends BusinessException {
  constructor(entity: string, currentState: string, targetState: string, data?: Record<string, unknown>);
}
```

#### StepFailedException

步骤失败异常。

```typescript
class StepFailedException extends BusinessException {
  constructor(workflowName: string, stepNumber: number, reason: string, data?: Record<string, unknown>);
}
```

### 集成异常 (integration)

#### IntegrationException

集成异常基类。

```typescript
abstract class IntegrationException extends InfrastructureLayerException {
  /**
   * 获取异常类别
   */
  getCategory(): string; // 返回 "integration"
}
```

#### ExternalServiceUnavailableException

外部服务不可用异常。

```typescript
class ExternalServiceUnavailableException extends IntegrationException {
  constructor(serviceName: string, reason: string, data?: Record<string, unknown>);
}
```

#### ExternalServiceErrorException

外部服务错误异常。

```typescript
class ExternalServiceErrorException extends IntegrationException {
  constructor(serviceName: string, errorMessage: string, statusCode: number, data?: Record<string, unknown>);
}
```

#### ExternalServiceTimeoutException

外部服务超时异常。

```typescript
class ExternalServiceTimeoutException extends IntegrationException {
  constructor(serviceName: string, timeoutMs: number, data?: Record<string, unknown>);
}
```

### 通用异常 (general)

#### GeneralException

通用异常基类。

```typescript
abstract class GeneralException extends InterfaceLayerException {
  /**
   * 获取异常类别
   */
  getCategory(): string; // 返回 "general"
}
```

#### NotImplementedException

未实现异常。

```typescript
class NotImplementedException extends GeneralException {
  constructor(feature: string, data?: Record<string, unknown>);
}
```

#### MaintenanceModeException

维护模式异常。

```typescript
class MaintenanceModeException extends GeneralException {
  constructor(reason: string, data?: Record<string, unknown>);
}
```

## 异常过滤器

### HttpExceptionFilter

HTTP异常过滤器，专门处理 `AbstractHttpException` 及其子类。

```typescript
@Injectable()
@Catch(AbstractHttpException)
export class HttpExceptionFilter implements ExceptionFilter<AbstractHttpException> {
  constructor(
    @Optional() private readonly logger?: ILoggerService,
    @Optional() private readonly messageProvider?: IExceptionMessageProvider,
  ) {}

  catch(exception: AbstractHttpException, host: ArgumentsHost): void;
}
```

### AnyExceptionFilter

全局异常过滤器，捕获所有未被其他过滤器处理的异常。

```typescript
@Injectable()
@Catch()
export class AnyExceptionFilter implements ExceptionFilter {
  constructor(
    @Optional() private readonly logger?: ILoggerService,
    @Optional() private readonly isProduction?: boolean,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void;
}
```

## 消息提供者

### ExceptionMessageProvider

异常消息提供者接口。

```typescript
export interface ExceptionMessageProvider {
  /**
   * 获取消息
   */
  getMessage(
    errorCode: string,
    messageType: "title" | "detail",
    params?: Record<string, unknown>,
  ): string | undefined;

  /**
   * 检查是否有消息
   */
  hasMessage(errorCode: string, messageType: "title" | "detail"): boolean;

  /**
   * 获取所有可用的错误代码
   */
  getAvailableErrorCodes(): string[];
}
```

### DefaultMessageProvider

默认消息提供者实现。

```typescript
export class DefaultMessageProvider implements ExceptionMessageProvider {
  constructor(private readonly messages?: Record<string, { title: string; detail: string }>);

  getMessage(errorCode: string, messageType: "title" | "detail", params?: Record<string, unknown>): string | undefined;
  hasMessage(errorCode: string, messageType: "title" | "detail"): boolean;
  getAvailableErrorCodes(): string[];
}
```

## 配置选项

### ExceptionConfig

异常模块配置选项。

```typescript
export interface ExceptionConfig {
  /**
   * 是否启用日志记录
   */
  enableLogging?: boolean;

  /**
   * 是否为生产环境
   */
  isProduction?: boolean;

  /**
   * 自定义消息提供者
   */
  messageProvider?: ExceptionMessageProvider;

  /**
   * 是否全局注册过滤器
   */
  registerGlobalFilters?: boolean;
}
```

## 接口定义

### ILoggerService

日志服务接口。

```typescript
export interface ILoggerService {
  /**
   * 记录信息日志
   */
  log(message: string, context?: Record<string, unknown>): void;

  /**
   * 记录错误日志
   */
  error(message: string, stack?: string, context?: Record<string, unknown>): void;

  /**
   * 记录警告日志
   */
  warn(message: string, context?: Record<string, unknown>): void;
}
```

### IExceptionMessageProvider

异常消息提供者接口（别名）。

```typescript
export interface IExceptionMessageProvider extends ExceptionMessageProvider {}
```

## 错误代码列表

### 认证授权异常

- `AUTH_LOGIN_FAILED` - 认证失败
- `AUTH_UNAUTHORIZED` - 未授权访问
- `AUTH_TOKEN_EXPIRED` - 令牌过期
- `AUTH_INVALID_TOKEN` - 无效令牌
- `AUTH_INSUFFICIENT_PERMISSIONS` - 权限不足

### 用户管理异常

- `USER_NOT_FOUND` - 用户未找到
- `USER_ALREADY_EXISTS` - 用户已存在
- `USER_INVALID_STATUS` - 用户状态无效
- `USER_ACCOUNT_LOCKED` - 账户被锁定
- `USER_ACCOUNT_DISABLED` - 账户已禁用

### 多租户异常

- `TENANT_NOT_FOUND` - 租户未找到
- `TENANT_CROSS_ACCESS_VIOLATION` - 跨租户访问违规
- `TENANT_DATA_ISOLATION_VIOLATION` - 数据隔离违规
- `TENANT_INVALID_CONTEXT` - 无效租户上下文

### 数据验证异常

- `VALIDATION_FAILED` - 数据验证失败
- `BUSINESS_RULE_VIOLATION` - 业务规则违规
- `CONSTRAINT_VIOLATION` - 约束违规

### 系统资源异常

- `SYSTEM_RATE_LIMIT_EXCEEDED` - 速率限制超出
- `SYSTEM_SERVICE_UNAVAILABLE` - 服务不可用
- `SYSTEM_RESOURCE_NOT_FOUND` - 资源未找到

### 组织管理异常

- `ORGANIZATION_NOT_FOUND` - 组织未找到
- `ORGANIZATION_UNAUTHORIZED` - 未授权组织访问

### 部门管理异常

- `DEPARTMENT_NOT_FOUND` - 部门未找到
- `DEPARTMENT_UNAUTHORIZED` - 未授权部门访问
- `DEPARTMENT_INVALID_HIERARCHY` - 无效部门层级

### 业务逻辑异常

- `BUSINESS_OPERATION_FAILED` - 操作失败
- `BUSINESS_INVALID_STATE_TRANSITION` - 无效状态转换
- `BUSINESS_STEP_FAILED` - 步骤失败

### 集成异常

- `INTEGRATION_EXTERNAL_SERVICE_UNAVAILABLE` - 外部服务不可用
- `INTEGRATION_EXTERNAL_SERVICE_ERROR` - 外部服务错误
- `INTEGRATION_EXTERNAL_SERVICE_TIMEOUT` - 外部服务超时

### 通用异常

- `GENERAL_NOT_IMPLEMENTED` - 功能未实现
- `GENERAL_MAINTENANCE_MODE` - 系统维护中

### 通用异常（向后兼容）

- `NOT_FOUND` - 资源未找到
- `BAD_REQUEST` - 请求错误
- `INTERNAL_SERVER_ERROR` - 服务器内部错误
