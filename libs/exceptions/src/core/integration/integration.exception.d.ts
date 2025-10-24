import { InfrastructureLayerException } from "../layers/infrastructure/infrastructure-layer.exception.js";
export declare abstract class IntegrationException extends InfrastructureLayerException {
  constructor(
    errorCode: string,
    title: string,
    detail: string,
    status: number,
    data?: Record<string, unknown>,
    type?: string,
    rootCause?: Error,
  );
  getCategory(): string;
}
//# sourceMappingURL=integration.exception.d.ts.map
