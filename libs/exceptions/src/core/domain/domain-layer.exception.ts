import { DomainLayerException } from "../layers/domain/domain-layer.exception.js";

/**
 * 领域层异常基类
 * @description 所有领域层异常的基类，提供与业务规则验证的集成能力
 *
 * ## 设计原则
 * - 纯领域层异常，无外部依赖
 * - 支持业务规则验证集成
 * - 保持领域层的纯净性
 * - 提供丰富的上下文信息
 *
 * @since 2.1.0
 */
export abstract class DomainException extends DomainLayerException {
  /**
   * 获取业务规则信息
   * @returns 业务规则详细信息
   * @description 子类可以重写此方法，返回特定的业务规则信息
   */
  getBusinessRuleInfo(): {
    ruleCode: string;
    ruleMessage: string;
    violationContext: Record<string, unknown>;
    timestamp: string;
  } {
    return {
      ruleCode: this.errorCode,
      ruleMessage: this.detail,
      violationContext: this.data || {},
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 获取验证信息
   * @returns 验证详细信息
   * @description 子类可以重写此方法，返回特定的验证信息
   */
  getValidationInfo(): {
    field: string;
    message: string;
    validationContext: Record<string, unknown>;
    timestamp: string;
  } {
    return {
      field: (this.data?.field as string) || "unknown",
      message: this.detail,
      validationContext: this.data || {},
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 获取租户隔离信息
   * @returns 租户隔离详细信息
   * @description 子类可以重写此方法，返回特定的租户隔离信息
   */
  getTenantIsolationInfo(): {
    isolationCode: string;
    isolationMessage: string;
    tenantContext: Record<string, unknown>;
    timestamp: string;
  } {
    return {
      isolationCode: this.errorCode,
      isolationMessage: this.detail,
      tenantContext: this.data || {},
      timestamp: new Date().toISOString(),
    };
  }
}
