import { DomainException } from "./domain-layer.exception.js";

/**
 * 领域层业务规则违规异常
 * @description 当业务规则验证失败时抛出
 *
 * ## 使用场景
 * - 业务规则验证失败
 * - 业务逻辑约束违反
 * - 业务状态转换无效
 *
 * @since 2.1.0
 */
export class DomainBusinessRuleViolationException extends DomainException {
  constructor(
    ruleCode: string,
    message: string,
    context?: Record<string, unknown>,
  ) {
    super(
      "BUSINESS_RULE_VIOLATION",
      "业务规则违规",
      message,
      422,
      { ruleCode, ...context },
      "https://docs.hl8.com/errors#BUSINESS_RULE_VIOLATION",
    );
  }

  /**
   * 获取业务规则信息
   * @returns 业务规则详细信息
   */
  getBusinessRuleInfo(): {
    ruleCode: string;
    ruleMessage: string;
    violationContext: Record<string, unknown>;
    timestamp: string;
  } {
    return {
      ruleCode: (this.data?.ruleCode as string) || this.errorCode,
      ruleMessage: this.detail,
      violationContext: this.data || {},
      timestamp: new Date().toISOString(),
    };
  }
}
