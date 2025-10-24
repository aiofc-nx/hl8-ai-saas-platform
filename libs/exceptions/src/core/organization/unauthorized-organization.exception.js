import { OrganizationException } from "./organization.exception.js";
export class UnauthorizedOrganizationException extends OrganizationException {
  constructor(userId, organizationId, data) {
    super(
      "ORGANIZATION_UNAUTHORIZED",
      "未授权组织访问",
      `用户 "${userId}" 没有权限访问组织 "${organizationId}"`,
      403,
      { userId, organizationId, ...data },
      "https://docs.hl8.com/errors#ORGANIZATION_UNAUTHORIZED",
    );
  }
}
//# sourceMappingURL=unauthorized-organization.exception.js.map
