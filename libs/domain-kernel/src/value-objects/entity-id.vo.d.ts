export declare abstract class EntityId<TType extends string = string> {
    private readonly value;
    private readonly typeName;
    protected constructor(value: string, typeName: string);
    private validate;
    getValue(): string;
    equals(other?: EntityId<TType>): boolean;
    toString(): string;
    getHashCode(): string;
    compareTo(other?: EntityId<TType>): number;
    isEmpty(): boolean;
}
//# sourceMappingURL=entity-id.vo.d.ts.map