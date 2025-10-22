import { DomainException } from "./domain-layer.exception.js";
export declare class DomainValidationException extends DomainException {
    constructor(field: string, message: string, context?: Record<string, unknown>);
    getField(): string;
    getValidationInfo(): {
        field: string;
        message: string;
        validationContext: Record<string, unknown>;
        timestamp: string;
    };
}
//# sourceMappingURL=validation.exception.d.ts.map