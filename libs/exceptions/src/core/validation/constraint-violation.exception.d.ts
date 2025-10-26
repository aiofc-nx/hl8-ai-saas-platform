import { ValidationException } from "./validation.exception.js";
export declare class ConstraintViolationException extends ValidationException {
  constructor(
    constraintType: string,
    violation: string,
    data?: Record<string, unknown>,
  );
}
//# sourceMappingURL=constraint-violation.exception.d.ts.map
