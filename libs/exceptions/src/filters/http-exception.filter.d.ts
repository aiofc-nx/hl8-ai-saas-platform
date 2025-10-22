import { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import { AbstractHttpException } from "../core/abstract-http.exception.js";
export interface ILoggerService {
    log(message: string, context?: Record<string, unknown>): void;
    error(message: string, stack?: string, context?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>): void;
}
export interface IExceptionMessageProvider {
    getMessage(errorCode: string, messageType: "title" | "detail", params?: Record<string, unknown>): string | undefined;
    hasMessage(errorCode: string, messageType: "title" | "detail"): boolean;
}
export declare class HttpExceptionFilter implements ExceptionFilter<AbstractHttpException> {
    private readonly logger?;
    private readonly messageProvider?;
    constructor(logger?: ILoggerService, messageProvider?: IExceptionMessageProvider);
    catch(exception: AbstractHttpException, host: ArgumentsHost): void;
    private logException;
}
//# sourceMappingURL=http-exception.filter.d.ts.map