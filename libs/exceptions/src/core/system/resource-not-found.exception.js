import { SystemException } from "./system.exception.js";
export class ResourceNotFoundException extends SystemException {
  constructor(resourceType, resourceId, data) {
    super(
      "SYSTEM_RESOURCE_NOT_FOUND",
      "资源未找到",
      `系统资源 "${resourceType}" (${resourceId}) 不存在`,
      404,
      { resourceType, resourceId, ...data },
      "https://docs.hl8.com/errors#SYSTEM_RESOURCE_NOT_FOUND",
    );
  }
}
//# sourceMappingURL=resource-not-found.exception.js.map
