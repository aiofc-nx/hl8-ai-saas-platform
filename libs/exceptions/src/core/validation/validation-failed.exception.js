import { ValidationException } from "./validation.exception.js";
export class ValidationFailedException extends ValidationException {
    constructor(field, reason, data) {
        super("VALIDATION_FAILED", "数据验证失败", `字段 "${field}" 验证失败: ${reason}`, 400, { field, reason, ...data }, "https://docs.hl8.com/errors#VALIDATION_FAILED");
    }
}
//# sourceMappingURL=validation-failed.exception.js.map