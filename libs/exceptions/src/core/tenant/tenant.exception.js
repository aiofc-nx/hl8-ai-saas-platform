import { DomainLayerException } from "../layers/domain/domain-layer.exception.js";
export class TenantException extends DomainLayerException {
  constructor(errorCode, title, detail, status, data, type, rootCause) {
    super(errorCode, title, detail, status, data, type, rootCause);
  }
  getCategory() {
    return "tenant";
  }
}
//# sourceMappingURL=tenant.exception.js.map
