import {
  BusinessRuleValidator,
  BusinessRuleValidationResult,
  BusinessRuleValidationError,
  BusinessRuleValidationWarning,
} from "@hl8/domain-kernel";
import { CredentialType } from "../value-objects/credential-type.vo.js";
import { GenericEntityId } from "@hl8/domain-kernel";

/**
 * 凭证验证上下文
 */
export interface CredentialValidationContext {
  operation:
    | "credential_creation"
    | "credential_update"
    | "credential_verification"
    | string;
  credentialData?: {
    userId: GenericEntityId;
    type: CredentialType;
    value: string;
    expiresAt?: Date;
  };
}

/**
 * 凭证验证业务规则
 * @description 验证凭证创建、更新和验证的业务规则
 *
 * @example
 * ```typescript
 * const rule = new CredentialValidationBusinessRule();
 * const result = rule.validate({
 *   operation: "credential_creation",
 *   credentialData: {
 *     userId: UserId.create('user-123'),
 *     type: CredentialType.PASSWORD,
 *     value: 'hashedPassword123'
 *   }
 * });
 * ```
 */
export class CredentialValidationBusinessRule extends BusinessRuleValidator<CredentialValidationContext> {
  /**
   * 凭证类型最小长度要求
   */
  private static readonly MIN_LENGTH_REQUIREMENTS = new Map<
    CredentialType,
    number
  >([
    [CredentialType.PASSWORD, 8],
    [CredentialType.TOKEN, 32],
    [CredentialType.OAUTH, 64],
    [CredentialType.CERTIFICATE, 128],
  ]);

  /**
   * 验证凭证规则
   * @param context - 验证上下文
   * @returns 验证结果
   */
  validate(context: CredentialValidationContext): BusinessRuleValidationResult {
    const errors: BusinessRuleValidationError[] = [];
    const warnings: BusinessRuleValidationWarning[] = [];

    const credentialData = context.credentialData;
    if (!credentialData) {
      errors.push({
        code: "MISSING_CREDENTIAL_DATA",
        message: "凭证数据不能为空",
        field: "credentialData",
      });
      return { isValid: false, errors, warnings };
    }

    // 验证用户ID
    if (!credentialData.userId) {
      errors.push({
        code: "INVALID_USER_ID",
        message: "用户ID不能为空",
        field: "userId",
      });
    }

    // 验证凭证类型
    if (!credentialData.type) {
      errors.push({
        code: "INVALID_CREDENTIAL_TYPE",
        message: "凭证类型不能为空",
        field: "type",
      });
    } else {
      // 验证凭证类型是否有效
      this.validateCredentialType(credentialData.type, errors);
    }

    // 验证凭证值
    if (!credentialData.value) {
      errors.push({
        code: "INVALID_CREDENTIAL_VALUE",
        message: "凭证值不能为空",
        field: "value",
      });
    } else {
      // 验证凭证值长度
      this.validateCredentialValueLength(
        credentialData.type,
        credentialData.value,
        errors,
      );
    }

    // 验证过期时间
    if (credentialData.expiresAt) {
      this.validateExpirationDate(credentialData.expiresAt, errors);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 验证凭证类型
   * @param type - 凭证类型
   * @param errors - 错误列表
   */
  private validateCredentialType(
    type: CredentialType,
    errors: BusinessRuleValidationError[],
  ): void {
    const validTypes = [
      CredentialType.PASSWORD,
      CredentialType.TOKEN,
      CredentialType.OAUTH,
      CredentialType.CERTIFICATE,
    ];

    if (!validTypes.includes(type)) {
      errors.push({
        code: "INVALID_CREDENTIAL_TYPE_VALUE",
        message: `无效的凭证类型: ${type}`,
        field: "type",
        context: { type },
      });
    }
  }

  /**
   * 验证凭证值长度
   * @param type - 凭证类型
   * @param value - 凭证值
   * @param errors - 错误列表
   */
  private validateCredentialValueLength(
    type: CredentialType,
    value: string,
    errors: BusinessRuleValidationError[],
  ): void {
    const minLength =
      CredentialValidationBusinessRule.MIN_LENGTH_REQUIREMENTS.get(type) ?? 0;

    if (value.length < minLength) {
      errors.push({
        code: "INSUFFICIENT_CREDENTIAL_LENGTH",
        message: `${type} 类型凭证值长度不能少于 ${minLength} 个字符`,
        field: "value",
        context: { type, minLength, actualLength: value.length },
      });
    }
  }

  /**
   * 验证过期时间
   * @param expiresAt - 过期时间
   * @param errors - 错误列表
   */
  private validateExpirationDate(
    expiresAt: Date,
    errors: BusinessRuleValidationError[],
  ): void {
    if (expiresAt <= new Date()) {
      errors.push({
        code: "INVALID_EXPIRATION_DATE",
        message: "过期时间不能早于当前时间",
        field: "expiresAt",
        context: { expiresAt },
      });
    }
  }

  /**
   * 获取规则名称
   * @returns 规则名称
   */
  getRuleName(): string {
    return "CredentialValidationBusinessRule";
  }

  /**
   * 获取规则描述
   * @returns 规则描述
   */
  getRuleDescription(): string {
    return "验证凭证创建、更新和验证的业务规则";
  }

  /**
   * 获取规则优先级
   * @returns 规则优先级
   */
  getPriority(): number {
    return 10; // 高优先级
  }
}
