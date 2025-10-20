import { EntityId } from "../value-objects/entity-id.vo.js";
export declare abstract class DomainEvent {
    readonly eventId: EntityId;
    readonly occurredAt: Date;
    readonly aggregateId: EntityId;
    readonly version: number;
    constructor(eventId: EntityId, occurredAt: Date, aggregateId: EntityId, version: number);
}
//# sourceMappingURL=domain-event.d.ts.map