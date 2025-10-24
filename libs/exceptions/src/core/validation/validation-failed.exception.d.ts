import { ValidationException } from "./validation.exception.js";
export declare class ValidationFailedException extends ValidationException {
  constructor(field: string, reason: string, data?: Record<string, unknown>);
}
//# sourceMappingURL=validation-failed.exception.d.ts.map
