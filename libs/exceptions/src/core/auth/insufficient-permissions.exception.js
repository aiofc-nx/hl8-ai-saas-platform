import { AuthException } from "./auth.exception.js";
export class InsufficientPermissionsException extends AuthException {
  constructor(reason, data) {
    super(
      "AUTH_INSUFFICIENT_PERMISSIONS",
      "权限不足",
      reason,
      403,
      data,
      "https://docs.hl8.com/errors#AUTH_INSUFFICIENT_PERMISSIONS",
    );
  }
}
//# sourceMappingURL=insufficient-permissions.exception.js.map
