import { DomainLayerException } from "../layers/domain/domain-layer.exception.js";
export declare abstract class ValidationException extends DomainLayerException {
    constructor(errorCode: string, title: string, detail: string, status: number, data?: Record<string, unknown>, type?: string, rootCause?: Error);
    getCategory(): string;
}
//# sourceMappingURL=validation.exception.d.ts.map