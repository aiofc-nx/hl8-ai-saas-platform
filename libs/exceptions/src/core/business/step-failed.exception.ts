import { BusinessException } from "./business.exception.js";

/**
 * 步骤失败异常
 *
 * @description 当业务流程中的步骤失败时抛出此异常
 * 通常用于工作流执行、多步骤操作等场景
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new StepFailedException('payment_processing', 2, '支付网关连接超时');
 *
 * // 带上下文数据
 * throw new StepFailedException('payment_processing', 2, '支付网关连接超时', {
 *   workflowId: 'wf-123',
 *   stepName: 'payment_gateway_call',
 *   retryCount: 3
 * });
 * ```
 */
export class StepFailedException extends BusinessException {
  /**
   * 创建步骤失败异常
   *
   * @param workflowName - 工作流名称
   * @param stepNumber - 步骤编号
   * @param reason - 失败原因
   * @param data - 附加数据，可包含工作流ID、步骤名称等
   */
  constructor(
    workflowName: string,
    stepNumber: number,
    reason: string,
    data?: Record<string, unknown>,
  ) {
    super(
      "BUSINESS_STEP_FAILED",
      "步骤失败",
      `工作流 "${workflowName}" 第 ${stepNumber} 步失败: ${reason}`,
      422,
      { workflowName, stepNumber, reason, ...data },
      "https://docs.hl8.com/errors#BUSINESS_STEP_FAILED",
    );
  }
}
