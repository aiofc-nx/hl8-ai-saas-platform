import { BusinessException } from "./business.exception.js";
export declare class StepFailedException extends BusinessException {
  constructor(
    workflowName: string,
    stepNumber: number,
    reason: string,
    data?: Record<string, unknown>,
  );
}
//# sourceMappingURL=step-failed.exception.d.ts.map
