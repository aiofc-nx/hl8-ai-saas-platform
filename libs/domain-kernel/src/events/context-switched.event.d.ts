import type { IsolationContext } from "../entities/isolation-context.entity.js";
export declare class IsolationContextSwitchedEvent {
    readonly from: IsolationContext;
    readonly to: IsolationContext;
    readonly reason: string;
    readonly occurredAt: Date;
    constructor(from: IsolationContext, to: IsolationContext, reason: string, occurredAt?: Date);
}
//# sourceMappingURL=context-switched.event.d.ts.map