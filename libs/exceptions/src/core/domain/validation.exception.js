import { DomainException } from "./domain-layer.exception.js";
export class DomainValidationException extends DomainException {
  constructor(field, message, context) {
    super(
      `VALIDATION_FAILED_${field.toUpperCase()}`,
      "数据验证失败",
      message,
      400,
      { field, ...context },
      `https://docs.hl8.com/errors#VALIDATION_FAILED_${field.toUpperCase()}`,
    );
  }
  getField() {
    return this.data?.field || "unknown";
  }
  getValidationInfo() {
    return {
      field: this.getField(),
      message: this.detail,
      validationContext: this.data || {},
      timestamp: new Date().toISOString(),
    };
  }
}
//# sourceMappingURL=validation.exception.js.map
