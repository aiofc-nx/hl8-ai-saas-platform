import { BusinessException } from "./business.exception.js";
export class InvalidStateTransitionException extends BusinessException {
    constructor(entity, currentState, targetState, data) {
        super("BUSINESS_INVALID_STATE_TRANSITION", "无效状态转换", `实体 "${entity}" 无法从状态 "${currentState}" 转换到 "${targetState}"`, 422, { entity, currentState, targetState, ...data }, "https://docs.hl8.com/errors#BUSINESS_INVALID_STATE_TRANSITION");
    }
}
//# sourceMappingURL=invalid-state-transition.exception.js.map