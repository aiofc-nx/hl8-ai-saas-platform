import { TenantException } from "./tenant.exception.js";
export declare class TenantDataIsolationException extends TenantException {
  constructor(reason: string, data?: Record<string, unknown>);
  getIsolationInfo(): {
    isolationLevel: string;
    resourceType?: string;
    tenantId?: string;
    violationType?: string;
    timestamp: string;
  };
}
//# sourceMappingURL=tenant-data-isolation.exception.d.ts.map
