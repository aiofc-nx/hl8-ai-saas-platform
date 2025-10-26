import { InterfaceLayerException } from "../layers/interface/interface-layer.exception.js";
export class GeneralException extends InterfaceLayerException {
  constructor(errorCode, title, detail, status, data, type, rootCause) {
    super(errorCode, title, detail, status, data, type, rootCause);
  }
  getCategory() {
    return "general";
  }
}
//# sourceMappingURL=general.exception.js.map
