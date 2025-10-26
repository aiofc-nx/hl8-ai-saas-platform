import { BusinessException } from "./business.exception.js";
export class OperationFailedException extends BusinessException {
  constructor(operation, reason, data) {
    super(
      "BUSINESS_OPERATION_FAILED",
      "操作失败",
      `操作 "${operation}" 失败: ${reason}`,
      422,
      { operation, reason, ...data },
      "https://docs.hl8.com/errors#BUSINESS_OPERATION_FAILED",
    );
  }
}
//# sourceMappingURL=operation-failed.exception.js.map
