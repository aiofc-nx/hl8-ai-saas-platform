import { TenantException } from "./tenant.exception.js";
export class TenantContextViolationException extends TenantException {
  constructor(reason, data) {
    super(
      "TENANT_CONTEXT_VIOLATION",
      "租户上下文违规",
      reason,
      400,
      data,
      "https://docs.hl8.com/errors#TENANT_CONTEXT_VIOLATION",
    );
  }
  getContextViolationInfo() {
    return {
      contextType: this.data?.contextType,
      providedValue: this.data?.providedValue,
      expectedFormat: this.data?.expectedFormat,
      userId: this.data?.userId,
      timestamp: new Date().toISOString(),
    };
  }
}
//# sourceMappingURL=tenant-context-violation.exception.js.map
