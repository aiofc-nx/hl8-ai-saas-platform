import { AuthException } from "./auth.exception.js";
export class InvalidTokenException extends AuthException {
    constructor(reason, data) {
        super("AUTH_INVALID_TOKEN", "无效令牌", reason, 401, data, "https://docs.hl8.com/errors#AUTH_INVALID_TOKEN");
    }
}
//# sourceMappingURL=invalid-token.exception.js.map