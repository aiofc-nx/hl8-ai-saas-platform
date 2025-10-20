import { EntityId } from "./entity-id.vo.js";
export declare class OrganizationId extends EntityId<"OrganizationId"> {
    private static cache;
    private constructor();
    static create(value: string): OrganizationId;
    static generate(): OrganizationId;
    static clearCache(): void;
    equals(other?: OrganizationId): boolean;
}
//# sourceMappingURL=organization-id.vo.d.ts.map