/**
 * 上下文验证辅助工具
 *
 * 提供上下文验证的辅助函数
 * 支持租户隔离、用户权限和上下文完整性验证
 *
 * @since 1.0.0
 */
import { IsolationContext } from "@hl8/domain-kernel";
import { IUseCaseContext } from "./use-case-context.interface.js";

/**
 * 上下文验证结果
 */
export interface ContextValidationResult {
  /**
   * 是否有效
   */
  isValid: boolean;

  /**
   * 验证错误列表
   */
  errors: string[];

  /**
   * 警告列表
   */
  warnings: string[];

  /**
   * 建议改进项
   */
  suggestions: string[];
}

/**
 * 上下文验证辅助工具类
 *
 * 提供上下文验证的辅助函数
 */
export class ContextValidationHelpers {
  /**
   * 验证租户上下文
   *
   * @param context - 用例上下文
   * @param requiredTenantId - 必需的租户ID
   * @returns 验证结果
   */
  static validateTenantContext(
    context: IUseCaseContext,
    requiredTenantId?: string,
  ): ContextValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!context.tenant) {
      errors.push("租户上下文缺失");
      suggestions.push("提供租户信息以支持多租户隔离");
    } else {
      if (!context.tenant.id || context.tenant.id.trim() === "") {
        errors.push("租户ID不能为空");
      }

      if (!context.tenant.name || context.tenant.name.trim() === "") {
        warnings.push("租户名称缺失，建议提供以改善用户体验");
      }

      if (requiredTenantId && context.tenant.id !== requiredTenantId) {
        errors.push(
          `租户ID不匹配：期望 ${requiredTenantId}，实际 ${context.tenant.id}`,
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * 验证用户上下文
   *
   * @param context - 用例上下文
   * @param requiredUserId - 必需的用户ID
   * @returns 验证结果
   */
  static validateUserContext(
    context: IUseCaseContext,
    requiredUserId?: string,
  ): ContextValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!context.user) {
      warnings.push("用户上下文缺失，某些功能可能受限");
      suggestions.push("提供用户信息以支持用户特定的操作");
    } else {
      if (!context.user.id || context.user.id.trim() === "") {
        errors.push("用户ID不能为空");
      }

      if (!context.user.username || context.user.username.trim() === "") {
        warnings.push("用户名缺失，建议提供以改善用户体验");
      }

      if (requiredUserId && context.user.id !== requiredUserId) {
        errors.push(
          `用户ID不匹配：期望 ${requiredUserId}，实际 ${context.user.id}`,
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * 验证隔离上下文
   *
   * @param isolationContext - 隔离上下文
   * @param requiredLevel - 必需的隔离级别
   * @returns 验证结果
   */
  static validateIsolationContext(
    isolationContext: IsolationContext,
    requiredLevel?: string,
  ): ContextValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (isolationContext.isEmpty()) {
      errors.push("隔离上下文不能为空");
      suggestions.push("提供有效的隔离上下文以支持多租户隔离");
    } else {
      const currentLevel = isolationContext.getIsolationLevel();

      if (requiredLevel && currentLevel !== requiredLevel) {
        warnings.push(
          `隔离级别不匹配：期望 ${requiredLevel}，实际 ${currentLevel}`,
        );
      }

      // 检查隔离级别的合理性
      if (isolationContext.isUserLevel() && !isolationContext.isTenantLevel()) {
        warnings.push("用户级隔离建议同时包含租户级隔离");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * 验证请求标识符
   *
   * @param context - 用例上下文
   * @returns 验证结果
   */
  static validateRequestId(context: IUseCaseContext): ContextValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!context.requestId || context.requestId.trim() === "") {
      errors.push("请求标识符不能为空");
      suggestions.push("提供请求标识符以支持请求追踪");
    } else {
      // 检查请求标识符格式
      if (!/^req_\d+_[a-z0-9]+$/i.test(context.requestId)) {
        warnings.push("请求标识符格式不符合规范");
        suggestions.push("使用格式：req_{timestamp}_{random}");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * 验证上下文时间戳
   *
   * @param context - 用例上下文
   * @param maxAgeMs - 最大年龄（毫秒）
   * @returns 验证结果
   */
  static validateContextTimestamp(
    context: IUseCaseContext,
    maxAgeMs: number = 300000,
  ): ContextValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!context.timestamp || !(context.timestamp instanceof Date)) {
      errors.push("时间戳必须是有效的日期对象");
    } else {
      const now = new Date();
      const age = now.getTime() - context.timestamp.getTime();

      if (age < 0) {
        errors.push("时间戳不能是未来时间");
      } else if (age > maxAgeMs) {
        warnings.push(`上下文可能已过期（年龄：${age}ms）`);
        suggestions.push("考虑刷新上下文或重新创建");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * 全面验证上下文
   *
   * @param context - 用例上下文
   * @param isolationContext - 隔离上下文
   * @param options - 验证选项
   * @returns 验证结果
   */
  static validateContextCompletely(
    context: IUseCaseContext,
    isolationContext?: IsolationContext,
    options: {
      requiredTenantId?: string;
      requiredUserId?: string;
      requiredIsolationLevel?: string;
      maxAgeMs?: number;
    } = {},
  ): ContextValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];
    const allSuggestions: string[] = [];

    // 验证租户上下文
    const tenantResult = this.validateTenantContext(
      context,
      options.requiredTenantId,
    );
    allErrors.push(...tenantResult.errors);
    allWarnings.push(...tenantResult.warnings);
    allSuggestions.push(...tenantResult.suggestions);

    // 验证用户上下文
    const userResult = this.validateUserContext(
      context,
      options.requiredUserId,
    );
    allErrors.push(...userResult.errors);
    allWarnings.push(...userResult.warnings);
    allSuggestions.push(...userResult.suggestions);

    // 验证隔离上下文
    if (isolationContext) {
      const isolationResult = this.validateIsolationContext(
        isolationContext,
        options.requiredIsolationLevel,
      );
      allErrors.push(...isolationResult.errors);
      allWarnings.push(...isolationResult.warnings);
      allSuggestions.push(...isolationResult.suggestions);
    }

    // 验证请求标识符
    const requestIdResult = this.validateRequestId(context);
    allErrors.push(...requestIdResult.errors);
    allWarnings.push(...requestIdResult.warnings);
    allSuggestions.push(...requestIdResult.suggestions);

    // 验证时间戳
    const timestampResult = this.validateContextTimestamp(
      context,
      options.maxAgeMs,
    );
    allErrors.push(...timestampResult.errors);
    allWarnings.push(...timestampResult.warnings);
    allSuggestions.push(...timestampResult.suggestions);

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      suggestions: allSuggestions,
    };
  }
}
