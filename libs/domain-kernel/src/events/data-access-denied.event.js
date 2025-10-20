export class DataAccessDeniedEvent {
    userId;
    dataId;
    reason;
    occurredAt;
    constructor(userId, dataId, reason, occurredAt = new Date()) {
        this.userId = userId;
        this.dataId = dataId;
        this.reason = reason;
        this.occurredAt = occurredAt;
    }
}
//# sourceMappingURL=data-access-denied.event.js.map