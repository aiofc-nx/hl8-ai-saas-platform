import { UserException } from "./user.exception.js";
export class UserAccountLockedException extends UserException {
    constructor(reason, data) {
        super("USER_ACCOUNT_LOCKED", "账户被锁定", reason, 423, data, "https://docs.hl8.com/errors#USER_ACCOUNT_LOCKED");
    }
}
//# sourceMappingURL=user-account-locked.exception.js.map