import { OrganizationException } from "./organization.exception.js";
export class OrganizationNotFoundException extends OrganizationException {
  constructor(organizationId, data) {
    super(
      "ORGANIZATION_NOT_FOUND",
      "组织未找到",
      `ID 为 "${organizationId}" 的组织不存在`,
      404,
      { organizationId, ...data },
      "https://docs.hl8.com/errors#ORGANIZATION_NOT_FOUND",
    );
  }
}
//# sourceMappingURL=organization-not-found.exception.js.map
