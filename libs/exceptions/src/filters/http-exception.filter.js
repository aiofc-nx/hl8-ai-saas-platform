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
import { Catch, Injectable, Optional, } from "@nestjs/common";
import { AbstractHttpException, } from "../core/abstract-http.exception.js";
let HttpExceptionFilter = class HttpExceptionFilter {
    logger;
    messageProvider;
    constructor(logger, messageProvider) {
        this.logger = logger;
        this.messageProvider = messageProvider;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let problemDetails = exception.toRFC7807();
        if (this.messageProvider) {
            const customTitle = this.messageProvider.getMessage(exception.errorCode, "title", exception.data);
            const customDetail = this.messageProvider.getMessage(exception.errorCode, "detail", exception.data);
            problemDetails = {
                ...problemDetails,
                title: customTitle || problemDetails.title,
                detail: customDetail || problemDetails.detail,
            };
        }
        problemDetails.instance = request.id || request.headers?.["x-request-id"];
        this.logException(exception, problemDetails, request);
        response
            .code(problemDetails.status)
            .header("Content-Type", "application/problem+json; charset=utf-8")
            .send(problemDetails);
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
            rootCause: exception.rootCause?.message,
        };
        if (this.logger) {
            if (problemDetails.status >= 500) {
                this.logger.error(`HTTP ${problemDetails.status}: ${problemDetails.title}`, exception.stack, logContext);
            }
            else {
                this.logger.warn(`HTTP ${problemDetails.status}: ${problemDetails.title}`, logContext);
            }
        }
    }
};
HttpExceptionFilter = __decorate([
    Injectable(),
    Catch(AbstractHttpException),
    __param(0, Optional()),
    __param(1, Optional()),
    __metadata("design:paramtypes", [Object, Object])
], HttpExceptionFilter);
export { HttpExceptionFilter };
//# sourceMappingURL=http-exception.filter.js.map