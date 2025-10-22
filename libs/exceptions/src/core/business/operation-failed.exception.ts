import { BusinessException } from "./business.exception.js";

/**
 * 操作失败异常
 *
 * @description 当业务操作失败时抛出此异常
 * 通常用于业务流程执行失败、操作回滚等场景
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new OperationFailedException('order_creation', '订单创建失败');
 *
 * // 带上下文数据
 * throw new OperationFailedException('order_creation', '订单创建失败', {
 *   orderId: 'order-123',
 *   userId: 'user-456',
 *   reason: 'insufficient_inventory'
 * });
 * ```
 */
export class OperationFailedException extends BusinessException {
  /**
   * 创建操作失败异常
   *
   * @param operation - 操作名称
   * @param reason - 失败原因
   * @param data - 附加数据，可包含操作相关数据
   */
  constructor(
    operation: string,
    reason: string,
    data?: Record<string, unknown>,
  ) {
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
