export class IsolationContextSwitchedEvent {
    from;
    to;
    reason;
    occurredAt;
    constructor(from, to, reason, occurredAt = new Date()) {
        this.from = from;
        this.to = to;
        this.reason = reason;
        this.occurredAt = occurredAt;
    }
}
//# sourceMappingURL=context-switched.event.js.map