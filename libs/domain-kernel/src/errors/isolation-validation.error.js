export class IsolationValidationError extends Error {
    code;
    context;
    constructor(message, code, context) {
        super(message);
        this.code = code;
        this.context = context;
        this.name = "IsolationValidationError";
        Object.setPrototypeOf(this, IsolationValidationError.prototype);
    }
}
//# sourceMappingURL=isolation-validation.error.js.map