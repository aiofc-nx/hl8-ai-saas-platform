import { IntegrationException } from "./integration.exception.js";
export declare class ExternalServiceErrorException extends IntegrationException {
  constructor(
    serviceName: string,
    errorMessage: string,
    statusCode: number,
    data?: Record<string, unknown>,
  );
}
//# sourceMappingURL=external-service-error.exception.d.ts.map
