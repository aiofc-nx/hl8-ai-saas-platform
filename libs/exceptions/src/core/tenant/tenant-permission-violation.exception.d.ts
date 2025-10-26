import { TenantException } from "./tenant.exception.js";
export declare class TenantPermissionViolationException extends TenantException {
  constructor(reason: string, data?: Record<string, unknown>);
  getPermissionViolationInfo(): {
    permission?: string;
    resource?: string;
    tenantId?: string;
    userId?: string;
    timestamp: string;
  };
}
//# sourceMappingURL=tenant-permission-violation.exception.d.ts.map
