import { InfrastructureLayerException } from "../layers/infrastructure/infrastructure-layer.exception.js";
export class IntegrationException extends InfrastructureLayerException {
    constructor(errorCode, title, detail, status, data, type, rootCause) {
        super(errorCode, title, detail, status, data, type, rootCause);
    }
    getCategory() {
        return "integration";
    }
}
//# sourceMappingURL=integration.exception.js.map