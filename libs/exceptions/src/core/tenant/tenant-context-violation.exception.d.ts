import { TenantException } from "./tenant.exception.js";
export declare class TenantContextViolationException extends TenantException {
    constructor(reason: string, data?: Record<string, unknown>);
    getContextViolationInfo(): {
        contextType?: string;
        providedValue?: string;
        expectedFormat?: string;
        userId?: string;
        timestamp: string;
    };
}
//# sourceMappingURL=tenant-context-violation.exception.d.ts.map