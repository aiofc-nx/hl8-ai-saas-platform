import { ApplicationLayerException } from "../layers/application/application-layer.exception.js";
export declare abstract class OrganizationException extends ApplicationLayerException {
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
//# sourceMappingURL=organization.exception.d.ts.map
