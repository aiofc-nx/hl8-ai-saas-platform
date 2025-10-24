import { TenantException } from "./tenant.exception.js";
export class InvalidTenantContextException extends TenantException {
  constructor(reason, data) {
    super(
      "TENANT_INVALID_CONTEXT",
      "无效的租户上下文",
      reason,
      400,
      data,
      "https://docs.hl8.com/errors#TENANT_INVALID_CONTEXT",
    );
  }
}
//# sourceMappingURL=invalid-tenant-context.exception.js.map
