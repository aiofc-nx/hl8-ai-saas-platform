/**
 * 租户业务规则
 *
 * @description 处理租户相关的业务规则，包括租户创建、更新、删除、状态转换等业务规则
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { BaseDomainService } from "@hl8/domain-kernel";
import { TenantId } from "@hl8/domain-kernel";
import { TenantCode } from "../value-objects/tenant-code.vo.js";
import { TenantName } from "../value-objects/tenant-name.vo.js";
import { TenantType } from "../value-objects/tenant-type.vo.js";
import { TenantStatus } from "../value-objects/tenant-status.vo.js";

/**
 * 租户业务规则类型枚举
 */
export enum TenantBusinessRuleType {
  CREATION = "CREATION",
  UPDATE = "UPDATE",
  DELETION = "DELETION",
  STATUS_TRANSITION = "STATUS_TRANSITION",
  RESOURCE_LIMITS = "RESOURCE_LIMITS",
  CONFIGURATION = "CONFIGURATION",
  NAMING = "NAMING",
  CODE_GENERATION = "CODE_GENERATION",
}

/**
 * 租户业务规则优先级枚举
 */
export enum TenantBusinessRulePriority {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

/**
 * 租户业务规则上下文接口
 */
export interface TenantBusinessRuleContext {
  readonly tenantId?: TenantId;
  readonly tenantCode?: TenantCode;
  readonly tenantName?: TenantName;
  readonly tenantType?: TenantType;
  readonly currentStatus?: TenantStatus;
  readonly targetStatus?: TenantStatus;
  readonly operation: string;
  readonly data: Record<string, unknown>;
  readonly metadata?: Record<string, unknown>;
}

/**
 * 租户业务规则结果接口
 */
export interface TenantBusinessRuleResult {
  readonly success: boolean;
  readonly message: string;
  readonly data?: Record<string, unknown>;
  readonly errors?: readonly string[];
  readonly warnings?: readonly string[];
  readonly metadata?: Record<string, unknown>;
}

/**
 * 租户业务规则接口
 */
export interface TenantBusinessRule {
  readonly id: string;
  readonly name: string;
  readonly type: TenantBusinessRuleType;
  readonly priority: TenantBusinessRulePriority;
  readonly description: string;
  readonly condition: (context: TenantBusinessRuleContext) => Promise<boolean>;
  readonly action: (
    context: TenantBusinessRuleContext,
  ) => Promise<TenantBusinessRuleResult>;
  readonly metadata?: Record<string, unknown>;
}

/**
 * 租户业务规则
 *
 * 租户业务规则负责处理租户相关的业务规则，包括租户创建、更新、删除、状态转换等业务规则。
 * 支持多种业务规则类型和优先级，提供统一的租户业务规则管理接口。
 *
 * @example
 * ```typescript
 * const rules = new TenantBusinessRules();
 * await rules.addRule(rule);
 * const result = await rules.executeRules(context);
 * ```
 */
@Injectable()
export class TenantBusinessRules extends BaseDomainService {
  private readonly rules: Map<string, TenantBusinessRule> = new Map();
  private readonly executionHistory: Array<{
    readonly timestamp: Date;
    readonly context: TenantBusinessRuleContext;
    readonly results: readonly {
      readonly ruleId: string;
      readonly ruleName: string;
      readonly executed: boolean;
      readonly result: TenantBusinessRuleResult;
      readonly executionTime: number;
    }[];
  }> = [];

  constructor() {
    super();
    this.setContext("TenantBusinessRules");
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
   * 添加租户业务规则
   *
   * @param rule - 租户业务规则
   * @returns 是否添加成功
   */
  async addRule(rule: TenantBusinessRule): Promise<boolean> {
    this.logger.log(
      `Adding tenant business rule: ${rule.name} (${rule.type})`,
      this.context,
    );

    if (this.rules.has(rule.id)) {
      throw new Error(`Tenant business rule ${rule.id} already exists`);
    }

    this.rules.set(rule.id, rule);

    this.logger.log(
      `Tenant business rule ${rule.name} added successfully`,
      this.context,
    );

    return true;
  }

  /**
   * 获取租户业务规则
   *
   * @param ruleId - 规则ID
   * @returns 租户业务规则或undefined
   */
  async getRule(ruleId: string): Promise<TenantBusinessRule | undefined> {
    this.logger.log(`Getting tenant business rule: ${ruleId}`, this.context);

    const rule = this.rules.get(ruleId);

    this.logger.log(
      `Tenant business rule ${ruleId} ${rule ? "found" : "not found"}`,
      this.context,
    );

    return rule;
  }

  /**
   * 执行租户业务规则
   *
   * @param context - 租户业务规则上下文
   * @param ruleIds - 规则ID列表（可选）
   * @returns 租户业务规则执行结果
   */
  async executeRules(
    context: TenantBusinessRuleContext,
    ruleIds?: readonly string[],
  ): Promise<
    readonly {
      readonly ruleId: string;
      readonly ruleName: string;
      readonly executed: boolean;
      readonly result: TenantBusinessRuleResult;
      readonly executionTime: number;
    }[]
  > {
    this.logger.log(
      `Executing tenant business rules for context: ${context.operation}`,
      this.context,
    );

    const rulesToExecute = ruleIds
      ? Array.from(this.rules.values()).filter((rule) =>
          ruleIds.includes(rule.id),
        )
      : Array.from(this.rules.values());

    // 按优先级排序
    rulesToExecute.sort((a, b) => {
      const priorityOrder = {
        [TenantBusinessRulePriority.CRITICAL]: 4,
        [TenantBusinessRulePriority.HIGH]: 3,
        [TenantBusinessRulePriority.NORMAL]: 2,
        [TenantBusinessRulePriority.LOW]: 1,
      };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    const results: Array<{
      readonly ruleId: string;
      readonly ruleName: string;
      readonly executed: boolean;
      readonly result: TenantBusinessRuleResult;
      readonly executionTime: number;
    }> = [];

    for (const rule of rulesToExecute) {
      const startTime = Date.now();
      let executed = false;
      let result: TenantBusinessRuleResult;

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
          `Error executing tenant business rule ${rule.name}: ${error.message}`,
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
      const executionResult = {
        ruleId: rule.id,
        ruleName: rule.name,
        executed,
        result,
        executionTime,
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
      `Tenant business rules execution completed: ${results.length} rules executed`,
      this.context,
    );

    return results;
  }

  /**
   * 获取租户业务规则统计信息
   *
   * @returns 租户业务规则统计信息
   */
  async getTenantBusinessRuleStatistics(): Promise<{
    readonly totalRules: number;
    readonly rulesByType: Record<TenantBusinessRuleType, number>;
    readonly rulesByPriority: Record<TenantBusinessRulePriority, number>;
    readonly totalExecutions: number;
    readonly successfulExecutions: number;
    readonly failedExecutions: number;
    readonly averageExecutionTime: number;
    readonly successRate: number;
  }> {
    this.logger.log(`Getting tenant business rule statistics`, this.context);

    const totalRules = this.rules.size;
    const rulesByType: Record<TenantBusinessRuleType, number> = {} as Record<
      TenantBusinessRuleType,
      number
    >;
    const rulesByPriority: Record<TenantBusinessRulePriority, number> =
      {} as Record<TenantBusinessRulePriority, number>;

    // 初始化统计
    for (const type of Object.values(TenantBusinessRuleType)) {
      rulesByType[type] = 0;
    }
    for (const priority of Object.values(TenantBusinessRulePriority)) {
      rulesByPriority[priority] = 0;
    }

    // 统计规则
    for (const rule of this.rules.values()) {
      rulesByType[rule.type]++;
      rulesByPriority[rule.priority]++;
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

    const result = {
      totalRules,
      rulesByType,
      rulesByPriority,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      averageExecutionTime,
      successRate,
    };

    this.logger.log(
      `Tenant business rule statistics generated: ${totalRules} rules, ${totalExecutions} executions, ${(successRate * 100).toFixed(2)}% success rate`,
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
      readonly context: TenantBusinessRuleContext;
      readonly results: readonly {
        readonly ruleId: string;
        readonly ruleName: string;
        readonly executed: boolean;
        readonly result: TenantBusinessRuleResult;
        readonly executionTime: number;
      }[];
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
   * 获取租户业务规则列表
   *
   * @param type - 规则类型（可选）
   * @param priority - 规则优先级（可选）
   * @returns 租户业务规则列表
   */
  async getRules(
    type?: TenantBusinessRuleType,
    priority?: TenantBusinessRulePriority,
  ): Promise<readonly TenantBusinessRule[]> {
    this.logger.log(
      `Getting tenant business rules: type=${type}, priority=${priority}`,
      this.context,
    );

    let rules = Array.from(this.rules.values());

    if (type) {
      rules = rules.filter((rule) => rule.type === type);
    }

    if (priority) {
      rules = rules.filter((rule) => rule.priority === priority);
    }

    this.logger.log(
      `Retrieved ${rules.length} tenant business rules`,
      this.context,
    );

    return rules;
  }

  /**
   * 初始化默认租户业务规则
   */
  private initializeDefaultRules(): void {
    // 租户创建规则
    this.addRule({
      id: "tenant-creation-name-validation",
      name: "Tenant Creation Name Validation",
      type: TenantBusinessRuleType.CREATION,
      priority: TenantBusinessRulePriority.HIGH,
      description: "Validates tenant name during creation",
      condition: async (context) => {
        return context.operation === "CREATE_TENANT";
      },
      action: async (context) => {
        const name = context.data.name;
        if (!name || typeof name !== "string" || name.trim() === "") {
          return {
            success: false,
            message: "Tenant name is required",
            errors: ["Tenant name is required"],
          };
        }

        if (name.length < 2 || name.length > 100) {
          return {
            success: false,
            message: "Tenant name must be between 2 and 100 characters",
            errors: ["Tenant name must be between 2 and 100 characters"],
          };
        }

        return {
          success: true,
          message: "Tenant name validation passed",
        };
      },
    });

    // 租户代码生成规则
    this.addRule({
      id: "tenant-code-generation",
      name: "Tenant Code Generation",
      type: TenantBusinessRuleType.CODE_GENERATION,
      priority: TenantBusinessRulePriority.HIGH,
      description: "Generates unique tenant code",
      condition: async (context) => {
        return context.operation === "CREATE_TENANT";
      },
      action: async (context) => {
        const name = context.data.name;
        if (!name || typeof name !== "string") {
          return {
            success: false,
            message: "Tenant name is required for code generation",
            errors: ["Tenant name is required for code generation"],
          };
        }

        // 生成租户代码（基于名称的简化版本）
        const code = name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .substring(0, 20);

        return {
          success: true,
          message: "Tenant code generated successfully",
          data: { generatedCode: code },
        };
      },
    });

    // 租户状态转换规则
    this.addRule({
      id: "tenant-status-transition",
      name: "Tenant Status Transition",
      type: TenantBusinessRuleType.STATUS_TRANSITION,
      priority: TenantBusinessRulePriority.CRITICAL,
      description: "Validates tenant status transitions",
      condition: async (context) => {
        return context.operation === "UPDATE_TENANT_STATUS";
      },
      action: async (context) => {
        const currentStatus = context.currentStatus;
        const targetStatus = context.targetStatus;

        if (!currentStatus || !targetStatus) {
          return {
            success: false,
            message: "Current and target status are required",
            errors: ["Current and target status are required"],
          };
        }

        // 定义允许的状态转换
        const allowedTransitions: Record<string, string[]> = {
          TRIAL: ["ACTIVE", "EXPIRED", "DELETED"],
          ACTIVE: ["SUSPENDED", "EXPIRED", "DELETED"],
          SUSPENDED: ["ACTIVE", "EXPIRED", "DELETED"],
          EXPIRED: ["ACTIVE", "DELETED"],
          DELETED: [], // 删除状态不能转换到其他状态
        };

        const allowedTargets = allowedTransitions[currentStatus.value] || [];
        if (!allowedTargets.includes(targetStatus.value)) {
          return {
            success: false,
            message: `Invalid status transition from ${currentStatus.value} to ${targetStatus.value}`,
            errors: [
              `Invalid status transition from ${currentStatus.value} to ${targetStatus.value}`,
            ],
          };
        }

        return {
          success: true,
          message: "Status transition validation passed",
        };
      },
    });

    // 租户资源限制规则
    this.addRule({
      id: "tenant-resource-limits",
      name: "Tenant Resource Limits",
      type: TenantBusinessRuleType.RESOURCE_LIMITS,
      priority: TenantBusinessRulePriority.HIGH,
      description: "Validates tenant resource limits",
      condition: async (context) => {
        return context.operation === "UPDATE_TENANT_RESOURCES";
      },
      action: async (context) => {
        const resourceLimits = context.data.resourceLimits;
        if (!resourceLimits || typeof resourceLimits !== "object") {
          return {
            success: false,
            message: "Resource limits are required",
            errors: ["Resource limits are required"],
          };
        }

        // 验证资源限制值
        const { maxUsers, maxOrganizations, maxDepartments } = resourceLimits;
        if (typeof maxUsers !== "number" || maxUsers < 1) {
          return {
            success: false,
            message: "Max users must be a positive number",
            errors: ["Max users must be a positive number"],
          };
        }

        if (typeof maxOrganizations !== "number" || maxOrganizations < 1) {
          return {
            success: false,
            message: "Max organizations must be a positive number",
            errors: ["Max organizations must be a positive number"],
          };
        }

        if (typeof maxDepartments !== "number" || maxDepartments < 1) {
          return {
            success: false,
            message: "Max departments must be a positive number",
            errors: ["Max departments must be a positive number"],
          };
        }

        return {
          success: true,
          message: "Resource limits validation passed",
        };
      },
    });

    // 租户删除规则
    this.addRule({
      id: "tenant-deletion-validation",
      name: "Tenant Deletion Validation",
      type: TenantBusinessRuleType.DELETION,
      priority: TenantBusinessRulePriority.CRITICAL,
      description: "Validates tenant deletion requirements",
      condition: async (context) => {
        return context.operation === "DELETE_TENANT";
      },
      action: async (context) => {
        const currentStatus = context.currentStatus;
        if (!currentStatus) {
          return {
            success: false,
            message: "Current status is required for deletion validation",
            errors: ["Current status is required for deletion validation"],
          };
        }

        // 只有特定状态下的租户才能被删除
        const deletableStatuses = ["TRIAL", "EXPIRED", "SUSPENDED"];
        if (!deletableStatuses.includes(currentStatus.value)) {
          return {
            success: false,
            message: `Tenant in ${currentStatus.value} status cannot be deleted`,
            errors: [
              `Tenant in ${currentStatus.value} status cannot be deleted`,
            ],
          };
        }

        return {
          success: true,
          message: "Tenant deletion validation passed",
        };
      },
    });
  }
}
