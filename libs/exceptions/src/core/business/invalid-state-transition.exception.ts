import { BusinessException } from "./business.exception.js";

/**
 * 无效状态转换异常
 *
 * @description 当状态转换无效时抛出此异常
 * 通常用于状态机验证、业务流程状态控制等场景
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new InvalidStateTransitionException('order', 'cancelled', 'shipped');
 *
 * // 带上下文数据
 * throw new InvalidStateTransitionException('order', 'cancelled', 'shipped', {
 *   orderId: 'order-123',
 *   currentState: 'cancelled',
 *   targetState: 'shipped',
 *   reason: 'cannot_ship_cancelled_order'
 * });
 * ```
 */
export class InvalidStateTransitionException extends BusinessException {
  /**
   * 创建步骤失败异常
   *
   * @param entity - 实体类型
   * @param currentState - 当前状态
   * @param targetState - 目标状态
   * @param data - 附加数据，可包含实体ID、转换原因等
   */
  constructor(
    entity: string,
    currentState: string,
    targetState: string,
    data?: Record<string, unknown>,
  ) {
    super(
      "BUSINESS_INVALID_STATE_TRANSITION",
      "无效状态转换",
      `实体 "${entity}" 无法从状态 "${currentState}" 转换到 "${targetState}"`,
      422,
      { entity, currentState, targetState, ...data },
      "https://docs.hl8.com/errors#BUSINESS_INVALID_STATE_TRANSITION",
    );
  }
}
