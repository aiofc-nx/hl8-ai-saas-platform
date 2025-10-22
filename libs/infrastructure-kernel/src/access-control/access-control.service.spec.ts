import { AccessControlService } from "./access-control.service";
import { IsolationContext } from "../isolation/isolation-context";
import {
  IsolationLevel,
  TenantId,
  OrganizationId,
  DepartmentId,
  UserId,
} from "@hl8/domain-kernel";

describe("AccessControlService", () => {
  let service: AccessControlService;
  let tenantId: TenantId;
  let orgId: OrganizationId;
  let deptId: DepartmentId;
  let userId: UserId;

  beforeEach(() => {
    service = new AccessControlService();
    tenantId = TenantId.generate();
    orgId = OrganizationId.generate();
    deptId = DepartmentId.generate();
    userId = UserId.generate();
  });

  describe("canAccess", () => {
    it("should allow platform-level access", () => {
      const userContext = new IsolationContext(tenantId, orgId, deptId, userId);
      const resourceContext = new IsolationContext();

      const result = service.canAccess(
        userContext,
        resourceContext,
        IsolationLevel.PLATFORM,
      );

      expect(result).toBe(true);
    });

    it("should allow tenant-level access for same tenant", () => {
      const userContext = new IsolationContext(tenantId, orgId, deptId, userId);
      const resourceContext = new IsolationContext(tenantId);

      const result = service.canAccess(
        userContext,
        resourceContext,
        IsolationLevel.TENANT,
      );

      expect(result).toBe(true);
    });

    it("should deny tenant-level access for different tenant", () => {
      const otherTenantId = TenantId.generate();
      const userContext = new IsolationContext(tenantId, orgId, deptId, userId);
      const resourceContext = new IsolationContext(otherTenantId);

      const result = service.canAccess(
        userContext,
        resourceContext,
        IsolationLevel.TENANT,
      );

      expect(result).toBe(false);
    });

    it("should allow organization-level access for same org", () => {
      const userContext = new IsolationContext(tenantId, orgId, deptId, userId);
      const resourceContext = new IsolationContext(tenantId, orgId);

      const result = service.canAccess(
        userContext,
        resourceContext,
        IsolationLevel.ORGANIZATION,
      );

      expect(result).toBe(true);
    });

    it("should deny organization-level access for different org", () => {
      const otherOrgId = OrganizationId.generate();
      const userContext = new IsolationContext(tenantId, orgId, deptId, userId);
      const resourceContext = new IsolationContext(tenantId, otherOrgId);

      const result = service.canAccess(
        userContext,
        resourceContext,
        IsolationLevel.ORGANIZATION,
      );

      expect(result).toBe(false);
    });
  });
});
