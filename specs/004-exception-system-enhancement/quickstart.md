# Quick Start Guide: Exception System Enhancement

**Feature**: Exception System Enhancement  
**Date**: 2025-01-27  
**Status**: Ready for Implementation

## Overview

This quick start guide provides developers with essential information to begin implementing the enhanced exception handling system. The system provides standardized, categorized exceptions with RFC7807 compliance and Clean Architecture alignment.

## Prerequisites

- Node.js >= 20
- TypeScript 5.9.2
- NestJS 11.1.6
- Existing libs/exceptions module
- pnpm package manager

## Installation and Setup

### 1. Module Dependencies

The enhanced exception system extends the existing libs/exceptions module:

```bash
# Already installed as part of monorepo
cd libs/exceptions
pnpm install
```

### 2. Import and Usage

```typescript
// Import specific exception categories
import { 
  AuthenticationFailedException,
  UserNotFoundException,
  CrossTenantAccessException 
} from '@hl8/exceptions';

// Import layer-specific base classes
import { 
  DomainLayerException,
  ApplicationLayerException 
} from '@hl8/exceptions/layers';
```

## Core Concepts

### 1. Exception Categories

The system organizes exceptions into business domain categories:

- **auth/**: Authentication and authorization exceptions
- **user/**: User management exceptions  
- **tenant/**: Multi-tenant and isolation exceptions
- **organization/**: Organization management exceptions
- **department/**: Department management exceptions
- **validation/**: Data validation exceptions
- **business/**: Business rule exceptions
- **system/**: System resource exceptions
- **integration/**: External service integration exceptions
- **general/**: General purpose exceptions

### 2. Architecture Layers

Exceptions align with Clean Architecture layers:

- **interface/**: Interface layer exceptions (HTTP, API)
- **application/**: Application layer exceptions (use cases, workflows)
- **domain/**: Domain layer exceptions (business logic, rules)
- **infrastructure/**: Infrastructure layer exceptions (database, external services)

### 3. RFC7807 Compliance

All exceptions follow RFC7807 standard format:

```typescript
{
  "type": "https://docs.hl8.com/errors#AUTH_LOGIN_FAILED",
  "title": "认证失败",
  "detail": "用户名或密码错误",
  "status": 401,
  "errorCode": "AUTH_LOGIN_FAILED",
  "instance": "req-123456",
  "data": {
    "username": "john.doe",
    "attemptCount": 3
  }
}
```

## Basic Usage Examples

### 1. Authentication Exceptions

```typescript
import { AuthenticationFailedException } from '@hl8/exceptions';

// Basic usage
throw new AuthenticationFailedException('密码错误');

// With context data
throw new AuthenticationFailedException('密码错误', {
  username: 'john.doe',
  attemptCount: 3,
  lockUntil: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
});
```

### 2. User Management Exceptions

```typescript
import { UserNotFoundException } from '@hl8/exceptions';

// User not found
throw new UserNotFoundException('user-123', {
  requestId: 'req-456',
  timestamp: new Date().toISOString()
});

// User already exists
throw new UserAlreadyExistsException('john@example.com', 'email', {
  existingUserId: 'user-456'
});
```

### 3. Multi-tenant Exceptions

```typescript
import { CrossTenantAccessException } from '@hl8/exceptions';

// Cross-tenant access violation
throw new CrossTenantAccessException('tenant-123', 'tenant-456', {
  resourceType: 'user',
  resourceId: 'user-789',
  operation: 'read'
});
```

### 4. Validation Exceptions

```typescript
import { ValidationFailedException } from '@hl8/exceptions';

// Field validation failure
throw new ValidationFailedException('email', '邮箱格式无效', {
  providedValue: 'invalid-email',
  expectedFormat: 'user@example.com'
});

// Business rule violation
throw new BusinessRuleViolationException(
  'ORDER_AMOUNT_LIMIT',
  '订单金额超过限制',
  { orderAmount: 10000, limit: 5000 }
);
```

### 5. Layer-Specific Exceptions

```typescript
import { DomainLayerException } from '@hl8/exceptions/layers';

// Custom domain exception
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
```

## Configuration

### 1. Module Configuration

```typescript
import { ExceptionModule } from '@hl8/exceptions';

@Module({
  imports: [
    ExceptionModule.forRoot({
      enableLogging: true,
      isProduction: process.env.NODE_ENV === 'production',
      messageProvider: new CustomMessageProvider(),
    }),
  ],
})
export class AppModule {}
```

### 2. Custom Message Provider

```typescript
import { ExceptionMessageProvider } from '@hl8/exceptions';

@Injectable()
export class CustomMessageProvider implements ExceptionMessageProvider {
  getMessage(
    errorCode: string,
    messageType: 'title' | 'detail',
    params?: Record<string, unknown>
  ): string | undefined {
    // Custom message logic
    const messages = {
      'AUTH_LOGIN_FAILED': {
        title: '登录失败',
        detail: '用户名或密码错误，请重试'
      }
    };
    
    return messages[errorCode]?.[messageType];
  }

  hasMessage(errorCode: string, messageType: 'title' | 'detail'): boolean {
    // Check if message exists
    return true;
  }
}
```

## Testing

### 1. Unit Testing

```typescript
import { AuthenticationFailedException } from '@hl8/exceptions';

describe('AuthenticationFailedException', () => {
  it('should create exception with correct properties', () => {
    const exception = new AuthenticationFailedException('密码错误');
    
    expect(exception.errorCode).toBe('AUTH_LOGIN_FAILED');
    expect(exception.httpStatus).toBe(401);
    expect(exception.title).toBe('认证失败');
  });

  it('should convert to RFC7807 format', () => {
    const exception = new AuthenticationFailedException('密码错误');
    const problemDetails = exception.toRFC7807();
    
    expect(problemDetails.type).toBe('https://docs.hl8.com/errors#AUTH_LOGIN_FAILED');
    expect(problemDetails.status).toBe(401);
  });
});
```

### 2. Integration Testing

```typescript
import { Test } from '@nestjs/testing';
import { ExceptionModule } from '@hl8/exceptions';

describe('Exception System Integration', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ExceptionModule.forRoot()],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('should handle exceptions with RFC7807 format', async () => {
    // Test exception handling in application context
  });
});
```

## Best Practices

### 1. Exception Selection

- Use specific exception types rather than generic ones
- Choose exceptions that match the business domain
- Consider the architectural layer when selecting exceptions

### 2. Context Data

- Include relevant context data for debugging
- Avoid exposing sensitive information
- Use consistent data structure across similar exceptions

### 3. Error Codes

- Follow the naming convention: `{DOMAIN}_{TYPE}`
- Use descriptive, business-meaningful names
- Maintain consistency within categories

### 4. Message Localization

- Provide messages in Chinese as default
- Support parameter substitution for dynamic content
- Use clear, user-friendly language

## Common Patterns

### 1. Exception Chaining

```typescript
try {
  // Business logic
  await userService.createUser(userData);
} catch (error) {
  if (error instanceof DatabaseConnectionError) {
    throw new GeneralInternalServerException(
      '用户创建失败',
      '创建用户时发生内部错误',
      { originalError: error.message },
      undefined,
      error // Preserve original error chain
    );
  }
  throw error;
}
```

### 2. Conditional Exceptions

```typescript
if (!user) {
  throw new UserNotFoundException(userId);
}

if (user.status === 'LOCKED') {
  throw new UserAccountLockedException('账户被管理员锁定');
}

if (user.status === 'DISABLED') {
  throw new UserAccountDisabledException('账户已被禁用');
}
```

### 3. Batch Validation

```typescript
const errors: ValidationError[] = [];

if (!email.includes('@')) {
  errors.push(new ValidationFailedException('email', '邮箱格式无效'));
}

if (password.length < 8) {
  errors.push(new ValidationFailedException('password', '密码长度至少8位'));
}

if (errors.length > 0) {
  throw new ValidationFailedException(
    'validation',
    '数据验证失败',
    { validationErrors: errors }
  );
}
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure you're importing from the correct category path
2. **Type Errors**: Check that exception classes extend AbstractHttpException
3. **RFC7807 Format**: Verify that toRFC7807() method is called correctly
4. **Message Provider**: Ensure custom message providers implement the interface correctly

### Debug Mode

Enable debug mode for detailed exception information:

```typescript
ExceptionModule.forRoot({
  enableLogging: true,
  isProduction: false, // Enable debug mode
});
```

## Next Steps

1. **Review Documentation**: Read the complete optimization plan and architecture diagrams
2. **Implement Core Exceptions**: Start with authentication and user management exceptions
3. **Add Tests**: Create comprehensive test coverage for all exception types
4. **Integrate**: Gradually integrate new exceptions into existing codebase
5. **Monitor**: Set up monitoring and alerting for exception patterns

## Support

For questions or issues:

1. Check the implementation checklist for detailed tasks
2. Review the architecture diagrams for system understanding
3. Consult the optimization plan for comprehensive guidance
4. Contact the development team for technical support

This quick start guide provides the foundation for implementing the enhanced exception handling system. Follow the patterns and best practices outlined here to ensure consistent, maintainable exception handling across the SAAS platform.
