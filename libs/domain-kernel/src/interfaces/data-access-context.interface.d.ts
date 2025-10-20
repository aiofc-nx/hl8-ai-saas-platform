import type { IsolationContext } from "../entities/isolation-context.entity.js";
import type { SharingLevel } from "../enums/sharing-level.enum.js";
export interface DataAccessContext {
    isolationContext: IsolationContext;
    isShared: boolean;
    sharingLevel?: SharingLevel;
    sharedWith?: string[];
}
//# sourceMappingURL=data-access-context.interface.d.ts.map