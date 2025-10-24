import { AbstractHttpException } from "./abstract-http.exception.js";
export class GeneralInternalServerException extends AbstractHttpException {
  constructor(title, detail, data, rootCause) {
    super(
      "INTERNAL_SERVER_ERROR",
      title,
      detail,
      500,
      data,
      undefined,
      rootCause,
    );
  }
}
//# sourceMappingURL=general-internal-server.exception.js.map
