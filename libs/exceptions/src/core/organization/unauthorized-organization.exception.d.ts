import { OrganizationException } from "./organization.exception.js";
export declare class UnauthorizedOrganizationException extends OrganizationException {
  constructor(
    userId: string,
    organizationId: string,
    data?: Record<string, unknown>,
  );
}
//# sourceMappingURL=unauthorized-organization.exception.d.ts.map
