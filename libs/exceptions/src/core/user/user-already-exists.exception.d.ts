import { UserException } from "./user.exception.js";
export declare class UserAlreadyExistsException extends UserException {
  constructor(
    identifier: string,
    field: string,
    data?: Record<string, unknown>,
  );
}
//# sourceMappingURL=user-already-exists.exception.d.ts.map
