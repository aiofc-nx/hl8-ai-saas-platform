export { DomainException } from "./domain-layer.exception.js";
export { DomainBusinessRuleViolationException } from "./business-rule-violation.exception.js";
export { DomainValidationException } from "./validation.exception.js";
export { DomainTenantIsolationException } from "./tenant-isolation.exception.js";
import { DomainBusinessRuleViolationException } from "./business-rule-violation.exception.js";
import { DomainValidationException } from "./validation.exception.js";
import { DomainTenantIsolationException } from "./tenant-isolation.exception.js";
export declare class DomainExceptionFactory {
  static createBusinessRuleViolation(
    ruleCode: string,
    message: string,
    context?: Record<string, unknown>,
  ): DomainBusinessRuleViolationException;
  static createValidation(
    field: string,
    message: string,
    context?: Record<string, unknown>,
  ): DomainValidationException;
  static createTenantIsolation(
    message: string,
    code: string,
    context?: Record<string, unknown>,
  ): DomainTenantIsolationException;
}
//# sourceMappingURL=index.d.ts.map
