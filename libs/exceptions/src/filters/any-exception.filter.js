var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Catch, HttpException, Injectable, Optional, } from "@nestjs/common";
let AnyExceptionFilter = class AnyExceptionFilter {
    logger;
    isProduction;
    constructor(logger, isProduction) {
        this.logger = logger;
        this.isProduction = isProduction;
        if (this.isProduction === undefined) {
            this.isProduction = process.env.NODE_ENV === "production";
        }
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = 500;
        const errorCode = "INTERNAL_SERVER_ERROR";
        let title = "服务器内部错误";
        let detail = "处理请求时发生未预期的错误";
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
                const resp = exceptionResponse;
                title = resp.error || resp.message || title;
                detail = Array.isArray(resp.message)
                    ? resp.message.join(", ")
                    : resp.message || detail;
            }
            else if (typeof exceptionResponse === "string") {
                detail = exceptionResponse;
            }
        }
        const problemDetails = {
            type: "https://docs.hl8.com/errors#INTERNAL_SERVER_ERROR",
            title,
            detail: this.isProduction ? detail : this.getDetailedError(exception),
            status,
            errorCode,
            instance: request.id || request.headers?.["x-request-id"],
        };
        this.logException(exception, problemDetails, request);
        response
            .code(status)
            .header("Content-Type", "application/problem+json; charset=utf-8")
            .send(problemDetails);
    }
    getDetailedError(exception) {
        if (exception instanceof Error) {
            return `${exception.message}\n\n堆栈追踪:\n${exception.stack}`;
        }
        if (typeof exception === "string") {
            return exception;
        }
        try {
            return JSON.stringify(exception, null, 2);
        }
        catch {
            return String(exception);
        }
    }
    logException(exception, problemDetails, request) {
        const logContext = {
            exception: problemDetails,
            request: {
                id: request.id || request.headers?.["x-request-id"],
                method: request.method,
                url: request.url,
                ip: request.ip,
                userAgent: request.headers?.["user-agent"],
            },
            exceptionType: exception instanceof Error
                ? exception.constructor.name
                : typeof exception,
            timestamp: new Date().toISOString(),
        };
        const errorMessage = exception instanceof Error ? exception.message : String(exception);
        const errorStack = exception instanceof Error ? exception.stack : undefined;
        if (this.logger) {
            this.logger.error(`Unhandled Exception: ${errorMessage}`, errorStack, logContext);
        }
    }
};
AnyExceptionFilter = __decorate([
    Injectable(),
    Catch(),
    __param(0, Optional()),
    __param(1, Optional()),
    __metadata("design:paramtypes", [Object, Boolean])
], AnyExceptionFilter);
export { AnyExceptionFilter };
//# sourceMappingURL=any-exception.filter.js.map