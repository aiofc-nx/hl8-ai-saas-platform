import { DomainException } from "./domain-layer.exception.js";
export class DomainTenantIsolationException extends DomainException {
  constructor(message, code, context) {
    super(
      code,
      "租户隔离违规",
      message,
      403,
      context,
      `https://docs.hl8.com/errors#${code}`,
    );
  }
  getTenantIsolationInfo() {
    return {
      isolationCode: this.errorCode,
      isolationMessage: this.detail,
      tenantContext: this.data || {},
      timestamp: new Date().toISOString(),
    };
  }
}
//# sourceMappingURL=tenant-isolation.exception.js.map
