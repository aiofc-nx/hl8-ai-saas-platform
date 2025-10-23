import { ValidationException } from "./validation.exception.js";

/**
 * 业务规则违规异常
 *
 * @description 当违反业务规则时抛出此异常
 * 通常用于业务逻辑验证、业务约束检查等场景
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new BusinessRuleViolationException('ORDER_AMOUNT_LIMIT', '订单金额超过限制');
 *
 * // 带上下文数据
 * throw new BusinessRuleViolationException('ORDER_AMOUNT_LIMIT', '订单金额超过限制', {
 *   orderAmount: 10000,
 *   limit: 5000,
 *   userId: 'user-123'
 * });
 * ```
 */
export class BusinessRuleViolationException extends ValidationException {
  /**
   * 创建业务规则违规异常
   *
   * @param ruleName - 违规的业务规则名称
   * @param violation - 违规详情
   * @param data - 附加数据，可包含相关业务数据
   */
  constructor(
    ruleName: string,
    violation: string,
    data?: Record<string, unknown>,
  ) {
    super(
      "BUSINESS_RULE_VIOLATION",
      "业务规则违规",
      `业务规则 "${ruleName}" 被违反: ${violation}`,
      422,
      { ruleName, violation, ...data },
      "https://docs.hl8.com/errors#BUSINESS_RULE_VIOLATION",
    );
  }
}
