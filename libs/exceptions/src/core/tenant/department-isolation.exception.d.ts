import { TenantException } from "./tenant.exception.js";
export declare class DepartmentIsolationException extends TenantException {
    constructor(reason: string, data?: Record<string, unknown>);
    getDepartmentIsolationInfo(): {
        departmentId?: string;
        organizationId?: string;
        resourceType?: string;
        violationType?: string;
        isolationLevel: string;
        timestamp: string;
    };
}
//# sourceMappingURL=department-isolation.exception.d.ts.map