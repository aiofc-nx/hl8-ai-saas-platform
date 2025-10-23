import { InterfaceLayerException } from "../layers/interface/interface-layer.exception.js";
export declare abstract class AuthException extends InterfaceLayerException {
    constructor(errorCode: string, title: string, detail: string, status: number, data?: Record<string, unknown>, type?: string, rootCause?: Error);
    getCategory(): string;
}
//# sourceMappingURL=auth.exception.d.ts.map