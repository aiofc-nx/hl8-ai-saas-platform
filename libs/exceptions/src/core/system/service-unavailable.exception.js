import { SystemException } from "./system.exception.js";
export class ServiceUnavailableException extends SystemException {
  constructor(reason, data) {
    super(
      "SYSTEM_SERVICE_UNAVAILABLE",
      "服务不可用",
      reason,
      503,
      data,
      "https://docs.hl8.com/errors#SYSTEM_SERVICE_UNAVAILABLE",
    );
  }
}
//# sourceMappingURL=service-unavailable.exception.js.map
