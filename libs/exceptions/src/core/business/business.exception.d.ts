import { DomainLayerException } from "../layers/domain/domain-layer.exception.js";
export declare abstract class BusinessException extends DomainLayerException {
    constructor(errorCode: string, title: string, detail: string, status: number, data?: Record<string, unknown>, type?: string, rootCause?: Error);
    getCategory(): string;
}
//# sourceMappingURL=business.exception.d.ts.map