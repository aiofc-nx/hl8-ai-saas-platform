import { DomainLayerException } from "../layers/domain/domain-layer.exception.js";
export class ValidationException extends DomainLayerException {
  constructor(errorCode, title, detail, status, data, type, rootCause) {
    super(errorCode, title, detail, status, data, type, rootCause);
  }
  getCategory() {
    return "validation";
  }
}
//# sourceMappingURL=validation.exception.js.map
