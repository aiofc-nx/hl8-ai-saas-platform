import { HttpException } from "@nestjs/common";
export class AbstractHttpException extends HttpException {
    errorCode;
    title;
    detail;
    httpStatus;
    data;
    type;
    rootCause;
    constructor(errorCode, title, detail, status, data, type, rootCause) {
        super({ errorCode, title, detail, status, data }, status);
        this.name = this.constructor.name;
        this.errorCode = errorCode;
        this.title = title;
        this.detail = detail;
        this.httpStatus = status;
        this.data = data;
        this.type = type;
        this.rootCause = rootCause;
    }
    toRFC7807() {
        return {
            type: this.type || `https://docs.hl8.com/errors#${this.errorCode}`,
            title: this.title,
            detail: this.detail,
            status: this.httpStatus,
            errorCode: this.errorCode,
            data: this.data,
        };
    }
}
//# sourceMappingURL=abstract-http.exception.js.map