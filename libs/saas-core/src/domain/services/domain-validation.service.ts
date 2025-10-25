/**
 * 领域验证服务
 *
 * @description 处理领域层验证，包括业务规则验证、数据验证、约束验证等
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { BaseDomainService } from "@hl8/domain-kernel";
import { TenantId } from "@hl8/domain-kernel";
import { OrganizationId } from "@hl8/domain-kernel";
import { DepartmentId } from "@hl8/domain-kernel";
import { UserId } from "@hl8/domain-kernel";

/**
 * 验证类型枚举
 */
export enum ValidationType {
  BUSINESS_RULE = "BUSINESS_RULE",
  DATA_INTEGRITY = "DATA_INTEGRITY",
  CONSTRAINT = "CONSTRAINT",
  DEPENDENCY = "DEPENDENCY",
  PERMISSION = "PERMISSION",
  WORKFLOW = "WORKFLOW",
}

/**
 * 验证级别枚举
 */
export enum ValidationLevel {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
  CRITICAL = "CRITICAL",
}

/**
 * 验证规则接口
 */
export interface ValidationRule {
  readonly id: string;
  readonly name: string;
  readonly type: ValidationType;
  readonly level: ValidationLevel;
  readonly description: string;
  readonly condition: (context: ValidationContext) => Promise<boolean>;
  readonly message: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * 验证上下文接口
 */
export interface ValidationContext {
  readonly tenantId?: TenantId;
  readonly organizationId?: OrganizationId;
  readonly departmentId?: DepartmentId;
  readonly userId?: UserId;
  readonly entityType: string;
  readonly entityId: string;
  readonly operation: string;
  readonly data: Record<string, unknown>;
  readonly metadata?: Record<string, unknown>;
}

/**
 * 验证结果接口
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly ValidationError[];
  readonly warnings: readonly ValidationWarning[];
  readonly info: readonly ValidationInfo[];
  readonly summary: {
    readonly totalRules: number;
    readonly passedRules: number;
    readonly failedRules: number;
    readonly warningRules: number;
    readonly infoRules: number;
  };
}

/**
 * 验证错误接口
 */
export interface ValidationError {
  readonly ruleId: string;
  readonly ruleName: string;
  readonly message: string;
  readonly level: ValidationLevel;
  readonly context: ValidationContext;
  readonly timestamp: Date;
}

/**
 * 验证警告接口
 */
export interface ValidationWarning {
  readonly ruleId: string;
  readonly ruleName: string;
  readonly message: string;
  readonly level: ValidationLevel;
  readonly context: ValidationContext;
  readonly timestamp: Date;
}

/**
 * 验证信息接口
 */
export interface ValidationInfo {
  readonly ruleId: string;
  readonly ruleName: string;
  readonly message: string;
  readonly level: ValidationLevel;
  readonly context: ValidationContext;
  readonly timestamp: Date;
}

/**
 * 领域验证服务
 *
 * 领域验证服务负责处理领域层验证，包括业务规则验证、数据验证、约束验证等。
 * 支持多种验证类型和级别，提供统一的验证管理接口。
 *
 * @example
 * ```typescript
 * const service = new DomainValidationService();
 * await service.addValidationRule(rule);
 * const result = await service.validate(context);
 * ```
 */
@Injectable()
export class DomainValidationService extends BaseDomainService {
  private readonly validationRules: Map<string, ValidationRule> = new Map();
  private readonly validationHistory: Array<{
    readonly timestamp: Date;
    readonly context: ValidationContext;
    readonly result: ValidationResult;
  }> = [];

  constructor() {
    super();
    this.setContext("DomainValidationService");
    this.initializeDefaultRules();
  }

  /**
   * 实现基类的抽象方法
   */
  async execute(input: unknown): Promise<unknown> {
    // 默认实现：返回输入
    return input;
  }


  /**
   * 添加验证规则
   *
   * @param rule - 验证规则
   * @returns 是否添加成功
   */
  async addValidationRule(rule: ValidationRule): Promise<boolean> {
    this.logger.log(
      `Adding validation rule: ${rule.name} (${rule.type})`,
      this.context,
    );

    if (this.validationRules.has(rule.id)) {
      throw new Error(`Validation rule ${rule.id} already exists`);
    }

    this.validationRules.set(rule.id, rule);

    this.logger.log(
      `Validation rule ${rule.name} added successfully`,
      this.context,
    );

    return true;
  }

  /**
   * 获取验证规则
   *
   * @param ruleId - 规则ID
   * @returns 验证规则或undefined
   */
  async getValidationRule(ruleId: string): Promise<ValidationRule | undefined> {
    this.logger.log(`Getting validation rule: ${ruleId}`, this.context);

    const rule = this.validationRules.get(ruleId);

    this.logger.log(
      `Validation rule ${ruleId} ${rule ? "found" : "not found"}`,
      this.context,
    );

    return rule;
  }

  /**
   * 执行验证
   *
   * @param context - 验证上下文
   * @param ruleIds - 规则ID列表（可选）
   * @returns 验证结果
   */
  async validate(
    context: ValidationContext,
    ruleIds?: readonly string[],
  ): Promise<ValidationResult> {
    this.logger.log(
      `Validating context: ${context.entityType} ${context.entityId} (${context.operation})`,
      this.context,
    );

    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const info: ValidationInfo[] = [];

    const rulesToValidate = ruleIds
      ? Array.from(this.validationRules.values()).filter((rule) =>
          ruleIds.includes(rule.id),
        )
      : Array.from(this.validationRules.values());

    let passedRules = 0;
    let failedRules = 0;
    let warningRules = 0;
    let infoRules = 0;

    for (const rule of rulesToValidate) {
      try {
        const isValid = await rule.condition(context);

        if (isValid) {
          passedRules++;
          if (rule.level === ValidationLevel.INFO) {
            info.push({
              ruleId: rule.id,
              ruleName: rule.name,
              message: rule.message,
              level: rule.level,
              context,
              timestamp: new Date(),
            });
            infoRules++;
          }
        } else {
          failedRules++;
          const error: ValidationError = {
            ruleId: rule.id,
            ruleName: rule.name,
            message: rule.message,
            level: rule.level,
            context,
            timestamp: new Date(),
          };

          if (
            rule.level === ValidationLevel.ERROR ||
            rule.level === ValidationLevel.CRITICAL
          ) {
            errors.push(error);
          } else if (rule.level === ValidationLevel.WARNING) {
            warnings.push({
              ruleId: rule.id,
              ruleName: rule.name,
              message: rule.message,
              level: rule.level,
              context,
              timestamp: new Date(),
            });
            warningRules++;
          }
        }
      } catch (error) {
        this.logger.error(
          `Error validating rule ${rule.name}: ${error.message}`,
          this.context,
        );

        failedRules++;
        errors.push({
          ruleId: rule.id,
          ruleName: rule.name,
          message: `Validation error: ${error.message}`,
          level: ValidationLevel.ERROR,
          context,
          timestamp: new Date(),
        });
      }
    }

    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
      info: info.length > 0 ? info : undefined,
      summary: {
        totalRules: rulesToValidate.length,
        passedRules,
        failedRules,
        warningRules,
        infoRules,
      },
    };

    // 记录验证历史
    this.validationHistory.push({
      timestamp: new Date(),
      context,
      result,
    });

    this.logger.log(
      `Validation completed: ${passedRules} passed, ${failedRules} failed, ${warnings.length} warnings`,
      this.context,
    );

    return result;
  }

  /**
   * 获取验证历史
   *
   * @param limit - 限制数量
   * @returns 验证历史列表
   */
  async getValidationHistory(limit: number = 100): Promise<
    readonly {
      readonly timestamp: Date;
      readonly context: ValidationContext;
      readonly result: ValidationResult;
    }[]
  > {
    this.logger.log(
      `Getting validation history with limit: ${limit}`,
      this.context,
    );

    const history = this.validationHistory
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    this.logger.log(
      `Retrieved ${history.length} validation history entries`,
      this.context,
    );

    return history;
  }

  /**
   * 获取验证统计信息
   *
   * @returns 验证统计信息
   */
  async getValidationStatistics(): Promise<{
    readonly totalRules: number;
    readonly rulesByType: Record<ValidationType, number>;
    readonly rulesByLevel: Record<ValidationLevel, number>;
    readonly totalValidations: number;
    readonly successRate: number;
    readonly averageValidationTime: number;
  }> {
    this.logger.log(`Getting validation statistics`, this.context);

    const totalRules = this.validationRules.size;
    const rulesByType: Record<ValidationType, number> = {} as Record<
      ValidationType,
      number
    >;
    const rulesByLevel: Record<ValidationLevel, number> = {} as Record<
      ValidationLevel,
      number
    >;

    // 初始化统计
    for (const type of Object.values(ValidationType)) {
      rulesByType[type] = 0;
    }
    for (const level of Object.values(ValidationLevel)) {
      rulesByLevel[level] = 0;
    }

    // 统计规则
    for (const rule of this.validationRules.values()) {
      rulesByType[rule.type]++;
      rulesByLevel[rule.level]++;
    }

    // 统计验证历史
    const totalValidations = this.validationHistory.length;
    const successfulValidations = this.validationHistory.filter(
      (h) => h.result.isValid,
    ).length;
    const successRate =
      totalValidations > 0 ? successfulValidations / totalValidations : 0;

    // 计算平均验证时间（模拟）
    const averageValidationTime = 50; // 毫秒

    const result = {
      totalRules,
      rulesByType,
      rulesByLevel,
      totalValidations,
      successRate,
      averageValidationTime,
    };

    this.logger.log(
      `Validation statistics generated: ${totalRules} rules, ${totalValidations} validations, ${(successRate * 100).toFixed(2)}% success rate`,
      this.context,
    );

    return result;
  }

  /**
   * 初始化默认验证规则
   */
  private initializeDefaultRules(): void {
    // 租户验证规则
    this.addValidationRule({
      id: "tenant-name-required",
      name: "Tenant Name Required",
      type: ValidationType.BUSINESS_RULE,
      level: ValidationLevel.ERROR,
      description: "Tenant name must be provided",
      condition: async (context) => {
        return (
          context.data.name &&
          typeof context.data.name === "string" &&
          context.data.name.trim() !== ""
        );
      },
      message: "Tenant name is required",
    });

    this.addValidationRule({
      id: "tenant-code-unique",
      name: "Tenant Code Unique",
      type: ValidationType.DATA_INTEGRITY,
      level: ValidationLevel.ERROR,
      description: "Tenant code must be unique",
      condition: async (context) => {
        // 这里应该实现实际的唯一性检查
        return true;
      },
      message: "Tenant code must be unique",
    });

    // 组织验证规则
    this.addValidationRule({
      id: "organization-name-required",
      name: "Organization Name Required",
      type: ValidationType.BUSINESS_RULE,
      level: ValidationLevel.ERROR,
      description: "Organization name must be provided",
      condition: async (context) => {
        return (
          context.data.name &&
          typeof context.data.name === "string" &&
          context.data.name.trim() !== ""
        );
      },
      message: "Organization name is required",
    });

    // 部门验证规则
    this.addValidationRule({
      id: "department-level-valid",
      name: "Department Level Valid",
      type: ValidationType.CONSTRAINT,
      level: ValidationLevel.ERROR,
      description: "Department level must be between 1 and 7",
      condition: async (context) => {
        const level = context.data.level;
        return typeof level === "number" && level >= 1 && level <= 7;
      },
      message: "Department level must be between 1 and 7",
    });

    // 用户验证规则
    this.addValidationRule({
      id: "user-email-valid",
      name: "User Email Valid",
      type: ValidationType.DATA_INTEGRITY,
      level: ValidationLevel.ERROR,
      description: "User email must be valid",
      condition: async (context) => {
        const email = context.data.email;
        if (!email || typeof email !== "string") {
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      },
      message: "User email must be valid",
    });

    // 权限验证规则
    this.addValidationRule({
      id: "permission-required",
      name: "Permission Required",
      type: ValidationType.PERMISSION,
      level: ValidationLevel.ERROR,
      description: "User must have required permissions",
      condition: async (context) => {
        // 这里应该实现实际的权限检查
        return true;
      },
      message: "User does not have required permissions",
    });
  }
}
