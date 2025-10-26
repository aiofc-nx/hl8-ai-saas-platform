import { IntegrationException } from "./integration.exception.js";
export class ExternalServiceUnavailableException extends IntegrationException {
  constructor(serviceName, reason, data) {
    super(
      "INTEGRATION_EXTERNAL_SERVICE_UNAVAILABLE",
      "外部服务不可用",
      `外部服务 "${serviceName}" 不可用: ${reason}`,
      503,
      { serviceName, reason, ...data },
      "https://docs.hl8.com/errors#INTEGRATION_EXTERNAL_SERVICE_UNAVAILABLE",
    );
  }
}
//# sourceMappingURL=external-service-unavailable.exception.js.map
