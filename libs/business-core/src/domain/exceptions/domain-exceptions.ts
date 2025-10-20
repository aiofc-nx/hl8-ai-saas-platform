/**
 * 简化的异常体系
 *
 * @description 6层异常体系：业务规则、验证、状态、权限、并发、未找到
 * @since 2.0.0
 */

import {
  BaseDomainException,
  DomainExceptionType,
  DomainExceptionSeverity,
} from "./base/base-domain-exception.js";

/**
 * 业务规则异常
 *
 * @description 当业务规则被违反时抛出
 */
export class BusinessRuleException extends BaseDomainException {
  constructor(
    message: string,
    ruleName: string,
    context: Record<string, unknown> = {},
  ) {
    super(
      message,
      "BUSINESS_RULE_VIOLATION",
      DomainExceptionType.BUSINESS_RULE,
      { ruleName, ...context },
      DomainExceptionSeverity.HIGH,
    );
  }

  override getUserFriendlyMessage(): string {
    return `业务规则违反：${this.message}`;
  }

  get ruleName(): string {
    return this.context.ruleName as string;
  }
}

/**
 * 验证异常
 *
 * @description 当数据验证失败时抛出
 */
export class ValidationException extends BaseDomainException {
  constructor(
    message: string,
    fieldName: string,
    fieldValue: unknown,
    context: Record<string, unknown> = {},
  ) {
    super(
      message,
      "VALIDATION_FAILED",
      DomainExceptionType.VALIDATION,
      { fieldName, fieldValue, ...context },
      DomainExceptionSeverity.MEDIUM,
    );
  }

  override getUserFriendlyMessage(): string {
    return `数据验证失败：${this.message}`;
  }

  get fieldName(): string {
    return this.context.fieldName as string;
  }

  get fieldValue(): unknown {
    return this.context.fieldValue;
  }
}

/**
 * 状态异常
 *
 * @description 当状态转换无效时抛出
 */
export class StateException extends BaseDomainException {
  constructor(
    message: string,
    currentState: string,
    requestedOperation: string,
    context: Record<string, unknown> = {},
  ) {
    super(
      message,
      "INVALID_STATE",
      DomainExceptionType.STATE,
      { currentState, requestedOperation, ...context },
      DomainExceptionSeverity.HIGH,
    );
  }

  override getUserFriendlyMessage(): string {
    return `状态错误：${this.message}`;
  }

  get currentState(): string {
    return this.context.currentState as string;
  }

  get requestedOperation(): string {
    return this.context.requestedOperation as string;
  }
}

/**
 * 权限异常
 *
 * @description 当权限不足时抛出
 */
export class PermissionException extends BaseDomainException {
  constructor(
    message: string,
    requiredPermission: string,
    resource: string,
    context: Record<string, unknown> = {},
  ) {
    super(
      message,
      "PERMISSION_DENIED",
      DomainExceptionType.PERMISSION,
      { requiredPermission, resource, ...context },
      DomainExceptionSeverity.HIGH,
    );
  }

  override getUserFriendlyMessage(): string {
    return `权限不足：${this.message}`;
  }

  get requiredPermission(): string {
    return this.context.requiredPermission as string;
  }

  get resource(): string {
    return this.context.resource as string;
  }
}

/**
 * 并发异常
 *
 * @description 当发生并发冲突时抛出
 */
export class ConcurrencyException extends BaseDomainException {
  constructor(
    message: string,
    resourceId: string,
    expectedVersion: number,
    actualVersion: number,
    context: Record<string, unknown> = {},
  ) {
    super(
      message,
      "CONCURRENCY_CONFLICT",
      DomainExceptionType.CONCURRENCY,
      { resourceId, expectedVersion, actualVersion, ...context },
      DomainExceptionSeverity.HIGH,
    );
  }

  override getUserFriendlyMessage(): string {
    return `并发冲突：${this.message}`;
  }

  get resourceId(): string {
    return this.context.resourceId as string;
  }

  get expectedVersion(): number {
    return this.context.expectedVersion as number;
  }

  get actualVersion(): number {
    return this.context.actualVersion as number;
  }
}

/**
 * 未找到异常
 *
 * @description 当请求的资源不存在时抛出
 */
export class NotFoundException extends BaseDomainException {
  constructor(
    message: string,
    resourceType: string,
    resourceId: string,
    context: Record<string, unknown> = {},
  ) {
    super(
      message,
      "RESOURCE_NOT_FOUND",
      DomainExceptionType.NOT_FOUND,
      { resourceType, resourceId, ...context },
      DomainExceptionSeverity.MEDIUM,
    );
  }

  override getUserFriendlyMessage(): string {
    return `资源未找到：${this.message}`;
  }

  get resourceType(): string {
    return this.context.resourceType as string;
  }

  get resourceId(): string {
    return this.context.resourceId as string;
  }
}
