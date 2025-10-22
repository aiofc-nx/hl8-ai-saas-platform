import { AbstractHttpException } from "../../abstract-http.exception.js";
export declare abstract class ApplicationLayerException extends AbstractHttpException {
    constructor(errorCode: string, title: string, detail: string, status: number, data?: Record<string, unknown>, type?: string, rootCause?: Error);
    getLayer(): string;
}
//# sourceMappingURL=application-layer.exception.d.ts.map