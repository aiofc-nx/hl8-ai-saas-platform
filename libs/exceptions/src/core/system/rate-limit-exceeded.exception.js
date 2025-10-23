import { SystemException } from "./system.exception.js";
export class RateLimitExceededException extends SystemException {
    constructor(reason, data) {
        super("SYSTEM_RATE_LIMIT_EXCEEDED", "速率限制超出", reason, 429, data, "https://docs.hl8.com/errors#SYSTEM_RATE_LIMIT_EXCEEDED");
    }
}
//# sourceMappingURL=rate-limit-exceeded.exception.js.map