import { TenantException } from "./tenant.exception.js";
export class DepartmentIsolationException extends TenantException {
  constructor(reason, data) {
    super(
      "DEPARTMENT_ISOLATION_VIOLATION",
      "部门隔离违规",
      reason,
      403,
      data,
      "https://docs.hl8.com/errors#DEPARTMENT_ISOLATION_VIOLATION",
    );
  }
  getDepartmentIsolationInfo() {
    return {
      departmentId: this.data?.departmentId,
      organizationId: this.data?.organizationId,
      resourceType: this.data?.resourceType,
      violationType: this.data?.violationType,
      isolationLevel: "department",
      timestamp: new Date().toISOString(),
    };
  }
}
//# sourceMappingURL=department-isolation.exception.js.map
