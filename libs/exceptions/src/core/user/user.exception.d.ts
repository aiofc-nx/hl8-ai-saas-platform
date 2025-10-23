import { InterfaceLayerException } from "../layers/interface/interface-layer.exception.js";
export declare abstract class UserException extends InterfaceLayerException {
    constructor(errorCode: string, title: string, detail: string, status: number, data?: Record<string, unknown>, type?: string, rootCause?: Error);
    getCategory(): string;
}
//# sourceMappingURL=user.exception.d.ts.map