import { TenantException } from "./tenant.exception.js";
export class CrossTenantAccessException extends TenantException {
  constructor(currentTenantId, targetTenantId, data) {
    super(
      "TENANT_CROSS_ACCESS_VIOLATION",
      "跨租户访问违规",
      `不允许从租户 "${currentTenantId}" 访问租户 "${targetTenantId}" 的资源`,
      403,
      { currentTenantId, targetTenantId, ...data },
      "https://docs.hl8.com/errors#TENANT_CROSS_ACCESS_VIOLATION",
    );
  }
}
//# sourceMappingURL=cross-tenant-access.exception.js.map
