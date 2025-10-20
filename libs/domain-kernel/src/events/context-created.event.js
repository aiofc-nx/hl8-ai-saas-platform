export class IsolationContextCreatedEvent {
    context;
    requestId;
    occurredAt;
    constructor(context, requestId, occurredAt = new Date()) {
        this.context = context;
        this.requestId = requestId;
        this.occurredAt = occurredAt;
    }
}
//# sourceMappingURL=context-created.event.js.map