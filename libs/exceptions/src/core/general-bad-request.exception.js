import { AbstractHttpException } from "./abstract-http.exception.js";
export class GeneralBadRequestException extends AbstractHttpException {
    constructor(title, detail, data) {
        super("BAD_REQUEST", title, detail, 400, data);
    }
}
//# sourceMappingURL=general-bad-request.exception.js.map