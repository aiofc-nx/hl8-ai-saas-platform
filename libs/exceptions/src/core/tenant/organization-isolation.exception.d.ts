import { TenantException } from "./tenant.exception.js";
export declare class OrganizationIsolationException extends TenantException {
  constructor(reason: string, data?: Record<string, unknown>);
  getOrganizationIsolationInfo(): {
    organizationId?: string;
    resourceType?: string;
    violationType?: string;
    isolationLevel: string;
    timestamp: string;
  };
}
//# sourceMappingURL=organization-isolation.exception.d.ts.map
