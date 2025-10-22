# libs/application-kernel 集成 libs/exceptions 实施计划

## 概述

本文档详细规划了在 `libs/application-kernel` 中集成 `libs/exceptions` 的具体实施步骤、技术方案和交付物。

## 1. 集成目标

### 1.1 主要目标

- **标准化异常处理**：统一应用层的异常处理模式
- **增强错误诊断**：提供结构化的错误信息和上下文
- **提升系统稳定性**：改善异常处理和错误恢复机制
- **支持多租户**：集成数据隔离异常处理能力

### 1.2 成功标准

- ✅ 所有应用层组件使用统一的异常体系
- ✅ 异常处理符合 RFC7807 标准
- ✅ 支持完整的多租户数据隔离异常
- ✅ 保持向后兼容性
- ✅ 提供完整的文档和示例

## 2. 技术架构设计

### 2.1 异常层次映射

```typescript
// 应用层异常映射
BaseUseCase → ApplicationLayerException
BaseCommand → ApplicationLayerException  
BaseQuery → ApplicationLayerException
事件处理 → ApplicationLayerException
事务管理 → InfrastructureLayerException
验证器 → ValidationException
```

### 2.2 异常类型设计

```typescript
// 应用层异常类型
export class ApplicationUseCaseException extends ApplicationLayerException {
  constructor(
    useCaseName: string,
    errorCode: string,
    detail: string,
    context?: Record<string, unknown>
  ) {
    super(errorCode, `用例执行失败: ${useCaseName}`, detail, 500, context);
  }
}

export class ApplicationCommandException extends ApplicationLayerException {
  constructor(
    commandName: string,
    errorCode: string,
    detail: string,
    context?: Record<string, unknown>
  ) {
    super(errorCode, `命令执行失败: ${commandName}`, detail, 400, context);
  }
}

export class ApplicationQueryException extends ApplicationLayerException {
  constructor(
    queryName: string,
    errorCode: string,
    detail: string,
    context?: Record<string, unknown>
  ) {
    super(errorCode, `查询执行失败: ${queryName}`, detail, 400, context);
  }
}
```

## 3. 分阶段实施计划

### 阶段一：基础集成（第1-2周）

#### 3.1.1 依赖配置

**任务**：添加 libs/exceptions 依赖

```json
// package.json
{
  "dependencies": {
    "@hl8/domain-kernel": "workspace:*",
    "@hl8/exceptions": "workspace:*"
  }
}
```

#### 3.1.2 BaseUseCase 集成

**任务**：重构 BaseUseCase 使用 ApplicationLayerException

```typescript
// src/use-cases/base-use-case.ts
import { ApplicationLayerException } from '@hl8/exceptions/core/layers/application';

export abstract class BaseUseCase<TRequest, TResponse> {
  protected validateRequest(request: TRequest): void {
    if (!request) {
      throw new ApplicationLayerException(
        'APPLICATION_INVALID_REQUEST',
        '应用层请求验证失败',
        '请求对象不能为空',
        400,
        { useCaseName: this.useCaseName }
      );
    }
  }

  protected async validatePermissions(context: IUseCaseContext): Promise<void> {
    if (this.requiredPermissions.length === 0) {
      return;
    }

    // 权限验证失败时抛出异常
    if (!await this.checkPermissions(context)) {
      throw new ApplicationLayerException(
        'APPLICATION_PERMISSION_DENIED',
        '应用层权限验证失败',
        `缺少所需权限: ${this.requiredPermissions.join(', ')}`,
        403,
        { 
          useCaseName: this.useCaseName,
          requiredPermissions: this.requiredPermissions,
          userId: context.userId
        }
      );
    }
  }
}
```

#### 3.1.3 验证器集成

**任务**：重构验证器使用 ValidationException

```typescript
// src/validation/base-class.validator.ts
import { ValidationException } from '@hl8/exceptions/core/validation';

export class BaseClassValidator {
  static validateCommandClass(commandClass: any): BaseClassValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];

    if (!this.isSubclassOf(commandClass, BaseCommand)) {
      throw new ValidationException(
        'commandClass',
        `命令类 ${commandClass.name} 必须继承自 BaseCommand`,
        {
          className: commandClass.name,
          expectedBaseClass: 'BaseCommand',
          suggestion: `将 ${commandClass.name} 改为继承自 BaseCommand`
        }
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions,
    };
  }
}
```

#### 3.1.4 交付物

- [x] 更新的 package.json
- [x] 重构的 BaseUseCase
- [x] 重构的验证器
- [x] 基础集成测试
- [x] 集成文档

### 阶段二：CQRS 集成（第3-4周）

#### 3.2.1 BaseCommand 集成

**任务**：重构 BaseCommand 使用 ApplicationLayerException

```typescript
// src/cqrs/commands/base-command.ts
import { ApplicationLayerException } from '@hl8/exceptions/core/layers/application';

export abstract class BaseCommand {
  protected validateCommand(): void {
    if (!this.commandName) {
      throw new ApplicationLayerException(
        'APPLICATION_INVALID_COMMAND',
        '应用层命令验证失败',
        '命令名称不能为空',
        400,
        { commandId: this.commandId.getValue() }
      );
    }
  }

  protected validateIsolationContext(): void {
    if (!this.isolationContext) {
      throw new ApplicationLayerException(
        'APPLICATION_MISSING_ISOLATION_CONTEXT',
        '应用层隔离上下文验证失败',
        '命令缺少隔离上下文',
        400,
        { 
          commandName: this.commandName,
          commandId: this.commandId.getValue()
        }
      );
    }
  }
}
```

#### 3.2.2 BaseQuery 集成

**任务**：重构 BaseQuery 使用 ApplicationLayerException

```typescript
// src/cqrs/queries/base-query.ts
import { ApplicationLayerException } from '@hl8/exceptions/core/layers/application';

export abstract class BaseQuery {
  protected validateQuery(): void {
    if (!this.queryName) {
      throw new ApplicationLayerException(
        'APPLICATION_INVALID_QUERY',
        '应用层查询验证失败',
        '查询名称不能为空',
        400,
        { queryId: this.queryId.getValue() }
      );
    }
  }
}
```

#### 3.2.3 命令和查询处理器集成

**任务**：更新处理器接口使用异常

```typescript
// src/cqrs/commands/command-handler.interface.ts
import { ApplicationLayerException } from '@hl8/exceptions/core/layers/application';

export interface CommandHandler<TCommand extends BaseCommand, TResult> {
  execute(command: TCommand): Promise<TResult>;
  
  // 添加异常处理能力
  handleError(error: ApplicationLayerException, command: TCommand): Promise<void>;
}
```

#### 3.2.4 交付物

- [x] 重构的 CQRS 基础类
- [x] 更新的处理器接口
- [x] CQRS 异常处理测试
- [x] CQRS 使用指南文档

### 阶段三：高级功能集成（第5-6周）

#### 3.3.1 数据隔离异常集成

**任务**：集成多租户数据隔离异常

```typescript
// src/context/use-case-context.interface.ts
import { 
  TenantDataIsolationException,
  OrganizationIsolationException,
  DepartmentIsolationException 
} from '@hl8/exceptions/core/tenant';

export interface IUseCaseContext {
  // 现有属性...
  
  // 添加异常处理能力
  validateTenantAccess(resourceTenantId: string): void;
  validateOrganizationAccess(resourceOrgId: string): void;
  validateDepartmentAccess(resourceDeptId: string): void;
}

// src/context/use-case-context.ts
export class UseCaseContext implements IUseCaseContext {
  validateTenantAccess(resourceTenantId: string): void {
    if (this.tenantId !== resourceTenantId) {
      throw new TenantDataIsolationException(
        '跨租户访问被拒绝',
        {
          isolationLevel: 'tenant',
          resourceType: 'data',
          currentTenantId: this.tenantId,
          targetTenantId: resourceTenantId,
          violationType: 'cross_tenant_access'
        }
      );
    }
  }

  validateOrganizationAccess(resourceOrgId: string): void {
    if (this.organizationId !== resourceOrgId) {
      throw new OrganizationIsolationException(
        '跨组织访问被拒绝',
        {
          organizationId: this.organizationId,
          resourceType: 'data',
          violationType: 'cross_organization_access'
        }
      );
    }
  }
}
```

#### 3.3.2 事务管理异常集成

**任务**：集成事务管理异常

```typescript
// src/transactions/transaction-manager.interface.ts
import { InfrastructureLayerException } from '@hl8/exceptions/core/layers/infrastructure';

export interface ITransactionManager {
  // 现有方法...
  
  // 添加异常处理能力
  handleTransactionError(error: InfrastructureLayerException): Promise<void>;
}

// src/transactions/transaction-manager.utils.ts
export class TransactionManagerUtils {
  static async executeTransaction<T>(
    operation: () => Promise<T>,
    context: TransactionContext
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof InfrastructureLayerException) {
        throw error;
      }
      
      // 将其他错误转换为基础设施层异常
      throw new InfrastructureLayerException(
        'INFRASTRUCTURE_TRANSACTION_FAILED',
        '基础设施层事务失败',
        error instanceof Error ? error.message : '未知错误',
        500,
        { 
          transactionId: context.transactionId,
          operation: context.operation
        },
        error instanceof Error ? error : undefined
      );
    }
  }
}
```

#### 3.3.3 事件系统异常集成

**任务**：集成事件系统异常

```typescript
// src/events/event-handler.base.ts
import { ApplicationLayerException } from '@hl8/exceptions/core/layers/application';

export abstract class BaseEventHandler<TEvent extends DomainEvent> {
  protected async handleEvent(event: TEvent): Promise<void> {
    try {
      await this.processEvent(event);
    } catch (error) {
      throw new ApplicationLayerException(
        'APPLICATION_EVENT_PROCESSING_FAILED',
        '应用层事件处理失败',
        `事件 ${event.eventType} 处理失败: ${error instanceof Error ? error.message : '未知错误'}`,
        500,
        {
          eventId: event.eventId,
          eventType: event.eventType,
          aggregateId: event.aggregateId,
          eventVersion: event.eventVersion
        },
        error instanceof Error ? error : undefined
      );
    }
  }
}
```

#### 3.3.4 交付物

- [x] 完整的数据隔离异常支持
- [x] 事务异常处理
- [x] 事件异常处理
- [x] 完整的集成测试套件
- [x] 高级功能使用指南

### 阶段四：优化和文档（第7-8周）

#### 3.4.1 性能优化

**任务**：优化异常处理性能

```typescript
// src/exceptions/exception-performance.optimizer.ts
export class ExceptionPerformanceOptimizer {
  private static readonly exceptionCache = new Map<string, ApplicationLayerException>();
  
  static createCachedException(
    errorCode: string,
    title: string,
    detail: string,
    status: number,
    context?: Record<string, unknown>
  ): ApplicationLayerException {
    const cacheKey = `${errorCode}:${title}`;
    
    if (this.exceptionCache.has(cacheKey)) {
      const cached = this.exceptionCache.get(cacheKey)!;
      // 创建新的实例以避免状态污染
      return new ApplicationLayerException(
        cached.errorCode,
        cached.title,
        detail, // 使用新的 detail
        status,
        context
      );
    }
    
    const exception = new ApplicationLayerException(
      errorCode,
      title,
      detail,
      status,
      context
    );
    
    this.exceptionCache.set(cacheKey, exception);
    return exception;
  }
}
```

#### 3.4.2 文档完善

**任务**：创建完整的文档和示例

```typescript
// docs/examples/use-case-exception-handling.example.ts
import { BaseUseCase } from '../../src/use-cases/base-use-case.js';
import { ApplicationLayerException } from '@hl8/exceptions/core/layers/application';

export class CreateUserUseCase extends BaseUseCase<CreateUserRequest, CreateUserResponse> {
  constructor() {
    super(
      'CreateUser',
      '创建用户用例',
      '1.0.0',
      ['user:create']
    );
  }

  protected async executeUseCase(
    request: CreateUserRequest,
    context: IUseCaseContext
  ): Promise<CreateUserResponse> {
    try {
      // 验证租户访问权限
      context.validateTenantAccess(request.tenantId);
      
      // 执行业务逻辑
      const user = await this.userRepository.create(request);
      
      return {
        success: true,
        data: user
      };
    } catch (error) {
      if (error instanceof ApplicationLayerException) {
        throw error;
      }
      
      // 转换其他错误为应用层异常
      throw new ApplicationLayerException(
        'APPLICATION_USER_CREATION_FAILED',
        '应用层用户创建失败',
        error instanceof Error ? error.message : '用户创建失败',
        500,
        {
          useCaseName: this.useCaseName,
          userId: context.userId,
          tenantId: request.tenantId
        },
        error instanceof Error ? error : undefined
      );
    }
  }
}
```

#### 3.4.3 迁移指南

**任务**：创建迁移指南

```markdown
# 迁移指南

## 从原生 Error 迁移到 ApplicationLayerException

### 迁移前
```typescript
if (!request) {
  throw new Error("请求对象不能为空");
}
```

### 迁移后

```typescript
if (!request) {
  throw new ApplicationLayerException(
    'APPLICATION_INVALID_REQUEST',
    '应用层请求验证失败',
    '请求对象不能为空',
    400,
    { useCaseName: this.useCaseName }
  );
}
```

## 最佳实践

1. **异常分类**：根据异常类型选择合适的异常类
2. **上下文信息**：提供足够的上下文信息用于调试
3. **错误代码**：使用有意义的错误代码
4. **异常链**：保持异常链的完整性

```

#### 3.4.4 交付物

- [x] 性能优化报告
- [x] 完整的文档
- [x] 迁移指南
- [x] 培训材料
- [x] 最佳实践指南

## 4. 技术实施细节

### 4.1 异常类型映射表

| 当前异常类型 | 目标异常类型 | 错误代码前缀 | HTTP状态码 |
|-------------|-------------|-------------|-----------|
| Error (请求验证) | ApplicationLayerException | APPLICATION_INVALID_REQUEST | 400 |
| Error (权限验证) | ApplicationLayerException | APPLICATION_PERMISSION_DENIED | 403 |
| Error (命令验证) | ApplicationLayerException | APPLICATION_INVALID_COMMAND | 400 |
| Error (查询验证) | ApplicationLayerException | APPLICATION_INVALID_QUERY | 400 |
| Error (事务失败) | InfrastructureLayerException | INFRASTRUCTURE_TRANSACTION_FAILED | 500 |
| Error (事件处理) | ApplicationLayerException | APPLICATION_EVENT_PROCESSING_FAILED | 500 |

### 4.2 异常上下文信息

```typescript
interface ApplicationExceptionContext {
  // 用例信息
  useCaseName?: string;
  useCaseVersion?: string;
  
  // 用户信息
  userId?: string;
  tenantId?: string;
  organizationId?: string;
  departmentId?: string;
  
  // 请求信息
  requestId?: string;
  commandId?: string;
  queryId?: string;
  
  // 业务信息
  resourceType?: string;
  resourceId?: string;
  operation?: string;
  
  // 时间信息
  timestamp?: string;
  duration?: number;
}
```

### 4.3 异常处理策略

```typescript
// 异常处理策略配置
export interface ExceptionHandlingStrategy {
  // 异常重试策略
  retryPolicy: {
    maxRetries: number;
    retryDelay: number;
    retryableErrors: string[];
  };
  
  // 异常降级策略
  fallbackPolicy: {
    enableFallback: boolean;
    fallbackHandler?: (error: ApplicationLayerException) => Promise<any>;
  };
  
  // 异常监控策略
  monitoringPolicy: {
    enableMetrics: boolean;
    enableTracing: boolean;
    alertThreshold: number;
  };
}
```

## 5. 测试策略

### 5.1 单元测试

```typescript
// src/use-cases/base-use-case.spec.ts
import { BaseUseCase } from './base-use-case.js';
import { ApplicationLayerException } from '@hl8/exceptions/core/layers/application';

describe('BaseUseCase', () => {
  it('应该在使用空请求时抛出 ApplicationLayerException', async () => {
    const useCase = new TestUseCase();
    const context = createMockContext();
    
    await expect(useCase.execute(null, context))
      .rejects
      .toThrow(ApplicationLayerException);
  });
  
  it('应该在权限不足时抛出 ApplicationLayerException', async () => {
    const useCase = new TestUseCase('TestUseCase', '测试用例', '1.0.0', ['admin:read']);
    const context = createMockContext({ permissions: ['user:read'] });
    
    await expect(useCase.execute({}, context))
      .rejects
      .toThrow(ApplicationLayerException);
  });
});
```

### 5.2 集成测试

```typescript
// test/integration/exception-handling.integration.spec.ts
import { ApplicationLayerException } from '@hl8/exceptions/core/layers/application';

describe('异常处理集成测试', () => {
  it('应该正确处理应用层异常', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({})
      .expect(400);
    
    expect(response.body).toMatchObject({
      type: 'https://docs.hl8.com/errors#APPLICATION_INVALID_REQUEST',
      title: '应用层请求验证失败',
      status: 400,
      errorCode: 'APPLICATION_INVALID_REQUEST'
    });
  });
});
```

### 5.3 性能测试

```typescript
// test/performance/exception-performance.spec.ts
describe('异常处理性能测试', () => {
  it('应该能够快速创建异常实例', () => {
    const startTime = performance.now();
    
    for (let i = 0; i < 10000; i++) {
      new ApplicationLayerException(
        'APPLICATION_TEST_ERROR',
        '测试异常',
        '性能测试异常',
        500
      );
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(100); // 应该在100ms内完成
  });
});
```

## 6. 质量保证

### 6.1 代码质量

- **ESLint 规则**：确保异常处理代码符合编码规范
- **TypeScript 严格模式**：确保类型安全
- **代码覆盖率**：异常处理代码覆盖率 > 90%

### 6.2 性能质量

- **异常创建性能**：异常实例创建时间 < 1ms
- **异常处理性能**：异常处理开销 < 5ms
- **内存使用**：异常处理内存开销 < 1MB

### 6.3 功能质量

- **异常信息完整性**：所有异常都包含完整的上下文信息
- **异常格式一致性**：所有异常都符合 RFC7807 标准
- **异常处理一致性**：所有组件都使用统一的异常处理模式

## 7. 风险缓解

### 7.1 技术风险缓解

**向后兼容性风险**：

- 保留原有的 Error 处理方式
- 提供渐进式迁移路径
- 创建兼容性适配器

**性能风险**：

- 实施异常缓存机制
- 优化异常创建流程
- 监控异常处理性能

### 7.2 业务风险缓解

**学习成本风险**：

- 提供详细的文档和示例
- 创建培训材料
- 组织团队培训

**迁移风险**：

- 分阶段实施
- 并行运行新旧系统
- 提供回滚机制

## 8. 成功指标

### 8.1 技术指标

- **异常处理覆盖率**：100% 的应用层组件使用新的异常体系
- **异常处理性能**：异常处理开销 < 5ms
- **异常处理准确性**：异常信息准确性 > 95%

### 8.2 业务指标

- **开发效率**：异常处理代码减少 50%
- **调试效率**：异常诊断时间减少 70%
- **系统稳定性**：异常相关故障减少 80%

## 9. 总结

本实施计划提供了在 `libs/application-kernel` 中集成 `libs/exceptions` 的详细技术方案和实施步骤。通过分阶段实施、风险缓解和质量保证，可以确保集成的成功和系统的稳定性。

**关键成功因素**：

- 🎯 渐进式集成策略
- 🎯 完整的测试覆盖
- 🎯 详细的文档和培训
- 🎯 持续的质量监控

**预期收益**：

- 🚀 异常处理标准化
- 🚀 开发效率提升
- 🚀 系统稳定性改善
- 🚀 多租户支持增强
