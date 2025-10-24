import { TenantException } from "./tenant.exception.js";
export class TenantDataIsolationException extends TenantException {
  constructor(reason, data) {
    super(
      "TENANT_DATA_ISOLATION_FAILED",
      "租户数据隔离失败",
      reason,
      403,
      data,
      "https://docs.hl8.com/errors#TENANT_DATA_ISOLATION_FAILED",
    );
  }
  getIsolationInfo() {
    return {
      isolationLevel: this.data?.isolationLevel || "tenant",
      resourceType: this.data?.resourceType,
      tenantId: this.data?.tenantId,
      violationType: this.data?.violationType,
      timestamp: new Date().toISOString(),
    };
  }
}
//# sourceMappingURL=tenant-data-isolation.exception.js.map
