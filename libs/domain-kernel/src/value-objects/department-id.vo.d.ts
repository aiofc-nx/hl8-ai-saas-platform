import { EntityId } from "./entity-id.vo.js";
export declare class DepartmentId extends EntityId<"DepartmentId"> {
    private static cache;
    private constructor();
    static create(value: string): DepartmentId;
    static generate(): DepartmentId;
    static clearCache(): void;
    equals(other?: DepartmentId): boolean;
}
//# sourceMappingURL=department-id.vo.d.ts.map