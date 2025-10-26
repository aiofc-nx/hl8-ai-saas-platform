import { UserException } from "./user.exception.js";
export class UserAccountDisabledException extends UserException {
  constructor(reason, data) {
    super(
      "USER_ACCOUNT_DISABLED",
      "账户已禁用",
      reason,
      403,
      data,
      "https://docs.hl8.com/errors#USER_ACCOUNT_DISABLED",
    );
  }
}
//# sourceMappingURL=user-account-disabled.exception.js.map
