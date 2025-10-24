import { ApplicationLayerException } from "../layers/application/application-layer.exception.js";
export class OrganizationException extends ApplicationLayerException {
  constructor(errorCode, title, detail, status, data, type, rootCause) {
    super(errorCode, title, detail, status, data, type, rootCause);
  }
  getCategory() {
    return "organization";
  }
}
//# sourceMappingURL=organization.exception.js.map
