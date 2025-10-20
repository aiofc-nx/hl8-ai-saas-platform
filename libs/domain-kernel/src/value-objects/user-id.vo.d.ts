import { EntityId } from "./entity-id.vo.js";
export declare class UserId extends EntityId<"UserId"> {
    private static cache;
    private constructor();
    static create(value: string): UserId;
    static generate(): UserId;
    static clearCache(): void;
    equals(other?: UserId): boolean;
}
//# sourceMappingURL=user-id.vo.d.ts.map