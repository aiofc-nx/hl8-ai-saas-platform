import { TenantException } from "./tenant.exception.js";
export class DataIsolationViolationException extends TenantException {
    constructor(reason, data) {
        super("TENANT_DATA_ISOLATION_VIOLATION", "数据隔离违规", reason, 403, data, "https://docs.hl8.com/errors#TENANT_DATA_ISOLATION_VIOLATION");
    }
}
//# sourceMappingURL=data-isolation-violation.exception.js.map