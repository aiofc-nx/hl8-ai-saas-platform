import { AbstractHttpException } from "./abstract-http.exception.js";
export class GeneralNotFoundException extends AbstractHttpException {
    constructor(title, detail, data) {
        super("NOT_FOUND", title, detail, 404, data);
    }
}
//# sourceMappingURL=general-not-found.exception.js.map