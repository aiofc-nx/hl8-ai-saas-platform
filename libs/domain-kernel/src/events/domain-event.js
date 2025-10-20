export class DomainEvent {
    eventId;
    occurredAt;
    aggregateId;
    version;
    constructor(eventId, occurredAt, aggregateId, version) {
        this.eventId = eventId;
        this.occurredAt = occurredAt;
        this.aggregateId = aggregateId;
        this.version = version;
    }
}
//# sourceMappingURL=domain-event.js.map