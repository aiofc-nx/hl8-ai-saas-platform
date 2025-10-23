import { BusinessException } from "./business.exception.js";
export class StepFailedException extends BusinessException {
    constructor(workflowName, stepNumber, reason, data) {
        super("BUSINESS_STEP_FAILED", "步骤失败", `工作流 "${workflowName}" 第 ${stepNumber} 步失败: ${reason}`, 422, { workflowName, stepNumber, reason, ...data }, "https://docs.hl8.com/errors#BUSINESS_STEP_FAILED");
    }
}
//# sourceMappingURL=step-failed.exception.js.map