/**
 * 领域业务规则引擎
 *
 * @description 处理领域层业务规则引擎，包括规则管理、规则执行、规则验证等
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { DomainService } from "@hl8/domain-kernel";
import { TenantId } from "../value-objects/tenant-id.vo.js";
import { OrganizationId } from "../value-objects/organization-id.vo.js";
import { DepartmentId } from "../value-objects/department-id.vo.js";
import { UserId } from "../value-objects/user-id.vo.js";

/**
 * 业务规则类型枚举
 */
export enum BusinessRuleType {
  VALIDATION = "VALIDATION",
  AUTHORIZATION = "AUTHORIZATION",
  WORKFLOW = "WORKFLOW",
  CONSTRAINT = "CONSTRAINT",
  CALCULATION = "CALCULATION",
  NOTIFICATION = "NOTIFICATION",
}

/**
 * 业务规则优先级枚举
 */
export enum BusinessRulePriority {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

/**
 * 业务规则状态枚举
 */
export enum BusinessRuleStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DEPRECATED = "DEPRECATED",
  TESTING = "TESTING",
}

/**
 * 业务规则接口
 */
export interface BusinessRule {
  readonly id: string;
  readonly name: string;
  readonly type: BusinessRuleType;
  readonly priority: BusinessRulePriority;
  readonly status: BusinessRuleStatus;
  readonly description: string;
  readonly condition: (context: BusinessRuleContext) => Promise<boolean>;
  readonly action: (
    context: BusinessRuleContext,
  ) => Promise<BusinessRuleResult>;
  readonly metadata?: Record<string, unknown>;
}

/**
 * 业务规则上下文接口
 */
export interface BusinessRuleContext {
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
 * 业务规则结果接口
 */
export interface BusinessRuleResult {
  readonly success: boolean;
  readonly message: string;
  readonly data?: Record<string, unknown>;
  readonly errors?: readonly string[];
  readonly warnings?: readonly string[];
  readonly metadata?: Record<string, unknown>;
}

/**
 * 业务规则执行结果接口
 */
export interface BusinessRuleExecutionResult {
  readonly ruleId: string;
  readonly ruleName: string;
  readonly executed: boolean;
  readonly result: BusinessRuleResult;
  readonly executionTime: number;
  readonly timestamp: Date;
}

/**
 * 业务规则引擎统计信息接口
 */
export interface BusinessRuleEngineStatistics {
  readonly totalRules: number;
  readonly rulesByType: Record<BusinessRuleType, number>;
  readonly rulesByPriority: Record<BusinessRulePriority, number>;
  readonly rulesByStatus: Record<BusinessRuleStatus, number>;
  readonly totalExecutions: number;
  readonly successfulExecutions: number;
  readonly failedExecutions: number;
  readonly averageExecutionTime: number;
  readonly successRate: number;
}

/**
 * 领域业务规则引擎
 *
 * 领域业务规则引擎负责处理领域层业务规则引擎，包括规则管理、规则执行、规则验证等。
 * 支持多种业务规则类型和优先级，提供统一的业务规则管理接口。
 *
 * @example
 * ```typescript
 * const engine = new DomainBusinessRulesEngine();
 * await engine.addRule(rule);
 * const result = await engine.executeRules(context);
 * ```
 */
@Injectable()
export class DomainBusinessRulesEngine extends DomainService {
  private readonly rules: Map<string, BusinessRule> = new Map();
  private readonly executionHistory: Array<{
    readonly timestamp: Date;
    readonly context: BusinessRuleContext;
    readonly results: readonly BusinessRuleExecutionResult[];
  }> = [];

  constructor() {
    super();
    this.setContext("DomainBusinessRulesEngine");
    this.initializeDefaultRules();
  }

  /**
   * 添加业务规则
   *
   * @param rule - 业务规则
   * @returns 是否添加成功
   */
  async addRule(rule: BusinessRule): Promise<boolean> {
    this.logger.log(
      `Adding business rule: ${rule.name} (${rule.type})`,
      this.context,
    );

    if (this.rules.has(rule.id)) {
      throw new Error(`Business rule ${rule.id} already exists`);
    }

    this.rules.set(rule.id, rule);

    this.logger.log(
      `Business rule ${rule.name} added successfully`,
      this.context,
    );

    return true;
  }

  /**
   * 获取业务规则
   *
   * @param ruleId - 规则ID
   * @returns 业务规则或undefined
   */
  async getRule(ruleId: string): Promise<BusinessRule | undefined> {
    this.logger.log(`Getting business rule: ${ruleId}`, this.context);

    const rule = this.rules.get(ruleId);

    this.logger.log(
      `Business rule ${ruleId} ${rule ? "found" : "not found"}`,
      this.context,
    );

    return rule;
  }

  /**
   * 执行业务规则
   *
   * @param context - 业务规则上下文
   * @param ruleIds - 规则ID列表（可选）
   * @returns 业务规则执行结果
   */
  async executeRules(
    context: BusinessRuleContext,
    ruleIds?: readonly string[],
  ): Promise<readonly BusinessRuleExecutionResult[]> {
    this.logger.log(
      `Executing business rules for context: ${context.entityType} ${context.entityId} (${context.operation})`,
      this.context,
    );

    const rulesToExecute = ruleIds
      ? Array.from(this.rules.values()).filter((rule) =>
          ruleIds.includes(rule.id),
        )
      : Array.from(this.rules.values()).filter(
          (rule) => rule.status === BusinessRuleStatus.ACTIVE,
        );

    // 按优先级排序
    rulesToExecute.sort((a, b) => {
      const priorityOrder = {
        [BusinessRulePriority.CRITICAL]: 4,
        [BusinessRulePriority.HIGH]: 3,
        [BusinessRulePriority.NORMAL]: 2,
        [BusinessRulePriority.LOW]: 1,
      };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    const results: BusinessRuleExecutionResult[] = [];

    for (const rule of rulesToExecute) {
      const startTime = Date.now();
      let executed = false;
      let result: BusinessRuleResult;

      try {
        // 检查规则条件
        const conditionMet = await rule.condition(context);

        if (conditionMet) {
          // 执行规则动作
          result = await rule.action(context);
          executed = true;
        } else {
          result = {
            success: true,
            message: `Rule condition not met for ${rule.name}`,
          };
        }
      } catch (error) {
        this.logger.error(
          `Error executing business rule ${rule.name}: ${error.message}`,
          this.context,
        );

        result = {
          success: false,
          message: `Rule execution error: ${error.message}`,
          errors: [error.message],
        };
        executed = true;
      }

      const executionTime = Date.now() - startTime;
      const executionResult: BusinessRuleExecutionResult = {
        ruleId: rule.id,
        ruleName: rule.name,
        executed,
        result,
        executionTime,
        timestamp: new Date(),
      };

      results.push(executionResult);
    }

    // 记录执行历史
    this.executionHistory.push({
      timestamp: new Date(),
      context,
      results,
    });

    this.logger.log(
      `Business rules execution completed: ${results.length} rules executed`,
      this.context,
    );

    return results;
  }

  /**
   * 获取业务规则统计信息
   *
   * @returns 业务规则引擎统计信息
   */
  async getBusinessRuleEngineStatistics(): Promise<BusinessRuleEngineStatistics> {
    this.logger.log(`Getting business rule engine statistics`, this.context);

    const totalRules = this.rules.size;
    const rulesByType: Record<BusinessRuleType, number> = {} as Record<
      BusinessRuleType,
      number
    >;
    const rulesByPriority: Record<BusinessRulePriority, number> = {} as Record<
      BusinessRulePriority,
      number
    >;
    const rulesByStatus: Record<BusinessRuleStatus, number> = {} as Record<
      BusinessRuleStatus,
      number
    >;

    // 初始化统计
    for (const type of Object.values(BusinessRuleType)) {
      rulesByType[type] = 0;
    }
    for (const priority of Object.values(BusinessRulePriority)) {
      rulesByPriority[priority] = 0;
    }
    for (const status of Object.values(BusinessRuleStatus)) {
      rulesByStatus[status] = 0;
    }

    // 统计规则
    for (const rule of this.rules.values()) {
      rulesByType[rule.type]++;
      rulesByPriority[rule.priority]++;
      rulesByStatus[rule.status]++;
    }

    // 统计执行历史
    const totalExecutions = this.executionHistory.length;
    const successfulExecutions = this.executionHistory.filter((h) =>
      h.results.every((r) => r.result.success),
    ).length;
    const failedExecutions = totalExecutions - successfulExecutions;
    const successRate =
      totalExecutions > 0 ? successfulExecutions / totalExecutions : 0;

    // 计算平均执行时间
    const totalExecutionTime = this.executionHistory.reduce(
      (sum, h) =>
        sum + h.results.reduce((ruleSum, r) => ruleSum + r.executionTime, 0),
      0,
    );
    const averageExecutionTime =
      totalExecutions > 0 ? totalExecutionTime / totalExecutions : 0;

    const result: BusinessRuleEngineStatistics = {
      totalRules,
      rulesByType,
      rulesByPriority,
      rulesByStatus,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      averageExecutionTime,
      successRate,
    };

    this.logger.log(
      `Business rule engine statistics generated: ${totalRules} rules, ${totalExecutions} executions, ${(successRate * 100).toFixed(2)}% success rate`,
      this.context,
    );

    return result;
  }

  /**
   * 获取执行历史
   *
   * @param limit - 限制数量
   * @returns 执行历史列表
   */
  async getExecutionHistory(limit: number = 100): Promise<
    readonly {
      readonly timestamp: Date;
      readonly context: BusinessRuleContext;
      readonly results: readonly BusinessRuleExecutionResult[];
    }[]
  > {
    this.logger.log(
      `Getting execution history with limit: ${limit}`,
      this.context,
    );

    const history = this.executionHistory
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    this.logger.log(
      `Retrieved ${history.length} execution history entries`,
      this.context,
    );

    return history;
  }

  /**
   * 获取业务规则列表
   *
   * @param type - 规则类型（可选）
   * @param status - 规则状态（可选）
   * @returns 业务规则列表
   */
  async getRules(
    type?: BusinessRuleType,
    status?: BusinessRuleStatus,
  ): Promise<readonly BusinessRule[]> {
    this.logger.log(
      `Getting business rules: type=${type}, status=${status}`,
      this.context,
    );

    let rules = Array.from(this.rules.values());

    if (type) {
      rules = rules.filter((rule) => rule.type === type);
    }

    if (status) {
      rules = rules.filter((rule) => rule.status === status);
    }

    this.logger.log(`Retrieved ${rules.length} business rules`, this.context);

    return rules;
  }

  /**
   * 初始化默认业务规则
   */
  private initializeDefaultRules(): void {
    // 租户业务规则
    this.addRule({
      id: "tenant-creation-validation",
      name: "Tenant Creation Validation",
      type: BusinessRuleType.VALIDATION,
      priority: BusinessRulePriority.HIGH,
      status: BusinessRuleStatus.ACTIVE,
      description: "Validates tenant creation requirements",
      condition: async (context) => {
        return (
          context.entityType === "Tenant" && context.operation === "CREATE"
        );
      },
      action: async (context) => {
        const name = context.data.name;
        const code = context.data.code;

        if (!name || typeof name !== "string" || name.trim() === "") {
          return {
            success: false,
            message: "Tenant name is required",
            errors: ["Tenant name is required"],
          };
        }

        if (!code || typeof code !== "string" || code.trim() === "") {
          return {
            success: false,
            message: "Tenant code is required",
            errors: ["Tenant code is required"],
          };
        }

        return {
          success: true,
          message: "Tenant creation validation passed",
        };
      },
    });

    // 组织业务规则
    this.addRule({
      id: "organization-creation-validation",
      name: "Organization Creation Validation",
      type: BusinessRuleType.VALIDATION,
      priority: BusinessRulePriority.HIGH,
      status: BusinessRuleStatus.ACTIVE,
      description: "Validates organization creation requirements",
      condition: async (context) => {
        return (
          context.entityType === "Organization" &&
          context.operation === "CREATE"
        );
      },
      action: async (context) => {
        const name = context.data.name;
        const tenantId = context.data.tenantId;

        if (!name || typeof name !== "string" || name.trim() === "") {
          return {
            success: false,
            message: "Organization name is required",
            errors: ["Organization name is required"],
          };
        }

        if (!tenantId) {
          return {
            success: false,
            message: "Tenant ID is required for organization",
            errors: ["Tenant ID is required for organization"],
          };
        }

        return {
          success: true,
          message: "Organization creation validation passed",
        };
      },
    });

    // 部门业务规则
    this.addRule({
      id: "department-hierarchy-validation",
      name: "Department Hierarchy Validation",
      type: BusinessRuleType.CONSTRAINT,
      priority: BusinessRulePriority.HIGH,
      status: BusinessRuleStatus.ACTIVE,
      description: "Validates department hierarchy constraints",
      condition: async (context) => {
        return (
          context.entityType === "Department" && context.operation === "CREATE"
        );
      },
      action: async (context) => {
        const level = context.data.level;
        const parentId = context.data.parentId;

        if (typeof level !== "number" || level < 1 || level > 7) {
          return {
            success: false,
            message: "Department level must be between 1 and 7",
            errors: ["Department level must be between 1 and 7"],
          };
        }

        if (level > 1 && !parentId) {
          return {
            success: false,
            message: "Parent department is required for levels 2-7",
            errors: ["Parent department is required for levels 2-7"],
          };
        }

        return {
          success: true,
          message: "Department hierarchy validation passed",
        };
      },
    });

    // 用户业务规则
    this.addRule({
      id: "user-email-validation",
      name: "User Email Validation",
      type: BusinessRuleType.VALIDATION,
      priority: BusinessRulePriority.NORMAL,
      status: BusinessRuleStatus.ACTIVE,
      description: "Validates user email format",
      condition: async (context) => {
        return context.entityType === "User" && context.operation === "CREATE";
      },
      action: async (context) => {
        const email = context.data.email;

        if (!email || typeof email !== "string") {
          return {
            success: false,
            message: "User email is required",
            errors: ["User email is required"],
          };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return {
            success: false,
            message: "Invalid email format",
            errors: ["Invalid email format"],
          };
        }

        return {
          success: true,
          message: "User email validation passed",
        };
      },
    });
  }
}
