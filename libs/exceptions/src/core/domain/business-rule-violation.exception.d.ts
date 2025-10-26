import { DomainException } from "./domain-layer.exception.js";
export declare class DomainBusinessRuleViolationException extends DomainException {
  constructor(
    ruleCode: string,
    message: string,
    context?: Record<string, unknown>,
  );
  getBusinessRuleInfo(): {
    ruleCode: string;
    ruleMessage: string;
    violationContext: Record<string, unknown>;
    timestamp: string;
  };
}
//# sourceMappingURL=business-rule-violation.exception.d.ts.map
