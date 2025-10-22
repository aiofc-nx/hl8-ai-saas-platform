/**
 * 业务规则验证器
 * @description 提供业务规则验证的通用功能和接口
 *
 * ## 业务规则类型
 * - 约束规则：数据约束和限制
 * - 计算规则：业务计算逻辑
 * - 验证规则：数据验证逻辑
 * - 授权规则：权限和访问控制
 *
 * @since 1.0.0
 */

// import { EntityId } from "../value-objects/ids/entity-id.vo.js";
import { DomainBusinessRuleViolationException } from "/home/arligle/hl8/hl8-ai-saas-platform/libs/exceptions/dist/core/domain/index.js";

/**
 * 业务规则验证结果
 */
export interface BusinessRuleValidationResult {
  isValid: boolean;
  errors: BusinessRuleValidationError[];
  warnings: BusinessRuleValidationWarning[];
}

/**
 * 业务规则验证错误
 */
export interface BusinessRuleValidationError {
  code: string;
  message: string;
  field?: string;
  context?: Record<string, unknown>;
}

/**
 * 业务规则验证警告
 */
export interface BusinessRuleValidationWarning {
  code: string;
  message: string;
  field?: string;
  context?: Record<string, unknown>;
}

/**
 * 业务规则验证器基类
 */
export abstract class BusinessRuleValidator<Context = unknown> {
  /**
   * 验证业务规则
   * @param context - 验证上下文
   * @returns 验证结果
   */
  abstract validate(_context: Context): BusinessRuleValidationResult;

  /**
   * 获取规则名称
   * @returns 规则名称
   */
  abstract getRuleName(): string;

  /**
   * 获取规则描述
   * @returns 规则描述
   */
  abstract getRuleDescription(): string;

  /**
   * 获取规则优先级
   * @returns 规则优先级（数字越小优先级越高）
   */
  getPriority(): number {
    return 100;
  }

  /**
   * 检查规则是否适用于给定上下文
   * @param context - 验证上下文
   * @returns 是否适用
   */
  isApplicable(_context: Context): boolean {
    return true;
  }

  /**
   * 验证并抛出异常
   * @param context 验证上下文
   * @throws {BusinessRuleViolationException} 当验证失败时抛出异常
   */
  validateAndThrow(context: Context): void {
    const result = this.validate(context);
    if (!result.isValid) {
      const firstError = result.errors[0];
      throw new DomainBusinessRuleViolationException(
        firstError.code,
        firstError.message,
        firstError.context,
      );
    }
  }

  /**
   * 验证并返回异常（不抛出）
   * @param context 验证上下文
   * @returns 异常或 null
   */
  validateAndReturnException(
    context: Context,
  ): DomainBusinessRuleViolationException | null {
    const result = this.validate(context);
    if (!result.isValid) {
      const firstError = result.errors[0];
      return new DomainBusinessRuleViolationException(
        firstError.code,
        firstError.message,
        firstError.context,
      );
    }
    return null;
  }
}

/**
 * 业务规则管理器
 * @description 管理多个业务规则的验证
 */
export class BusinessRuleManager<Context = unknown> {
  private validators: BusinessRuleValidator<Context>[] = [];

  /**
   * 注册业务规则验证器
   * @param validator - 业务规则验证器
   */
  registerValidator(validator: BusinessRuleValidator<Context>): void {
    this.validators.push(validator);
  }

  /**
   * 验证所有适用的业务规则
   * @param context - 验证上下文
   * @returns 验证结果
   */
  validateAll(context: Context): BusinessRuleValidationResult {
    const applicableValidators = this.validators
      .filter((validator) => validator.isApplicable(context))
      .sort((a, b) => a.getPriority() - b.getPriority());

    const errors: BusinessRuleValidationError[] = [];
    const warnings: BusinessRuleValidationWarning[] = [];

    for (const validator of applicableValidators) {
      try {
        const result = validator.validate(context);
        errors.push(...result.errors);
        warnings.push(...result.warnings);
      } catch (error) {
        errors.push({
          code: "VALIDATOR_ERROR",
          message: `验证器 ${validator.getRuleName()} 执行失败: ${error instanceof Error ? error.message : "未知错误"}`,
          context: { validator: validator.getRuleName() },
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 获取所有注册的验证器
   * @returns 验证器列表
   */
  getValidators(): BusinessRuleValidator<Context>[] {
    return [...this.validators];
  }

  /**
   * 清空所有验证器
   */
  clearValidators(): void {
    this.validators = [];
  }

  /**
   * 验证所有规则并抛出异常
   * @param context 验证上下文
   * @throws {BusinessRuleViolationException} 当验证失败时抛出异常
   */
  validateAllAndThrow(context: Context): void {
    const result = this.validateAll(context);
    if (!result.isValid) {
      const firstError = result.errors[0];
      throw new DomainBusinessRuleViolationException(
        firstError.code,
        firstError.message,
        firstError.context,
      );
    }
  }

  /**
   * 验证所有规则并返回异常数组
   * @param context 验证上下文
   * @returns 异常数组
   */
  validateAllAndReturnExceptions(
    context: Context,
  ): DomainBusinessRuleViolationException[] {
    const result = this.validateAll(context);
    return result.errors.map(
      (error) =>
        new DomainBusinessRuleViolationException(
          error.code,
          error.message,
          error.context,
        ),
    );
  }
}

/**
 * 业务规则常量
 */
export class BusinessRules {
  // 约束规则
  static readonly EMAIL_MUST_BE_UNIQUE = "用户邮箱在租户内必须唯一";
  static readonly PASSWORD_MUST_BE_SECURE =
    "用户密码必须包含大小写字母、数字和特殊字符";
  static readonly USERNAME_MUST_BE_UNIQUE = "用户名在租户内必须唯一";
  static readonly ORGANIZATION_MUST_HAVE_TENANT = "组织必须属于某个租户";
  static readonly DEPARTMENT_MUST_HAVE_ORGANIZATION = "部门必须属于某个组织";

  // 计算规则
  static readonly AGE_CALCULATION = "用户年龄 = 当前日期 - 出生日期";
  static readonly PERMISSION_INHERITANCE = "部门管理员继承组织管理员的权限";
  static readonly HIERARCHY_CALCULATION = "层级关系计算";

  // 验证规则
  static readonly STATUS_TRANSITION = "用户只能从待激活状态转换到激活状态";
  static readonly EMAIL_FORMAT = "邮箱格式必须正确";
  static readonly PHONE_FORMAT = "手机号格式必须正确";
  static readonly DATE_RANGE = "日期范围必须合理";

  // 授权规则
  static readonly ACCESS_CONTROL = "访问控制规则";
  static readonly PERMISSION_CHECK = "权限检查规则";
  static readonly TENANT_ISOLATION = "租户隔离规则";
  static readonly DATA_SHARING = "数据共享规则";
}
