import { DomainLayerException } from "../layers/domain/domain-layer.exception.js";
export class DomainException extends DomainLayerException {
  getBusinessRuleInfo() {
    return {
      ruleCode: this.errorCode,
      ruleMessage: this.detail,
      violationContext: this.data || {},
      timestamp: new Date().toISOString(),
    };
  }
  getValidationInfo() {
    return {
      field: this.data?.field || "unknown",
      message: this.detail,
      validationContext: this.data || {},
      timestamp: new Date().toISOString(),
    };
  }
  getTenantIsolationInfo() {
    return {
      isolationCode: this.errorCode,
      isolationMessage: this.detail,
      tenantContext: this.data || {},
      timestamp: new Date().toISOString(),
    };
  }
}
//# sourceMappingURL=domain-layer.exception.js.map
