import { DomainException } from "./domain-layer.exception.js";

/**
 * 领域层数据验证异常
 * @description 当数据验证失败时抛出
 *
 * ## 使用场景
 * - 实体数据验证失败
 * - 值对象约束违反
 * - 数据格式验证失败
 *
 * @since 2.1.0
 */
export class DomainValidationException extends DomainException {
  constructor(
    field: string,
    message: string,
    context?: Record<string, unknown>,
  ) {
    super(
      `VALIDATION_FAILED_${field.toUpperCase()}`,
      "数据验证失败",
      message,
      400,
      { field, ...context },
      `https://docs.hl8.com/errors#VALIDATION_FAILED_${field.toUpperCase()}`,
    );
  }

  /**
   * 获取验证字段信息
   * @returns 验证字段名称
   */
  getField(): string {
    return (this.data?.field as string) || "unknown";
  }

  /**
   * 获取验证详细信息
   * @returns 验证详细信息
   */
  getValidationInfo(): {
    field: string;
    message: string;
    validationContext: Record<string, unknown>;
    timestamp: string;
  } {
    return {
      field: this.getField(),
      message: this.detail,
      validationContext: this.data || {},
      timestamp: new Date().toISOString(),
    };
  }
}
