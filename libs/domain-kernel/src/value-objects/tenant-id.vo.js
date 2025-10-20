import { EntityId } from "./entity-id.vo.js";
import { randomUUID } from "node:crypto";
export class TenantId extends EntityId {
    static cache = new Map();
    constructor(value) {
        super(value, "TenantId");
    }
    static create(value) {
        let instance = this.cache.get(value);
        if (!instance) {
            instance = new TenantId(value);
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
//# sourceMappingURL=tenant-id.vo.js.map