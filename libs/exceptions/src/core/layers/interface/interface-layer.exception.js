import { AbstractHttpException } from "../../abstract-http.exception.js";
export class InterfaceLayerException extends AbstractHttpException {
  constructor(errorCode, title, detail, status, data, type, rootCause) {
    super(errorCode, title, detail, status, data, type, rootCause);
  }
  getLayer() {
    return "interface";
  }
}
//# sourceMappingURL=interface-layer.exception.js.map
