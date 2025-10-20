import { IsolationValidationError } from "../errors/isolation-validation.error.js";
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export class EntityId {
    value;
    typeName;
    constructor(value, typeName) {
        this.value = value;
        this.typeName = typeName;
        this.validate();
    }
    validate() {
        if (!this.value || typeof this.value !== "string") {
            throw new IsolationValidationError(`${this.typeName} 必须是非空字符串`, `INVALID_${this.typeName.toUpperCase()}`, { value: this.value });
        }
        if (!UUID_V4_REGEX.test(this.value)) {
            throw new IsolationValidationError(`${this.typeName} 必须是有效的 UUID v4 格式`, `INVALID_${this.typeName.toUpperCase()}_FORMAT`, { value: this.value });
        }
    }
    getValue() {
        return this.value;
    }
    equals(other) {
        if (!other)
            return false;
        return this.value === other.value;
    }
    toString() {
        return this.value;
    }
    getHashCode() {
        return this.value;
    }
    compareTo(other) {
        if (!other)
            return 1;
        return this.value.localeCompare(other.value);
    }
    isEmpty() {
        return !this.value || this.value.trim().length === 0;
    }
}
//# sourceMappingURL=entity-id.vo.js.map