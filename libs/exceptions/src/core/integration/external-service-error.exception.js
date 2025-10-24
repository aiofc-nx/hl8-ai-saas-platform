import { IntegrationException } from "./integration.exception.js";
export class ExternalServiceErrorException extends IntegrationException {
  constructor(serviceName, errorMessage, statusCode, data) {
    super(
      "INTEGRATION_EXTERNAL_SERVICE_ERROR",
      "外部服务错误",
      `外部服务 "${serviceName}" 返回错误: ${errorMessage}`,
      502,
      { serviceName, errorMessage, statusCode, ...data },
      "https://docs.hl8.com/errors#INTEGRATION_EXTERNAL_SERVICE_ERROR",
    );
  }
}
//# sourceMappingURL=external-service-error.exception.js.map
