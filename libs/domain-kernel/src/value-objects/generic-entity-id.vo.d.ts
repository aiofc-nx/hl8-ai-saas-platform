import { EntityId } from "./entity-id.vo.js";
export declare class GenericEntityId extends EntityId<"GenericEntityId"> {
    private static cache;
    private constructor();
    static create(value: string): GenericEntityId;
    static generate(): GenericEntityId;
    static clearCache(): void;
    equals(other?: GenericEntityId): boolean;
}
//# sourceMappingURL=generic-entity-id.vo.d.ts.map