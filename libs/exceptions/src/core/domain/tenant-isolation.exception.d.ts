import { DomainException } from "./domain-layer.exception.js";
export declare class DomainTenantIsolationException extends DomainException {
  constructor(message: string, code: string, context?: Record<string, unknown>);
  getTenantIsolationInfo(): {
    isolationCode: string;
    isolationMessage: string;
    tenantContext: Record<string, unknown>;
    timestamp: string;
  };
}
//# sourceMappingURL=tenant-isolation.exception.d.ts.map
