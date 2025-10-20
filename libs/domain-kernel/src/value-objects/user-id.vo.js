import { EntityId } from "./entity-id.vo.js";
import { randomUUID } from "node:crypto";
export class UserId extends EntityId {
    static cache = new Map();
    constructor(value) {
        super(value, "UserId");
    }
    static create(value) {
        let instance = this.cache.get(value);
        if (!instance) {
            instance = new UserId(value);
            this.cache.set(value, instance);
        }
        return instance;
    }
    static generate() {
        return this.create(randomUUID());
    }
    static clearCache() {
        this.cache.clear();
    }
    equals(other) {
        return super.equals(other);
    }
}
//# sourceMappingURL=user-id.vo.js.map