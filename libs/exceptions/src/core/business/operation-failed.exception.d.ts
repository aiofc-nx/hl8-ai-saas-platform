import { BusinessException } from "./business.exception.js";
export declare class OperationFailedException extends BusinessException {
    constructor(operation: string, reason: string, data?: Record<string, unknown>);
}
//# sourceMappingURL=operation-failed.exception.d.ts.map