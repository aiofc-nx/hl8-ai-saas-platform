import { AbstractHttpException } from "../../abstract-http.exception.js";
export class ApplicationLayerException extends AbstractHttpException {
    constructor(errorCode, title, detail, status, data, type, rootCause) {
        super(errorCode, title, detail, status, data, type, rootCause);
    }
    getLayer() {
        return "application";
    }
}
//# sourceMappingURL=application-layer.exception.js.map