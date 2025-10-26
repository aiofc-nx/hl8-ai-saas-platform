import { TenantException } from "./tenant.exception.js";
export class OrganizationIsolationException extends TenantException {
  constructor(reason, data) {
    super(
      "ORGANIZATION_ISOLATION_VIOLATION",
      "组织隔离违规",
      reason,
      403,
      data,
      "https://docs.hl8.com/errors#ORGANIZATION_ISOLATION_VIOLATION",
    );
  }
  getOrganizationIsolationInfo() {
    return {
      organizationId: this.data?.organizationId,
      resourceType: this.data?.resourceType,
      violationType: this.data?.violationType,
      isolationLevel: "organization",
      timestamp: new Date().toISOString(),
    };
  }
}
//# sourceMappingURL=organization-isolation.exception.js.map
