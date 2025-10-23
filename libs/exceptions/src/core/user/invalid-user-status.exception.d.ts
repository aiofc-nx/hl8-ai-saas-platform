import { UserException } from "./user.exception.js";
export declare class InvalidUserStatusException extends UserException {
    constructor(currentStatus: string, expectedStatus: string, data?: Record<string, unknown>);
}
//# sourceMappingURL=invalid-user-status.exception.d.ts.map