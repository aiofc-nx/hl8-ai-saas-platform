import { ApplicationLayerException } from "../layers/application/application-layer.exception.js";
export class DepartmentException extends ApplicationLayerException {
  constructor(errorCode, title, detail, status, data, type, rootCause) {
    super(errorCode, title, detail, status, data, type, rootCause);
  }
  getCategory() {
    return "department";
  }
}
//# sourceMappingURL=department.exception.js.map
