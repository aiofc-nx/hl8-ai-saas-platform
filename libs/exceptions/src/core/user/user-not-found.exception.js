import { UserException } from "./user.exception.js";
export class UserNotFoundException extends UserException {
    constructor(userId, data) {
        super("USER_NOT_FOUND", "用户未找到", `ID 为 "${userId}" 的用户不存在`, 404, { userId, ...data }, "https://docs.hl8.com/errors#USER_NOT_FOUND");
    }
}
//# sourceMappingURL=user-not-found.exception.js.map