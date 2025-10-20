import { EntityId } from "./entity-id.vo.js";
export declare class TenantId extends EntityId<"TenantId"> {
    private static cache;
    private constructor();
    static create(value: string): TenantId;
    static generate(): TenantId;
    static clearCache(): void;
    equals(other?: TenantId): boolean;
}
//# sourceMappingURL=tenant-id.vo.d.ts.map