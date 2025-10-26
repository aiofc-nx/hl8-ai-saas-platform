import { UserException } from "./user.exception.js";
export class UserAlreadyExistsException extends UserException {
  constructor(identifier, field, data) {
    super(
      "USER_ALREADY_EXISTS",
      "用户已存在",
      `用户 ${field} "${identifier}" 已存在`,
      409,
      { identifier, field, ...data },
      "https://docs.hl8.com/errors#USER_ALREADY_EXISTS",
    );
  }
}
//# sourceMappingURL=user-already-exists.exception.js.map
