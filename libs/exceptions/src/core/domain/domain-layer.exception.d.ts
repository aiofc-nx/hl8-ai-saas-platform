import { DomainLayerException } from "../layers/domain/domain-layer.exception.js";
export declare abstract class DomainException extends DomainLayerException {
  getBusinessRuleInfo(): {
    ruleCode: string;
    ruleMessage: string;
    violationContext: Record<string, unknown>;
    timestamp: string;
  };
  getValidationInfo(): {
    field: string;
    message: string;
    validationContext: Record<string, unknown>;
    timestamp: string;
  };
  getTenantIsolationInfo(): {
    isolationCode: string;
    isolationMessage: string;
    tenantContext: Record<string, unknown>;
    timestamp: string;
  };
}
//# sourceMappingURL=domain-layer.exception.d.ts.map
