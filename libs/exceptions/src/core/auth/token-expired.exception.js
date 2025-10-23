import { AuthException } from "./auth.exception.js";
export class TokenExpiredException extends AuthException {
    constructor(reason, data) {
        super("AUTH_TOKEN_EXPIRED", "令牌已过期", reason, 401, data, "https://docs.hl8.com/errors#AUTH_TOKEN_EXPIRED");
    }
}
//# sourceMappingURL=token-expired.exception.js.map