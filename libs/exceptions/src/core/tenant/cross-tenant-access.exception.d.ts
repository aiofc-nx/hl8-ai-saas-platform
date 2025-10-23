import { TenantException } from "./tenant.exception.js";
export declare class CrossTenantAccessException extends TenantException {
    constructor(currentTenantId: string, targetTenantId: string, data?: Record<string, unknown>);
}
//# sourceMappingURL=cross-tenant-access.exception.d.ts.map