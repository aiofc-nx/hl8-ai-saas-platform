import { IntegrationException } from "./integration.exception.js";
export declare class ExternalServiceTimeoutException extends IntegrationException {
    constructor(serviceName: string, timeoutMs: number, data?: Record<string, unknown>);
}
//# sourceMappingURL=external-service-timeout.exception.d.ts.map