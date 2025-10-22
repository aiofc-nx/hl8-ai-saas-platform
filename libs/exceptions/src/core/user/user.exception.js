import { InterfaceLayerException } from "../layers/interface/interface-layer.exception.js";
export class UserException extends InterfaceLayerException {
    constructor(errorCode, title, detail, status, data, type, rootCause) {
        super(errorCode, title, detail, status, data, type, rootCause);
    }
    getCategory() {
        return "user";
    }
}
//# sourceMappingURL=user.exception.js.map