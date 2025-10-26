import { AbstractHttpException } from "./abstract-http.exception.js";
export declare class GeneralInternalServerException extends AbstractHttpException {
  constructor(
    title: string,
    detail: string,
    data?: Record<string, unknown>,
    rootCause?: Error,
  );
}
//# sourceMappingURL=general-internal-server.exception.d.ts.map
