import { UserException } from "./user.exception.js";
export class InvalidUserStatusException extends UserException {
  constructor(currentStatus, expectedStatus, data) {
    super(
      "USER_INVALID_STATUS",
      "用户状态无效",
      `用户状态 "${currentStatus}" 无效，期望状态为 "${expectedStatus}"`,
      400,
      { currentStatus, expectedStatus, ...data },
      "https://docs.hl8.com/errors#USER_INVALID_STATUS",
    );
  }
}
//# sourceMappingURL=invalid-user-status.exception.js.map
