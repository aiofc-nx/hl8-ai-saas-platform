import { AuthException } from "./auth.exception.js";
export class AuthenticationFailedException extends AuthException {
    constructor(reason, data) {
        super("AUTH_LOGIN_FAILED", "认证失败", reason, 401, data, "https://docs.hl8.com/errors#AUTH_LOGIN_FAILED");
    }
}
//# sourceMappingURL=authentication-failed.exception.js.map