import { InterfaceLayerException } from "../layers/interface/interface-layer.exception.js";
export class AuthException extends InterfaceLayerException {
  constructor(errorCode, title, detail, status, data, type, rootCause) {
    super(errorCode, title, detail, status, data, type, rootCause);
  }
  getCategory() {
    return "auth";
  }
}
//# sourceMappingURL=auth.exception.js.map
