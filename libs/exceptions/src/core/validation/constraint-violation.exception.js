import { ValidationException } from "./validation.exception.js";
export class ConstraintViolationException extends ValidationException {
  constructor(constraintType, violation, data) {
    super(
      "CONSTRAINT_VIOLATION",
      "约束违规",
      `${constraintType} 约束被违反: ${violation}`,
      422,
      { constraintType, violation, ...data },
      "https://docs.hl8.com/errors#CONSTRAINT_VIOLATION",
    );
  }
}
//# sourceMappingURL=constraint-violation.exception.js.map
