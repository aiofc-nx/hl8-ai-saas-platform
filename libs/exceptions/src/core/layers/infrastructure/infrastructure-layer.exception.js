import { AbstractHttpException } from "../../abstract-http.exception.js";
export class InfrastructureLayerException extends AbstractHttpException {
  constructor(errorCode, title, detail, status, data, type, rootCause) {
    super(errorCode, title, detail, status, data, type, rootCause);
  }
  getLayer() {
    return "infrastructure";
  }
}
//# sourceMappingURL=infrastructure-layer.exception.js.map
