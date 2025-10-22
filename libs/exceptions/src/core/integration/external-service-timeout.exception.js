import { IntegrationException } from "./integration.exception.js";
export class ExternalServiceTimeoutException extends IntegrationException {
    constructor(serviceName, timeoutMs, data) {
        super("INTEGRATION_EXTERNAL_SERVICE_TIMEOUT", "外部服务超时", `外部服务 "${serviceName}" 调用超时 (${timeoutMs}ms)`, 504, { serviceName, timeoutMs, ...data }, "https://docs.hl8.com/errors#INTEGRATION_EXTERNAL_SERVICE_TIMEOUT");
    }
}
//# sourceMappingURL=external-service-timeout.exception.js.map