import type { IsolationContext } from "../entities/isolation-context.entity.js";
export interface IIsolationContextProvider {
    getIsolationContext(): IsolationContext | undefined;
    setIsolationContext(context: IsolationContext): void;
}
//# sourceMappingURL=isolation-context-provider.interface.d.ts.map