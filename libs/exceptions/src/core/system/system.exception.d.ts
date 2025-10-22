import { InfrastructureLayerException } from "../layers/infrastructure/infrastructure-layer.exception.js";
export declare abstract class SystemException extends InfrastructureLayerException {
    constructor(errorCode: string, title: string, detail: string, status: number, data?: Record<string, unknown>, type?: string, rootCause?: Error);
    getCategory(): string;
}
//# sourceMappingURL=system.exception.d.ts.map