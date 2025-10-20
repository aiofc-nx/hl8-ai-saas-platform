import type { IsolationContext } from "../entities/isolation-context.entity.js";
import type { IsolationLevel } from "../enums/isolation-level.enum.js";
import type { SharingLevel } from "../enums/sharing-level.enum.js";
export interface IIsolationValidator {
    validateIsolationLevel(requiredLevel: IsolationLevel): boolean;
    checkDataAccess(dataContext: IsolationContext, isShared: boolean, sharingLevel?: SharingLevel): boolean;
}
//# sourceMappingURL=isolation-validator.interface.d.ts.map