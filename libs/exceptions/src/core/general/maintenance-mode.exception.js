import { GeneralException } from "./general.exception.js";
export class MaintenanceModeException extends GeneralException {
  constructor(reason, data) {
    super(
      "GENERAL_MAINTENANCE_MODE",
      "系统维护中",
      reason,
      503,
      data,
      "https://docs.hl8.com/errors#GENERAL_MAINTENANCE_MODE",
    );
  }
}
//# sourceMappingURL=maintenance-mode.exception.js.map
