import { InfrastructureLayerException } from "../layers/infrastructure/infrastructure-layer.exception.js";
export class SystemException extends InfrastructureLayerException {
    constructor(errorCode, title, detail, status, data, type, rootCause) {
        super(errorCode, title, detail, status, data, type, rootCause);
    }
    getCategory() {
        return "system";
    }
}
//# sourceMappingURL=system.exception.js.map