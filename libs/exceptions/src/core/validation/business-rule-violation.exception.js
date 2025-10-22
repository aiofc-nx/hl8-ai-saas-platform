import { ValidationException } from "./validation.exception.js";
export class BusinessRuleViolationException extends ValidationException {
    constructor(ruleName, violation, data) {
        super("BUSINESS_RULE_VIOLATION", "业务规则违规", `业务规则 "${ruleName}" 被违反: ${violation}`, 422, { ruleName, violation, ...data }, "https://docs.hl8.com/errors#BUSINESS_RULE_VIOLATION");
    }
}
//# sourceMappingURL=business-rule-violation.exception.js.map