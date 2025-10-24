export { DomainException } from "./domain-layer.exception.js";
export { DomainBusinessRuleViolationException } from "./business-rule-violation.exception.js";
export { DomainValidationException } from "./validation.exception.js";
export { DomainTenantIsolationException } from "./tenant-isolation.exception.js";
import { DomainBusinessRuleViolationException } from "./business-rule-violation.exception.js";
import { DomainValidationException } from "./validation.exception.js";
import { DomainTenantIsolationException } from "./tenant-isolation.exception.js";
export class DomainExceptionFactory {
  static createBusinessRuleViolation(ruleCode, message, context) {
    return new DomainBusinessRuleViolationException(ruleCode, message, context);
  }
  static createValidation(field, message, context) {
    return new DomainValidationException(field, message, context);
  }
  static createTenantIsolation(message, code, context) {
    return new DomainTenantIsolationException(message, code, context);
  }
}
//# sourceMappingURL=index.js.map
