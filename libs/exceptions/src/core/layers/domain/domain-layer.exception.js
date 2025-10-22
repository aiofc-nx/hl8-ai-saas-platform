import { AbstractHttpException } from "../../abstract-http.exception.js";
export class DomainLayerException extends AbstractHttpException {
    constructor(errorCode, title, detail, status, data, type, rootCause) {
        super(errorCode, title, detail, status, data, type, rootCause);
    }
    getLayer() {
        return "domain";
    }
}
//# sourceMappingURL=domain-layer.exception.js.map