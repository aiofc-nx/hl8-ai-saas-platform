import { DomainLayerException } from "../layers/domain/domain-layer.exception.js";
export class BusinessException extends DomainLayerException {
    constructor(errorCode, title, detail, status, data, type, rootCause) {
        super(errorCode, title, detail, status, data, type, rootCause);
    }
    getCategory() {
        return "business";
    }
}
//# sourceMappingURL=business.exception.js.map