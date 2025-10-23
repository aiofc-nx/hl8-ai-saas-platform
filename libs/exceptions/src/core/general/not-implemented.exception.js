import { GeneralException } from "./general.exception.js";
export class NotImplementedException extends GeneralException {
    constructor(feature, data) {
        super("GENERAL_NOT_IMPLEMENTED", "功能未实现", `功能 "${feature}" 尚未实现`, 501, { feature, ...data }, "https://docs.hl8.com/errors#GENERAL_NOT_IMPLEMENTED");
    }
}
//# sourceMappingURL=not-implemented.exception.js.map