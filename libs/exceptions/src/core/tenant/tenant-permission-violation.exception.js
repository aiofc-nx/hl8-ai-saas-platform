import { TenantException } from "./tenant.exception.js";
export class TenantPermissionViolationException extends TenantException {
    constructor(reason, data) {
        super("TENANT_PERMISSION_VIOLATION", "租户权限违规", reason, 403, data, "https://docs.hl8.com/errors#TENANT_PERMISSION_VIOLATION");
    }
    getPermissionViolationInfo() {
        return {
            permission: this.data?.permission,
            resource: this.data?.resource,
            tenantId: this.data?.tenantId,
            userId: this.data?.userId,
            timestamp: new Date().toISOString(),
        };
    }
}
//# sourceMappingURL=tenant-permission-violation.exception.js.map