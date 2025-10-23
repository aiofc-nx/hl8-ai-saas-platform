import { ValidationException } from "./validation.exception.js";
export declare class BusinessRuleViolationException extends ValidationException {
    constructor(ruleName: string, violation: string, data?: Record<string, unknown>);
}
//# sourceMappingURL=business-rule-violation.exception.d.ts.map