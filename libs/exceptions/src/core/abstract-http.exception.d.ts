import { HttpException } from "@nestjs/common";
export interface ProblemDetails {
    type: string;
    title: string;
    detail: string;
    status: number;
    instance?: string;
    errorCode: string;
    data?: Record<string, unknown>;
}
export declare abstract class AbstractHttpException extends HttpException {
    readonly errorCode: string;
    readonly title: string;
    readonly detail: string;
    readonly httpStatus: number;
    readonly data?: Record<string, unknown>;
    readonly type?: string;
    readonly rootCause?: Error;
    constructor(errorCode: string, title: string, detail: string, status: number, data?: Record<string, unknown>, type?: string, rootCause?: Error);
    toRFC7807(): ProblemDetails;
}
//# sourceMappingURL=abstract-http.exception.d.ts.map