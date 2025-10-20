export class AggregateRoot {
    id;
    _version = 0;
    _pendingEvents = [];
    constructor(id, version = 0) {
        this.id = id;
        this._version = version;
    }
    get version() {
        return this._version;
    }
    get pendingEvents() {
        return [...this._pendingEvents];
    }
    apply(event) {
        this._pendingEvents.push(event);
        this._version++;
    }
    pullEvents() {
        const events = [...this._pendingEvents];
        this._pendingEvents = [];
        return events;
    }
    incrementVersion() {
        this._version++;
    }
}
//# sourceMappingURL=aggregate-root.js.map