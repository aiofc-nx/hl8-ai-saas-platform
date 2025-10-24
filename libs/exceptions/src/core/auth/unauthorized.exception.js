import { AuthException } from "./auth.exception.js";
export class UnauthorizedException extends AuthException {
  constructor(reason, data) {
    super(
      "AUTH_UNAUTHORIZED",
      "未授权访问",
      reason,
      403,
      data,
      "https://docs.hl8.com/errors#AUTH_UNAUTHORIZED",
    );
  }
}
//# sourceMappingURL=unauthorized.exception.js.map
