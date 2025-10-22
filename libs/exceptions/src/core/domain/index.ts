/**
 * 领域层异常导出
 * @description 导出所有领域层异常类
 *
 * @since 2.1.0
 */

// 领域层异常基类
export { DomainException } from "./domain-layer.exception.js";

// 具体领域层异常类
export { DomainBusinessRuleViolationException } from "./business-rule-violation.exception.js";
export { DomainValidationException } from "./validation.exception.js";
export { DomainTenantIsolationException } from "./tenant-isolation.exception.js";

// 导入异常类用于工厂
import { DomainBusinessRuleViolationException } from "./business-rule-violation.exception.js";
import { DomainValidationException } from "./validation.exception.js";
import { DomainTenantIsolationException } from "./tenant-isolation.exception.js";

// 领域层异常工厂
export class DomainExceptionFactory {
  /**
   * 创建业务规则违规异常
   */
  static createBusinessRuleViolation(
    ruleCode: string,
    message: string,
    context?: Record<string, unknown>,
  ): DomainBusinessRuleViolationException {
    return new DomainBusinessRuleViolationException(ruleCode, message, context);
  }

  /**
   * 创建验证异常
   */
  static createValidation(
    field: string,
    message: string,
    context?: Record<string, unknown>,
  ): DomainValidationException {
    return new DomainValidationException(field, message, context);
  }

  /**
   * 创建租户隔离异常
   */
  static createTenantIsolation(
    message: string,
    code: string,
    context?: Record<string, unknown>,
  ): DomainTenantIsolationException {
    return new DomainTenantIsolationException(message, code, context);
  }
}
