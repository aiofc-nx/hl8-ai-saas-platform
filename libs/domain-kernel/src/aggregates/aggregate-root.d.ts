import { EntityId } from "../value-objects/entity-id.vo.js";
export interface DomainEvent {
    readonly eventId: EntityId;
    readonly occurredAt: Date;
    readonly aggregateId: EntityId;
    readonly version: number;
}
export declare abstract class AggregateRoot<TId extends EntityId = EntityId> {
    readonly id: TId;
    private _version;
    private _pendingEvents;
    constructor(id: TId, version?: number);
    get version(): number;
    get pendingEvents(): readonly DomainEvent[];
    protected apply(event: DomainEvent): void;
    pullEvents(): DomainEvent[];
    protected incrementVersion(): void;
}
//# sourceMappingURL=aggregate-root.d.ts.map