import type { IsolationContext } from "../entities/isolation-context.entity.js";
export declare class IsolationContextCreatedEvent {
    readonly context: IsolationContext;
    readonly requestId: string;
    readonly occurredAt: Date;
    constructor(context: IsolationContext, requestId: string, occurredAt?: Date);
}
//# sourceMappingURL=context-created.event.d.ts.map