import { DomainException } from "./domain-layer.exception.js";
export class DomainBusinessRuleViolationException extends DomainException {
  constructor(ruleCode, message, context) {
    super(
      "BUSINESS_RULE_VIOLATION",
      "业务规则违规",
      message,
      422,
      { ruleCode, ...context },
      "https://docs.hl8.com/errors#BUSINESS_RULE_VIOLATION",
    );
  }
  getBusinessRuleInfo() {
    return {
      ruleCode: this.data?.ruleCode || this.errorCode,
      ruleMessage: this.detail,
      violationContext: this.data || {},
      timestamp: new Date().toISOString(),
    };
  }
}
//# sourceMappingURL=business-rule-violation.exception.js.map
