import { EntityId } from "./entity-id.vo.js";
import { randomUUID } from "node:crypto";
export class OrganizationId extends EntityId {
    static cache = new Map();
    constructor(value) {
        super(value, "OrganizationId");
    }
    static create(value) {
        let instance = this.cache.get(value);
        if (!instance) {
            instance = new OrganizationId(value);
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
//# sourceMappingURL=organization-id.vo.js.map